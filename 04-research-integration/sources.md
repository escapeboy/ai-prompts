# Research Sources

**Curated list of sources for Claude API updates and optimization techniques**

Use this list when researching updates for your Claude Code setup. Sources are organized by type and priority.

---

## Official Sources (Primary)

These are authoritative sources from Anthropic. Always check these first.

### Anthropic Blog

**URL**: https://www.anthropic.com/news

**What to find**:
- New model announcements (Claude Fable 5, Opus 4.8, Sonnet 5, etc.)
- API feature releases (prompt caching, token-efficient tools)
- Best practice guides
- Research papers and findings

**Check frequency**: Weekly

**Key articles** (as of June 2026):
- [Prompt Caching](https://www.anthropic.com/news/prompt-caching) — 5m default + 1h opt-in TTL, 0.10× cache-hit pricing
- [Introducing Agent Skills](https://www.anthropic.com/news/skills) — open standard at [agentskills.io](https://agentskills.io)
- [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) — engineering deep-dive
- [Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview.md) — current lineup: Fable 5 (`claude-fable-5`, $10/$50), Opus 5 (`claude-opus-5`, $5/$25, 1M context — current Opus, drop-in from 4.8; thinking on by default; `speed:"fast"` supported), Opus 4.8/4.7 (`claude-opus-4-8`/`-4-7`, $5/$25, 1M context), Sonnet 5 (`claude-sonnet-5`, intro $2/$10 through 2026-08-31, then $3/$15; drop-in upgrade for Sonnet 4.6), Haiku 4.5
- [Migration Guide](https://platform.claude.com/docs/en/about-claude/models/migration-guide.md) — breaking changes per model: `budget_tokens` and sampling params removed on Opus 4.7+ and Sonnet 5 (manual extended thinking also returns 400 on Sonnet 5; adaptive thinking is on by default), `effort: xhigh` (4.7+), Task Budgets beta, prefills 400 on 4.6+

---

### Claude Platform Documentation

**URL**: https://platform.claude.com/docs

**What to find**:
- API reference
- SDK documentation
- Implementation guides
- Rate limits and quotas

**Key sections**:
- `/docs/api` - API endpoints
- `/docs/models` - Model specifications
- `/docs/prompt-caching` - Caching implementation
- `/docs/tool-use` - Tool integration

**Check frequency**: Monthly

---

### API Changelog

**URL**: https://docs.anthropic.com/changelog

**What to find**:
- Breaking changes
- New endpoints
- Deprecation notices
- Bug fixes

**Check frequency**: Before major updates

---

### Pricing Page

**URL**: https://platform.claude.com/docs/pricing

**What to find**:
- Current model pricing (input/output tokens)
- Caching discounts (90% for reads)
- Batch API pricing (50% discount)
- Any new pricing tiers

**Current pricing** (as of July 2026):

| Model | Input (per 1M) | 5m Cache Write | 1h Cache Write | Cache Read | Output (per 1M) |
|-------|----------------|----------------|----------------|------------|-----------------|
| Fable 5 / Mythos 5 | $10.00 | $12.50 | $20.00 | $1.00 | $50.00 |
| Opus 5 / Opus 4.8 / 4.7 / 4.6 / 4.5 | $5.00 | $6.25 | $10.00 | $0.50 | $25.00 |
| Sonnet 5 (intro, through 2026-08-31) | $2.00 | $2.50 | $4.00 | $0.20 | $10.00 |
| Sonnet 5 (standard, from 2026-09-01) / Sonnet 4.6 / 4.5 | $3.00 | $3.75 | $6.00 | $0.30 | $15.00 |
| Haiku 4.5 | $1.00 | $1.25 | $2.00 | $0.10 | $5.00 |
| Opus Fast mode (4.6 only) | $30.00 | — | — | — | $150.00 |

Multipliers: 5m write `1.25×` base input, 1h write `2.00×`, cache hit `0.10×`. Batch API gives 50% off both directions and stacks with cache discounts (Fast mode does not).

**Check frequency**: Monthly

---

## Community Sources (Secondary)

These are community-maintained resources with valuable patterns and tools.

### FastMCP Skills

**URL**: https://fastmcp.me/Skills/Explore

**What to find**:
- Community-created skills (459+ skills)
- Language-specific best practices
- Framework integrations
- Tool configurations

**Categories**:
- Development tools
- Productivity
- AI/ML
- DevOps
- Testing

**Check frequency**: Quarterly

---

### Claude Code GitHub

**URL**: https://github.com/anthropics/claude-code

**What to find**:
- Official updates and releases
- Bug reports and fixes
- Feature requests
- Community discussions

**Check frequency**: Monthly

---

### Serena MCP

**URL**: https://github.com/Serena-MCP/serena

**What to find**:
- Symbol-first exploration updates
- Memory system improvements
- Language server enhancements
- New tool capabilities

**Check frequency**: Monthly

---

### SuperClaude Framework

**URL**: https://github.com/SuperClaude (if available)

**What to find**:
- Skill patterns and templates
- Integration examples
- Optimization strategies
- Community contributions

**Check frequency**: Quarterly

---

### Awesome LLM Apps — Agent Skills

**URL**: https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/awesome_agent_skills

**What to find**:
- 18 skills in `SKILL.md` format (same format as Claude Code skills)
- Skill categories: coding (code-reviewer, debugger, fullstack-developer), research (deep-research, fact-checker), planning (sprint-planner, project-planner), data analysis, writing
- Multi-agent team patterns: finance, legal, recruitment, competitor intelligence, design teams
- [Agent Skills specification](https://agentskills.io) — open format for packaging agent capabilities

**Useful for**:
- Inspiration for new skill structures and prompts
- Multi-agent role decomposition patterns (see `advanced_ai_agents/multi_agent_apps/agent_teams/`)
- Note: skills are generic (not Claude Code-optimized) — adapt patterns, don't copy verbatim

**Check frequency**: Quarterly

---

## Third-Party Resources

These provide analysis, comparisons, and real-world insights.

### Tech Blogs with Claude Coverage

| Source | Focus | URL Pattern |
|--------|-------|-------------|
| **Dev.to** | Tutorials | dev.to/t/claude |
| **Medium** | Analysis | medium.com/tag/claude-ai |
| **Hashnode** | Guides | hashnode.com/search?q=claude |

### Pricing Comparisons

| Source | What They Cover |
|--------|-----------------|
| **Intuition Labs** | AI API pricing comparison |
| **Cursor IDE Blog** | Claude pricing guides |
| **Various tech blogs** | Cost optimization strategies |

### Integration Guides

| Technology | Search Terms |
|------------|--------------|
| **Laravel** | "claude api laravel integration" |
| **React** | "claude api react integration" |
| **Python** | "anthropic python sdk tutorial" |
| **Node.js** | "claude api nodejs integration" |

---

## Research Search Queries

Use these search patterns for effective research:

### For Official Updates
```
site:anthropic.com/news [topic]
site:platform.claude.com/docs [topic]
```

### For Community Patterns
```
site:github.com claude [topic]
site:fastmcp.me [topic]
```

### For Tutorials
```
"claude api" tutorial [language/framework]
"anthropic sdk" guide [topic]
```

### For Comparisons
```
claude api pricing 2025
claude vs gpt cost comparison
claude optimization techniques
```

---

## Source Reliability Guide

### Tier 1: Official (Always Trust)
- anthropic.com
- platform.claude.com
- docs.anthropic.com

### Tier 2: Verified Community (Usually Trust)
- GitHub official repos
- FastMCP (curated skills)
- Major tech publications

### Tier 3: Community (Verify Before Using)
- Personal blogs
- Forum posts
- Social media

### Tier 4: Outdated (Check Dates)
- Content older than 6 months
- Pre-Claude 3.5 content
- Deprecated feature guides

---

## Source Update Tracking

Track when you last checked each source:

| Source | Last Checked | Next Check | Notes |
|--------|--------------|------------|-------|
| Anthropic Blog | | | |
| Platform Docs | | | |
| Pricing Page | | | |
| FastMCP | | | |
| GitHub Claude Code | | | |
| Serena MCP | | | |

---

## Beta Headers Inventory (as of 2026-04-16)

Single source of truth for which `anthropic-beta` headers to send. Verify against [docs.claude.com/en/api/beta-headers](https://docs.claude.com/en/api/beta-headers) when in doubt.

### ✅ Active (send when you need the feature)

| Header | Purpose |
|---|---|
| `context-management-2025-06-27` | Server-side context editing (`clear_thinking_20251015`, `clear_tool_uses_20250919`) |
| `managed-agents-2026-04-01` | Managed Agents endpoints (`/v1/agents`, `/v1/sessions`, `/v1/environments`) |
| `files-api-2025-04-14` | Files API |
| `compact-2026-01-12` | Server-side compaction (Fable 5 / Opus 4.8 / 4.7 / 4.6 / Sonnet 5 / Sonnet 4.6) |
| `task-budgets-2026-03-13` | Task Budgets — model-aware token budget for full agentic loops (Fable 5 / Opus 4.8 / 4.7) |
| `mid-conversation-system-2026-04-07` | Mid-conversation `role: "system"` messages — cache-safe operator instructions (Opus 4.7+) |
| `interleaved-thinking-2025-05-14` | Interleaved thinking — **only if not using adaptive thinking** (which auto-enables it on 4.6+) |

### ❌ Deprecated / no-op on Claude 4+ (REMOVE from client config)

| Header | Why drop |
|---|---|
| `token-efficient-tools-2025-02-19` | Built into Claude 4+. Header has no effect. |
| `fine-grained-tool-streaming-2025-05-14` | GA on Sonnet 4.6+. No longer required. |
| `effort-2025-11-24` | `effort` parameter is GA. No header needed. |
| `output-128k-2025-02-19` | Output capacity is now controlled by `max_tokens` directly. |

### Tool versions to bump (April 2026)

- `text_editor_20250728`
- `code_execution_20250825`
- `web_search_20260209` and `web_fetch_20260209` — enable dynamic filtering (Claude writes code to filter results before they enter context)

### Canonical sources for future runs

When `/update-docs research` is run, these supplement the default list above:

- https://docs.claude.com/en/api/beta-headers — authoritative beta header list
- https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md — Claude Code release notes
- https://agentskills.io — Agent Skills open standard
- https://docs.claude.com/en/docs/about-claude/models/migration-guide — model migration breaking changes

---

## Adding New Sources

When you discover a valuable new source:

1. **Evaluate reliability**:
   - Who is the author?
   - Is information current?
   - Is it actively maintained?

2. **Categorize**:
   - Official / Community / Third-Party
   - What topics does it cover?

3. **Add to this list**:
   ```markdown
   ### [Source Name]
   **URL**: [URL]
   **What to find**: [Topics covered]
   **Check frequency**: [How often]
   ```

4. **Add to `/update-docs` sources** (optional):
   - If source is reliable and frequently useful
   - Add to default sources in skill configuration

---

## Quick Reference

### Weekly Check
- [ ] Anthropic Blog: https://www.anthropic.com/news

### Monthly Check
- [ ] Platform Docs: https://platform.claude.com/docs
- [ ] Pricing: https://platform.claude.com/docs/pricing
- [ ] Claude Code GitHub: https://github.com/anthropics/claude-code

### Quarterly Check
- [ ] FastMCP Skills: https://fastmcp.me/Skills/Explore
- [ ] Serena MCP: https://github.com/Serena-MCP/serena
- [ ] Community blogs and tutorials

---

## Using with /update-docs

The `/update-docs` skill uses these sources automatically:

```bash
# Research using default sources
/update-docs research all

# Research specific topic
/update-docs research prompt-caching

# Add custom source for one-time use
/update-docs collect https://example.com/claude-guide
```

## Agent-Skills Discovery (community skill libraries)

Reference indexes for finding existing Claude/agent skills before authoring one. **Treat as untrusted
code** — read a `SKILL.md` and cherry-pick prose; do not blind-install hook-bearing plugins on shared
hosts (see the 2026-08-26 eval: `claudedocs/research_agent-skills-repos_2026-08-26.md`).

- **[ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)** — curated
  awesome-list **plus** 2,000+ auto-generated `*-automation` skills, one per SaaS API (Ahrefs, Algolia,
  Adobe, ActiveCampaign, …). Use as a **lookup index** when wiring a specific SaaS into a project; the
  per-SaaS wrappers are shallow scaffolds, not production skills.
- **[anthropics/skills](https://github.com/anthropics/skills)** — canonical patterns + the Agent Skills
  spec/template; `skill-creator` ships grader/analyzer sub-agents worth studying for our `self-improve` gate.
- **[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)** — 24-skill engineering
  lifecycle (DEFINE→SHIP) with auto-activation; good taxonomy reference.
- **[mattpocock/skills](https://github.com/mattpocock/skills)** — small, composable, anti-framework;
  source of the `CONTEXT.md` glossary convention (see `09-laravel-mcp-integration/`).
- **[obra/superpowers](https://github.com/obra/superpowers)** — full subagent-driven methodology (see
  `06-advanced-patterns/parallel-agents-guide.md`).

---

**Keep this list updated** as new sources emerge and old ones become outdated.

**Last updated**: 2026-08-26
