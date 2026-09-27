# Security Hooks Library

Battle-tested PreToolUse hooks that enforce the production safety rules from [guide.md](../guide.md) as **executable code** rather than instructions. Instructions can be ignored under context pressure; hooks cannot — the harness runs them on every matching tool call and can refuse the action.

## Hooks

| Hook | Event | What it does |
|------|-------|--------------|
| [dangerous-actions-blocker.py](dangerous-actions-blocker.py) | `PreToolUse` (all tools) | Refuses recursive deletes of `/`, `~` and top-level paths in any spelling (`rm -r -f /`, `rm --recursive --force /`, `rm -fr /*`), `dd`/redirects onto block devices, `mkfs`, recursive `chmod 777`, fork bombs, `DROP DATABASE/TABLE` via a DB client, force-push to main/master; broad `pkill -f`/`killall -m`/`kill -1`; edits to private keys and credential files. Scratch dirs and deep paths stay allowed. |
| [pre-commit-secrets.py](pre-commit-secrets.py) | `PreToolUse` (Bash) | On an actual `git commit` (not a mention of one): scans **staged** content for API keys (OpenAI, Anthropic, GitHub, GitLab, AWS, Slack, Stripe), private-key blocks, DB URLs with passwords, generic `api_key=`/`secret=`. Placeholder whitelist; skips only real doc extensions. |
| [block-interactive-sudo.py](block-interactive-sudo.py) | `PreToolUse` (Bash) | The Bash tool has no TTY, so a sudo password prompt hangs until timeout. Refuses `sudo` without `-n`/`-S`/`-A`, judging every simple command on its own. |
| [tests/](tests/) | — | Two-sided test matrices (see below). |
| [WHY.md](WHY.md) | — | Template: one line per hook naming the failure behind it and when it can go. |

Productivity (non-security) hooks — including `shell-habits.py` — live in [`01-global-optimization/hooks/`](../../01-global-optimization/hooks/).

> **Upgrading from the `.sh` versions (≤ v1.26.x):** they matched substrings and were wrong in both directions. `dangerous-actions-blocker.sh` blocked only one spelling of `rm -rf /` and refused the harmless `rm -rf /tmp/scratch`. `pre-commit-secrets.sh` never matched a private key (`grep -E` read the leading `-----` as options) and skipped every file whose *path* contained `md`, `txt` or `example` — so `cmd/server.go` was never scanned. Replace them and update the `settings.json` paths.

## Installation

```bash
mkdir -p ~/.claude/hooks/tests
cp *.py ~/.claude/hooks/
cp tests/*.py ~/.claude/hooks/tests/
chmod +x ~/.claude/hooks/*.py
python3 ~/.claude/hooks/tests/test_guards.py      # needs shell-habits.py from 01-global-optimization/hooks too
python3 ~/.claude/hooks/tests/test_kill_rules.py
```

Register in `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          { "type": "command", "command": "$HOME/.claude/hooks/dangerous-actions-blocker.py", "timeout": 5 }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "$HOME/.claude/hooks/pre-commit-secrets.py", "timeout": 15 },
          { "type": "command", "command": "$HOME/.claude/hooks/block-interactive-sudo.py", "timeout": 5 }
        ]
      }
    ]
  }
}
```

## Test every guard in both directions

`tests/test_guards.py` holds 76 cases (41 must-block, 35 must-pass) over all guards, including the secrets scanner against a throwaway git repo; `tests/test_kill_rules.py` holds 22 for the process-kill rules. Run both after touching any guard.

Why both directions: a matrix that only lists what must be blocked makes tightening a guard always look safe and loosening it invisible, so the guard drifts toward refusing ordinary work. Every rule gets at least one case it must let through — `rm -rf /tmp/scratch`, `git commit -m "drop table users"`, `ps aux | grep php`. ([Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents): *"One-sided evals create one-sided optimization."*)

## Hook contract (PreToolUse)

- Hook receives the tool call as JSON on **stdin**: `{"tool_name": "...", "tool_input": {...}}`
- **Allow**: exit 0. Stdout is appended to Claude's context (non-blocking warnings).
- **Refuse**, two ways: exit 2 (stderr becomes the reason), or exit 0 with `{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "..."}}` on stdout. The JSON form shows as a clean policy denial instead of a "hook error" in transcripts.
- **Write the fix into the reason.** "BLOCKED: … use `kill <PID>`" lets the agent correct itself in one step.
- Keep hooks **fast** and **fail-open** on parse errors — a crashing hook blocks all work.

## Design notes

- **Match the shape of a command, never a substring.** Tokenize with `shlex`, split on `;` `&&` `||` `|`, step over `sudo`/`env`/`VAR=` prefixes, then judge the real command and its flags. Substring checks both miss spellings and fire on commit messages that merely mention the pattern.
- **Block at the boundary, not in the prompt.** "Never commit secrets" in CLAUDE.md is advisory; a hook makes it physical. A study of 481 public CLAUDE.md files found written security rules took effect in 4–16% of cases (cited in [marmelab, *The State Of AI Harness Engineering 2026*](https://marmelab.com/blog/2026/09/24/the-state-of-ai-harness-engineering-2026.html)).
- **A rule that ends in a prompt is not a rule.** Most permission prompts get approved. In bypass/auto mode, a hook `deny` is the only barrier left.
- **Record why each hook exists.** Controls usually compensate for something a model used to get wrong; when it stops, the control is pure cost. Keep [WHY.md](WHY.md) — one line per hook with the incident and a removal condition — so a hook can be retired safely.
- **Whitelist over cleverness.** The secrets scanner uses a simple placeholder whitelist instead of entropy analysis — predictable, trivially extendable.
