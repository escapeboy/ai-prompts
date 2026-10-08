import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

import { inProject, nearCap, overCap, validateHire } from './register'

const P = { slug: 'x', title: 'X', capUsd: 10, spentUsd: 7, phase: 'build', note: '', dir: '/tmp' }

test('cap math', async () => {
  expect(overCap(P, 2.9)).toBe(false)
  expect(overCap(P, 3)).toBe(true)
  expect(nearCap(P, 1)).toBe(true)
  expect(nearCap({ ...P, spentUsd: 1 }, 1)).toBe(false)
  expect(overCap({ ...P, capUsd: 0 }, 1000)).toBe(false)
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

const world = (on: On, usd: { v: number }) => {
  mock.store(on)
  on('session.usage', async () => ({ value: { startedAt: 0, context: { window: 1_000_000 }, rateLimits: [], cost: { usd: usd.v } } }))
  on('session.cwd', async () => ({ value: '/tmp/p' }))
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  on('tool.register', async () => ({ value: {} as never }))
  on('command.register', async () => ({ value: {} as never }))
  on('ui.open', async () => ({ value: {} as never }))
  const registered: string[] = []
  on('agent.register', async (_$, e) => { registered.push(`${e.name}:${e.model}`); return { value: { agent: `company-hq:${e.name}` } as never } })
  const spawned: string[] = []
  on('agent.spawn', async (_$, e) => { spawned.push(e.subagentType); return { model: e.model ?? 'sonnet', agentId: `a${spawned.length}` } })
  return { registered, spawned }
}

const call = (tool: string, args: Record<string, unknown>) => ({ tool, tool_use_id: 't', ...args }) as never
const spawn = (subagentType: string) => ({ tool_use_id: 't', prompt: 'p', description: 'd', subagentType, provider: { plugin: 'engine', tier: 'core' as const }, parentModel: 'opus', fork: false, background: false })

test('open, hire, spawn under the cap, refuse past it', async ($, on) => {
  const usd = { v: 5 }
  const w = world(on, usd)
  await $.session.start({ cwd: '/tmp/p', surface: 'terminal', isInteractive: true })
  const opened = await $.tool.call(call('mcp__company-hq__open_project', { slug: 'demo', title: 'Demo', capUsd: 2 }))
  expect(String(opened.result)).toContain('cap $2')
  const hired = await $.tool.call(call('mcp__company-hq__hire', { name: 'api-dev', team: 'backend', description: 'API work', prompt: 'You build Laravel API endpoints. '.repeat(3), model: 'sonnet' }))
  expect(String(hired.result)).toContain('company-hq:api-dev')
  expect(w.registered).toEqual(['api-dev:sonnet'])

  const first = await $.agent.spawn(spawn('company-hq:api-dev'))
  expect(first.deny).toBe(undefined)
  usd.v = 7.5 // $2.5 spent since open: past the $2 cap
  const second = await $.agent.spawn(spawn('general-purpose'))
  expect(second.deny).toContain('budget cap')
  expect(w.spawned).toEqual(['company-hq:api-dev'])

  const closed = await $.tool.call(call('mcp__company-hq__close_project', {}))
  const out = JSON.parse(String(closed.result))
  expect(out.spentUsd).toBe(2.5)
  expect(out.roster[0].prompt).toContain('Laravel')
  const after = await $.agent.spawn(spawn('general-purpose'))
  expect(after.deny).toBe(undefined)
})

test('a new project starts with an empty roster', async ($, on) => {
  const usd = { v: 1 }
  world(on, usd)
  await $.session.start({ cwd: '/tmp/p', surface: 'terminal', isInteractive: true })
  await $.tool.call(call('mcp__company-hq__open_project', { slug: 'one', title: 'One', capUsd: 5 }))
  await $.tool.call(call('mcp__company-hq__hire', { name: 'api-dev', team: 'backend', description: 'API', prompt: 'You build Laravel API endpoints. '.repeat(3), model: 'sonnet' }))
  await $.tool.call(call('mcp__company-hq__open_project', { slug: 'two', title: 'Two', capUsd: 5 }))
  const out = JSON.parse(String((await $.tool.call(call('mcp__company-hq__close_project', {}))).result))
  expect(out.project).toBe('two')
  expect(out.roster).toEqual([])
})
