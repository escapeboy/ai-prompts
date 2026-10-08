import type { EngineInterface, Register } from 'claude-code'

// Per-project spend, for a monthly "did the improvements pay off" review. Each
// machine keeps its own ledger and exports ~/.claude/spend-ledger/<YYYY-MM>.json;
// the machine with the Svod MCP connected pulls the others' files over ssh
// (option remote_hosts) and writes one note per month.

const cfg = { remotes: [] as string[], server: 'svod', vault: 'personal', dir: 'engineering/claude-spend' }
const SYNC_EVERY_MS = 6 * 60 * 60_000

export type Row = { turns: number; input: number; output: number; cacheRead: number; cacheWrite: number; usd: number }
export type Agg = Record<string, Row> // key: `${day}|${project}|${model}`
export type Export = { host: string; month: string; updated: string; agg: Agg }

const empty = (): Row => ({ turns: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, usd: 0 })

export const add = (a: Row, b: Row): Row => ({
  turns: a.turns + b.turns, input: a.input + b.input, output: a.output + b.output,
  cacheRead: a.cacheRead + b.cacheRead, cacheWrite: a.cacheWrite + b.cacheWrite, usd: a.usd + b.usd,
})

export const merge = (aggs: Agg[]): Agg => {
  const out: Agg = {}
  for (const agg of aggs) for (const [k, r] of Object.entries(agg)) out[k] = add(out[k] ?? empty(), r)
  return out
}

// Sums rows by one key part: 0 = day, 1 = project, 2 = model.
export const rollup = (agg: Agg, part: 0 | 1 | 2, since = ''): [string, Row][] => {
  const out = new Map<string, Row>()
  for (const [k, r] of Object.entries(agg)) {
    const parts = k.split('|')
    if ((parts[0] ?? '') < since) continue
    const key = parts[part] ?? '?'
    out.set(key, add(out.get(key) ?? empty(), r))
  }
  return [...out].sort((a, b) => b[1].usd - a[1].usd)
}

const k = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1e3)}K`)

export const table = (rows: [string, Row][], label: string): string => {
  const total = rows.reduce((t, [, r]) => add(t, r), empty())
  const lines = [`| ${label} | $ | ходове | in | out | cache read | cache write |`, '|---|---:|---:|---:|---:|---:|---:|']
  for (const [name, r] of rows) lines.push(`| ${name} | ${r.usd.toFixed(2)} | ${r.turns} | ${k(r.input)} | ${k(r.output)} | ${k(r.cacheRead)} | ${k(r.cacheWrite)} |`)
  lines.push(`| **общо** | **${total.usd.toFixed(2)}** | ${total.turns} | ${k(total.input)} | ${k(total.output)} | ${k(total.cacheRead)} | ${k(total.cacheWrite)} |`)
  return lines.join('\n')
}

export const note = (month: string, exports: Export[]): string => {
  const out = [
    '---', 'type: Note', `title: Claude разход ${month}`, 'tags: [claude, metrics]', '---', '',
    `# Claude разход ${month}`, '',
    '_Пише се от мода spend-ledger. Цените са от /cost на Claude Code; подагентите са в хода, който ги е пуснал._', '',
  ]
  for (const e of exports) {
    out.push(`## ${e.host}`, '', `_Обновено: ${e.updated}_`, '', table(rollup(e.agg, 1), 'проект'), '', table(rollup(e.agg, 2), 'модел'), '')
  }
  return out.join('\n')
}

const monthOf = (ms: number) => new Date(ms).toISOString().slice(0, 7)
const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10)

async function localExport($: EngineInterface, host: string, month: string): Promise<Export> {
  const keys = (await $.store.keys()).filter(key => key.startsWith(`m:${month}:`))
  const aggs: Agg[] = []
  for (const key of keys) aggs.push(((await $.store.get(key)) as Agg | undefined) ?? {})
  return { host, month, updated: new Date(await $.clock.now()).toISOString().slice(0, 16).replace('T', ' '), agg: merge(aggs) }
}

async function svodCall($: EngineInterface, tool: string, args: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
  const r = await $.mcp.call(cfg.server, tool, args)
  const block = r.content.find(c => c.type === 'text') as { text?: string } | undefined
  return block?.text ? (JSON.parse(block.text) as Record<string, unknown>) : undefined
}

