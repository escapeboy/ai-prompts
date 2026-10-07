#!/usr/bin/env python3
"""deepeval_tier3.py — Tier-3 (LLM-as-judge) for the self-improve loop, via DeepEval.

Scores a skill's SKILL.md on the 5 rubric dimensions from
~/.claude/skills/self-improve/references/rubric.md using DeepEval G-Eval metrics.
Each dimension is a 0-1 G-Eval score; the rubric's "<=2/5 on any dimension = blocking
fail" maps to threshold 0.6 (=3/5). Runs against whatever judge model DeepEval is
configured with (`deepeval set-local-model` for LM Studio/Ollama, or an API key).

Usage: deepeval_tier3.py <skill-dir> [--json]
Exit 0 = all dimensions pass; 1 = a dimension failed; 2 = usage/setup error.
"""
import sys
import json
from pathlib import Path

import os

try:
    from deepeval.metrics import GEval
    from deepeval.test_case import LLMTestCase
    try:
        from deepeval.test_case import SingleTurnParams as Params
    except ImportError:
        from deepeval.test_case import LLMTestCaseParams as Params
    from deepeval.models.llms.openai_model import GPTModel
except ImportError as e:
    print(f"setup error: {e} — run inside the deepeval venv", file=sys.stderr)
    sys.exit(2)

# Swappable judge: any OpenAI-compatible endpoint. Defaults to local LM Studio.
# For a stronger judge, point these at OpenAI/OpenRouter (or use DeepEval's
# AnthropicModel for Claude). A weak local model (e.g. gemma-4-e4b) miscalibrates scores.
JUDGE = GPTModel(
    model=os.environ.get("TIER3_MODEL", "google/gemma-4-e4b"),
    base_url=os.environ.get("TIER3_BASE_URL", "http://localhost:1234/v1/"),
    api_key=os.environ.get("TIER3_API_KEY", "lm-studio"),
)

# The 5 rubric dimensions (from references/rubric.md). name, criteria.
DIMENSIONS = [
    ("scope-precision",
     "Does the SKILL.md clearly say when NOT to use the skill and name a simpler "
     "alternative? A 5 has a precise 'when NOT to' table; a 1 fires on everything or is vague."),
    ("progressive-disclosure",
     "Is it a thin decision core with depth pushed into references/ that load on demand? "
     "A 5 is a thin core with live references; a 1 is a monolith or has dead/unused references."),
    ("boundary-clarity",
     "Does it close with explicit Always / Ask-first / Never boundaries, with destructive or "
     "shared-state operations gated under Ask-first? A 5 gates consequential ops; a 1 has none."),
    ("convention-adherence",
     "Does it match the library's authoring conventions (kebab-case name, 'When to Use' table, "
     "boundaries, references split)? A 5 matches; a 1 reinvents structure/naming."),
    ("signal-fidelity",
     "Does it encode the actual recurring requirement without gold-plating beyond it? "
     "A 5 is tightly scoped to the real need; a 1 adds speculative features."),
]

THRESHOLD = 0.6  # 3/5; rubric: <=2/5 on any dimension is a blocking fail


def build_metrics(model=JUDGE):
    return [
        GEval(name=name, criteria=criteria,
              evaluation_params=[Params.ACTUAL_OUTPUT],
              threshold=THRESHOLD, model=model)
        for name, criteria in DIMENSIONS
    ]


def main(argv):
    args = [a for a in argv[1:] if not a.startswith("--")]
    as_json = "--json" in argv[1:]
    if not args:
        print("usage: deepeval_tier3.py <skill-dir> [--json]", file=sys.stderr)
        return 2
    skill_dir = Path(args[0])
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        print(f"setup error: no {skill_md}", file=sys.stderr)
        return 2

    content = skill_md.read_text(encoding="utf-8", errors="replace")
    tc = LLMTestCase(
        input=f"Evaluate the skill '{skill_dir.name}' SKILL.md against the self-improve authoring rubric.",
        actual_output=content,
    )

    results, failed = [], False
    for metric in build_metrics():
        metric.measure(tc)  # calls the configured judge model
        passed = (metric.score or 0) >= THRESHOLD
        failed = failed or not passed
        results.append({
            "dimension": metric.name,
            "score": round(metric.score or 0, 3),
            "pass": passed,
            "reason": (metric.reason or "").strip(),
        })

    verdict = "fail" if failed else "pass"
    if as_json:
        print(json.dumps({"tool": "deepeval-tier3", "tier": 3, "skill": skill_dir.name,
                          "threshold": THRESHOLD, "results": results, "verdict": verdict}, indent=2))
    else:
        print(f"deepeval Tier-3 judge — {skill_dir.name}")
        for r in results:
            mark = "PASS" if r["pass"] else "FAIL"
            print(f"  [{mark}] {r['dimension']}: {r['score']}")
            print(f"         {r['reason'][:200]}")
        print(f"  VERDICT: {verdict.upper()} (threshold {THRESHOLD})")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
