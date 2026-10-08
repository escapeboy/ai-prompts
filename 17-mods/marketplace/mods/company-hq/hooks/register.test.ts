import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

import { addMember, companyId, dashLine, inProject, nearCap, overCap, parseWorktrees, partOf, redact, sha256Hex, validateHire } from './register'

const B = { capUsd: 10, spentUsd: 7 }
const HOME = '/home/me'
const ROOT = `${HOME}/.claude/company-hq`

test('cap math', async () => {
  expect(overCap(B, 2.9)).toBe(false)
  expect(overCap(B, 3)).toBe(true)
  expect(nearCap(B, 1)).toBe(true)
  expect(nearCap({ ...B, spentUsd: 1 }, 1)).toBe(false)
  expect(overCap({ ...B, capUsd: 0 }, 1000)).toBe(false)
})

test('cap applies only inside the project folder', async () => {
  expect(inProject('/a/b', '/a/b')).toBe(true)
  expect(inProject('/a/b/c', '/a/b')).toBe(true)
  expect(inProject('/a/bc', '/a/b')).toBe(false)
  expect(inProject('/x', '/a/b')).toBe(false)
})

test('hire validation', async () => {
  const ok = { name: 'laravel-api', team: 'backend', description: 'Builds the API', prompt: 'x'.repeat(50), model: 'sonnet' }
  expect(validateHire(ok)).toBe(undefined)
  expect(validateHire({ ...ok, name: 'Bad Name' })).toContain('kebab')
  expect(validateHire({ ...ok, model: 'gpt-5' })).toContain('model')
  expect(validateHire({ ...ok, prompt: 'short' })).toContain('prompt')
})

test('part from description, company id from time', async () => {
  expect(partOf('api: build refund endpoint')).toBe('api')
  expect(partOf('ui-admin: table')).toBe('ui-admin')
  expect(partOf('Reply with exactly the word OK')).toBe(null)
  expect(partOf('https://x: y')).toBe(null)
  expect(companyId('pay', new Date('2026-10-08T14:30:12.345Z'))).toBe('pay-20261008-143012')
})

test('addMember moves a re-hired specialist between teams', async () => {
  const c = { teams: [] } as never
  const s = (team: string) => ({ name: 'dev', agent: 'company-hq:dev', team, model: 'sonnet', description: 'd' })
  const one = addMember(c, s('backend'))
  const two = addMember(one, s('frontend'))
  expect(two.teams.map(t => t.name)).toEqual(['frontend'])
})

type World = { files: Map<string, string>; registered: string[]; spawned: string[]; launches: string[][] }

