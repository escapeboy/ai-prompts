# Token Optimization Metrics

**How to measure and track token savings**

This document provides frameworks, templates, and methods for measuring the effectiveness of your token optimization setup.

---

## Key Metrics

### 1. Token Usage

| Metric | Description | Target |
|--------|-------------|--------|
| **Tokens per session** | Total tokens used in a session | Reduce by 60%+ |
| **Tokens per task** | Tokens for specific task type | Varies by task |
| **Input vs output ratio** | Input tokens / output tokens | Higher is better |

### 2. Cache Performance

| Metric | Description | Target |
|--------|-------------|--------|
| **Cache hit rate** | Cached reads / total reads | 80%+ |
| **Cache coverage** | % of content that's cacheable | 70%+ |
| **Cache utilization** | Actual cached / potential cached | 90%+ |

### 3. Cost Efficiency

| Metric | Description | Target |
|--------|-------------|--------|
| **Cost per session** | Total API cost for session | Reduce by 60%+ |
| **Cost per task** | Cost for specific task type | Benchmark per type |
| **Model efficiency** | Cost-weighted model usage | 60% Haiku target |

### 4. Workflow Efficiency

| Metric | Description | Target |
|--------|-------------|--------|
| **Time to completion** | Task start to finish | Reduce by 30%+ |
| **Planning efficiency** | Planning tokens / total tokens | 10-20% |
| **Rework rate** | Tasks requiring correction | <10% |

---

## Measurement Methods

### Method 1: Session Tracking

Track token usage for entire sessions.

**Template**:
```markdown
# Session Log: YYYY-MM-DD

**Session ID**: [unique identifier]
**Duration**: [X] minutes
**Project**: [project name]

## Tasks Completed
1. [Task 1]: [Brief description]
2. [Task 2]: [Brief description]

## Token Usage
- **Input tokens**: [X]
- **Output tokens**: [X]
- **Total tokens**: [X]
- **Cached tokens**: [X]
- **Cache hit rate**: [X]%

## Cost
- **Actual cost**: $[X]
- **Baseline cost**: $[X] (estimate without optimization)
- **Savings**: $[X] ([X]%)

## Optimizations Used
- [x] Symbol-first exploration
- [x] Memory loading
- [x] Prompt caching
- [ ] Adaptive planning

## Notes
[What went well, what could improve]
```

### Method 2: Task Benchmarking

Compare token usage for the same task type over time.

**Template**:
```markdown
# Task Benchmark: [Task Type]

## Baseline (Before Optimization)
**Date**: [First measurement date]
**Tokens used**: [X]
**Cost**: $[X]
**Time**: [X] minutes

## Measurements

| Date | Tokens | Cost | Time | Savings |
|------|--------|------|------|---------|
| YYYY-MM-DD | X | $X | X min | X% |
| YYYY-MM-DD | X | $X | X min | X% |
| YYYY-MM-DD | X | $X | X min | X% |

## Average Performance
- **Average tokens**: [X] (vs [X] baseline)
- **Average savings**: [X]%
- **Trend**: [Improving/Stable/Declining]

## Optimization Factors
[What's driving the savings]
```

### Method 3: Cache Analysis

Monitor cache performance using `/cache-inspector`.

**Commands**:
```bash
# Check current cache status
/cache-inspector status

# Analyze cache performance
/cache-inspector analyze

# Generate cache report
/cache-inspector report
```

**Metrics to track**:
- Cache hit rate over time
- Cached content breakdown (system prompts, tools, memories)
- Cache miss reasons

---

## Tracking Templates

### Weekly Tracking

```markdown
# Week of YYYY-MM-DD

## Summary
| Metric | This Week | Last Week | Change |
|--------|-----------|-----------|--------|
| Sessions | X | X | +X% |
| Total tokens | X | X | -X% |
| Total cost | $X | $X | -X% |
| Avg cache hit | X% | X% | +X% |

## By Task Type
| Task | Count | Avg Tokens | Avg Cost |
|------|-------|------------|----------|
| Bug fixes | X | X | $X |
| Features | X | X | $X |
| Refactoring | X | X | $X |

## Insights
- [Observation 1]
- [Observation 2]

## Actions for Next Week
- [ ] [Improvement action 1]
- [ ] [Improvement action 2]
```

### Monthly Report

```markdown
# Monthly Report: [Month YYYY]

## Executive Summary
- **Total sessions**: [X]
- **Total tokens**: [X]
- **Total cost**: $[X]
- **Average savings**: [X]% vs baseline

## Trend Analysis

### Token Usage Trend
| Week | Tokens | Change |
|------|--------|--------|
| Week 1 | X | - |
| Week 2 | X | +/-X% |
| Week 3 | X | +/-X% |
| Week 4 | X | +/-X% |

### Cache Performance Trend
[Graph or table showing cache hit rate over time]

### Cost Trend
[Graph or table showing cost over time]

## Optimization Performance

### What's Working
1. [Optimization 1]: [X]% contribution to savings
2. [Optimization 2]: [X]% contribution to savings

### What Needs Improvement
1. [Area 1]: [Current state] → [Target state]
2. [Area 2]: [Current state] → [Target state]

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## Goals for Next Month
- [ ] Achieve [X]% cache hit rate
- [ ] Reduce average tokens per session to [X]
- [ ] Implement [new optimization]
```

