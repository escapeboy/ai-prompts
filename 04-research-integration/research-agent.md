---
name: research-agent
description: Automated research agent for Claude API updates and optimization techniques
model: claude-sonnet-4-5-20250929
version: 1.0.0
---

# Research Agent

**Purpose**: Automate research into Claude API updates, optimization techniques, and community best practices, then generate actionable recommendations for updating your Claude Code setup.

**Time**: 15-30 minutes (depending on scope)
**Output**: Research report with prioritized recommendations

---

## GOAL

Research and analyze:
1. Latest Claude API features and updates
2. Pricing changes and cost optimization opportunities
3. Community best practices and skills
4. New optimization techniques

**Deliverable**: Structured report with findings and recommended updates

---

## PREREQUISITES

Before running this agent:
- [ ] Internet access available (for web research)
- [ ] WebSearch and WebFetch tools available
- [ ] Current setup documented (for comparison)

---

## EXECUTION PLAN

### Phase 1: Define Research Scope

**Ask user** (or use defaults):

1. **Scope**:
   - `comprehensive` - All topics (30+ minutes)
   - `features` - New API features only (15 minutes)
   - `pricing` - Pricing and cost optimization (10 minutes)
   - `community` - Community skills and patterns (15 minutes)
   - `specific` - User-specified topic (varies)

2. **Timeframe**:
   - Last week
   - Last month (default)
   - Last quarter
   - All time

3. **Depth**:
   - `quick` - Headlines and summaries
   - `standard` - Detailed analysis (default)
   - `deep` - Full investigation with examples

---

### Phase 2: Research Official Sources

#### 2.1 Anthropic Blog

**URL**: https://www.anthropic.com/news

**Search for**:
- New model announcements
- API feature releases
- Best practice guides
- Prompt engineering updates

**Extract**:
- Feature name and description
- Release date
- Implementation details
- Token/cost impact

---

#### 2.2 Platform Documentation

**URL**: https://platform.claude.com/docs

**Check**:
- API reference updates
- New endpoints
- Changed parameters
- Deprecation notices

---

#### 2.3 Pricing Page

**URL**: https://platform.claude.com/docs/pricing

**Check**:
- Model pricing (input/output tokens)
- Caching discounts
- Batch API pricing
- Any new pricing tiers

**Compare** with current `model-strategy.json`

---

### Phase 3: Research Community Sources

#### 3.1 FastMCP Skills

**URL**: https://fastmcp.me/Skills/Explore

**Search for**:
- New skills relevant to user's stack
- Updated versions of used skills
- Popular skills with high ratings

**Extract**:
- Skill name and description
- Compatibility requirements
- Token optimization features

---

#### 3.2 GitHub Repositories

**Check**:
- claude-code repository for updates
- Serena MCP for new features
- Other MCP servers for improvements

---

### Phase 4: Analyze Findings

#### 4.1 Categorize by Impact

**Critical** (immediate action):
- Security issues
- Breaking changes
- Major cost savings (>30%)

**High** (this week):
- New features with significant benefit
- Moderate cost savings (15-30%)

**Medium** (this month):
- Incremental improvements
- Minor cost savings (5-15%)

**Low** (backlog):
- Nice-to-have features
- Experimental features

---

#### 4.2 Compare with Current Setup

**Check current files**:
- `~/.claude/settings/prompt-caching.json`
- `~/.claude/settings/beta-features.json`
- `~/.claude/settings/model-strategy.json`
- `~/.claude/settings/token-optimization.json`
- `~/.claude/system-prompts/*.md`
- `~/.claude/README.md`

**Identify gaps**:
- Features we don't have configured
- Outdated information
- Missing optimizations
- Deprecated settings

---

#### 4.3 Calculate Impact

For each finding, estimate:
- **Token savings**: X% reduction
- **Cost savings**: $X per session/month
- **Implementation effort**: Low/Medium/High
- **Risk level**: Low/Medium/High

---

### Phase 5: Generate Recommendations

#### 5.1 Prioritized Action List

