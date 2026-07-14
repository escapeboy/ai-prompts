#!/usr/bin/env python3
"""
agent-ready scanner — calls Cloudflare's isitagentready.com JSON API and prints a compact
triage view. Full JSON is saved to --out so it never floods agent context.

Usage:
    python3 scan.py https://example.com [--out /path/report.json] [--probe] [--raw]

--probe : skip the API, do direct endpoint probes (fallback when the API is down/blocked).
--raw   : also dump the pretty JSON to stdout (noisy; normally read --out instead).

Stdlib only. The API is the source of truth; --probe replicates the key checks locally.
"""
import os, sys, json, ssl, argparse, urllib.request, urllib.error

API = "https://isitagentready.com/api/scan"
UA = "Mozilla/5.0 (agent-ready-skill)"
CTX = ssl.create_default_context()


def _req(url, data=None, headers=None, method="GET", timeout=90):
    h = {"User-Agent": UA}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
            return r.status, dict(r.headers), r.read()
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read()
    except Exception as e:  # noqa
        return "ERR:" + str(e)[:80], {}, b""


def scan_api(url):
    st, _, body = _req(API, json.dumps({"url": url}).encode(),
                       {"Content-Type": "application/json"}, "POST")
    if st != 200:
        raise RuntimeError(f"api status {st}: {body[:200]!r}")
    return json.loads(body)


def print_report(d):
    print(f"URL      : {d.get('url')}")
    print(f"Scanned  : {d.get('scannedAt')}")
    print(f"Level    : {d.get('level')}  ({d.get('levelName')})")
    print(f"Commerce : {d.get('isCommerce')}  signals={d.get('commerceSignals')}")
    counts = {"pass": 0, "fail": 0, "neutral": 0, "unableToCheck": 0}
    print("\n=== CHECKS (only 'fail' needs a decision; 'neutral' = not applicable) ===")
    for cat, checks in (d.get("checks") or {}).items():
        print(f"\n[{cat}]")
        for name, c in checks.items():
            s = c.get("status", "?")
            counts[s] = counts.get(s, 0) + 1
            mark = {"pass": "OK  ", "fail": "FAIL", "neutral": "n/a ",
                    "unableToCheck": "??  "}.get(s, s)
            print(f"  {mark} {name:24} {c.get('message','')[:78]}")
    print(f"\nTotals: {counts}")

    nl = d.get("nextLevel") or {}
    reqs = nl.get("requirements") or []
    if reqs:
        print(f"\n=== NEXT LEVEL -> {nl.get('target')} ({nl.get('name')}) : "
              f"official remediation ===")
        for r in reqs:
            print(f"\n- {r.get('check')}: {r.get('description')}")
            if r.get("prompt"):
                print(f"    prompt   : {r['prompt'][:220]}")
            if r.get("skillUrl"):
                print(f"    skillUrl : {r['skillUrl']}")
            if r.get("specUrls"):
                print(f"    spec     : {', '.join(r['specUrls'][:3])}")
    else:
        print("\n(no nextLevel requirements returned — likely already at top or error)")


# ---- direct-probe fallback -------------------------------------------------
PROBE_PATHS = {
    "robotsTxt": "/robots.txt",
    "sitemap": "/sitemap.xml",
    "llms.txt": "/llms.txt",
    "markdownNegotiation": ("/", "text/markdown"),
    "mcpServerCard": "/.well-known/mcp/server-card.json",
    "a2aAgentCard": "/.well-known/agent.json",
    "agentSkills": "/.well-known/agent-skills/index.json",
    "oauthDiscovery": "/.well-known/oauth-authorization-server",
    "oauthProtectedResource": "/.well-known/oauth-protected-resource",
    "apiCatalog": "/.well-known/api-catalog",
    "authMd": "/auth.md",
    "securityTxt": "/.well-known/security.txt",
}


def probe(base):
    base = base.rstrip("/")
    print(f"URL      : {base}   (DIRECT PROBE — API unavailable)")
    print("\n=== ENDPOINT PROBES (200 = present) ===")
    for name, spec in PROBE_PATHS.items():
        accept = None
        path = spec
        if isinstance(spec, tuple):
            path, accept = spec
        hdrs = {"Accept": accept} if accept else None
        st, h, _ = _req(base + path, headers=hdrs)
        ct = h.get("Content-Type", "-")
        note = f"  (asked {accept} -> {ct})" if accept else ""
        print(f"  {str(st):6} {name:24} {path}{note}")
    st, h, _ = _req(base + "/", method="HEAD")
    print(f"\nHomepage Link header: {h.get('Link', '(none)')}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--out")
    ap.add_argument("--probe", action="store_true")
    ap.add_argument("--raw", action="store_true")
    a = ap.parse_args()
    url = a.url if a.url.startswith("http") else "https://" + a.url

    if a.probe:
        probe(url)
        return
    try:
        d = scan_api(url)
    except Exception as e:  # noqa
        print(f"[api failed: {e}] falling back to direct probes\n", file=sys.stderr)
        probe(url)
        return
    print_report(d)
    if a.out:
        out_dir = os.path.dirname(a.out)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
        with open(a.out, "w") as f:
            json.dump(d, f, indent=2)
        print(f"\nFull JSON saved: {a.out}")
    if a.raw:
        print(json.dumps(d, indent=2))


if __name__ == "__main__":
    main()
