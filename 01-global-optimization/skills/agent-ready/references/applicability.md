# Applicability & ROI framework — which checks to actually implement

The scanner reports ~22 checks in 5 categories. Most only matter for a specific *site type*.
Classify the project first, then use the tables. Default posture: **selective** — a low
score is fine for a content site; only implement what pays back.

Statuses: `pass` = done, `fail` = candidate, `neutral` = **scanner already decided it's
not applicable — do nothing**, `unableToCheck` = scanner couldn't test (often a 403/timeout;
treat like the endpoint is absent unless you know otherwise).

## Site-type classification

- **Content / marketing / media site** (blog, catalog, Pinterest-style, docs, brochure):
  no agent-callable API, no agentic payments. → DO the discoverability/content basics;
  CONDITIONAL items are almost all SKIP.
- **Web app with a real API** (SaaS, dev tool, platform with a public/partner API): may
  genuinely benefit from MCP/OAuth/API-catalog/agent-skills discovery. → DO basics + the
  discovery items that map to APIs you actually expose.
- **Agentic-commerce site** (sells to agents, wants automated checkout): commerce checks
  become real. Rare. Only if the business explicitly wants agent purchasing.

## Decision table

| Check | Category | Effort | Verdict rule |
|---|---|---|---|
| robotsTxt | discoverability | trivial | **DO** — every site. Valid robots.txt + `Sitemap:` line. |
| sitemap | discoverability | low | **DO** — every site. Scanner wants a fetchable `/sitemap.xml` (200, valid XML). A gzipped/custom-path sitemap referenced only in robots.txt may still read as fail — add/point a conventional `/sitemap.xml` (can be an index). |
| linkHeaders | discoverability | low | **DO if** you have resources worth advertising (api-catalog, llms.txt, sitemap). Cheap; harmless. |
| dnsAid | discoverability | med | **SKIP** unless the user wants it — DNS-for-AI-Discovery is thinly adopted; needs DNS record management. |
| markdownNegotiation | contentAccessibility | low–med | **DO for content sites that want AI answer-engine pickup.** Serve markdown of pages via `Accept: text/markdown` or `.md` variants. SKIP if content is filtered by AI engines anyway (e.g. adult). |
| llms.txt (contentAccessibility) | content | low | **DO** — a curated `/llms.txt` index is cheap and broadly useful. Keep it real (link to sitemap + main sections). |
| robotsTxtAiRules | botAccessControl | low | **DECISION** — see AI-crawler policy below. |
| contentSignals | botAccessControl | low | **DO if** you've decided a crawler policy — Cloudflare Content Signals in robots.txt declare `search`/`ai-input`/`ai-train` intent. Cheap, and pairs with the policy decision. |
| webBotAuth | botAccessControl | high | **SKIP** unless the user asks — cryptographic verified-bot auth, brand new. |
| apiCatalog | discovery | low–med | **CONDITIONAL** — only if you expose an HTTP API. Publish `/.well-known/api-catalog` (RFC 9727) listing real endpoints/OpenAPI. |
| oauthDiscovery | discovery | med | **CONDITIONAL** — only if you actually run OAuth/OIDC. Publish real `/.well-known/oauth-authorization-server`. Never fake it. |
| oauthProtectedResource | discovery | med | **CONDITIONAL** — only with a real OAuth-protected API (RFC 9728). |
| authMd | discovery | low | **CONDITIONAL** — `/auth.md` documenting how agents authenticate. Only if there's real auth to document. |
| mcpServerCard | discovery | med–high | **CONDITIONAL** — only if you run (or will run) an MCP server. The card at `/.well-known/mcp/server-card.json` must point to a live server. A card with no server is worse than nothing. |
| a2aAgentCard | discovery | med | **CONDITIONAL** — only if you expose an A2A agent. |
| agentSkills | discovery | med | **CONDITIONAL** — only if you publish real Agent Skills (SKILL.md files under `/.well-known/agent-skills/`). |
| webMcp | discovery | med | **CONDITIONAL** — in-page WebMCP tools; only if the site genuinely offers agent-usable tools. |
| x402 / mpp / ucp / acp / ap2 | commerce | high | **SKIP** unless agentic-commerce site. Scanner marks these `neutral` for non-commerce sites — no action. |

## The AI-crawler policy decision (robotsTxtAiRules + contentSignals)

This is the one item with real stakes and **no default** — it's a business call. Present
the trade-off and let the user choose:

- **Allow AI crawlers** (raises the score): potential referral traffic from AI answer
  engines; your content can appear in AI answers. Downside: content scraped into training
  sets, crawl-budget cost.
- **Block AI training crawlers** (lowers the "AI content accessibility" score, on purpose):
  protects content from unpaid training use, saves crawl budget. Right call when the site
  fights crawl budget, gets little AI-referral upside, or the content is filtered out of AI
  answers anyway (e.g. adult, paywalled, sensitive).

Major AI crawler UAs to name if blocking: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`,
`ClaudeBot`, `anthropic-ai`, `Claude-Web`, `CCBot`, `Google-Extended`, `PerplexityBot`,
`Perplexity-User`, `Bytespider`, `Amazonbot`, `Meta-ExternalAgent`, `Applebot-Extended`,
`Diffbot`, `cohere-ai`, `Timpibot`, `Omgilibot`, `ImagesiftBot`. If on Cloudflare, its
one-click "AI Crawl Control" / managed robots + Content Signals is the lowest-effort lever.
This list ages fast — new crawlers appear constantly; verify against a current source
(Cloudflare's managed AI-crawler list or darkvisitors.com) before shipping a block list.

## Honesty rule

If the honest verdict for a project is "only the 3 cheap discoverability items are worth it
and everything else is N/A", say exactly that. Do not pad the plan to look thorough.
