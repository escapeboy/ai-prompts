# 17 — Claude Code Mods

Mods (Claude Code ≥ 2.1.287; running the tests needs ≥ 2.1.294, the first build whose test kit has `mock.session`) are plugins whose hooks are TypeScript functions that run inside the Claude Code engine. Unlike settings hooks (shell commands that see one event and return JSON), a mod can rewrite a tool call or its result, set the model of a subagent, register tools, agents and slash commands, keep state across sessions, and draw UI above the prompt or in a pane.

This section is a working example marketplace of 13 mods, each with tests, plus the patterns that came out of writing them.

## When to Use (and When NOT to)

| Use a mod | Use something simpler |
|---|---|
| You need to change what the model sees: redact tool output, rewrite arguments, add hidden context | A yes/no gate on a command → a `PreToolUse` settings hook ([13-security-hardening](../13-security-hardening/guide.md)) |
| A policy must hold on every subagent spawn (model routing, budget cap) | A one-off model choice → `model:` in the agent's frontmatter ([10-subagents](../10-subagents/)) |
| Live UI: a meter above the prompt, a status line from a timer, a pane | A static status line → `statusLine` in settings |
| A tool or agent type created at runtime (e.g. `/company` hiring specialists) | A fixed agent → a file in `~/.claude/agents/` |
| State that outlives a session without files you manage | A note for the next session → [continuity](../01-global-optimization/skills/continuity/SKILL.md) |

## Anatomy

```
my-mod/
├── .claude-plugin/plugin.json      # name, version, description, author, optional userConfig
└── hooks/
    ├── hooks.json                  # {"modules": ["./register.ts"]}
    ├── register.ts                 # export const register: Register = (on, options) => { ... }
    └── register.test.ts            # claude-code/testing
```

```ts
import type { Register } from 'claude-code'

export const register: Register = (on, options) => {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    if (e.command.includes('rm -rf /')) return { deny: 'no' }
    return next(e)                       // pass on, possibly with a changed event
  }).catch(($, e, next) => next(e))      // a crashing guard must not block every call
}
```

Events used here: `tool.call`, `turn.step`, `turn.complete`, `prompt.submit` (return `{drop}` to hold a prompt), `agent.spawn` (set `model`, or `{deny}`; also fires for Workflow agents), `session.start` / `session.end`, `command.run`, `ui.render` (`AbovePrompt`, `Pane`).

Engine API (`$`): `store` (persistent per mod), `state`, `process.run`, `fs`, `http.fetch`, `mcp.call(server, tool, args)`, `model.fork` (a cheap side question on the same prompt cache), `agent.register`, `tool.register`, `command.register`, `ui.status`, `toast`, `session.usage()` (context tokens and %, cost, rate limits), `session.append` (hidden context for the next turn).

Order of execution: managed `PreToolUse` hooks → mods → user settings hooks. **Mods are not sandboxed** — read one before installing it, as you would any code.

## Patterns that held up

- **Guard with `.catch`.** A guard whose own code fails should pass the call through (`next(e)`), except a redactor: if its scan fails *after* the tool ran, withhold the output rather than leak it.
- **Rewrite a tool result without `ref`/`text`** and core remaps it, which also cleans the transcript — that is how `secret-redactor` keeps secrets out of the saved session.
- **Config through `userConfig`**, not constants: `claude plugin configure <mod>@<marketplace> --values-stdin`. Values land in `settings.json` → `pluginConfigs`.
- **A version bump needs `claude plugin update <mod>@<marketplace>`.** An installed plugin keeps its cached copy; a local folder marketplace is read live only while the version matches.
- **Tests answer the bottom hook.** In `claude plugin test`, an event no one implements fails — add a bottom hook (`session.start` returns `{cwd}`, op events return `{value}`).
- **Treat repo files as untrusted input.** A mod runs outside the permission system, so a mod that executes something read from the project (a config, a script path) is a way around it. Pin the content the user approved and refuse anything else.
- **Cheap when idle.** Timers and status lines run plain code; spend tokens (`model.fork`) only when something is actionable.

## The example marketplace

[`marketplace/`](marketplace/) — install the whole set or pick:

```bash
claude plugin marketplace add /path/to/claude-code-kit/17-mods/marketplace
claude plugin install context-meter@ai-prompts-mods
claude plugin install secret-redactor@ai-prompts-mods
# … one install per mod; in zsh write the names out, `for m in $LIST` does not split
```

