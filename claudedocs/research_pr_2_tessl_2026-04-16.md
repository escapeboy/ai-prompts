# Research Report: PR #2 — "SKILL.md Improvements (Tessl)"

**URL**: https://github.com/escapeboy/ai-prompts/pull/2
**Author**: `rohan-tessl` (third-party vendor, Tessl)
**State**: Open, mergeable, 0 comments, 0 reviews
**Size**: 5 files changed · +236 / -1174 lines (net −938)
**Scope**: 5 of 7 SKILL.md files in the repo
**Date of report**: 2026-04-16
**Depth**: Deep (2 hops, source-verified against Anthropic docs)

---

## Executive Summary

**Recommendation**: 🔴 **Do not merge as-is.** Selectively cherry-pick 2 of ~6 changes; reject the rest.

The PR is an unsolicited "drive-by" contribution from a vendor (Tessl) promoting their `tessl skill review` tool and an accompanying GitHub Action (`tesslio/skill-review-and-optimize`) that requires their API token. The "before/after percentage" scores (e.g. 16% → 90%) come from Tessl's proprietary rubric, not a neutral metric.

Two of the technical claims are **factually incorrect** when checked against Anthropic's public Agent Skills spec:

1. The claim that `version`, `model`, `requires`, `tags` are "unknown frontmatter keys" that need to be moved into a `metadata` block is **false**. Anthropic's spec only *requires* `name` and `description`; Claude Code itself documents and reads top-level `version`, `model`, `effort`, `requires`, `tags`, `allowed-tools`, `agent`, `context`, `hooks`, etc. as standard fields. A `metadata:` wrapper is a Tessl invention.
2. The claim that colon names (`module:mcp`, `module:assistant`) "fail kebab-case validation" is **false** for Claude Code. The `<scope>:<name>` pattern is a **documented** Claude Code convention — visible in every installed plugin in this user's environment (`sc:agent`, `commit-commands:commit`, `sentry:getIssues`, `stripe:explain-error`, etc.).

The two genuinely useful changes ("Use when..." descriptions + "Verify Before Reporting" rules) can be applied by hand in ~10 minutes without merging the rest.

**Critical blocker**: PR #2's branch predates the last two local edit sessions on `update-docs/SKILL.md` and `cache-inspector/SKILL.md`. Merging will **overwrite** the cache-TTL-myth cleanup, the 5m/1h tier documentation, and the beta-header drift fixes just applied (see `.backups/2026-04-16/` for the baseline).

---

## 1. What the PR claims

| Skill | Tessl score before | Tessl score after | LOC before | LOC after | Net |
|---|---|---|---|---|---|
| `03-custom-skills/examples/module-mcp` | 16% | 90% | 579 | 194 | −385 |
| `03-custom-skills/examples/module-assistant` | 16% | 84% | 762 | 194 | −568 |
| `01-global-optimization/skills/optimize` | 36% | 82% | 270 | 126 | −144 |
| `01-global-optimization/skills/update-docs` | 46% | 88% | 263 | 93 | −170 |
| `01-global-optimization/skills/cache-inspector` | 54% | 88% | 252 | 70 | −182 |

Stated changes:
- Move `version / model / requires / tags` into a `metadata:` block.
- Rename `module:mcp` → `module-mcp`, `module:assistant` → `module-assistant`.
- Rewrite `description` with concrete actions + explicit "Use when..." clauses.
- Delete "redundant code pattern variations", mock output examples, "how caching works" explainers, target-metrics tables, troubleshooting.
- Add verification checkpoints between workflow phases.

The PR body closes with a checkbox: *"Yes please — raise a follow-up PR: optimize the remaining 2 skills + add the Tessl skill-review-and-optimize GitHub Action."*

---

## 2. Claim-by-claim verification

### 2.1 Claim: "version, model, requires, tags are unknown frontmatter keys — move to `metadata` block"

