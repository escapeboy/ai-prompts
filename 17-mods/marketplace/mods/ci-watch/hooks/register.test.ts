import { expect, test } from 'claude-code/testing'

import { summarize } from './register'

test('summarize gh buckets', async () => {
  const s = summarize([
    { name: 'lint', bucket: 'pass' }, { name: 'unit', bucket: 'fail' },
    { name: 'e2e', bucket: 'pending' }, { name: 'docs', bucket: 'skipping' },
  ])
  expect(s).toEqual({ pass: 2, fail: 1, pending: 1, isDone: false, failed: ['unit'] })
  expect(summarize([{ name: 'a', bucket: 'pass' }]).isDone).toBe(true)
})
