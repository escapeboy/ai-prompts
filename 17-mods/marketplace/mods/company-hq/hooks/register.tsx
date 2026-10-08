import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { AgentRun, Budget, Company, Dashboard, Decision, Hire, Question, Specialist } from '../types'

// Back office of the /company skill (~/.claude/skills/company). The skill
// decides; this mod keeps the books:
// - every /company run is its own company with its own id, org, cap and spend;
//   several can be open at once, in one session or in several;
// - each company is a file, ~/.claude/company-hq/companies/<id>/state.json,
//   written only by the session that owns it (the dashboard reads these);
// - hire: registers a specialist as agent type `company-hq:<name>`;
// - every subagent spawn (Workflow agents included) is checked against the
//   active company's cap and refused past it;
// - a pane shows the active company and the other open ones.

const PANE = 'company'
const companies = atom({ plugin: 'company-hq', key: 'companies' } as const, [])
const activeId = atom({ plugin: 'company-hq', key: 'activeId' } as const, null)

const MODELS = new Set(['haiku', 'sonnet', 'opus', 'inherit'])
const DASHBOARDS = new Set(['off', 'local', 'fleetq', 'local+fleetq'])
const NAME = /^[a-z][a-z0-9-]{1,40}$/
const PART = /^([a-z0-9][a-z0-9-]{0,40}):\s/
const MAX_AGENTS = 200

export const inProject = (cwd: string, dir: string) => cwd === dir || cwd.startsWith(dir.endsWith('/') ? dir : dir + '/')
export const overCap = (b: Budget, liveUsd: number) => b.capUsd > 0 && b.spentUsd + liveUsd >= b.capUsd
export const nearCap = (b: Budget, liveUsd: number) => b.capUsd > 0 && b.spentUsd + liveUsd >= b.capUsd * 0.8
// Agents are tied to a part of the plan by a `<part>: ` prefix in their
// description (a Workflow agent's label, an Agent call's description).
export const partOf = (description: string) => PART.exec(description)?.[1] ?? null
// 2026-10-08T14:30:12.345Z -> <slug>-20261008-143012
export const companyId = (slug: string, at: Date) =>
  `${slug}-${at.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-')}`

export const validateHire = (a: Record<string, unknown>): string | undefined => {
  if (typeof a.name !== 'string' || !NAME.test(a.name)) return 'name must be kebab-case, 2-41 chars'
  if (typeof a.prompt !== 'string' || a.prompt.length < 40) return 'prompt (the system prompt) is required, at least 40 chars'
  if (typeof a.description !== 'string' || !a.description) return 'description (when to delegate to it) is required'
  if (typeof a.model !== 'string' || !MODELS.has(a.model)) return 'model must be haiku, sonnet, opus or inherit'
  return undefined
}

export const addMember = (c: Company, s: Specialist): Company => {
  const m = { name: s.name, agent: s.agent, model: s.model, description: s.description }
  const teams = c.teams.map(t => ({ ...t, members: t.members.filter(x => x.name !== s.name) }))
  const t = teams.find(x => x.name === s.team)
  return {
    ...c,
    teams: (t ? teams.map(x => (x === t ? { ...x, members: [...x.members, m] } : x)) : [...teams, { name: s.team, members: [m] }])
      .filter(x => x.members.length > 0),
  }
}

