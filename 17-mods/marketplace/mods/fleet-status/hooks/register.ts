import type { EngineInterface, Register } from 'claude-code'

// The fleet report (option state_file) is written by a separate triage job;
// on a machine without it the mod stays quiet.
const INTERVAL_MS = 10 * 60_000

export type Fleet = { p1: number; p2: number; p3: number; generated?: string }

export const parseFleet = (md: string): Fleet => {
  const counts = { p1: 0, p2: 0, p3: 0 }
  let section: keyof typeof counts | undefined
  for (const line of md.split('\n')) {
    const h = /^## P([123])\b/.exec(line)
    if (h) {
      section = `p${h[1]}` as keyof typeof counts
      continue
    }
    if (line.startsWith('## ')) section = undefined
    else if (section && /^- \[/.test(line)) counts[section] += 1
  }
  const generated = /_Generated: (\S+)/.exec(md)?.[1]
  return { ...counts, generated }
}

let stateFile = '~/.continuity/FLEET-STATE.md'

async function fleetPath($: EngineInterface) {
  const home = await $.env.get('HOME')
  return home ? stateFile.replace(/^~(?=\/)/, home) : undefined
}

export const register: Register = (on, options) => {
  stateFile = String(options.state_file ?? stateFile)
  let timer: { cancel: () => void } | undefined

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'fleet', description: 'Fleet triage summary from FLEET-STATE.md', argumentHint: '[full]', immediate: true })
    await $.command.register({ name: 'ports', description: 'Listening TCP ports and their processes', immediate: true })

    const path = await fleetPath($)
    const refresh = async () => {
      if (!path || !(await $.fs.exists(path))) return
      const f = parseFleet(await $.fs.read(path))
      $.ui.status(f.p1 + f.p2 > 0 ? `fleet: P1 ${f.p1} · P2 ${f.p2}` : undefined)
    }
    timer?.cancel()
    timer = $.clock.every(INTERVAL_MS, refresh)
    void refresh()
    return next(e)
  })

  on('command.run', { command: 'fleet' }, async ($, e) => {
    const path = await fleetPath($)
    if (!path || !(await $.fs.exists(path))) return { text: `No fleet report at ${stateFile} on this machine.` }
    const md = await $.fs.read(path)
    if (e.args.trim() === 'full') return { text: md }
    const f = parseFleet(md)
    const top = md.split('\n').filter(l => /^- \[/.test(l)).slice(0, 5).map(l => l.replace(/^- \[observed\] /, '  '))
    return { text: `Fleet ${f.generated ?? ''}: P1 ${f.p1} · P2 ${f.p2} · P3 ${f.p3}\n${top.join('\n')}\n/fleet full for everything.` }
  })

  on('command.run', { command: 'ports' }, async $ => {
    const ran = await $.process.run(['lsof', '-nP', '-iTCP', '-sTCP:LISTEN'], { timeoutMs: 15_000 })
    const rows = ran.stdout.split('\n').slice(1).filter(Boolean).map(l => {
      const c = l.split(/\s+/)
      return { cmd: c[0] ?? '', pid: c[1] ?? '', addr: c[8] ?? '' }
    })
    const seen = new Set<string>()
    const lines = rows
      .filter(r => !seen.has(r.pid + r.addr) && seen.add(r.pid + r.addr))
      .sort((a, b) => Number(a.addr.split(':').pop()) - Number(b.addr.split(':').pop()))
      .map(r => `${r.addr.padEnd(24)} ${r.cmd.padEnd(16)} pid ${r.pid}`)
    return { text: lines.length ? lines.join('\n') : 'No listening TCP ports (or lsof failed).' }
  })
}
