# Clarify, split, staff, estimate

## Clarify

Ask only questions whose answer changes what gets built or how it is judged. Before asking, look:
the code (cbm `get_architecture`, `search_graph`), memory (your notes store, auto-memory), the repo docs.

Good questions: scope edges ("does X include Y?"), success criteria, constraints the code can't
show (deadline, hosts, data that must not change), taste choices with real trade-offs.
Not questions: anything `decision-classify` calls Mechanical; anything with an obvious default
(state the default in the plan instead).

`AskUserQuestion`: ≤4 questions, 2–4 options each, recommended option first with "(Recommended)".
In a non-interactive run (`claude -p`, no AskUserQuestion): write the questions to
`claudedocs/company/<slug>/questions.md`, print them, and stop. The same holds at stop 2: write
`plan.md` (the stop-2 page), print it, and stop — nobody is there to say yes.

## Split into parts

A part is a unit one team can finish and verify alone.

1. List the files/areas the change touches (cbm `trace_path` for blast radius).
2. Group them so no file is in two groups. Shared files (routes, config, migrations index,
   lockfiles) go to ONE owner — usually an "integration" part done last.
3. Order: parts that others depend on (schema, API contract) first, or give them a contract file
   up front that the dependents code against.
4. Fewer, bigger parts beat many tiny ones: each part costs a worktree, a design doc and a review.
   2–4 parts is typical; 1 part means "use sprint-orchestrate directly".

For each part write `docs/design-<part>.md`: goal, owned files, contract with other parts,
acceptance criteria, test plan seeds. This is the doc `sprint-orchestrate --from-design` reads.

## Staff teams

Per part, one team. A team is a lead (does the sprint for the part) plus specialists it may call.

- Prefer existing agents ([roster.md](roster.md)). Hire (`mcp__company-hq__hire`) only when no
  agent fits — e.g. a domain the roster lacks (Directus, a specific payment provider, a legacy
  framework). A hire needs: kebab-case name, team, description (when to delegate), a system prompt
  with role + expertise + owned files + rules + deliverable, and a model.
- Hired types are usable from the NEXT turn — hire at stop 2, start work after the user's yes.
  Observed (Claude Code 2.1.29x): in a multi-turn `claude -p` session a type hired mid-session was NOT found
  (`AgentTypeError`), while a new session saw it (the mod re-registers the roster at start).
  Fallback when the type is missing: spawn `general-purpose` with the hired prompt at the top of the
  brief and the hire's `model` — same specialist, no registry needed.
- Talking teammates (`agent-team`) only for: debugging with competing hypotheses, a review where
  reviewers must cross-check each other. One Agent Team per session.

### Model per role (policy `claude-code-model-routing`)

| Role | Model |
|---|---|
| Mechanical: templates, renames, boilerplate, formatting, docs from code | haiku |
| Implementation, tests, debugging, most reviews | sonnet |
| Architecture choices, security review, independent verification, judging between options | opus |

`subagent-models` enforces this for known agents; set `model` explicitly for hires and in Workflow
`agent()` calls only when it differs from the agent's own.

## Estimate cost

Measure, then scale: look at `/spend month` (spend-ledger) for what similar work cost. Rough guide
when there is no history:

| Unit | Typical |
|---|---|
| Sonnet agent, medium part (plan → test) | $1–4 |
| Opus verifier pass on a branch | $1–3 |
| Read-only research agent | $0.2–1 |

State it as a range and label it an estimate. No cap unless the user asks for one.

## The stop-2 page

One screen, in the user's language:

```
Task: …              Type: code | new project | audit | ops
Parts and teams:
  1. <part> — files: … — lead: <agent> (sonnet), specialists: …
  2. …
New specialists: <name> (model) — why
Order: 1 → (2 ∥ 3) → integration → ship --no-merge
Checks: tests by command, adversarial-verifier, /code-review
Cost: ~$X–Y (estimate), cap: none | $Z. Agents: N.
Stops before: merge, deploy, server writes.
```

Then ask: Yes / Change / Cancel.