const world = (on: On, usd: { v: number }, opts: { session?: string; cwd?: string; files?: Map<string, string>; store?: Record<string, unknown>; env?: Record<string, string>; realClock?: boolean; fetch?: (url: string, body: string) => { status: number; text: string } } = {}): World => {
  const files = opts.files ?? new Map<string, string>()
  mock.store(on, opts.store)
  mock.env(on, { HOME, ...(opts.env ?? {}) })
  on('session.usage', async () => ({ value: { startedAt: 0, context: { window: 1_000_000 }, rateLimits: [], cost: { usd: usd.v } } }))
  on('session.cwd', async () => ({ value: opts.cwd ?? '/tmp/p' }))
  on('session.id', async () => ({ value: opts.session ?? 's1' }))
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  const launches: string[][] = []
  let serverUp = false
  on('process.run', async (_$, e) => {
    if (e.argv[0] === 'git') return { value: { exitCode: 128, stdout: '', stderr: 'not a git repository' } as never }
    if (e.argv[0] === 'python3') {
      // The launcher starts the server, which writes server.json.
      launches.push([...e.argv])
      files.set(`${ROOT}/server.json`, JSON.stringify({ app: 'company-dashboard', port: 7420, url: 'http://127.0.0.1:7420/' }))
      serverUp = true
      return { value: { exitCode: 0, stdout: '4242\n', stderr: '' } as never }
    }
    return { value: { exitCode: 0, stdout: 'laptop\n', stderr: '' } as never }
  })
  on('fs.stat', async (_$, e) => ({ value: { kind: 'dir', size: 0, mtimeMs: 0, isLink: false, realPath: e.path } as never }))
  on('http.fetch', async (_$, e) => {
    if (opts.fetch && e.url.startsWith('https://fq.test/')) {
      const r = opts.fetch(e.url, e.init?.body ?? '')
      return { value: { ...r, ok: r.status >= 200 && r.status < 300, headers: {} } as never }
    }
    if (!serverUp || e.url !== 'http://127.0.0.1:7420/health') throw new Error('ECONNREFUSED')
    return { value: { status: 200, ok: true, headers: {}, text: '{"app":"company-dashboard"}' } as never }
  })
  if (!opts.realClock) on('clock.sleep', async () => ({ value: undefined as never }))
  on('fs.read', async (_$, e) => {
    const t = files.get(e.path)
    if (t === undefined) throw new Error('ENOENT')
    return { value: t as never }
  })
  on('fs.write', async (_$, e) => { files.set(e.path, e.text); return { value: undefined as never } })
  on('fs.list', async (_$, e) => {
    const pre = e.path.endsWith('/') ? e.path : e.path + '/'
    const names = new Set([...files.keys()].filter(k => k.startsWith(pre)).map(k => k.slice(pre.length).split('/')[0]))
    return { value: [...names].map(name => ({ name, kind: files.has(pre + name) ? 'file' : 'dir', size: 0, mtimeMs: 0, isLink: false })) as never }
  })
  on('tool.register', async () => ({ value: {} as never }))
  on('command.register', async () => ({ value: {} as never }))
  on('ui.open', async () => ({ value: {} as never }))
  on('ui.toast', async () => ({ value: {} as never }))
  on('turn.complete', async (_$, e) => ({ text: e.answer }))
  const registered: string[] = []
  on('agent.register', async (_$, e) => { registered.push(`${e.name}:${e.model}`); return { value: { agent: `company-hq:${e.name}` } as never } })
  const spawned: string[] = []
  on('agent.spawn', async (_$, e) => { spawned.push(e.subagentType); return { model: e.model ?? 'sonnet', agentId: `a${spawned.length}` } })
  return { files, registered, spawned, launches }
}

const call = (tool: string, args: Record<string, unknown>) => ({ tool, tool_use_id: 't', ...args }) as never
const spawn = (subagentType: string, description = 'd') => ({ tool_use_id: 't', prompt: 'p', description, subagentType, provider: { plugin: 'engine', tier: 'core' as const }, parentModel: 'opus', fork: false, background: false })
const start = { cwd: '/tmp/p', surface: 'terminal' as const, isInteractive: true }
const HIRE = { name: 'api-dev', team: 'backend', description: 'API work', prompt: 'You build Laravel API endpoints. '.repeat(3), model: 'sonnet' }
const state = (w: World, id: string) => JSON.parse(w.files.get(`${ROOT}/companies/${id}/state.json`)!)
const idOf = (result: unknown) => /Company (\S+) /.exec(String(result))?.[1] ?? ''

test('open, hire, spawn under the cap, refuse past it', async ($, on) => {
  const usd = { v: 5 }
  const w = world(on, usd)
  await $.session.start(start)
  const opened = await $.tool.call(call('mcp__company-hq__open_project', { slug: 'demo', title: 'Demo', capUsd: 2, task: 'build it' }))
  expect(String(opened.result)).toContain('cap $2')
  expect(String(opened.result)).toContain('dashboard off')
  const id = idOf(opened.result)
  expect(state(w, id)).toMatchObject({ slug: 'demo', machine: 'laptop', sessionId: 's1', status: 'open', task: 'build it', dir: '/tmp/p' })

  const hired = await $.tool.call(call('mcp__company-hq__hire', HIRE))
  expect(String(hired.result)).toContain('company-hq:api-dev')
  expect(w.registered).toEqual(['api-dev:sonnet'])
  expect(state(w, id).teams).toEqual([{ name: 'backend', members: [{ name: 'api-dev', agent: 'company-hq:api-dev', model: 'sonnet', description: 'API work' }] }])
  expect(w.files.get(`${ROOT}/companies/${id}/private.json`)).toContain('Laravel')
  expect(JSON.stringify(state(w, id))).not.toContain('Laravel')

  const first = await $.agent.spawn(spawn('company-hq:api-dev'))
  expect(first.deny).toBe(undefined)
  usd.v = 7.5 // $2.5 spent since open: past the $2 cap
  const second = await $.agent.spawn(spawn('general-purpose'))
  expect(second.deny).toContain('budget cap')
  expect(w.spawned).toEqual(['company-hq:api-dev'])
  expect(state(w, id).agents.map((a: { status: string }) => a.status)).toEqual(['running', 'denied'])

  const closed = await $.tool.call(call('mcp__company-hq__close_project', { pr: 'https://x/pr/1' }))
  const out = JSON.parse(String(closed.result))
  expect(out.spentUsd).toBe(2.5)
  expect(out.roster[0].prompt).toContain('Laravel')
  expect(state(w, id)).toMatchObject({ status: 'closed', result: { pr: 'https://x/pr/1' } })
  const after = await $.agent.spawn(spawn('general-purpose'))
  expect(after.deny).toBe(undefined)
})

