# Planning Strategies — full detail

The core `SKILL.md` selects one of three strategies by subtask count. This file holds the
detailed process and token-savings figure for each. Read it when you need the exact steps
for the selected strategy (the core table only names the trigger + headline savings).

## Unified (1-2 subtasks)
**Triggers**: Bug fixes, single-file tweaks, small config changes

**Process**:
1. Symbol-first exploration (find the relevant symbol directly)
2. Direct implementation with Sonnet or Haiku
3. Verify with existing tests

**Token savings**: 60-70% vs full spec workflow

---

## Intent-Planning (3-7 subtasks)
**Triggers**: New features, moderate refactoring, API endpoint additions

**Process**:
1. Lightweight design sketch (Sonnet, ~5 min)
2. Task decomposition (Haiku)
3. Implementation with Sonnet
4. Test coverage (Sonnet)

**Token savings**: 40-50% vs full spec workflow

---

## Planning-Only (8+ subtasks)
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

## Overriding the auto-selected strategy

If the automatic classification picks the wrong strategy, override it explicitly:

```
/optimize --strategy unified "your task"
/optimize --strategy planning "your task"
```
