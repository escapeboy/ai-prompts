#!/usr/bin/env python3
"""
Stop hook: summarizes Claude Code sessions with Haiku and appends to a daily note.
Only runs if the session had actual tool calls (real work) — conversational
sessions are skipped, so the note stays signal-only.

Install:
  1. Copy to ~/.claude/hooks/session-summary-hook.py and chmod +x
  2. Set NOTES_DIR below to your notes location (Obsidian vault, plain folder, ...)
  3. Register in ~/.claude/settings.json:
     {"hooks": {"Stop": [{"hooks": [
       {"type": "command", "command": "python3 ~/.claude/hooks/session-summary-hook.py"}
     ]}]}}

Cost: one Haiku call per working session (~$0.001). Requires ANTHROPIC_API_KEY
in the environment and `pip install anthropic`.
"""
import json
import sys
import os
from datetime import datetime
from pathlib import Path

# Where your daily notes live — adjust to your setup
NOTES_DIR = Path.home() / "notes" / "daily"
SUMMARY_LANGUAGE = "English"  # Haiku writes the summary in this language


def extract_conversation(messages):
    parts = []
    for msg in messages:
        role = msg.get("role", "")
        content = msg.get("content", "")
        if isinstance(content, str):
            if content.strip():
                parts.append(f"{role}: {content[:800]}")
        elif isinstance(content, list):
            for block in content:
                btype = block.get("type", "")
                if btype == "text":
                    text = block.get("text", "").strip()
                    if text:
                        parts.append(f"{role}: {text[:800]}")
                elif btype == "tool_use":
                    name = block.get("name", "")
                    inp = block.get("input", {})
                    # Show key input fields only — keeps the Haiku prompt small
                    if "command" in inp:
                        parts.append(f"[tool:{name} cmd={str(inp['command'])[:200]}]")
                    elif "file_path" in inp:
                        parts.append(f"[tool:{name} file={inp['file_path']}]")
                    else:
                        parts.append(f"[tool:{name}]")
    return "\n".join(parts[:120])


def has_tool_calls(messages):
    for msg in messages:
        content = msg.get("content", "")
        if isinstance(content, list):
            for block in content:
                if block.get("type") == "tool_use":
                    return True
    return False


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    transcript_path = data.get("transcript_path")
    cwd = data.get("cwd", os.getcwd())

    if not transcript_path or not Path(transcript_path).exists():
        sys.exit(0)

    try:
        with open(transcript_path) as f:
            transcript = json.load(f)
    except Exception:
        sys.exit(0)

    messages = transcript.get("messages", [])

    if not has_tool_calls(messages):
        sys.exit(0)

    conv_text = extract_conversation(messages)

    try:
        import anthropic
        client = anthropic.Anthropic()
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=350,
            messages=[{
                "role": "user",
                "content": (
                    f"Summarize this Claude Code session in 2-4 bullet points in {SUMMARY_LANGUAGE}. "
                    f"Be specific — what was done, which files/systems were touched, what was the outcome. "
                    f"No fluff, no intro sentence.\n\n"
                    f"Working directory: {cwd}\n\n"
                    f"Session transcript:\n{conv_text}"
                )
            }]
        )
        summary = response.content[0].text.strip()
    except Exception as e:
        summary = f"_(summary failed: {e})_"

    NOTES_DIR.mkdir(parents=True, exist_ok=True)

    today = datetime.now().strftime("%Y-%m-%d")
    time_str = datetime.now().strftime("%H:%M")
    daily_note = NOTES_DIR / f"{today}.md"

    project = Path(cwd).name
    entry = f"\n### Claude Code {time_str} — `{project}`\n\n{summary}\n"

    with open(daily_note, "a") as f:
        f.write(entry)


if __name__ == "__main__":
    main()
