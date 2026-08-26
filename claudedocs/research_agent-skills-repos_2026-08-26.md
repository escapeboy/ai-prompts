# Research: 10 "Agent Skills" Repos — Fit for Daily Work, Projects & ai-prompts Guides

**Date:** 2026-08-26
**Command:** `/sc:research` (report only — no implementation)
**Depth:** Standard (README + tree + license/activity, verified via GitHub API)
**Evaluated against:** (1) daily workflow / fleet tooling, (2) our concrete projects, (3) `~/ai-prompts/` guides

---

## Executive Summary

All 10 repos exist, are active (most pushed within the last week), and are mostly MIT-licensed.
The star counts in the source graphic are **real** (GitHub API confirms them; agent-skills repos
have genuinely exploded in popularity).

The single most important finding: **your stack already contains several of these.** This is not a
greenfield adoption question — it's a *refresh + selective-harvest* question. Two are already
integrated (one is stale), one is already internalized as CLAUDE.md policy, and the rest overlap
heavily with your existing `compound-engineering` plugin and native skills.

**Do NOT blanket-install these as plugins.** Many ship session-start hooks, `.mjs` scripts, and
bundled MCP servers (superpowers, addyosmani, caveman, ayghri). Installing them as plugins =
executing third-party code with auto-triggering hooks across your fleet. The correct adoption
pattern for a security-conscious fleet is **read the `SKILL.md`, cherry-pick the prose into your own
guides/skills** — never `/plugin install` something with a session hook you haven't audited.

### Verdict table

| # | Repo | Stars | Lic | Already ours? | Verdict |
|---|------|-------|-----|---------------|---------|
| 1 | anthropics/skills | 171k | (mixed) | Partially (you have `claude-api`, `frontend-design`, etc. as native skills) | **Reference** — canonical patterns; already tracked |
| 2 | obra/superpowers | 278k | MIT | Overlaps `sprint-orchestrate`, `compound-engineering` | **Evaluate 1 idea** (subagent-driven TDD loop) |
| 3 | multica-ai/andrej-karpathy-skills | 207k | MIT | **Yes — internalized** in CLAUDE.md Code Discipline | **Skip** (already have it) |
| 4 | mattpocock/skills | 237k | MIT | Overlaps compound-engineering | **Harvest 2 ideas** (grill-me, CONTEXT.md glossary) |
| 5 | nextlevelbuilder/ui-ux-pro-max | 121k | MIT | **Yes — but STALE** (`08-ui-ux-development`) | **Refresh** the guide to v2.0 |
| 6 | JuliusBrussee/caveman | 101k | MIT+BSL | No | **Reject the gimmick**, note the token idea |
| 7 | addyosmani/agent-skills | 90k | MIT | Overlaps compound-engineering + your commands | **Harvest** taxonomy + `/webperf`, `/code-simplify` |
| 8 | Leonxlnx/taste-skill | 81k | MIT | **Yes — integrated** as `design-taste-frontend` | **Verify currency**, else skip |
| 9 | ComposioHQ/awesome-claude-skills | 73k | (list) | No | **Bookmark as index** (SaaS-integration lookup) |
| 10 | ayghri/i-have-adhd | 24k | MIT | **Yes — internalized** (Communication Protocol) | **Skip** (already have it) |

---

## Per-repo analysis

### 1. anthropics/skills — 171k ⭐ — *Reference / canonical*
Anthropic's own demo skill set: `docx/pdf/pptx/xlsx` (the real document engine, source-available),
`mcp-builder`, `skill-creator` (ships analyzer/grader/comparator sub-agents), `canvas-design`,
`webapp-testing`, `claude-api` (multi-language). Also carries the **Agent Skills spec** and a
template.
- **Fit:** You already have equivalents as first-class skills (`claude-api`, `frontend-design`,
  `artifact-*`, `mcp-builder` patterns). Value here is the `skill-creator` grader/analyzer agents
  and the spec/template — useful reference material for your `self-improve` eval gate.
- **Action:** Reference only. Consider borrowing the `skill-creator` grader-agent pattern into
  `self-improve` Tier-3. No wholesale install needed.

