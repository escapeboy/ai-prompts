#!/usr/bin/env python3
"""deepeval_tier3.py — Tier-3 (LLM-as-judge) for the self-improve loop, via DeepEval.

Scores a skill's SKILL.md on the 5 rubric dimensions from
~/.claude/skills/self-improve/references/rubric.md using DeepEval G-Eval metrics.
Each dimension is a 0-1 G-Eval score; the rubric's "<=2/5 on any dimension = blocking
fail" maps to threshold 0.5 (3/5 = 5-6 on the 0-10 scale). Judge: the local Claude Code login
(TIER3_JUDGE=claude-cli) or any OpenAI-compatible endpoint (TIER3_BASE_URL/MODEL/API_KEY).

Usage: deepeval_tier3.py <skill-dir> [--json]
Exit 0 = all dimensions pass; 1 = a dimension failed; 2 = usage/setup error.
"""
import sys
import json
from pathlib import Path

import os

import asyncio
import subprocess
import tempfile

try:
    from deepeval.metrics import GEval
    from deepeval.metrics.g_eval import Rubric
    from deepeval.test_case import LLMTestCase
    try:
        from deepeval.test_case import SingleTurnParams as Params
    except ImportError:
        from deepeval.test_case import LLMTestCaseParams as Params
    from deepeval.models.base_model import DeepEvalBaseLLM
    from deepeval.models.llms.openai_model import GPTModel
except ImportError as e:
    print(f"setup error: {e} — run inside the deepeval venv", file=sys.stderr)
    sys.exit(2)


class ClaudeCLIModel(DeepEvalBaseLLM):
    """Judge via `claude -p` — uses the Claude Code login, no API key.

    The session is stripped so the judge sees only the prompt: no tools, MCP, skills,
    settings/hooks or CLAUDE.md (`--setting-sources ""`), run from an empty directory.
    No logprobs, so G-Eval uses the judge's stated score without probability weighting.
    """

    def __init__(self, model):
        self.cli_model = model
        self.cwd = tempfile.mkdtemp(prefix="tier3-judge-")
        super().__init__(model)

    def load_model(self):
        return self

    def get_model_name(self):
        return f"claude-cli/{self.cli_model}"

    def _cmd(self, schema):
        cmd = ["claude", "-p", "--model", self.cli_model, "--output-format", "json",
               "--tools", "", "--strict-mcp-config", "--disable-slash-commands",
               "--no-session-persistence", "--setting-sources", ""]
        if schema is not None:
            cmd += ["--json-schema", json.dumps(schema.model_json_schema())]
        return cmd

    @staticmethod
    def _parse(stdout, schema):
        data = json.loads(stdout)
        if data.get("is_error"):
            raise RuntimeError(f"claude -p failed: {data.get('result')}")
        if schema is None:
            return data["result"]
        return schema(**data["structured_output"])

    def generate(self, prompt, schema=None):
        r = subprocess.run(self._cmd(schema), input=prompt, capture_output=True,
                           text=True, cwd=self.cwd, timeout=600)
        if r.returncode != 0:
            raise RuntimeError(f"claude -p exit {r.returncode}: {r.stderr.strip()[:300]}")
        return self._parse(r.stdout, schema)

    async def a_generate(self, prompt, schema=None):
        proc = await asyncio.create_subprocess_exec(
            *self._cmd(schema), stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE, cwd=self.cwd)
        out, err = await asyncio.wait_for(proc.communicate(prompt.encode()), timeout=600)
        if proc.returncode != 0:
            raise RuntimeError(f"claude -p exit {proc.returncode}: {err.decode().strip()[:300]}")
        return self._parse(out.decode(), schema)


# Swappable judge. TIER3_JUDGE=claude-cli uses the local Claude Code login
# (TIER3_CLAUDE_MODEL, default "opus"). Otherwise any OpenAI-compatible endpoint,
# defaulting to local LM Studio. A weak local model (e.g. gemma-4-e4b) miscalibrates scores.
if os.environ.get("TIER3_JUDGE") == "claude-cli":
    JUDGE = ClaudeCLIModel(os.environ.get("TIER3_CLAUDE_MODEL", "opus"))
else:
    JUDGE = GPTModel(
        model=os.environ.get("TIER3_MODEL", "google/gemma-4-e4b"),
        base_url=os.environ.get("TIER3_BASE_URL", "http://localhost:1234/v1/"),
        api_key=os.environ.get("TIER3_API_KEY", "lm-studio"),
    )