async function syncSvod($: EngineInterface, host: string, month: string): Promise<string> {
  const exports = [await localExport($, host, month)]
  for (const remote of cfg.remotes) {
    const ran = await $.process.run(['ssh', '-o', 'ConnectTimeout=8', '-o', 'BatchMode=yes', remote, `cat ~/.claude/spend-ledger/${month}.json`], { timeoutMs: 20_000 })
    if (ran.exitCode !== 0) continue
    try {
      const e = JSON.parse(ran.stdout) as Export
      if (e.host !== host) exports.push(e)
    } catch { /* a half-written file: next sync */ }
  }
  const path = `${cfg.dir}/${month}.md`
  const current = await svodCall($, 'read', { path, vault: cfg.vault })
  const expectedRevision = current?.status === 'ok' ? (current.revision as string) : undefined
  const written = await svodCall($, 'write', { path, vault: cfg.vault, content: note(month, exports), ...(expectedRevision ? { expectedRevision } : {}) })
  return written?.status === 'ok' ? `Svod ${cfg.vault}/${path}: ${exports.map(e => e.host).join(', ')}` : `Svod write: ${JSON.stringify(written)?.slice(0, 200)}`
}

export const register: Register = (on, options) => {
  const remotes = options.remote_hosts
  cfg.remotes = Array.isArray(remotes) ? remotes.map(String).filter(Boolean) : typeof remotes === 'string' && remotes ? [remotes] : []
  cfg.server = String(options.svod_server ?? cfg.server)
  cfg.vault = String(options.svod_vault ?? cfg.vault)
  cfg.dir = String(options.note_dir ?? cfg.dir)
  let host = 'unknown'
  let sessionKey = ''
  let lastUsd = 0
  let hasSvod = false

  on('session.start', async ($, e, next) => {
    host = (await $.process.run(['hostname', '-s'], { timeoutMs: 5000 })).stdout.trim() || 'unknown'
    const usage = await $.session.usage()
    sessionKey = String(usage.startedAt)
    lastUsd = usage.cost?.usd ?? 0
    await $.command.register({ name: 'spend', description: 'Claude spend on this machine by project and model', argumentHint: '[day|week|month|sync]', immediate: true })
    try {
      hasSvod = (await svodCall($, 'read', { path: 'Home', vault: cfg.vault })) !== undefined
    } catch {
      hasSvod = false
    }
    if (hasSvod) {
      $.clock.every(SYNC_EVERY_MS, async () => {
        await syncSvod($, host, monthOf(await $.clock.now()))
      })
    }
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId !== undefined) return result
    const now = await $.clock.now()
    const usd = (await $.session.usage()).cost?.usd ?? lastUsd
    const u = e.usage
    const row: Row = {
      turns: 1,
      input: u?.input_tokens ?? 0,
      output: u?.output_tokens ?? 0,
      cacheRead: u?.cache_read_input_tokens ?? 0,
      cacheWrite: u?.cache_creation_input_tokens ?? 0,
      usd: Math.max(0, usd - lastUsd),
    }
    lastUsd = usd
    const home = (await $.env.get('HOME')) ?? ''
    const project = (await $.session.cwd()).replace(home, '~')
    const month = monthOf(now)
    const key = `m:${month}:${sessionKey}`
    const agg = ((await $.store.get(key)) as Agg | undefined) ?? {}
    const rk = `${dayOf(now)}|${project}|${u?.model ?? 'unknown'}`
    agg[rk] = add(agg[rk] ?? empty(), row)
    await $.store.set(key, agg)
    if (home) await $.fs.write(`${home}/.claude/spend-ledger/${month}.json`, JSON.stringify(await localExport($, host, month)))
    return result
  }).catch(($, e, next) => next(e))

  on('session.end', async ($, e, next) => {
    if (hasSvod) await syncSvod($, host, monthOf(await $.clock.now())).catch(() => undefined)
    return next(e)
  })

  on('command.run', { command: 'spend' }, async ($, e) => {
    const arg = e.args.trim() || 'week'
    const now = await $.clock.now()
    if (arg === 'sync') {
      if (!hasSvod) return { text: 'No Svod MCP on this machine; the laptop pulls this ledger on its own sync.' }
      return { text: await syncSvod($, host, monthOf(now)) }
    }
    const days = arg === 'day' ? 1 : arg === 'month' ? 31 : 7
    const since = dayOf(now - (days - 1) * 86_400_000)
    const months = [...new Set([monthOf(now - (days - 1) * 86_400_000), monthOf(now)])]
    const agg = merge(await Promise.all(months.map(async m => (await localExport($, host, m)).agg)))
    if (Object.keys(agg).length === 0) return { text: 'Nothing recorded yet.' }
    return { text: `${host}, since ${since}\n\n${table(rollup(agg, 1, since), 'проект')}\n\n${table(rollup(agg, 2, since), 'модел')}` }
  })
}
