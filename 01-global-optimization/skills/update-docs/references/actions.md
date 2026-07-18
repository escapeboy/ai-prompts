# /update-docs — Action Reference

Full per-action detail: process steps, primary sources, output formats, and the rules that apply when editing. The `SKILL.md` core dispatches here — read only the action you're running.

Fetching note (applies to `research` and `collect`): prefer **Lattice** for browser/search if available; otherwise plain `WebFetch` is intercepted by the context-mode hook — use `ctx_fetch_and_index(url, source)` then `ctx_search`.

---

## `research [topic]` — Search web for latest patterns

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

## `collect [url]` — Fetch content from a specific URL

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

## `analyze` — Compare findings to existing docs

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

## `update [target]` — Apply updates to documentation

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

## `validate` — Check documentation for outdated content

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
