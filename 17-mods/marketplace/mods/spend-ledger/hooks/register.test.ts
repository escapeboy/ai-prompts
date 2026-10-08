import { expect, test } from 'claude-code/testing'

import { merge, note, rollup, table } from './register'

const r = (usd: number, turns = 1) => ({ turns, input: 1000, output: 500, cacheRead: 200_000, cacheWrite: 10_000, usd })

test('merge and rollup', async () => {
  const a = { '2026-10-08|~/src/a|claude-opus-5-5': r(2), '2026-10-07|~/src/b|claude-sonnet-5-5': r(1) }
  const b = { '2026-10-08|~/src/a|claude-opus-5-5': r(3), '2026-10-08|~/src/b|claude-sonnet-5-5': r(0.5) }
  const m = merge([a, b])
  expect(m['2026-10-08|~/src/a|claude-opus-5-5']!.usd).toBe(5)
  expect(rollup(m, 1).map(([p, x]) => [p, x.usd])).toEqual([['~/src/a', 5], ['~/src/b', 1.5]])
  expect(rollup(m, 1, '2026-10-08').map(([p, x]) => [p, x.usd])).toEqual([['~/src/a', 5], ['~/src/b', 0.5]])
  expect(rollup(m, 2)[0]![0]).toBe('claude-opus-5-5')
})

test('table and note', async () => {
  const t = table([['~/src/a', r(2.5, 3)]], 'проект')
  expect(t).toContain('| ~/src/a | 2.50 | 3 | 1K | 1K | 200K | 10K |')
  expect(t).toContain('**2.50**')
  const n = note('2026-10', [{ host: 'laptop', month: '2026-10', updated: 'x', agg: { '2026-10-08|~/a|m': r(1) } }, { host: 'buildbox', month: '2026-10', updated: 'y', agg: {} }])
  expect(n).toContain('## laptop')
  expect(n).toContain('## buildbox')
  expect(n).toContain('title: Claude разход 2026-10')
})