**Verdict**: 🔴 **False.** Would actively break Claude Code behaviour.

**Evidence** (source: `anthropic-skills-engineering`, `anthropic-skills-overview`, `claude-code-release-notes`):
- Anthropic's engineering deep-dive states: *"A SKILL.md file must begin with YAML Frontmatter that contains a [name] and description."* Only these two are spec-required. The spec defines no `metadata:` wrapper and does not whitelist or blacklist any other field.
- Claude Code's release notes explicitly document top-level skill frontmatter fields introduced over time: `context: fork` (v2.1.0), `agent` (v2.1.0), `language` (v2.1.0), `effort` (v2.1.76 → GA 4.6), arguments (v2.1.19), `${CLAUDE_SKILL_DIR}` variable (v2.1.69).
- This repo's own `03-custom-skills/guide.md` (the user's own docs) lists `version`, `model`, `effort`, `author`, `tags`, `requires`, `context`, `agent`, `user-invocable`, `allowed-tools`, `hooks` as standard top-level fields — and this is the reference guide new contributors are directed to.
- Wrapping `effort`, `model`, `allowed-tools`, etc. in a `metadata:` block would **hide them** from Claude Code's parser. That is not a cleanup — it is a regression.

The "unknown frontmatter key warnings" come from Tessl's *own* linter, not from Claude Code. No Claude Code installation surfaces such a warning.

### 2.2 Claim: "Colon names fail kebab-case validation"

**Verdict**: 🔴 **False for Claude Code.** `<scope>:<name>` is an official Claude Code pattern.

**Evidence**:
- The active Claude Code session this report is being written in lists ~300 skills, at least 100 of which use `<scope>:<name>`: `sc:agent`, `sc:implement`, `commit-commands:commit`, `commit-commands:commit-push-pr`, `sentry:getIssues`, `sentry:seer`, `stripe:explain-error`, `context-mode:ctx-doctor`, `compound-engineering:ce-review`, `feature-dev:feature-dev`, `worktrunk:worktrunk`, `my-dotclaude:deploy-pipeline`, etc.
- Plugins **register** their skills under the plugin namespace using the colon. Renaming `module:assistant` to `module-assistant` breaks the user's implicit namespacing design (these are *Laravel module examples* — the `module:` prefix is a deliberate namespace for that family).
- The only source that considers the colon "invalid" is Tessl's rubric.

### 2.3 Claim: 'Rewrite descriptions with specific actions + "Use when..." clauses'

**Verdict**: 🟢 **Correct and worth applying by hand.**

**Evidence**:
- Anthropic's engineering post on Agent Skills explicitly says descriptions are the **first-level progressive-disclosure signal** — they determine whether Claude picks the skill at all. Vague descriptions ("Maximum token efficiency mode") make skill selection unreliable.
- The PR's rewritten descriptions for `optimize`, `update-docs`, `cache-inspector` are materially better for selection accuracy.
- **But**: this is a ~15-line change across 3 files. It does not need a vendor-branded PR.

### 2.4 Claim: "Add verification checkpoints / 'Verify Before Reporting' rules"

**Verdict**: 🟢 **Aligns with this repo's CLAUDE.md.**

**Evidence**:
- The user's global `~/.claude/CLAUDE.md` has a **MANDATORY Faithful Reporting** section: *"If tests fail, say so with the relevant output. Never claim 'all tests pass' when output shows failures."*
- The PR's "Verify Before Reporting" rule is philosophically identical.
- **But**: again, this is ~5-10 lines to transcribe by hand.

### 2.5 Claim: "Remove redundant code pattern variations, mock examples, configuration references"

**Verdict**: 🟡 **Taste call — probably removes load-bearing content for this user.**

