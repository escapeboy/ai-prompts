# Tier 4 — Behavioral eval (does the skill change what the agent DOES?)

Tiers 1–3 judge the SKILL.md *text*. None of them checks that an agent with the skill
does the task better than the same agent without it. Tier 4 does, with the built-in
`claude plugin eval` and its with/without-skill ablation. Ideas borrowed from
[mgechev/skillgrade](https://github.com/mgechev/skillgrade) (normalized gain, pass^k,
reference-validated graders); runtime is Claude Code's own runner, which for a Claude-only
library already does the ablation, detects that the skill fired, mocks MCP servers and
caps cost. Reach for skillgrade itself when you must test a skill on Codex/Gemini/OpenCode.

## When

| Run Tier 4 | Skip it |
|---|---|
| New skill, or a revision that changes its procedure | Wording/typo edit — Tiers 1–3 cover it |
| Periodic dead-weight sweep (does the skill still beat the model?) | Skill that only routes to other tools with no checkable outcome |
| A skill tagged "must work every time" (deploy, triage) changed | Signal below the frequency threshold |

## Verified behavior (Claude Code 2.1.280, probed 23.09.2026)

- `claude plugin eval <skill-dir>` resolves a bare skill folder (one with SKILL.md) as a
  plugin and **defaults to `--ablation with-without`**: each case runs once with the skill
  and once without, and the result reports `delta`.
- **Isolation is clean.** Both arms see only the built-in skills — none of
  your user-level skills. So the without-arm is a real baseline, but Tier 4 does NOT test
  triggering in the crowded real environment; that stays Tier 1's job.
- A `tool_used: Skill` grader is automatically an unscored "skill fired" indicator.
- The result JSON has `cases[].arms.{with,without}[].passed` per run and `cases[].dir`,
  but **drops `tags`** — `behavior-stats.py` reads tags from the case file instead.
- There is no built-in reference-solution check — see "Validate the graders" below.
- Cost: one haiku run of a short case ≈ $0.025. Default `runs: 3` × 2 arms = 6 runs per case.

## Case layout

`<skill>/evals/<case>/prompt.md` + `<skill>/evals/<case>/graders/*.md`
(`skill-lint.py` ignores `evals/`). Scaffold one with `claude plugin eval init --bare <case>`
from the skill dir.

```markdown
---
runs: 3
max_turns: 8
model: haiku              # cheapest model that should succeed WITH the skill
tags: [critical]          # optional: gate on pass^k, not the mean
allowed_tools: [Read, Glob, Grep, Skill]
---
<the task as a user would really phrase it>
```

Gated tools (`Write`, `Edit`, `Bash`, `WebFetch`, `mcp__*`) listed in `allowed_tools` are NOT
granted unless the run also passes `--allow-tools <tool>`. For file-producing cases pass
`--allow-tools Write` (the agent writes only inside its sandboxed temp cwd); otherwise grade
`last_message`.

Graders (`graders/<name>.md`, frontmatter only for deterministic types):
`regex` (`pattern`, `match: contains|not_contains|count:N`, `target: last_message|trace|files`),
`file_exists` (`path`), `tool_used` (`tool`, `input_match`, `min`/`max`), `tool_order`,
`llm` (body = criteria; 2-of-3 judge vote, noisy on long output), `baseline`.
Prefer deterministic graders; use `llm` only where the outcome needs judgement.

Regex gotchas (JavaScript `RegExp`, not PCRE): inline `(?i)` is a syntax error — use the
separate `flags: i` key. Single-quote every `pattern` — YAML turns `100` into an integer and
`### x` into a comment (null). Grade meaning, not verbatim identifiers from SKILL.md, unless reciting the
identifier IS the outcome — otherwise a correct answer fails on wording.

## Writing good cases (from skillgrade's practice)

- **Grade the outcome, not the steps.** Check the file/answer is right, not which commands ran.
- **Name the output.** If a grader checks `report.md`, the prompt must say `report.md`.
- **Keep the answer key out of the prompt.** Anything in `prompt.md` is visible to the agent.
- **3–5 sharp cases beat 30 noisy ones.** Pick tasks where the model *without* the skill
  plausibly fails — that is where the skill earns its tokens.

## Validate the graders before trusting them

`plugin eval` has no "reference solution must score 1.0" step (skillgrade's `--validate`).
Get the same guarantee in two cheap moves:
1. **Smoke run** `--runs 1` and read each grader's `explanation` in the JSON/HTML report:
   the with-arm pass must be for the right reason, the without-arm fail must be real.
2. **Discrimination check** (automatic in `behavior-stats.py`): a case both arms pass at
   1.0 proves nothing — grader too loose or task too easy. It is excluded from the
   verdict and must be rewritten.

## Run and gate

```bash
cd <skill-dir>
claude plugin eval . --trust-plugin --no-publish --max-cost-usd 2 \
  --output-dir "$SCRATCH/tier4" --json "$SCRATCH/tier4.json"
python3 scripts/behavior-stats.py "$SCRATCH/tier4.json" [--json]
```

**Model choice matters.** On haiku the Skill tool often does not fire at all (first full sweep,
16 skills: fired 0–67% on most cases), so a `haiku` run under-rates skills used on Sonnet/Opus.
Use haiku for cheap grader smoke runs; run the verdict on the model you actually use.
With `runs: 3` one flipped run moves NG by ±0.5–1.0 — re-run a regression with more runs
before acting on it.

Presets (skillgrade's idea, our numbers): `--runs 1` smoke (grader check) · `3` routine ·
`5+` for `critical` cases, where pass^3 needs enough runs to mean anything.

`behavior-stats.py` adds what `plugin eval` does not report and emits a sealable evidence
record `{tool, tier: 4, input_sha256, results, failures, verdict}`:

| Metric | Formula | Why |
|---|---|---|
| Normalized gain | (p_with − p_without) / (1 − p_without) | raw delta under-rates skills on tasks the model half-solves anyway |
| pass^k | C(c,k)/C(n,k) | chance k runs in a row all pass — the bar for `critical` |
| discriminating | not (both arms = 1.0) | filters cases that cannot tell the arms apart |
| low_fire | skill fired in < 50% of with-runs | the case then measures triggering, not the skill's content — fix the description (Tier 1) or test on the model you actually run |

**Fail** (exit 1, aborts the cycle like a red Tier 2): any NG < 0 (the skill makes things
worse), with-arm pass rate < threshold (0.8), or a `critical` case with pass^k < threshold.
**Dead weight** (reported, not a fail): mean NG ≤ 0.05 — the skill does not beat the
baseline. Surface it to the user as a removal candidate; never delete on its own.

Keep results out of the skill dir (`--output-dir` to scratch) — `evals/results/` is noise
in the library.