---

## Baseline Benchmarks

### By Task Type

Use these baselines to compare your performance:

| Task Type | Baseline | Optimized Target | Stretch Goal |
|-----------|----------|------------------|--------------|
| Simple bug fix | 15-20K | 3-5K | <3K |
| Medium bug fix | 25-35K | 8-12K | <8K |
| Simple feature | 30-40K | 10-15K | <10K |
| Medium feature | 45-60K | 15-25K | <15K |
| Complex feature | 80-120K | 30-50K | <30K |
| Refactoring | 35-50K | 10-15K | <10K |
| Documentation | 20-30K | 10-15K | <10K |
| Exploration | 25-40K | 5-10K | <5K |

### By Session Length

| Session Type | Baseline | Optimized Target |
|--------------|----------|------------------|
| Quick (10 min) | 15-25K | 5-8K |
| Medium (30 min) | 40-60K | 15-25K |
| Long (60 min) | 80-120K | 30-50K |
| Extended (2+ hr) | 150-250K | 60-100K |

### By Project Size

| Project Size | Files | Baseline Exploration | Optimized |
|--------------|-------|---------------------|-----------|
| Small | <50 | 20-30K | 5-10K |
| Medium | 50-200 | 40-60K | 10-20K |
| Large | 200-500 | 60-100K | 15-30K |
| Enterprise | 500+ | 100-200K | 25-50K |

---

## Cache Metrics

### Target Cache Performance

| Cache Type | Hit Rate Target | Notes |
|------------|-----------------|-------|
| System prompts | 95%+ | Should always be cached |
| Tool definitions | 95%+ | Stable, cache well |
| Memories | 90%+ | Loaded once per session |
| Spec documents | 80%+ | During active work |
| Code files | 60%+ | Varies by exploration |

### Cache Troubleshooting

| Hit Rate | Status | Action |
|----------|--------|--------|
| 90%+ | Excellent | Maintain current setup |
| 70-90% | Good | Minor improvements possible |
| 50-70% | Suboptimal | Review caching strategy |
| <50% | Poor | Reconfigure caching |

---

## Model Usage Metrics

### Target Distribution

| Model | Target % | Actual % | Status |
|-------|----------|----------|--------|
| Haiku | 40% | ? | ? |
| Sonnet | 55% | ? | ? |
| Opus | 5% | ? | ? |

### Cost Efficiency

| Scenario | Average Cost/1M | Status |
|----------|-----------------|--------|
| All Sonnet | $3.00 | Baseline |
| All Haiku | $1.00 | Minimum |
| Optimized mix | $1.70 | Target |
| Your actual | $? | ? |

---

## ROI Tracking

### Setup Investment

| Investment | Time | One-Time? |
|------------|------|-----------|
| Global setup | 3 hours | Yes |
| Project activation | 0.5 hours | Per project |
| Learning | 2 hours | Yes |
| **Total** | 5.5 hours | - |

### Savings Accumulation

Track cumulative savings over time:

```markdown
# ROI Tracker

## Investment
- Setup time: [X] hours @ $[hourly rate] = $[X]
- Ongoing maintenance: [X] hours/month = $[X]/month

## Monthly Savings
| Month | Token Savings | Cost Savings | Cumulative |
|-------|---------------|--------------|------------|
| Month 1 | XM | $X | $X |
| Month 2 | XM | $X | $X |
| Month 3 | XM | $X | $X |

## Breakeven
- Breakeven point: [Month X]
- Current ROI: [X]%
- Projected annual savings: $[X]
```

---

## Dashboards

### Daily Dashboard

Quick daily check:
```
/cache-inspector status
```

Shows:
- Today's token usage
- Cache hit rate
- Cost estimate
- Comparison to average

### Weekly Dashboard

Weekly review:
```
/cache-inspector analyze
```

Shows:
- Week's performance
- Trends
- Top inefficiencies
- Recommendations

### Monthly Dashboard

Full monthly report:
```
/cache-inspector report
```

Generates comprehensive report with:
- All metrics
- Trends
- Comparisons
- Recommendations

---

## Automated Tracking

### Session Start Hook

Add to session start routine:
```markdown
## Session Start
1. Note start time
2. Note initial token count (if available)
3. Load context: `/context load`
4. Check cache: `/cache-inspector status`
```

### Session End Hook

Add to session end routine:
```markdown
## Session End
1. Note end time and tokens used
2. Log session to tracking document
3. Note any optimization observations
```

### Continuous Improvement

After each session, briefly note:
- What optimizations worked well
- What could be improved
- Any patterns to address

---

## Quick Reference

### Commands

```bash
# Check current status
/cache-inspector status

# Analyze recent performance
/cache-inspector analyze

# Generate full report
/cache-inspector report

# Optimize current session
/optimize "task"

# Load context efficiently
/context load
```

### Key Targets

| Metric | Target | Excellent |
|--------|--------|-----------|
| Cache hit rate | 80% | 90%+ |
| Token reduction | 60% | 75%+ |
| Cost reduction | 60% | 75%+ |
| Haiku usage | 40% | 50%+ |

### Warning Signs

- Cache hit rate below 50%
- Token usage increasing over time
- Frequent full file reads
- No memory usage
- Always using Sonnet/Opus

---

**Track consistently** to identify trends and optimize continuously!
