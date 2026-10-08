import { expect, test } from 'claude-code/testing'

import { count500, errorLines, TEMPLATE } from './register'

test('log parsers', async () => {
  const log = [
    '[2026-10-08 10:00:01] production.INFO: ok',
    '[2026-10-08 10:00:02] production.ERROR: SQLSTATE boom',
    '[2026-10-08 10:00:03] production.CRITICAL: down',
  ].join('\n')
  expect(errorLines(log).length).toBe(2)
  const access = [
    '1.2.3.4 - - [08/Oct/2026:10:00:00 +0000] "GET / HTTP/1.1" 200 512 "-" "x"',
    '1.2.3.4 - - [08/Oct/2026:10:00:01 +0000] "GET /api HTTP/1.1" 500 12 "-" "x"',
    '1.2.3.4 - - [08/Oct/2026:10:00:02 +0000] "GET /500 HTTP/1.1" 404 12 "-" "x"',
  ].join('\n')
  expect(count500(access)).toBe(1)
})

test('template patterns are valid regexes', async () => {
  for (const p of TEMPLATE.deployCommands) expect(() => new RegExp(p)).not.toThrow()
  expect(new RegExp(TEMPLATE.deployCommands[1]!).test('git push origin main')).toBe(true)
})
