---
name: update-docs
description: Search the web for latest Claude API changes, compare findings to existing documentation, and apply targeted updates to keep prompts and configs current. Use when docs are outdated, after a Claude API update, to refresh system prompts, or to validate documentation accuracy.
version: 1.1.0
---

# /update-docs — Documentation Updater

Keeps your Claude Code configuration documentation current with the latest Claude API changes, best practices, and framework updates. Searches the web, compares findings to existing docs, and applies targeted updates.

Especially useful for keeping `~/.claude/` system prompts, skill files, and project memories accurate after Claude API updates.

> **Scope**: `/update-docs` handles **external freshness** — API / model / pricing / beta-header drift sourced from the web. For **internal consistency** (dead links, README↔CHANGELOG version parity, terminology, stray Cyrillic, privacy leaks) use [`/content-review`](../../../07-custom-commands/content-review.md) instead. The two are complementary, not overlapping — don't duplicate content-review's checks here.

---

## When to Use This Skill (and When NOT to)

| Use this skill for | Use a simpler approach for |
|--------------------|----------------------------|
| Refreshing docs after a Claude API / model / pricing / beta-header change | Fixing a single known-stale value you already have the correct source for — just edit it |
| A periodic sweep for staleness across `~/.claude/`, skills, or memories | Internal-consistency issues (dead links, version parity, terminology) → [`/content-review`](../../../07-custom-commands/content-review.md) |
| Comparing live web/authoritative facts against what the docs currently claim | A fact you can confirm from the bundled `claude-api` skill in one read — read it and edit |
| A multi-file update that must stay in sync (frontmatter + config + compat lines + pricing tables) | A one-line typo or wording tweak with no external source to verify |

**Start simple. Reach for this skill only when the update depends on *external* freshness you have to research, or spans enough files that a systematic research → analyze → update pass beats hand-editing.**

---

## Usage

```
/update-docs [action] [target]
```

### Quick Examples

```
/update-docs                           # Default: analyze (read-only drift check, no edits)
/update-docs research "prompt caching" # Search web for latest info
/update-docs collect https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
/update-docs analyze                   # Compare findings to existing docs
/update-docs update global-optimization.md
/update-docs update --scope global     # Update all global docs
/update-docs validate                  # Check docs for outdated content
```

---

## Actions

Five actions, run individually or chained research → analyze → update. **Full process steps, primary sources, output formats, scope table, and the per-action editing rules live in [references/actions.md](references/actions.md) — read the row for the action you're running.**

| Action | What it does | One-line summary |
|--------|--------------|------------------|
| `research [topic]` | Search web for latest patterns | Fetch authoritative sources, extract version changes + deprecations, store findings |
| `collect [url]` | Fetch content from a specific URL | Pull + summarize one doc page into the research findings |
| `analyze` | Compare findings to existing docs | Report OUTDATED / MISSING / UP-TO-DATE sections against a target file (default action) |
| `update [target]` | Apply targeted updates | Edit only the `analyze`-identified changes, preserve structure, show diff, then **verify** |
| `validate` | Scan for staleness | Flag dead model IDs, graduated beta headers, 404 URLs, >90-day content — no research needed |

Fetching: prefer **Lattice** for browser/search if available; plain `WebFetch` is intercepted by the context-mode hook — use `ctx_fetch_and_index(url, source)` + `ctx_search` instead (this is expected, not an error).

For the recommended monthly full-refresh workflow, token budget, and troubleshooting, see [references/workflow.md](references/workflow.md).

---

## Boundaries

**Always**
- After an `update`, **verify**: re-read the file (or run a regression grep) to confirm the change landed and didn't break JSON / fence parity before reporting done.
- Lead with authoritative primary sources (platform.claude.com, the bundled `claude-api` skill) — not community mirrors — for any model / pricing / API fact.
- When editing the `ai-prompts` repo, ship the change as the four synced Releasing artifacts (CHANGELOG + README Version History & footer + annotated tag + GitHub Release; see repo `CLAUDE.md` → "Releasing").

**Ask first**
- Bulk `update --scope global` / `--scope memories` (edits across many files at once) — preview with `--dry-run` and confirm before applying.
- Publishing a release (pushing the annotated tag + creating the GitHub Release) — shared-state and hard to reverse; sweep for private references first.

**Never**
- Retro-edit historical records — model IDs, prices, and dates inside CHANGELOG entries, README "Version History", and any `.backups/` directory are frozen. Only touch live/current claims.
- Duplicate `/content-review`'s internal-consistency checks — this skill owns external freshness only.
- Treat a blocked `WebFetch` as a failure — route through Lattice or `ctx_fetch_and_index` instead.

---

## See Also

- [references/actions.md](references/actions.md) — full per-action detail (process, primary sources, output formats, editing rules)
- [references/workflow.md](references/workflow.md) — monthly full-refresh workflow, token budget, troubleshooting
- [`/content-review`](../../../07-custom-commands/content-review.md) — complementary: internal consistency (dead links, version parity), where this skill owns external freshness
- [`/init-project`](../init-project/SKILL.md) — Initial docs setup for a new project
- [`/context refresh`](../context/SKILL.md) — Refresh Serena memories specifically
- [Research Integration Guide](../../../04-research-integration/guide.md)
- [Custom Skills Guide](../../../03-custom-skills/guide.md) — how these skills are authored