test('two companies stay open side by side', async ($, on) => {
  const usd = { v: 1 }
  const w = world(on, usd)
  await $.session.start(start)
  const one = idOf((await $.tool.call(call('mcp__company-hq__open_project', { slug: 'one', title: 'One', capUsd: 5 }))).result)
  await $.tool.call(call('mcp__company-hq__hire', HIRE))
  const two = idOf((await $.tool.call(call('mcp__company-hq__open_project', { slug: 'two', title: 'Two', capUsd: 5, dashboard: 'local' }))).result)
  expect(one).not.toBe(two)

  const out = JSON.parse(String((await $.tool.call(call('mcp__company-hq__close_project', {}))).result))
  expect(out.project).toBe('two')
  expect(out.roster).toEqual([])
  expect(state(w, two)).toMatchObject({ status: 'closed', dashboard: 'local' })
  // The first company kept its org and is active again.
  expect(state(w, one)).toMatchObject({ status: 'open', teams: [{ name: 'backend' }] })
  const phase = await $.tool.call(call('mcp__company-hq__set_phase', { phase: 'research' }))
  expect(String(phase.result)).toContain(one)
})

test('agents carry their part and finish on turn.complete', async ($, on) => {
  const usd = { v: 0 }
  const w = world(on, usd)
  await $.session.start(start)
  const id = idOf((await $.tool.call(call('mcp__company-hq__open_project', { slug: 'pay', title: 'Pay', capUsd: 0 }))).result)
  await $.agent.spawn(spawn('workflow-subagent', 'api: build refunds'))
  await $.agent.spawn(spawn('Explore', 'look around'))
  let agents = state(w, id).agents
  expect(agents.map((a: { part: string | null }) => a.part)).toEqual(['api', null])
  await $.turn.complete({ agentId: 'a1', answer: 'OK', durationMs: 1, isAborted: false, turnId: 't1', reason: 'end_turn', category: null, explanation: null } as never)
  agents = state(w, id).agents
  expect(agents[0]).toMatchObject({ agentId: 'a1', status: 'done' })
  expect(agents[1].status).toBe('running')
})

test('a restarted session gets back only its own companies', async ($, on) => {
  const files = new Map<string, string>()
  const mine = { schema: 1, id: 'a-20261008-100000', slug: 'a', title: 'A', sessionId: 's1', status: 'open', dir: '/tmp/p', openedAt: '2026-10-08T10:00:00Z', teams: [{ name: 'backend', members: [{ name: 'api-dev', agent: 'company-hq:api-dev', model: 'sonnet', description: 'API' }] }], agents: [], budget: { capUsd: 5, spentUsd: 1 }, seq: 3 }
  const theirs = { ...mine, id: 'b-20261008-100000', slug: 'b', sessionId: 's2', teams: [] }
  files.set(`${ROOT}/companies/${mine.id}/state.json`, JSON.stringify(mine))
  files.set(`${ROOT}/companies/${mine.id}/private.json`, JSON.stringify({ hires: { 'api-dev': { prompt: 'p'.repeat(50) } } }))
  files.set(`${ROOT}/companies/${theirs.id}/state.json`, JSON.stringify(theirs))
  const w = world(on, { v: 0 }, { files })
  await $.session.start(start)
  expect(w.registered).toEqual(['api-dev:sonnet'])
  const phase = await $.tool.call(call('mcp__company-hq__set_phase', { phase: 'plan' }))
  expect(String(phase.result)).toContain(mine.id)
  expect(state(w, theirs.id).seq).toBe(3) // untouched

  // Another session's company can be taken over explicitly.
  const resumed = await $.tool.call(call('mcp__company-hq__open_project', { slug: 'x', title: 'x', capUsd: 0, resume: theirs.id }))
  expect(String(resumed.result)).toContain('resumed')
  expect(state(w, theirs.id).sessionId).toBe('s1')
})

