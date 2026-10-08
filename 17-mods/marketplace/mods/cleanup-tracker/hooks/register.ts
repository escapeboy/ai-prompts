import type { Register } from 'claude-code'

// Feedback memory "Води списък за разчистване": everything downloaded, installed
// or started goes on a list the moment it happens, and is deleted only after
// the user confirms. This records it without relying on Claude to remember.
const KINDS: [string, RegExp][] = [
  ['download', /\bcurl\b[^|;&]*\s(-o|-O|--output|--remote-name)\b/],
  ['download', /\bwget\s/],
  ['download', /\byt-dlp\s/],
  ['download', /\bgh\s+release\s+download\b/],
  ['clone', /\bgit\s+clone\s/],
  ['docker', /\bdocker\s+(pull|run|create)\s/],
  ['docker', /\bdocker[- ]compose\b[^|;&]*\sup\b/],
  ['docker', /\bdocker\s+volume\s+create\s/],
  ['install', /\bbrew\s+(install|tap)\s/],
  ['install', /\bnpm\s+(i|install|add)\s+(-g|--global)\b/],
  ['install', /\b(pipx|uv\s+tool)\s+install\s/],
  ['install', /\bpip3?\s+install\s/],
  ['install', /\b(cargo|go)\s+install\s/],
  ['launchd', /\blaunchctl\s+(load|bootstrap)\s/],
]

export type Entry = { at: number; kind: string; cwd: string; cmd: string }

const KEY = 'entries'
const MAX = 1000

export const classify = (command: string): string | undefined => KINDS.find(([, re]) => re.test(command))?.[0]

export const toMarkdown = (entries: Entry[]): string => {
  const byKind = new Map<string, Entry[]>()
  for (const e of entries) byKind.set(e.kind, [...(byKind.get(e.kind) ?? []), e])
  const out = ['# CLEANUP', '', '_Recorded by the cleanup-tracker mod. Delete only after confirmation._', '']
  for (const [kind, list] of byKind) {
    out.push(`## ${kind}`, '')
    for (const e of list) out.push(`- ${new Date(e.at).toISOString().slice(0, 16).replace('T', ' ')} \`${e.cmd}\` (in ${e.cwd})`)
    out.push('')
  }
  return out.join('\n')
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'cleanup-list',
      description: 'List downloads, installs and containers recorded for cleanup',
      argumentHint: '[write|clear]',
      immediate: true,
    })
    return next(e)
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const ran = await next(e)
    const kind = classify(e.command)
    if (kind !== undefined && ran.deny === undefined && ran.isError !== true) {
      const entries = ((await $.store.get(KEY)) as Entry[] | undefined) ?? []
      entries.push({ at: await $.clock.now(), kind, cwd: await $.session.cwd(), cmd: e.command.slice(0, 300) })
      await $.store.set(KEY, entries.slice(-MAX))
    }
    return ran
  }).catch(($, e, next) => next(e)) // recording is best effort; never block the command

  on('command.run', { command: 'cleanup-list' }, async ($, e) => {
    const entries = ((await $.store.get(KEY)) as Entry[] | undefined) ?? []
    const arg = e.args.trim()
    if (arg === 'clear') {
      await $.store.set(KEY, [])
      return { text: `Cleared ${entries.length} entries. Nothing on disk was deleted.` }
    }
    if (entries.length === 0) return { text: 'Nothing recorded.' }
    const md = toMarkdown(entries)
    if (arg === 'write') {
      const path = `${await $.session.cwd()}/CLEANUP.md`
      if (await $.fs.exists(path)) return { text: `${path} already exists; not overwriting.\n\n${md}` }
      await $.fs.write(path, md)
      return { text: `Wrote ${entries.length} entries to ${path}.` }
    }
    return { text: md }
  })
}
