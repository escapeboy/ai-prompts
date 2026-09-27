#!/usr/bin/env python3
"""PreToolUse hook — refuse destructive actions before they run.

Denials use the structured permissionDecision JSON (exit 0), not exit 2, so they
surface as clean policy denials rather than "hook error" in transcripts.

Every check matches the SHAPE of a command, never a literal substring. The
predecessor matched substrings and was wrong in both directions: it blocked
exactly one spelling of the recursive-root delete while letting `rm -r -f /`,
`rm -fr /`, `rm --recursive --force /` and even a second space through, and it
refused the harmless `rm -rf /tmp/scratch` because that string contains the
dangerous one. Audited 2026-09-08: 12 of 38 cases wrong.

Fails open: anything unparseable is allowed through with the regex checks still
applied, because a hook that crashes blocks all work.
"""

import json
import os
import re
import shlex
import sys

# Absolute paths shallower than this are never a legitimate recursive-delete
# target: /, /etc, /var/www. Deeper paths are the caller's business.
MIN_SAFE_DEPTH = 3

# Recursive deletes under these roots are ordinary scratch work.
SCRATCH_ROOTS = ("/tmp/", "/var/tmp/", "/private/tmp/", "/var/folders/")

# Writing to these is never destructive.
SAFE_DEVICES = {"null", "zero", "random", "urandom", "tty", "stdout", "stderr", "full"}

# Command prefixes to step over when finding the real command.
PREFIXES = {"sudo", "command", "nice", "nohup", "time", "env", "exec", "builtin", "doas"}

BLOCK_DEVICE = r"/dev/(sd[a-z]|nvme\d+n\d+|vd[a-z]|hd[a-z]|mmcblk\d+|disk\d+|loop\d+)"

HEREDOC = re.compile(r"<<-?\s*(['\"]?)([A-Za-z_][A-Za-z0-9_]*)\1")
SHELLS = {"bash", "sh", "zsh", "dash", "ksh", "fish", "ssh", "sudo", "doas", "su", "eval", "xargs"}


