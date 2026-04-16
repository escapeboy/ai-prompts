---
name: cache-inspector
description: Analyze prompt cache hit rates, estimate cost savings from cached system prompts and memories, and recommend improvements to caching strategy. Use when checking cache performance, investigating high token costs, optimizing cache hit rates, or diagnosing slow cache warmup.
version: 1.0.0
---

# /cache-inspector — Prompt Cache Monitor

Inspects the Claude prompt caching system to report hit rates, cost savings, and optimization opportunities. Prompt caching saves 90% on re-reads of large content (system prompts, memories, tool definitions).

---

## Usage

```
/cache-inspector [action]
```

### Quick Examples

```
/cache-inspector             # Show current status (default)
/cache-inspector status      # Detailed cache status
/cache-inspector analyze     # Performance analysis with trends
/cache-inspector optimize    # Get actionable recommendations
/cache-inspector report      # Full report (save to file)
/cache-inspector clear       # Clear cache (for testing only)
```

---

## Actions

### `status` (default) — Current cache status

Shows the current state of the prompt cache.

```
/cache-inspector status
```

**Output**:
```
## Prompt Cache Status

### Active Cache Entries
| Content | Size | Status | TTL |
|---------|------|--------|-----|
| System prompt (global-optimization.md) | 3.2K tokens | CACHED ✅ | 58 min |
| Tool definitions (Serena MCP) | 8.4K tokens | CACHED ✅ | 55 min |
| memory: architecture.md | 2.1K tokens | CACHED ✅ | 52 min |
| memory: codebase-conventions.md | 1.8K tokens | CACHED ✅ | 52 min |
| memory: testing-strategy.md | 1.2K tokens | WARMING 🟡 | — |

### Session Stats
Cache hits: 47 / 54 reads (87%)
Tokens saved this session: 412K
Estimated cost saved: $1.24

### Cache Health: ✅ Excellent
```

---

### `analyze` — Performance analysis

Deep analysis of cache performance with trends and comparison to baselines.

```
/cache-inspector analyze
```

**Output**:
```
## Cache Performance Analysis

### Hit Rate Trend
Session 1: 45% (warming)
Session 2: 71% (good)
Session 3: 87% (excellent) ← current
Target: >80% ✅

### Cost Impact
Without caching (estimated): $3.82
With caching (actual): $0.58
Savings: $3.24 (85%)

### Most Cached Content
1. Tool definitions (Serena): 8.4K — 12 reads, 11 cache hits (92%)
2. System prompt: 3.2K — 8 reads, 8 cache hits (100%)
3. architecture.md: 2.1K — 15 reads, 13 cache hits (87%)

### Optimization Opportunities
⚠️ testing-strategy.md: loaded 4 times but never cached (too small at 800 tokens)
   → Recommend expanding to >1024 tokens or combining with codebase-conventions.md

⚠️ 3 file reads bypassed caching (used Read tool directly)
   → Use /context load at session start to ensure memories are pre-cached
```

---

### `optimize` — Get actionable recommendations

Analyzes current usage and provides specific recommendations to improve cache hit rate.

```
/cache-inspector optimize
```

**Output**:
```
## Cache Optimization Recommendations

### Priority 1: Pre-warm Cache at Session Start
Current: Cache warms gradually (first 3-4 messages cost full tokens)
Fix: Always run /context load before starting work

Expected improvement: +15% hit rate, -30K tokens per session

### Priority 2: Expand Small Memories
testing-strategy.md (800 tokens) is below the 1024-token cache threshold
Fix: Add more detail or merge with codebase-conventions.md

Expected improvement: +8% hit rate on test-related tasks

### Priority 3: Cache Constitution File
.claude/settings/constitution.json is read 6 times without caching
Fix: Move architectural rules to a memory file via /context save constitution

Expected improvement: +5% hit rate on all tasks

### Current Score: 72/100
After applying recommendations: 89/100 (estimated)
```

---

### `report` — Full detailed report

Generates a complete cache performance report and saves it to `.claude/learnings/cache-performance.md`.

```
/cache-inspector report
/cache-inspector report --save    # Also saves to file
```

The report includes:
- Session-by-session hit rate history
- Cost breakdown (cached vs uncached reads)
- Content inventory with sizes
- TTL expiry timeline
- Optimization score
- All recommendations

---

### `clear` — Clear cache entries

**Warning**: Clears all cached content. Only use for testing or when cache is stale.

```
/cache-inspector clear
```

Claude will ask for confirmation before clearing. After clearing, the next session will re-warm the cache (costs full tokens once).

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

---

## Troubleshooting

### "Cache hit rate is low (<50%)"

Common causes:
1. **Not loading memories first** — run `/context load` before starting work
2. **Sessions too short** — cache needs 2-3 messages to warm up
3. **Content below threshold** — memories under 1024 tokens won't cache
4. **Different content each time** — variable prompts can't be cached

Run `/cache-inspector optimize` for specific recommendations.

### "Cache entries expire quickly"

Cache TTL is 10-60 minutes. For long sessions:
- Keep the conversation active (don't idle for >10 min)
- Re-run `/context load` if you've been away

### "No cache data available"

Cache metrics are only available when Serena MCP is connected and prompt-caching.json is configured. Run `/optimize status` to check configuration.

---

## See Also

- [`/context`](../context/SKILL.md) — Load memories to maximize cache hits
- [`/optimize`](../optimize/SKILL.md) — Full optimization mode
- [Token Optimization Guide](../../../05-token-optimization/guide.md)
- [Prompt Caching Config](../../settings/prompt-caching.json)
