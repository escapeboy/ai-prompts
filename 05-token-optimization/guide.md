# Token Optimization Guide

**Deep dive into token reduction techniques for Claude Code**

This guide provides a comprehensive understanding of all token optimization techniques, how they work, how to measure savings, and how to maximize efficiency.

---

## Table of Contents

1. [Understanding Tokens](#understanding-tokens)
2. [Optimization Techniques](#optimization-techniques)
3. [Measuring Token Usage](#measuring-token-usage)
4. [Optimization by Task Type](#optimization-by-task-type)
5. [Combining Optimizations](#combining-optimizations)
6. [Troubleshooting Low Savings](#troubleshooting-low-savings)
7. [ROI Calculations](#roi-calculations)

---

## Understanding Tokens

### What Are Tokens?

Tokens are the units Claude uses to process text:
- 1 token ≈ 4 characters (English)
- 1 token ≈ ¾ of a word
- Code has higher token density (more tokens per character)

**Examples**:
| Text | Approximate Tokens |
|------|-------------------|
| "Hello" | 1 token |
| "Hello, World!" | 4 tokens |
| 100 lines of code | 500-1000 tokens |
| Full PHP class (500 lines) | 2000-4000 tokens |

### Token Costs

**Current pricing** (per 1 million tokens):

| Model | Input | Output | Cache Read |
|-------|-------|--------|------------|
| Opus 4.5 | $5.00 | $25.00 | $0.50 (90% off) |
| Sonnet 4.5 | $3.00 | $15.00 | $0.30 (90% off) |
| Haiku 4.5 | $1.00 | $5.00 | $0.10 (90% off) |

### Why Token Optimization Matters

**Without optimization** (typical session):
- Read 10 files: 20,000 tokens
- System prompts: 5,000 tokens
- Tool definitions: 8,000 tokens
- Conversation: 10,000 tokens
- **Total**: 43,000 tokens = $0.13-$0.22 per session

**With optimization** (same session):
- Symbol-first reads: 3,000 tokens (85% less)
- Cached prompts: 500 tokens (90% less)
- Cached tools: 800 tokens (90% less)
- Efficient conversation: 7,000 tokens (30% less)
- **Total**: 11,300 tokens = $0.03-$0.06 per session

**Savings**: 74% token reduction, 73% cost reduction

---

## Optimization Techniques

### 1. Prompt Caching (90% Savings)

**How it works**:
- Content marked with `cache_control` is stored for 5 minutes
- First read: 25% premium (cache write)
- Subsequent reads: 90% discount (cache read)
- Minimum 1,024 tokens to cache

**What to cache**:
| Content | Typical Size | Cache Benefit |
|---------|--------------|---------------|
| System prompts | 3-5K tokens | High (read every call) |
| Tool definitions | 8-11K tokens | High (read every call) |
| Architecture memories | 5-8K tokens | High (read every session) |
| Large spec docs | 5-15K tokens | Medium (read during impl) |

**Implementation**:
```json
{
  "cache_control": {
    "type": "ephemeral"
  }
}
```

**Token impact**:
- Before: Read 10K tokens × 20 calls = 200K tokens
- After: Write 12.5K (first) + Read 1K × 19 = 31.5K tokens
- **Savings**: 84%

---

### 2. Symbol-First Exploration (65-75% Savings)

**How it works**:
- Instead of reading full files, use Serena symbolic tools
- Find specific symbols (classes, methods, functions)
- Read only the relevant code sections

**Pattern comparison**:

| Approach | Tokens Used | Description |
|----------|-------------|-------------|
| Full file read | 2,000-4,000 | Read entire UserService.php |
| Symbol overview | 200-400 | Get class structure |
| Targeted read | 100-300 | Read specific method |
| **Total symbolic** | 300-700 | Same info, 80% less tokens |

**Tools to use**:
```
mcp__serena__get_symbols_overview - Get file structure
mcp__serena__find_symbol - Find specific symbol
mcp__serena__find_referencing_symbols - Find usages
mcp__serena__read_memory - Load cached context
```

**When to use full file read**:
- Non-code files (JSON, YAML, Markdown)
- Small files (<50 lines)
- Need to understand entire file context
- Serena not available

---

### 3. Memory System (60-70% Savings)

**How it works**:
- Store project knowledge in Serena memories
- Load at session start (once)
- Replace repeated file reads

**Core memories**:
| Memory | Content | Size | Replaces |
|--------|---------|------|----------|
| architecture.md | Project structure | 5-8K | Reading 5-10 structure files |
| codebase-conventions.md | Coding patterns | 3-5K | Reading example files |
| module-structure.md | Module map | 2-3K | Directory exploration |
| testing-strategy.md | Test patterns | 2-3K | Reading test files |
| docker-workflow.md | Docker commands | 1-2K | Reading docker-compose.yml |

**Token impact**:
- Before: Explore 10 files for context = 15-20K tokens
- After: Load 2-3 memories = 5-8K tokens
- **Savings**: 60-70%

---

### 4. Token-Efficient Tools (14-70% Savings)

**How it works**:
- Beta header enables more efficient tool output
- Claude uses fewer tokens in tool responses
- No functional change, just efficiency

**Enable**:
```
Beta header: token-efficient-tools-2025-02-19
```

**Impact varies by tool usage**:
- Average: 14% reduction
- Heavy tool use: Up to 70% reduction
- Works with all tools

---

### 5. Adaptive Planning (40-50% Savings)

**How it works**:
- Not all tasks need full planning workflow
- Simple tasks skip formal requirements/design phases
- Complex tasks get full treatment

**Strategies**:
| Complexity | Tasks | Approach | Tokens |
|------------|-------|----------|--------|
| Simple | 1-2 | Unified (direct impl) | 2-5K |
| Medium | 3-7 | Intent-Planning (sketch + impl) | 8-15K |
| Complex | 8+ | Planning-Only (full workflow) | 20-40K |

**Example savings**:
- Bug fix (simple): 3K tokens vs 15K (full workflow) = 80% savings
- New feature (medium): 12K tokens vs 25K = 52% savings
- Module creation (complex): 35K tokens (full workflow appropriate)

---

### 6. Model Selection (40-60% Cost Savings)

**How it works**:
- Use cheaper models for simpler tasks
- Reserve expensive models for complex decisions

**Strategy**:
| Task Type | Model | Cost/1M | Use Case |
|-----------|-------|---------|----------|
| Fast operations | Haiku | $1/$5 | Requirements, tasks, simple queries |
| Balanced work | Sonnet | $3/$15 | Design, implementation, testing |
| Critical decisions | Opus | $5/$25 | Judge evaluation, complex architecture |

**Target distribution**:
- Haiku: 40% of tasks
- Sonnet: 55% of tasks
- Opus: 5% of tasks

**Cost impact**:
- All Sonnet: $3/M average
- Optimized mix: $1.70/M average
- **Savings**: 43%

---

### 7. Pattern Reuse (50% Savings)

**How it works**:
- Reference existing similar code instead of regenerating
- Use templates and patterns from memories
- Copy and adapt existing implementations

**Example**:
- Creating new controller: Reference existing controller pattern
- Adding new service: Follow established service structure
- Writing tests: Use existing test as template

**Token impact**:
- Generate from scratch: 5-10K tokens
- Adapt existing pattern: 2-4K tokens
- **Savings**: 50-60%

---

## Measuring Token Usage

### During Session

**Use `/cache-inspector`**:
```
/cache-inspector status
```

Shows:
- Current cache hit rate
- Tokens loaded from cache
- Tokens read fresh
- Estimated savings

### Per-Task Tracking

Track token usage for specific tasks:

1. **Note starting point** (session tokens used)
2. **Complete task**
3. **Note ending point**
4. **Calculate**: End - Start = Task tokens

### Baseline Comparison

**Create baseline** for your typical tasks:

| Task Type | Without Optimization | With Optimization | Savings |
|-----------|---------------------|-------------------|---------|
| Bug fix | 15,000 tokens | 3,000 tokens | 80% |
| New feature | 35,000 tokens | 12,000 tokens | 66% |
| Refactoring | 25,000 tokens | 8,000 tokens | 68% |
| Module creation | 85,000 tokens | 25,000 tokens | 71% |

### Logging

Create optimization log:

```markdown
# Optimization Log

## YYYY-MM-DD: [Task Name]

**Task type**: [Bug fix/Feature/Refactor/etc.]
**Complexity**: [Simple/Medium/Complex]

**Token usage**:
- Estimated baseline: [X] tokens
- Actual usage: [X] tokens
- Savings: [X]%

**Optimizations used**:
- [x] Symbol-first exploration
- [x] Memory loading
- [x] Prompt caching
- [ ] Adaptive planning

**Notes**:
[What worked well, what could improve]
```

---

## Optimization by Task Type

### Bug Fixes (Target: 80-90% Savings)

**Optimizations**:
1. Load relevant memories (architecture, conventions)
2. Use symbol-first to find affected code
3. Read only the specific method/function
4. Make targeted edit

**Example workflow**:
```
1. /context load             # 5K tokens (cached)
2. find_symbol "ErrorMethod" # 200 tokens
3. Read method body          # 300 tokens
4. Make fix                  # 500 tokens
Total: ~6K tokens (vs 20K+ baseline)
```

### New Features (Target: 60-70% Savings)

**Optimizations**:
1. Load all relevant memories
2. Find similar existing features
3. Use adaptive planning (skip formal if simple)
4. Reference patterns instead of generating fresh

**Example workflow**:
```
1. /context load                    # 5K tokens
2. Find similar feature             # 1K tokens
3. Intent-planning (medium)         # 3K tokens
4. Implementation (with patterns)   # 8K tokens
Total: ~17K tokens (vs 45K+ baseline)
```

### Refactoring (Target: 65-75% Savings)

**Optimizations**:
1. Symbol-first exploration of affected area
2. Find all references before changing
3. Make targeted changes
4. Use rename_symbol for simple renames

**Example workflow**:
```
1. /context load                     # 5K tokens
2. Symbol exploration                # 2K tokens
3. Find references                   # 1K tokens
4. Targeted edits                    # 4K tokens
Total: ~12K tokens (vs 35K+ baseline)
```

### Documentation (Target: 40-50% Savings)

**Optimizations**:
1. Load architecture memory
2. Use symbol overview for code structure
3. Generate from overview, not full code

**Note**: Documentation benefits less because output tokens are expensive and needed.

### Research/Exploration (Target: 70-80% Savings)

**Optimizations**:
1. Use symbol tools exclusively
2. Don't read files unless necessary
3. Navigate by symbol relationships
4. Cache explored structure

---

## Combining Optimizations

### Synergy Effects

Some optimizations multiply when combined:

| Combination | Individual | Combined | Synergy |
|-------------|------------|----------|---------|
| Caching + Memories | 90% + 65% | 96.5% | Yes |
| Symbol-first + Memories | 70% + 65% | 89.5% | Yes |
| Adaptive + Model selection | 45% + 50% | 72.5% | Yes |

### Maximum Savings Stack

For maximum optimization:

1. **Foundation**: Prompt caching (90% on cached content)
2. **Context**: Memory system (65% on exploration)
3. **Exploration**: Symbol-first (70% on code reads)
4. **Tools**: Token-efficient beta (14-70% on outputs)
5. **Planning**: Adaptive (40-50% on workflow)
6. **Models**: Smart selection (40-60% on costs)

**Combined potential**: 85-95% total savings

### Realistic Expectations

| Scenario | Realistic Savings | Maximum Savings |
|----------|-------------------|-----------------|
| Simple tasks | 75-85% | 90%+ |
| Medium tasks | 60-75% | 80-85% |
| Complex tasks | 40-60% | 70-80% |
| Overall average | 55-70% | 75-85% |

---

## Troubleshooting Low Savings

### Symptoms and Causes

#### Low Cache Hit Rate (<50%)

**Causes**:
- Sessions too short (cache expires)
- Not loading memories at start
- Using different system prompts

**Fixes**:
- Load memories immediately at session start
- Keep sessions focused (don't jump topics)
- Standardize system prompts

#### High Token Usage on Code Exploration

**Causes**:
- Reading full files instead of symbols
- Serena not activated
- Not using targeted reads

**Fixes**:
- Ensure Serena is activated
- Use `find_symbol` before reading
- Request only method bodies, not full files

#### No Improvement on Complex Tasks

**Causes**:
- Task genuinely needs full context
- Output tokens dominate (can't reduce)
- Skipping planning increases debugging

**Reality check**: Some complex tasks need full investment. Savings come from not over-investing in simple tasks.

### Debugging Checklist

- [ ] Serena activated? (`mcp__serena__get_current_config`)
- [ ] Memories loaded? (`mcp__serena__list_memories`)
- [ ] Prompt caching enabled? (Check settings)
- [ ] Token-efficient tools enabled? (Check beta header)
- [ ] Using symbol-first? (Review tool calls)
- [ ] Appropriate planning level? (Check complexity)
- [ ] Right model? (Haiku for simple, Sonnet for complex)

---

## ROI Calculations

### Setup Investment

| Setup Phase | Time | One-Time |
|-------------|------|----------|
| Global optimization | 2-3 hours | Yes |
| Project activation | 15-30 min | Per project |
| Learning curve | 1-2 hours | Yes |
| **Total** | 4-6 hours | - |

### Session Savings

**Per session** (medium complexity task):
| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Tokens | 45,000 | 15,000 | 30,000 |
| Cost | $0.14 | $0.05 | $0.09 |
| Time | 20 min | 12 min | 8 min |

### Monthly Savings

**30 sessions/month**:
- Token savings: 900,000 tokens
- Cost savings: $2.70
- Time savings: 4 hours

### Annual Savings

**360 sessions/year**:
- Token savings: 10.8M tokens
- Cost savings: $32.40 (single project)
- Time savings: 48 hours

**Multiple projects** (3 projects):
- Cost savings: $97.20/year
- Time savings: 144 hours/year

### Breakeven

**Setup time**: 5 hours
**Session time saved**: 8 minutes

**Breakeven**: After 37 sessions (~1 month typical usage)

After breakeven, all savings are pure benefit.

---

## Quick Reference

### Optimization Priority

1. **Do first**: Activate Serena, create memories (biggest impact)
2. **Do second**: Enable prompt caching
3. **Do third**: Practice symbol-first exploration
4. **Do fourth**: Configure adaptive planning
5. **Do fifth**: Fine-tune model selection

### Token Targets by Task

| Task | Baseline | Target | Max Savings |
|------|----------|--------|-------------|
| Bug fix | 20K | 3-5K | 80%+ |
| New feature | 45K | 12-18K | 65%+ |
| Refactoring | 35K | 8-12K | 70%+ |
| Documentation | 25K | 12-15K | 45%+ |
| Exploration | 30K | 5-8K | 75%+ |

### Commands

```bash
# Check optimization status
/cache-inspector status

# Load project context
/context load

# Run with maximum optimization
/optimize "task description"

# Check current savings
/cache-inspector analyze
```

---

## Next Steps

1. **Measure baseline**: Track token usage for 5-10 typical tasks
2. **Activate optimizations**: Follow setup guides
3. **Track improvements**: Log savings for same task types
4. **Refine**: Identify where savings are lowest, focus there
5. **Share**: Help teammates benefit from optimizations
