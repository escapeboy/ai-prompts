#!/usr/bin/env python3
"""PreToolUse:Bash — enforce two shell habits that CLAUDE.md asked for in prose.

Why: the 08.2026 log audit found 39% of Bash calls wasted a `cd` prefix (49
cwd-mismatch errors), and search via Bash grep instead of the native Grep tool.
The prose rule in CLAUDE.md did not stop either (2026-09-27 marmelab review:
written rules take effect in 4-16% of cases). Remove when a model stops doing
both unprompted — check the deny count in transcripts first.

Rules (each denial names the fix):
  1. `cd X && cmd` / `cd X; cmd` — use absolute paths, `git -C`, `make -C`, or a
     separate `cd` call (the working directory persists between calls).
  2. `grep`/`rg` as the whole command — use the Grep tool. Inside a pipeline
     (`... | grep x`) it is allowed.

Fails open: heredocs and anything the lexer cannot parse are let through.
"""

import json
import shlex
import sys

SEPARATORS = {";", "&&", "||", "|", "&", "(", ")", ";;", "|&"}
CD_COMMANDS = {"cd", "z", "pushd"}
SEARCH_COMMANDS = {"grep", "egrep", "fgrep", "rg"}


def deny(reason):
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": reason,
    }}))
    sys.exit(0)


def segments(command):
    """Split into simple commands, respecting quotes. None when unparseable."""
    lexer = shlex.shlex(command.replace("\n", " ; "), posix=True, punctuation_chars=True)
    lexer.whitespace_split = True
    try:
        tokens = list(lexer)
    except ValueError:
        return None
    segs, cur, pipes = [], [], 0
    for tok in tokens:
        if tok in SEPARATORS:
            if tok in {"|", "|&"}:
                pipes += 1
            if cur:
                segs.append(cur)
            cur = []
        else:
            cur.append(tok)
    if cur:
        segs.append(cur)
    return segs, pipes


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)
    command = ((payload.get("tool_input") or {}).get("command")) or ""
    if not command or "<<" in command:
        sys.exit(0)
    parsed = segments(command)
    if not parsed:
        sys.exit(0)
    segs, pipes = parsed

    for i, seg in enumerate(segs[:-1]):
        if seg[0] in CD_COMMANDS:
            deny("BLOCKED (shell habit): `cd … &&` prefix. Use absolute paths, "
                 "`git -C <dir>`, `make -C <dir>`, `composer -d <dir>`, "
                 "`npm --prefix <dir>`, or run `cd <dir>` as its own call — the "
                 "working directory persists between calls.")

    if len(segs) == 1 and pipes == 0 and segs[0][0] in SEARCH_COMMANDS:
        deny("BLOCKED (shell habit): standalone grep/rg. Use the Grep tool "
             "(pattern, path, glob, output_mode, -i, -n, -C). grep inside a "
             "pipeline (`cmd | grep x`) is allowed.")

    sys.exit(0)


if __name__ == "__main__":
    main()
