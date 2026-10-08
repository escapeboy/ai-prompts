import type { EngineInterface, Register } from 'claude-code'

// The prompt cache lapses after an hour without a request (five minutes under
// usage overage). The next request then writes the whole context again at
// cache-write price, about 20x what a cache read of it costs. This mod keeps
// the cache warm with a tiny fork while the session is idle, and when it has
// gone cold anyway, holds the next prompt once and says what it will cost.

const MIN_TOKENS = 150_000
const KEEP_WARM_AFTER_MS = 50 * 60_000
const COLD_AFTER_MS = 60 * 60_000
const MAX_PINGS = 4 // ~3.3 hours of idle at most
const CONFIRM_WINDOW_MS = 3 * 60_000
const TICK_MS = 60_000

export const kTokens = (n: number) => `${Math.round(n / 1000)}K`

export const coldMessage = (idleMin: number, tokens: number) =>
  `cache-guard: кешът е изстинал (последна заявка преди ${idleMin} мин). Следващото изпращане ще запише наново ~${kTokens(tokens)} токена, около 20 пъти цената на нормален ход. Изпрати пак до 3 мин, за да продължиш, или /handoff, или /compact.`

async function contextTokens($: EngineInterface) {
  return (await $.session.usage()).context.tokens ?? 0
}

export const register: Register = on => {
  let lastWarmAt = 0
  let pings = 0
  let busy = false
  let keepWarm = true
  let confirmUntil = 0

  on('session.start', async ($, e, next) => {
    lastWarmAt = await $.clock.now()
    await $.command.register({ name: 'keepwarm', description: 'Prompt-cache keep-warm while idle: on, off or status', argumentHint: '[on|off]', immediate: true })

    $.clock.every(TICK_MS, async () => {
      if (!keepWarm || busy || pings >= MAX_PINGS) return
      const now = await $.clock.now()
      if (now - lastWarmAt < KEEP_WARM_AFTER_MS) return
      const tokens = await contextTokens($)
      if (tokens < MIN_TOKENS) return
      const r = await $.model.fork({ prompt: 'Keep-alive ping from the cache-guard mod. Reply with the single word: ok' })
      const read = 'usage' in r ? r.usage.cache_read_input_tokens ?? 0 : 0
      if (r.isAnswered && read >= tokens * 0.5) {
        pings += 1
        lastWarmAt = await $.clock.now()
        $.ui.status(`cache kept warm ×${pings} (${kTokens(read)} read)`)
      } else {
        // The entry had lapsed already (5-minute TTL, or /model): pinging on costs more than it saves.
        keepWarm = false
        $.ui.status(undefined)
        $.ui.toast('cache-guard: the cache had already lapsed; keep-warm is off for this session')
      }
    })
    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    busy = true
    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    const result = yield* next(e)
    if (e.agentId === undefined) {
      lastWarmAt = await $.clock.now()
      pings = 0
      $.ui.status(undefined)
    }
    return result
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) busy = false
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    if (e.origin?.kind === 'plugin' || e.turnId !== undefined) return next(e)
    const now = await $.clock.now()
    const idle = now - lastWarmAt
    if (idle > COLD_AFTER_MS && now > confirmUntil) {
      const tokens = await contextTokens($)
      if (tokens >= MIN_TOKENS) {
        confirmUntil = now + CONFIRM_WINDOW_MS
        return { drop: coldMessage(Math.round(idle / 60_000), tokens) }
      }
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'keepwarm' }, async ($, e) => {
    const arg = e.args.trim()
    if (arg === 'on' || arg === 'off') {
      keepWarm = arg === 'on'
      pings = 0
    }
    const idleMin = Math.round(((await $.clock.now()) - lastWarmAt) / 60_000)
    return { text: `keep-warm ${keepWarm ? 'on' : 'off'} · pings ${pings}/${MAX_PINGS} · idle ${idleMin} min · context ${kTokens(await contextTokens($))}` }
  })
}
