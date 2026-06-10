---
name: onepassword-integrate
description: Audit or install maximum-depth 1Password integration in the current project — fetches fresh 1Password developer docs first, detects existing integration, and either reviews/improves it or greenfield-installs (Service Account secret resolution + site-compat autocomplete/well-known). Stack-aware (Laravel, Node/Next, Python, Ruby/Rails, Go). Use when the user says "integrate 1Password", "make this site 1Password-friendly", "audit our 1P integration", or invokes /onepassword-integrate.
version: 1.0.0
---

# 1Password Integration & Compatibility Skill

> **Note on `references/`**: the stack-specific recipes referenced at the bottom are companion files you author per stack (the progressive-disclosure layout from [guide.md](../../guide.md)). The detection and audit phases below are complete without them.

Bring any project to maximum-depth 1Password integration in two layers:

- **Backend (secret resolution)** — let the team store one Service Account token and reference everything else as `op://vault/item/field`. No more secrets in `.env` files, CI variables, or code.
- **Frontend (site compatibility)** — make every auth form play perfectly with 1Password autofill, strong-password generation, passkeys, and the W3C `/.well-known/change-password` URL.

## Operating principles

1. **Always refresh docs first.** 1Password ships SDK/CLI changes monthly. Never trust training data — pull the current developer portal before recommending anything.
2. **Detect before deciding.** Run the detection phase even if the user says "we don't have it yet" — the user's belief is often wrong (a dependency, a CI step, or a colleague may have wired part of it).
3. **Greenfield only when nothing exists.** If even partial integration exists, audit + improve rather than rebuild — much cheaper for the user.
4. **Stack matches matter more than depth.** A perfect Go install is useless to a Laravel team. Pick the stack first, then the depth.
5. **Defense in depth on the frontend.** Adding `autocomplete="current-password"` is free; not adding it silently breaks autofill. Always ship the full set.
6. **Never write a Service Account token to disk.** Tokens live in env vars passed to `op` (or the SDK). Tokens in `.env` files committed by accident are a recurring incident pattern.

## Phase 1 — Refresh 1Password developer docs (mandatory first step)

Pull the current state of the developer platform via web search/fetch. Always include the current year in the queries.

Required reads — capture these into working memory before doing anything else:

| Surface | Why |
|---|---|
| `https://developer.1password.com/` | Top-level entry; what's new highlighted here. |
| `https://developer.1password.com/docs/sdks/` | SDK matrix (Go / JS / Python). PHP is not on this list — fall back to CLI. |
| `https://developer.1password.com/docs/service-accounts/` | Token format, vault scope, rate limits, rotation rules. |
| `https://developer.1password.com/docs/cli/` | `op` v2 CLI commands (`read`, `inject`, `run`, `vault list`, `item get`). |
| `https://developer.1password.com/docs/sdks/load-secrets` | `op://vault/item/field` reference grammar. |
| `https://developer.1password.com/docs/connect/` | Connect Server self-hosted REST option. |
| `https://developer.1password.com/docs/web/compatible-website-design/` | Authoritative site-compat reference. |
| `https://developer.1password.com/docs/security/` | What to never log, what to never store. |
| `https://releases.1password.com/developers/sdks/` | Recent SDK changes (often answers "is X supported yet?"). |

Also pull these standards:

- W3C `/.well-known/change-password`: <https://w3c.github.io/webappsec-change-password-url/>
- WHATWG autofill tokens (HTML autocomplete spec): <https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill>
- WebAuthn Level 3 (relevant for passkeys-as-2FA): <https://www.w3.org/TR/webauthn-3/>

Document any **deltas vs. training data** the user should know about.

## Phase 2 — Detect what's already wired up

Run these scans against the current project. Treat any positive hit as "integration exists, audit don't replace".

### 2.1 Stack detection

Run in this order, stop at the first match:

