# Actions & context preparation — full detail

The core `SKILL.md` runs `/optimize "<task>"` as its default. This file documents the three
diagnostic/reporting actions and the context the skill loads automatically. Read it when the
user invokes `status`, `report`, or `metrics`, or when you need to know exactly what gets
loaded before work starts.

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
