#!/usr/bin/env python3
"""behavior-stats.py — Tier-4 verdict over a `claude plugin eval --json` result.

`plugin eval` reports per-case score/passRate for the with- and without-skill arms and
a raw delta. It does not report what the gate needs, so this adds:

  normalized gain  NG = (p_with - p_without) / (1 - p_without)
                   raw delta punishes skills whose task the model half-solves anyway;
                   NG measures how much of the *remaining* gap the skill closes.
  pass^k           C(c,k)/C(n,k): chance k independent runs ALL pass (unbiased).
                   The bar for skills that must work every time (tag `critical`).
  discrimination   a case both arms pass at 1.0 proves nothing — grader or task too
                   easy. Flagged, excluded from the verdict, must be rewritten.

Verdict: fail on any regression (NG < 0), on a with-arm passRate below --threshold,
or on a `critical` case with pass^k below --threshold. A mean NG ≈ 0 over
discriminating cases is reported as dead weight (candidate for removal), not a fail.

Usage:
  behavior-stats.py <aggregate.json> [--json] [--threshold 0.8] [--k 3]
Exit 0 = pass, 1 = fail. Stdlib only.
"""
import re
import sys
import json
import hashlib
from math import comb
from pathlib import Path


def pass_pow_k(n, c, k):
    k = min(k, n)
    return comb(c, k) / comb(n, k) if n and k else 0.0


def norm_gain(p_with, p_without):
    if p_without >= 1.0:
        return 0.0 if p_with >= 1.0 else -1.0
    return (p_with - p_without) / (1.0 - p_without)


def is_critical(root, case):
    # plugin eval (2.1.280) drops `tags` from the result JSON — read the case file itself.
    case_dir = Path(root) / case.get("dir", "")
    for name in ("prompt.md", "case.yaml"):
        f = case_dir / name
        if f.is_file() and re.search(r"^tags:.*\bcritical\b", f.read_text(), re.M):
            return True
    return False


def main(argv):
    args = [a for a in argv if not a.startswith("--")]
    if not args:
        print(__doc__)
        return 2
    as_json = "--json" in argv
    threshold = float(argv[argv.index("--threshold") + 1]) if "--threshold" in argv else 0.8
    k = int(argv[argv.index("--k") + 1]) if "--k" in argv else 3

    raw = Path(args[0]).read_bytes()
    data = json.loads(raw)
    ablation = data.get("suite", {}).get("ablation")

    results, failures = [], []
    for case in data.get("cases", []):
        arms = case.get("arms", {})
        with_runs, without_runs = arms.get("with", []), arms.get("without", [])
        n, c = len(with_runs), sum(1 for r in with_runs if r.get("passed"))
        n0, c0 = len(without_runs), sum(1 for r in without_runs if r.get("passed"))
        p_with = c / n if n else 0.0
        p_without = c0 / n0 if n0 else None
        fired = [g.get("passed") for r in with_runs for g in r.get("graders", []) if g.get("withOnly")]
        critical = is_critical(data.get("suite", {}).get("root", ""), case)

        row = {
            "case": case.get("name"),
            "runs": n,
            "pass_with": round(p_with, 3),
            "pass_without": None if p_without is None else round(p_without, 3),
            "ng": None if p_without is None else round(norm_gain(p_with, p_without), 3),
            "pass_pow_k": round(pass_pow_k(n, c, k), 3),
            "skill_fired": (sum(fired) / len(fired)) if fired else None,
            "critical": critical,
            "discriminating": not (p_without is not None and p_with >= 1.0 and p_without >= 1.0),
        }
        if not row["discriminating"]:
            row["note"] = "both arms pass 1.0 — rewrite case/grader"
        else:
            if row["ng"] is not None and row["ng"] < 0:
                failures.append(f"{row['case']}: regression (NG {row['ng']})")
            if p_with < threshold:
                failures.append(f"{row['case']}: pass_with {row['pass_with']} < {threshold}")
            if critical and row["pass_pow_k"] < threshold:
                failures.append(f"{row['case']}: critical pass^{k} {row['pass_pow_k']} < {threshold}")
        results.append(row)

    gains = [r["ng"] for r in results if r["discriminating"] and r["ng"] is not None]
    mean_ng = round(sum(gains) / len(gains), 3) if gains else None
    record = {
        "tool": "behavior-stats",
        "tier": 4,
        "input_sha256": hashlib.sha256(raw).hexdigest(),
        "ablation": ablation,
        "k": k,
        "threshold": threshold,
        "cost_usd": data.get("costUsd"),
        "mean_ng": mean_ng,
        "dead_weight": mean_ng is not None and mean_ng <= 0.05,
        "non_discriminating": [r["case"] for r in results if not r["discriminating"]],
        "results": results,
        "failures": failures,
        "verdict": "fail" if failures else "pass",
    }
    if ablation != "with-without":
        record["warning"] = "no without-arm — NG and dead-weight check unavailable"

    if as_json:
        print(json.dumps(record, indent=2))
    else:
        print(f"{'case':28} {'runs':>4} {'with':>5} {'w/o':>5} {'NG':>6} {'pass^'+str(k):>7} {'fired':>5}")
        for r in results:
            fmt = lambda v: "—" if v is None else f"{v:.2f}"
            flag = "  (non-discriminating)" if not r["discriminating"] else ""
            print(f"{r['case'][:28]:28} {r['runs']:>4} {fmt(r['pass_with']):>5} {fmt(r['pass_without']):>5} "
                  f"{fmt(r['ng']):>6} {fmt(r['pass_pow_k']):>7} {fmt(r['skill_fired']):>5}{flag}")
        print(f"\nmean NG {mean_ng} · cost ${record['cost_usd']}")
        if record["dead_weight"]:
            print("dead weight: the skill does not beat the baseline — candidate for removal")
        for f in failures:
            print(f"FAIL {f}")
        print(f"verdict: {record['verdict']}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
