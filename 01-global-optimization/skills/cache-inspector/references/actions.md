# cache-inspector — Actions (full detail)

Full behaviour and example output for each `/cache-inspector` action. The SKILL.md core
lists the one-line purpose of each; read this file for the exact output shape and options.

---

## `status` (default) — Current cache status

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

## `analyze` — Performance analysis

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

## `optimize` — Get actionable recommendations

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

## `report` — Full detailed report

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

## `clear` — Clear cache entries

**Warning**: Clears all cached content. Only use for testing or when cache is stale.

```
/cache-inspector clear
```

Claude will ask for confirmation before clearing. After clearing, the next session will re-warm the cache (costs full tokens once).
