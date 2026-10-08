import type { Register } from 'claude-code'

// Letters Bulgarian never uses, and common Russian words with no Bulgarian
// homograph. Feedback memory "Само български, никога руски": the drift shows up
// in long summaries after many tool calls.
const RU_LETTERS = /[ыэЫЭёЁ]/g
const RU_WORDS = [
  'что', 'нужно', 'сейчас', 'уже', 'жду', 'этим', 'это', 'этот', 'эта', 'если', 'только',
  'можно', 'очень', 'который', 'которые', 'потому', 'сделать', 'теперь', 'здесь',
  'хорошо', 'нет', 'надо', 'всё', 'еще', 'ещё', 'спасибо', 'пожалуйста', 'чтобы',
]
const stripCode = (text: string) =>
  text.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ')

export const findRussian = (answer: string): string[] => {
  const text = stripCode(answer)
  const hits = new Set<string>()
  for (const m of text.match(RU_LETTERS) ?? []) hits.add(m)
  const words = text.toLowerCase().match(/[\p{Script=Cyrillic}]+/gu) ?? []
  for (const w of words) {
    if (RU_WORDS.includes(w)) hits.add(w)
  }
  return [...hits]
}

// Plain language (user's request of 03.09.2026: "Говориш странно"). Thresholds
// tuned on transcripts 08.10.2026: they flag 67 of 80 replies from 15.08–02.09
// and ~2 of the last 50.
const PHRASES = /урокът е|поучително|истината е|ключът е|не е [^.!?\n]{1,40}, а /gi
const MAX_SENTENCE_WORDS = 40

export const plainIssues = (answer: string): string[] => {
  const text = stripCode(answer)
    .split('\n')
    .filter(l => !/^\s*[|>]/.test(l))
    .join('\n')
  const words = text.match(/[\p{L}\p{N}]+/gu) ?? []
  if (words.length < 40) return []
  const issues: string[] = []
  const dashes = (text.match(/\s[—–]\s/g) ?? []).length
  if (dashes >= 3 && (dashes * 100) / words.length > 1.5) issues.push(`${dashes} тирета-вметки`)
  const longest = Math.max(...text.split(/(?<=[.!?])\s+|\n+/).map(s => (s.match(/[\p{L}\p{N}]+/gu) ?? []).length))
  if (longest > MAX_SENTENCE_WORDS) issues.push(`изречение от ${longest} думи`)
  const phrases = [...new Set((text.match(PHRASES) ?? []).map(p => p.toLowerCase().slice(0, 30)))]
  if (phrases.length) issues.push(`фрази: ${phrases.join(', ')}`)
  return issues
}

export const register: Register = on => {
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    // Main loop only: a subagent's English report is not the user's reply.
    if (e.agentId !== undefined || e.reason !== 'answer') return result
    const hits = findRussian(e.answer)
    const isBulgarian = (e.answer.match(/[\u0400-\u04FF]/g) ?? []).length > (e.answer.match(/[A-Za-z]/g) ?? []).length
    const plain = isBulgarian ? plainIssues(e.answer) : []
    if (hits.length === 0 && plain.length === 0) return result

    const notes: string[] = []
    const lines: string[] = []
    if (hits.length) {
      const list = hits.slice(0, 8).join(', ')
      notes.push(`The previous reply contained Russian (${list}). The user writes Bulgarian, never Russian. Use Bulgarian words from now on; if it matters, restate the affected sentence in Bulgarian.`)
      lines.push(`руски думи: ${list}`)
    }
    if (plain.length) {
      notes.push(`The previous reply broke the plain-language rule (${plain.join('; ')}). Write like a colleague talks: one idea per sentence, no em-dash asides, no aphorisms, no narrating the work as a story.`)
      lines.push(`неясен стил: ${plain.join('; ')}`)
    }
    await $.session.append({ message: { type: 'user', content: [{ type: 'text', text: `[lang-guard] ${notes.join(' ')}` }] } })
    return { ...result, text: `⚠ lang-guard: ${lines.join(' · ')}` }
  })
}
