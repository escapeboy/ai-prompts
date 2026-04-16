---
name: optimize
description: "Reduce token usage by selecting a planning strategy, loading Serena memories, enforcing symbol-first exploration, and reporting savings. Use when starting a non-trivial task, asking to reduce token costs, requesting efficient execution, or wanting optimized Claude Code workflows."
---

# /optimize — Token Efficiency Mode

Selects the right planning strategy, enforces symbol-first code exploration, loads Serena memories, and reports token savings for any task.

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

## Workflow

When invoked with a task description:

1. **Analyze complexity** — count subtasks, files affected, dependencies.
2. **Select planning strategy** based on subtask count (see below).
3. **Load context** — call `mcp__serena__list_memories()` and load relevant memories + constitution before touching code.
4. **Enforce symbol-first exploration** — use `mcp__serena__find_symbol()` to locate code; never read full files first.
5. **Execute the task** following the selected strategy.
6. **Verify** — run existing tests or manual validation before reporting completion.
7. **Report** — summarize strategy used, tokens consumed, and savings estimate.

## Planning Strategies

### Unified (1-2 subtasks)

Bug fixes, single-file tweaks, small config changes.

1. Symbol-first exploration → locate the relevant symbol directly.
2. Implement the fix.
3. Run tests to verify. If tests fail, fix before reporting done.

### Intent-Planning (3-7 subtasks)

New features, moderate refactoring, API endpoint additions.

1. Lightweight design sketch.
2. Decompose into tasks.
3. Implement each task.
4. Verify each task passes tests before moving to the next.

### Planning-Only (8+ subtasks)

New modules, architectural changes, cross-cutting concerns.

1. Write requirements spec → `requirements.md`.
2. Write design spec → `design.md`.
3. Break into tasks → `tasks.md`.
4. Implement in phases, verifying tests between phases.
5. If 3+ competing designs exist, use Opus for architecture evaluation.

## Actions

### `status` — Current optimization configuration

Reports loaded Serena memories, cache hit rate, constitution file status, and recommended strategy.

### `report` — Session token usage summary

Summarizes strategy used, total tokens consumed, estimated savings, cache hit rate, and which optimizations contributed.

### `metrics` — Token optimization targets

Displays savings targets from `~/.claude/settings/token-optimization.json`.

## Mandatory Rules

### 1. Symbol-First Exploration

Never read a full file before using symbolic discovery:

```
DO:   mcp__serena__find_symbol("ClassName") → read only needed methods
DON'T: Read("app/models/user.rb") → reads entire file
```

### 2. Memory-First Context

Always load Serena memories before exploring code:

```
DO:   mcp__serena__list_memories() → load relevant ones → start work
DON'T: Start reading files immediately
```

### 3. Minimal Model Use

Use Haiku for template-driven tasks (requirements, task lists). Use Sonnet for implementation and design. Use Opus only for critical architectural or security decisions.

### 4. Verify Before Reporting

Run existing tests after every implementation step. Do not report completion until tests pass.

## Fallback Behavior

If Serena MCP is unavailable, symbol-first and memory-first strategies fall back to `Read` + `Grep`. Strategy selection and verification still apply.

Override strategy explicitly if needed:

```
/optimize --strategy unified "your task"
/optimize --strategy planning "your task"
```

## See Also

- [`/context`](../context/SKILL.md) — Memory management
- [`/cache-inspector`](../cache-inspector/SKILL.md) — Cache performance monitoring
- [`/init-project`](../init-project/SKILL.md) — Initialize optimization for a new project
- [Token Optimization Guide](../../05-token-optimization/guide.md)
