#!/bin/bash
# PreToolUse hook — blocks git commit if secrets are found in staged files
# Exit 0 = allow, Exit 2 = block
#
# Install: copy to ~/.claude/hooks/ and register in ~/.claude/settings.json
# (see README.md in this directory for the settings.json wiring)

set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null || true)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || true)

# Only run before git commit commands
if [[ "$TOOL_NAME" != "Bash" ]]; then exit 0; fi
if ! echo "$COMMAND" | grep -qE 'git commit'; then exit 0; fi

# Secret patterns
declare -A PATTERNS=(
    ["OpenAI API Key"]="sk-[A-Za-z0-9]{48}"
    ["GitHub Token"]="gh[pous]_[A-Za-z0-9]{36}"
    ["AWS Access Key"]="AKIA[A-Z0-9]{16}"
    ["Anthropic API Key"]="sk-ant-[A-Za-z0-9-]{50,}"
    ["Stripe Key"]="(sk|pk)_(live|test)_[0-9a-zA-Z]{24,}"
    ["Private Key"]="-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"
    ["DB URL with Password"]="(postgres|mysql|mongodb)://[^:]+:[^@]+@"
    ["Generic API Key"]="api[_-]?key[[:space:]]*[:=][[:space:]]*[A-Za-z0-9]{20,}"
    ["Generic Secret"]="secret[[:space:]]*[:=][[:space:]]*[A-Za-z0-9]{20,}"
)

WHITELIST=(
    "your_token_here"
    "your_key_here"
    "example.com"
    "placeholder"
    "XXXXXX"
    "sk-ant-example"
    "\${env:"
    "\${APP_"
    "env("
)

SKIP_EXTENSIONS=("md" "txt" "sample" "example")

is_whitelisted() {
    local match="$1"
    for w in "${WHITELIST[@]}"; do
        if [[ "$match" == *"$w"* ]]; then return 0; fi
    done
    return 1
}

should_skip() {
    local file="$1"
    local ext="${file##*.}"
    for skip in "${SKIP_EXTENSIONS[@]}"; do
        [[ "$ext" == "$skip" ]] && return 0
        [[ "$file" == *"$skip"* ]] && return 0
    done
    return 1
}

# Get staged files
files=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || true)
[[ -z "$files" ]] && exit 0

found=0
report=""

while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    should_skip "$file" && continue
    [[ ! -f "$file" ]] && continue

    content=$(git show ":$file" 2>/dev/null || true)
    [[ -z "$content" ]] && continue

    for name in "${!PATTERNS[@]}"; do
        pattern="${PATTERNS[$name]}"
        matches=$(echo "$content" | grep -noE "$pattern" || true)
        [[ -z "$matches" ]] && continue

        while IFS= read -r match; do
            [[ -z "$match" ]] && continue
            text="${match#*:}"
            is_whitelisted "$text" && continue
            found=1
            report+="  ${file} — ${name}\n"
            report+="    $(echo "$text" | cut -c1-60)...\n"
        done <<< "$matches"
    done
done <<< "$files"

if [[ $found -eq 1 ]]; then
    echo "BLOCKED: Secrets detected in staged files — commit aborted" >&2
    echo "" >&2
    echo -e "$report" >&2
    echo "Fix: remove secrets, use env variables, or add to WHITELIST in ~/.claude/hooks/pre-commit-secrets.sh" >&2
    exit 2
fi

exit 0
