# Phase 1 — Decompose · Fan out

Split the codebase into **non-overlapping slices**, spawn one background agent per slice. Enumerate the target FIRST (list the actual controllers/dirs/integrations) so slices are exhaustive — gaps are the #1 failure mode.

## Choose the slicing axis

### By domain (default first pass — "understand + audit")
5 classic slices, each a whole-codebase lens:
- **Feature inventory** — what IS built (modules, controllers, models, routes, tests).
- **Gaps & unfinished** — TODO/FIXME/stub markers, skeletons, half-migrated code, missing pieces. Grep markers: `TODO FIXME HACK XXX @todo NotImplemented WIP "coming soon" placeholder stub HARDCODED dd( var_dump(`.
- **Security** — auth/authz, tenant isolation/IDOR, mass-assignment, injection (SQL/command), unescaped output, file uploads, secrets, SSRF. Split CONFIRMED vs NEEDS-REVIEW vs VERIFIED-SAFE.
- **UI/UX** — design system, component reuse, a11y, i18n, responsive, tech debt. Read the design docs first, then check code against them.
- **Services / non-core** — each sibling service (workers/queues, API gateways, SSR, assets) rated Complete/Partial/Stub/Demo, with integrations + reliability.

### By directory slice (for 100% "every line")
When the user wants every line audited, the domain lenses aren't enough. Slice by directory and have each agent LINE-READ its files and confirm coverage:
- Controllers (split A/B if hundreds), Services/Enums/Middleware/Providers/Console, Models/Migrations/Config, each non-core service, docs-vs-code drift, infra (docker/nginx/php/ci/scripts).
- After the first round, **enumerate what wasn't covered** (`find` the controller/model dirs, subtract what agents reported) and spawn a follow-up for the remainder. Line-level "100%" almost always needs a gap-closing follow-up.
- Each agent MUST end with an explicit coverage statement ("read every file in scope" or "line-read X, sampled Y").

### By integration / vertical
For integration-heavy codebases (payments, couriers, feeds, ERP, channels): enumerate the integration dirs, group into ~10 categories, one agent per category, each writing ONE note per integration. See `competitor-gap.md`.

## Fan-out mechanics
- Spawn with the Agent tool, `run_in_background: true`, one call per slice (or all in one message for max parallelism). Pick a specialized `subagent_type` where it fits (security-engineer, frontend-architect, backend-architect); `general-purpose` for breadth.
- Each agent writes to its **own** KB note path (distinct filename) → no write conflicts. Tell it the exact path.
- Give every agent the grounding contract from `agent-prompts.md` (cite paths, don't assume, don't modify code, return a short summary).
- Heavy slices (hundreds of files) can themselves spawn sub-agents — expect nested completion notifications; a parent may sit in a heartbeat-wait after its children finish (stop it with `TaskStop` once you have all sub-reports).

## Sizing
- Match agent count to scope and the user's stated appetite. "find any bugs" → a few agents; "thoroughly audit / every line" → many + a verify pass. Confirm cost before a ≫10-agent run.
- Concurrency caps ~10-16; excess queues. Total lifetime cap is far above any real run.
