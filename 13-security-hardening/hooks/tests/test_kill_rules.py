#!/usr/bin/env python3
"""Matrix for the pkill/killall/kill rules in dangerous-actions-blocker.py.

Run: python3 ~/.claude/hooks/tests/test_kill_rules.py
"""
import json
import os
import subprocess
import sys

HOOK = os.path.expanduser("~/.claude/hooks/dangerous-actions-blocker.py")

CASES = [
    # (command, should_block)
    ('pkill -f "cat" -U $(id -u) -x', True),        # the 2026-09-27 incident
    ('pkill -f cat', True),                          # short -f pattern
    ('pkill -f "php artisan serve"', True),          # -f matches its own shell
    ('pkill -x cat -U 501', True),                   # option after pattern
    ('kill -9 $(pgrep -f node)', True),              # hidden pgrep, short pattern
    ('pgrep -f cat | xargs kill', True),
    ('pkill Chrome', True),                          # hits a GUI .app
    ('killall -m ".*"', True),
    ('killall -u me', True),
    ('kill -9 -1', True),
    ('kill -- -1', True),
    ('kill -s TERM -1', True),
    ('kill 12345', False),
    ('kill -9 12345', False),
    ('kill -1 12345', False),                        # SIGHUP to one PID
    ('kill -TERM 12345 12346', False),
    ('pgrep -lf php-fpm', False),                    # lookup only
    ('pgrep -x zzz-no-such-process', False),
    ('pkill -x zzz-no-such-process', False),
    ('killall zzz-no-such-process', False),
    ('echo "pkill -f cat is dangerous"', False),     # text, not a call
    ('git commit -m "block kill -1"', False),
]


def run(command):
    payload = json.dumps({"tool_name": "Bash", "tool_input": {"command": command}})
    out = subprocess.run([HOOK], input=payload, capture_output=True, text=True).stdout
    return '"deny"' in out


fails = 0
for command, expected in CASES:
    got = run(command)
    ok = got == expected
    fails += not ok
    print(f"{'ok  ' if ok else 'FAIL'} block={got!s:5} expected={expected!s:5} {command}")
print(f"\n{len(CASES) - fails}/{len(CASES)} passed")
sys.exit(1 if fails else 0)
