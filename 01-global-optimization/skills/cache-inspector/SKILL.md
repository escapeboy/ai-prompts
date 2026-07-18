---
name: cache-inspector
description: Analyze prompt cache hit rates, estimate cost savings from cached system prompts and memories, and recommend improvements to caching strategy. Use when checking cache performance, investigating high token costs, optimizing cache hit rates, or diagnosing slow cache warmup.
version: 1.0.0
---

# /cache-inspector — Prompt Cache Monitor

Inspects the Claude prompt caching system to report hit rates, cost savings, and optimization opportunities. Prompt caching saves 90% on re-reads of large content (system prompts, memories, tool definitions).

## When to Use This Skill (and When NOT to)

| Use this skill for | Use a simpler approach for |
|--------------------|----------------------------|
| Investigating why a session's token cost is high | A single expensive read you already understand — just cache that content, no analysis needed |
| Diagnosing a low or slow-warming cache hit rate | A fresh session that has simply not warmed yet — wait 2-3 messages before measuring |
| Deciding *which* memories/prompts are worth caching | Content you already know is under 1024 tokens — it can't cache; expand or merge it directly |
| Producing a cost/hit-rate report or tracking trend over sessions | A one-off "is caching on?" check — read `~/.claude/settings/prompt-caching.json` |

**Start simple. Reach for this skill only when cache behaviour is actually costing tokens or you need to measure/optimize it — not to confirm a single obvious cache decision.**

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

## Actions

Each action's full behaviour, options, and exact output shape are in
[references/actions.md](references/actions.md) — read it for the detail behind the summaries below.

| Action | Purpose |
|--------|---------|
| `status` (default) | Current cache state: active entries, session hits/savings, health verdict. |
| `analyze` | Deep performance analysis with hit-rate trend, cost impact, and optimization opportunities. |
| `optimize` | Prioritized, actionable recommendations to raise the hit rate, with an estimated score delta. |
| `report` | Full report (history, cost breakdown, inventory, TTL timeline, score); `--save` writes to `.claude/learnings/cache-performance.md`. |
| `clear` | Clears all cached content (testing/stale-cache only). Confirms first; next session re-warms at full cost. |

## How caching works, config & targets

For how Claude's prompt cache behaves (what's cacheable, the ≥1024-token minimum, TTL tiers and
pricing), where it is configured (`~/.claude/settings/prompt-caching.json`), and the target
metrics that define a healthy cache, read
[references/caching-internals.md](references/caching-internals.md).

## Troubleshooting

Low hit rate, entries expiring fast, or "no cache data available" — see
[references/troubleshooting.md](references/troubleshooting.md).

## Boundaries

**Always**
- Report real numbers (hit rate, tokens saved, cost) from the session/config — never invent metrics.
- Point fixes at the actual cause: content below the 1024-token threshold, unwarmed sessions, or bypassed caching.
- Confirm Serena MCP is connected and `prompt-caching.json` is configured before claiming "no cache data".

**Ask first**
- `clear` — clearing all cached content forces a full-cost re-warm on the next session; confirm before running.
- Editing `~/.claude/settings/prompt-caching.json` (shared, session-wide config) or moving content into memories via `/context save`.

**Never**
- Run `clear` as a shortcut to "fix" a low hit rate — diagnose the cause first (it only makes warmup cost more).
- Claim a cost saving the metrics don't support, or mark the cache healthy while hit rate is below target.

## See Also

- [`/context`](../context/SKILL.md) — depends-on: load memories to maximize cache hits (pre-warm before measuring here).
- [`/optimize`](../optimize/SKILL.md) — heavier-alternative: full optimization mode that includes cache tuning.
- [references/actions.md](references/actions.md) — full action detail and example outputs.
- [references/caching-internals.md](references/caching-internals.md) — how caching works, config, target metrics.
- [references/troubleshooting.md](references/troubleshooting.md) — symptoms and fixes.
- [Token Optimization Guide](../../../05-token-optimization/guide.md)
- [Prompt Caching Config](../../settings/prompt-caching.json)
