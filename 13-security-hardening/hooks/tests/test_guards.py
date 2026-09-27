#!/usr/bin/env python3
"""Two-sided matrix for the guard hooks: every rule has cases that must be
blocked AND cases that must pass. A matrix with only block cases lets a guard
drift toward refusing everything without any test noticing.

Covers dangerous-actions-blocker.py (everything except kill rules, which live in
test_kill_rules.py), block-interactive-sudo.py, shell-habits.py and
pre-commit-secrets.py (against a throwaway git repo).

Run: python3 ~/.claude/hooks/tests/test_guards.py
"""
import json
import os
import subprocess
import sys
import tempfile

H = os.path.expanduser("~/.claude/hooks/")
DANGER, SUDO, HABITS, SECRETS = (H + n for n in (
    "dangerous-actions-blocker.py", "block-interactive-sudo.py",
    "shell-habits.py", "pre-commit-secrets.py"))

# (hook, tool, input, should_block)
CASES = [
    # rm: shape, not substring
    (DANGER, "Bash", "rm -rf /", True),
    (DANGER, "Bash", "rm -r -f /", True),
    (DANGER, "Bash", "rm --recursive --force /", True),
    (DANGER, "Bash", "rm -rf ~", True),
    (DANGER, "Bash", "rm -rf $HOME/*", True),
    (DANGER, "Bash", "sudo rm -rf /etc", True),
    (DANGER, "Bash", "rm -rf /var/www", True),
    (DANGER, "Bash", "echo ok; rm -fr /*", True),
    (DANGER, "Bash", "rm -rf /tmp/scratch", False),
    (DANGER, "Bash", "rm -rf /private/tmp/claude-501/x", False),
    (DANGER, "Bash", "rm -rf node_modules", False),
    (DANGER, "Bash", "rm -rf /Users/me/projects/x/vendor", False),
    (DANGER, "Bash", "rm file.txt", False),
    (DANGER, "Bash", 'git commit -m "rm -rf / guard"', False),
    (DANGER, "Bash", "python3 - <<'EOF'\nnote = 'let rm -r -f / through'\nEOF", False),
    (DANGER, "Bash", "bash <<'EOF'\nrm -rf /\nEOF", True),
    (DANGER, "Bash", "ssh host <<EOF\nrm -rf /etc\nEOF", True),
    (DANGER, "Bash", "cat <<EOF > notes.txt\nrm -rf /\nEOF\nrm -rf ~", True),
    # dd / mkfs / block devices
    (DANGER, "Bash", "dd if=img of=/dev/disk4", True),
    (DANGER, "Bash", "echo x > /dev/nvme0n1", True),
    (DANGER, "Bash", "mkfs.ext4 /dev/sdb1", True),
    (DANGER, "Bash", "dd if=/dev/zero of=/dev/null bs=1m count=1", False),
    (DANGER, "Bash", "dd if=/dev/urandom of=/tmp/f bs=1k count=1", False),
    # chmod
    (DANGER, "Bash", "chmod -R 777 storage", True),
    (DANGER, "Bash", "chmod -R 755 /", True),
    (DANGER, "Bash", "chmod -R 755 /var/www/app", False),
    (DANGER, "Bash", "chmod 777 one-file", False),
    # misc
    (DANGER, "Bash", ":(){ :|:& };:", True),
    (DANGER, "Bash", "rm --no-preserve-root -rf x", True),
    (DANGER, "Bash", 'mysql -e "DROP TABLE users"', True),
    (DANGER, "Bash", 'git commit -m "drop table users"', False),
    (DANGER, "Bash", "git push --force origin main", True),
    (DANGER, "Bash", "git push -f origin master", True),
    (DANGER, "Bash", "git push --force-with-lease origin feature/x", False),
    (DANGER, "Bash", "git push origin main", False),
    # file edits
    (DANGER, "Write", "/Users/me/.ssh/id_ed25519", True),
    (DANGER, "Edit", "/Users/me/.aws/credentials", True),
    (DANGER, "Write", "/srv/certs/privkey.pem", True),
    (DANGER, "Edit", "/Users/me/.npmrc", True),
    (DANGER, "Write", "/Users/me/.ssh/id_ed25519.pub", False),
    (DANGER, "Edit", "/Users/me/projects/app/config/keys.php", False),
    (DANGER, "Write", "/Users/me/projects/app/README.md", False),
    # interactive sudo
    (SUDO, "Bash", "sudo launchctl list", True),
    (SUDO, "Bash", "sudo -n true && sudo rm x", True),
    (SUDO, "Bash", "env FOO=1 sudo ls", True),
    (SUDO, "Bash", "sudo -n launchctl list", False),
    (SUDO, "Bash", "echo pw | sudo -S ls", False),
    (SUDO, "Bash", 'git commit -m "no more sudo prompts"', False),
    (SUDO, "Bash", "grep -r sudo /etc/sudoers.d", False),
    (SUDO, "Bash", "python3 - <<'EOF'\nt = '`sudo -n a && sudo b` is refused'\nEOF", False),
    (SUDO, "Bash", "cat > f <<EOF\nsudo apt install x\nEOF\nsudo ls", True),
    # shell habits
    (HABITS, "Bash", "cd /Users/me/projects/x && git status", True),
    (HABITS, "Bash", "cd /tmp; ls", True),
    (HABITS, "Bash", "(cd sub && make)", True),
    (HABITS, "Bash", "git fetch && cd repo && git pull", True),
    (HABITS, "Bash", "cd /Users/me/projects/x\nphp artisan test", True),
    (HABITS, "Bash", 'grep -rn "foo" /Users/me/projects/x', True),
    (HABITS, "Bash", "rg TODO src/", True),
    (HABITS, "Bash", "cd /Users/me/projects/x", False),
    (HABITS, "Bash", "git -C /Users/me/projects/x status", False),
    (HABITS, "Bash", "ps aux | grep php", False),
    (HABITS, "Bash", "git log --oneline | rg fix", False),
    (HABITS, "Bash", 'echo "cd x && y"', False),
    (HABITS, "Bash", 'git commit -m "cd into dir; grep"', False),
    (HABITS, "Bash", "python3 - <<'EOF'\nimport os; os.system('cd /x && ls')\nEOF", False),
    (HABITS, "Bash", "make build && grep -c ok log.txt", False),
]


