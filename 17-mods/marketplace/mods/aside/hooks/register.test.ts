import { expect, mock, test } from 'claude-code/testing'

test('a pane question goes to a fork, not to the conversation', async ($, on) => {
  const session = mock.session(on)
  const asked: string[] = []
  on('model.fork', async (_$, e) => {
    asked.push(e.prompt)
    return { value: { isAnswered: true as const, text: 'We chose Sonnet.', usage: { input_tokens: 5, output_tokens: 4, cache_read_input_tokens: 300_000, cache_creation_input_tokens: 0 } } }
  })
  on('ui.open', async () => ({ value: {} as never }))
  const out = await $.command.run({ command: 'aside', args: 'what model did we pick?', origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 160 } })
  expect(out.text).toBe(undefined)
  expect(asked.length).toBe(1)
  expect(asked[0]).toContain('what model did we pick?')
  expect(session.appended().length).toBe(0)
})