### 2. obra/superpowers — 278k ⭐ — *Evaluate one idea*
A full methodology: spec-out → chunked design sign-off → plan-for-a-junior → **subagent-driven
development** loop (agents work through tasks autonomously for hours, reviewing each other). Installs
across 15+ harnesses. Ships hooks + a session-start injector.
- **Fit:** Directly overlaps your `sprint-orchestrate`, `ship`, and `compound-engineering:ce-work`.
  The genuinely differentiated piece is the **subagent-driven-development loop** with inter-agent
  review — comparable to your Background-Delegation + adversarial-verifier pattern but more
  formalized.
- **Risk:** Session-start hook = auto-executing code. Heavy, opinionated, "takes over" the workflow
  (the exact thing mattpocock's README criticizes).
- **Action:** Do NOT install. Read `skills/*/SKILL.md` for the subagent-review loop and fold any
  missing mechanics into `06-advanced-patterns/parallel-agents-guide.md` /
  `headless-review-fanout-guide.md`.

### 3. multica-ai/andrej-karpathy-skills — 207k ⭐ — *Skip: already internalized*
A single `CLAUDE.md` with 4 principles: Think Before Coding, Simplicity First, Surgical Changes,
Goal-Driven Execution.
- **Finding:** These map almost 1:1 to your existing CLAUDE.md **Code Discipline** ("don't
  gold-plate", "surgical changes"), **Verify-Don't-Assume**, and **Delivering Work** sections. You
  already enforce this — with more teeth (evidence tags, grep-before-rename).
- **Action:** Skip. Optionally cite it as the external source in a comment. Nothing to add.

### 4. mattpocock/skills — 237k ⭐ — *Harvest 2 ideas*
"Skills for Real Engineers." Small, composable, model-agnostic. Explicitly anti-"framework-owns-your-
process" (contrasts itself with GSD/BMAD/Spec-Kit). Standouts:
- **`grill-me` / `grill-with-docs`** — agent interrogates YOU with detailed questions before coding
  (his most-used skills). Overlaps `sc:brainstorm` / `ce-brainstorm` but is lighter and habitual.
- **`CONTEXT.md` glossary** — a per-project ubiquitous-language file so the agent stops using 20
  words for 1. Cheap, high-leverage, and you have nothing exactly like it.
- Others: tdd, triage, to-spec, to-tickets, wayfinder, resolving-merge-conflicts.
- **Action:** (a) Add a **`CONTEXT.md` glossary convention** to
  `02-project-activation` / your Laravel `CLAUDE.md` template (`09-laravel-mcp-integration`). (b)
  Evaluate `grill-with-docs` as a lighter default than the heavier brainstorm skills.

### 5. nextlevelbuilder/ui-ux-pro-max — 121k ⭐ — *Refresh: ours is STALE* ⚠️
- **Finding:** Your `08-ui-ux-development/ui-ux-pro-skill.md` is a **derivative of an OLDER version**
  of this repo. Ours documents "50+ UI styles, 21 palettes." Upstream is now **v2.0: 192 reasoning
  rules, 79 searchable UI styles, and a new AI Design-System Generator** + a Python CLI
  (`ui-ux-pro-max-cli` on npm).
- **Action (highest-value concrete task):** Refresh `08-ui-ux-development/ui-ux-pro-skill.md` and
  `quick-reference.md` against upstream v2.0. Decide whether to track the Design-System-Generator
  reasoning engine or keep just the static style/palette catalog. This is a genuine drift fix.

### 6. JuliusBrussee/caveman — 101k ⭐ — *Reject the gimmick*
Compresses agent I/O by making it "talk like caveman"; claims 33% fewer input tokens (pinned
benchmark). Ships a proxy, "pixel mode," and 8 native wrap profiles. License is MIT+BSL (Business
Source — restrictive for commercial/managed use).
- **Fit:** The token-reduction *goal* is legitimate, but the caveman-speak output is incompatible
  with your **Communication Protocol** (professional, client-facing work) and your BSL-averse posture
  for fleet tooling. You already attack token cost more surgically via `context-mode` (guide 15) and
  `05-token-optimization`.
- **Action:** Reject adoption. Optionally note the "compress tool output, not just chat" idea — but
  `context-mode` already does this without degrading readability.

### 7. addyosmani/agent-skills — 90k ⭐ — *Harvest taxonomy + a couple commands*
"Production-grade engineering skills," 24 skills mapped to a DEFINE→PLAN→BUILD→VERIFY→REVIEW→SHIP
lifecycle with 8 slash commands (`/spec /plan /build /test /review /webperf /code-simplify /ship`).
Well-engineered: notes the per-skill `references/` portability gap, `/build auto` autonomous mode.
- **Fit:** The lifecycle overlaps your `sprint-orchestrate` + `compound-engineering` + native
  `code-review`/`simplify`/`ship`. But two commands have no exact native equal:
  **`/webperf`** (measure-before-optimize web perf audit) and **`/code-simplify`** (though your
  `/simplify` skill is close). The **skill taxonomy** (24 lifecycle skills, auto-activation) is a
  clean real-world case study for `03-custom-skills/skill-taxonomy-guide.md`.
- **Action:** (a) Cite as a second case study in the taxonomy guide. (b) Evaluate `/webperf` content
  vs. your `perf`/`seo` skills — likely worth folding a web-vitals checklist into `07-custom-commands`
  or `08-ui-ux-development`.

### 8. Leonxlnx/taste-skill — 81k ⭐ — *Already yours; verify currency*
- **Finding:** Your native `design-taste-frontend` skill's SKILL.md literally opens
  "# tasteskill: Anti-Slop Frontend Skill" — it **is** this repo, already integrated. Note the
  upstream README is now heavy with sponsor/affiliate noise (Kimi, etc.).
- **Action:** Diff your `design-taste-frontend` against upstream `skills/taste-skill/SKILL.md` for
  any substantive rule updates; ignore the marketing. No new adoption.

### 9. ComposioHQ/awesome-claude-skills — 73k ⭐ — *Bookmark as index*
Two things in one repo: (a) a curated **awesome-list** of Claude skills/resources, and (b)
`composio-skills/` — **2,000+ auto-generated `*-automation` skills**, one per SaaS API (Ahrefs,
Algolia, Adobe, ActiveCampaign…) via Composio's connector platform.
- **Fit:** Not a skill to adopt — it's a **discovery index**. The auto-generated per-SaaS wrappers are
  low-depth but useful as a starting scaffold if you ever need to wire a specific SaaS into FleetQ /
  a client project.
- **Action:** Bookmark in `04-research-integration/sources.md` as a lookup index. Do not vendor the
  2,000 auto-skills.

### 10. ayghri/i-have-adhd — 24k ⭐ — *Skip: already internalized*
A skill that forces action-first, numbered-steps, no-"Hope this helps!" output. Multi-agent
(Claude/Codex/Gemini/OpenAI/Kimi/opencode packaging).
- **Finding:** This is your CLAUDE.md **Communication Protocol** ("Lead with the action… inverted
  pyramid… no filler") already, enforced globally.
- **Action:** Skip. Nothing to add.

---

## Consolidated recommendations

### A. Concrete fixes (highest value first)
1. **Refresh `08-ui-ux-development/ui-ux-pro-skill.md` to ui-ux-pro-max v2.0** — documented drift
   (50→79 styles, +192 reasoning rules, +Design-System Generator). Clear, bounded task.
2. **Add a `CONTEXT.md` glossary convention** (from mattpocock) to the Laravel `CLAUDE.md` template
   (`09-laravel-mcp-integration`) and `02-project-activation`. Cheap, high-leverage, no analog today.
3. **Diff `design-taste-frontend` vs upstream taste-skill** for rule updates (strip marketing).

### B. Guide enrichments (idea harvest, no install)
4. Add **addyosmani/agent-skills** + **mattpocock/skills** as real-world case studies in
   `03-custom-skills/skill-taxonomy-guide.md` (lifecycle taxonomy + composable-vs-framework debate).
5. Evaluate `/webperf` (addyosmani) content → a web-vitals checklist for `07-custom-commands` or `08`.
6. Fold superpowers' **subagent-driven-development review loop** mechanics (if any missing) into
   `06-advanced-patterns/parallel-agents-guide.md`.
7. Bookmark **ComposioHQ/awesome-claude-skills** as a SaaS-integration index in
   `04-research-integration/sources.md`.

### C. Skip / reject
- **karpathy** and **i-have-adhd**: already internalized as CLAUDE.md policy.
- **caveman**: incompatible with Communication Protocol + BSL license; `context-mode` already solves
  token cost cleanly.
- **Wholesale `/plugin install`** of superpowers/addyosmani/caveman/ayghri: they ship session hooks /
  MCP / `.mjs`. Harvest prose; don't auto-execute third-party code fleet-wide.

### Cross-cutting caveats
- **Trust/supply-chain:** treat every one as untrusted code. Adopt by copying audited `SKILL.md`
  prose into your own namespace, never by installing hook-bearing plugins.
- **Overlap saturation:** your `compound-engineering` plugin + native skills already cover most of
  the engineering-lifecycle surface. Marginal value from these repos is *specific ideas*
  (CONTEXT.md glossary, webperf audit, subagent review loop), not whole frameworks.

## Confidence
- Repo existence/stats/license/activity: **High** (GitHub API, live).
- README/structure claims: **High** (fetched raw).
- "Already ours / stale" findings: **High** (verified against your local files).
- Internal SKILL.md *quality* depth: **Medium** (Standard depth = README + tree; did not line-read
  every skill body). Deep-diff pass recommended before executing A1–A3.

## Sources
GitHub API `repos/{owner}/{repo}`, `/readme`, `/git/trees?recursive=1` for all 10 repos (2026-08-26).
Local: `~/ai-prompts/08-ui-ux-development/`, `~/ai-prompts/03-custom-skills/`,
`~/.claude/skills/design-taste-frontend/`, `~/.claude/CLAUDE.md`.

---

## Implementation Log (executed 2026-08-26, same session)

Per user authorization ("направи каквото трябва"), the recommendations were implemented:

| Item | Action | File(s) |
|------|--------|---------|
| **A1** ✅ | Refreshed UI/UX guide to upstream **v2.0** — corrected all counts (88 styles/79 searchable/50 active, 192 palettes+reasoning profiles, 119 UX guidelines, 74 fonts, 25 charts, 22 stacks), added the `search.py` **query-contract** architecture section + priority table, stamped a `verifiedAt 2026-08-13` **drift marker** | `08-ui-ux-development/ui-ux-pro-skill.md` |
| **A2** ✅ | Added the **`CONTEXT.md` domain-glossary convention** (from mattpocock) — full template + rationale in the Laravel template, a generated-CLAUDE.md pointer, and a companion note in project-activation Step 4 | `09-laravel-mcp-integration/laravel-claude-md-template.md`, `02-project-activation/guide.md` |
| **A3** ✅ | Diffed `design-taste-frontend` vs upstream `taste-skill` → **byte-identical** (sha256 `aa194351…`), zero drift. **No-op** — ours is current. | (verification only) |
| **B4** ✅ | Added addyosmani + mattpocock as **taxonomy case studies** (lifecycle-vs-composable tension) | `03-custom-skills/skill-taxonomy-guide.md` |
| **B5** ✅ | New **web performance audit** doc (`/webperf` Quick/Deep-mode pattern), linked from README | `08-ui-ux-development/web-performance-audit.md`, `README.md` |
| **B6** ✅ | Added **Pattern 5: Subagent-Driven Development** (superpowers) with mapping to our stack + the borrowable per-task review gate | `06-advanced-patterns/parallel-agents-guide.md` |
| **B7** ✅ | Bookmarked ComposioHQ + 4 others as an **Agent-Skills Discovery index** with untrusted-code warning | `04-research-integration/sources.md` |
| **C** (skip/reject) | karpathy + i-have-adhd already internalized in CLAUDE.md; caveman rejected (Comm-Protocol conflict + BSL); no blind plugin installs | (no change — as intended) |

**Net:** 7 files changed (+202/−10), 2 new files. No absolute paths / hostnames / IPs / emails
introduced (public-repo hygiene verified). Changes left **uncommitted** for review.