test('v0.2 store project becomes a company', async ($, on) => {
  const store = {
    project: { slug: 'old', title: 'Old', capUsd: 9, spentUsd: 4, phase: 'build', note: 'n', dir: '/tmp/p' },
    roster: [{ name: 'api-dev', agent: 'company-hq:api-dev', team: 'backend', model: 'sonnet', description: 'API' }],
    prompts: { 'api-dev': { prompt: 'p'.repeat(50) } },
  }
  const w = world(on, { v: 0 }, { store })
  await $.session.start(start)
  const ids = [...w.files.keys()].filter(k => k.endsWith('state.json'))
  expect(ids.length).toBe(1)
  const c = JSON.parse(w.files.get(ids[0]!)!)
  expect(c).toMatchObject({ slug: 'old', phase: 'build', budget: { capUsd: 9, spentUsd: 4 }, teams: [{ name: 'backend' }] })
  expect(w.registered).toEqual(['api-dev:sonnet'])
  // The store was emptied: a second start does not migrate it again.
  await $.session.start(start)
  expect([...w.files.keys()].filter(k => k.endsWith('state.json')).length).toBe(1)
})

test('dashboard local starts the server once; off starts nothing', async ($, on) => {
  const w = world(on, { v: 0 })
  await $.session.start(start)
  const off = await $.tool.call(call('mcp__company-hq__open_project', { slug: 'quiet', title: 'Quiet', capUsd: 0 }))
  expect(String(off.result)).not.toContain('Dashboard')
  expect(w.launches.length).toBe(0)

  const one = await $.tool.call(call('mcp__company-hq__open_project', { slug: 'seen', title: 'Seen', capUsd: 0, dashboard: 'local' }))
  expect(String(one.result)).toContain('Dashboard: http://127.0.0.1:7420/')
  expect(w.launches.length).toBe(1)
  expect(w.launches[0]!.slice(3)).toEqual([expect.stringContaining('/server/company-dashboard.py'), ROOT, `${ROOT}/server.log`])

  const two = await $.tool.call(call('mcp__company-hq__open_project', { slug: 'also', title: 'Also', capUsd: 0, dashboard: 'local+fleetq' }))
  expect(String(two.result)).toContain('Dashboard: http://127.0.0.1:7420/')
  expect(w.launches.length).toBe(1) // reused
})

test('dashboard default comes from config.json', async ($, on) => {
  const files = new Map([[`${ROOT}/config.json`, JSON.stringify({ dashboard: 'local', machine: 'buildbox' })]])
  const w = world(on, { v: 0 }, { files })
  await $.session.start(start)
  const r = await $.tool.call(call('mcp__company-hq__open_project', { slug: 'cfg', title: 'Cfg', capUsd: 0 }))
  expect(String(r.result)).toContain('dashboard local')
  expect(state(w, idOf(r.result))).toMatchObject({ dashboard: 'local', machine: 'buildbox' })
})

test('dashLine', async () => {
  expect(dashLine('off', undefined)).toBe('')
  expect(dashLine('fleetq', 'http://x/')).toBe('')
  expect(dashLine('local', undefined)).toContain('could not start')
})

