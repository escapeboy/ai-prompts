import { expect, mock, test } from 'claude-code/testing'

import { findRussian, plainIssues } from './register'

const turn = (answer: string, agentId?: string) => ({
  answer, durationMs: 10, isAborted: false, turnId: 't1', reason: 'answer' as const, agentId,
})

test('detects Russian, ignores Bulgarian and code', async () => {
  expect(findRussian('Прехвърлих данните и ги проверих. Готово е.')).toEqual([])
  expect(findRussian('Сега ще го направя, но что е това?')).toEqual(['что'])
  expect(findRussian('Это уже готово')).toEqual(['Э', 'это', 'уже'])
  expect(findRussian('Пример: `что` и ```\nсейчас\n```')).toEqual([])
  expect(findRussian('Тук има още неща, които трябват.')).toEqual([])
})

test('Russian answer: line under it and a reminder for Claude', async ($, on) => {
  const session = mock.session(on)
  on('turn.complete', async (_$, e) => ({ text: e.answer }))

  const out = await $.turn.complete(turn('Всичко е готово, сейчас проверявам.'))
  expect(out.text).toContain('lang-guard')
  expect(out.text).toContain('сейчас')
  expect(session.appended().length).toBe(1)
})

test('Bulgarian answer and subagent turns pass untouched', async ($, on) => {
  const session = mock.session(on)
  on('turn.complete', async (_$, e) => ({ text: e.answer }))

  expect((await $.turn.complete(turn('Всичко е готово.'))).text).toBe('Всичко е готово.')
  expect((await $.turn.complete(turn('что', 'agent-1'))).text).toBe('что')
  expect(session.appended().length).toBe(0)
})

test('plain language: dashes, long sentences, phrases', async () => {
  const filler = 'Проверих конфигурацията на сървъра и тестовете минават. '.repeat(6)
  expect(plainIssues(filler)).toEqual([])
  const dashy = filler + 'Миграцията — това е важно — мина. Логовете — чисти. Кешът — изчистен.'
  expect(plainIssues(dashy)[0]).toContain('тирета')
  const long = filler + Array.from({ length: 45 }, () => 'дума').join(' ') + '.'
  expect(plainIssues(long)).toEqual(['изречение от 45 думи'])
  expect(plainIssues(filler + 'Урокът е прост.')).toEqual(['фрази: урокът е'])
  expect(plainIssues('Кратко — твърде — кратко — за проверка.')).toEqual([])
})
