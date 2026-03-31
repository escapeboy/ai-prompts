# Research Report: Claude Code Source Analysis — Prompt Improvement Opportunities

**Date**: 2026-03-31
**Source**: https://github.com/JacquesGariepy/claude-code-ts (reverse-engineered TypeScript)
**Confidence**: High — code matches observed Claude Code behavior exactly
**Depth**: Deep (key files: `src/constants/prompts.ts`, `src/memdir/`, `src/tools/AgentTool/`)

---

## Executive Summary

The leaked Claude Code source reveals Anthropic's full system prompt architecture, memory system, tool orchestration, and behavioral guardrails. Several patterns are **more sophisticated than what we currently document** in our ai-prompts library. Key findings organized by actionable improvement area.

---

## 1. System Prompt Architecture (Cache-Optimized Sectioning)

### Finding
Anthropic splits the system prompt into **static (cacheable)** and **dynamic (per-session)** sections with an explicit boundary marker:

```
Static (cached at 90% discount):
  1. Intro/identity
  2. System info
  3. Doing tasks (code style rules)
  4. Executing actions with care
  5. Using your tools
  6. Tone and style
  7. Output efficiency
  === BOUNDARY MARKER ===
Dynamic (recomputed per session):
  8. Session guidance (tools, skills, agents)
  9. Memory prompt
  10. Environment info
  11. Language settings
  12. Output style
  13. MCP instructions
  14. Scratchpad
  15. Function result clearing
  16. Proactive behavior
```

### Opportunity for ai-prompts
**Our guide `05-token-optimization` doesn't document this static/dynamic split pattern.** We should add a section on structuring CLAUDE.md and system prompts with cache-friendly ordering — put stable instructions first, volatile context last.

**New content for `05-token-optimization/guide.md`**:
- "Cache-Friendly Prompt Ordering" section
- Rule: static rules → boundary → dynamic context
- Rationale: everything before the boundary gets 90% cache discount

---

## 2. Memory System — Full Taxonomy (4 Types)

### Finding
The memory system uses a **closed four-type taxonomy** with structured body formats:

| Type | Purpose | Body Structure |
|------|---------|----------------|
| **user** | Role, goals, preferences, knowledge | Free-form profile |
| **feedback** | Corrections AND confirmations | Rule → **Why:** → **How to apply:** |
| **project** | Ongoing work, goals, deadlines | Fact → **Why:** → **How to apply:** |
| **reference** | Pointers to external systems | Location + purpose |

Critical design decisions:
- **Feedback captures BOTH failures AND successes** — "if you only save corrections, you will avoid past mistakes but drift away from approaches the user has already validated"
- **"What NOT to save"** explicitly excludes: code patterns, architecture, git history, file structure, debugging solutions — all derivable from current state
- **TRUSTING_RECALL**: "A memory that names a specific function, file, or flag is a claim that it existed *when the memory was written*. It may have been renamed, removed, or never merged."
- **MEMORY.md capped** at 200 lines / 25KB — acts as index only, not content store

### Opportunity for ai-prompts
**Our memory guides are less precise.** We should update `02-project-activation/guide.md` and Serena memory templates to:
1. Adopt the 4-type taxonomy with body_structure enforcement
2. Add the "what NOT to save" exclusion list
3. Add the "trusting recall" verification pattern
4. Document the MEMORY.md-as-index pattern (pointer file, not content)

---

## 3. Code Style Guardrails — Anti-Overengineering

### Finding
Anthropic has **very specific anti-overengineering rules** baked into the system prompt:

```
1. "Don't add features, refactor code, or make 'improvements' beyond what was asked"
2. "Don't add error handling, fallbacks, or validation for scenarios that can't happen"
3. "Don't create helpers, utilities, or abstractions for one-time operations"
4. "Three similar lines of code is better than a premature abstraction"
5. "Avoid backwards-compatibility hacks like renaming unused _vars, re-exporting types"
6. "Default to writing no comments. Only add when WHY is non-obvious"
```

Internal-only (ant) additions:
- "Don't add inline type annotations to untyped code just because you're touching it"
- "Don't introduce `_` prefixed unused variables"

### Opportunity for ai-prompts
**We should add these as a reusable "Code Discipline" section** in our CLAUDE.md templates (`01-global-optimization/`). These rules prevent the most common Claude failure mode: gold-plating.

---

## 4. False Claims Mitigation

### Finding
Anthropic added explicit **anti-hallucination guardrails** (tagged `@[MODEL LAUNCH]` for Capybara/Opus 4.6):

```
"Report outcomes faithfully: if tests fail, say so with the relevant output;
if you did not run a verification step, say that rather than implying it succeeded.
Never claim 'all tests pass' when output shows failures, never suppress or
simplify failing checks to manufacture a green result."
```

Also: "do not hedge confirmed results with unnecessary disclaimers, downgrade finished work to 'partial,' or re-verify things you already checked."

### Opportunity for ai-prompts
**Add a "Faithful Reporting" section** to CLAUDE.md templates. This is especially valuable for CI/CD and deployment workflows where false green signals are dangerous.

---

## 5. Actions Safety Framework — Blast Radius Thinking

### Finding
The "Executing actions with care" section uses a **reversibility × blast radius** framework:

- **Freely take**: local, reversible actions (edit files, run tests)
- **Confirm first**: destructive, hard-to-reverse, or shared-state actions
- **Key principle**: "A user approving an action once does NOT mean they approve it in all contexts"
- **Anti-shortcut**: "Do not use destructive actions as a shortcut to simply make [an obstacle] go away"

