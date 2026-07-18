# /update-docs — Full Refresh Workflow, Token Budget & Troubleshooting

Read this when running a complete refresh cycle, budgeting a job, or hitting a fetch/edit problem. The `SKILL.md` core points here.

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
