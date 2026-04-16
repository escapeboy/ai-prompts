---
name: optimize
description: Reduce token usage by selecting a planning strategy, loading Serena memories, enforcing symbol-first exploration, and reporting savings. Use when starting a non-trivial task, asking to reduce token costs, requesting efficient execution, or wanting optimized Claude Code workflows.
version: 1.0.0
---

# /optimize — Maximum Token Efficiency Mode

Activates all Claude Code optimization strategies for the given task. Routes to the correct planning strategy, enforces symbol-first exploration, loads Serena memories, and reports token savings.

Use this as the default way to start any non-trivial work session.

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

## Planning Strategies

### Unified (1-2 subtasks)
**Triggers**: Bug fixes, single-file tweaks, small config changes

**Process**:
1. Symbol-first exploration (find the relevant symbol directly)
2. Direct implementation with Sonnet or Haiku
3. Verify with existing tests

**Token savings**: 60-70% vs full spec workflow

---

### Intent-Planning (3-7 subtasks)
**Triggers**: New features, moderate refactoring, API endpoint additions

**Process**:
1. Lightweight design sketch (Sonnet, ~5 min)
2. Task decomposition (Haiku)
3. Implementation with Sonnet
4. Test coverage (Sonnet)

**Token savings**: 40-50% vs full spec workflow

---

### Planning-Only (8+ subtasks)
**Triggers**: New modules, architectural changes, cross-cutting concerns

**Process**:
1. Requirements spec → `requirements.md`
2. Design spec → `design.md`
3. Task breakdown → `tasks.md`
4. Implementation phases
5. Tests
6. Judge evaluation (Opus, only if 3+ competing designs)

**Token savings**: High upfront cost, maximum long-term clarity

---

## Actions

### `status` — Show current optimization configuration

Reports what's active:
- Which Serena memories are loaded
- Cache hit rate (if available)
- Constitution file status
- Recommended strategy for current project state

```
/optimize status
```

---

### `report` — Token usage summary for the session

Produces a session summary:

```
/optimize report
```

**Output format**:
```
## Optimization Report

Strategy used: Intent-Planning
Tokens used: ~18K
Estimated baseline: ~85K
Savings: 79%
Cache hit rate: 84%

Optimizations applied:
- Symbol-first exploration: 65% savings on file reads
- Memory system: 60% savings on context loading
- Adaptive planning: 45% savings vs full spec
- Prompt caching: 90% savings on re-reads
- Model selection: Haiku used for 3/7 subtasks
```

---

### `metrics` — Show all token optimization targets

Displays the savings targets from `~/.claude/settings/token-optimization.json`.

```
/optimize metrics
```

---

## Context Preparation

This skill automatically loads:

1. **Serena memories** (if Serena MCP available):
   - `architecture.md`
   - `codebase-conventions.md`
   - `module-structure.md` (if working on a module)
   - `testing-strategy.md` (if tests involved)

2. **Constitution** (if `.claude/settings/constitution.json` exists) — checks task against architectural rules before starting

3. **Existing specs** — searches `.claude/specs/` for similar past work to reuse patterns

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

## Examples

### Example 1: Bug Fix (Unified)

```
/optimize "Fix the duplicate email validation in UserService"
```

**What happens**:
- Classified as: Unified (1-2 tasks)
- Symbol-first: `find_symbol("UserService/validate_email")`
- Fix + verify in one pass
- ~3K tokens (vs ~20K without optimization)

---

### Example 2: New Feature (Intent-Planning)

```
/optimize "Add Stripe webhook handling for subscription events"
```

**What happens**:
- Classified as: Intent-Planning (5 tasks)
- Design sketch → task list → implementation
- Haiku for task decomposition
- Sonnet for webhook logic
- ~22K tokens (vs ~85K without optimization)

---

### Example 3: New Module (Planning-Only)

```
/optimize "Build a multi-tenant billing system with per-seat pricing"
```

**What happens**:
- Classified as: Planning-Only (12+ tasks)
- Full spec workflow with checkpoint saves
- Opus for final architecture evaluation
- High upfront cost, saves tokens across entire implementation

---

## Troubleshooting

### "Serena not available"

Optimization still works at 40-50% savings without Serena. Memory-first and symbol-first strategies fall back to `Read` + `Grep`.

### "Low token savings"

Run `/optimize status` — check if:
- Memories are loaded (run `/context load` first)
- Cache is warming up (first session always costs more)
- Serena MCP is connected

### "Wrong strategy selected"

Override explicitly:
```
/optimize --strategy unified "your task"
/optimize --strategy planning "your task"
```

---

## See Also

- [`/context`](../context/SKILL.md) — Memory management
- [`/cache-inspector`](../cache-inspector/SKILL.md) — Cache performance monitoring
- [`/init-project`](../init-project/SKILL.md) — Initialize optimization for a new project
- [Token Optimization Guide](../../05-token-optimization/guide.md)
