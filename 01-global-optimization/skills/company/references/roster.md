# Roster: who to staff

> Example roster from one setup. Replace the agent names with the ones installed in yours (`/agents`).

Existing agent types (Agent `subagent_type` / Workflow `agentType`). Models for `~/.claude/agents/*`
are their frontmatter, optionally enforced by the `subagent-models` mod; check
`/agent-models` for what actually ran.

## By role

| Role | Agent | Model | Use for |
|---|---|---|---|
| Lead / generalist | `general-purpose` | sonnet (mod) | Runs a part's sprint; anything without a specialist |
| Architecture | `system-architect` | opus | Cross-part design, contracts between parts |
| | `backend-architect` | sonnet | API, data integrity, services |
| | `frontend-architect` | sonnet | UI architecture, accessibility |
| | `feature-dev:code-architect` | session | Blueprint from existing patterns |
| Laravel / Vue | `agents-development-architecture:laravel-vue-developer` | session | Laravel + Vue3 full stack |
| Next.js / React | `agents-development-architecture:nextjs-app-router-developer`, `frontend-developer` | session | |
| iOS / Swift | `agents-development-architecture:ios-developer` | session | with `swiftui-pro` skill |
| Python | `python-expert` | sonnet | |
| CMS | `wordpress-developer`, `drupal-developer`, `directus-developer` (agents-development-architecture:) | session | |
| Data | `agents-infrastructure-operations:database-optimizer`, `database-admin` | session | Queries, migrations, indexes |
| Infra | `devops-architect` | sonnet | CI/CD, deploy pipelines |
| | `agents-infrastructure-operations:devops-troubleshooter` | session | Prod incidents, logs |
| | `agents-infrastructure-operations:network-engineer` | session | DNS, TLS, proxies |
| Debugging | `root-cause-analyst` | sonnet | One deep investigation |
| Quality | `quality-engineer` | sonnet | Test strategy, edge cases |
| | `performance-engineer` | sonnet | Measured bottlenecks |
| | `refactoring-expert` | sonnet | |
| Security | `security-engineer` | opus | Threats, auth, secrets |
| Review | `compound-engineering:ce-correctness-reviewer`, `ce-security-reviewer`, `ce-testing-reviewer`, `ce-maintainability-reviewer`, `ce-performance-reviewer`, `ce-api-contract-reviewer`, `ce-data-migrations-reviewer` | session | Read-only review lenses (agent-team `pr-review` = security + logic + coverage) |
| Verification | `adversarial-verifier` | opus | Mandatory gate before PR; never trusts the implementer |
| | `plan-challenger` | opus | Attack the stop-2 plan before showing it (big projects) |
| | `output-evaluator` | haiku | Cheap APPROVE / NEEDS_REVIEW pass |
| Research | `deep-research-agent`, `compound-engineering:ce-web-researcher`, `ce-framework-docs-researcher` | sonnet / session | External facts with sources |
| | `Explore` | built-in | Fast read-only code sweeps |
| Requirements | `requirements-analyst` | haiku | Turning a vague ask into criteria |
| Docs / copy | `technical-writer` | haiku | Docs |
| | `content-copywriter` | sonnet | User-facing text |
| UI | `ui-ux-guardian` | sonnet | UI consistency review |
| | `icon-manager` | haiku | FontAwesome icons |
| Monitoring | `loop-monitor` | haiku | Watchdog on long unattended runs |

"session" = no model of its own; it inherits the parent. Set `model` on the spawn if the parent
runs on opus and the job is routine.

## Skills by task type

| Task type | Skills the teams run |
|---|---|
| Code, existing project | `sprint-orchestrate` (`--from-design`, `ship --no-merge`), `fix-bug`, `confidence-check`, `ui-ux-review`, `laravel-tailwind-v4`, `swiftui-pro`, `/code-review` |
| New project | `init-project`, `sprint-orchestrate full --from-design`, `devops`, `design-taste-frontend` |
| Audit / research | `code-research`, `security-review`, `compliance-audit`, `perf`, `seo`, `sc:research`, `ui-ux-review` |
| Ops | your ops skills: host health, TLS audit, error triage, deploy + post-deploy checks |
| Delivery | `ship`, deploy, `retro`, `continuity` |

## When to hire instead

Hire (`mcp__company-hq__hire`) when the task needs knowledge none of the above carries, or a
narrower brief than a generalist would follow (e.g. "Stripe Connect payouts on Laravel Cashier",
"a vendor firmware config format", "the legacy CSV importer"). Put the domain facts, owned files and
the deliverable in its prompt. Keep the roster small: a hire that would do what `general-purpose`
does with a good brief is not worth it.