def run(hook, tool, value, cwd=None):
    key = "command" if tool == "Bash" else "file_path"
    payload = json.dumps({"tool_name": tool, "tool_input": {key: value}})
    r = subprocess.run([hook], input=payload, capture_output=True, text=True, cwd=cwd)
    return r.returncode == 2 or '"deny"' in r.stdout


def secrets_cases():
    """Stage files in a throwaway repo and ask the hook about `git commit`."""
    aws = "AKIA" + "ABCDEFGHIJKLMNOP"  # split so this file does not trip the hook itself
    ghp = "ghp_" + "a" * 36
    cases = [
        ("cmd/server.go", f'key := "{aws}"\n', True),   # predecessor skipped cmd/
        ("src/server.go", f'key := "{aws}"\n', True),
        ("config.py", f'TOKEN = "{ghp}"\n', True),
        ("id_key", "-----BEGIN OPENSSH " + "PRIVATE KEY-----\nabc\n", True),
        ("db.env.php", "mysql://app:s3cretpass@db/app\n", True),
        ("src/app.go", 'key := os.Getenv("AWS_KEY")\n', False),
        ("README.md", f"example {aws}\n", False),        # docs are skipped
        ("ci.yml", "postgres://test:test@localhost/db\n", False),  # whitelisted
        ("config.php", "'api_key' => env('API_KEY'),\n", False),
    ]
    out = []
    for name, content, expected in cases:
        with tempfile.TemporaryDirectory() as repo:
            subprocess.run(["git", "init", "-q", repo], check=True)
            path = os.path.join(repo, name)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w") as f:
                f.write(content)
            subprocess.run(["git", "-C", repo, "add", name], check=True)
            got = run(SECRETS, "Bash", 'git commit -m "x"', cwd=repo)
            out.append((f"secrets: {name}", got, expected))
    # the trigger itself: mentioning git commit must not scan
    out.append(("secrets: echo 'git commit'",
                run(SECRETS, "Bash", 'echo "git commit later"'), False))
    return out


results = [(f"{os.path.basename(h)[:-3]}: {v!r}", run(h, t, v), e) for h, t, v, e in CASES]
results += secrets_cases()

fails = 0
for label, got, expected in results:
    ok = got == expected
    fails += not ok
    print(f"{'ok  ' if ok else 'FAIL'} block={got!s:5} expected={expected!s:5} {label[:110]}")
blocks = sum(1 for _, _, e in results if e)
print(f"\n{len(results) - fails}/{len(results)} passed "
      f"({blocks} must-block, {len(results) - blocks} must-pass)")
sys.exit(1 if fails else 0)