def strip_heredocs(command):
    """Drop heredoc bodies that are data (a script, a changelog), not commands.

    2026-09-27: a changelog written through `python3 - <<'EOF'` that described
    `rm -r -f /` was refused as a recursive root delete. A body fed to a shell
    (`bash <<EOF`, `ssh host <<EOF`) is executed, so it stays and is checked.
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


def respond(payload):
    print(json.dumps(payload))
    sys.exit(0)


def deny(reason):
    respond({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    })


def split_segments(command):
    """Split a command line into simple commands on ; && || | and newlines."""
    return [s for s in re.split(r"(?:\|\||&&|[;\n|&])", command) if s.strip()]


def tokenize(segment):
    try:
        return shlex.split(segment, comments=False)
    except ValueError:
        # Unbalanced quotes — fall back to whitespace splitting rather than give up.
        return segment.split()


def real_command(tokens):
    """Strip sudo/env/flag noise and return (name, remaining tokens)."""
    i = 0
    while i < len(tokens):
        tok = tokens[i]
        if tok in PREFIXES:
            i += 1
            # step over the prefix's own flags and VAR=value assignments
            while i < len(tokens) and (tokens[i].startswith("-") or "=" in tokens[i].split(" ")[0]):
                if tokens[i].startswith("-") or re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", tokens[i]):
                    i += 1
                else:
                    break
            continue
        if re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", tok):
            i += 1
            continue
        return os.path.basename(tok), tokens[i + 1:]
    return "", []


def split_flags(args):
    """Return (flag list, operand list), honouring the -- terminator."""
    flags, operands, terminated = [], [], False
    for a in args:
        if terminated:
            operands.append(a)
        elif a == "--":
            terminated = True
        elif a.startswith("-") and a != "-":
            flags.append(a)
        else:
            operands.append(a)
    return flags, operands


def has_flag(flags, short, long_names):
    """True if any flag carries `short` (including inside a cluster like -rvf)."""
    for f in flags:
        if f.startswith("--"):
            if f in long_names:
                return True
        elif short and short in f[1:]:
            return True
    return False


def expand(path):
    home = os.path.expanduser("~")
    p = path.replace("${HOME}", home).replace("$HOME", home)
    if p == "~" or p.startswith("~/"):
        p = home + p[1:]
    return p


CATASTROPHIC = {"", ".", "..", "*", "/", "/*", "~", "~/", "~/*", "$HOME", "${HOME}",
                "$HOME/*", "${HOME}/*", "$HOME/", "./*", "../*"}


def is_catastrophic_target(operand):
    """Root, home, or a bare glob — never a legitimate target for anything."""
    raw = operand.strip().strip("'\"")
    if raw in CATASTROPHIC:
        return True
    path = expand(raw)
    if not path.startswith("/"):
        return False
    normalised = os.path.normpath(path.rstrip("*").rstrip("/")) or "/"
    return normalised == "/" or normalised == os.path.expanduser("~")


def is_dangerous_target(operand):
    """True when a recursive delete of this operand would be catastrophic."""
    raw = operand.strip().strip("'\"")
    if raw in CATASTROPHIC:
        return True

    path = expand(raw)
    if not path.startswith("/"):
        return False  # relative path — the caller's own tree

    normalised = os.path.normpath(path.rstrip("*").rstrip("/")) or "/"
    if normalised == "/":
        return True
    if any(path.startswith(root) for root in SCRATCH_ROOTS):
        return False
    if normalised == os.path.expanduser("~"):
        return True
    depth = len([s for s in normalised.split("/") if s])
    return depth < MIN_SAFE_DEPTH


# BSD pkill/pgrep options that take a value (-U 501, -t ttys001, ...).
PGREP_VALUE_OPTS = set("FGPUgJjstud")

# More matches than this and a pattern is too broad to hand to pkill.
MAX_KILL_MATCHES = 3


def parse_pgrep_args(args, is_pkill):
    """Split BSD pkill/pgrep args into (options, patterns, options_after_pattern).

    BSD getopt stops at the first operand, so a flag written after the pattern is
    silently taken as another pattern. On 2026-09-27 `pkill -f "cat" -U 501 -x`
    lost both -U and -x that way, and `-f cat` then matched every process under
    /Applications/ — about 30 apps were terminated.
    """
    opts, patterns, late, i = [], [], [], 0
    while i < len(args):
        a = args[i]
        if patterns:
            patterns.append(a)
            if a.startswith("-") and a != "-":
                late.append(a)
        elif a == "--":
            patterns.extend(args[i + 1:])
            break
        elif a.startswith("-") and len(a) > 1:
            body = a[1:]
            # pkill -9 / -TERM / -SIGKILL is a signal, not an option pgrep knows.
            if is_pkill and (body.isdigit() or body.isupper()):
                i += 1
                continue
            opts.append(a)
            if body[-1] in PGREP_VALUE_OPTS and len(body) == 1 and i + 1 < len(args):
                opts.append(args[i + 1])
                i += 1
        else:
            patterns.append(a)
        i += 1
    return opts, patterns, late


def check_process_match(opts, patterns, command, label):
    """Deny when a pkill-style pattern would hit more than the one thing meant."""
    full = any(o.startswith("-") and not o.startswith("--") and "f" in o[1:] for o in opts)
    if full:
        for p in patterns:
            if len(p) < 5 and not p.startswith("^"):
                deny(f"BLOCKED: {label} -f '{p}' matches any command line containing "
                     f"'{p}' (every path under /Applications/ contains 'cat'). "
                     "Find the PID with `pgrep -lf` and use `kill <PID>`.")
            try:
                self_match = re.search(p, command)
            except re.error:
                self_match = p in command
            if self_match:
                deny(f"BLOCKED: {label} -f '{p}' also matches the shell running this "
                     "command, so the command would kill itself. Use `kill <PID>`.")

    if any("$" in t or "`" in t for t in opts + patterns):
        return  # cannot evaluate an unexpanded substitution; the rules above still ran
    try:
        import subprocess
        out = subprocess.run(["pgrep"] + opts + ["--"] + patterns,
                             capture_output=True, text=True, timeout=3).stdout.split()
        if not out:
            return
        listing = subprocess.run(["ps", "-o", "pid=,command=", "-p", ",".join(out)],
                                 capture_output=True, text=True, timeout=3).stdout
    except Exception:
        return
    lines = [l.strip() for l in listing.splitlines() if l.strip()]
    if len(lines) > MAX_KILL_MATCHES or any(".app/Contents/MacOS/" in l for l in lines):
        shown = "\n".join(l[:120] for l in lines[:8])
        deny(f"BLOCKED: {label} pattern matches {len(lines)} process(es), including "
             f"more than intended:\n{shown}\nKill the exact PID with `kill <PID>`.")


def check_kill_commands(command, name, args):
    if name in {"pkill", "pgrep"}:
        opts, patterns, late = parse_pgrep_args(args, name == "pkill")
        if name == "pgrep" and not re.search(r"\b(kill|pkill)\b", command):
            return  # a plain lookup kills nothing
        if late:
            deny(f"BLOCKED: {name} options after the pattern ({' '.join(late)}) are "
                 "ignored on macOS and read as extra patterns. Put every option "
                 "before the pattern, or better, use `kill <PID>`.")
        check_process_match(opts, patterns, command, name)

    elif name == "killall":
        flags, operands = split_flags(args)
        if has_flag(flags, "m", set()):
            deny("BLOCKED: killall -m treats the name as a regex and can match far "
                 "more than intended. Use `kill <PID>`.")
        # -u user / -t tty take a value; -c name counts as a process name.
        names = [a for i, a in enumerate(args)
                 if not a.startswith("-") and (i == 0 or args[i - 1] not in {"-u", "-t"})]
        if not names:
            deny("BLOCKED: killall without a process name signals every process of the user.")

    elif name == "kill":
        # `kill -9 -1` / `kill -- -1` signal every process the user owns.
        rest = args[1:] if args and args[0].startswith("-") and args[0] != "--" else args
        if args[:1] == ["-s"]:
            rest = args[2:]
        if "-1" in [a for a in rest if a != "--"]:
            deny("BLOCKED: kill -1 signals every process you own.")


def check_bash(command):
    command = strip_heredocs(command)
    flat = re.sub(r"\s+", "", command)
    if ":(){:|:&};:" in flat:
        deny("BLOCKED: fork bomb.")

    if "--no-preserve-root" in command:
        deny("BLOCKED: --no-preserve-root is never legitimate here.")

    if re.search(r">\s*" + BLOCK_DEVICE, command):
        deny("BLOCKED: redirecting output onto a block device destroys the disk.")

    # Only when a database client is actually involved: "drop table" in a commit
    # message or a filename is not a destructive act.
    if (re.search(r"\bdrop\s+(database|table|schema)\b", command, re.IGNORECASE)
            and re.search(r"\b(psql|mysql|mariadb|sqlite3|mongosh?|clickhouse-client|cockroach)\b", command)):
        deny("BLOCKED: dropping a database, table or schema requires a human.")

    # Force-push to main/master only. Feature-branch force pushes are fine.
    if (re.search(r"(^|[;&|\s])git\s+push(\s|$)", command)
            and re.search(r"(^|\s)(-f|--force(-with-lease(=\S*)?)?)(\s|$)", command)
            and re.search(r"(^|[\s:])(main|master)([\s:]|$)", command)):
        deny("BLOCKED: force push to main/master. Feature branches are fine.")

    # `kill $(pgrep -f x)` / kill `pgrep x` hide the pgrep inside one segment.
    for inner in re.findall(r"\$\(\s*(pgrep\b[^)]*)\)|`\s*(pgrep\b[^`]*)`", command):
        tokens = tokenize(inner[0] or inner[1])
        check_kill_commands(command, "pgrep", tokens[1:])

    warn = None
    for segment in split_segments(command):
        name, args = real_command(tokenize(segment))
        if not name:
            continue
        flags, operands = split_flags(args)

        if name == "rm":
            recursive = has_flag(flags, "r", {"--recursive"}) or has_flag(flags, "R", set())
            if recursive:
                for operand in operands:
                    if is_dangerous_target(operand):
                        deny(
                            f"BLOCKED: recursive delete of '{operand}'. "
                            "Root, home and top-level system paths are off limits; "
                            "scratch dirs and paths at least three levels deep are allowed."
                        )
                warn = "Warning: recursive delete. Verify the path before proceeding."

        elif name == "dd":
            for arg in operands:
                if arg.startswith("of="):
                    target = arg[3:]
                    if target.startswith("/dev/") and os.path.basename(target) not in SAFE_DEVICES:
                        deny(f"BLOCKED: dd writing to the device '{target}'.")

        elif name.startswith("mkfs"):
            deny(f"BLOCKED: '{name}' formats a filesystem.")

        elif name == "chmod":
            recursive = has_flag(flags, "R", {"--recursive"})
            mode = operands[0] if operands else ""
            if recursive and mode in {"777", "0777", "666", "0666", "a+rwx"}:
                deny(f"BLOCKED: recursive chmod {mode} makes everything world-writable.")
            # A recursive chmod deep in a tree is ordinary deploy work; only the
            # roots are off limits. The depth rule that guards rm would refuse
            # `chmod -R 755 /var/www`, which is a legitimate thing to do.
            if recursive:
                for operand in operands[1:]:
                    if is_catastrophic_target(operand):
                        deny(f"BLOCKED: recursive chmod of '{operand}'.")

        elif name in {"pkill", "pgrep", "killall", "kill"}:
            check_kill_commands(command, name, args)

    if warn:
        respond({"systemMessage": warn})


SENSITIVE_NAMES = {
    "credentials.json", ".credentials.json", "serviceaccountkey.json",
    "authorized_keys", ".npmrc", ".pypirc", "secrets.yml", "secrets.yaml",
    ".netrc", ".pgpass", ".htpasswd",
}
SENSITIVE_SUFFIXES = (".pem", ".key", ".p12", ".pfx", ".jks", ".keystore")
SENSITIVE_DIRS = ("/.gnupg/", "/.aws/", "/.gnupg", "/.docker/config.json")


def check_file(path):
    base = os.path.basename(path)
    low = base.lower()

    if low in SENSITIVE_NAMES:
        deny(f"BLOCKED: '{base}' holds credentials; edit it by hand.")
    if low.endswith(SENSITIVE_SUFFIXES):
        deny(f"BLOCKED: '{base}' looks like a private key or keystore; edit it by hand.")
    # Any SSH private key, whatever it is called: id_* without a .pub twin suffix.
    if low.startswith("id_") and not low.endswith(".pub"):
        deny(f"BLOCKED: '{base}' is an SSH private key; edit it by hand.")
    if any(d in path for d in SENSITIVE_DIRS):
        deny(f"BLOCKED: '{path}' is inside a credential store.")


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)  # fail open: never block work because the hook could not parse

    tool = payload.get("tool_name") or ""
    tool_input = payload.get("tool_input") or {}
    if not isinstance(tool_input, dict):
        sys.exit(0)

    if tool == "Bash":
        check_bash(tool_input.get("command") or "")
    elif tool in {"Edit", "Write", "MultiEdit", "NotebookEdit"}:
        check_file(tool_input.get("file_path") or "")

    sys.exit(0)


if __name__ == "__main__":
    main()
