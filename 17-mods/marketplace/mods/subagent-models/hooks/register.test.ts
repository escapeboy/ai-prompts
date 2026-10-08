import { expect, mock, test } from 'claude-code/testing'

import { policyModel } from './register'

const spawn = (subagentType: string, model?: string) => ({
  tool_use_id: 'toolu_1',
  prompt: 'do it',
  description: 'task',
  subagentType,
  provider: { plugin: 'engine', tier: 'core' as const },
  model,
  parentModel: 'claude-opus-5-5',
  fork: false,
  background: false,
})

test('policy table', async () => {
  expect(policyModel('adversarial-verifier', undefined)).toBe('opus')
  expect(policyModel('general-purpose', undefined)).toBe('sonnet')
  expect(policyModel('technical-writer', undefined)).toBe('haiku')
  expect(policyModel('Explore', undefined)).toBe(undefined)
  expect(policyModel('general-purpose', 'opus')).toBe(undefined)
})

test('spawn gets the policy model and is logged', async ($, on) => {
  mock.store(on)
  mock.clock(on, { now: 1_760_000_000_000 })
  on('session.cwd', async () => ({ value: '/tmp/x' }))
  const seen: (string | undefined)[] = []
  on('agent.spawn', async (_$, e) => {
    seen.push(e.model)
    return { model: e.model ?? 'claude-opus-5-5', agentId: 'a1' }
  })

  await $.agent.spawn(spawn('general-purpose'))
  await $.agent.spawn(spawn('general-purpose', 'haiku'))
  await $.agent.spawn(spawn('Explore'))
  expect(seen).toEqual(['sonnet', 'haiku', undefined])

  const out = await $.command.run({ command: 'agent-models', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })
  expect(out.text).toContain('policy → sonnet')
  expect(out.text).toContain('asked haiku')
  expect(out.text).toContain('Last 3 of 3')
})
