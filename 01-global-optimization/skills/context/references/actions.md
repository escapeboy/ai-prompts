# /context — Full action reference

Complete process steps, parameters, and output formats for every `/context` action.
The thin decision core lives in [../SKILL.md](../SKILL.md) — read this file when you
need the exact process or the output shape for a specific action.

---

## `load` — Load all relevant memories

Loads memories relevant to the current project. Run this at the **start of every session**
before any code work.

**Process**:
1. List all memories: `mcp__serena__list_memories()`
2. Load core memories automatically:
   - `architecture.md`
   - `codebase-conventions.md`
3. Detect task context and conditionally load:
   - `module-structure.md` — if working on a specific module
   - `testing-strategy.md` — if tests are involved
   - `docker-workflow.md` — if Docker config detected
   - `deployment-config.md` — if deployment work planned

**Token savings**: 60-70% vs reading individual files each time

```
/context load
```

---

## `list` — Show available memories

Lists all Serena memories for the current project with metadata.

```
/context list
```

**Output format**:
```
Project memories (.serena/memories/):

Core (always loaded):
  ✅ architecture.md          — last updated 2026-03-10
  ✅ codebase-conventions.md  — last updated 2026-03-08

Conditional:
  📋 module-structure.md      — last updated 2026-02-20
  📋 testing-strategy.md      — last updated 2026-01-15
  📋 docker-workflow.md       — last updated 2026-01-10

Project-specific:
  📋 api-design.md            — last updated 2026-03-01
  📋 database-schema.md       — last updated 2026-02-28

Status: 2/8 memories loaded | Cache: WARM
```

---

## `save [name]` — Create or update a memory

Creates a new Serena memory capturing current knowledge about the project.

**Usage**:
```
/context save [memory-name]
```

**Parameters**:
- `[memory-name]` — Name for the memory file (without `.md`), e.g. `architecture`, `api-design`, `deployment-config`

**Process**:
1. Gather relevant context from current conversation + codebase
2. Structure as readable Markdown
3. Write to `.serena/memories/[name].md`
4. Confirm creation with token size estimate

**Examples**:
```
/context save architecture         # Document project structure
/context save api-design           # Document API conventions
/context save deployment-config    # Document deploy workflow
/context save testing-strategy     # Document test patterns
```

**Recommended memory structure** (Claude writes this automatically) and the full template
catalog live in [memory-templates.md](memory-templates.md).

---

## `refresh [name]` — Regenerate a stale memory

Re-reads the codebase and overwrites an existing memory with current state. Use when the
project has changed significantly.

```
/context refresh architecture
/context refresh codebase-conventions
```

**Process**:
1. Load current memory (for comparison)
2. Perform fresh symbolic exploration of relevant code
3. Identify what has changed
4. Rewrite memory with updated content
5. Report: what changed, old vs new size

**When to use**:
- After a major refactor
- After adding a new module
- Memory is more than 2 weeks old
- You notice Claude making incorrect assumptions about the project

---

## `inspect` — Show loaded context and cache status

Shows a summary of what's currently in context and the prompt cache status.

```
/context inspect
```

**Output format**:
```
## Context Inspection

### Loaded Memories
- architecture.md (2.1K tokens) — CACHED ✅
- codebase-conventions.md (1.8K tokens) — CACHED ✅
- testing-strategy.md (1.2K tokens) — WARM 🟡

Total memory tokens: 5.1K
Cache hit rate: 87%
Estimated savings vs no-cache: 4.6K tokens (90%)

### Project Context
Project: my-rails-app
Framework: Rails 8.0
Serena: Connected ✅
Constitution: .claude/settings/constitution.json ✅

### Recommendation
Context is optimal. Run /optimize to start work.
```

---

## `clear` — Unload all memories from context

Clears loaded memories from the current context. Useful when switching between projects or
when context is stale.

```
/context clear
```

This does **not** delete the memory files — it only unloads them from the current
conversation. Run `/context load` to reload.

---

## `create [name]` — Interactive memory creation

Walks through creating a memory interactively, asking what to document.

```
/context create
/context create docker-workflow
```

Claude will ask:
1. What aspect of the project to capture
2. Whether to auto-discover from codebase or write from scratch
3. How to structure the memory
