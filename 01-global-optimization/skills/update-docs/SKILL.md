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

### `research [topic]` — Search web for latest patterns

Searches for current documentation, changelog entries, and community best practices on the given topic.

```
/update-docs research "Claude prompt caching"
/update-docs research "Serena MCP latest features"
/update-docs research "token efficient tools beta"
/update-docs research "Claude Code skills format"
```

**Process**:
1. Search + fetch the authoritative sources (see **Primary sources** below). Prefer **Lattice** for browser/search if it is available; otherwise note that plain `WebFetch` is intercepted by context-mode — use `ctx_fetch_and_index(url, source)` then `ctx_search`.
2. Identify version-specific changes and deprecations
3. Extract actionable guidance
4. Store findings as a research summary

**Primary sources** (authoritative for model/API facts — lead with these, not community mirrors like fastmcp.me):
- `platform.claude.com/docs/en/about-claude/models/overview` — current lineup + model IDs
- `platform.claude.com/docs/en/about-claude/pricing` — per-model pricing, including introductory rates and their end dates
- `platform.claude.com/docs/en/about-claude/models/migration-guide` — breaking API changes per model
- the bundled **`claude-api`** skill — the in-harness source of truth for IDs / pricing / params (read it before editing any model fact; it has no file on disk to grep)

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
1. Fetch URL content — prefer **Lattice** if available; otherwise use `ctx_fetch_and_index(url, source)` (plain `WebFetch` is intercepted by context-mode)
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

OUTDATED sections (sweep the known drift hotspots first):
- Pricing tables — verify $/MTok against the live pricing page, including any introductory rates
- Model IDs in skill/agent frontmatter and config examples — bump superseded IDs to the current release (but NOT in historical records — see the `update` rules)
- Compatibility lines in section READMEs + the README footer
- Beta-header / API-param tables — flag headers that have graduated to GA and become a no-op

MISSING sections:
- A newly released model tier or a changed default (e.g. a new current Sonnet/Opus)
- New API params or beta headers introduced since the last refresh

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

**Rules when applying updates**:
- **Never retro-edit historical records.** Model IDs, prices, and dates inside CHANGELOG entries, README "Version History", and any `.backups/` directory are frozen records — leave them exactly as written. Only touch live/current claims: frontmatter, config examples, compatibility lines, and pricing-reference tables.
- **When updating the `ai-prompts` repo, follow the Releasing convention** (repo `CLAUDE.md` → "Releasing"): every change ships as four synced artifacts — CHANGELOG entry, README "Version History" entry + footer version bump (and the `current: vX.Y.Z` line in the repo `CLAUDE.md`), an annotated git tag, and a GitHub Release.

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

> These are **per-action** figures. A **full refresh that ends in a release** (research → analyze → update across many files → CHANGELOG/README parity → tag + GitHub Release) is a multi-step, sometimes multi-hour job — budget for that, not a single-digit-K cycle.

---

## Troubleshooting

### "No changes needed"

Your docs are up to date. Run `/update-docs validate` monthly to stay current.

### "URL fetch failed" or "WebFetch blocked"

`WebFetch` is intercepted by the context-mode hook — that's expected, not an error. Fetch via **Lattice** (if available) or `ctx_fetch_and_index(url, source)` + `ctx_search` instead. If a site blocks automated fetches entirely, try an alternative URL:
```
/update-docs collect [alternative-url]
```
Or search for the content manually and paste it into the conversation.

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
