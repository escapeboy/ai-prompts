---
name: sync-features
description: Scan the current project's codebase and sync its feature inventory across the Serena memories and the auto-memory MEMORY.md. Run after adding new domains, MCP tools, API endpoints, or major features. Project-agnostic — auto-detects the app layout.
disable-model-invocation: false
---

# Sync Features Inventory

Scan the **current** project's codebase and update its memory stores with current
feature counts and capabilities, then report what changed.

## When to Use (and When NOT to)

| Use this skill for | Use a simpler approach for |
|---|---|
| Syncing feature counts/inventory across a project's memory stores after real changes | Checking whether one specific feature exists — just grep/read the code |
| Periodic honesty pass on an inventory memory that's grown stale | A brand-new project with no memory stores yet — just write the first memory directly |
| Confirming a feature doesn't already exist before building it | A single quick count you won't persist anywhere |

> Generalized from the agent-fleet project skill. It adapts to whatever project it
> runs in — do NOT assume agent-fleet's `base/` layout or memory names.

## Step 0: Detect the project layout

Before scanning, resolve the app root and the available memory stores:

```bash
# App root: monorepo/submodule layout (e.g. agent-fleet) puts the app under base/
if [ -d base/app ]; then APP=base/app; DB=base/database; CFG=base/config; else APP=app; DB=database; CFG=config; fi
echo "APP=$APP"
```

- **Serena memories**: call `mcp__plugin_serena_serena__list_memories()` to see what
  this project actually has. Common inventory-bearing memories: `architecture`,
  `implementation-status`, `feature_inventory`, `project_overview`,
  `codebase_structure` — use whichever exist; do not invent ones that don't.
- **Auto-memory index**: the per-project `MEMORY.md` under
  `~/.claude/projects/<slug>/memory/` (loaded into context each session).
- **Feature-inventory file** (if the project keeps one): a `*feature*inventory*.md`
  under the project memory dir. If none exists and the project is large, propose
  creating one rather than assuming a path.

## Step 1: Scan the codebase

Adapt these to the detected `$APP`/`$DB`/`$CFG`. Skip counts for things the project
doesn't have (not every project has MCP tools or a versioned API):

```bash
ls -d $APP/Domain/*/ 2>/dev/null | wc -l                       # domains (DDD layout)
find $APP/Mcp/Tools -name "*Tool.php" 2>/dev/null | wc -l       # MCP tool files
ls -d $APP/Mcp/Tools/*/ 2>/dev/null | wc -l                     # MCP tool domains
ls $APP/Http/Controllers/Api/**/*Controller.php 2>/dev/null | wc -l  # API controllers
find $APP/Livewire -name "*.php" 2>/dev/null | wc -l            # Livewire components
ls $DB/migrations/*.php 2>/dev/null | wc -l                     # migrations
ls $CFG/*.php 2>/dev/null | wc -l                               # config files
```

Also list NEW domain dirs, MCP tool subdirs, and Livewire dirs not already in the
inventory. Prefer Glob/Grep over piping large `ls` output through context.

## Step 2: Read the current inventory

Read whichever stores exist (from Step 0): the project's feature-inventory memory,
the relevant Serena memories, and `MEMORY.md`.

## Step 3: Diff and identify changes

Compare scan results with the stored inventory. Track: new domains, new MCP
tools/domains, new API controllers, new Livewire pages, new capabilities, and
updated counts. Note items that moved from "not yet implemented" → done.

## Step 4: Update the stores

Update only the stores this project actually uses (native Write/Edit for files;
`mcp__plugin_serena_serena__write_memory` / `edit_memory` for Serena):

- **Serena memories** — update the scale/counts and domain lists in the
  inventory-bearing memories that exist.
- **MEMORY.md** — update the summary counts and (if present) the domain list.
- **Feature-inventory file** — update Platform Stats, the Domain Catalog, and the
  capabilities checklist; only if the project keeps such a file.

Keep edits targeted (append/replace specific lines) — never rewrite a large memory
wholesale just to bump a count.

## Step 5: Report

```
## Sync Complete

### Changes Detected
- Domains: <old> → <new> (+X)
- MCP Tools: <old> → <new> (+X)        # omit if N/A
- API Endpoints: <old> → <new> (+X)    # omit if N/A
- Livewire Pages: <old> → <new> (+X)
- Migrations: <old> → <new> (+X)

### New Capabilities
- [x] ...

### Stores Updated
- [x] <which Serena memories>
- [x] MEMORY.md
- [x] <feature-inventory file, if any>
```

If nothing changed, say so plainly and update nothing.

## When to run

- After implementing a new domain, MCP tool, or API controller
- Before proposing new features (verify they don't already exist)
- Periodically (e.g. weekly) to keep the inventory honest

## Notes

- This skill only **documents** — it never modifies application code.
- If the project has no DDD `Domain/` layout, no MCP tools, or no inventory memory,
  scan what's there and report; don't fabricate structure that isn't present.

## Boundaries

**Always**: Update only the memory stores that already exist for this project; report plainly when nothing changed.

**Ask first**: Nothing beyond the invocation itself — updating the project's memory stores is this skill's stated purpose.

**Never**: Modify application code. Never fabricate domains, counts, or structure that don't exist in the scanned codebase.

## Related
- [`init-project`](../init-project/SKILL.md) — creates the initial memories this skill keeps in sync.
- [`ctx`](../ctx/SKILL.md) — load and save the Serena memories this skill updates.
- [`codebase-memory`](../codebase-memory/SKILL.md) — faster discovery of new routes, tools and symbols during the scan.
