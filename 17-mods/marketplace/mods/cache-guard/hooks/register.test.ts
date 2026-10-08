import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const MIN = 60_000

const world = (on: On, tokens: number, forkRead: number) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  on('session.usage', async () => ({ value: { startedAt: 0, context: { tokens, window: 1_000_000, percent: 40 }, rateLimits: [] } }))
  on('command.register', async () => ({ value: {} as never }))
  let forks = 0
  on('model.fork', async () => {
    forks += 1
    return { value: { isAnswered: true as const, text: 'ok', usage: { input_tokens: 10, output_tokens: 1, cache_read_input_tokens: forkRead, cache_creation_input_tokens: 0 } } }
  })
  on('prompt.submit', async (_$, e) => ({ text: e.text }))
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  return { clock, forks: () => forks }
}

const submit = (text: string) => ({ text, wait: false, origin: { kind: 'composer' } }) as never

test('cold cache holds the prompt once, then lets it through', async ($, on) => {
  const w = world(on, 400_000, 0)
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'keepwarm', args: 'off', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })
  await w.clock.advance(61 * MIN)
  const first = await $.prompt.submit(submit('hi'))
  expect(first.drop).toContain('кешът е изстинал')
  expect(first.drop).toContain('400K')
  const second = await $.prompt.submit(submit('hi'))
  expect(second.text).toBe('hi')
})

test('small context is never held', async ($, on) => {
  const w = world(on, 50_000, 0)
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await w.clock.advance(61 * MIN)
  expect((await $.prompt.submit(submit('hi'))).text).toBe('hi')
})

test('keep-warm pings after 50 idle minutes and keeps the cache warm', async ($, on) => {
  const w = world(on, 400_000, 390_000)
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await w.clock.advance(49 * MIN)
  expect(w.forks()).toBe(0)
  await w.clock.advance(2 * MIN)
  expect(w.forks()).toBe(1)
  await w.clock.advance(12 * MIN)
  // warmed at ~51 min, so no cold hold at 63 min
  expect((await $.prompt.submit(submit('hi'))).text).toBe('hi')
})

test('keep-warm stops when the cache had already lapsed', async ($, on) => {
  const w = world(on, 400_000, 0)
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await w.clock.advance(51 * MIN)
  expect(w.forks()).toBe(1)
  await w.clock.advance(60 * MIN)
  expect(w.forks()).toBe(1)
})