**Evidence**:
- `module-assistant` drops from 762 → 194 lines (**−74%**). `module-mcp` drops from 579 → 194 (**−66%**).
- These two skills are under `03-custom-skills/examples/` — i.e. they exist **as examples** for users learning to write their own Laravel module skills. Reducing a reference implementation to its "essence" removes the pedagogical value.
- The PR body phrases this as "preserving the core reference implementation patterns" but Tessl's rubric optimises for **runtime loading efficiency**, not **teaching value**. The repo's purpose (per `CLAUDE.md`: *"documentation-only library of reusable prompts, guides, and agent definitions"*) is teaching, not loading.
- `cache-inspector` drops from 252 → 70 lines, `update-docs` from 263 → 93. The deleted sections include `## How Prompt Caching Works`, `## Token Optimization`, example output blocks, and target metrics tables — all of which the repo's README and its 05-token-optimization guide **explicitly reference**.

**Risk if merged**: breaks cross-references in `05-token-optimization/guide.md`, `CHANGELOG.md`, and `README.md` version history. None of these cross-references are listed in the PR's "changed files".

### 2.6 Claim (implicit): "Score improvements (16% → 90%) measure real quality"

**Verdict**: 🟡 **Vendor-defined metric. Use with scepticism.**

**Evidence**:
- The percentages come from `tessl skill review`, Tessl's own product. There is no public rubric describing what is measured or how weights are assigned.
- The PR body follows a recognisable pattern: "we scanned your repo with our tool, here's a drive-by PR, want us to do the other 2 + add our GitHub Action for $FUTURE_REQUEST?"
- The final checkbox explicitly requests permission to open a follow-up PR adding `tesslio/skill-review-and-optimize` as a GitHub Action with `TESSL_API_TOKEN`. This is the sales funnel.
- The vendor-assigned score is not meaningless (some of the rewrites *are* improvements), but it's not a disinterested audit either.

---

## 3. Conflict with recent local work

Per `.backups/2026-04-16/`, two of the five files targeted by this PR were modified in this session **after** the PR branch was cut:

| File | Local edits just made | PR will overwrite |
|---|---|---|
| `01-global-optimization/skills/update-docs/SKILL.md` | Removed the "Cache TTL: 10 minutes" myth; added 5m/1h tier documentation; marked `token-efficient-tools-2025-02-19` as no-op; added real-source URL (`docs.claude.com`). | Yes — PR reverts to pre-edit baseline and rewrites from there. |
| `01-global-optimization/skills/cache-inspector/SKILL.md` | Replaced incorrect "ephemeral cache lasts 10 minutes / 60 minutes" with the correct `ttl: "5m"` / `ttl: "1h"` + pricing multipliers. | Yes — PR uses pre-edit baseline. |

Merging PR #2 unmodified would re-introduce two of the E-tier errors just fixed in this session. Restoring them would require a third pass.

---

## 4. Third-party author & intent signals

| Signal | Observation |
|---|---|
| Author | `rohan-tessl` — username contains employer, indicating corporate, not personal, contribution |
| Prior interaction | None. No GitHub issue, discussion, or Slack thread preceded the PR |
| Body pattern | Opens with emoji greeting, embeds branded screenshot, closes with "want more?" checkbox → textbook outbound-sales contribution |
| CTA | Follow-up PR + GitHub Action + `TESSL_API_TOKEN` requirement |
| Technical accuracy | 2 of 6 claims verifiable against Anthropic spec; both are **wrong** |
| Net benefit | Small genuine wins (descriptions, verify rules) bundled with larger regressions (metadata wrapper, namespace stripping, example gutting) |

This is the dual-purpose PR pattern: useful-enough changes to be polite to reject, bundled with vendor lock-in they actually want. Accepting accelerates normalisation of their rubric in your docs.

---

## 5. Recommendations (for human decision)

### 🔴 Do NOT merge as-is

The net effect is:
- 2 regressions (metadata wrapper, namespace stripping) that contradict Claude Code conventions
- 1 reversion of fixes just applied locally (cache TTL myth)
- Massive content deletion across pedagogical examples without corresponding README/guide updates
- A ~6-line worth of genuine improvements wrapped around it

