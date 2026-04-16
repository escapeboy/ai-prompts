---
name: update-docs
description: Search the web for latest Claude API changes, compare findings to existing documentation, and apply targeted updates to keep prompts and configs current. Use when docs are outdated, after a Claude API update, to refresh system prompts, or to validate documentation accuracy.
version: 1.0.0
---

# /update-docs — Documentation Updater

Keeps your Claude Code configuration documentation current with the latest Claude API changes, best practices, and framework updates. Searches the web, compares findings to existing docs, and applies targeted updates.

Especially useful for keeping `~/.claude/` system prompts, skill files, and project memories accurate after Claude API updates.

---

## Usage

```
/update-docs [action] [target]
```

### Quick Examples

```
/update-docs                           # Interactive mode — ask what to update
/update-docs research "prompt caching" # Search web for latest info
/update-docs collect https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
/update-docs analyze                   # Compare findings to existing docs
/update-docs update global-optimization.md
/update-docs update --scope global     # Update all global docs
/update-docs validate                  # Check docs for outdated content
```

---

## Actions

### `research [topic]` — Search web for latest patterns

Searches for current documentation, changelog entries, and community best practices on the given topic.

```
/update-docs research "Claude prompt caching"
/update-docs research "Serena MCP latest features"
/update-docs research "token efficient tools beta"
/update-docs research "Claude Code skills format"
```

**Process**:
1. Web search for official docs, Anthropic changelog, GitHub issues
2. Identify version-specific changes and deprecations
3. Extract actionable guidance
4. Store findings as a research summary

**Output**:
```
## Research: Claude Prompt Caching

### Sources Found
- https://docs.claude.com/en/docs/build-with-claude/prompt-caching (official, current)
- https://docs.claude.com/en/docs/about-claude/pricing (cache pricing multipliers)

### Key Facts
1. Two TTL tiers: 5-minute (default) and 1-hour (opt-in via `cache_control: { type: "ephemeral", ttl: "1h" }`).
2. Pricing multipliers: 5m write 1.25× base input, 1h write 2.00× base input, cache hit 0.10× base input.
3. Automatic caching: a single top-level `cache_control` field auto-applies a breakpoint to the last cacheable block — no per-block setup.
4. Mixed TTLs are supported in the same request; usage block reports `ephemeral_5m_input_tokens` and `ephemeral_1h_input_tokens` separately.
5. Caching is supported on all active Claude models.

### Common Outdated Content to Look For
- "Cache TTL: 10 minutes" — never existed; it has always been 5m default + 1h opt-in.
- "ttl_minutes: 60" — internal field name only; the API surface is `ttl: "1h"`.
- References to a legacy `cache-warming` or `extended-cache` beta header — none currently active.

Run /update-docs analyze to see full comparison.
```

---

### `collect [url]` — Fetch content from a specific URL

Fetches and extracts relevant content from a specific documentation URL.

```
/update-docs collect https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
/update-docs collect https://github.com/oraios/serena/blob/main/README.md
```

**Process**:
1. Fetch URL content
2. Extract key technical information
3. Summarize relevant sections
4. Add to research findings for `analyze` step

---

### `analyze` — Compare findings to existing docs

Compares research findings or collected content to your existing documentation and reports discrepancies.

```
/update-docs analyze
/update-docs analyze --target ~/.claude/system-prompts/global-optimization.md
```

**Output**:
```
## Documentation Analysis

### Comparing against: ~/.claude/system-prompts/global-optimization.md

OUTDATED sections:
- Line 45: References "Cache TTL: 10 minutes" → never existed; cache is 5m default / 1h opt-in
- Line 112: Lists claude-sonnet-4-5 as latest → claude-sonnet-4-6 released
- Line 203: token-efficient-tools-2025-02-19 beta header → no-op on Claude 4+, remove

MISSING sections:
- No mention of adaptive thinking (`thinking: { type: "adaptive" }`) — replaces deprecated `thinking_budget_tokens`
- No mention of context-management-2025-06-27 (clear_thinking + clear_tool_uses)
- No mention of server-side compaction or Fast mode

UP TO DATE:
- Prompt caching setup instructions ✅
- Haiku/Sonnet/Opus model selection ✅
- Symbol-first protocol ✅

Recommendation: 3 sections need updates. Run /update-docs update to apply.
```

