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

**Key articles** (as of January 2025):
- [Prompt Caching](https://www.anthropic.com/news/prompt-caching) - 90% cost savings
- [Token-Saving Updates](https://www.anthropic.com/news/token-saving-updates) - 14-70% reduction
- [Extended Thinking](https://www.anthropic.com/news/visible-extended-thinking) - Deep reasoning
- [Claude Opus 4.5](https://www.anthropic.com/news/claude-opus-4-5) - Latest model

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

**Current pricing** (as of January 2025):

| Model | Input (per 1M) | Output (per 1M) | Cache Read |
|-------|----------------|-----------------|------------|
| Opus 4.5 | $5.00 | $25.00 | $0.50 |
| Sonnet 4.5 | $3.00 | $15.00 | $0.30 |
| Haiku 4.5 | $1.00 | $5.00 | $0.10 |

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
