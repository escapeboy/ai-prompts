#!/bin/bash
# session-start-memory-load.sh — auto-load relevant memories based on cwd.
# SessionStart hook. Exit 0 = content on stdout is appended to Claude's context.
# Keep output SMALL — only inject memories that match the current working directory.
#
# Why: instructions like "load memories at session start" depend on the model
# remembering to do it. A SessionStart hook makes the load deterministic and
# free of a tool-call round trip — the context is just *there* on turn one.
#
# Customize the `case` blocks below: map fragments of your project paths to
# the memory files that matter for that project.

set -u
LC_ALL=C

INPUT="$(cat)"
CWD="$(echo "$INPUT" | jq -r '.cwd // empty' 2>/dev/null)"
[[ -z "$CWD" ]] && CWD="$PWD"
CWD_LC="$(echo "$CWD" | tr '[:upper:]' '[:lower:]')"

# Adjust to your auto-memory location (~/.claude/projects/<encoded-path>/memory)
MEM_DIR="$HOME/.claude/projects/$(echo "$HOME" | tr '/' '-')/memory"
[[ -d "$MEM_DIR" ]] || exit 0

# Map cwd fragments → memory files to inject. EXAMPLES — replace with your own:
declare -a to_inject=()

case "$CWD_LC" in
  *my-api*|*backend*)
    to_inject+=("api_architecture.md" "deployment_runbook.md")
    ;;
esac
case "$CWD_LC" in
  *my-frontend*)
    to_inject+=("design_system.md")
    ;;
esac

# Dedupe + filter to existing files
seen=""
for f in "${to_inject[@]:-}"; do
  [[ -z "$f" ]] && continue
  case " $seen " in *" $f "*) continue ;; esac
  seen+=" $f"
  if [[ -f "$MEM_DIR/$f" ]]; then
    echo "## Auto-loaded memory: $f"
    echo ""
    cat "$MEM_DIR/$f"
    echo ""
    echo "---"
    echo ""
  fi
done

exit 0
