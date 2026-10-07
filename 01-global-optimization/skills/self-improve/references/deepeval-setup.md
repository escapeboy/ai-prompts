# Tier-3 via DeepEval — setup & judge notes

`scripts/deepeval_tier3.py` runs the Tier-3 rubric (§`rubric.md`) as **DeepEval G-Eval** metrics —
one per dimension, each with **fixed evaluation steps and a 1–5 rubric** mapped onto G-Eval's 0–10
scale. Threshold 0.5 (= 3/5; the rubric's "≤2/5 = blocking fail"). The judge also gets the list of
files bundled with the skill, so it can tell a thin core with live references from a monolith. It is the automated,
CI-runnable, reproducible Tier-3 gate: an independent judge model, not the agent grading itself.

## Install (once)
```bash
python3.12 -m venv ~/.claude/tools/deepeval-venv        # 3.12: DeepEval deps lack 3.14 wheels
~/.claude/tools/deepeval-venv/bin/pip install deepeval  # tested on deepeval 4.1.1 and 4.2.8
```

## Judge model — swappable via env
| Judge | Env |
|---|---|
| **Claude Code CLI** (recommended) | `TIER3_JUDGE=claude-cli` (+ optional `TIER3_CLAUDE_MODEL`, default `opus`). Uses your Claude Code login — no API key. Each call runs `claude -p` stripped to the prompt alone: no tools, MCP, skills, settings, hooks or `CLAUDE.md` (`--setting-sources ""`), from an empty temp dir. |
| **LM Studio** (local, default otherwise) | start server :1234 + load a **chat** model; defaults already point here |
| **Ollama** (local) | `TIER3_BASE_URL=http://localhost:11434/v1/ TIER3_MODEL=qwen2.5:7b-instruct TIER3_API_KEY=ollama` |
| **OpenAI / OpenRouter** | `TIER3_BASE_URL=https://api.openai.com/v1/ TIER3_MODEL=gpt-4o TIER3_API_KEY=$OPENAI_API_KEY` |
| **RunPod / vLLM** (strong open model, rare large batches or privacy) | same as OpenAI: `TIER3_BASE_URL=<pod>/v1/` + served model name + token. Tear the pod down after the batch. |

## Run
```bash
~/.claude/tools/deepeval-venv/bin/python scripts/deepeval_tier3.py <skill-dir> [--json]
```
Exit 0 = all dimensions ≥ 0.5; 1 = a dimension failed; 2 = setup error. `--json` emits a
`{tier:3, results:[{dimension,score,pass,reason}], verdict}` record (pairs with the Tier-2 evidence
record when a cycle is sealed — see `integration-seams.md`).

## ⚠️ Judge quality — the load-bearing caveat
G-Eval scores are only as good as the judge. Measured on this library's 17 skills (2026-10-07,
DeepEval 4.2.8, fixed steps + rubric):

| Judge | Run-to-run | Verdict vs. Opus | Time |
|---|---|---|---|
| Opus via `claude -p` | two full runs: mean \|Δ\| 0.02, max 0.1, verdicts 17/17 identical | — | ~17 s/skill (5 dimensions concurrent) |
| `qwen2.5:7b-instruct` (Ollama) | — | 10/17 agree | similar |

Opus's one fail was real (`confidence-check` had no *when NOT to* cases: scope precision 0.1 → 0.8
after the fix). The 7B judge's reasons contradicted the file it graded. **Small local models are
smoke-only.** Two things made the scores stable, so keep them: (1) fixed `evaluation_steps` + a
`Rubric` — with only `criteria`, G-Eval regenerates its own steps each run and the same skill moved
by up to ±0.3; (2) the bundled-file listing — without it the judge cannot score progressive disclosure.

**Same-family bias**: Claude judging skills Claude wrote can be lenient. Use a different model than
the author (e.g. Opus judging Sonnet-written skills) and add a second, non-Claude judge for
contested verdicts.

## Notes
- The `claude-cli` judge has no logprobs, so G-Eval uses the stated score without probability
  weighting; the rubric bands keep that score anchored.
- Imports `GPTModel` from `deepeval.models.llms.openai_model` (internal path; verified on 4.1.1 and 4.2.8 —
  re-check on upgrade). `SingleTurnParams` is the current test-case param enum (`LLMTestCaseParams`
  is deprecated; the script falls back to it for older DeepEval).
- DeepEval's `deepeval set-local-model` CLI also works but its flags churn between versions
  (`--model`, `--prompt-api-key`); the env-var + `GPTModel(...)` path in the script is more stable.
