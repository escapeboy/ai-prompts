---
name: cache-inspector
description: "Analyze prompt cache hit rates, estimate cost savings from cached system prompts and memories, and recommend improvements to caching strategy. Use when checking cache performance, investigating high token costs, optimizing cache hit rates, or diagnosing slow cache warmup."
---

# /cache-inspector — Prompt Cache Monitor

Inspects Claude prompt caching to report hit rates, cost savings, and optimization opportunities. Prompt caching saves up to 90% on re-reads of system prompts, tool definitions, and Serena memories.

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
```

## Actions

### `status` (default) — Current cache status

1. List all active cache entries with content name, token size, cache state (cached/warming/expired), and remaining TTL.
2. Show session stats: hit count, miss count, hit rate percentage, estimated tokens saved.
3. Rate overall cache health (poor/good/excellent based on hit rate).

### `analyze` — Performance analysis

1. Show hit rate trend across the current and recent sessions.
2. Calculate cost impact: estimated cost without caching vs actual cost with caching.
3. Rank cached content by frequency of access and hit rate.
4. Identify optimization opportunities (e.g., content below the 1024-token cache threshold, direct file reads bypassing cache).

### `optimize` — Actionable recommendations

1. Analyze current usage patterns.
2. Generate prioritized recommendations:
   - **Pre-warm cache**: run `/context load` at session start if memories aren't loaded.
   - **Expand small memories**: content under 1024 tokens is ineligible for caching — suggest expanding or merging.
   - **Reduce direct reads**: identify file reads that could use cached memories instead.
3. Estimate the hit rate improvement for each recommendation.
4. **Verify**: after user applies recommendations, re-run `status` to confirm improvement.

### `report` — Full detailed report

Generates a complete cache performance report covering hit rate history, cost breakdown, content inventory, TTL timeline, optimization score, and all recommendations. Optionally saves to `.claude/learnings/cache-performance.md` with `--save`.

### `clear` — Clear cache entries

Clears all cached content. Only use for testing or when cache is stale. Prompts for confirmation before clearing. After clearing, the next session re-warms the cache at full token cost.

## Key Reference

- **Minimum cache size**: content must be ≥1024 tokens to be eligible.
- **Cache TTL**: ephemeral cache lasts 10 minutes; with explicit `cache_control` it lasts up to 60 minutes.
- **Configuration**: `~/.claude/settings/prompt-caching.json` controls which content types are cached and minimum token thresholds.

## See Also

- [`/context`](../context/SKILL.md) — Load memories to maximize cache hits
- [`/optimize`](../optimize/SKILL.md) — Full optimization mode
- [Token Optimization Guide](../../../05-token-optimization/guide.md)
