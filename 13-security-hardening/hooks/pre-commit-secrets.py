#!/usr/bin/env python3
"""PreToolUse:Bash — refuse `git commit` when a staged file carries a secret.

Exit 2 blocks the call and feeds stderr back to Claude. Exit 0 allows it.

Three bugs in the shell predecessor this replaces, all found by test on
2026-09-08:

  1. The skip list matched anywhere in the PATH, not just the extension, so
     every file under `cmd/`, `admin/`, `amd64/` or any path containing "md",
     "txt", "sample" or "example" was never scanned at all. An AWS key in
     `cmd/server.go` passed while the same key in `src/server.go` was caught.
  2. The private-key pattern begins with `-----`, which `grep -E` read as
     options. That check errored on every run and therefore never matched
     anything — a committed private key would not have been caught.
  3. The trigger matched the words "git commit" anywhere on the line, so
     merely mentioning them in an echo or a message ran the whole scan.
"""

import json
import os
import re
import shlex
import subprocess
import sys

PATTERNS = {
    "OpenAI API key": r"sk-[A-Za-z0-9]{48}",
    "Anthropic API key": r"sk-ant-[A-Za-z0-9-]{50,}",
    "GitHub token (classic)": r"gh[pousr]_[A-Za-z0-9]{36}",
    "GitHub token (fine-grained)": r"github_pat_[A-Za-z0-9_]{60,}",
    "GitLab token": r"glpat-[A-Za-z0-9_-]{20,}",
    "AWS access key": r"AKIA[A-Z0-9]{16}",
    "Slack token": r"xox[baprs]-[A-Za-z0-9-]{10,}",
    "Stripe key": r"(sk|pk)_(live|test)_[0-9a-zA-Z]{24,}",
    "Private key block": r"-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----",
    "PGP private key block": r"-----BEGIN PGP PRIVATE KEY BLOCK-----",
    "Database URL with password": r"(postgres|postgresql|mysql|mongodb)(\+srv)?://[^:\s]+:[^@\s]+@",
    "Generic API key assignment": r"api[_-]?key[\"'\s]*[:=][\"'\s]*[A-Za-z0-9_\-]{20,}",
    "Generic secret assignment": r"secret[\"'\s]*[:=][\"'\s]*[A-Za-z0-9_\-]{20,}",
    "Bearer token": r"Bearer\s+[A-Za-z0-9_\-\.]{30,}",
}

WHITELIST = (
    "your_token_here", "your_key_here", "example.com", "placeholder",
    "XXXXXX", "sk-ant-example", "${env:", "${APP_", "env(", "<your",
    "REPLACE_ME", "CHANGEME", "dummy",
    "://test:test@",  # CI service-container Postgres, dummy creds, localhost only
)

# Only genuine documentation extensions are skipped, matched on the extension
# alone. The predecessor matched these anywhere in the path.
SKIP_EXTENSIONS = {"md", "markdown", "txt", "rst", "sample", "example", "dist", "lock"}

MAX_BYTES = 2_000_000  # skip anything bigger; it is not hand-written source


def is_git_commit(command):
    """True when the line actually invokes `git commit`, not merely names it."""
    for segment in re.split(r"(?:\|\||&&|[;\n|&])", command):
        try:
            tokens = shlex.split(segment, comments=False)
        except ValueError:
            tokens = segment.split()
        i = 0
        while i < len(tokens) and re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", tokens[i]):
            i += 1
        if i >= len(tokens) or os.path.basename(tokens[i]) != "git":
            continue
        # step over git's own options, including the ones that take a value
        j = i + 1
        while j < len(tokens):
            if tokens[j] in ("-C", "-c", "--git-dir", "--work-tree", "--namespace"):
                j += 2
                continue
            if tokens[j].startswith("-"):
                j += 1
                continue
            break
        if j < len(tokens) and tokens[j] == "commit":
            return True
    return False


def whitelisted(text):
    return any(w in text for w in WHITELIST)


def staged_files():
    out = subprocess.run(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
        capture_output=True, text=True,
    )
    if out.returncode != 0:
        return []
    return [f for f in out.stdout.splitlines() if f.strip()]


def staged_content(path):
    out = subprocess.run(["git", "show", f":{path}"], capture_output=True)
    if out.returncode != 0:
        return ""
    if len(out.stdout) > MAX_BYTES:
        return ""
    return out.stdout.decode("utf-8", errors="replace")


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)  # fail open

    if (payload.get("tool_name") or "") != "Bash":
        sys.exit(0)
    command = ((payload.get("tool_input") or {}).get("command")) or ""
    if not is_git_commit(command):
        sys.exit(0)

    findings = []
    for path in staged_files():
        ext = path.rsplit(".", 1)[-1].lower() if "." in os.path.basename(path) else ""
        if ext in SKIP_EXTENSIONS:
            continue
        content = staged_content(path)
        if not content:
            continue
        for name, pattern in PATTERNS.items():
            for match in re.finditer(pattern, content):
                text = match.group(0)
                if whitelisted(text):
                    continue
                line = content.count("\n", 0, match.start()) + 1
                findings.append((path, line, name, text[:60]))
                break  # one hit per pattern per file is enough to stop the commit

    if findings:
        print("BLOCKED: secrets detected in staged files — commit aborted", file=sys.stderr)
        print("", file=sys.stderr)
        for path, line, name, text in findings:
            print(f"  {path}:{line} — {name}", file=sys.stderr)
            print(f"    {text}…", file=sys.stderr)
        print("", file=sys.stderr)
        print("Fix: remove the secret, read it from the environment or a secret "
              "store, or add a marker to WHITELIST in this hook.", file=sys.stderr)
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