test('sha256, redaction and worktree parsing', async () => {
  expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  expect(await sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
  expect(redact('key sk-ant-' + 'a'.repeat(30) + ' and ghp_' + 'b'.repeat(36))).toBe('key [REDACTED] and [REDACTED]')
  expect(redact('Authorization: Bearer ' + 'x'.repeat(40))).toBe('Authorization: [REDACTED]')
  expect(redact('plain text sk-short')).toBe('plain text sk-short')
  const out = 'worktree /w/api\nHEAD 1\nbranch refs/heads/company-pay-api\n\nworktree /p\nHEAD 2\nbranch refs/heads/main\n'
  expect(parseWorktrees(out, '/p')).toEqual([{ path: '/p', branch: 'main' }, { path: '/w/api', branch: 'company-pay-api' }])
  expect(parseWorktrees('', '/p')).toEqual([{ path: '/p', branch: null }])
})

test('questions wait for the user; decisions are logged', async ($, on) => {
  const w = world(on, { v: 0 })
  await $.session.start(start)
  const id = idOf((await $.tool.call(call('mcp__company-hq__open_project', { slug: 'qa', title: 'Q', capUsd: 0 }))).result)
  const asked = await $.tool.call(call('mcp__company-hq__ask_user', { text: 'Keep cards in Stripe?', part: 'api', options: ['yes', 'no'] }))
  expect(String(asked.result)).toContain('Question q1')
  expect(String(asked.result)).toContain('PushNotification')
  expect(state(w, id).questions[0]).toMatchObject({ id: 'q1', part: 'api', class: 'user', status: 'open' })
  await $.tool.call(call('mcp__company-hq__answer_question', { id: 'q1', answer: 'yes' }))
  expect(state(w, id).questions[0]).toMatchObject({ status: 'answered', answer: 'yes' })
  expect(String((await $.tool.call(call('mcp__company-hq__answer_question', { id: 'q9', answer: 'x' }))).result)).toContain('No question')
  await $.tool.call(call('mcp__company-hq__record_decision', { text: 'Button top or bottom?', options: ['bottom', 'top'], chosen: 'bottom', by: 'agent', part: 'ui', jev: { scores: [0.74, 0.21], mode: 'shadow' } }))
  expect(state(w, id).decisions[0]).toMatchObject({ id: 'd1', chosen: 'bottom', by: 'agent', jev: { mode: 'shadow' } })
  expect(String((await $.tool.call(call('mcp__company-hq__record_decision', { text: 't', options: [], chosen: 'a', by: 'me' }))).result)).toContain('refused')
})

test('fleetq: sends snapshot, then missing docs with content, redacted; retries on 503', async ($, on) => {
  const files = new Map<string, string>([
    [`${ROOT}/config.json`, JSON.stringify({ fleetq: { url: 'https://fq.test/' } })],
    ['/tmp/p/docs/design-api.md', '# api\nkey sk-ant-' + 'a'.repeat(30)],
    ['/tmp/p/docs/notes.md', 'not a plan doc'],
    ['/tmp/p/claudedocs/company/pay/plan.md', '# plan'],
  ])
  const sent: { docs: { key: string; content?: string }[]; snapshot: { phase: string } }[] = []
  const replies: { status: number; text: string }[] = []
  const clock = mock.clock(on)
  const w = world(on, { v: 0 }, {
    files, realClock: true, env: { COMPANY_HQ_FLEETQ_TOKEN: 'tok' },
    fetch: (_url, body) => { sent.push(JSON.parse(body)); return replies.shift() ?? { status: 200, text: '{"ok":true}' } },
  })
  await $.session.start(start)
  const id = idOf((await $.tool.call(call('mcp__company-hq__open_project', { slug: 'pay', title: 'Pay', capUsd: 0, dashboard: 'fleetq' }))).result)

  replies.push({ status: 200, text: JSON.stringify({ ok: true, missingDocs: ['0:docs/design-api.md', '0:claudedocs/company/pay/plan.md'] }) })
  await clock.advance(2000)
  await clock.settle()
  expect(sent.length).toBe(1)
  expect(sent[0]!.docs.map(d => d.key).sort()).toEqual(['0:claudedocs/company/pay/plan.md', '0:docs/design-api.md'])
  expect(sent[0]!.docs.every(d => d.content === undefined)).toBe(true) // nothing known yet

  await clock.advance(200) // re-send of the missing docs
  await clock.settle()
  expect(sent.length).toBe(2)
  const api = sent[1]!.docs.find(d => d.key === '0:docs/design-api.md')!
  expect(api.content).toContain('[REDACTED]')
  expect(api.content).not.toContain('sk-ant-')

  await $.tool.call(call('mcp__company-hq__set_phase', { phase: 'research' }))
  replies.push({ status: 503, text: '' })
  await clock.advance(2000)
  await clock.settle()
  expect(sent.length).toBe(3)
  expect(sent[2]!.snapshot.phase).toBe('research')
  expect(sent[2]!.docs.every(d => d.content === undefined)).toBe(true) // unchanged docs carry no content
  expect(JSON.parse(w.files.get(`${ROOT}/companies/${id}/outbox.json`)!)).toMatchObject({ pending: true, status: 503 })
  await clock.advance(5000) // backoff
  await clock.settle()
  expect(sent.length).toBe(4)
  expect(JSON.parse(w.files.get(`${ROOT}/companies/${id}/outbox.json`)!)).toMatchObject({ pending: false })
})
