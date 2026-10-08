import type { EngineInterface, Register } from 'claude-code'

// CLAUDE.md "Deploying to Production": after a deploy, run the 5 checks of the
// post-deploy checklist (homepage, endpoints, app log, nginx 500s, OPcache)
// before calling it done. This runs them by itself after
// a command the project's .claude/deploy-verify.json calls a deploy, and hands
// Claude the result with the command's output.

const CONFIG = '.claude/deploy-verify.json'
// Without a config, these only earn a reminder.
const LIKELY_DEPLOY = /\b(envoy\s+run\s+deploy|dep\s+deploy|deploy\.sh|git\s+push\b[^|;&]*\b(main|master|production|prod)\b|gh\s+workflow\s+run\s+\S*deploy)/

export type Config = {
  deployCommands: string[]
  homepage?: string
  endpoints?: string[]
  ssh?: string
  laravelLog?: string
  nginxLog?: string
  opcacheClear?: string
}

export const TEMPLATE: Config = {
  deployCommands: ['envoy run deploy', 'git push \\S+ main'],
  homepage: 'https://example.com',
  endpoints: ['https://example.com/api/health'],
  ssh: 'my-server',
  laravelLog: 'docker exec <app-container> tail -n 200 storage/logs/laravel.log',
  nginxLog: 'sudo -n tail -n 300 /var/log/nginx/access.log',
  opcacheClear: 'docker exec <app-container> php artisan opcache:clear',
}

