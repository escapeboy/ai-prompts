---
name: agent-team
description: Spawn an agent team for parallel work — PR review, competing hypotheses debugging, or independent module implementation. Use only when teammates genuinely need to work simultaneously and communicate with each other.
---

# agent-team

Spawns a coordinated agent team for tasks that benefit from parallel, independent exploration.

## When to Use (and When NOT to)

| Use a team | Use something simpler instead |
|---|---|
| Teammates must talk to each other mid-task (competing hypotheses, cross-checking reviewers) | Parallel read-only research where agents just report back → [`code-research`](../code-research/SKILL.md) or plain background subagents |
| 3+ independent perspectives add real value | One reviewer is enough → `/code-review` or a single subagent |
| Work splits into non-overlapping file groups | Several agents would edit the same files → do it sequentially in one session |

Only spawn a team when ALL of these are true:
- Work can be split into **independent parts** (no shared file edits)
- Teammates benefit from **communicating with each other** (not just reporting back)
- The task is **complex enough** that 3+ perspectives add real value

## Preset modes (pass as argument)

### `/agent-team pr-review`
3 teammates reviewing the current branch changes:
- **Security** — IDOR, mass-assignment, cross-tenant leaks, rate limiting
- **Logic** — correctness, edge cases, missing error handling
- **Coverage** — test coverage for new code, missing assertions

### `/agent-team debug`
3-5 teammates investigating a bug with competing hypotheses — each tries to disprove the others' theories. Pass the bug description as the argument.

### `/agent-team feature`
Teammates each own an independent slice of a larger feature. Pass the feature description — Claude will decompose into non-overlapping file groups.

### `/agent-team custom`
Free-form — describe the team structure you want directly.

## Instructions to Claude

When this skill is invoked:

1. **Confirm** the team structure with the user before spawning (cost warning: each teammate = separate context window)
2. **Spawn** the appropriate team based on the preset or custom description
3. **Brief each teammate** with enough context: which files they own, what to focus on, what to avoid
4. **Wait** for teammates to finish — do not start doing work yourself while they are active
5. **Synthesize** findings from all teammates into a single structured report
6. **Clean up** the team when done (`Clean up the team`)

## Cost awareness

Agent teams consume significantly more tokens than a single session. Always mention this before spawning if the user hasn't explicitly acknowledged it.

Rough guidance:
- 3 teammates × medium task ≈ 3-5× normal session cost
- 5 teammates × large task ≈ 8-10× normal session cost

## Limitations to communicate

- No session resumption (`/resume` won't restore teammates)
- Task status can lag — nudge stuck teammates manually
- Each teammate owns different files — two editing the same file = overwrite risk
- One team per session — clean up before starting another

## PR review example output

After all reviewers finish, synthesize as:

```
## Agent Team Review — [branch name]

### Security (teammate 1)
[findings]

### Logic (teammate 2)
[findings]

### Test Coverage (teammate 3)
[findings]

### Summary
- Blockers: [list]
- Concerns: [list]
- Approved areas: [list]
```

## Boundaries

**Always**
- State the team structure and the rough cost multiplier before spawning.
- Give each teammate a disjoint set of files.
- Clean up the team when finished.

**Ask first**
- Before spawning more than 5 teammates, or a team on a large task (≈8-10× session cost).

**Never**
- Let two teammates edit the same file.
- Start a second team in the same session before the first is cleaned up.

## Related skills
- Guide: [`06-advanced-patterns/agent-teams-guide.md`](../../../06-advanced-patterns/agent-teams-guide.md) — how Agent Teams work and when they pay off.
- [`company`](../company/SKILL.md) — uses this skill (depended-on-by) for the parts of a larger project where teammates must talk (debug, cross-review); reach for `/company` when the whole task needs clarifying, splitting and staffing.
- [`code-research`](../code-research/SKILL.md) — read-only parallel research/audit of a codebase or git repo (agents fan out over non-overlapping slices, write durable notes, and do NOT talk to each other). Use it instead of a team when the goal is to map / audit / understand a codebase rather than have teammates coordinate mid-task.

---

**Task:** $ARGUMENTS
