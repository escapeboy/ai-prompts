---
name: sprint-orchestrate
description: "Run a full sprint lifecycle — chain skills into Think → Plan → Build → Review → Test → Ship → Reflect"
version: 1.2.0
---

# /sprint-orchestrate - Sprint Lifecycle Orchestrator

Chain skills into a complete development lifecycle where each phase feeds the next.

## When to Use (and When NOT to)

| Use this skill for | Use a simpler approach for |
|---|---|
| A feature that needs the full Think→Plan→Build→Review→Test→Ship→Reflect chain | A single well-understood step (e.g. just testing) — run that one phase directly: `/sprint-orchestrate [phase] [feature]` |
| Coordinating multiple phases where each output feeds the next | A change that's already implemented and tested — run the Ship phase alone: `/sprint-orchestrate ship [feature]` |
| A sprint that needs metrics/insights captured afterward | A quick fix with no lasting design decisions to record — skip straight to `/qa` + the Ship phase, no need for Think/Plan/Reflect |

## Usage

```
/sprint-orchestrate [phase] [feature-name] [--from-design <path>] [--no-merge]
```

| Flag | Effect |
|------|--------|
| `--from-design <path>` | Skip Think. The given design doc (already agreed with the user, e.g. by `/company`) is copied to `docs/design-[feature].md` if it lives elsewhere, and the Think → Plan gate counts as passed. |
| `--no-merge` | Ship stops at a green PR: report the PR URL and the verifier verdict, never merge. The caller merges after the user's yes. |

### Phases

| Phase | Skills Used | Output |
|-------|------------|--------|
| `think` | Manual / brainstorm | Design doc at `docs/design-[feature].md` |
| `plan` | Architecture + test plan | `docs/architecture-[feature].md`, `docs/test-plan-[feature].md` |
| `build` | Implementation | Code on feature branch |
| `review` | Code review | Review findings |
| `test` | `/qa` | Test results, regression tests |
| `ship` | Independent verifier gate → `/commit` + PR | Merged PR |
| `reflect` | `/retro` | Metrics, insights, action items |
| `full` | All phases sequentially | Complete sprint |

## Behavioral Flow

### Full Pipeline (`/sprint-orchestrate full [feature]`)

1. **Think** (skipped with `--from-design`): Ask the user six forcing questions:
   - Who needs this? What are they doing today?
   - What's the narrowest MVP someone would pay for?
   - What would make someone say "whoa"?
   - How does this compound over time?
   Save answers to `docs/design-[feature].md`.

2. **Plan**: From the design doc, create:
   - Architecture plan with data flow and component design
   - Test plan with edge cases and acceptance criteria
   Save to `docs/architecture-[feature].md` and `docs/test-plan-[feature].md`.
   - End the architecture doc with a `## Tasks` checklist (`- [ ] T1 …`), small checkable tasks — format and rules in [references/tasks.md](references/tasks.md).
   - **Probe the target host** when the code will run somewhere other than this machine: a 60s SSH
     check of the binaries, data schema, auth state and SSH alias the plan assumes. Record every
     mismatch in the architecture doc before Build — they are cheap here and expensive at deploy.

3. **Build**: Implement on feature branch following the architecture plan. Reference test plan for edge cases. Tick each task `[x]` in `## Tasks` as it is done; a task found on the way is added with `{added}`. Never delete or rename a task.

4. **Review**: Run code review on the branch diff on a stronger model than the builder's (Opus by default). The same review checks every ticked task against the diff and tests and marks it `{verified}` or `{rejected: <reason>}` ([references/tasks.md](references/tasks.md)). Fix all findings and rejected tasks before proceeding.

5. **Test**: Run `/qa --full`. Pick up test plan from step 2 automatically. Record `Result: PASS|FAIL <date>` under the title of `docs/test-plan-[feature].md`.

6. **Ship**: Before creating the PR, spawn an **independent verifier subagent** on the branch diff as a **mandatory gate** — e.g. [`output-evaluator`](../../../10-subagents/examples/output-evaluator.md), or your own adversarial verifier that re-runs the gates itself, marks every causal claim PROVEN/UNSUPPORTED, sweeps sibling repos for the same defect, and checks adjacent regressions. It must not be the agent that wrote the code:

   ```
   Agent(subagent_type: "<your-verifier>",
        prompt: "Diff to verify: <git diff [base]...HEAD>. Goal: <feature>. Disprove it. Return VERDICT: PASS|FAIL per your checklist.")
   ```

   - **FAIL → do not create the PR.** Fix the blocking issues, re-run the gate, loop until PASS.
   - **PASS →** run `/commit` with a descriptive message and create the PR, building its description from the verifier's report. No unverified causal claims.
   - **Wait for CI** with `gh pr checks <N> --watch --fail-fast` in a background Bash call (`run_in_background: true`); it exits when CI finishes and the harness notifies you. Do not delegate a plain CI wait to a subagent.
   - **With `--no-merge`:** stop here once CI is green and report the PR URL; do not merge.

