# Research Sources

**Curated list of sources for Claude API updates and optimization techniques**

Use this list when researching updates for your Claude Code setup. Sources are organized by type and priority.

---

## Official Sources (Primary)

These are authoritative sources from Anthropic. Always check these first.

### Anthropic Blog

**URL**: https://www.anthropic.com/news

**What to find**:
- New model announcements (Claude Opus 4.5, Sonnet 4.5, etc.)
- API feature releases (prompt caching, token-efficient tools)
- Best practice guides
- Research papers and findings

**Check frequency**: Weekly

**Key articles** (as of April 2026):
- [Prompt Caching](https://www.anthropic.com/news/prompt-caching) — 5m default + 1h opt-in TTL, 0.10× cache-hit pricing
- [Introducing Agent Skills](https://www.anthropic.com/news/skills) — open standard at [agentskills.io](https://agentskills.io)
- [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) — engineering deep-dive
- [What's new in Claude 4.6](https://docs.claude.com/en/docs/about-claude/models/whats-new-claude-4-6) — adaptive thinking, `effort: max`, 1M context, server-side compaction

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

**Current pricing** (as of April 2026):

| Model | Input (per 1M) | 5m Cache Write | 1h Cache Write | Cache Read | Output (per 1M) |
|-------|----------------|----------------|----------------|------------|-----------------|
| Opus 4.6 / 4.5 | $5.00 | $6.25 | $10.00 | $0.50 | $25.00 |
| Sonnet 4.6 / 4.5 | $3.00 | $3.75 | $6.00 | $0.30 | $15.00 |
| Haiku 4.5 | $1.00 | $1.25 | $2.00 | $0.10 | $5.00 |
| Opus Fast mode | $30.00 | — | — | — | $150.00 |

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
| `interleaved-thinking-2025-05-14` | Interleaved thinking — **only if not using adaptive thinking** (which auto-enables it on 4.6) |

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

---

**Keep this list updated** as new sources emerge and old ones become outdated.

**Last updated**: 2026-01-04
