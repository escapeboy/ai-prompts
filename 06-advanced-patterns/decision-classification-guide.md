# Decision Classification Guide

**Classify decisions to reduce interruptions without losing user control**

When skills or agents encounter intermediate decisions during execution, not every decision needs user input. This guide provides a framework for classifying decisions and handling each type appropriately.

---

## The Three Decision Types

### 1. Mechanical Decisions

**Definition**: One clearly correct answer exists. Reasonable engineers would all choose the same option.

**Action**: Auto-decide silently. Don't surface to user.

**Examples**:
- Import ordering (alphabetical vs grouped — follow existing convention)
- File placement (new controller goes in `app/Http/Controllers/`)
- Variable naming (follow project conventions)
- Dependency resolution (use the version that satisfies all constraints)
- Error message format (match existing error patterns)

**Test**: "Would two senior engineers independently make the same choice?" If yes → Mechanical.

---

### 2. Taste Decisions

**Definition**: Reasonable people could disagree. Multiple valid approaches exist, but one is slightly better for this context.

**Action**: Auto-decide, but **surface the choice** at the next natural checkpoint (PR summary, review output, or skill completion).

**Examples**:
- Extracting a helper function vs inline code (both valid)
- Choosing between two equivalent libraries
- Deciding component granularity (one component vs split into three)
- CSS approach (Tailwind utility vs custom class)
- Test strategy (unit vs integration for a specific case)

**Surfacing format**:
```
TASTE DECISION: [what was decided]
Chose: [option A] because [reason]
Alternative: [option B] — would work if [condition]
```

**Test**: "Could a senior engineer reasonably prefer the other option?" If yes → Taste.

---

### 3. User Challenge Decisions

**Definition**: The agent believes the user's stated direction should change. Both analysis and evidence suggest a different approach.

**Action**: **NEVER auto-decide.** Present to the user with full context.

**Examples**:
- User asked for REST API but the use case strongly suggests WebSocket
- User wants to add a feature that contradicts existing architecture
- Scope request that will take 10x longer than the user likely expects
- Security concern with the requested approach

**Presentation format**:
```
USER CHALLENGE: [topic]

What you asked for: [user's stated direction]
What I recommend: [alternative approach]

Why:
- [Evidence point 1]
- [Evidence point 2]

What context I might be missing:
- [Possible reason user's approach is correct]
- [Domain knowledge I may lack]

RECOMMENDATION: [specific recommendation]
If you still prefer [original direction], I'll proceed — you have context I don't.
```

**Test**: "Am I about to override what the user explicitly asked for?" If yes → User Challenge.

---

## Decision Classification Flowchart

```
Is there only one correct answer?
  YES → MECHANICAL (auto-decide silently)
  NO ↓

Could reasonable engineers disagree?
  YES ↓
  NO → MECHANICAL

Does this contradict the user's stated direction?
  YES → USER CHALLENGE (always ask)
  NO → TASTE (auto-decide, surface later)
```

---

## Anti-Sycophancy Rules

When presenting decisions — especially User Challenges — apply these rules:

### Banned Phrases (during diagnostic/analysis phases)

| Don't Say | Say Instead |
|-----------|-------------|
| "That's an interesting approach" | "This approach has [specific problem]" |
| "You might want to consider..." | "This will cause [specific issue] because..." |
| "There are some trade-offs to think about" | "[Option A] is better because [reason]. [Option B] fails when [scenario]." |
| "It depends on your use case" | "For [your specific case], use [X] because [reason]" |
| "Both approaches have merits" | "[A] is better here. [B] would only be better if [specific condition that doesn't apply]" |
| "That could work" | "That works" or "That won't work because [reason]" |

### Positive Rules

1. **Take a position on every answer.** State your position AND what evidence would change it.
2. **Challenge the strongest version of the claim**, not a strawman.
3. **Push once, then push again** — the first answer is usually the polished one. The second push reveals real constraints.
4. **Name specifics**: file names, function names, line numbers, real numbers. Never "some files" or "a few issues."
5. **End with what to do**, not what to think about.

---

## Dual Effort Scales

When presenting options to the user, show effort in both human and AI-assisted terms. This reframes build-vs-skip decisions:

```
**Option A**: Full implementation with edge cases
  (human: ~3 days / Claude Code: ~45 min)

**Option B**: MVP with happy path only
  (human: ~4 hours / Claude Code: ~15 min)

**Option C**: Skip, use existing library
  (human: ~30 min / Claude Code: ~10 min)
```

This matters because tasks that seem "not worth the effort" in human terms are often trivially cheap with AI. The dual scale prevents premature scope cuts.

### When to Show Dual Scales

- Options differ significantly in scope
- User is making a build-vs-buy decision
- Scope reduction is being considered for effort reasons (not complexity reasons)

---

## Applying to Skills

### In Skill Definitions

Add a decision classification section to skills that make intermediate decisions:

```markdown
## Decision Classification

This skill auto-decides the following:
- **Mechanical**: [list mechanical decisions this skill makes]
- **Taste**: [list taste decisions — surfaced in output]

This skill ALWAYS asks for:
- **User Challenge**: [list scenarios that require user input]
```

### In Agent Definitions

For subagents, specify decision authority in the prompt:

```markdown
## Decision Authority

- Auto-decide: file placement, naming conventions, import ordering
- Surface at completion: library choices, test strategy, component structure
- Always ask: scope changes, architecture deviations, security trade-offs
```

---

## Integration with Sprint Orchestration

Decision classification is most valuable at phase transitions (see [Sprint Orchestration Guide](sprint-orchestration-guide.md)):

| Phase Transition | Common User Challenges |
|-----------------|----------------------|
| Think → Plan | "This is actually two features, not one" |
| Plan → Build | "This architecture won't scale for your data volume" |
| Build → Review | "This approach contradicts the design doc" |
| Review → Test | "These fixes changed the scope — re-review needed" |
| Test → Ship | "Test coverage is below threshold" |