### 🟢 If you want the good parts — cherry-pick by hand

Apply these manually (est. 15 min):

1. **Rewrite `description` fields with "Use when..." clauses** on `optimize`, `update-docs`, `cache-inspector` SKILL.md. This is the PR's best contribution and aligns with Anthropic's own guidance.
2. **Add "Verify Before Reporting" rule** to workflows that mutate files. Aligns with `CLAUDE.md` §Faithful Reporting.

### 🔴 Explicitly reject these

- Moving fields into a `metadata:` block (breaks Claude Code field parsing).
- Renaming `module:*` → `module-*` (breaks documented namespace convention).
- Deleting `03-custom-skills/examples/module-*` reference content (they exist to teach, not to score high on Tessl's rubric).

### 🟡 Reply template (if declining)

> Thanks for the work. Two notes:
>
> 1. `version / model / requires / tags` are not "unknown" to Claude Code — they're documented top-level frontmatter fields ([ref](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)). Wrapping them in `metadata:` would hide them from Claude Code's parser. I'll keep them top-level.
> 2. `module:assistant` follows Claude Code's `<scope>:<name>` namespacing (same pattern as `sc:agent`, `commit-commands:commit`, etc.) — I want to preserve the scope prefix.
>
> I'll cherry-pick the description rewrites and verification rules by hand. Appreciate the audit; passing on the GitHub Action for now.

### 🟢 Unrelated follow-up (not from this PR)

Consider adding a `CONTRIBUTING.md` that states: (a) this is a docs-only pedagogy library, verbose examples are intentional; (b) prefer issues before drive-by optimisation PRs; (c) vendor-scored audits are welcome as issue comments, not PRs.

---

## 6. Sources

| # | Source | Used for |
|---|---|---|
| 1 | `gh pr view 2 --repo escapeboy/ai-prompts` | PR metadata, body, file list |
| 2 | `gh pr diff 2 --repo escapeboy/ai-prompts` | Full diff & LOC deltas |
| 3 | `anthropic-skills-overview` (docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) | Required frontmatter is `name`+`description` only |
| 4 | `anthropic-skills-engineering` (anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) | Descriptions drive skill selection; progressive disclosure |
| 5 | `claude-code-release-notes` (github.com/anthropics/claude-code/CHANGELOG.md) | Top-level frontmatter fields (`context`, `agent`, `effort`, `language`, `hooks`) |
| 6 | `03-custom-skills/guide.md` (this repo) | Documented top-level frontmatter conventions |
| 7 | `~/.claude/CLAUDE.md` (user global) | Faithful Reporting & Code Discipline expectations |
| 8 | Active Claude Code skill registry (this session) | `<scope>:<name>` namespacing pattern in practice |
| 9 | `.backups/2026-04-16/` (this repo) | Baseline for recent local edits that PR would overwrite |

---

## 7. Confidence

| Claim | Confidence |
|---|---|
| `metadata:` wrapper is NOT required by Anthropic spec | 🟢 High — explicit in official docs |
| `metadata:` wrapper would break Claude Code field parsing | 🟢 High — fields documented as top-level |
| `<scope>:<name>` is a valid Claude Code pattern | 🟢 High — ~100 live examples visible in this session |
| PR would overwrite recent local edits | 🟢 High — backups confirm |
| "Use when..." descriptions are an improvement | 🟢 High — matches Anthropic's own guidance |
| 74% LOC deletion removes pedagogical value | 🟡 Medium — judgement call depending on the user's intent for `examples/` |
| Tessl's 16→90% score is marketing | 🟡 Medium — no public rubric, but vendor has legitimate product; score just isn't a neutral metric |
| Author is selling a GitHub Action | 🟢 High — explicit in PR body |

---

**End of report.** No implementation follows — decision belongs to @escapeboy. Next step options: `/sc:implement "apply PR #2 cherry-picks"` or simply reply to the PR.
