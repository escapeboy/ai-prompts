# /ctx — Troubleshooting

Fixes for the common failure modes of the memory system. Read this when a `/ctx`
action reports one of the symptoms below.

---

## "No memories found"

```
/ctx list
# → No memories found for this project
```

**Fix**: Initialize with `/init-project memories` or create manually:
```
/ctx save architecture
/ctx save codebase-conventions
```

---

## "Serena not connected"

Context management requires the Serena MCP server. Check MCP availability with `/help`.
Without Serena, use `/optimize` which has fallback strategies.

---

## "Memory is outdated"

```
/ctx refresh [memory-name]
```

Memories older than 2 weeks should be refreshed after significant codebase changes.
