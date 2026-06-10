#!/bin/bash
# PreToolUse(Bash) hook: report latest stable version for package installs.
# Supports: composer require, npm install/i, yarn add, pip install, cargo add, go get.
# Fast-exit if command doesn't match; curl timeouts capped at 3s per registry.
#
# Why: LLMs suggest package versions from training data, which is months stale.
# This hook injects the registry's actual latest version into context at the
# moment of install, so Claude pins current versions instead of remembered ones.

set -euo pipefail

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || true)
[[ -z "$CMD" ]] && exit 0

# composer require vendor/package[:constraint]
if [[ "$CMD" =~ composer[[:space:]]+require[[:space:]]+([^[:space:]:]+) ]]; then
    pkg="${BASH_REMATCH[1]}"
    if [[ "$pkg" == */* ]]; then
        v=$(curl -s --max-time 3 "https://repo.packagist.org/p2/${pkg}.json" 2>/dev/null | jq -r --arg p "$pkg" '.packages[$p][0].version // empty' 2>/dev/null)
        [[ -n "$v" ]] && echo "PACKAGIST: $pkg latest=$v"
    fi
fi

# npm install / npm i / yarn add
if [[ "$CMD" =~ (npm[[:space:]]+(install|i)|yarn[[:space:]]+add)[[:space:]]+([^[:space:]]+) ]]; then
    raw="${BASH_REMATCH[3]}"
    pkg=$(echo "$raw" | sed 's/@[^/].*//')
    if [[ -n "$pkg" && "$pkg" != -* ]]; then
        v=$(curl -s --max-time 3 "https://registry.npmjs.org/${pkg}/latest" 2>/dev/null | jq -r '.version // empty' 2>/dev/null)
        [[ -n "$v" ]] && echo "NPM: $pkg latest=$v"
    fi
fi

# pip install <package>
if [[ "$CMD" =~ pip[[:space:]]+install[[:space:]]+([^[:space:]=<>!]+) ]]; then
    pkg="${BASH_REMATCH[1]}"
    if [[ "$pkg" != -* && "$pkg" != "-r" ]]; then
        v=$(curl -s --max-time 3 "https://pypi.org/pypi/${pkg}/json" 2>/dev/null | jq -r '.info.version // empty' 2>/dev/null)
        [[ -n "$v" ]] && echo "PyPI: $pkg latest=$v"
    fi
fi

# cargo add <package>
if [[ "$CMD" =~ cargo[[:space:]]+add[[:space:]]+([^[:space:]@]+) ]]; then
    pkg="${BASH_REMATCH[1]}"
    if [[ "$pkg" != -* ]]; then
        v=$(curl -s --max-time 3 -A "claude-code-hook" "https://crates.io/api/v1/crates/${pkg}" 2>/dev/null | jq -r '.crate.max_stable_version // empty' 2>/dev/null)
        [[ -n "$v" ]] && echo "CRATES: $pkg latest=$v"
    fi
fi

# go get module (informational only — no single version API)
if [[ "$CMD" =~ go[[:space:]]+get[[:space:]]+([^[:space:]@]+) ]]; then
    pkg="${BASH_REMATCH[1]}"
    [[ "$pkg" == */* ]] && echo "GO: $pkg — verify latest at pkg.go.dev"
fi

exit 0
