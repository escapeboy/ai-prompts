import { expect, test } from 'claude-code/testing'

import { parseFleet } from './register'

test('parse FLEET-STATE', async () => {
  const md = [
    '# FLEET-STATE', '', '_Generated: 2026-10-08T04:38:25+00:00 by fleet-triage.py_', '',
    '## P1 — production-facing', '', '- [observed] a', '- [observed] b', '',
    '## P2 — infrastructure drift', '', '- [observed] c', '',
    '## P3 — hygiene', '', '_Clear._', '',
    '## Comprehension debt', '', '- [observed] commits: **0**',
  ].join('\n')
  expect(parseFleet(md)).toEqual({ p1: 2, p2: 1, p3: 0, generated: '2026-10-08T04:38:25+00:00' })
})