const TOOLS = [
  {
    name: 'open_project',
    description: 'company-hq: open a new /company company (every call is a separate company with its own id, org, cap and spend), or resume one by id. Sets the budget cap every subagent spawn is checked against and opens the status pane.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'kebab-case short name' },
        title: { type: 'string' },
        capUsd: { type: 'number', description: 'budget cap in USD for all agents of this company; 0 = no cap' },
        dir: { type: 'string', description: 'working directory of the project' },
        task: { type: 'string', description: 'the task as the user gave it' },
        kind: { type: 'string', enum: ['code', 'new-project', 'audit', 'ops'] },
        dashboard: { type: 'string', enum: ['off', 'local', 'fleetq', 'local+fleetq'], description: 'omit to use ~/.claude/company-hq/config.json, else off' },
        resume: { type: 'string', description: 'id of an open company to take over in this session; the other fields are ignored' },
      },
      required: ['slug', 'title', 'capUsd'],
    },
  },
  {
    name: 'hire',
    description: 'company-hq: hire a specialist for the active company: registers agent type company-hq:<name> with its own system prompt and model. Usable by Agent/Workflow agentType from the NEXT turn.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        team: { type: 'string' },
        description: { type: 'string', description: 'when to delegate to it' },
        prompt: { type: 'string', description: 'its system prompt: role, expertise, owned files, rules, deliverable' },
        model: { type: 'string', enum: ['haiku', 'sonnet', 'opus', 'inherit'] },
        tools: { type: 'array', items: { type: 'string' } },
        skills: { type: 'array', items: { type: 'string' } },
      },
      required: ['name', 'team', 'description', 'prompt', 'model'],
    },
  },
  {
    name: 'set_phase',
    description: 'company-hq: record the current /company phase and a one-line note for the active company (or the one named by id).',
    inputSchema: { type: 'object', properties: { phase: { type: 'string' }, note: { type: 'string' }, company: { type: 'string', description: 'company id; default the active one' } }, required: ['phase'] },
  },
  {
    name: 'ask_user',
    description: 'company-hq: record a question only the user can decide (decision-classify: User; or scope, budget, data, security, deploy, deletion). Returns its id. Then notify the user (PushNotification) and keep working on parts that do not depend on it; never guess the answer.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        part: { type: 'string', description: 'the part it blocks; omit when it blocks the whole company' },
        options: { type: 'array', items: { type: 'string' } },
        class: { type: 'string', description: 'decision-classify class, default user' },
        company: { type: 'string', description: 'company id; default the active one' },
      },
      required: ['text'],
    },
  },
  {
    name: 'answer_question',
    description: "company-hq: record the user's answer to an open question (asked with ask_user).",
    inputSchema: { type: 'object', properties: { id: { type: 'string' }, answer: { type: 'string' }, company: { type: 'string' } }, required: ['id', 'answer'] },
  },
  {
    name: 'record_decision',
    description: 'company-hq: log a non-critical choice (decision-classify: Mechanical/Taste) made without the user, with the options, the choice, who chose (agent or jev) and the Jev scores when there were any, so the user can review and reverse it.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        options: { type: 'array', items: { type: 'string' } },
        chosen: { type: 'string' },
        by: { type: 'string', enum: ['agent', 'jev'] },
        part: { type: 'string' },
        class: { type: 'string', description: 'mechanical or taste' },
        jev: { type: 'object', properties: { scores: { type: 'array', items: { type: 'number' } }, mode: { type: 'string', enum: ['shadow', 'decide'] } } },
        company: { type: 'string' },
      },
      required: ['text', 'options', 'chosen', 'by'],
    },
  },
  {
    name: 'close_project',
    description: 'company-hq: close the active company (or the one named by id): returns its final spend and roster (with prompts) so the skill can record it and offer to keep specialists. Other open companies are not touched.',
    inputSchema: {
      type: 'object',
      properties: {
        company: { type: 'string', description: 'company id; default the active one' },
        pr: { type: 'string', description: 'PR URL, when there is one' },
        report: { type: 'string', description: 'path of the final report, when there is one' },
      },
    },
  },
] as const

// Module state; a reload starts it over and session.start fills it again.
// baseUsd: session cost at the last flush, the base for "spent since".
const S = { baseUsd: 0, home: '', machine: 'local', sessionId: '' }
const warned = new Set<string>()
const hires = new Map<string, Record<string, Hire>>()

function stateFile(id: string) { return `${S.home}/companies/${id}/state.json` }
function hiresFile(id: string) { return `${S.home}/companies/${id}/private.json` }

async function readJson<T>($: EngineInterface, path: string): Promise<T | undefined> {
  if (!S.home) return undefined
  return $.fs.read(path).then(t => JSON.parse(t as string) as T).catch(() => undefined)
}

async function write($: EngineInterface, c: Company) {
  if (S.home) await $.fs.write(stateFile(c.id), JSON.stringify(c, null, 2)).catch(() => undefined)
}

async function writeHires($: EngineInterface, id: string) {
  if (S.home) await $.fs.write(hiresFile(id), JSON.stringify({ hires: hires.get(id) ?? {} }, null, 2)).catch(() => undefined)
}

// Applies fn to the open company `id`, bumps seq, writes the file.
async function change($: EngineInterface, id: string, fn: (c: Company) => Company): Promise<Company | undefined> {
  const cur = (await read($, companies)).find(c => c.id === id)
  if (!cur) return undefined
  const next = { ...fn(cur), seq: cur.seq + 1, updatedAt: new Date().toISOString() }
  await update($, companies, list => list.map(c => (c.id === id ? next : c)))
  await write($, next)
  if (wantsFleet(next.dashboard)) scheduleFleet($, id)
  return next
}

async function active($: EngineInterface): Promise<Company | undefined> {
  const id = await read($, activeId)
  return id ? (await read($, companies)).find(c => c.id === id) : undefined
}

