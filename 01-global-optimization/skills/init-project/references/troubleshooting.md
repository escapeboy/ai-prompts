# Troubleshooting & time estimates

Read this when a step fails or when you need per-action timing.

## Troubleshooting

### "Stack not detected"

```
/init-project detect
# → Could not detect stack automatically
```

Specify manually:
```
/init-project fetch [framework] --force
```

### "Serena not available"

`memories` step requires Serena MCP. The other steps (`constitution`, `optimize`) work without it. Install Serena and run `/init-project memories` separately.

### "Constitution conflicts with existing code"

The generated constitution reflects best practices, not necessarily your current codebase. Either:
- Use `--lenient` flag to generate more permissive rules
- Edit `.claude/settings/constitution.json` manually after generation

## Time Estimate

| Action | Time |
|--------|------|
| `detect` | ~30 sec |
| `fetch [framework]` | ~2 min |
| `constitution` | ~2 min |
| `memories` (3 files) | ~8 min |
| `optimize` | ~1 min |
| `--full` (all steps) | 10-15 min |
