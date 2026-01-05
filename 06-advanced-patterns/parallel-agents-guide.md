# Parallel Agents Guide

**Coordinate multiple agents for complex tasks**

This guide explains how to use parallel agent execution for complex scenarios that benefit from multiple perspectives or concurrent work streams.

---

## When to Use Parallel Agents

### Good Use Cases

1. **Multi-perspective evaluation** - Get different viewpoints on a decision
2. **Large-scale refactoring** - Process multiple files concurrently
3. **Comprehensive analysis** - Analyze code from different angles
4. **Research synthesis** - Gather information from multiple sources
5. **Testing in parallel** - Run different test strategies simultaneously

### When NOT to Use

1. **Sequential dependencies** - Tasks that must complete in order
2. **Simple tasks** - Overhead outweighs benefits
3. **Token-constrained** - Parallel execution multiplies token usage
4. **Shared state** - Tasks that modify the same files

---

## Basic Pattern

### Launching Parallel Agents

Use the Task tool with multiple invocations:

```markdown
## Parallel Execution

I'll launch multiple agents in parallel:

1. **Agent A**: Analyze security aspects
2. **Agent B**: Analyze performance aspects
3. **Agent C**: Analyze maintainability aspects

[Launch all three using Task tool with different prompts]
```

### Gathering Results

After agents complete:

```markdown
## Synthesis

Results from parallel analysis:

**Security (Agent A)**:
- [Summary of security findings]

**Performance (Agent B)**:
- [Summary of performance findings]

**Maintainability (Agent C)**:
- [Summary of maintainability findings]

## Combined Recommendations
[Synthesize all findings into actionable items]
```

---

## Patterns

### Pattern 1: Multi-Perspective Review

**Scenario**: Review a design decision from multiple angles

**Setup**:
```markdown
Launch 3 agents in parallel:

1. **spec-judge (Opus)**: Evaluate from architectural perspective
   - Focus: System design, scalability, patterns

2. **spec-judge (Opus)**: Evaluate from security perspective
   - Focus: Authentication, authorization, data protection

3. **spec-judge (Opus)**: Evaluate from performance perspective
   - Focus: Efficiency, caching, database queries
```

**Synthesis**:
```markdown
## Combined Evaluation

### Unanimous Recommendations
[Things all three agreed on]

### Majority Recommendations
[2 out of 3 agreed]

### Conflicting Perspectives
[Where agents disagreed - needs human decision]
```

---

### Pattern 2: Concurrent File Processing

**Scenario**: Refactor multiple independent files

**Setup**:
```markdown
Launch agents for each file group:

1. **Agent 1**: Refactor app/Services/Auth/*
2. **Agent 2**: Refactor app/Services/Payment/*
3. **Agent 3**: Refactor app/Services/Notification/*
```

**Prerequisites**:
- Files must be independent (no cross-references being changed)
- Each agent gets clear scope
- Common patterns defined upfront

**Coordination**:
```markdown
## Shared Context (give to all agents)

### Refactoring Rules
- Apply new naming convention: [convention]
- Use new base class: [class]
- Follow pattern: [pattern]

### Do NOT Change
- Interface signatures
- Public method names
- Database interactions
```

---

### Pattern 3: Research Synthesis

**Scenario**: Research a topic from multiple sources

**Setup**:
```markdown
Launch research agents:

1. **Agent 1**: Research official documentation
   - Sources: anthropic.com, platform.claude.com

2. **Agent 2**: Research community best practices
   - Sources: GitHub, Stack Overflow, blogs

3. **Agent 3**: Research competing approaches
   - Sources: Alternative tools, comparison articles
```

**Synthesis**:
```markdown
## Research Summary

### Official Guidance
[From Agent 1]

### Community Wisdom
[From Agent 2]

### Alternative Approaches
[From Agent 3]

### Recommended Approach
[Synthesized recommendation]
```

---

### Pattern 4: Test Strategy Parallelization

**Scenario**: Generate tests from multiple strategies

**Setup**:
```markdown
Launch test generation agents:

1. **Agent 1**: Generate happy path tests
   - Focus: Expected success scenarios

2. **Agent 2**: Generate edge case tests
   - Focus: Boundary conditions, empty inputs

3. **Agent 3**: Generate error handling tests
   - Focus: Failure scenarios, exceptions
```

**Integration**:
```markdown
## Combined Test Suite

### Happy Path Tests (Agent 1)
[List of generated tests]

### Edge Case Tests (Agent 2)
[List of generated tests]

### Error Handling Tests (Agent 3)
[List of generated tests]

### Gaps Identified
[Any scenarios not covered]
```

---

## Agent Types for Parallel Work

### Exploration Agents

Best for: Research, discovery, analysis

```markdown
subagent_type: Explore
model: haiku (fast, cheap)
```

Use when:
- Searching codebase
- Finding patterns
- Gathering information

### Implementation Agents

Best for: Code changes, refactoring

```markdown
subagent_type: spec-impl
model: sonnet (balanced)
```

Use when:
- Making code changes
- Implementing features
- Refactoring files

### Evaluation Agents

Best for: Critical decisions, quality assessment

```markdown
subagent_type: spec-judge
model: opus (thorough)
```

Use when:
- Evaluating designs
- Making architectural decisions
- Assessing quality

---

## Coordination Strategies

### Strategy 1: Divide and Conquer

Split work by scope:

```markdown
## Work Division

Total scope: 20 files across 4 modules

### Agent 1: Module A (5 files)
- file1.php
- file2.php
- ...

### Agent 2: Module B (5 files)
- file6.php
- file7.php
- ...

### Agent 3: Module C (5 files)
...

### Agent 4: Module D (5 files)
...
```

