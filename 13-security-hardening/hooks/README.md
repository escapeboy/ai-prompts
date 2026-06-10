# Security Hooks Library

Battle-tested PreToolUse hooks that enforce the production safety rules from [guide.md](../guide.md) as **executable code** rather than instructions. Instructions can be ignored under context pressure; hooks cannot — the harness runs them on every matching tool call, and exit code 2 hard-blocks the action.

## Hooks

| Hook | Event | What it does |
|------|-------|--------------|
| [dangerous-actions-blocker.sh](dangerous-actions-blocker.sh) | `PreToolUse` (Bash, Edit, Write) | Blocks `rm -rf /`-class commands, force-push to main/master, `DROP DATABASE/TABLE`; blocks edits to key files (`id_rsa`, `credentials.json`, `.npmrc`, …); warns (non-blocking) on any recursive delete |
| [pre-commit-secrets.sh](pre-commit-secrets.sh) | `PreToolUse` (Bash) | Before every `git commit`: scans **staged** content for API keys (OpenAI, Anthropic, GitHub, AWS, Stripe), private keys, DB URLs with embedded passwords, and generic `api_key=`/`secret=` patterns. Whitelist for placeholders; skips docs/sample files |

Productivity (non-security) hooks live in [`01-global-optimization/hooks/`](../../01-global-optimization/hooks/).

## Installation

```bash
mkdir -p ~/.claude/hooks
cp dangerous-actions-blocker.sh pre-commit-secrets.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/*.sh
```

Register in `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Edit|Write",
        "hooks": [
          { "type": "command", "command": "~/.claude/hooks/dangerous-actions-blocker.sh" }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "~/.claude/hooks/pre-commit-secrets.sh" }
        ]
      }
    ]
  }
}
```

## Hook contract (PreToolUse)

- Hook receives the tool call as JSON on **stdin**: `{"tool_name": "...", "tool_input": {...}}`
- **Exit 0** — allow the call. Anything printed to stdout is appended to Claude's context (use for non-blocking warnings or informational notes).
- **Exit 2** — block the call. Stderr is shown to Claude as the block reason, so write it as an actionable message ("Fix: remove secrets, use env variables…").
- Keep hooks **fast** (they run on every matching call) and **fail-open** for parse errors — a broken hook should not lock you out of your own session.

## Design notes

- **Block at the boundary, not in the prompt.** "Never commit secrets" in CLAUDE.md is advisory; this hook makes it physical. Both belong in your setup — the instruction shapes behavior, the hook catches the misses.
- **Whitelist over cleverness.** The secrets scanner intentionally uses a simple placeholder whitelist (`your_token_here`, `${env:`, …) instead of entropy analysis — fewer false positives, predictable behavior, trivially extendable.
- **Warnings are a third option.** The recursive-delete check demonstrates a useful middle ground: exit 0 + a `systemMessage` JSON on stdout warns Claude without blocking legitimate cleanup.
