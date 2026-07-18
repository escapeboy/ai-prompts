---
name: context
description: Manage Serena memories and session context — load, save, refresh, inspect, and clear project knowledge
version: 1.0.0
---

# /context — Memory & Context Management

Manages the Serena memory system that stores architectural knowledge, conventions, and project context. Loading memories at the start of a session saves 60-70% of tokens by eliminating repeated file reads.

---

## When to Use This Skill (and When NOT to)

| Use this skill for | Use a simpler approach for |
|--------------------|----------------------------|
| Starting a session on a project with existing memories — `load` before any code work | A repo with no memories yet and one quick edit — just read the one file |
| Capturing durable architecture / conventions / deploy knowledge that outlives the session (`save`, `create`) | An ephemeral session fact — let auto-memory / MEMORY.md hold it |
| Refreshing a memory after a major refactor so Claude stops making stale assumptions | A memory touched days ago on an unchanged codebase — it's still current |
| Auditing what's loaded and what caching is buying you (`inspect`, `list`) | A single-file lookup where symbolic exploration answers it directly |

**Start simple. Reach for this skill only when the project has (or clearly warrants) reusable
memories — don't scaffold a memory set for a one-off task.** Without Serena, use
[`/optimize`](../optimize/SKILL.md) instead; it has fallback strategies.

---

## Usage

```
/context [action] [name]
```

### Quick Examples

```
/context load                    # Load all relevant memories for current project
/context list                    # Show all available memories
/context save architecture       # Create or update the architecture memory
/context refresh codebase-conventions  # Regenerate a stale memory
/context inspect                 # Show what's currently loaded + cache status
/context clear                   # Unload all memories from context
```

---

## Actions

Compact dispatch below. For the full process steps, parameters, and output formats of any
action, read **[references/actions.md](references/actions.md)**.

| Action | What it does | When to run |
|--------|--------------|-------------|
| `load` | Load core memories (`architecture`, `codebase-conventions`) + conditionally load module/testing/docker/deployment memories by task context | **Start of every session**, before code work |
| `list` | List all project memories with last-updated + load/cache status | To see what's available |
| `save [name]` | Gather context → structure as Markdown → write `.serena/memories/[name].md` | After learning something durable worth persisting |
| `refresh [name]` | Re-explore the code and **overwrite** an existing memory with current state | After a major refactor, a new module, or a memory >2 weeks old |
| `inspect` | Show loaded memories, token sizes, cache hit rate, and project/Serena/constitution status | To audit context + caching |
| `clear` | Unload all memories from the current conversation (does **not** delete files) | Switching projects or context is stale |
| `create [name]` | Interactive memory creation — asks what to document and how to structure it | When you want to build a memory step by step |

`save`/`create` follow the house memory structure and per-topic template catalog in
**[references/memory-templates.md](references/memory-templates.md)** — read it before writing a memory.

---

## Token Savings

| Without memories | With memories |
|-----------------|---------------|
| Read files per session | Load cached memories |
| ~15-25K tokens/session for context | ~1.5-2.5K tokens/session |
| 100% cost each time | 10% cost after first load (cached) |
| **Savings: 60-70% per session** | |

---

## Boundaries

**Always**
- Run `load` at the start of a session before code work — it's the whole point of the memory system.
- Keep memories concise and current; refresh anything stale (>2 weeks) after significant codebase changes.
- Follow the house memory structure in [references/memory-templates.md](references/memory-templates.md).

**Ask first**
- `refresh` and `save` **overwrite** an existing memory — confirm before discarding curated, user-authored content.
- Writing memories into a shared/team repo's `.serena/` (they become visible in diffs to teammates).

**Never**
- Delete memory files as part of `clear` — `clear` only unloads from context; the files stay on disk.
- Fabricate project facts into a memory; write only what you verified from the codebase or the user.
- Store secrets, tokens, or credentials in a memory.

---

## Troubleshooting

Common failure modes (no memories found, Serena not connected, memory outdated) and their
fixes are in **[references/troubleshooting.md](references/troubleshooting.md)**.

---

## See Also

- [`/optimize`](../optimize/SKILL.md) — Uses loaded context for token-efficient work; the fallback when Serena is unavailable
- [`/init-project`](../init-project/SKILL.md) — Creates initial memory set for a new project
- [`/cache-inspector`](../cache-inspector/SKILL.md) — Monitor cache performance
- [Project Activation Guide](../../../02-project-activation/guide.md)
