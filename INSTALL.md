# INSTALL.md — for AI agents

> **Human?** Point your coding agent here with something like:
> *"Read https://github.com/escapeboy/claude-code-kit/blob/master/INSTALL.md and install what fits my setup."*
> The agent will look at your environment, propose a selection, wait for your yes, then install and verify it.

**Agent:** this file is your runbook. The repository is a library — skills, mods, subagents, hooks, commands and guides for Claude Code. Do **not** install everything. Find out what the user needs, install that, and leave the rest.

## Ground rules

1. **Ask before writing.** Inspect first, propose a selection, and install only after the user agrees. One round of questions, not a quiz.
2. **Never overwrite silently.** If a target file or directory already exists, show the diff and ask: keep / replace / skip. Back up anything you replace or merge into (`<path>.bak-<YYYYMMDD>`), including `CLAUDE.md` and `settings.json` before you edit them.
3. **Pin a release.** Install from the latest release tag, not from a moving branch, and tell the user which tag.
4. **Merge, don't replace, shared config.** `~/.claude/CLAUDE.md` and `~/.claude/settings.json` belong to the user: add sections and entries, never rewrite the file.
5. **No secrets.** Nothing in this repo needs a key to install. Do not ask for credentials and do not write any.
6. **Verify, then report.** Run the checks in [Verify](#verify) and paste their real output. A check you did not run is reported as not run.

## Step 1 — Inspect the environment

Run read-only probes and keep the answers:

```bash
claude --version                       # mods need >= 2.1.287; mod tests need >= 2.1.294
ls ~/.claude/skills ~/.claude/agents ~/.claude/hooks 2>/dev/null
claude mcp list | cut -d: -f1          # server names only — the full output can contain API keys
claude plugin marketplace list
test -f ~/.claude/CLAUDE.md && head -40 ~/.claude/CLAUDE.md
git --version; python3 --version; gh --version
```

Paths here use `~` / `$HOME`; if you install into another home (a sandbox, a different user), substitute it everywhere, including the hook test scripts, which read `$HOME`.

Also note: OS, whether the current directory is a project (and its stack: `composer.json`, `package.json`, `pyproject.toml`, `Package.swift`, `pubspec.yaml`, …), and whether the user runs Claude Code unattended (cron, CI, servers).

Not Claude Code? Skills and subagent files are plain Markdown and work as reference prompts in any agent; mods, hooks and slash commands are Claude Code-only. Say so and offer the Markdown parts only.

## Step 2 — Get the files

```bash
TAG=$(git ls-remote --tags --sort=-v:refname https://github.com/escapeboy/claude-code-kit 'v*' | head -1 | sed 's|.*refs/tags/||; s|\^{}||')
git clone --depth 1 --branch "$TAG" https://github.com/escapeboy/claude-code-kit.git ~/claude-code-kit   # or: git -C ~/claude-code-kit fetch --tags && git -C ~/claude-code-kit checkout "$TAG"
```

Keep the clone: it is the source for updates and the mods marketplace is read from it. Without git, fetch single files from `https://raw.githubusercontent.com/escapeboy/claude-code-kit/$TAG/<path>`.

## Step 3 — Propose a selection

Map what you found to bundles and offer them in one question (recommend one; the user can mix):

| Bundle | When to recommend | Contents |
|---|---|---|
| **Starter** | Any Claude Code user without these yet | skills `optimize`, `ctx`, `init-project`, `continuity`, `confidence-check`; hooks `shell-habits.py` + the three security hooks; global rules merged into `CLAUDE.md` |
| **Code intelligence** | Serena and/or codebase-memory-mcp connected, or the user wants them | skills `codebase-memory`, `code-research`, `sync-features`, `agent-ready`; [02-project-activation](02-project-activation/guide.md) per project |
| **Delivery** | Feature work with PRs | skills `sprint-orchestrate`, `decision-classify`, `confidence-check`, `ui-ux-review`; commands from [07-custom-commands](07-custom-commands/); subagents `output-evaluator`, `plan-challenger`, `self-review` |
| **Multi-agent** | Large tasks, several areas, audits | skills `company`, `agent-team` + everything `company` depends on (see below); mod `company-hq` |
| **Mods** | Claude Code >= 2.1.287 | pick from the table in [17-mods/guide.md](17-mods/guide.md); a good default is `context-meter`, `cache-guard`, `secret-redactor`, `subagent-models`, `ci-watch` |
| **Security** | Always worth offering | [13-security-hardening](13-security-hardening/guide.md) hooks + `permissions.deny` template; mods `secret-redactor`, `ssh-guard` |
| **Unattended** | Cron / CI / servers | [16-autonomous-agents](16-autonomous-agents/guide.md) heartbeat template + Stop hook; subagent `loop-monitor`; mod `ci-watch` |
| **Stack-specific** | Matches the detected project | Laravel → [09-laravel-mcp-integration](09-laravel-mcp-integration/); mobile → [11-mobile-development](11-mobile-development/); desktop → [12-desktop-development](12-desktop-development/); browser tools → [14-webmcp](14-webmcp/) |
| **Maintenance** | Users who write their own skills | skills `self-improve`, `update-docs`, `cache-inspector`; [03-custom-skills](03-custom-skills/guide.md) |

Single skills on request: `video-digest` (needs `yt-dlp`, `ffmpeg` and a local speech-to-text model — check before offering).

## Step 4 — Install

### Skills → `~/.claude/skills/<name>/`

All skills live in `01-global-optimization/skills/<name>/`. **Copy the whole directory** — many have `references/` and `scripts/`.

```bash
cp -R ~/claude-code-kit/01-global-optimization/skills/<name> ~/.claude/skills/<name>   # only if the target does not exist
```

Install the dependencies a skill names in its *Related* section as `depends-on`, or it will point at missing skills:

| Skill | Also install |
|---|---|
| `company` | `sprint-orchestrate`, `agent-team`, `code-research`, `decision-classify`, `confidence-check`, `continuity`; mod `company-hq` |
| `sprint-orchestrate` | `confidence-check`, `decision-classify` (`ui-ux-review` if the project has UI) |
| `confidence-check` | `decision-classify` |
| `optimize`, `ctx`, `init-project` | each other (they cross-reference) |
| `codebase-memory`, `code-research` | codebase-memory-mcp connected (otherwise skip and say why) |

Some skills mention optional tools (Serena, codebase-memory-mcp, context7, a notes MCP). They fall back when a tool is missing; tell the user which ones are absent rather than installing MCP servers unasked.

More skill examples (not installed by default): [03-custom-skills/examples](03-custom-skills/examples/), [11-mobile-development/skills](11-mobile-development/skills/), [12-desktop-development/skills](12-desktop-development/skills/).

### Mods → Claude Code plugin marketplace

Requires Claude Code >= 2.1.287. The marketplace is read from the clone:

```bash
claude plugin marketplace add ~/claude-code-kit/17-mods/marketplace   # the marketplace is named ai-prompts-mods (the repo's former name)
claude plugin install context-meter@ai-prompts-mods      # one call per chosen mod; in zsh, write names out — `for m in $LIST` does not split
```

Mods with options (`ssh-guard`, `spend-ledger`, `fleet-status`) print "userConfig option not yet set" — that is fine; they stay quiet until configured with `claude plugin configure <mod>@ai-prompts-mods`. Mods are not sandboxed: name each one you install and what it does. New mods load after Claude Code restarts.

### Subagents → `~/.claude/agents/`

Copy chosen files from [10-subagents/examples](10-subagents/examples/) (`code-reviewer`, `debugger`, `laravel-specialist`, `loop-monitor`, `output-evaluator`, `plan-challenger`, `self-review`, `test-generator`). Check their `model:` frontmatter against the models the user has.

### Hooks → `~/.claude/hooks/` + `settings.json`

Details and the reason for each hook are in [13-security-hardening/hooks/README.md](13-security-hardening/hooks/README.md) and [01-global-optimization/hooks/README.md](01-global-optimization/hooks/README.md). In this order:

```bash
mkdir -p ~/.claude/hooks/tests
cp ~/claude-code-kit/13-security-hardening/hooks/*.py ~/.claude/hooks/
cp ~/claude-code-kit/13-security-hardening/hooks/tests/*.py ~/.claude/hooks/tests/
cp ~/claude-code-kit/01-global-optimization/hooks/shell-habits.py ~/.claude/hooks/   # test_guards.py imports it
chmod +x ~/.claude/hooks/*.py
```

Then register them in `~/.claude/settings.json` by **appending** to `hooks.PreToolUse` (create the key if missing; keep every existing entry):

```json
{ "matcher": ".*",   "hooks": [ { "type": "command", "command": "$HOME/.claude/hooks/dangerous-actions-blocker.py", "timeout": 5 } ] },
{ "matcher": "Bash", "hooks": [ { "type": "command", "command": "$HOME/.claude/hooks/pre-commit-secrets.py", "timeout": 15 },
                                { "type": "command", "command": "$HOME/.claude/hooks/block-interactive-sudo.py", "timeout": 5 },
                                { "type": "command", "command": "$HOME/.claude/hooks/shell-habits.py", "timeout": 5 } ] }
```

`shell-habits.py` refuses `cd X && cmd` and standalone `grep`/`rg` — mention that before installing; some users won't want it. `check-package-latest.sh` (Bash) and `session-start-memory-load.sh` (SessionStart) are optional; the latter needs the user's own path mapping, so skip it unless they want to edit it. Run the hook tests after copying.

### Slash commands → `~/.claude/commands/`

Copy chosen files from [07-custom-commands](07-custom-commands/) (`debug`, `deploy`, `i18n`, `perf`, `qa`, `refactor`, `retro`, `seo`, `content-review`). `deploy.md` is generic — tell the user it does not know their hosts or pipeline.

### Global rules → `~/.claude/CLAUDE.md`

The rules are in [01-global-optimization/system-prompts/global-optimization.md](01-global-optimization/system-prompts/global-optimization.md) and [symbol-first-protocol.md](01-global-optimization/system-prompts/symbol-first-protocol.md). Claude Code reads only `CLAUDE.md`, not `system-prompts/` — ignore the "copy to `~/.claude/system-prompts/`" lines at the top of those files.

- The content to merge is each file's body: from the line after the second `---` (the one right under "Copy everything below this line") to the end of the file. Later `---` lines are section dividers inside the body — keep them, don't stop there.
- Compare its `##` sections with the user's `CLAUDE.md` and take only topics they don't already cover; Prefer `global-optimization.md` — it already contains a *Symbol-First* section; use `symbol-first-protocol.md` alone only when the user wants just the symbol-first rules.
- Append them at the end, wrapped in `<!-- claude-code-kit <TAG>: begin -->` / `<!-- claude-code-kit <TAG>: end -->` comments, keeping their `##` headings (no wrapper heading — it would make every section a sibling of it anyway). The markers make later updates and removal exact.
- Before writing, show the list of `##` sections you will add and the line count, and offer the full text on request (it is a few hundred lines of pure addition). Symbol-first rules only make sense with Serena or codebase-memory-mcp connected; skip them otherwise.

### Per project (not global)

Offer, don't do: [02-project-activation](02-project-activation/guide.md) (Serena memories), `init-project`, `.claude/deploy-verify.json` for the `deploy-verify` mod, the Laravel `CLAUDE.md` template.

## Verify

```bash
python3 ~/claude-code-kit/01-global-optimization/skills/self-improve/scripts/skill-lint.py ~/.claude/skills   # installed skills parse
claude plugin list | grep ai-prompts-mods                                                               # mods installed + enabled
claude plugin test ~/claude-code-kit/17-mods/marketplace/mods/<mod>                                          # needs >= 2.1.294; read the "N fail" line
python3 ~/.claude/hooks/tests/test_guards.py                                                            # if security hooks were installed
python3 -c "import json; json.load(open('$HOME/.claude/settings.json'))" && echo settings.json ok
```

`skill-lint.py` also lints skills that did not come from this repo; report their warnings separately, don't fix them unasked.

## Report

End with one table: component · installed / skipped / already present · path · check result (for skills the lint result covers all; say so rather than inventing per-skill checks). Then: the tag installed, anything that needs a restart, optional tools that are missing, and how to update.

## Update later

```bash
git -C ~/claude-code-kit fetch --tags && git -C ~/claude-code-kit checkout <new tag>
diff -r ~/claude-code-kit/01-global-optimization/skills/<name> ~/.claude/skills/<name>   # per installed skill; ask before replacing
claude plugin marketplace update ai-prompts-mods && claude plugin update <mod>@ai-prompts-mods
```

Read [CHANGELOG.md](CHANGELOG.md) between the two tags and tell the user what changed in the parts they have installed.

## Where to read more

[README.md](README.md) — full contents and version history · [01-global-optimization/guide.md](01-global-optimization/guide.md) — manual setup walkthrough · [01-global-optimization/setup-agent.md](01-global-optimization/setup-agent.md) — the older all-in-one setup prompt for an empty `~/.claude/` · [llms.txt](llms.txt) — index for agents.
