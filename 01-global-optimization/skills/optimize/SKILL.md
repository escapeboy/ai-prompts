---
name: optimize
description: Reduce token usage by selecting a planning strategy, loading Serena memories, enforcing symbol-first exploration, and reporting savings. Use when starting a non-trivial task, asking to reduce token costs, requesting efficient execution, or wanting optimized Claude Code workflows.
version: 1.0.0
---

# /optimize — Maximum Token Efficiency Mode

Activates all Claude Code optimization strategies for the given task. Routes to the correct planning strategy, enforces symbol-first exploration, loads Serena memories, and reports token savings.

Use this as the default way to start any non-trivial work session.

---

## When to Use This Skill (and When NOT to)

| Use this skill for | Use a simpler approach for |
|--------------------|----------------------------|
| Starting a non-trivial task (a feature, a refactor, a module) where planning + memory loading pays back | A one-line answer or a question you can answer directly — the strategy/memory scaffolding is pure overhead |
| Work spanning multiple files or subtasks, where symbol-first exploration and model routing save real tokens | A single known edit in a file already open — just make it |
| A task worth measuring — you want the savings report at the end | Trivial edits where reporting savings costs more than the edit |
| Any session where Serena memories + constitution should gate the approach before touching code | A repo with no memories/constitution and a one-shot ask — skip straight to the work |

**Start simple. Reach for `/optimize` only when the task is big enough that choosing a strategy, loading memories, and routing models actually reduces total tokens.** For a 1-line fix, the classification step is the overhead this skill exists to avoid elsewhere.

---

## Usage

```
/optimize [task description]
/optimize [action]
```

### Quick Examples

```
/optimize "Add email verification to the auth system"
/optimize "Fix the N+1 query in OrdersController#index"
/optimize status
/optimize report
```

---

## How It Works

When you run `/optimize "your task"`, Claude will:

1. **Analyze complexity** — count subtasks, files affected, and dependencies
2. **Select planning strategy** — Unified (1-2 tasks), Intent-Planning (3-7), or Planning-Only (8+)
3. **Load context** — Serena memories + constitution (if available)
4. **Apply symbol-first exploration** — never reads full files before checking symbols
5. **Select optimal model** — Haiku for simple steps, Sonnet for complex work, Opus only for critical decisions
6. **Execute with metrics** — reports token savings at the end

---

## Planning Strategy Selector

Classify by subtask count, then run that strategy:

| Strategy | Triggers | Headline savings |
|----------|----------|------------------|
| **Unified** (1-2 subtasks) | Bug fixes, single-file tweaks, small config changes | 60-70% vs full spec |
| **Intent-Planning** (3-7 subtasks) | New features, moderate refactoring, API endpoint additions | 40-50% vs full spec |
| **Planning-Only** (8+ subtasks) | New modules, architectural changes, cross-cutting concerns | High upfront cost, max long-term clarity |

For the per-strategy process steps and how to override the auto-selected strategy, read **[references/planning-strategies.md](references/planning-strategies.md)**.

---

## Actions

Besides running a task, `/optimize` exposes three diagnostic/reporting actions:

- `status` — show the active optimization configuration (loaded memories, cache hit rate, constitution, recommended strategy)
- `report` — token usage summary for the session (strategy, tokens vs baseline, savings, applied optimizations)
- `metrics` — the savings targets from `~/.claude/settings/token-optimization.json`

For the exact output formats, and the full list of context the skill loads automatically (Serena memories, constitution, existing specs), read **[references/actions.md](references/actions.md)**.

---

## Model Selection

| Task type | Model | Reason |
|-----------|-------|--------|
| Requirements, task lists | Haiku | Template-driven, fast |
| Implementation, design | Sonnet | Balanced cost/quality |
| Security, architecture, judge | Opus | Critical decisions only |

**Target distribution**: 40% Haiku / 55% Sonnet / 5% Opus

---

## Token Optimization Rules

The following rules are **mandatory** when `/optimize` is active:

### 1. Symbol-First Exploration (MANDATORY)
Never read a full file before using symbolic discovery:
```
✅ mcp__serena__find_symbol("ClassName") → read only needed methods
❌ Read("app/models/user.rb") → reads entire file
```

### 2. Memory-First Context (MANDATORY)
Always load Serena memories before exploring code:
```
✅ mcp__serena__list_memories() → load relevant ones → start work
❌ Start reading files immediately
```

### 3. Prompt Caching (AUTOMATIC)
System prompts, tool definitions, and memories are cached automatically. First load costs full tokens; subsequent reads cost 10%.

### 4. Minimal Model Use
Use the cheapest model that can do the job. Don't use Sonnet for template-driven tasks. Never use Opus unless it's a critical architectural/security decision.

### 5. Verify Before Reporting (MANDATORY)
Run existing tests, a regression grep, or manual validation before reporting a task as done. If a verification step was skipped, say so plainly rather than implying success. Aligns with `~/.claude/CLAUDE.md` §Faithful Reporting.

---

## Examples & Troubleshooting

For worked end-to-end examples of each strategy (Unified bug fix, Intent-Planning feature, Planning-Only module) and fixes for common failure modes ("Serena not available", "Low token savings", "Wrong strategy selected"), read **[references/examples-troubleshooting.md](references/examples-troubleshooting.md)**.

---

## Boundaries

### Always

- Load Serena memories (and constitution, if present) **before** exploring code — memory-first is mandatory.
- Use symbol-first exploration; never read a full file before attempting symbolic discovery.
- Use the cheapest model that meets the quality bar (target 40% Haiku / 55% Sonnet / 5% Opus).
- Verify (tests, regression grep, or manual validation) before reporting a task as done, and state plainly when a verification step was skipped.

### Ask First

- Escalating to Opus — reserve it for critical architectural/security decisions or judge evaluation with 3+ competing designs; don't reach for it silently.
- Overriding the auto-selected strategy when it changes scope materially (e.g. forcing Planning-Only on what looked like a quick fix) — surface the reclassification.
- Any destructive, hard-to-reverse, or shared-state step the task itself entails (migrations, force-push, deploys) — those follow the global Action Safety rule, not the optimizer's discretion.

### Never

- Report a task as done, or claim savings, without running the verification step — no manufactured green results.
- Use Opus for template-driven work (requirements, task lists) that Haiku handles.
- Skip memory/symbol-first steps to "save time" — that inflates tokens, which is the exact failure this skill prevents.

---

## See Also

- [`/context`](../context/SKILL.md) — Memory management (load these memories before optimizing; depends-on)
- [`/cache-inspector`](../cache-inspector/SKILL.md) — Cache performance monitoring (complements the `report` action)
- [`/init-project`](../init-project/SKILL.md) — Initialize optimization for a new project (run once before `/optimize`)
- [Token Optimization Guide](../../05-token-optimization/guide.md)
- [Custom Skills Guide](../../../03-custom-skills/guide.md) — skill authoring conventions
- Bundled references: [planning-strategies.md](references/planning-strategies.md) · [actions.md](references/actions.md) · [examples-troubleshooting.md](references/examples-troubleshooting.md)
