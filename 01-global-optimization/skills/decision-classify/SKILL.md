---
name: decision-classify
description: "Classify decisions as Mechanical/Taste/User Challenge to reduce interruptions without losing user control"
version: 1.0.0
---

# /decision-classify - Decision Classification Framework

Classify intermediate decisions during skill or agent execution to determine which need user input and which can be auto-resolved.

## When to Use (and When NOT to)

| Use this skill for | Use a simpler approach for |
|---|---|
| A mid-execution decision where it's unclear whether to ask the user | An obviously mechanical choice (one clearly correct answer) — just make it |
| Deciding whether to interrupt with a question or proceed and log the choice | A decision the user already explicitly specified — just follow it |
| Framing a case where the agent thinks the user's direction should change | Routine implementation choices with no real tradeoff — skip classification |

## Usage

```
/decision-classify [context]
```

Run this when a skill or agent faces a decision during execution. It classifies the decision and recommends the appropriate handling.

## The Three Types

### 1. Mechanical — Auto-decide silently

One clearly correct answer. Reasonable engineers would all choose the same.

**Examples**: Import ordering, file placement following conventions, variable naming per project style, dependency version resolution.

**Test**: Would two senior engineers independently make the same choice?

### 2. Taste — Auto-decide, surface later

Multiple valid approaches. One is slightly better for this context but the other is defensible.

**Examples**: Extract helper vs inline, choosing between equivalent libraries, component granularity, unit vs integration test for a case.

**Surface as**:
```
TASTE DECISION: [what was decided]
Chose: [option] because [reason]
Alternative: [other option] — would work if [condition]
```

**Test**: Could a senior engineer reasonably prefer the other option?

### 3. User Challenge — ALWAYS ask

The agent believes the user's stated direction should change.

**Examples**: User asked for REST but WebSocket fits better, requested feature contradicts architecture, scope will take 10x longer than expected, security concern.

**Present as**:
```
USER CHALLENGE: [topic]

What you asked for: [user's direction]
What I recommend: [alternative]

Why:
- [evidence 1]
- [evidence 2]

What context I might be missing:
- [possible reason user is right]

RECOMMENDATION: [specific action]
If you still prefer [original], I'll proceed — you have context I don't.
```

**Test**: Am I about to override what the user explicitly asked for?

## Classification Flowchart

```
Is there only one correct answer? → YES → MECHANICAL
                                    NO ↓
Could reasonable engineers disagree? → NO → MECHANICAL
                                       YES ↓
Does this contradict user's direction? → YES → USER CHALLENGE
                                         NO → TASTE
```

## Anti-Sycophancy Rules

Apply during diagnostic/analysis phases:

| Don't Say | Say Instead |
|-----------|-------------|
| "That's an interesting approach" | "This has [specific problem]" |
| "You might want to consider..." | "This will cause [issue] because..." |
| "Both approaches have merits" | "[A] is better because [reason]" |
| "It depends" | "For your case, use [X] because [reason]" |

**Rules**:
1. Take a position. State it AND what evidence would change it.
2. Name specifics: file names, functions, line numbers, real numbers.
3. End with what to do, not what to think about.
4. Push once, then push again — first answer is usually polished.

## Dual Effort Scales

Show both human and AI-assisted effort on options:

```
Option A: Full implementation (human: ~2 days / Claude Code: ~30 min)
Option B: MVP only (human: ~3 hours / Claude Code: ~10 min)
```

This prevents premature scope cuts — tasks cheap with AI shouldn't be skipped for effort reasons.

## Boundaries

**Always**: Surface every User Challenge case to the user before proceeding — never auto-resolve a case where the agent believes the user's stated direction should change. Log every auto-resolved Taste decision (chosen option, reason, alternative) rather than dropping it silently.

**Ask first**: Nothing beyond the invocation itself — classifying and surfacing decisions per the flow above is this skill's stated purpose.

**Never**: Silently override or reinterpret the user's explicit direction without presenting it as a User Challenge.

## Related
- Guide: [`06-advanced-patterns/decision-classification-guide.md`](../../../06-advanced-patterns/decision-classification-guide.md) — the full framework with examples.
- [`sprint-orchestrate`](../sprint-orchestrate/SKILL.md) — applies this at every phase transition.
- [`confidence-check`](../confidence-check/SKILL.md) — the readiness gate that runs before these decisions come up.
