# Sprint Orchestration Guide

**Chain skills into a complete development lifecycle**

This guide shows how to connect individual skills into a coherent pipeline where each step feeds the next. Inspired by the principle that tools work best as a process, not a collection.

---

## The Sprint Lifecycle

```
Think → Plan → Build → Review → Test → Ship → Reflect
```

Each phase produces artifacts that downstream phases consume. Nothing falls through the cracks because every step knows what came before it.

---

## Phase Map

| Phase | Skill(s) | Input | Output |
|-------|----------|-------|--------|
| **Think** | `/office-hours` or manual | Problem statement | Design doc / spec |
| **Plan** | `/sc:design` or `/sc:spec-panel` | Design doc | Architecture plan, test plan |
| **Build** | `/sc:implement` or manual | Architecture plan | Code changes on feature branch |
| **Review** | `/review` (code-review skill) | Feature branch diff | Review findings, fix list |
| **Test** | `/qa` | Code + test plan from Plan phase | Test results, regression tests |
| **Ship** | `/commit` + PR creation | Passing tests | Merged PR |
| **Reflect** | `/retro` | Git history | Metrics, insights, action items |

---

## Artifact Flow

The key insight is that **artifacts chain forward**:

```
/office-hours → writes design doc
                    ↓
/sc:design → reads design doc, writes architecture + test plan
                    ↓
[implement] → follows architecture plan
                    ↓
/review → reads diff against architecture plan
                    ↓
/qa → picks up test plan from design phase
                    ↓
/commit → packages reviewed, tested code
                    ↓
/retro → analyzes git history, closes the loop
```

### Where to Store Artifacts

| Artifact | Location | Consumed By |
|----------|----------|-------------|
| Design doc | `docs/design-[feature].md` | Plan, Review |
| Architecture plan | `docs/architecture-[feature].md` | Build, Review |
| Test plan | `docs/test-plan-[feature].md` | QA |
| Review findings | PR comments or `reviews/` | Ship |
| Retro report | `retro/retro-[date].md` | Next sprint planning |

---

## Running the Pipeline

### Full Pipeline (complex features)

Use all phases for features that span multiple days or involve architectural decisions:

```
1. /office-hours "user authentication with OAuth"
   → Produces design doc with scope, trade-offs, and decisions

2. /sc:design (or manual architecture)
   → Reads design doc, produces architecture plan + test plan

3. [Implement on feature branch]
   → Follow architecture plan, reference test plan for edge cases

4. /review (via code-review skill or PR review)
   → Catches bugs, N+1 queries, missing error handling
   → Fix findings before proceeding

5. /qa --full
   → Runs test plan, generates regression tests for any bugs found

6. /commit + create PR
   → All tests passing, review complete

7. /retro 7d
   → End-of-sprint analysis with metrics and insights
```

### Quick Pipeline (small features, bug fixes)

Skip Think/Plan for well-understood changes:

```
1. [Implement fix on branch]
2. /review (quick code review)
3. /qa --fix (test + auto-fix)
4. /commit
```

### Automated Pipeline (for experienced users)

Chain skills in a single session with explicit handoffs:

```markdown
## Sprint: [Feature Name]

### Phase 1: Think
Run /office-hours with: "[feature description]"
Save output to docs/design-[feature].md

### Phase 2: Plan
Using the design doc at docs/design-[feature].md, create:
- Architecture plan at docs/architecture-[feature].md
- Test plan at docs/test-plan-[feature].md

### Phase 3: Build
Implement following the architecture plan. Reference test plan for edge cases.

### Phase 4: Review + Test
Run /review on the current branch, then /qa --full.
Fix any findings before proceeding.

### Phase 5: Ship
Run /commit with a descriptive message. Create PR.
```

---

## Decision Gates

At each phase transition, evaluate whether to proceed or loop back:

| Gate | Condition to Proceed | Loop Back When |
|------|---------------------|----------------|
| Think → Plan | Clear problem statement, scope defined | Scope creep, unclear requirements |
| Plan → Build | Architecture approved, test plan exists | Missing edge cases, unclear data flow |
| Build → Review | Feature complete, no known TODOs | Partial implementation, blocking unknowns |
| Review → Test | All review findings addressed | Critical bugs, architectural concerns |
| Test → Ship | All tests pass, coverage adequate | Test failures, missing regression tests |
| Ship → Reflect | PR merged, deployed | CI failures, rollback needed |

---

## Connecting to Existing Skills

### Skills from this library that fit each phase:

**Think**:
- `/sc:brainstorm` — interactive requirements discovery
- `/sc:spec-panel` — multi-expert specification review

**Plan**:
- `/sc:design` — system architecture and API design
- `/sc:workflow` — generate implementation workflows from PRDs
- `/confidence-check` — pre-implementation readiness assessment

**Build**:
- `/sc:implement` — feature implementation with MCP integration
- `/debug` — systematic debugging during implementation

**Review**:
- Code review skill (`/code-review`) — PR review
- `/sc:analyze` — comprehensive code analysis
- `/content-review` — user-facing content audit

**Test**:
- `/qa` — comprehensive QA with browser automation
- `/sc:test` — test execution with coverage analysis

**Ship**:
- `/commit` — git commit with conventional messages
- `/deploy` — pre-deploy validation and deployment

**Reflect**:
- `/retro` — sprint retrospective with git analytics
- `/sc:reflect` — task reflection and validation

---

## Cross-Session Continuity

For multi-day sprints, maintain continuity across sessions:

1. **Serena memories**: Store architectural decisions that persist across sessions
2. **Design docs**: Written to filesystem, available in every session
3. **Git branch**: Work-in-progress preserved on feature branch
4. **Retro reports**: Historical velocity data builds over time

### Recommended Serena Memories

```
sprint-current    — active feature, current phase, blockers
architecture      — key architectural decisions for the project
test-strategy     — testing conventions and coverage targets
velocity-baseline — established metrics from /retro history
```

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Skipping Think | Building without understanding leads to rework | Even 10 minutes of /office-hours saves hours |
| Skipping Review | Bugs reach production | Always review before test |
| Test after Ship | QA becomes incident response | Test before merge, not after deploy |
| No Reflect | Same mistakes repeated | Run /retro at least biweekly |
| Parallel Review+Test | Fixes from review invalidate test results | Review first, fix, then test |
