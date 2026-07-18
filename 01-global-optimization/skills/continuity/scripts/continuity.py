#!/usr/bin/env python3
"""continuity.py — scaffold and lint a repo-local .continuity/ surface.

Thin CLI backing the `continuity` skill. Two jobs only:
  init <repo>   create .continuity/ (STATE.md + local-only split) if absent
  lint <repo>   validate .continuity/STATE.md structure + evidence tags

The skill itself does the reasoning (writing the resume surface, synthesizing
the finalize). This script only guarantees the artifact is well-formed so the
next session can trust its shape.
"""
import sys
import re
from pathlib import Path

EVIDENCE_TAGS = {"observed", "claimed", "validated", "user", "contradicted", "unknown"}

REQUIRED_SECTIONS = [
    "Now",
    "Next action",
    "Decisions",
    "Known failures",
    "Validation expectations",
    "Entry points",
    "Unresolved risks",
]

STATE_TEMPLATE = """# Continuity — {project}

_Last finalized: (never) · session: (none)_

<!--
Evidence tags (weight, not decoration). Put one at the start of a bullet:
  [observed]     runtime/tooling actually showed this
  [validated]    a test/check confirms it
  [user]         the user directed or corrected this
  [claimed]      an agent asserted it, not yet verified   (low trust)
  [contradicted] later work contradicted this             (low trust)
  [unknown]      open question / not investigated
Keep this file BOUNDED. It is a resume surface, not a memoir. Compact on finalize.
-->

## Now
_(what work is mid-flight right now)_

## Next action
_(the single next concrete step)_

## Decisions
_(choices made + why; tag each)_

## Known failures
_(commands/approaches that failed, so we don't repeat them; tag each)_

## Validation expectations
_(how we prove it works: test cmd, endpoint, check; tag each)_

## Entry points
_(file:line or symbol -> what it is)_

## Unresolved risks
_(open risks, unknowns, contradictions; tag each)_
"""

GITIGNORE = "# local-only operational state (machine-specific, not shared)\nlocal/\n"


def init(repo: Path) -> int:
    cdir = repo / ".continuity"
    state = cdir / "STATE.md"
    if state.exists():
        print(f"exists: {state} (left untouched)")
        return 0
    (cdir / "local").mkdir(parents=True, exist_ok=True)
    (cdir / "local" / ".gitkeep").write_text("")
    (cdir / ".gitignore").write_text(GITIGNORE)
    state.write_text(STATE_TEMPLATE.format(project=repo.resolve().name))
    print(f"created: {state}")
    print(f"created: {cdir/'.gitignore'} (STATE.md is portable/committed; local/ is gitignored)")
    return 0


def _bad_tags(text: str):
    """Return tags used in [..]-prefixed bullets that aren't in the allowed set."""
    bad = []
    for line in text.splitlines():
        m = re.match(r"\s*[-*]\s*\[([a-z]+)\]", line)
        if m and m.group(1) not in EVIDENCE_TAGS:
            bad.append(m.group(1))
    return bad


def lint(repo: Path) -> int:
    state = repo / ".continuity" / "STATE.md"
    if not state.exists():
        print(f"FAIL: no {state} (run: continuity.py init {repo})")
        return 1
    text = state.read_text()
    errors = []

    headings = re.findall(r"^##\s+(.+?)\s*$", text, re.MULTILINE)
    for req in REQUIRED_SECTIONS:
        if not any(h.startswith(req) for h in headings):
            errors.append(f"missing section: ## {req}")

    bad = _bad_tags(text)
    if bad:
        errors.append(
            f"invalid evidence tag(s): {sorted(set(bad))} "
            f"(allowed: {sorted(EVIDENCE_TAGS)})"
        )

    if not re.search(r"^_Last finalized:", text, re.MULTILINE):
        errors.append("missing '_Last finalized:' provenance line")

    if errors:
        for e in errors:
            print(f"FAIL: {e}")
        return 1
    print(f"OK: {state} is well-formed ({len(headings)} sections, evidence tags valid)")
    return 0


def main(argv) -> int:
    if len(argv) < 3 or argv[1] not in ("init", "lint"):
        print("usage: continuity.py {init|lint} <repo-path>")
        return 2
    action, repo = argv[1], Path(argv[2])
    if not repo.is_dir():
        print(f"FAIL: not a directory: {repo}")
        return 2
    return init(repo) if action == "init" else lint(repo)


if __name__ == "__main__":
    sys.exit(main(sys.argv))
