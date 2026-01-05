# Research Integration Guide

**Research and integrate new Claude API features and optimization techniques**

This guide explains how to research Claude API updates, community best practices, and new optimization techniques, then integrate them into your Claude Code setup.

---

## Table of Contents

1. [Why Research Matters](#why-research-matters)
2. [Research Sources](#research-sources)
3. [Research Process](#research-process)
4. [Integration Workflow](#integration-workflow)
5. [Validation](#validation)
6. [Maintenance Schedule](#maintenance-schedule)
7. [Using /update-docs](#using-update-docs)

---

## Why Research Matters

### The Problem

Claude API and best practices evolve rapidly:
- New features (prompt caching, token-efficient tools, extended thinking)
- Pricing changes (model costs, caching discounts)
- Community discoveries (optimization techniques, skill patterns)
- Tool updates (Serena, MCP servers, integrations)

**Without regular updates**: Your optimization setup becomes outdated, missing 20-50% potential savings.

### The Solution

Regular research and integration:
- **Monthly**: Check for new features and pricing changes
- **Quarterly**: Deep review of community best practices
- **As needed**: When you notice new announcements

**Expected outcome**: Always using latest optimizations, maximum token savings.

---

## Research Sources

### Official Sources (Primary)

| Source | URL | What to Look For |
|--------|-----|------------------|
| **Anthropic Blog** | https://www.anthropic.com/news | New features, API updates, best practices |
| **Claude Platform Docs** | https://platform.claude.com/docs | API documentation, pricing, limits |
| **Anthropic API Changelog** | https://docs.anthropic.com/changelog | Breaking changes, new endpoints |

### Community Sources (Secondary)

| Source | URL | What to Look For |
|--------|-----|------------------|
| **FastMCP Skills** | https://fastmcp.me/Skills/Explore | Community skills, patterns |
| **GitHub MCP Repos** | Various | Tool updates, new servers |
| **Claude Code Issues** | https://github.com/anthropics/claude-code | Bugs, feature requests |

### Third-Party Resources

| Source | What to Look For |
|--------|------------------|
| **Tech blogs** | Pricing comparisons, integration guides |
| **Dev communities** | Real-world usage patterns, tips |
| **YouTube/tutorials** | Visual guides, walkthroughs |

---

## Research Process

### Step 1: Identify Research Goal

Before starting, clarify what you're looking for:

**Proactive research** (scheduled):
- "What's new in Claude API this month?"
- "Any new optimization techniques?"
- "Pricing changes?"

**Reactive research** (triggered):
- "How does prompt caching work?"
- "What's the token-efficient-tools beta header?"
- "Is there a skill for X?"

### Step 2: Search Primary Sources

Start with official sources for accuracy:

**Anthropic Blog**:
```
Search: site:anthropic.com/news [topic]
Example: site:anthropic.com/news prompt caching
```

**Claude Platform Docs**:
```
Navigate: platform.claude.com/docs
Search within docs for specific topics
```

### Step 3: Verify with Secondary Sources

Cross-reference with community:
- Check GitHub repos for implementation examples
- Look for community discussions
- Find real-world usage patterns

### Step 4: Document Findings

Create a research note:

```markdown
# Research: [Topic]
**Date**: YYYY-MM-DD
**Sources**: [URLs]

## Key Findings
- Finding 1: [Description]
- Finding 2: [Description]

## Impact on Our Setup
- [What changes might we need]

## Action Items
- [ ] Update [file] with [change]
- [ ] Test [feature] in [context]

## Raw Notes
[Detailed notes from research]
```

### Step 5: Prioritize Updates

Categorize findings:

| Priority | Criteria | Action |
|----------|----------|--------|
| **Critical** | Security issue, breaking change | Immediate update |
| **High** | Major token savings (>20%) | Update this week |
| **Medium** | Moderate improvement | Update this month |
| **Low** | Nice to have | Add to backlog |

---

## Integration Workflow

### Step 1: Plan the Update

Before making changes:

1. **Identify affected files**:
   - Settings files (`~/.claude/settings/*.json`)
   - System prompts (`~/.claude/system-prompts/*.md`)
   - Skills (`~/.claude/skills/*/SKILL.md`)
   - Documentation (`~/.claude/*.md`)

2. **Assess risk**:
   - Breaking changes? → Test in isolation first
   - Additive changes? → Lower risk
   - Documentation only? → Minimal risk

3. **Create backup**:
   ```bash
   cp -r ~/.claude ~/.claude.backup.$(date +%Y%m%d)
   ```

### Step 2: Make Updates

**For configuration changes** (`settings/*.json`):
```bash
# Edit the file
nano ~/.claude/settings/prompt-caching.json

# Validate JSON
python -m json.tool ~/.claude/settings/prompt-caching.json
```

**For system prompts** (`system-prompts/*.md`):
- Add new sections for new features
- Update existing sections with new information
- Keep backwards compatibility

**For skills** (`skills/*/SKILL.md`):
- Add new actions if needed
- Update tool references
- Add new examples

**For documentation** (`*.md`):
- Update feature descriptions
- Add new sections
- Update examples and numbers

### Step 3: Test Updates

After making changes:

1. **Basic functionality**:
   ```
   /optimize "test"
   /context list
   /cache-inspector status
   ```

2. **Specific feature**:
   - Test the new feature you integrated
   - Verify it works as documented

3. **Regression check**:
   - Ensure existing features still work
   - Run a typical workflow

### Step 4: Document Changes

Update changelog:

```markdown
## Updates Log

### YYYY-MM-DD: [Update Name]

**Source**: [URL]

**Changes**:
- Updated `prompt-caching.json` with new TTL settings
- Added extended thinking section to `global-optimization.md`
- Updated pricing in README.md

**Impact**:
- Expected 10% additional token savings
- New capability: Extended thinking for complex decisions
```

---

## Validation

### Before Integration

**Source validation**:
- [ ] Is the source official or reputable?
- [ ] Is the information current (check date)?
- [ ] Can it be verified from multiple sources?

**Technical validation**:
- [ ] Does the feature actually exist?
- [ ] Is it available in your API tier?
- [ ] Are there any limitations?

### After Integration

**Functional validation**:
- [ ] Does the new feature work?
- [ ] Are there any errors?
- [ ] Is performance as expected?

**Regression validation**:
- [ ] Do existing features still work?
- [ ] Are there any side effects?
- [ ] Is token usage as expected?

---

## Maintenance Schedule

### Weekly (5 minutes)

- [ ] Quick scan of Anthropic blog for major announcements
- [ ] Check Claude Code GitHub for important issues

### Monthly (30 minutes)

- [ ] Review Anthropic blog posts from past month
- [ ] Check platform docs for updates
- [ ] Review pricing page for changes
- [ ] Scan fastmcp.me for new relevant skills
- [ ] Update any outdated documentation

**Use**: `/update-docs validate` to check current docs

### Quarterly (2 hours)

- [ ] Full documentation review
- [ ] Compare setup against latest best practices
- [ ] Review and update all configuration files
- [ ] Test all skills and workflows
- [ ] Update memory files with learned patterns
- [ ] Analyze token savings and optimize further

**Use**: `/update-docs research all` for comprehensive update

### Triggered Updates

Update immediately when:
- Anthropic announces breaking changes
- You discover a significant optimization opportunity
- A critical security issue is announced
- Pricing changes affect your usage

---

## Using /update-docs

The `/update-docs` skill automates much of this process:

### Research Action

```
/update-docs research [topic]
```

Searches web for latest information on a topic.

**Examples**:
```
/update-docs research prompt-caching
/update-docs research claude-opus-4.5
/update-docs research token-efficient-tools
/update-docs research all              # Comprehensive research
```

### Collect Action

```
/update-docs collect [url]
```

Fetches content from a specific URL for analysis.

**Examples**:
```
/update-docs collect https://www.anthropic.com/news/prompt-caching
/update-docs collect https://fastmcp.me/Skills/laravel
```

### Analyze Action

```
/update-docs analyze
```

Compares research findings with current documentation.

**Output**:
- What's new that we don't have
- What's outdated in our docs
- Recommended updates

### Update Action

```
/update-docs update [target]
```

Updates documentation based on analysis.

**Targets**:
- `readme` - Update README.md
- `settings` - Update settings docs
- `system-prompts` - Update system prompts
- `all` - Update everything

**Options**:
- `--scope=global` (default) - Update `~/.claude/`
- `--scope=project` - Update `.claude/`
- `--scope=both` - Update both

### Validate Action

```
/update-docs validate
```

Checks documentation accuracy.

**Checks**:
- Links are valid
- JSON files are valid syntax
- Information matches current API
- No obvious outdated content

---

## Research Examples

### Example 1: New API Feature

**Trigger**: Anthropic announces "Extended Thinking" feature

**Research**:
1. Read announcement: https://www.anthropic.com/news/visible-extended-thinking
2. Read API docs for implementation details
3. Find community examples of usage

**Integration**:
1. Update `~/.claude/settings/beta-features.json`:
   ```json
   {
     "extended_thinking": {
       "enabled": false,
       "beta_header": "interleaved-thinking-2025-05-14",
       "use_cases": ["complex_design", "judge_evaluation"]
     }
   }
   ```

2. Update `~/.claude/system-prompts/global-optimization.md`:
   - Add section on when to use extended thinking
   - Document token budget considerations

3. Test with complex design task

### Example 2: Pricing Change

**Trigger**: Claude pricing update announced

**Research**:
1. Check platform.claude.com/docs/pricing
2. Compare with current model-strategy.json

**Integration**:
1. Update `~/.claude/settings/model-strategy.json`:
   ```json
   {
     "models": {
       "opus": { "cost_per_million": 5.00 },
       "sonnet": { "cost_per_million": 3.00 },
       "haiku": { "cost_per_million": 1.00 }
     }
   }
   ```

2. Update README.md cost projections
3. Recalculate token savings estimates

### Example 3: New Community Skill

**Trigger**: Discovered useful skill on fastmcp.me

**Research**:
1. Browse https://fastmcp.me/Skills/Explore
2. Find skill that matches your needs
3. Review skill documentation

**Integration**:
1. Add skill to `/init-project` skill sources
2. Cache skill content locally
3. Document in QUICK-REFERENCE.md

---

## Troubleshooting

### Can't Find Information

**Try**:
- Different search terms
- Official docs instead of blogs
- Community forums for unofficial info
- Ask in Claude Code conversation

### Conflicting Information

**Resolution**:
1. Prefer official sources over community
2. Prefer newer dates over older
3. Test in isolation to verify
4. When in doubt, use conservative approach

### Integration Broke Something

**Recovery**:
1. Restore from backup:
   ```bash
   cp -r ~/.claude.backup.YYYYMMDD ~/.claude
   ```
2. Identify the breaking change
3. Fix or revert specific change
4. Test before re-applying other updates

---

## Quick Reference

### Research Commands

```bash
# Using /update-docs skill
/update-docs research prompt-caching
/update-docs collect [url]
/update-docs analyze
/update-docs update all
/update-docs validate

# Manual web research
# In Claude Code:
# "Search for latest Claude API prompt caching updates"
```

### Key URLs

```
Anthropic Blog:     https://www.anthropic.com/news
Platform Docs:      https://platform.claude.com/docs
API Changelog:      https://docs.anthropic.com/changelog
Pricing:            https://platform.claude.com/docs/pricing
FastMCP Skills:     https://fastmcp.me/Skills/Explore
Claude Code GitHub: https://github.com/anthropics/claude-code
```

### Update Checklist

Before updating:
- [ ] Identify sources
- [ ] Verify information
- [ ] Create backup
- [ ] Plan changes

After updating:
- [ ] Test new features
- [ ] Validate existing features
- [ ] Document changes
- [ ] Update changelog

---

## Next Steps

1. **Set calendar reminders** for monthly/quarterly reviews
2. **Bookmark key sources** for quick access
3. **Use /update-docs** for automated research
4. **Share findings** with your team
5. **Contribute back** when you discover improvements
