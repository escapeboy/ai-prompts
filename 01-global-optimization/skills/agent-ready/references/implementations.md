# Implementation recipes (per stack)

For each approved check, first fetch the check's official `skillUrl` from the scan JSON
(Cloudflare's own SKILL.md states exact requirements + how the scanner validates), then
implement in the project's idiom below. Ship only real, backed artifacts — never a
discovery doc pointing at a service that doesn't exist.

## Stack detection (where files & headers live)

| Signal | Stack | Static file root | Headers / routes |
|---|---|---|---|
| `artisan`, `composer.json` | **Laravel** | `public/` | routes in `routes/web.php`; headers via middleware or the web server (nginx/Apache) |
| `next.config.*` | **Next.js** | `public/` | `app/robots.ts`, `app/sitemap.ts`, `headers()` in `next.config`, route handlers under `app/.well-known/**/route.ts` |
| `package.json` + `express`/`fastify` | **Node server** | `public/`/static dir | app routes + `res.set('Link', ...)` |
| `_config.yml`, `astro.config.*`, `gatsby-config.*`, plain `index.html` | **Static/SSG** | site root / `dist` / `public` | headers via host (`_headers` for Netlify/CF Pages, `vercel.json`, nginx) |

Serve `.well-known/*` and text files as **static files with correct content-types** where
possible; only use app routes when the file must be dynamic. Respect the repo's build/deploy
& CDN-cache rules (robots.txt/sitemap are often edge-cached — bust the cache after changing).

## robots.txt (+ Sitemap + AI rules + Content Signals)

Keep existing rules. Ensure a `Sitemap:` line. If the crawler-policy decision was **block**,
add per-UA groups; if **allow**, leave wildcard. Content Signals go as a comment-directive
block per Cloudflare's spec. Example (blocking training crawlers, allowing search):

```
User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml

# Content Signals: allow search indexing, disallow AI training
User-agent: *
Content-Signal: search=yes, ai-train=no

User-agent: GPTBot
Disallow: /
User-agent: ClaudeBot
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: Google-Extended
Disallow: /
# ...repeat for the UA list in applicability.md
```

Laravel/static: edit `public/robots.txt`. Next.js: `app/robots.ts`.

## sitemap.xml

Scanner wants a fetchable `/sitemap.xml` (HTTP 200, valid XML — a `<sitemapindex>` is fine).
If the project already generates a sitemap at a custom/gzipped path, ADD a conventional
`/sitemap.xml` (or a sitemap index at that path) and reference it from robots.txt. Laravel:
if a `sitemap:generate` command exists, wire its output to `public/sitemap.xml`; else a
small route/command. Next.js: `app/sitemap.ts`.

## llms.txt

Curated markdown index at `/llms.txt` (200, `text/plain` or `text/markdown`). Real content:

```
# <Site Name>

> One-line description of what the site is.

## Main sections
- [Section](https://example.com/section): what it is
- [Sitemap](https://example.com/sitemap.xml)

## Notes
- Contact / API / docs links if any
```

Optionally `/llms-full.txt` with expanded content. Place as a static file in the public root.

## Link headers (RFC 8288)

Add `Link` response headers to the homepage advertising real resources, e.g.:
`Link: </sitemap.xml>; rel="sitemap", </llms.txt>; rel="llms-txt"`
(add `</.well-known/api-catalog>; rel="api-catalog"` only if that exists).
- nginx: `add_header Link '</sitemap.xml>; rel="sitemap"' always;`
- Next.js: `headers()` in `next.config.js`.
- Express: `res.set('Link', ...)`.

## Markdown for Agents (content negotiation)

Serve a markdown representation when the client sends `Accept: text/markdown` (or expose
`<page>.md` variants). Implement via middleware that content-negotiates on `Accept`, or a
build step emitting `.md` alongside HTML. Only worth it if AI engines actually consume this
site's content.

## .well-known discovery (CONDITIONAL — only with a real backing service)

- `mcpServerCard` → `/.well-known/mcp/server-card.json` describing a **live** MCP server
  (name, version, transport/URL, capabilities) per the MCP spec.
- `oauthDiscovery` → `/.well-known/oauth-authorization-server` for your **real** OAuth/OIDC.
- `oauthProtectedResource` → `/.well-known/oauth-protected-resource` (RFC 9728) for a real
  protected API.
- `apiCatalog` → `/.well-known/api-catalog` (RFC 9727) linking your OpenAPI/endpoints.
- `authMd` → `/auth.md` documenting agent auth flow.
- `a2aAgentCard` → `/.well-known/agent.json` for a real A2A agent.
- `agentSkills` → SKILL.md files under `/.well-known/agent-skills/<skill>/SKILL.md` + an
  index, for skills you actually publish.

Fetch each check's `skillUrl` for the exact schema before writing these. If the backing
service doesn't exist, **do not create the file** — record it as skipped with the reason.

## After implementing

Re-run `scripts/scan.py` against the deployed URL. Because changes must be live to pass,
deploy first (per the repo's deploy rules) and bust any CDN/edge cache on robots.txt /
sitemap / new files before re-scanning. Confirm each targeted check is now `pass`.
