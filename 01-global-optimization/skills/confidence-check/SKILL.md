---
name: confidence-check
description: Pre-implementation confidence assessment (≥90% required). Use before starting a non-trivial implementation — a new feature, an unfamiliar area or a bug whose cause is unclear — to verify readiness with duplicate check, architecture compliance, official docs verification, OSS references, and root cause identification. Skip it for trivial edits.
---

# Confidence Check Skill

## Purpose

Prevents wrong-direction execution by assessing confidence **BEFORE** starting implementation.

**Requirement**: ≥90% confidence to proceed with implementation.

**Test Results** (2025-10-21):
- Precision: 1.000 (no false positives)
- Recall: 1.000 (no false negatives)
- 8/8 test cases passed

## When to Use (and When NOT to)

| Use it | Skip it — a simpler path wins |
|---|---|
| A new feature or module, before the first line of code | A typo, rename, copy change or one-line config tweak — just make the edit |
| Work in an area of the codebase you have not explored yet | A change in code you just read — the checks would repeat what you know |
| A bug fix whose root cause is not yet proven | The root cause is already reproduced — go to [`fix-bug`](../../../03-custom-skills/examples/fix-bug/SKILL.md) or fix it directly |
| Adopting a library or API you have not used in this project | Looking up one API detail — query the docs (Context7) directly |
| The Plan → Build gate of a sprint | Pure research or review with no implementation planned — use [`code-research`](../code-research/SKILL.md) |

Before a non-trivial implementation, it checks that:
- No duplicate implementations exist
- Architecture compliance verified
- Official documentation reviewed
- Working OSS implementations found
- Root cause properly identified

## Confidence Assessment Criteria

Calculate confidence score (0.0 - 1.0) based on 5 checks:

### 1. No Duplicate Implementations? (25%)

**Check**: Search codebase for existing functionality

```bash
# Use Grep to search for similar functions
# Use Glob to find related modules
```

✅ Pass if no duplicates found
❌ Fail if similar implementation exists

### 2. Architecture Compliance? (25%)

**Check**: Verify tech stack alignment

- Read `CLAUDE.md`, `PLANNING.md`
- Confirm existing patterns used
- Avoid reinventing existing solutions

✅ Pass if uses existing tech stack (e.g., Supabase, UV, pytest)
❌ Fail if introduces new dependencies unnecessarily

### 3. Official Documentation Verified? (20%)

**Check**: Review official docs before implementation

- Use Context7 MCP for official docs
- Use WebFetch for documentation URLs
- Verify API compatibility

✅ Pass if official docs reviewed
❌ Fail if relying on assumptions

### 4. Working OSS Implementations Referenced? (15%)

**Check**: Find proven implementations

- Use Tavily MCP or WebSearch
- Search GitHub for examples
- Verify working code samples

✅ Pass if OSS reference found
❌ Fail if no working examples

### 5. Root Cause Identified? (15%)

**Check**: Understand the actual problem

- Analyze error messages
- Check logs and stack traces
- Identify underlying issue

✅ Pass if root cause clear
❌ Fail if symptoms unclear

## Confidence Score Calculation

```
Total = Check1 (25%) + Check2 (25%) + Check3 (20%) + Check4 (15%) + Check5 (15%)

If Total >= 0.90:  ✅ Proceed with implementation
If Total >= 0.70:  ⚠️  Present alternatives, ask questions
If Total < 0.70:   ❌ STOP - Request more context
```

## Output Format

```
📋 Confidence Checks:
   ✅ No duplicate implementations found
   ✅ Uses existing tech stack
   ✅ Official documentation verified
   ✅ Working OSS implementation found
   ✅ Root cause identified

📊 Confidence: 1.00 (100%)
✅ High confidence - Proceeding to implementation
```

## Implementation Details

The TypeScript implementation is available in `confidence.ts` for reference, containing:

- `confidenceCheck(context)` - Main assessment function
- Detailed check implementations
- Context interface definitions

## ROI

**Token Savings**: Spend 100-200 tokens on confidence check to save 5,000-50,000 tokens on wrong-direction work.

**Test results**: 8/8 internal test cases passed (precision and recall 1.0 on that set, 2025-10-21). It is a small set, so treat the threshold as a guide, not a guarantee.

## Boundaries

**Always**
- Run the check before writing code, not after.
- Report the score and every failed check to the user.

**Ask first**
- Before proceeding when confidence is between 70% and 90%: present the gaps and alternatives.

**Never**
- Start implementation below 70% confidence.
- Mark a check as passed without actually doing it (searching for duplicates, reading the official docs).

## Related skills
- [`sprint-orchestrate`](../sprint-orchestrate/SKILL.md) — runs this as the readiness gate between Plan and Build.
- [`decision-classify`](../decision-classify/SKILL.md) — classifies the choices that come up after the check passes.
- Guide: [`06-advanced-patterns/sprint-orchestration-guide.md`](../../../06-advanced-patterns/sprint-orchestration-guide.md).
