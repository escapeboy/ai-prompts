#!/usr/bin/env python3
"""skill-lint.py — deterministic Tier-2 validation for a skill library.

The mechanical, objectively-measurable checks a skill must pass — the analogue of
Salesforce's `validate-skills.ts` and the "Structural Validation" tier of the
three-tier eval loop (see the `self-improve` skill). Pure determinism: same input →
same verdict, no LLM. Trigger-accuracy (Tier 1) and semantic quality (Tier 3) are
NOT here — they need judgement and live in the loop's subagent steps.

Evidence seam: `--json` emits an evidence record (input digest + per-rule results +
verdict) shaped to be sealed by a deterministic-execution / evidence platform into a
hash-chained bundle. Stdlib only, so it runs anywhere (pre-commit, CI, an eval node).

Usage:
  skill-lint.py <skills-dir> [--json] [--strict]
    <skills-dir>  directory containing one subdir per skill (each with SKILL.md)
    --json        print the evidence record as JSON instead of the human table
    --strict      treat warnings as failures (exit 1)
"""
import sys
import re
import json
import hashlib
from pathlib import Path

NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")   # kebab-case
DESC_MIN, DESC_MAX = 40, 1400                          # description length bounds (chars)
SIM_THRESHOLD = 0.80                                   # description Jaccard → trigger-collision warn
SKIP_DIRS = {"scripts", "__pycache__", "node_modules", ".git"}


def _split_frontmatter(text):
    """Return (frontmatter_dict, body) for a `---`-delimited SKILL.md. Minimal
    stdlib YAML: flat `key: value` + folded `>`/`|` block scalars (enough for
    name/description). Returns (None, text) if no frontmatter."""
    if not text.startswith("---"):
        return None, text
    end = text.find("\n---", 3)
    if end == -1:
        return None, text
    fm_raw = text[3:end].strip("\n")
    body = text[end + 4:]
    fm, lines, i = {}, fm_raw.splitlines(), 0
    while i < len(lines):
        line = lines[i]
        m = re.match(r"^([A-Za-z0-9_-]+):\s*(.*)$", line)
        if not m:
            i += 1
            continue
        key, val = m.group(1), m.group(2).strip()
        if val in (">", ">-", "|", "|-"):  # folded/literal block scalar
            block, i = [], i + 1
            while i < len(lines) and (lines[i].startswith((" ", "\t")) or lines[i] == ""):
                block.append(lines[i].strip())
                i += 1
            fm[key] = " ".join(b for b in block if b).strip()
            continue
        fm[key] = val.strip().strip('"').strip("'")
        i += 1
    return fm, body


def _words(s):
    return set(re.findall(r"[a-z0-9]+", (s or "").lower()))


def _jaccard(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def lint_skill(skill_dir: Path):
    """Return (errors, warnings, meta) for one skill directory."""
    errors, warnings = [], []
    name = skill_dir.name
    skill_md = skill_dir / "SKILL.md"

    if not skill_md.exists():
        return [f"{name}: no SKILL.md"], [], {"name": name, "description": ""}

    text = skill_md.read_text(encoding="utf-8", errors="replace")
    fm, body = _split_frontmatter(text)

    if fm is None:
        errors.append(f"{name}: SKILL.md has no `---` frontmatter block")
        return errors, warnings, {"name": name, "description": ""}

    fm_name = fm.get("name", "")
    desc = fm.get("description", "")

    if not fm_name:
        errors.append(f"{name}: frontmatter missing `name`")
    else:
        if fm_name != name:
            errors.append(f"{name}: frontmatter name '{fm_name}' != directory name")
        if not NAME_RE.match(fm_name):
            errors.append(f"{name}: name '{fm_name}' is not kebab-case")

    if not desc:
        errors.append(f"{name}: frontmatter missing `description`")
    else:
        if len(desc) < DESC_MIN:
            errors.append(f"{name}: description too short ({len(desc)} < {DESC_MIN} chars)")
        if len(desc) > DESC_MAX:
            warnings.append(f"{name}: description long ({len(desc)} > {DESC_MAX} chars) — trims context budget")

    # unreferenced bundled files: every non-SKILL file should be named in the body
    for f in skill_dir.rglob("*"):
        if not f.is_file() or f.name == "SKILL.md":
            continue
        if any(part in SKIP_DIRS or part.startswith(".") for part in f.relative_to(skill_dir).parts[:-1]):
            continue
        if f.name.startswith(".") or f.suffix == ".pyc":
            continue
        if f.name not in text:  # referenced by basename anywhere in SKILL.md
            warnings.append(f"{name}: bundled file '{f.relative_to(skill_dir)}' not referenced in SKILL.md (dead weight)")

    return errors, warnings, {"name": fm_name or name, "description": desc}


def lint_library(skills_dir: Path):
    skills = sorted(
        d for d in skills_dir.iterdir()
        if d.is_dir() and not d.name.startswith(".") and ".backup" not in d.name
    )
    all_errors, all_warnings, metas = [], [], []
    for d in skills:
        e, w, meta = lint_skill(d)
        all_errors += e
        all_warnings += w
        metas.append(meta)

    # cross-skill: duplicate names
    seen = {}
    for m in metas:
        seen.setdefault(m["name"], []).append(m["name"])
    for nm, group in seen.items():
        if len(group) > 1:
            all_errors.append(f"duplicate skill name across library: '{nm}' ({len(group)}x)")

    # cross-skill: near-duplicate descriptions → trigger-collision risk (Tier-1-lite)
    for i in range(len(metas)):
        for j in range(i + 1, len(metas)):
            sim = _jaccard(_words(metas[i]["description"]), _words(metas[j]["description"]))
            if sim >= SIM_THRESHOLD:
                all_warnings.append(
                    f"trigger-collision risk: '{metas[i]['name']}' ~ '{metas[j]['name']}' "
                    f"(description similarity {sim:.0%}) — may fire ambiguously"
                )
    return skills, all_errors, all_warnings


def main(argv):
    args = [a for a in argv[1:] if not a.startswith("--")]
    flags = {a for a in argv[1:] if a.startswith("--")}
    if not args:
        print("usage: skill-lint.py <skills-dir> [--json] [--strict]")
        return 2
    skills_dir = Path(args[0])
    if not skills_dir.is_dir():
        print(f"FAIL: not a directory: {skills_dir}")
        return 2

    skills, errors, warnings = lint_library(skills_dir)
    strict = "--strict" in flags
    verdict = "fail" if errors or (strict and warnings) else "pass"

    # deterministic input digest over every SKILL.md (for the evidence seam)
    h = hashlib.sha256()
    for d in skills:
        smd = d / "SKILL.md"
        if smd.exists():
            h.update(d.name.encode())
            h.update(smd.read_bytes())
    digest = h.hexdigest()

    if "--json" in flags:
        # evidence record — shape a deterministic-execution / seal node can consume
        print(json.dumps({
            "tool": "skill-lint",
            "tier": 2,
            "skills_dir": str(skills_dir),
            "skills_checked": len(skills),
            "input_sha256": digest,
            "errors": errors,
            "warnings": warnings,
            "verdict": verdict,
        }, indent=2))
    else:
        print(f"skill-lint: {len(skills)} skills in {skills_dir}")
        for e in errors:
            print(f"  ERROR  {e}")
        for w in warnings:
            print(f"  warn   {w}")
        print(f"  input_sha256={digest[:12]}…")
        print(f"  VERDICT: {verdict.upper()} "
              f"({len(errors)} errors, {len(warnings)} warnings)")
    return 1 if verdict == "fail" else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