| Marker file present | Stack |
|---|---|
| `composer.json` containing `laravel/framework` | Laravel / PHP |
| `composer.json` (other PHP) | PHP generic (CLI shell-out) |
| `package.json` containing `next` | Next.js |
| `package.json` containing `nuxt` or `vite` | Node SPA |
| `package.json` (other Node) | Node generic |
| `pyproject.toml` or `requirements.txt` | Python |
| `Gemfile` | Ruby / Rails |
| `go.mod` | Go |
| any `Dockerfile*` only | Container generic (CLI only) |

If multiple match (monorepo), pick the closest to the user's current working directory.

### 2.2 Existing-integration markers

Grep the project (skip `vendor/`, `node_modules/`, `.git/`, `dist/`, `build/`) for any of:

```
1password|onepassword|1Password|OnePassword
op://
OP_SERVICE_ACCOUNT_TOKEN
OP_CONNECT_HOST|OP_CONNECT_TOKEN
@1password/sdk|onepassword-sdk|github.com/1Password/onepassword-sdk-go
.well-known/change-password
```

For each hit, classify:

- **Backend wiring** — driver class, resolver service, env injection.
- **Frontend wiring** — autocomplete attrs, well-known routes, passkey form.
- **CI/CD wiring** — `op run --env-file` or similar.
- **Doc-only mention** — README / docs but no code.

### 2.3 Auth-form audit

Find all login / register / reset-password / forgot-password / password-update / 2FA-challenge forms — look in:

- Laravel: `resources/views/auth/*`, Livewire profile components
- Next.js: `app/login/**`, `app/register/**`, `app/(auth)/**`, `pages/login.*`, etc.
- Rails: `app/views/sessions/`, `app/views/registrations/`, `app/views/passwords/`, Devise overrides.
- Generic: any file matching `*login*`, `*register*`, `*password*` with `<input type="password">`.

For each, check:

| Field | Required attribute | Common mistakes |
|---|---|---|
| Email/username on **login** | `autocomplete="username"` | `autocomplete="email"` works but is weaker; missing entirely is worst. |
| Password on **login** | `autocomplete="current-password"` | Missing → autofill unreliable. |
| Email/username on **register** | `autocomplete="username"` | Should NOT be `email` here — the field is the future login id. |
| Name on **register** | `autocomplete="name"` | Often missing. |
| Both passwords on **register** | `autocomplete="new-password"` | Without it, 1Password won't offer to generate a strong password. |
| Both passwords on **password-update** | `autocomplete="current-password"` (old) and `autocomplete="new-password"` (new ×2) | Plus a hidden `<input autocomplete="username" hidden>` companion so password managers know which credential to update. |
| 2FA TOTP code | `autocomplete="one-time-code"` + `inputmode="numeric"` | Missing breaks iOS SMS autofill. |
| 2FA recovery code | **`autocomplete="off"`** | Recovery codes are NOT one-time codes per spec — wrong hint causes SMS autofill on the wrong field. |
| Third-party API key inputs (BYOK forms) | `autocomplete="off"` + `data-1p-ignore="true"` | Without these, 1P tries to save the form itself as a 1P entry. |

### 2.4 Site-compat surface

Check whether these endpoints exist and respond correctly:

| Endpoint | Spec | Required behavior |
|---|---|---|
| `GET /.well-known/change-password` | W3C | 2xx or 3xx; redirect target should be the change-password UI. |
| `GET /.well-known/passkey-endpoints` (optional) | W3C draft | JSON document advertising passkey origins. |
| Password fields on signup | WHATWG | Should declare `passwordrules` attribute matching server policy. |

## Phase 3 — Decide: audit or install

After Phase 2, classify the project:

| State | Action |
|---|---|
| **Greenfield** — no markers found anywhere. | Full install, stack-specific (§3a). |
| **Partial backend** — driver/resolver exists but is broken or shallow. | Audit + improve backend (§3b). |
| **Partial frontend** — some autocomplete attrs but not all, or missing well-known. | Frontend hygiene patch (§3c). |
| **Mature** — both backend and frontend are correct. | Report A-grade and exit. Suggest only nice-to-haves (passkey login, PRF E2E). |

### 3a — Greenfield install

For the detected stack, implement:

