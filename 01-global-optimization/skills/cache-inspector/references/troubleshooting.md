# cache-inspector — Troubleshooting

Symptoms and fixes for common cache problems. Read when the numbers look wrong; the SKILL.md
core routes here rather than carrying these cases inline.

---

## "Cache hit rate is low (<50%)"

Common causes:
1. **Not loading memories first** — run `/context load` before starting work
2. **Sessions too short** — cache needs 2-3 messages to warm up
3. **Content below threshold** — memories under 1024 tokens won't cache
4. **Different content each time** — variable prompts can't be cached

Run `/cache-inspector optimize` for specific recommendations.

## "Cache entries expire quickly"

Cache TTL is 10-60 minutes. For long sessions:
- Keep the conversation active (don't idle for >10 min)
- Re-run `/context load` if you've been away

## "No cache data available"

Cache metrics are only available when Serena MCP is connected and prompt-caching.json is configured. Run `/optimize status` to check configuration.
