import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { AsideEntry } from '../types'

// A side question about the session that never enters the main conversation:
// a tool-less fork of the transcript answers it, served from the prompt cache.
// Ask in the pane's field; `/aside <question>` works too, but the command's
// record is a transcript row, so the field is the clean way.

const PANE = 'aside'
const entries = atom({ plugin: 'aside', key: 'entries' } as const, [])

export const framed = (question: string) =>
  `Side question from the user, answered outside the main conversation. Answer briefly, in the language of the question, from what this session already contains. Do not plan or start work.\n\n${question}`

async function ask($: EngineInterface, question: string) {
  const q = question.trim()
  if (!q) return
  await update($, entries, list => [...list, { question: q, answer: '', status: 'asking', cacheRead: 0, output: 0 } as AsideEntry].slice(-20))
  const r = await $.model.fork({ prompt: framed(q) })
  const usage = 'usage' in r ? r.usage : undefined
  const done: Partial<AsideEntry> = r.isAnswered
    ? { answer: r.text, status: 'done' }
    : { answer: `no answer: ${r.reason}`, status: 'failed' }
  await update($, entries, list =>
    list.map((x, i) => (i === list.length - 1 && x.question === q ? { ...x, ...done, cacheRead: usage?.cache_read_input_tokens ?? 0, output: usage?.output_tokens ?? 0 } : x)),
  )
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'aside', description: 'Ask about this session in a side pane; nothing enters the conversation', argumentHint: '[question]', immediate: true })
    return next(e)
  })

  on('command.run', { command: 'aside' }, async ($, e) => {
    await $.ui.open({ id: PANE, title: 'Aside', focus: true, closeOnEscape: true })
    await ask($, e.args)
    return {}
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    if (e.surface === 'mobile') {
      const { Text } = $.ui.resolve(e)
      return <Text>Aside needs the terminal or desktop.</Text>
    }
    const { Box, Text, Input, Markdown } = $.ui.resolve(e)
    const list = await read($, entries)
    return (
      <Box flexDirection="column">
        {list.length === 0 && <Text dimColor>Ask anything about this session. Nothing here reaches the main conversation.</Text>}
        {list.slice(-4).map(x => (
          <Box flexDirection="column" marginBottom={1}>
            <Text bold>› {x.question}</Text>
            {x.status === 'asking' ? <Text dimColor>thinking…</Text> : <Markdown key={`a-${x.question.slice(0, 40)}`} text={x.answer} />}
            {x.status !== 'asking' && <Text dimColor>cache read {Math.round(x.cacheRead / 1000)}K · out {x.output}</Text>}
          </Box>
        ))}
        <Input key="q" placeholder="Side question…" autoFocus onSubmit={value => void ask($, value)} />
      </Box>
    )
  })
}