| Mod | What it does | Commands / config |
|---|---|---|
| context-meter | Band above the prompt: context fill, cache read/write of the last request, cost, 5h/7d limits. Toast at 50% and 70%; past 70% a Handoff button that asks Claude to write a handoff. Never runs `/clear` itself. | `/meter`, `/handoff` |
| cache-guard | Idle ≥ 50 min with ≥ 150K context: a tiny fork keeps the prompt cache warm (≤ 4 pings; stops if the cache had already lapsed). Idle > 60 min: holds the next prompt once and shows what the cache rewrite will cost. | `/keepwarm [on\|off]` |
| spend-ledger | Per-turn tokens and $ by day, project and model in `~/.claude/spend-ledger/<YYYY-MM>.json`. Optional: pulls other machines' ledgers over ssh and writes a monthly note to a notes MCP. | `/spend [day\|week\|month\|sync]`; `remote_hosts`, `svod_server`, `svod_vault`, `note_dir` |
| subagent-models | Pins subagent models to a routing table (Opus for judgement, Haiku for mechanical work, Sonnet for the catch-alls); an explicit `model` wins; logs every spawn. Edit `POLICY` to your agents. | `/agent-models [n]` |
| secret-redactor | Tokens, keys and passwords in tool output → `‹secret:N›`; the real value is restored in later arguments of local tools only (Bash, Read, Edit, Write, Grep, Glob), never in web or MCP calls. Blocks Read of key files. | — |
| ssh-guard | Refuses ssh/scp/rsync/sftp to hosts in a retired-hosts markdown file (`## name — ip (aliases)` headers; aliases resolved with `ssh -G`). `# decommissioned-ok` in the command overrides, after the user agrees. | `hosts_file` |
| deploy-verify | After a command that the project's `.claude/deploy-verify.json` marks as a deploy, runs 5 checks (homepage, endpoints, app log, nginx 5xx, OPcache clear) and hands Claude the result. The config runs shell commands, so it runs only after the user approved its exact content with `/deploy-verify trust`; a cloned repo's config is never run on its own. | `/deploy-verify [init\|trust]` |
| ci-watch | Polls `gh pr checks` every minute into the status line; toast when done; stops after 2h. No tokens. | `/ci-watch [pr\|stop]` |
| cleanup-tracker | Records successful downloads, clones, installs, containers and launchd loads, so a session can clean up after itself. | `/cleanup-list [write\|clear]` |
| aside | `/aside` opens a pane; a tool-less fork answers from the prompt cache; nothing enters the conversation. | `/aside [question]` |
| fleet-status | Status line `fleet: P1 n · P2 n` from a triage report (`## P1` sections with `- [` items). | `/fleet [full]`, `/ports`; `state_file` |
| lang-guard | Example language guard: after each main answer flags Russian words in Bulgarian text and plain-language slips (em-dash asides, 40+ word sentences, aphorisms); shows a line and adds a hidden reminder. Adapt the word lists. | — |
| company-hq | Back office for the [`company`](../01-global-optimization/skills/company/SKILL.md) skill: every `/company` run is its own company (state file per company, several open at once); tools `open_project` / `hire` / `set_phase` / `close_project` / `ask_user` / `answer_question` / `record_decision`, hired specialists as agent types (`company-hq:<name>`), an optional budget cap (`capUsd`, none by default) enforced on every spawn inside the project folder. Hired agents are re-registered only inside that folder. Optional live dashboard (see below). | `/company-status`; `~/.claude/company-hq/config.json`: `dashboard`, `port`, `machine`, `fleetq.url`; env `COMPANY_HQ_FLEETQ_TOKEN` |

**company-hq dashboard (optional, off by default).** Turn it on with `/company --dashboard[=local|fleetq|local+fleetq]`, the `dashboard` key in `config.json`, or the question `/company` asks at stop 1. `local` runs a read-only Python standard-library server on `127.0.0.1` (default port 7420, `port` in `config.json`) from the mod's `server/` folder; it needs `python3` 3.9 or newer. It reads the company state files and the plan documents (`docs/design-<part>.md`, the `## Tasks` list in `docs/architecture-<part>.md`, the `Result:` line in `docs/test-plan-<part>.md`), shows open questions and logged decisions, and in local mode nothing leaves the machine. `fleetq` also sends the snapshot and the plan documents (secrets redacted) to a FleetQ instance: set `fleetq.url` in `config.json` and the token in `COMPANY_HQ_FLEETQ_TOKEN`; the request and response format is in [`server/INGEST-CONTRACT.md`](marketplace/mods/company-hq/server/INGEST-CONTRACT.md). `machine` names this computer in the snapshot. The task list the dashboard shows is kept by [`sprint-orchestrate`](../01-global-optimization/skills/sprint-orchestrate/SKILL.md).

Turn one off: `/plugin` → Installed → disable. All mods off for one session: `claude --safe-mode`.

## Develop

```bash
cd 17-mods/marketplace
claude plugin validate mods/<name>          # also generates mods/<name>/.claude-plugin/types/
claude plugin test mods/<name>
mkdir -p .types && cp mods/<name>/.claude-plugin/types/claude-code/index.d.ts .types/claude-code.d.ts
npx -y -p typescript@5.6.3 tsc -p tsconfig.json
```

The type files come from your installed Claude Code build and are not committed. On a build older than 2.1.294 the `aside` and `lang-guard` tests fail with `mock.session is not a function` — update Claude Code (`claude update`), the mods are fine.

## Security

Nothing in this marketplace approves a tool call. Keep your safety gates in settings hooks or managed policy ([13-security-hardening](../13-security-hardening/guide.md)); `secret-redactor` and `ssh-guard` only add refusals on top.

## Related

- [`company` skill](../01-global-optimization/skills/company/SKILL.md) — depends on `company-hq`; its Dashboard section and `references/questions.md` describe the tools and dashboard above.
- [`sprint-orchestrate` skill](../01-global-optimization/skills/sprint-orchestrate/SKILL.md) — writes the `## Tasks` list and `Result:` line that the company-hq dashboard shows ([`references/tasks.md`](../01-global-optimization/skills/sprint-orchestrate/references/tasks.md)).
- [10-subagents](../10-subagents/) — `subagent-models` enforces the frontmatter `model:` policy described there.
- [05-token-optimization](../05-token-optimization/) — `context-meter`, `cache-guard`, `spend-ledger` measure and protect the prompt cache.
- [13-security-hardening](../13-security-hardening/guide.md) — settings hooks vs mods.
- [16-autonomous-agents](../16-autonomous-agents/) — `ci-watch` replaces a polling loop.