async function pick($: EngineInterface, id?: string) {
  return id ? (await read($, companies)).find(c => c.id === id) : active($)
}

async function liveUsd($: EngineInterface) {
  return Math.max(0, ((await $.session.usage()).cost?.usd ?? S.baseUsd) - S.baseUsd)
}

// Books the session's cost since the last flush to the active company.
async function flush($: EngineInterface) {
  const now = (await $.session.usage()).cost?.usd ?? S.baseUsd
  const delta = Math.max(0, now - S.baseUsd)
  S.baseUsd = now
  const a = await active($)
  if (a && delta > 0) await change($, a.id, c => ({ ...c, budget: { ...c.budget, spentUsd: c.budget.spentUsd + delta } }))
}

async function registerHire($: EngineInterface, team: string, name: string, model: string, description: string, h: Hire) {
  await $.agent.register({
    name, description: `[company/${team}] ${description}`, prompt: h.prompt, model,
    ...(h.tools?.length ? { tools: h.tools } : {}),
    ...(h.skills?.length ? { skills: h.skills } : {}),
  })
}

// Hired agents come back only inside the company's folder, so a hire never
// follows the user into other repos.
async function restoreHires($: EngineInterface, c: Company, cwd: string) {
  const saved = (await readJson<{ hires: Record<string, Hire> }>($, hiresFile(c.id)))?.hires ?? {}
  hires.set(c.id, saved)
  if (!inProject(cwd, c.dir)) return
  for (const t of c.teams) for (const m of t.members) {
    const h = saved[m.name]
    if (h) await registerHire($, t.name, m.name, m.model, m.description, h).catch(() => undefined)
  }
}

// v0.2 kept one project in $.store; turn it into a company of this session.
async function migrate($: EngineInterface, now: Date): Promise<Company | undefined> {
  const old = (await $.store.get('project')) as { slug: string; title: string; capUsd: number; spentUsd: number; phase: string; note: string; dir: string } | null | undefined
  if (!old) return undefined
  const roster = ((await $.store.get('roster')) as Specialist[] | undefined) ?? []
  const prompts = ((await $.store.get('prompts')) as Record<string, Hire> | undefined) ?? {}
  let c: Company = {
    ...blank(now, old.slug, old.title, old.dir, 'off'),
    phase: old.phase, note: old.note, budget: { capUsd: old.capUsd, spentUsd: old.spentUsd },
  }
  for (const s of roster) c = addMember(c, s)
  hires.set(c.id, prompts)
  await write($, c)
  await writeHires($, c.id)
  for (const k of ['project', 'roster', 'prompts', 'spawns']) await $.store.delete(k).catch(() => undefined)
  return c
}

function blank(now: Date, slug: string, title: string, dir: string, dashboard: Dashboard): Company {
  const at = now.toISOString()
  return {
    schema: 1, id: companyId(slug, now), slug, title, task: '', kind: 'code', machine: S.machine, sessionId: S.sessionId, dir,
    docsDir: `claudedocs/company/${slug}`, dashboard, status: 'open', phase: 'intake', note: '',
    budget: { capUsd: 0, spentUsd: 0 }, teams: [], agents: [], questions: [], decisions: [], result: {}, seq: 0,
    openedAt: at, updatedAt: at, closedAt: null,
  }
}

// ---- FleetQ adapter (dashboard fleetq / local+fleetq). Sends the full
// snapshot plus the plan documents (redacted) to FleetQ; contract in
// server/INGEST-CONTRACT.md. Never blocks a hook: sends
// run on timers, failures retry with backoff, and the snapshot is always whole,
// so only the latest one matters.

// The client redacts what FleetQ would reject (the same list as the server).
const SECRETS: RegExp[] = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  /\bops_[A-Za-z0-9_-]{20,}/g,
  /\bsk-ant-[A-Za-z0-9_-]{20,}/g,
  /\bsk-[A-Za-z0-9]{20,}/g,
  /\bgh[pousr]_[A-Za-z0-9]{30,}/g,
  /\bgithub_pat_[A-Za-z0-9_]{40,}/g,
  /\bglpat-[A-Za-z0-9_-]{20,}/g,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\bsntry[su]_[A-Za-z0-9+/=_-]{20,}/g,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  /Bearer\s+[A-Za-z0-9._~+/=-]{20,}/g,
]
export const redact = (t: string) => SECRETS.reduce((s, re) => s.replace(re, '[REDACTED]'), t)
const DOC = /^docs\/(design|architecture|test-plan)-[a-z0-9][a-z0-9-]*\.md$/
const wantsFleet = (d: Dashboard) => d === 'fleetq' || d === 'local+fleetq'

