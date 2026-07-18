---
name: init-project
description: Initialize Claude Code optimization for a new project — detect stack, create memories, generate constitution, configure settings
version: 1.0.0
---

# /init-project — Project Initialization

Sets up Claude Code optimization for a new project in 10-15 minutes. Detects the tech stack, fetches best practices, creates Serena memories, generates a project constitution, and configures optimization settings.

Run once per project. After init, use `/optimize` and `/context load` for all subsequent work.

## When to Use This Skill (and When NOT to)

| Use this skill for | Use a simpler approach for |
|--------------------|----------------------------|
| A project you'll work in repeatedly and want optimized from the start | A repo you'll touch once — just read what you need and go |
| First-time setup of Serena memories + constitution + optimization config | Re-running work on an already-initialized project — use `/context load` + `/optimize` instead |
| A codebase whose conventions/architecture Claude should learn once and reuse | Adding a single memory or tweaking one setting — edit the file directly |
| Standing up the `.claude/` + `.serena/` scaffold in a fresh clone | A throwaway spike or scratch directory |

**Start simple. Reach for this skill only when the project is one you'll return to and the up-front setup pays back across many sessions.** Run it **once** per project — it is initialization, not a per-session command.

## Usage

```
/init-project [action] [options]
```

### Quick Examples

```
/init-project --full            # Complete initialization (recommended)
/init-project detect            # Just detect the stack
/init-project fetch rails       # Fetch best practices for a language/framework
/init-project constitution      # Generate constitution only
/init-project memories          # Initialize Serena memories only
/init-project optimize          # Configure optimization settings only
```

## Quick Start: Full Initialization

```
/init-project --full
```

This runs all steps in sequence and produces a fully configured project. Takes 10-15 minutes. After completion you'll have:

- `.serena/memories/architecture.md`
- `.serena/memories/codebase-conventions.md`
- `.serena/memories/testing-strategy.md`
- `.claude/settings/constitution.json`
- `.claude/settings/token-optimization.json` (project-level)
- `.claude/CLAUDE.md` (if it doesn't exist)

## Actions

Each action is a step of `--full` and can also be run on its own. High-level decision core below; deep detail lives in `references/` — read the linked file only when running that action.

### `detect` — Auto-detect project type and stack

Scans the project directory to identify the tech stack, frameworks, test runner, CI, and conventions, then recommends which memories and constitution rules to create.

```
/init-project detect
```

For the full list of files scanned and the sample output format, read [references/detection.md](references/detection.md).

### `fetch [framework]` — Fetch best practices for your stack

Fetches current best practices, conventions, and anti-patterns for the detected or specified framework, summarized into memory-ready format.

```
/init-project fetch rails
```

For the supported-stack table, the fetch process, and per-framework CLAUDE.md templates, read [references/frameworks.md](references/frameworks.md).

### `constitution` — Generate project constitution

Creates `.claude/settings/constitution.json` with architectural rules tailored to the detected stack.

```
/init-project constitution
/init-project constitution --framework rails
/init-project constitution --framework nextjs --strict
```

For the constitution JSON anatomy and the per-framework rule sets, read [references/constitution.md](references/constitution.md).

### `memories` — Initialize Serena memories

Creates the initial Serena memories by analyzing the codebase: `architecture.md`, `codebase-conventions.md`, and `testing-strategy.md` in `.serena/memories/`. Requires Serena MCP.

```
/init-project memories
```

For the exact contents of each memory file, read [references/memories.md](references/memories.md).

### `optimize` — Configure project-level optimization settings

Creates `.claude/settings/token-optimization.json` with project-specific overrides of the global token optimization settings:
- Which memories to always load
- Constitution rules to enforce
- Model selection overrides (e.g., always use Haiku for migrations)
- Project-specific checkpoint locations

```
/init-project optimize
```

## CLAUDE.md Generation

If no `CLAUDE.md` exists, `--full` will create one:

```
/init-project --full
```

The generated `CLAUDE.md` includes:
- Project overview and stack summary
- Development workflow (setup, testing, deployment)
- Key conventions (based on constitution)
- Common commands
- Links to Serena memories for architecture details

## After Initialization

Once init is complete, start working:

```bash
# Load context at the start of every session
/context load

# Start work with full optimization
/optimize "your task description"

# Check everything is working
/optimize status
```

## Time Estimate

| Action | Time |
|--------|------|
| `detect` | ~30 sec |
| `fetch [framework]` | ~2 min |
| `constitution` | ~2 min |
| `memories` (3 files) | ~8 min |
| `optimize` | ~1 min |
| `--full` (all steps) | 10-15 min |

Troubleshooting for failed detection, missing Serena, and constitution conflicts: [references/troubleshooting.md](references/troubleshooting.md).

## Boundaries

**Always**
- Run `detect` before generating a constitution or memories — the output is tailored to the detected stack.
- Reflect the codebase's actual conventions in `codebase-conventions.md`, not just framework defaults.
- Treat init as a one-time setup; on an already-initialized project use `/context load` + `/optimize` instead of re-running.

**Ask first**
- Overwriting an existing `CLAUDE.md`, `constitution.json`, or `token-optimization.json` — these may hold hand-tuned rules. Confirm before replacing; prefer merging.
- Committing the generated `.claude/` / `.serena/` files to a shared/team repo (they become visible in diffs and to teammates).
- Generating a `--strict` constitution that conflicts with the current codebase — surface the conflict and offer `--lenient` rather than imposing rules the code already violates.

**Never**
- Fabricate stack details the scan didn't find — if detection fails, ask or use `fetch [framework] --force`, don't guess.
- Silently discard a user's existing memories or settings.
- Re-run `--full` on an initialized project as a shortcut instead of loading its existing context.

## See Also

- [`/context`](../context/SKILL.md) — Load memories after init
- [`/optimize`](../optimize/SKILL.md) — Start optimized work sessions
- [Project Activation Guide](../../../02-project-activation/guide.md)
- [Custom Skills Guide](../../../03-custom-skills/guide.md)
- References: [detection](references/detection.md) · [frameworks](references/frameworks.md) · [constitution](references/constitution.md) · [memories](references/memories.md) · [troubleshooting](references/troubleshooting.md)