---

### `update [target]` — Apply updates to documentation

Updates a specific file or set of files based on research findings.

```
/update-docs update global-optimization.md
/update-docs update prompt-caching.json
/update-docs update --scope global         # Update all ~/.claude/ docs
/update-docs update --scope memories       # Update Serena memories
/update-docs update --dry-run              # Preview changes without applying
```

**Scope options**:
| Scope | Files updated |
|-------|--------------|
| `global` | All `~/.claude/` documentation and skills |
| `memories` | All Serena memories in `.serena/memories/` |
| `settings` | JSON config files in `~/.claude/settings/` |
| `project` | Current project's `.claude/` documentation |

**Process**:
1. Load the target file
2. Apply only the changes identified in `analyze`
3. Preserve existing structure and formatting
4. Show diff of what changed
5. **Verify**: re-read the updated file (or run a regression grep) to confirm the change landed and didn't introduce broken JSON / fence parity issues before reporting done

---

### `validate` — Check documentation for outdated content

Scans documentation for common staleness indicators without requiring prior research.

```
/update-docs validate
/update-docs validate --path ~/.claude/
/update-docs validate --path .serena/memories/
```

**Checks performed**:
- Model IDs that no longer exist (e.g., old Haiku/Sonnet versions)
- API beta headers that may have graduated to stable
- URLs that return 404 or redirect
- Date-stamped content older than 90 days
- Deprecated patterns (e.g., old tool formats)

**Output**:
```
## Documentation Validation Report

Files scanned: 12
Issues found: 4

WARNINGS:
⚠️ global-optimization.md:45 — model ID "claude-haiku-4-5" may be outdated
⚠️ beta-features.json:12 — beta header "token-efficient-tools-2025-02-19" is a no-op on Claude 4+, remove
⚠️ architecture.md — last updated 47 days ago, consider refreshing

ERRORS:
❌ system-prompts/symbol-first-protocol.md:83 — URL returns 404
   → https://docs.anthropic.com/old-tools-format (moved)

Run /update-docs research [topic] to investigate specific warnings.
```

---

## Workflow: Full Documentation Refresh

Recommended monthly workflow:

```bash
# Step 1: Research recent changes
/update-docs research "Claude API changelog 2026"
/update-docs research "Serena MCP updates"

# Step 2: Validate existing docs
/update-docs validate --path ~/.claude/

# Step 3: Analyze specific files
/update-docs analyze --target ~/.claude/system-prompts/global-optimization.md

# Step 4: Apply updates
/update-docs update --scope global --dry-run   # Preview first
/update-docs update --scope global              # Apply

# Step 5: Update Serena memories
/update-docs update --scope memories
```

---

## Token Optimization

This skill is designed to be efficient:
- Uses web search sparingly (only when needed)
- Caches research findings within the session
- Applies targeted edits rather than rewriting entire files
- Skips files that are already up to date

**Typical token usage**:
- `research [topic]`: ~3-8K tokens (includes web search)
- `analyze`: ~2-4K tokens
- `update [file]`: ~2-5K tokens per file
- `validate`: ~1-3K tokens

---

## Troubleshooting

### "No changes needed"

Your docs are up to date. Run `/update-docs validate` monthly to stay current.

### "URL fetch failed"

Some documentation sites block automated fetches. Try:
```
/update-docs collect [alternative-url]
```
Or search for the content manually and paste into the conversation.

### "Changes look wrong"

Use `--dry-run` to preview before applying:
```
/update-docs update --dry-run global-optimization.md
```

---

## See Also

- [`/init-project`](../init-project/SKILL.md) — Initial docs setup for a new project
- [`/context refresh`](../context/SKILL.md) — Refresh Serena memories specifically
- [Research Integration Guide](../../../04-research-integration/guide.md)
