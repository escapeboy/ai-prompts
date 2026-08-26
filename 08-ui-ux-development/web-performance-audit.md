# Web Performance Audit (`/webperf` pattern)

**Source:** adapted from [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)
(`/webperf` → `web-performance-auditor`). Evaluated 2026-08-26. Complements the Core Web Vitals
targets already baked into `ui-ux-pro-skill.md` §6.D and the `design-taste-frontend` skill.

## When to use (and when NOT)

| Use it for | Don't use it for |
|------------|------------------|
| Browser-facing web apps / pages / components | Utility libraries, CLIs |
| A perf regression or "why is this slow" on a page | Server-only code with no browser output |
| Pre-ship audit of a landing page / dashboard | Non-visual backend perf (that's `07-custom-commands/perf.md`) |

The differentiator vs. a generic "make it faster": **measure before you optimize.** Every finding is
tied to a metric or labelled `potential impact`, never asserted.

## Two modes — pick by what evidence you have

**Deep mode** — activate when any real measurement is available:
- A Lighthouse JSON report — `npx lighthouse <url> --output json --output-path ./report.json`
- A PageSpeed Insights JSON response (Lighthouse + CrUX field data)
- A CrUX API response (needs `CRUX_API_KEY` / `GOOGLE_API_KEY`)
- A DevTools performance trace
- A live URL **plus** the `chrome-devtools` MCP configured (capture via `lighthouse_audit` /
  `performance_*` tools) — or the Chrome DevTools MCP CLI locally
  (`npx -p chrome-devtools-mcp chrome-devtools lighthouse_audit --output-format=json`)

**Quick mode** — default when no measurement exists. Scan source for structural anti-patterns and
label **every** finding `potential impact` (never claim a number you didn't measure — matches our
Verify-Don't-Assume rule).

## Running it

1. State the mode you expect (so missing Deep inputs surface early).
2. Provide: the files/components/diff under review; any artifact paths (Lighthouse/PSI/CrUX/trace) or
   pasted JSON; the target URL/page name.
3. In our fleet, run it as a focused subagent (`performance-engineer` / `react-performance-optimization`)
   or inline for a small page. Return: a scorecard (only sourced values populated), a ranked findings
   list, positive observations, and proactive recommendations.

## Metric targets (align with `ui-ux-pro-skill.md` §6.D)

- **LCP** < 2.5s · **INP** < 200ms · **CLS** < 0.1
- Images: WebP/AVIF, explicit dimensions (reserve space → no CLS), lazy-load below the fold
- No layout thrash; hardware-accelerate transforms; respect `prefers-reduced-motion`

## Our-stack note

For Laravel + Blade + Tailwind pages, Quick mode over the Blade/JS + a Lighthouse run against the
deployed URL is usually enough. Fold results into the deploy verification, not a separate ceremony.
