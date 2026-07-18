# cache-inspector — Caching internals, configuration & target metrics

Background reference for how Claude's prompt cache behaves, where it is configured, and the
numbers that define a healthy cache. The SKILL.md core does not need this to decide which
action to run — read it when diagnosing *why* the cache behaves as it does or when tuning it.

---

## How Prompt Caching Works

Claude's prompt caching (Anthropic API feature) stores frequently-read content server-side for 10 minutes (ephemeral) or 1 hour (with explicit cache control).

**What gets cached**:
| Content | Size | Cache benefit |
|---------|------|---------------|
| System prompts | 2-5K tokens | 90% cost reduction on re-reads |
| MCP tool definitions | 5-15K tokens | 90% cost reduction |
| Serena memories | 1-3K each | 90% cost reduction |
| Constitution files | 0.5-2K | 90% cost reduction |
| Large spec documents | 5-20K | 90% cost reduction during impl |

**Minimum size**: Content must be ≥1024 tokens to be eligible for caching.

**Cache TTL**: Two tiers via `cache_control: { type: "ephemeral" }` — `ttl: "5m"` (default) or `ttl: "1h"` (opt-in). Pricing: 5m write `1.25×` base input, 1h write `2.00×`, cache hit `0.10×`. Mixed TTLs in the same request are reported separately as `ephemeral_5m_input_tokens` / `ephemeral_1h_input_tokens`.

---

## Cache Configuration

The cache is configured in `~/.claude/settings/prompt-caching.json`. Key settings:

```json
{
  "cache_control": {
    "type": "ephemeral",
    "auto_enable": true
  },
  "caching_rules": {
    "system_prompts": { "enabled": true, "min_tokens": 1024 },
    "tool_definitions": { "enabled": true, "min_tokens": 1024 },
    "memories": { "enabled": true, "min_tokens": 1024 }
  }
}
```

To modify: edit `~/.claude/settings/prompt-caching.json` and reload Claude Code.

---

## Target Metrics

| Metric | Poor | Good | Excellent |
|--------|------|------|-----------|
| Cache hit rate | <50% | 60-80% | >80% |
| Token savings | <30% | 50-70% | >80% |
| Session cost | >$3 | $0.75-$1.50 | <$0.75 |
| Warmup time | >5 messages | 2-4 messages | 1-2 messages |
