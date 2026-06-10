#!/bin/bash
# PreToolUse hook — blocks destructive actions before execution
# Exit 0 = allow, Exit 2 = block (message shown to Claude)
#
# Install: copy to ~/.claude/hooks/ and register in ~/.claude/settings.json
# (see README.md in this directory for the settings.json wiring)

set -e

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // empty')

# === BASH: Dangerous commands ===
if [[ "$TOOL_NAME" == "Bash" ]]; then
    COMMAND=$(echo "$TOOL_INPUT" | jq -r '.command // empty')

    DANGEROUS_PATTERNS=(
        "rm -rf /"
        "rm -rf ~"
        "rm -rf \$HOME"
        "dd if="
        "mkfs"
        ":(){:|:&};:"
        "> /dev/sda"
        "chmod -R 777 /"
        "--no-preserve-root"
        "DROP DATABASE"
        "DROP TABLE"
    )

    for pattern in "${DANGEROUS_PATTERNS[@]}"; do
        if [[ "$COMMAND" == *"$pattern"* ]]; then
            echo "BLOCKED: Dangerous command detected: '$pattern'" >&2
            exit 2
        fi
    done

    # Block force push to main/master
    if echo "$COMMAND" | grep -qE "git push.*(-f|--force).*(main|master|origin)"; then
        echo "BLOCKED: Force push to main/master is forbidden" >&2
        exit 2
    fi

    # Warn on recursive delete (non-blocking)
    if echo "$COMMAND" | grep -qE "rm -r[^i]|rm -rf"; then
        echo '{"systemMessage": "Warning: Recursive delete detected. Verify the path is correct before proceeding."}'
    fi
fi

# === EDIT/WRITE: Sensitive files ===
if [[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "Write" ]]; then
    FILE_PATH=$(echo "$TOOL_INPUT" | jq -r '.file_path // empty')
    FILENAME=$(basename "$FILE_PATH")

    PROTECTED_FILES=(
        "credentials.json"
        "serviceAccountKey.json"
        "id_rsa"
        "id_ed25519"
        "id_ecdsa"
        ".npmrc"
        ".pypirc"
        "secrets.yml"
        "secrets.yaml"
    )

    for protected in "${PROTECTED_FILES[@]}"; do
        if [[ "$FILENAME" == "$protected" ]]; then
            echo "BLOCKED: Editing sensitive file '$FILENAME' requires manual action" >&2
            exit 2
        fi
    done
fi

exit 0
