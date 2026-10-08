import type { Register } from 'claude-code'

type Check = { name: string; bucket: string }

const INTERVAL_MS = 60_000
// A watch nobody stops ends on its own, as a background poll loop would not.
const MAX_MS = 2 * 60 * 60_000

export const summarize = (checks: Check[]) => {
  const count = (b: string) => checks.filter(c => c.bucket === b).length
  const pass = count('pass') + count('skipping')
  const fail = count('fail') + count('cancel')
  const pending = count('pending')
  return { pass, fail, pending, isDone: pending === 0, failed: checks.filter(c => c.bucket === 'fail').map(c => c.name) }
}

export const register: Register = on => {
  let timer: { cancel: () => void } | undefined

  const stop = () => {
    timer?.cancel()
    timer = undefined
  }

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'ci-watch',
      description: 'Watch a PR\'s checks in the status line (gh pr checks, once a minute)',
      argumentHint: '[pr|stop]',
      immediate: true,
    })
    return next(e)
  })

  on('command.run', { command: 'ci-watch' }, async ($, e) => {
    const arg = e.args.trim()
    if (arg === 'stop') {
      stop()
      $.ui.status(undefined)
      return { text: 'ci-watch stopped.' }
    }
    stop()

    const cwd = await $.session.cwd()
    const startedAt = await $.clock.now()
    const label = arg ? arg.replace(/^https:\/\/github\.com\/[^/]+\//, '').replace('/pull/', '#') : 'current branch'

    // Resolves true while the watch should go on.
    const poll = async (): Promise<boolean> => {
      const argv = ['gh', 'pr', 'checks', ...(arg ? [arg] : []), '--json', 'name,bucket']
      const ran = await $.process.run(argv, { cwd, timeoutMs: 30_000 })
      let checks: Check[]
      try {
        checks = JSON.parse(ran.stdout) as Check[]
      } catch {
        $.ui.status(`CI ${label}: ${(ran.stderr || ran.stdout).trim().split('\n')[0]?.slice(0, 80) || 'gh failed'}`)
        return false
      }
      const s = summarize(checks)
      $.ui.status(`CI ${label}: ✓${s.pass} ✗${s.fail} …${s.pending}`)
      if (s.isDone) {
        $.ui.toast(s.fail === 0 ? `CI ${label}: all ${s.pass} checks passed` : `CI ${label}: ${s.fail} failed — ${s.failed.join(', ')}`)
        return false
      }
      if ((await $.clock.now()) - startedAt > MAX_MS) {
        $.ui.toast(`CI ${label}: still pending after 2h, watch stopped`)
        return false
      }
      return true
    }

    if (!(await poll())) return { text: `ci-watch ${label}: see the status line.` }
    timer = $.clock.every(INTERVAL_MS, async () => {
      if (!(await poll())) stop()
    })
    return { text: `ci-watch: watching ${label} every minute. /ci-watch stop to end.` }
  })
}
