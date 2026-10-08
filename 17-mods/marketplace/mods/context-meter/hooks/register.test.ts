import { expect, test } from 'claude-code/testing'

import { crossed, formatMeter, kTokens } from './register'

test('format', async () => {
  expect(kTokens(312_400)).toBe('312K')
  expect(kTokens(1_000_000)).toBe('1.00M')
  const line = formatMeter({
    tokens: 312_400, window: 1_000_000, percent: 31, cacheRead: 300_000, cacheWrite: 2_000, usd: 4.123,
    limits: [{ kind: 'five_hour', percentUsed: 23.5 }, { kind: 'seven_day', percentUsed: 61 }],
  })
  expect(line).toBe('ctx 312K/1.00M 31% · cache read 300K · write 2K · $4.12 · 5h 24% · 7d 61%')
})

test('thresholds fire once each', async () => {
  expect(crossed(30, 0)).toBe(undefined)
  expect(crossed(55, 0)).toBe(50)
  expect(crossed(60, 50)).toBe(undefined)
  expect(crossed(75, 50)).toBe(70)
  expect(crossed(75, 0)).toBe(70)
  expect(crossed(undefined, 0)).toBe(undefined)
})