Specific categories requiring confirmation:
1. Destructive ops (delete, rm -rf, drop tables)
2. Hard-to-reverse (force-push, reset --hard, amend published commits)
3. Shared-state (push, PR, Slack messages, external services)
4. Third-party uploads (may be cached/indexed even if deleted)

### Opportunity for ai-prompts
**Our `13-security-hardening` could adopt this framework** as a reusable "Action Safety" constitution rule. The categorization is cleaner than our current approach.

---

## 6. Fork Subagent Pattern (Context Protection)

### Finding
Claude Code has a **fork subagent** mode where calling Agent without a `subagent_type` creates a background fork:

```
"Creates a fork, which runs in the background and keeps its tool output out
of your context — so you can keep chatting with the user while it works.
Reach for it when research or multi-step implementation work would otherwise
fill your context with raw output you won't need again.
If you ARE the fork — execute directly; do not re-delegate."
```

The Explore agent is explicitly **read-only** with a detailed prohibition list.

### Opportunity for ai-prompts
**Update `10-subagents/guide.md`** with:
- Fork subagent pattern for context protection
- Read-only agent template (Explore agent's strict prohibition approach)
- "If you ARE the subagent, execute directly; do not re-delegate" — prevents infinite delegation

---

## 7. Output Style System

### Finding
Claude Code has **built-in output styles** that override the default prompt:

| Style | Purpose |
|-------|---------|
| **Default** | Concise, direct |
| **Explanatory** | Adds "Insight" boxes with educational points |
| **Learning** | Pauses and asks user to write code for practice |

The Explanatory style uses a specific format:
```
`★ Insight ─────────────────────────────────────`
[2-3 key educational points]
`─────────────────────────────────────────────────`
```

Styles can be loaded from plugins and can `forceForPlugin`.

### Opportunity for ai-prompts
**Create output style templates** in `03-custom-skills/` — these could be valuable as switchable CLAUDE.md profiles (teaching mode, audit mode, verbose debug mode).

---

## 8. Output Efficiency — Inverted Pyramid

### Finding
Internal (ant) version has a much richer "Communicating with the user" section:

```
"What's most important is the reader understanding your output without mental
overhead or follow-ups, not how terse you are."

"Use inverted pyramid when appropriate (leading with the action), and if
something about your reasoning is so important that it must be in user-facing
text, save it for the end."

"Before your first tool call, briefly state what you're about to do.
While working, give short updates at key moments: when you find something
load-bearing, when changing direction, when you've made progress without
an update."
```

### Opportunity for ai-prompts
**Add "Communication Protocol" to CLAUDE.md templates** — the inverted pyramid + milestone updates pattern is more actionable than just "be concise".

---

## 9. Scratchpad Directory

### Finding
Claude Code supports a **per-session scratchpad directory** for temporary files:

```
"Always use this scratchpad directory for temporary files instead of /tmp
or other system temp directories: [path]"
```

This prevents temp file pollution and keeps session artifacts organized.

### Opportunity for ai-prompts
**Document scratchpad usage** in `06-advanced-patterns/` — useful for complex workflows that need intermediate files.

---

## 10. System Prompt Section Caching Architecture

### Finding
Sections are wrapped in a `systemPromptSection()` / `DANGEROUS_uncachedSystemPromptSection()` pattern:

- `systemPromptSection(name, computeFn)` — computed once, cached until `/clear` or `/compact`
- `DANGEROUS_uncachedSystemPromptSection(name, computeFn, reason)` — recomputed every turn, requires justification

This is the internal mechanism that makes prompt caching work. Sections that change per-turn (like MCP instructions on late connect) are explicitly flagged as cache-breaking.

### Opportunity for ai-prompts
**Update `05-token-optimization`** with guidance on which CLAUDE.md sections are safe to be verbose (cached) vs which should be minimal (dynamic).

---

## Priority Recommendations

### High Priority (directly improves our prompts)
1. **Add anti-overengineering rules** to CLAUDE.md templates — Section 3
2. **Add faithful reporting guardrail** to CLAUDE.md templates — Section 4
3. **Update memory guides** with 4-type taxonomy + exclusions — Section 2
4. **Add "Communication Protocol"** (inverted pyramid + milestones) — Section 8

### Medium Priority (new content opportunities)
5. **Cache-friendly prompt ordering guide** — Section 1
6. **Fork subagent / read-only agent patterns** — Section 6
7. **Action safety framework** for constitutions — Section 5
8. **Output style templates** (teaching, audit, debug) — Section 7

### Low Priority (nice-to-have)
9. **Scratchpad directory pattern** — Section 9
10. **Section caching architecture docs** — Section 10

---

## Key Insight

The most valuable takeaway: **Anthropic's prompts are anti-maximalist**. Where we tend to add more instructions, their most impactful additions are *constraints* — don't over-engineer, don't gold-plate, don't hedge, don't re-delegate. The system prompt's power comes from what it prevents, not what it enables.

---

## Sources
- `src/constants/prompts.ts` — Main system prompt (53KB, 115 sections)
- `src/memdir/memdir.ts` — Memory system implementation (20.7KB)
- `src/memdir/memoryTypes.ts` — Memory taxonomy (22.3KB)
- `src/constants/outputStyles.ts` — Output style configs (9.7KB)
- `src/constants/systemPromptSections.ts` — Cache architecture (1.8KB)
- `src/tools/AgentTool/built-in/exploreAgent.ts` — Explore agent (4.6KB)
