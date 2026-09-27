#!/usr/bin/env python3
"""PreToolUse:Bash — refuse interactive sudo.

The Bash tool has no TTY, so a password prompt hangs until the call times out.
The non-interactive forms (-n, -S, -A) are fine.

Exit 2 blocks the call and feeds stderr back to Claude. Exit 0 allows it.

Two bugs in the shell predecessor this replaces:

  1. It matched the word anywhere on the line, so a commit message or an echo
     that merely mentioned sudo was refused. That fired repeatedly in ordinary
     work on 2026-09-08.
  2. Its comment promised "allow if EVERY sudo is non-interactive" but the
     regex was satisfied by ANY of them, so `sudo -n a && sudo b` was allowed
     and the second one hung.

Tokenising fixes both: quoted text collapses into a single token that is not
the bare word, and each simple command is judged on its own.
"""

import json
import re
import shlex
import sys

NON_INTERACTIVE = ("n", "S", "A")


HEREDOC = re.compile(r"<<-?\s*(['\"]?)([A-Za-z_][A-Za-z0-9_]*)\1")
SHELLS = {"bash", "sh", "zsh", "dash", "ksh", "fish", "ssh", "sudo", "doas", "su", "eval", "xargs"}


def strip_heredocs(command):
    """Drop heredoc bodies that are data (a script, a changelog), not commands.

    2026-09-27: a changelog passed through `python3 - <<'EOF'` mentioned
    "`sudo -n a && sudo b`" and was refused as an interactive sudo.
    A body fed to a shell (`bash <<EOF`, `ssh host <<EOF`) is executed, so it stays.
    """
    lines, out, end, keep = command.split("\n"), [], None, False
    for line in lines:
        if end is not None:
            if line.strip() == end:
                end = None
            elif keep:
                out.append(line)
            continue
        out.append(line)
        m = HEREDOC.search(line)
        if m:
            end = m.group(2)
            words = re.findall(r"[\w./-]+", line[:m.start()].split("|")[-1])
            keep = any(w.split("/")[-1] in SHELLS for w in words)
    return "\n".join(out)


def segments(command):
    return [s for s in re.split(r"(?:\|\||&&|[;\n|&])", strip_heredocs(command)) if s.strip()]


def tokenize(segment):
    try:
        return shlex.split(segment, comments=False)
    except ValueError:
        return segment.split()


# Wrappers that pass the rest of the line on to another command.
WRAPPERS = {"env", "command", "nice", "nohup", "time", "exec", "xargs", "watch", "stdbuf"}


def command_position(tokens):
    """Index of the token that is actually being run, past assignments and wrappers."""
    i = 0
    while i < len(tokens):
        tok = tokens[i]
        if re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", tok):
            i += 1
            continue
        if tok.split("/")[-1] in WRAPPERS:
            i += 1
            while i < len(tokens) and tokens[i].startswith("-"):
                i += 1
            continue
        return i
    return -1


def is_interactive_sudo(tokens):
    """True when this segment runs sudo without a non-interactive flag.

    Only the command position counts: `grep -r sudo /etc/sudoers.d` searches for
    the word, it does not elevate anything.
    """
    i = command_position(tokens)
    if i >= 0 and tokens[i].split("/")[-1] in ("sudo", "doas"):
        for nxt in tokens[i + 1:]:
            if not nxt.startswith("-"):
                break            # reached the command being elevated
            if nxt == "--":
                break
            if nxt.startswith("--"):
                if nxt in ("--non-interactive", "--stdin", "--askpass"):
                    return False
                continue
            if any(f in nxt[1:] for f in NON_INTERACTIVE):
                return False
        return True
    return False


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)  # fail open

    command = ((payload.get("tool_input") or {}).get("command")) or ""
    if not command:
        sys.exit(0)

    for segment in segments(command):
        if is_interactive_sudo(tokenize(segment)):
            print(
                'Blocked: the Bash tool has no TTY — interactive sudo will hang. '
                'Use "sudo -n" (or -S/-A with credentials supplied), or ask the '
                'user to run it via "! <cmd>".',
                file=sys.stderr,
            )
            sys.exit(2)
    sys.exit(0)


if __name__ == "__main__":
    main()
