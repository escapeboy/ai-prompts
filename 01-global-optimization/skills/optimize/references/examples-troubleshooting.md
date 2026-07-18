# Examples & troubleshooting

Worked end-to-end examples of each planning strategy, plus common failure modes. Read this
when you want a concrete walkthrough of how a task classifies and executes, or when savings
come out low / the wrong strategy fires.

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
