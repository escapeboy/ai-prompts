---
name: company
description: "Run a task like an IT company: clarify it with the user, research, plan, split it into parts, staff teams of specialist agents with fitting models, and deliver through sprint-orchestrate and the other existing skills — stopping for the user only to clarify and to approve the plan, teams and budget. Use for multi-part work: a feature spanning several areas, a new project from scratch, a multi-angle audit, or an ops change across hosts. Invoke as /company <task>."
version: 0.1.0
---

# /company — an IT company for one task

`/company` is management, not a second orchestrator. It clarifies, researches, splits the work and staffs teams; the work itself runs through skills that already exist (`sprint-orchestrate` for code, `code-research` for audits, the ops skills for hosts). The back office is the `company-hq` mod: it hires project specialists as agent types, enforces the budget cap on every spawn, and shows the org in a pane.

## When to Use (and When NOT to)

| Use /company | Use something simpler |
|---|---|
| Work that splits into 2+ parts needing different expertise | One well-understood change → `/sprint-orchestrate quick` or just do it |
| A new project from an idea | A single bug → `fix-bug`; several competing causes → `/agent-team debug` |
| An audit across several angles (security, perf, UX, compliance) | One angle → that skill (`security-review`, `perf`, …) |
| An ops change touching several hosts or services | One read-only check → your host health/status skill |

If the task turns out small after intake (one part, ≤ ~5 files, one area), say so and propose the simpler path (e.g. `/sprint-orchestrate quick`) with a one-paragraph plan — that proposal IS stop 2: wait for the user's yes before any file is written. Never skip both stops because the task looked easy.

## The flow

Track the phase with `mcp__company-hq__set_phase` (load the `mcp__company-hq__*` tools with ToolSearch first). Write every artifact under `claudedocs/company/<slug>/` in the project (or `~/claudedocs/company/<slug>/` when there is no project yet).

| # | Phase | What happens | Detail |
|---|---|---|---|
| 0 | Intake | Classify (code / new project / audit / ops). Recall similar past projects from your memory store. Read `.continuity/STATE.md` if present. `open_project` with the default cap. | [references/memory.md](references/memory.md) |
| 1 | **Stop 1 — clarify** | Ask only what changes the result: ≤4 questions per round, options with a recommendation (`AskUserQuestion`). Look up anything the code, memory or docs can answer instead of asking. Rounds may repeat after research raises a real question. Use `decision-classify` to keep Mechanical/Taste choices away from the user. | [references/org-design.md](references/org-design.md#clarify) |
| 2 | Research | Read-only parallel subagents (cbm/Serena for code, Context7 for libraries, web). Output `research.md` with sources. | [references/workflows.md](references/workflows.md#research) |
| 3 | **Stop 2 — plan, org, budget** | Split into parts with disjoint files; write `docs/design-<part>.md` per part; staff teams from the roster, hire specialists only where no existing agent fits; pick models; estimate cost; present one page; wait for yes / change / cancel. | [references/org-design.md](references/org-design.md), [references/roster.md](references/roster.md) |
| 4 | Execute | Code: one worktree per part, each runs `/sprint-orchestrate plan → build → review → test --from-design docs/design-<part>.md`, parts in parallel via Workflow. Audit/ops: the matching skills. `confidence-check` before Build. | [references/workflows.md](references/workflows.md) |
| 5 | Integrate & review | Merge parts into an integration branch, run the full test suite, then `/sprint-orchestrate ship --no-merge` once (independent verifier PASS → PR → CI green). FAIL goes back to the owning team; after 2 rounds, stop and ask. | [references/workflows.md](references/workflows.md#integrate) |
| 6 | Deliver & remember | Report (PR URL / audit report / ops change list with rollback). `/retro`. `close_project`, write the project note to your memory store, update `.continuity/STATE.md`, offer to keep specialists that earned it. | [references/memory.md](references/memory.md) |

Between stop 2 and delivery, work without check-ins unless a gate fails twice, the cap is hit, or a destructive/outward action comes up.

## Defaults (edit these to your own)

- **Budget cap:** $25 per project unless the user sets another at stop 2. The mod refuses spawns past it; then stop and report.
- **Size:** ≤10 agents per Workflow run (the session guideline). More only with an explicit yes at stop 2.
- **New project:** `~/projects/<slug>` in your default stack unless the task implies another; `init-project`, then `sprint-orchestrate full`, then `devops` for CI/CD.
- **Ops hosts:** the hosts you list here, read-only by default. Any write, restart or other host is a separate yes.
- **Specialists:** hired per project (`company-hq:<name>`); at the end offer to save the ones that worked as permanent agents in `~/.claude/agents/`.
- **Language:** the user's language with the user; English in agent briefs.

## Borrowed rules (from agent-team, code-research, sprint-orchestrate)

- Every team owns a disjoint set of files; two agents never edit one file. Parallel code teams run with `isolation: 'worktree'`.
- Agent Teams (teammates that talk) only where talking is the point: competing-hypotheses debugging and cross-checking reviewers. Everything else is plain subagents — cheaper.
- State the team structure and the cost multiplier before spawning (3 agents ≈ 3–5× a session, 5 on a big task ≈ 8–10×).
- While teams run, the coordinator does not do their work; it waits, then synthesizes one structured report.
- Every brief carries your tool-routing block and the "verify, don't assume" rule — subagents don’t get the main conversation. See [references/briefs.md](references/briefs.md).
- Work runs unattended after stop 2, so a worker never grades itself: tests by command, `adversarial-verifier`, `/code-review`.

## Boundaries

**Always**
- Stop twice: after clarifying, and with the plan + org + cost before any agent writes code or touches a host.
- Open the project in `company-hq` with a cap before spawning; close it at the end, and also when the user cancels at a stop.
- Route code delivery through `sprint-orchestrate` (`--from-design`, `ship --no-merge`); do not re-implement its phases.
- Read command output for every "passes/works" claim; report failures as failures.

**Ask first**
- Merge, deploy, push to a shared branch, any write on a server, deleting anything.
- Raising the cap, more than 10 agents, or a 3rd fix round after FAIL.
- Saving a specialist as a permanent agent.

**Never**
- Let two agents edit the same file.
- Let a hired specialist or a mod approve a dangerous action.
- Present an estimate or a guess as a measured result.

## Related
- [`sprint-orchestrate`](../sprint-orchestrate/SKILL.md) — depends-on: runs each code part (`--from-design`) and the single ship (`--no-merge`).
- [`agent-team`](../agent-team/SKILL.md) — used for the parts where teammates must talk (debug, cross-review); lighter alternative when the whole task is one such review.
- [`code-research`](../code-research/SKILL.md) — the audit/research engine for phase 2 and for audit projects.
- [`decision-classify`](../decision-classify/SKILL.md), [`confidence-check`](../confidence-check/SKILL.md), [`continuity`](../continuity/SKILL.md), `ship` (if you have one) — used at the points named above.
- Mod: [`company-hq`](../../../17-mods/marketplace/mods/company-hq/) — see [`17-mods/guide.md`](../../../17-mods/guide.md) (tools `open_project`, `hire`, `set_phase`, `close_project`; `/company-status`).

---

**Task:** $ARGUMENTS
