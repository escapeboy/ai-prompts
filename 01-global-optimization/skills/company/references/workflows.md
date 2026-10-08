# Workflows

The user opted into multi-agent orchestration by invoking `/company`; this skill's instructions are
what authorize the Workflow tool here. Keep each run ≤10 agents unless approved at stop 2. Scripts
are plain JavaScript (no types), start with a literal `export const meta`, and may not call
`Date.now()`/`Math.random()`. Pass project data through `args`, not string interpolation of huge
blobs. Run one workflow per phase and read its result before the next — you stay in the loop.

## Research

Phase 2. Read-only, no worktrees. `args = { slug, task, angles: [{key, prompt}] }`.

```js
export const meta = {
  name: 'company-research',
  description: 'Parallel read-only research for a /company project',
  phases: [{ title: 'Research' }, { title: 'Synthesize' }],
}
const FINDINGS = { type: 'object', properties: {
  angle: { type: 'string' },
  findings: { type: 'array', items: { type: 'object', properties: {
    claim: { type: 'string' }, source: { type: 'string' }, verified: { type: 'boolean' } },
    required: ['claim', 'source', 'verified'] } },
  openQuestions: { type: 'array', items: { type: 'string' } } },
  required: ['angle', 'findings', 'openQuestions'] }

phase('Research')
const results = await parallel(args.angles.map(a => () => agent(
  `Project ${args.slug}. Task: ${args.task}\nResearch angle: ${a.prompt}\nRead-only. Every claim needs a source (file:line, URL, command output). Mark unverified claims verified=false.`,
  { label: `research:${a.key}`, phase: 'Research', schema: FINDINGS, agentType: a.agentType })))
phase('Synthesize')
return results.filter(Boolean)
```

Typical angles: `code` (Explore / cbm: where it lives, blast radius), `docs` (Context7 for the
libraries involved), `prior-art` (`ce-web-researcher`), `memory` (your memory store: past decisions).
The coordinator writes `research.md` from the result and asks a new stop-1 round only for
`openQuestions` that change the plan.

## Parts (code)

Phase 4. One agent per part in its own worktree; it runs the sprint for its part and commits on its
own branch. Parts with dependencies run in order; independent ones in parallel.
`args = { slug, base, waves: [[part, …], …] }`, part = `{ key, design, files, agentType, model, brief }`.

```js
export const meta = {
  name: 'company-parts',
  description: 'Each part runs sprint-orchestrate in its own worktree and branch',
  phases: [{ title: 'Build parts' }],
}
const REPORT = { type: 'object', properties: {
  part: { type: 'string' }, branch: { type: 'string' },
  status: { type: 'string', enum: ['DONE', 'PARTIAL', 'BLOCKED'] },
  checks: { type: 'array', items: { type: 'object', properties: {
    command: { type: 'string' }, passed: { type: 'boolean' }, outputTail: { type: 'string' } },
    required: ['command', 'passed', 'outputTail'] } },
  notes: { type: 'string' } },
  required: ['part', 'branch', 'status', 'checks', 'notes'] }

const reports = []
for (const wave of args.waves) {            // waves run in order; parts inside a wave in parallel
  const done = await parallel(wave.map(p => () => agent(
    `${p.brief}\n\nFirst: git checkout -b company/${args.slug}/${p.key} ${args.base}.\n` +
    `Then run /sprint-orchestrate plan build review test ${p.key} --from-design ${p.design}.\n` +
    `Commit your work on that branch. Do not push.`,
    { label: `part:${p.key}`, phase: 'Build parts', schema: REPORT, isolation: 'worktree',
      agentType: p.agentType ?? 'general-purpose', model: p.model })))   // needs the Skill tool for /sprint-orchestrate
  reports.push(...done.filter(Boolean))
  if (done.some(r => !r || r.status === 'BLOCKED')) { log('a part is BLOCKED; stopping before the next wave'); break }
}
return reports
```

A part whose report is not DONE, or whose checks are not all `passed`, is not merged. Fix it with
the same team (one more wave of one) — at most 2 rounds, then ask the user.

## Integrate

Inline, not a workflow (sequential, needs judgement):

1. `git checkout -b company/<slug>/integration <base>`; merge each DONE branch in wave order.
   A conflict means the split leaked a shared file: resolve it in the integration part, note it.
2. Run the project's full test suite and build; read the output.
3. `/sprint-orchestrate ship company-<slug> --no-merge`: independent verifier
   (PASS required), PR, CI green.
4. FAIL → map each blocker to the part that owns the file → re-run that part's team → re-merge.
   Two FAIL rounds → stop and ask.

## Review with talking reviewers (optional)

For a large or risky diff, after step 2: `/agent-team pr-review` on the integration branch
(security + logic + coverage, cross-checking). Use it instead of, not in addition to, a plain
`/code-review` on the same diff.

## Audit projects

Use `code-research` as the engine (it already splits by area and writes a knowledge base). The
company adds: which angles (security / perf / UX / compliance / gaps), one consolidated report with
severity, and the stop-2 budget.

## Ops projects

No parallel writes. Plan the steps in order with a rollback line each. Read-only checks
(host health, service status, TLS expiry) may run in parallel; every write is shown
to the user and confirmed one by one, per Action Safety.
