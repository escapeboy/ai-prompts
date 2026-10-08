import type { Register } from 'claude-code'

// CLAUDE.md: `op read` puts the plaintext secret into the transcript. This mod
// swaps secrets in tool results for ‹secret:N› before the model or the
// transcript sees them, and puts the real value back into the arguments of the
// next tool call that uses the placeholder. The table lives only in this
// module's memory: a new session (or a reload) starts empty, by design.

const PATTERNS: RegExp[] = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  /\bops_[A-Za-z0-9_-]{20,}/g, // 1Password service account
  /\bsk-ant-[A-Za-z0-9_-]{20,}/g,
  /\bsk-[A-Za-z0-9]{20,}/g,
  /\bgh[pousr]_[A-Za-z0-9]{30,}/g,
  /\bgithub_pat_[A-Za-z0-9_]{40,}/g,
  /\bglpat-[A-Za-z0-9_-]{20,}/g,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\bsntry[su]_[A-Za-z0-9+/=_-]{20,}/g,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, // JWT
]
// Value is the last capture group.
const KEYED: RegExp[] = [
  /(Bearer\s+)([A-Za-z0-9._~+/=-]{20,})/g,
  /^(\s*(?:export\s+)?[A-Z0-9_]*(?:TOKEN|SECRET|API_KEY|APIKEY|PASSWORD|PASSWD|PASS|PWD|PRIVATE_KEY)[A-Z0-9_]*\s*=\s*['"]?)([^\s'"#]{8,})/gm,
  /("(?:api_?key|token|secret|password|passwd|access_token|refresh_token|client_secret)"\s*:\s*")([^"]{8,})/gi,
  // Prose in notes and memories: "password `x`", "парола: x". The value needs a
  // digit or a symbol, so "password field" is left alone.
  /((?:password|passwd|парола)\W{0,4}[`'"]?)((?=[^\s`'"]*[\d!@#$%^&*])[^\s`'"]{6,})/gi,
]

const BLOCKED_READ = [/\/\.config\/op\/sa-token$/, /\.pem$/, /\/\.ssh\/id_[A-Za-z0-9_-]+$/, /\/\.claude\/alert\.env$/]
const SKIP_TOOLS = new Set(['Agent', 'Task', 'Workflow'])

export class Vault {
  private byValue = new Map<string, string>()
  private byLabel = new Map<string, string>()

  label(value: string): string {
    let l = this.byValue.get(value)
    if (!l) {
      l = `‹secret:${this.byValue.size + 1}›`
      this.byValue.set(value, l)
      this.byLabel.set(l, value)
    }
    return l
  }

  get size() {
    return this.byValue.size
  }

  redact(text: string): string {
    let out = text
    for (const re of PATTERNS) out = out.replace(re, m => this.label(m))
    for (const re of KEYED) out = out.replace(re, (_m, pre: string, v: string) => (v.startsWith('‹secret:') ? pre + v : pre + this.label(v)))
    return out
  }

  restore(text: string): string {
    return text.replace(/‹secret:\d+›/g, l => this.byLabel.get(l) ?? l)
  }
}

// Applies f to every string inside a JSON-like value; returns the same object
// when nothing changed, so callers can tell.
export const mapStrings = (v: unknown, f: (s: string) => string): unknown => {
  if (typeof v === 'string') return f(v)
  if (Array.isArray(v)) {
    const out = v.map(x => mapStrings(x, f))
    return out.some((x, i) => x !== v[i]) ? out : v
  }
  if (v && typeof v === 'object') {
    let changed = false
    const out: Record<string, unknown> = {}
    for (const [k, x] of Object.entries(v)) {
      out[k] = mapStrings(x, f)
      if (out[k] !== x) changed = true
    }
    return changed ? out : v
  }
  return v
}

export const isBlockedPath = (path: string) => BLOCKED_READ.some(re => re.test(path))

export const register: Register = on => {
  const vault = new Vault()

  on('tool.call', async ($, e, next) => {
    const tool = String(e.tool)
    if (SKIP_TOOLS.has(tool)) return next(e)

    if (tool === 'Read' && 'file_path' in e && typeof e.file_path === 'string' && isBlockedPath(e.file_path)) {
      return { deny: `secret-redactor: ${e.file_path} holds a credential; reading it is blocked. Use \`op run -- <cmd>\` or the tool that needs it.` }
    }

    // Put real values back into the arguments Claude wrote with placeholders.
    const restored = mapStrings(e, s => (s.includes('‹secret:') ? vault.restore(s) : s)) as typeof e
    const ran = await next(restored)
    if (ran.deny !== undefined) return ran

    const before = vault.size
    let result = mapStrings(ran.result, s => vault.redact(s))
    // `op read` prints the bare secret, which no pattern can recognise.
    if (tool === 'Bash' && 'command' in e && /\bop\s+read\b/.test(String(e.command)) && result && typeof result === 'object') {
      const r = result as { stdout?: string }
      const line = r.stdout?.trim()
      if (line && !line.includes('\n') && line.length >= 8 && !line.startsWith('‹secret:')) {
        result = { ...r, stdout: r.stdout!.replace(line, vault.label(line)) }
      }
    }
    if (result === ran.result) return ran

    $.ui.status(`hidden: ${vault.size}`)
    if (vault.size > before) $.ui.toast(`secret-redactor: hid ${vault.size - before} secret(s) from ${tool} output`)
    // Without ref/text, core maps the redacted record for the model and the transcript.
    return { result, context: ran.context } as typeof ran
    // Before the tool ran, let it run; after, withhold the output rather than leak it.
  }).catch(($, e, next) => (next.called ? { deny: 'secret-redactor: could not scan this output for secrets, so it is withheld. Re-run it.' } : next(e)))
}