**Key**: Ensure no overlap, clear boundaries.

---

### Strategy 2: Specialist Roles

Assign different perspectives:

```markdown
## Role Assignment

### Security Specialist (Agent 1)
Focus exclusively on:
- Input validation
- Authentication
- Authorization
- Data protection

### Performance Specialist (Agent 2)
Focus exclusively on:
- Query efficiency
- Caching opportunities
- Algorithm complexity
- Resource usage

### Maintainability Specialist (Agent 3)
Focus exclusively on:
- Code clarity
- Documentation
- Test coverage
- Technical debt
```

---

### Strategy 3: Pipeline Stages

When some dependency exists:

```markdown
## Pipeline

### Stage 1 (Parallel)
- Agent A: Analyze requirements
- Agent B: Research similar implementations

### Stage 2 (After Stage 1)
- Agent C: Design solution (uses Stage 1 output)

### Stage 3 (Parallel)
- Agent D: Implement component 1
- Agent E: Implement component 2

### Stage 4 (After Stage 3)
- Agent F: Integration and testing
```

---

## Token Management

### Cost Implications

Parallel agents multiply token usage:

| Agents | Multiplier | Example Task | Total Tokens |
|--------|------------|--------------|--------------|
| 1 | 1x | 10K | 10K |
| 2 | 2x | 10K | 20K |
| 3 | 3x | 10K | 30K |
| 4 | 4x | 10K | 40K |

**Recommendation**: Use parallel agents when:
- Time savings justify cost
- Quality improvement justifies cost
- Task naturally parallelizes

### Optimization

Reduce per-agent tokens:

1. **Share context** - Load memories once, pass to all agents
2. **Narrow scope** - Each agent gets only what it needs
3. **Use Haiku** - For exploration/research agents
4. **Set limits** - Define maximum tokens per agent

---

## Error Handling

### Agent Failure

When one agent fails:

```markdown
## Handling Partial Failure

### Agent 1: ✅ Completed
[Results]

### Agent 2: ❌ Failed
Error: [Error message]
Action: [Retry / Skip / Manual handling]

### Agent 3: ✅ Completed
[Results]

## Recovery
[How to handle the failed agent's work]
```

### Conflicting Results

When agents produce conflicting outputs:

```markdown
## Conflict Resolution

### Conflict: [Description]

**Agent 1 says**: [Position]
**Agent 2 says**: [Different position]

### Resolution Options
1. **Accept Agent 1** - Because [reason]
2. **Accept Agent 2** - Because [reason]
3. **Combine** - Take [X] from Agent 1, [Y] from Agent 2
4. **Escalate** - Need human decision

### Decision
[Chosen resolution and reasoning]
```

---

## Best Practices

### Do

✅ Define clear, non-overlapping scopes
✅ Share common context efficiently
✅ Use appropriate agent types
✅ Plan for failure handling
✅ Synthesize results meaningfully
✅ Consider token cost vs benefit

### Don't

❌ Parallel agents for sequential work
❌ Overlapping file modifications
❌ Excessive parallelization (>4 agents usually)
❌ Ignore conflicting results
❌ Skip synthesis step
❌ Use Opus for everything (expensive)

---

## Example: Full Parallel Workflow

### Scenario: Comprehensive Feature Review

```markdown
# Feature Review: User Authentication Redesign

## Phase 1: Parallel Analysis (3 agents)

### Agent 1: Security Analysis
**Type**: spec-judge
**Model**: opus
**Scope**: Evaluate security implications
**Prompt**: "Analyze the authentication redesign for security vulnerabilities..."

### Agent 2: Performance Analysis
**Type**: spec-judge
**Model**: sonnet
**Scope**: Evaluate performance implications
**Prompt**: "Analyze the authentication redesign for performance impact..."

### Agent 3: Code Quality Analysis
**Type**: spec-judge
**Model**: sonnet
**Scope**: Evaluate code quality and maintainability
**Prompt**: "Analyze the authentication redesign for code quality..."

[Launch all three in parallel]

---

## Phase 2: Synthesis

### Security Findings (Agent 1)
- Critical: [X] issues
- High: [X] issues
- Medium: [X] issues
Recommendation: [Summary]

### Performance Findings (Agent 2)
- Impact: [X]% change expected
- Bottlenecks: [List]
Recommendation: [Summary]

### Code Quality Findings (Agent 3)
- Complexity: [Score]
- Test coverage: [X]%
- Technical debt: [Assessment]
Recommendation: [Summary]

---

## Phase 3: Combined Recommendation

### Must Fix Before Merge
1. [Critical security issue from Agent 1]
2. [Critical performance issue from Agent 2]

### Should Fix
1. [High priority items]

### Nice to Have
1. [Medium priority items]

### Overall Assessment
[Combined verdict: Approve / Approve with changes / Reject]
```

---

## Quick Reference

### Agent Launch Template

```markdown
Launch parallel agents:

1. **[Agent Name]** ([Type])
   - Model: [haiku/sonnet/opus]
   - Scope: [What to analyze/do]
   - Output: [Expected deliverable]
```

### Result Synthesis Template

```markdown
## Parallel Results

### [Agent 1 Name]
- Status: [✅/❌]
- Key findings: [Summary]
- Recommendations: [List]

### [Agent 2 Name]
...

## Synthesis
### Agreements
[What agents agreed on]

### Conflicts
[Where they disagreed]

### Decision
[Final recommendation]
```

---

**Use parallel agents strategically** for complex tasks that benefit from multiple perspectives or concurrent execution. Balance the token cost against the value of parallelization.
