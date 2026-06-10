# Headless Review Fan-Out

**Diff-scoped parallel reviewers with structured output — automated review that found a real cross-tenant IDOR**

A pipeline of short (1–3 min) non-interactive Claude Code sessions, each given the *same* review template plus a *different* scope (a diff, a lens, or both), running in parallel and emitting machine-readable findings. In production use this caught a real cross-tenant IDOR that a single interactive review had missed — because one reviewer's entire job was "tenant isolation", with no other concerns competing for its attention.

## Why fan-out beats one big review

A single reviewer session reviewing a large diff has divided attention: security competes with style competes with performance, and recall drops as context fills. Fanning out inverts this:

- **Each session is small** — one diff (or one lens) fits comfortably in context with room to think
- **Each session is single-minded** — a reviewer whose only instruction is "find authorization bugs" doesn't get distracted reporting naming nits
- **Findings are structured** — JSON output makes the aggregate sortable, dedupable, and gateable in CI
- **Failures are cheap** — a 2-minute session that errors just gets re-run

## The Pipeline

```
feature branch → git worktree per branch → N parallel headless sessions → JSONL findings → dedupe/verify → report or CI gate
```

### 1. Scope the diff

```bash
BRANCH="feat/whatever"
BASE=$(git merge-base origin/develop "$BRANCH")
git diff --name-only "$BASE".."$BRANCH" > /tmp/changed-files.txt
git diff "$BASE".."$BRANCH" > /tmp/review.diff
```

### 2. One worktree per branch under review

Reviewers need the *full* repo (to chase references beyond the diff) without touching your working tree — and parallel branches must not share a checkout:

```bash
git worktree add "/tmp/review-$BRANCH" "$BRANCH"
```

### 3. The review template (same for every session)

```markdown
Review this change for security vulnerabilities. You are reviewing a DIFF —
the rest of the repo is available read-only for chasing references.

Focus lens: {LENS}   # e.g. "authorization & tenant isolation", "input validation
                     # & injection", "secrets & data exposure", "race conditions"

Changed files:
{CHANGED_FILES}

Unified diff:
{DIFF}

Rules:
- Report EVERY finding, including ones you are uncertain about — a downstream
  step filters. Your job is coverage, not judgment.
- For each finding: confidence (high/medium/low) and severity (critical/high/medium/low).
- Chase at least one level of references: if the diff calls a function, read it.
- Output ONLY a JSON array of findings:
  [{"file": "...", "line": 0, "lens": "...", "severity": "...",
    "confidence": "...", "title": "...", "explanation": "...", "fix": "..."}]
- Empty array [] if nothing found. No prose outside the JSON.
```

The "report everything, filter downstream" instruction is essential on recent models: they follow severity filters *literally*, so a "only report important issues" reviewer silently drops real bugs it judged borderline.

### 4. The driver

```bash
#!/bin/bash
# review-fanout.sh <branch>
BRANCH="$1"
WORKTREE="/tmp/review-$BRANCH"
LENSES=("authorization & tenant isolation" "input validation & injection" \
        "secrets & data exposure" "race conditions & state" "business logic abuse")
OUT="/tmp/findings-$BRANCH"
mkdir -p "$OUT"

for i in "${!LENSES[@]}"; do
  LENS="${LENSES[$i]}"
  PROMPT=$(sed -e "s/{LENS}/$LENS/" review-template.md \
    | python3 -c "import sys; t=sys.stdin.read(); \
        t=t.replace('{CHANGED_FILES}', open('/tmp/changed-files.txt').read()); \
        t=t.replace('{DIFF}', open('/tmp/review.diff').read()); print(t)")
  (cd "$WORKTREE" && claude -p "$PROMPT" --max-turns 15 \
      --output-format json > "$OUT/lens-$i.json" 2>"$OUT/lens-$i.err") &
done
wait
echo "Findings: $(cat "$OUT"/lens-*.json | python3 -c \
  'import json,sys; print(sum(len(json.loads(l) if l.strip().startswith("[") else []) for l in sys.stdin))' 2>/dev/null || echo "?")"
```

4–6 simultaneous sessions per branch is the sweet spot — beyond that, lenses overlap and dedupe cost grows faster than coverage.

### 5. Dedupe and verify

Raw fan-out output over-reports (by design). Two cheap post-passes:

1. **Dedupe** by `(file, line±3, title similarity)` — different lenses often catch the same bug
2. **Adversarial verify** — for each surviving finding, one more headless session prompted to *refute* it ("Try to disprove this finding. Default to refuted if you cannot reproduce the logic."). Findings that survive refutation go in the report; the rest are listed as "filtered" for transparency

The verify pass is what makes the pipeline usable as a CI gate — without it, false positives erode trust within a week.

## Variations

- **Diff-sharding instead of lens-sharding**: for very large diffs, split by file group and keep one lens — same driver, different axis
- **Eval mode**: run the fan-out against a branch with *known* seeded bugs to measure recall before trusting it — a ~30-session burst against one repo is an afternoon and tells you exactly what your template catches
- **PR-comment sink**: pipe verified findings to `gh pr review --comment` instead of a report file

## Cost & cadence

Each lens session is 1–3 minutes and diff-sized — typically a few cents at Sonnet-tier (the lens template needs focus, not maximal depth). Use Opus-tier only for the verify pass, where judgment quality gates what humans see. Run on PR-open + on demand; running on every push doubles cost for little gain since findings cluster at PR-open.

## Related

- [`16-autonomous-agents/`](../16-autonomous-agents/guide.md) — budgets and watchdogs for the headless sessions
- [`agent-teams-guide.md`](agent-teams-guide.md) — interactive multi-agent coordination (this guide's pipeline is non-interactive by contrast)
- [`13-security-hardening/`](../13-security-hardening/guide.md) — what to do with the findings