1. **Credential storage** — type/enum addition for "1Password Service Account", encrypted at rest, validated against `^ops_.{28,}$`.
2. **Resolver** — a service shelling out to `op read --no-newline` (or using the SDK) with the token in env (never argv).
3. **CLI install** — Dockerfile or CI step that pins a known `op` version with checksum.
4. **Env-injection point** — wherever the project launches subprocesses or builds env for workers, swap raw env vars for `op://` references resolved at launch.
5. **Frontend hygiene** — apply §3c patches.
6. **Tests** — unit test fakes `op` CLI to assert: token in env not argv, malformed reference rejected, exit-code-1 surfaces stderr.

For each step, write the change or open a sub-task. Run the test suite afterwards. Never declare done without all green tests + a working `op vault list` smoke test in the target environment.

### 3b — Audit + improve existing backend

For each existing surface, check the **safety invariants**:

1. Token never in argv (use `OP_SERVICE_ACCOUNT_TOKEN` env). `ps`-leak is real.
2. Token validation: starts with `ops_` AND length >= 32.
3. Reference grammar enforcement: 3 segments, no `..`, no shell metas (`$`, `` ` ``, `;`, `&`, `|`, `<`, `>`, `()`, whitespace).
4. Resolver returns trimmed output (`rtrim($val, "\r\n")`) — `--no-newline` flag is best-effort across `op` versions.
5. `op` CLI pinned to a specific version (with SHA256 ideally) in the runtime image.
6. Service Account scope is documented for users — encourage narrow scopes.
7. No `op` calls from web request handlers — only from queue workers / async contexts (web has tighter timeouts and loses output buffering).
8. Logs never include the resolved value.
9. `op://` reference tokens themselves CAN be logged (they're not secrets) — useful for audit trails.
10. Connect Server, if used, runs as a separate service with its own access token AND `1password-credentials.json` mounted read-only.

For each violation, propose a minimal-diff fix and ship it. Do not rewrite the whole driver if only one invariant is broken.

### 3c — Frontend hygiene patch

Always-safe patches (apply unconditionally — none of them break working autofill):

1. Login form → add `autocomplete="username"` + `autocomplete="current-password"`.
2. Register form → add `autocomplete="name"`, `autocomplete="username"`, `autocomplete="new-password"` ×2.
3. Reset-password form → ensure `autocomplete="username"` + `autocomplete="new-password"` ×2.
4. Password-update form → add hidden `<input type="text" name="username" autocomplete="username" value="{{ user.email }}" hidden aria-hidden="true" tabindex="-1">` companion.
5. 2FA TOTP code → `autocomplete="one-time-code"` + `inputmode="numeric"`.
6. 2FA recovery code → `autocomplete="off"` (NOT `one-time-code`).
7. New `/.well-known/change-password` route → 302 to the actual password-change UI, exempt from auth middleware (so password managers can probe without logging in).
8. `passwordrules` attribute on signup password fields (match server policy).
9. Any third-party-secret input field → `autocomplete="off" data-1p-ignore="true"`.

Always add a regression test (one per stack) asserting `autocomplete="..."` strings appear in rendered output.

## Phase 4 — Report & wrap up

Produce a single-paragraph summary plus a checklist of what was found/changed per layer (backend / frontend / tests / outstanding manual steps).

Always finish with one of:

- "Run the project's test suite filtered to the 1Password tests to verify."
- "Run `op vault list` inside the prod container with a real token to smoke-test."

## Constraints

- **Never paste a real Service Account token into chat or logs.** Even if the user offers — refuse.
- **Never check a token into git.** Even on branches the user "promises to delete".
- **Never weaken autocomplete attributes.** `autocomplete="off"` on password fields is almost always wrong (1Password ignores it anyway, but breaks browser autofill).
- **Never enable Service Account access to Personal/Private vaults.** They're not accessible by spec — recommending it leads to confused users.
- **No PHP SDK exists.** If the project is PHP and asks for an SDK, fall back to CLI shell-out — do not invent an SDK.
- **OAuth Authorization Code does not exist for vault access.** Don't propose a "Connect with 1Password" button. Service Account tokens are pasted, not OAuth-redirected.