export async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

// `git worktree list --porcelain` -> roots, the company dir first.
export const parseWorktrees = (out: string, dir: string) => {
  const roots: { path: string; branch: string | null }[] = []
  for (const line of out.split('\n')) {
    if (line.startsWith('worktree ')) roots.push({ path: line.slice(9), branch: null })
    else if (line.startsWith('branch ') && roots.length) roots[roots.length - 1]!.branch = line.slice(7).replace(/^refs\/heads\//, '')
  }
  const i = roots.findIndex(r => r.path === dir)
  const main = i >= 0 ? roots.splice(i, 1)[0]! : { path: dir, branch: null }
  return [main, ...roots]
}

type Doc = { key: string; path: string; branch: string | null; content: string }

async function collectDocs($: EngineInterface, c: Company): Promise<Doc[]> {
  const real = (await $.fs.stat(c.dir, { resolve: true }).catch(() => undefined))?.realPath ?? c.dir
  const wt = await $.process.run(['git', '-C', c.dir, 'worktree', 'list', '--porcelain']).catch(() => undefined)
  const roots = parseWorktrees(wt?.exitCode === 0 ? wt.stdout : '', real)
  const docsDir = c.docsDir.replace(/^\/+|\/+$/g, '')
  const subs = docsDir && docsDir !== 'docs' ? ['docs', docsDir] : ['docs']
  const out: Doc[] = []
  for (const [i, r] of roots.entries()) {
    for (const sub of subs) {
      const names = await $.fs.list(`${r.path}/${sub}`).catch(() => [])
      for (const n of names) {
        const path = `${sub}/${n.name}`
        if (n.kind !== 'file' || !n.name.endsWith('.md') || (sub === 'docs' && !DOC.test(path))) continue
        const text = await $.fs.read(`${r.path}/${path}`).catch(() => undefined)
        if (typeof text === 'string') out.push({ key: `${i}:${path}`, path, branch: r.branch, content: redact(text) })
      }
    }
  }
  return out
}

// company id -> doc key -> sha256 the server is known to have. Absent after a
// (re)load: nothing is known, so the first send carries no content and the
// server's missingDocs says what to send.
const fleetHas = new Map<string, Map<string, string>>()
const fleetTimer = new Map<string, { cancel: () => void }>()
const fleetDelay = new Map<string, number>()
const fleetWarned = new Set<string>()

function scheduleFleet($: EngineInterface, id: string, ms = 2000) {
  fleetTimer.get(id)?.cancel()
  fleetTimer.set(id, $.clock.after(ms, () => { void sendFleet($, id) }))
}

async function outbox($: EngineInterface, id: string, v: Record<string, unknown>) {
  await $.fs.write(`${S.home}/companies/${id}/outbox.json`, JSON.stringify({ ...v, at: new Date().toISOString() })).catch(() => undefined)
}

async function sendFleet($: EngineInterface, id: string) {
  fleetTimer.delete(id)
  const c = (await read($, companies)).find(x => x.id === id) ?? (await readJson<Company>($, stateFile(id)))
  if (!c || !wantsFleet(c.dashboard)) return
  const cfg = (await readJson<{ fleetq?: { url?: string } }>($, `${S.home}/config.json`)) ?? {}
  const url = cfg.fleetq?.url?.replace(/\/+$/, '')
  const token = await $.env.get('COMPANY_HQ_FLEETQ_TOKEN')
  if (!url || !token) {
    if (!fleetWarned.has('config')) {
      fleetWarned.add('config')
      $.ui.toast('company: dashboard fleetq needs fleetq.url in ~/.claude/company-hq/config.json and COMPANY_HQ_FLEETQ_TOKEN')
    }
    return
  }
  const has = fleetHas.get(id)
  const sent: { key: string; path: string; branch: string | null; sha256: string; content?: string }[] = []
  for (const d of await collectDocs($, c)) {
    const sha = await sha256Hex(d.content)
    const withContent = has !== undefined && has.get(d.key) !== sha
    sent.push({ key: d.key, path: d.path, branch: d.branch, sha256: sha, ...(withContent ? { content: d.content } : {}) })
  }
  const r = await $.http.fetch(`${url}/api/company-hq/ingest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ machine: c.machine, snapshot: c, docs: sent }),
  }).catch(() => undefined)
  if (r && (r.status === 401 || r.status === 413 || r.status === 422)) {
    // Retrying does not fix these; the next change tries again.
    if (!fleetWarned.has(`${id}:${r.status}`)) {
      fleetWarned.add(`${id}:${r.status}`)
      $.ui.toast(`company: FleetQ refused ${c.slug} (${r.status}); see ~/.claude/company-hq/companies/${id}/outbox.json`)
    }
    await outbox($, id, { pending: false, refused: r.status, body: r.text.slice(0, 500) })
    return
  }
  if (!r || !r.ok) {
    const delay = Math.min(300_000, (fleetDelay.get(id) ?? 2500) * 2)
    fleetDelay.set(id, delay)
    await outbox($, id, { pending: true, status: r?.status ?? null, retryInMs: delay })
    scheduleFleet($, id, delay)
    return
  }
  fleetDelay.delete(id)
  let body: { missingDocs?: string[]; rejectedDocs?: string[] } = {}
  try { body = JSON.parse(r.text) } catch { /* an empty 200 is fine */ }
  const missing = new Set(body.missingDocs ?? [])
  const rejected = new Set(body.rejectedDocs ?? [])
  // Accepted: sent with content, or sent without and the server had it.
  fleetHas.set(id, new Map(sent.filter(d => !missing.has(d.key) && !rejected.has(d.key)).map(d => [d.key, d.sha256])))
  await outbox($, id, { pending: false, rejectedDocs: [...rejected] })
  if (missing.size) scheduleFleet($, id, 200)
}

// Starts the local dashboard (server/company-dashboard.py) unless one runs,
// detached in its own session so it outlives this one; it stops itself when
// no company is open. Paths reach Python as argv, never inside the code.
const LAUNCH = "import subprocess,sys;f=open(sys.argv[3],'ab');p=subprocess.Popen([sys.executable,sys.argv[1],'--home',sys.argv[2]],stdin=subprocess.DEVNULL,stdout=f,stderr=subprocess.STDOUT,start_new_session=True);print(p.pid)"

async function ensureServer($: EngineInterface): Promise<string | undefined> {
  if (!S.home) return undefined
  const info = `${S.home}/server.json`
  const alive = async () => {
    const i = await readJson<{ app?: string; port?: number; url?: string }>($, info)
    if (!i?.port) return undefined
    const r = await $.http.fetch(`http://127.0.0.1:${i.port}/health`).catch(() => undefined)
    return r?.ok && r.text.includes('company-dashboard') ? i.url ?? `http://127.0.0.1:${i.port}/` : undefined
  }
  const up = await alive()
  if (up) return up
  const r = await $.process.run(
    ['python3', '-c', LAUNCH, `${$.plugin.root}/server/company-dashboard.py`, S.home, `${S.home}/server.log`],
    { timeoutMs: 10000 },
  ).catch(() => undefined)
  if (!r || r.exitCode !== 0) return undefined
  for (let i = 0; i < 30; i++) {
    await $.clock.sleep(100)
    const url = await alive()
    if (url) return url
  }
  return undefined
}

const wantsLocal = (d: Dashboard) => d === 'local' || d === 'local+fleetq'
export const dashLine = (d: Dashboard, url: string | undefined) =>
  !wantsLocal(d) ? '' : url ? ` Dashboard: ${url}` : ' Dashboard could not start (is python3 on PATH? see ~/.claude/company-hq/server.log); the company runs without it.'

export const register: Register = on => {
  warned.clear()
  hires.clear()

  on('session.start', async ($, e, next) => {
    S.baseUsd = (await $.session.usage()).cost?.usd ?? 0
    for (const t of TOOLS) await $.tool.register({ ...t, inputSchema: t.inputSchema as never })
    await $.command.register({ name: 'company-status', description: 'Show the /company pane (active company, other open ones, spend)', immediate: true })

    const h = await $.env.get('HOME')
    S.home = h ? `${h}/.claude/company-hq` : ''
    S.sessionId = await $.session.id().catch(() => '')
    const cfg = (await readJson<{ machine?: string }>($, `${S.home}/config.json`)) ?? {}
    S.machine = cfg.machine
      ?? (await $.process.run(['hostname', '-s']).then(r => r.stdout.trim()).catch(() => ''))
      ?? 'local'
    if (!S.machine) S.machine = 'local'

    // This session's open companies (a resumed session keeps its id).
    const mine: Company[] = []
    const dirs = S.home ? await $.fs.list(`${S.home}/companies`).catch(() => []) : []
    for (const d of dirs) {
      if (d.kind !== 'dir') continue
      const c = await readJson<Company>($, stateFile(d.name))
      if (c && c.schema === 1 && c.status === 'open' && c.sessionId === S.sessionId) mine.push({ ...c, questions: c.questions ?? [], decisions: c.decisions ?? [] })
    }
    const migrated = await migrate($, new Date()).catch(() => undefined)
    if (migrated) mine.push(migrated)
    mine.sort((a, b) => a.openedAt.localeCompare(b.openedAt))
    await update($, companies, () => mine)
    await update($, activeId, () => mine.at(-1)?.id ?? null)
    for (const c of mine) await restoreHires($, c, e.cwd)
    for (const c of mine) if (wantsFleet(c.dashboard)) scheduleFleet($, c.id, 1000)
    if (mine.some(c => wantsLocal(c.dashboard))) {
      void ensureServer($).then(url => { if (url) $.ui.toast(`company dashboard: ${url}`) })
    }
    return next(e)
  })

  on('tool.call', { tool: 'mcp__company-hq__open_project' }, async ($, e) => {
    const a = e as unknown as { slug: string; title: string; capUsd: number; dir?: string; task?: string; kind?: string; dashboard?: string; resume?: string }
    await flush($)
    const cwd = await $.session.cwd()

    if (a.resume) {
      const c = (await read($, companies)).find(x => x.id === a.resume) ?? (await readJson<Company>($, stateFile(a.resume)))
      if (!c || c.status !== 'open') return { result: `resume refused: no open company ${a.resume}.` }
      const taken = { ...c, questions: c.questions ?? [], decisions: c.decisions ?? [], sessionId: S.sessionId, seq: c.seq + 1, updatedAt: new Date().toISOString() }
      await update($, companies, list => [...list.filter(x => x.id !== c.id), taken])
      await update($, activeId, () => taken.id)
      await write($, taken)
      await restoreHires($, taken, cwd)
      if (wantsFleet(taken.dashboard)) scheduleFleet($, taken.id)
      void $.ui.open({ id: PANE, title: `Company: ${taken.title}` })
      const url = wantsLocal(taken.dashboard) ? await ensureServer($) : undefined
      return { result: `Company ${taken.id} resumed; cap $${taken.budget.capUsd || '∞'}; spent so far $${taken.budget.spentUsd.toFixed(2)}.${dashLine(taken.dashboard, url)}` }
    }

    if (typeof a.slug !== 'string' || !NAME.test(a.slug)) return { result: 'open_project refused: slug must be kebab-case, 2-41 chars.' }
    const cfg = (await readJson<{ dashboard?: string }>($, `${S.home}/config.json`)) ?? {}
    const dashboard = (DASHBOARDS.has(a.dashboard ?? '') ? a.dashboard : DASHBOARDS.has(cfg.dashboard ?? '') ? cfg.dashboard : 'off') as Dashboard
    let id = companyId(a.slug, new Date())
    const taken = new Set((await read($, companies)).map(c => c.id))
    for (let n = 2; taken.has(id); n++) id = `${companyId(a.slug, new Date())}-${n}`
    const c: Company = {
      ...blank(new Date(), a.slug, a.title, a.dir ?? cwd, dashboard),
      id, task: a.task ?? '', kind: a.kind ?? 'code', budget: { capUsd: Math.max(0, a.capUsd), spentUsd: 0 },
    }
    hires.set(id, {})
    await update($, companies, list => [...list, c])
    await update($, activeId, () => id)
    await write($, c)
    await writeHires($, id)
    if (wantsFleet(dashboard)) scheduleFleet($, id)
    void $.ui.open({ id: PANE, title: `Company: ${c.title}` })
    const url = wantsLocal(dashboard) ? await ensureServer($) : undefined
    return { result: `Company ${id} open; cap $${c.budget.capUsd || '∞'}; dashboard ${dashboard}.${dashLine(dashboard, url)}` }
  }).catch(() => ({ result: 'company-hq: open_project failed; see claude --debug.' }))

  on('tool.call', { tool: 'mcp__company-hq__hire' }, async ($, e) => {
    const a = e as unknown as { name: string; team: string; description: string; prompt: string; model: string; tools?: string[]; skills?: string[] }
    const bad = validateHire(a as unknown as Record<string, unknown>)
    if (bad) return { result: `hire refused: ${bad}` }
    const c = await active($)
    if (!c) return { result: 'hire refused: open_project first.' }
    const s: Specialist = { name: a.name, agent: `company-hq:${a.name}`, team: a.team, model: a.model, description: a.description }
    const h: Hire = { prompt: a.prompt, tools: a.tools, skills: a.skills }
    await registerHire($, s.team, s.name, s.model, s.description, h)
    hires.set(c.id, { ...(hires.get(c.id) ?? {}), [s.name]: h })
    await writeHires($, c.id)
    await change($, c.id, x => addMember(x, s))
    return { result: `Hired ${s.agent} (${s.model}) for team ${s.team} in ${c.id}. Usable as subagent_type / Workflow agentType from the next turn.` }
  }).catch(() => ({ result: 'company-hq: hire failed; see claude --debug.' }))

  on('tool.call', { tool: 'mcp__company-hq__set_phase' }, async ($, e) => {
    const a = e as unknown as { phase: string; note?: string; company?: string }
    const c = await pick($, a.company)
    if (!c) return { result: 'No open company.' }
    await change($, c.id, x => ({ ...x, phase: a.phase, note: a.note ?? '' }))
    return { result: `Phase of ${c.id}: ${a.phase}` }
  }).catch(() => ({ result: 'company-hq: set_phase failed; see claude --debug.' }))

  on('tool.call', { tool: 'mcp__company-hq__ask_user' }, async ($, e) => {
    const a = e as unknown as { text: string; part?: string; options?: string[]; class?: string; company?: string }
    const c = await pick($, a.company)
    if (!c) return { result: 'No open company.' }
    const q: Question = {
      id: `q${c.questions.length + 1}`, part: a.part ?? null, class: a.class ?? 'user', text: a.text, options: a.options ?? [],
      askedAt: new Date().toISOString(), status: 'open', answer: null, answeredAt: null,
    }
    await change($, c.id, x => ({ ...x, questions: [...x.questions, q] }))
    $.ui.toast(`company: question ${q.id} waits for you${q.part ? ` (blocks ${q.part})` : ''}`)
    return { result: `Question ${q.id} recorded for ${c.id}. Notify the user (PushNotification), then continue with the parts that do not depend on it. Do not guess the answer.` }
  }).catch(() => ({ result: 'company-hq: ask_user failed; see claude --debug.' }))

  on('tool.call', { tool: 'mcp__company-hq__answer_question' }, async ($, e) => {
    const a = e as unknown as { id: string; answer: string; company?: string }
    const c = await pick($, a.company)
    const q = c?.questions.find(x => x.id === a.id)
    if (!c || !q) return { result: `No question ${a.id}.` }
    const at = new Date().toISOString()
    await change($, c.id, x => ({ ...x, questions: x.questions.map(y => (y.id === a.id ? { ...y, status: 'answered' as const, answer: a.answer, answeredAt: at } : y)) }))
    return { result: `Question ${a.id} answered.` }
  }).catch(() => ({ result: 'company-hq: answer_question failed; see claude --debug.' }))

  on('tool.call', { tool: 'mcp__company-hq__record_decision' }, async ($, e) => {
    const a = e as unknown as { text: string; options: string[]; chosen: string; by: string; part?: string; class?: string; jev?: Decision['jev']; company?: string }
    const c = await pick($, a.company)
    if (!c) return { result: 'No open company.' }
    if (a.by !== 'agent' && a.by !== 'jev') return { result: 'record_decision refused: by must be agent or jev.' }
    const d: Decision = {
      id: `d${c.decisions.length + 1}`, part: a.part ?? null, class: a.class ?? 'taste', text: a.text, options: a.options ?? [],
      ...(a.jev ? { jev: a.jev } : {}), chosen: a.chosen, by: a.by, at: new Date().toISOString(),
    }
    await change($, c.id, x => ({ ...x, decisions: [...x.decisions, d] }))
    return { result: `Decision ${d.id} logged.` }
  }).catch(() => ({ result: 'company-hq: record_decision failed; see claude --debug.' }))

  on('tool.call', { tool: 'mcp__company-hq__close_project' }, async ($, e) => {
    const a = e as unknown as { company?: string; pr?: string; report?: string }
    await flush($)
    const c = await pick($, a.company)
    if (!c) return { result: 'No open company.' }
    const closed = await change($, c.id, x => ({
      ...x, status: 'closed', closedAt: new Date().toISOString(),
      result: { ...x.result, ...(a.pr ? { pr: a.pr } : {}), ...(a.report ? { report: a.report } : {}) },
    }))
    const h = hires.get(c.id) ?? {}
    const out = {
      id: c.id, project: c.slug, title: c.title, capUsd: c.budget.capUsd,
      spentUsd: Number((closed ?? c).budget.spentUsd.toFixed(2)),
      roster: c.teams.flatMap(t => t.members.map(m => ({ ...m, team: t.name, ...(h[m.name] ?? {}) }))),
      spawns: c.agents.length,
    }
    hires.delete(c.id)
    warned.delete(c.id)
    await update($, companies, list => list.filter(x => x.id !== c.id))
    if ((await read($, activeId)) === c.id) await update($, activeId, () => (null as string | null))
    const rest = await read($, companies)
    if (!(await read($, activeId)) && rest.length) await update($, activeId, () => rest.at(-1)!.id)
    return { result: JSON.stringify(out) }
  }).catch(() => ({ result: 'company-hq: close_project failed; see claude --debug.' }))

  // Budget cap on every spawn, Workflow agents included.
  on('agent.spawn', async ($, e, next) => {
    // The cap belongs to the company's folder: an abandoned company must not
    // throttle work in other repos.
    const a = await active($)
    const c = a && inProject(await $.session.cwd(), a.dir) ? a : undefined
    const row = (status: AgentRun['status'], agentId?: string, model?: string): AgentRun => ({
      ...(agentId ? { agentId } : {}), type: e.subagentType, ...(model ? { model } : {}),
      part: partOf(e.description), description: e.description.slice(0, 200), status, startedAt: new Date().toISOString(),
    })
    const log = (r: AgentRun) => change($, c!.id, x => ({ ...x, agents: [...x.agents, r].slice(-MAX_AGENTS) }))
    if (c) {
      const live = await liveUsd($)
      if (overCap(c.budget, live)) {
        await log(row('denied'))
        return { deny: `company-hq: company "${c.id}" reached its budget cap ($${c.budget.capUsd}). Stop, report progress to the user and ask before spending more.` }
      }
      if (!warned.has(c.id) && nearCap(c.budget, live)) {
        warned.add(c.id)
        $.ui.toast(`company: ${c.slug} at 80% of its $${c.budget.capUsd} cap`)
      }
    }
    const result = await next(e)
    if (c) await log(result.deny ? row('denied') : row('running', result.agentId, result.model))
    return result
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId !== undefined) {
      const id = e.agentId
      const owner = (await read($, companies)).find(c => c.agents.some(r => r.agentId === id && r.status === 'running'))
      if (owner) {
        const at = new Date().toISOString()
        await change($, owner.id, x => ({ ...x, agents: x.agents.map(r => (r.agentId === id ? { ...r, status: 'done' as const, endedAt: at } : r)) }))
      }
      return result
    }
    await flush($)
    return result
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'company-status' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Company' })
    return {}
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const list = await read($, companies)
    const id = await read($, activeId)
    const p = list.find(c => c.id === id)
    if (!p) return <Text dimColor>No open /company company.</Text>
    const s = p.agents
    const running = s.filter(x => x.status === 'running').length
    const pct = p.budget.capUsd ? Math.round((p.budget.spentUsd / p.budget.capUsd) * 100) : 0
    const others = list.filter(c => c.id !== id)
    return (
      <Box flexDirection="column">
        <Text bold>{p.title}</Text>
        <Text dimColor>{p.id} · dashboard {p.dashboard}</Text>
        <Text>phase: {p.phase}{p.note ? ` · ${p.note}` : ''}</Text>
        {p.questions.some(q => q.status === 'open') && <Text color="red">questions waiting: {p.questions.filter(q => q.status === 'open').map(q => q.id).join(', ')}</Text>}
        <Text color={pct >= 80 ? 'red' : undefined}>spent ${p.budget.spentUsd.toFixed(2)}{p.budget.capUsd ? ` of $${p.budget.capUsd} (${pct}%)` : ''} · agents {s.length} ({running} running, {s.filter(x => x.status === 'denied').length} denied)</Text>
        {p.teams.map(t => (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>{t.name}</Text>
            {t.members.map(x => <Text>  {x.name} · {x.model} · {x.description.slice(0, 60)}</Text>)}
          </Box>
        ))}
        <Box flexDirection="column" marginTop={1}>
          <Text bold>recent agents</Text>
          {s.slice(-8).map(x => <Text dimColor={x.status !== 'running'}>  {x.status === 'running' ? '▶' : x.status === 'done' ? '✓' : '✗'} {x.part ? `[${x.part}] ` : ''}{x.type} {x.model ? `(${x.model})` : ''} {x.description.slice(0, 40)}</Text>)}
        </Box>
        {others.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>other open companies</Text>
            {others.map(c => <Text dimColor>  {c.title} · {c.phase} · ${c.budget.spentUsd.toFixed(2)}</Text>)}
          </Box>
        )}
      </Box>
    )
  })
}