7. **Reflect**: Run `/retro 7d` for sprint metrics.

### Quick Pipeline (`/sprint-orchestrate quick [feature]`)

For well-understood changes — skip Think/Plan (so there is no `## Tasks` list to tick or verify):

1. Implement on branch
2. Review
3. Test with `/qa --fix`
4. Ship: run the independent verifier gate (see Full pipeline step 6) — PASS required — then `/commit` + PR

### Single Phase (`/sprint-orchestrate [phase] [feature]`)

Run just one phase. Looks for artifacts from prior phases:
- `plan` reads `docs/design-[feature].md` if it exists
- `review` reads `docs/architecture-[feature].md` for compliance
- `test` reads `docs/test-plan-[feature].md` for test cases

## Decision Gates

At each transition, check before proceeding:

| Gate | Proceed When | Loop Back When |
|------|-------------|----------------|
| Think → Plan | Scope clear, problem defined | Unclear requirements |
| Plan → Build | Architecture approved, test plan exists, `## Tasks` list written, target host probed (if remote) | Missing edge cases, unprobed target |
| Build → Review | Feature complete, no TODOs, every task `[x]` (or an open one explained) | Partial implementation |
| Review → Test | All findings addressed, every `[x]` task `{verified}`, none `{rejected}` | Critical bugs found, a task rejected |
| Test → Ship | All tests pass, `Result: PASS` recorded | Test failures (`Result: FAIL`) |
| Ship (verify → PR) | Verifier returns PASS | Gate fails, unsupported claim, or sibling repo carries the same defect |

## Artifact Locations

| Artifact | Path | Created By | Used By |
|----------|------|-----------|---------|
| Design doc | `docs/design-[feature].md` | Think | Plan, Review |
| Architecture + `## Tasks` | `docs/architecture-[feature].md` | Plan (tasks ticked by Build, verified by Review) | Build, Review, `/company` dashboard |
| Test plan + `Result:` line | `docs/test-plan-[feature].md` | Plan (result by Test) | Test, `/company` dashboard |
| Retro report | `retro/retro-[date].md` | Reflect | Next sprint |

## Anti-Patterns

- **Skipping Think** — building without understanding leads to rework
- **Parallel Review+Test** — fixes from review invalidate test results
- **No Reflect** — same mistakes repeated sprint after sprint
- **Test after Ship** — QA becomes incident response

## Boundaries

**Always**
- Require an independent verifier PASS before creating the PR at Ship.
- Verify every ticked task at Review on a stronger model than the builder's; a builder's `[x]` is a claim, not a result.
- Require CI green (`gh pr checks --watch --fail-fast`) before merge.
- Probe the target host before Build when the code will run somewhere other than this machine.

**Ask first**
- Before skipping Think/Plan on a change that touches shared or production-facing behavior (the Quick pipeline is for well-understood, low-risk changes only).

**Never**
- Merge on a failing gate (verifier FAIL, unsupported causal claim, failing CI, or an unprobed remote target).

## Related

- Guide: [`06-advanced-patterns/sprint-orchestration-guide.md`](../../../06-advanced-patterns/sprint-orchestration-guide.md) — the full walkthrough of this lifecycle.
- [`confidence-check`](../confidence-check/SKILL.md) — run before Build (depends-on: readiness gate between Plan and Build).
- [`decision-classify`](../decision-classify/SKILL.md) — decides which intermediate choices in each phase need the user.
- [`ui-ux-review`](../ui-ux-review/SKILL.md) — Review-phase companion when the sprint touches UI.
- [`company`](../company/SKILL.md) — runs above this skill (depended-on-by): clarifies the task, splits it into parts and teams, then runs `--from-design` per part and one `ship --no-merge` on the integration branch.
- [`references/tasks.md`](references/tasks.md) — the `## Tasks` checklist format; the optional [`company-hq`](../../../17-mods/marketplace/mods/company-hq/) dashboard (see [`17-mods/guide.md`](../../../17-mods/guide.md)) reads it.