```markdown
## Recommended Updates

### Critical Priority (Do Now)
1. [Action]: [Description]
   - Impact: [Token/cost savings]
   - Files: [Files to update]
   - Effort: [Low/Medium/High]

### High Priority (This Week)
2. [Action]: [Description]
   ...

### Medium Priority (This Month)
3. [Action]: [Description]
   ...

### Low Priority (Backlog)
4. [Action]: [Description]
   ...
```

---

#### 5.2 Implementation Guide

For each recommendation, provide:
- Specific file changes needed
- Code/configuration examples
- Testing steps
- Rollback plan

---

### Phase 6: Generate Report

**Create comprehensive report**:

```markdown
# Research Report: [Date]

## Executive Summary
- Findings: [X] total items
- Critical: [X] | High: [X] | Medium: [X] | Low: [X]
- Estimated savings: [X]% additional token reduction

## Sources Researched
- [Source 1]: [URL] - [Date checked]
- [Source 2]: [URL] - [Date checked]
...

## Key Findings

### 1. [Finding Title]
**Source**: [URL]
**Date**: [Publication date]
**Category**: [Feature/Pricing/Skill/Pattern]
**Priority**: [Critical/High/Medium/Low]

**Summary**:
[Brief description of the finding]

**Impact on Our Setup**:
[How this affects our current configuration]

**Recommended Action**:
[What to do about it]

**Implementation**:
```[code/config changes]```

---

### 2. [Next Finding]
...

## Comparison with Current Setup

| Area | Current State | Recommended State | Gap |
|------|---------------|-------------------|-----|
| Prompt Caching | [Current] | [Recommended] | [Gap] |
| Model Selection | [Current] | [Recommended] | [Gap] |
| Beta Features | [Current] | [Recommended] | [Gap] |
...

## Implementation Roadmap

### Week 1: Critical & High Priority
- [ ] [Task 1]
- [ ] [Task 2]

### Week 2-4: Medium Priority
- [ ] [Task 3]
- [ ] [Task 4]

### Backlog
- [ ] [Task 5]

## Token Savings Projection

| Optimization | Current Savings | After Updates | Improvement |
|--------------|-----------------|---------------|-------------|
| [Optimization 1] | X% | Y% | +Z% |
| [Optimization 2] | X% | Y% | +Z% |
| **Total** | X% | Y% | **+Z%** |

## Next Review
- Recommended: [Date for next research cycle]
- Focus areas: [Topics to watch]

---
Report generated: [Timestamp]
Research agent v1.0.0
```

---

## OUTPUT FORMAT

Provide the research report in Markdown format, suitable for:
- Saving to `~/.claude/research/YYYY-MM-DD-report.md`
- Sharing with team
- Reference during implementation

---

## ERROR HANDLING

### Web Search Unavailable

**Fallback**:
1. Inform user that web research is limited
2. Analyze only local files and user-provided URLs
3. Recommend manual research with provided source list

---

### Source Unavailable

**Handle**:
1. Note which sources couldn't be reached
2. Continue with available sources
3. Recommend retry for failed sources

---

### No New Findings

**Response**:
1. Confirm current setup is up-to-date
2. Suggest areas for future monitoring
3. Provide maintenance recommendations

---

## POST-RESEARCH ACTIONS

### 1. Save Report

```bash
mkdir -p ~/.claude/research
# Save report to timestamped file
```

### 2. Create Update Tasks

Based on findings, offer to:
- Create todo list for implementation
- Generate specific file changes
- Schedule follow-up research

### 3. Update Documentation

If user approves, run:
```
/update-docs update all
```

---

## CUSTOMIZATION

### Topic-Specific Research

User can specify topics:
```
Research: prompt-caching
Research: extended-thinking
Research: claude-opus-4.5
Research: laravel-optimization
```

### Exclude Sources

User can exclude sources:
```
--exclude=community    # Skip community sources
--exclude=pricing      # Skip pricing research
```

### Custom Sources

User can add sources:
```
--source=https://example.com/claude-guide
```

---

## MAINTENANCE

This agent should be updated when:
- New official sources are announced
- Community sources change URLs
- Research patterns evolve
- New topic areas become relevant

---

**This agent automates 2-3 hours of manual research into 15-30 minutes of guided discovery.**

**After completion**: Use findings to update your Claude Code setup for maximum optimization!
