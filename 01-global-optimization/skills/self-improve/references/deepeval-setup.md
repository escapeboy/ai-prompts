# Tier-3 via DeepEval — setup & judge notes

`scripts/deepeval_tier3.py` runs the Tier-3 rubric (§`rubric.md`) as **DeepEval G-Eval** metrics —
one per dimension, threshold 0.6 (the rubric's "≤2/5 = blocking fail"). It is the automated,
CI-runnable, reproducible Tier-3 gate: an independent judge model, not the agent grading itself.

## Install (once)
```bash
python3.12 -m venv ~/.claude/tools/deepeval-venv        # 3.12: DeepEval deps lack 3.14 wheels
~/.claude/tools/deepeval-venv/bin/pip install deepeval  # tested on deepeval 4.1.1 and 4.2.8
```

## Judge model — swappable via env (any OpenAI-compatible endpoint)
| Judge | Env |
|---|---|
| **LM Studio** (local, default) | start server :1234 + load a **chat** model; defaults already point here |
| **Ollama** (local) | `TIER3_BASE_URL=http://localhost:11434/v1/ TIER3_MODEL=qwen2.5:7b-instruct TIER3_API_KEY=ollama` |
| **OpenAI / OpenRouter** | `TIER3_BASE_URL=https://api.openai.com/v1/ TIER3_MODEL=gpt-4o TIER3_API_KEY=$OPENAI_API_KEY` |
| **Anthropic (Claude)** | not via GPTModel — swap to DeepEval's `AnthropicModel` in the script |

## Run
```bash
~/.claude/tools/deepeval-venv/bin/python scripts/deepeval_tier3.py <skill-dir> [--json]
```
Exit 0 = all dimensions ≥ 0.6; 1 = a dimension failed; 2 = setup error. `--json` emits a
`{tier:3, results:[{dimension,score,pass,reason}], verdict}` record (pairs with the Tier-2 evidence
record when a cycle is sealed — see `integration-seams.md`).

## ⚠️ Judge quality — the load-bearing caveat
G-Eval scores are only as good as the judge. **Small local models miscalibrate**: on the pilot,
`google/gemma-4-e4b` produced *correct reasoning but a wrong number* (e.g. score 0.1 while the reason
confirmed the text passed). The integration is sound; the model is the variable. For trustworthy
Tier-3 verdicts use a **strong** judge — a larger local model (Qwen2.5-32B/Llama-3.3-70B class),
OpenAI/OpenRouter, or Claude via `AnthropicModel`. Treat small-local-model scores as smoke-only.

## Notes
- Imports `GPTModel` from `deepeval.models.llms.openai_model` (internal path; verified on 4.1.1 and 4.2.8 —
  re-check on upgrade). `SingleTurnParams` is the current test-case param enum (`LLMTestCaseParams`
  is deprecated; the script falls back to it for older DeepEval).
- DeepEval's `deepeval set-local-model` CLI also works but its flags churn between versions
  (`--model`, `--prompt-api-key`); the env-var + `GPTModel(...)` path in the script is more stable.