# The 5 rubric dimensions (from references/rubric.md): name, fixed evaluation steps, and the
# 1-5 anchors. Fixed steps + a rubric keep scores stable across runs; with only `criteria`,
# G-Eval regenerates its own steps each run and the score drifts.
DIMENSIONS = [
    ("scope-precision",
     ["Find the section that says when NOT to use the skill.",
      "Check that each 'not' case names a concrete simpler alternative (a skill, command or tool).",
      "Check that the description does not trigger on far more than the skill handles."],
     ["Fires on everything, or no 'when NOT to' guidance at all.",
      "Some exclusions, but vague and without named alternatives.",
      "A 'when NOT to' section exists; some alternatives are named, some cases are vague.",
      "A precise 'when NOT to' table; nearly every case names an alternative.",
      "A precise 'when NOT to' table; every case names the simpler alternative."]),
    ("progressive-disclosure",
     ["Judge whether SKILL.md is a decision core or carries long detail inline.",
      "Use the bundled-files list: references/ files should be pointed to from SKILL.md, "
      "with a condition for when to read them; files nobody points to are dead weight.",
      "A short SKILL.md (under ~150 lines) with no references/ is acceptable; penalize only "
      "inline depth that bloats the core, or references that are dead or never loaded."],
     ["A monolith with long detail inline, or dead/unused references.",
      "Mostly inline; references exist but are not linked or not conditional.",
      "Reasonably lean; some detail that belongs in references sits inline.",
      "Thin core; references linked with clear conditions; little inline excess.",
      "Thin decision core; all depth in live references loaded on demand."]),
    ("boundary-clarity",
     ["Find explicit Always / Ask first / Never boundaries.",
      "Check that destructive, hard-to-reverse or shared-state operations the skill can "
      "perform are gated under Ask first or Never.",
      "Check that the boundaries do not contradict the procedure."],
     ["No boundaries.",
      "Boundaries implied or partial; destructive operations ungated.",
      "All three tiers present; some consequential operations or contradictions not handled.",
      "All three tiers; consequential operations gated; minor gaps.",
      "All three tiers; every consequential operation gated; consistent with the procedure."]),
    ("convention-adherence",
     ["Check the name is kebab-case and the description says what the skill does and when to use it.",
      "Check for a 'When to Use (and When NOT to)' table near the top.",
      "Check for a Boundaries section with Always / Ask first / Never.",
      "Do NOT score the references split here; progressive-disclosure covers it."],
     ["Reinvents structure and naming.",
      "Follows one or two conventions.",
      "Follows most conventions with noticeable deviations.",
      "Follows the conventions with minor deviations.",
      "Matches the library's authoring conventions."]),
    ("signal-fidelity",
     ["Infer the recurring need the skill exists for from its description and When-to-Use section.",
      "Check that every section serves that need.",
      "Penalize speculative features, options nobody asked for, and repeated content."],
     ["Mostly speculative features beyond the need.",
      "Serves the need but with substantial gold-plating.",
      "Serves the need with moderate extras or repetition.",
      "Tightly scoped; small extras.",
      "Encodes exactly the recurring requirement, nothing beyond it."]),
]

# 1-5 rubric -> G-Eval's 0-10 scale; score/10 is the metric. The rubric's "<=2/5 on any
# dimension is a blocking fail" means 3/5 (5-6/10) passes, so the threshold is 0.5.
BANDS = [(0, 2), (3, 4), (5, 6), (7, 8), (9, 10)]
THRESHOLD = 0.5


def build_metrics(model=JUDGE):
    return [
        GEval(name=name, evaluation_steps=steps,
              rubric=[Rubric(score_range=band, expected_outcome=f"{i}/5: {anchor}")
                      for i, (band, anchor) in enumerate(zip(BANDS, anchors), start=1)],
              evaluation_params=[Params.ACTUAL_OUTPUT],
              threshold=THRESHOLD, model=model)
        for name, steps, anchors in DIMENSIONS
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
    # The judge cannot see the directory, so list the bundled files — otherwise it cannot
    # tell a thin core with live references from a monolith (progressive-disclosure).
    bundled = sorted(str(p.relative_to(skill_dir)) for p in skill_dir.rglob("*")
                     if p.is_file() and p.name not in ("SKILL.md", ".DS_Store")
                     and "__pycache__" not in p.parts)
    listing = "\n".join(f"- {f}" for f in bundled) or "(none — SKILL.md only)"
    tc = LLMTestCase(
        input=f"Evaluate the skill '{skill_dir.name}' SKILL.md against the self-improve authoring rubric.",
        actual_output=f"{content}\n\n---\nFiles bundled with this skill besides SKILL.md:\n{listing}",
    )

    metrics = build_metrics()

    async def measure_all():
        await asyncio.gather(*(m.a_measure(tc, _show_indicator=False) for m in metrics))

    asyncio.run(measure_all())  # the 5 dimensions run concurrently

    results, failed = [], False
    for metric in metrics:
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