export const errorLines = (log: string) => log.split('\n').filter(l => /\.(ERROR|CRITICAL|ALERT|EMERGENCY):/.test(l))
export const count500 = (log: string) => log.split('\n').filter(l => /"\s500\s/.test(l)).length

type Found = { path: string; raw: string; config: Config } | undefined
// The config runs shell commands, and a cloned repo can ship one. It runs only
// after the user approved this exact content with /deploy-verify trust.
const TRUST_KEY = 'trusted'

export async function isTrusted($: EngineInterface, f: { path: string; raw: string }) {
  const t = ((await $.store.get(TRUST_KEY)) as Record<string, string> | undefined) ?? {}
  return t[f.path] === f.raw
}

async function trust($: EngineInterface, path: string, raw: string) {
  const t = ((await $.store.get(TRUST_KEY)) as Record<string, string> | undefined) ?? {}
  await $.store.set(TRUST_KEY, { ...t, [path]: raw })
}
// Looked up once per working directory; /deploy-verify init clears it.
const found = new Map<string, Found>()

async function findConfig($: EngineInterface): Promise<Found> {
  const cwd = await $.session.cwd()
  if (found.has(cwd)) return found.get(cwd)
  const hit = await searchConfig($, cwd)
  found.set(cwd, hit)
  return hit
}

async function searchConfig($: EngineInterface, cwd: string): Promise<Found> {
  let dir = cwd
  for (let i = 0; i < 8 && dir; i++) {
    const path = `${dir}/${CONFIG}`
    if (await $.fs.exists(path)) {
      const raw = await $.fs.read(path)
      return { path, raw, config: JSON.parse(raw) as Config }
    }
    dir = dir.slice(0, dir.lastIndexOf('/'))
  }
  return undefined
}

async function remote($: EngineInterface, c: Config, cmd: string) {
  if (c.ssh?.startsWith('-')) throw new Error(`ssh host must not start with '-': ${c.ssh}`)
  const argv = c.ssh ? ['ssh', '-o', 'ConnectTimeout=10', '-o', 'BatchMode=yes', c.ssh, cmd] : ['sh', '-c', cmd]
  return $.process.run(argv, { timeoutMs: 60_000 })
}

async function verify($: EngineInterface, c: Config): Promise<string[]> {
  const out: string[] = []
  // 1. Homepage
  if (c.homepage) {
    const r = await $.http.fetch(c.homepage).catch(err => ({ status: 0, ok: false, text: String(err) }))
    out.push(`1. ${r.status === 200 ? '✅' : '❌'} homepage ${c.homepage} → ${r.status}`)
  } else out.push('1. ⚪ homepage: not configured')
  // 2. Key endpoints
  const eps = c.endpoints ?? []
  if (eps.length) {
    const res = await Promise.all(eps.map(async u => [u, (await $.http.fetch(u).catch(() => ({ status: 0 }))).status] as const))
    const bad = res.filter(([, s]) => s === 0 || s >= 400)
    out.push(`2. ${bad.length ? '❌' : '✅'} endpoints: ${res.map(([u, s]) => `${u.replace(/^https?:\/\/[^/]+/, '')} ${s}`).join(', ')}`)
  } else out.push('2. ⚪ endpoints: not configured')
  // 3. Laravel log
  if (c.laravelLog) {
    const r = await remote($, c, c.laravelLog)
    const errs = errorLines(r.stdout)
    out.push(r.exitCode !== 0 ? `3. ❌ laravel log unreadable: ${r.stderr.trim().slice(0, 120)}` : `3. ${errs.length ? '⚠️' : '✅'} laravel log: ${errs.length} error lines in the tail${errs.length ? `; last: ${errs.at(-1)!.slice(0, 200)}` : ''}`)
  } else out.push('3. ⚪ laravel log: not configured')
  // 4. nginx 500s
  if (c.nginxLog) {
    const r = await remote($, c, c.nginxLog)
    const needsSudo = /sudo/.test(r.stderr) && r.exitCode !== 0
    out.push(r.exitCode !== 0 ? `4. ❌ nginx log unreadable${needsSudo ? ' (needs passwordless sudo, or read it through docker)' : ''}: ${r.stderr.trim().slice(0, 120)}` : `4. ${count500(r.stdout) ? '⚠️' : '✅'} nginx: ${count500(r.stdout)} × 500 in the tail`)
  } else out.push('4. ⚪ nginx: not configured')
  // 5. OPcache
  if (c.opcacheClear) {
    const r = await remote($, c, c.opcacheClear)
    out.push(`5. ${r.exitCode === 0 ? '✅' : '❌'} opcache clear (exit ${r.exitCode})${r.exitCode ? `: ${r.stderr.trim().slice(0, 120)}` : ''}`)
  } else out.push('5. ⚪ opcache: not configured')
  return out
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'deploy-verify', description: 'Run the 5 post-deploy checks from .claude/deploy-verify.json', argumentHint: '[init|trust]' })
    return next(e)
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny !== undefined || ran.isError === true) return ran
    const cfg = await findConfig($)
    const isDeploy = cfg ? cfg.config.deployCommands.some(p => new RegExp(p).test(e.command)) : LIKELY_DEPLOY.test(e.command)
    if (!isDeploy) return ran
    if (!cfg) {
      return { ...ran, context: [...(ran.context ?? []), `deploy-verify: this looks like a deploy, but there is no ${CONFIG} here. Run your post-deploy checks now, or /deploy-verify init to set the project up.`] }
    }
    if (!(await isTrusted($, cfg))) {
      return { ...ran, context: [...(ran.context ?? []), `deploy-verify: ${cfg.path} is new or changed since the user last approved it, so its checks did not run. Ask the user to read it and run /deploy-verify trust; meanwhile run the post-deploy checks yourself.`] }
    }
    const lines = await verify($, cfg.config)
    for (const l of lines) $.ui.log(l)
    return { ...ran, context: [...(ran.context ?? []), `deploy-verify (${cfg.path}), checks run after this deploy:\n${lines.join('\n')}\nDo not report the deploy as done while any line is ❌ or ⚠️ unexplained.`] }
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'deploy-verify' }, async ($, e) => {
    if (e.args.trim() === 'init') {
      const path = `${await $.session.cwd()}/${CONFIG}`
      if (await $.fs.exists(path)) return { text: `${path} already exists.` }
      const raw = JSON.stringify(TEMPLATE, null, 2) + '\n'
      await $.fs.write(path, raw)
      found.clear()
      return { text: `Wrote ${path}. Fill in the URLs, the ssh host and the container, then /deploy-verify to test it.` }
    }
    found.clear()
    const cfg = await findConfig($)
    if (!cfg) return { text: `No ${CONFIG} in this project. /deploy-verify init writes a template.` }
    if (e.args.trim() === 'trust') {
      await trust($, cfg.path, cfg.raw)
      return { text: `Trusted ${cfg.path} as it is now. Any later change needs /deploy-verify trust again.\n\n${cfg.raw}` }
    }
    if (!(await isTrusted($, cfg))) return { text: `${cfg.path} is new or changed. Read it, then /deploy-verify trust:\n\n${cfg.raw}` }
    return { text: (await verify($, cfg.config)).join('\n') }
  })
}
