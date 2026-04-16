---
name: update-docs
description: "Search the web for latest Claude API changes, compare findings to existing documentation, and apply targeted updates to keep prompts and configs current. Use when docs are outdated, after a Claude API update, to refresh system prompts, or to validate documentation accuracy."
---

# /update-docs — Documentation Updater

Keeps Claude Code configuration documentation current with the latest Claude API changes, best practices, and framework updates. Searches the web, compares findings to existing docs, and applies targeted updates.

## Usage

```
/update-docs [action] [target]
```

### Quick Examples

```
/update-docs                           # Interactive — ask what to update
/update-docs research "prompt caching" # Search web for latest info
/update-docs collect https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
/update-docs analyze                   # Compare findings to existing docs
/update-docs update global-optimization.md
/update-docs validate                  # Check docs for outdated content
```

## Actions

### `research [topic]` — Search web for latest patterns

1. Web search for official docs, Anthropic changelog, GitHub issues on the given topic.
2. Identify version-specific changes and deprecations.
3. Extract actionable guidance.
4. Store findings as a research summary for the `analyze` step.

### `collect [url]` — Fetch content from a specific URL

1. Fetch and extract relevant technical content from the URL.
2. Summarize key sections.
3. Add to research findings for the `analyze` step.

### `analyze` — Compare findings to existing docs

1. Load research findings from prior `research` or `collect` calls.
2. Compare against target documentation files.
3. Report sections that are **outdated**, **missing**, or **up to date**.
4. Recommend which files need updates.

```
/update-docs analyze
/update-docs analyze --target ~/.claude/system-prompts/global-optimization.md
```

### `update [target]` — Apply updates to documentation

1. Load the target file(s).
2. Apply only the changes identified in `analyze`.
3. Preserve existing structure and formatting.
4. Show diff of what changed.
5. **Verify**: re-read updated file to confirm changes are correct before reporting done.

Scope options: `global` (all `~/.claude/` docs), `memories` (Serena memories), `settings` (JSON configs), `project` (current project `.claude/` docs).

Use `--dry-run` to preview changes without applying.

### `validate` — Check docs for outdated content

Scans documentation for staleness indicators without requiring prior research:

- Model IDs that no longer exist
- API beta headers that may have graduated to stable
- URLs that return 404 or redirect
- Date-stamped content older than 90 days
- Deprecated patterns

## Workflow: Full Documentation Refresh

Recommended monthly:

```bash
/update-docs research "Claude API changelog 2026"
/update-docs validate --path ~/.claude/
/update-docs analyze --target ~/.claude/system-prompts/global-optimization.md
/update-docs update --scope global --dry-run   # Preview first
/update-docs update --scope global              # Apply
```

## See Also

- [`/init-project`](../init-project/SKILL.md) — Initial docs setup for a new project
- [`/context refresh`](../context/SKILL.md) — Refresh Serena memories specifically
- [Research Integration Guide](../../../04-research-integration/guide.md)
