import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Meter } from '../types'

const meter = atom({ plugin: 'context-meter', key: 'meter' } as const, null)
// The highest threshold already announced this session, so each fires once.
const warned = atom({ plugin: 'context-meter', key: 'warned' } as const, 0)
const isHidden = atom({ plugin: 'context-meter', key: 'isHidden' } as const, false)

// Long sessions pay cache-read on the whole context every turn (one real
// session reached 930K). Past these points a fresh session is cheaper.
const THRESHOLDS = [50, 70] as const

export const kTokens = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : `${Math.round(n / 1000)}K`)

export const formatMeter = (m: Meter): string => {
  const parts = [
    m.tokens === undefined ? `ctx –/${kTokens(m.window)}` : `ctx ${kTokens(m.tokens)}/${kTokens(m.window)} ${m.percent ?? 0}%`,
    `cache read ${kTokens(m.cacheRead)} · write ${kTokens(m.cacheWrite)}`,
  ]
  if (m.usd !== undefined) parts.push(`$${m.usd.toFixed(2)}`)
  for (const l of m.limits) parts.push(`${l.kind === 'five_hour' ? '5h' : l.kind === 'seven_day' ? '7d' : l.kind} ${Math.round(l.percentUsed)}%`)
  return parts.join(' · ')
}

export const crossed = (percent: number | undefined, already: number): number | undefined => {
  if (percent === undefined) return undefined
  const top = THRESHOLDS.filter(t => percent >= t && t > already).pop()
  return top
}

// Rule "one session = one task": past 70% the band offers a handoff. It only
// prepares the next session; it never runs /clear (the user's choice, 08.10).
export const HANDOFF_PROMPT = [
  'Prepare a handoff so this work can continue in a fresh session. Do not run /clear.',
  '1. If the working directory has .continuity/, run the continuity skill\'s finalize (update STATE.md with evidence tags, then lint).',
  '2. Otherwise write ~/.claude/handoffs/<project>-<YYYY-MM-DD>.md: goal, what is done (verified), what is in flight, what failed and why, next steps, key files.',
  '3. End with the exact first message to paste into the new session, and nothing else after it.',
].join('\n')

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'meter', description: 'Show or hide the context meter band', immediate: true })
    await $.command.register({ name: 'handoff', description: 'Finalize this session into a handoff for a fresh one (no /clear)' })
    return next(e)
  })

  on('command.run', { command: 'handoff' }, async $ => {
    await $.prompt.submit({ text: HANDOFF_PROMPT })
    return { text: 'Handoff requested.' }
  })

  on('command.run', { command: 'meter' }, async $ => {
    const hidden = await update($, isHidden, h => !h)
    const m = await read($, meter)
    return { text: `${hidden ? 'Meter hidden.' : 'Meter shown.'}${m ? ' ' + formatMeter(m) : ''}` }
  })

  // Main-loop requests only: a subagent's request says nothing about this window.
  on('turn.step', async function* ($, e, next) {
    const result = yield* next(e)
    if (e.agentId === undefined && result.usage) {
      const usage = await $.session.usage()
      const m: Meter = {
        tokens: usage.context.tokens,
        window: usage.context.window,
        percent: usage.context.percent,
        cacheRead: result.usage.cache_read_input_tokens ?? 0,
        cacheWrite: result.usage.cache_creation_input_tokens ?? 0,
        usd: usage.cost?.usd,
        limits: usage.rateLimits.map(l => ({ kind: l.kind, percentUsed: l.percentUsed })),
      }
      await update($, meter, () => m)

      const hit = crossed(m.percent, await read($, warned))
      if (hit !== undefined) {
        await update($, warned, () => hit)
        $.ui.toast(`Context at ${m.percent}%: ${hit >= 70 ? '/handoff, then a fresh session' : 'finish this task, then a fresh session'} (cache read grows every turn).`)
      }
    }
    return result
  })

  // /clear starts the window over.
  on('session.end', async ($, e, next) => {
    if (e.reason === 'clear') {
      await update($, meter, () => null)
      await update($, warned, () => 0)
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const m = await read($, meter)
    if (e.props.hasSurvey || m === null || (await read($, isHidden))) return next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    const percent = m.percent ?? 0
    const color = percent >= 70 ? 'red' : percent >= 50 ? 'yellow' : undefined

    return (
      <Box>
        <Text color={color} dimColor={color === undefined} wrap="truncate-end">
          {formatMeter(m)}{' '}
        </Text>
        {percent >= 70 ? (
          <Button key="handoff" label="Handoff" variant="primary" onPress={() => $.prompt.submit({ text: HANDOFF_PROMPT })} />
        ) : null}
        <Button key="hide" label="Hide" plain onPress={() => update($, isHidden, () => true)} />
      </Box>
    )
  })
}
