import type { EngineInterface, Register } from 'claude-code'

// "Check the retired-hosts list before SSH" as a rule instead of a habit. The
// list (option hosts_file) is read at session start, never copied here.
const OVERRIDE = '# decommissioned-ok'
const SSH_OPTS_WITH_VALUE = new Set('bcDEeFIiJLlmOopQRSWw'.split('').map(c => `-${c}`))

export type Retired = { keys: string[]; title: string }

// Each "## <name> — <ip> (<aliases>)" header is one retired host.
export const parseRetired = (md: string): Retired[] =>
  md.split('\n').filter(l => l.startsWith('## ') && /\d+\.\d+\.\d+\.\d+/.test(l)).map(l => {
    const title = l.slice(3).trim()
    const keys = new Set<string>()
    for (const ip of title.match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g) ?? []) keys.add(ip)
    const paren = /\(([^)]*)\)/.exec(title)?.[1] ?? ''
    for (const p of paren.split(/[,\s]+/)) if (/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/i.test(p) && /[.-]/.test(p)) keys.add(p.toLowerCase())
    return { keys: [...keys], title }
  })

const stripUser = (h: string) => h.replace(/^[^@]*@/, '').replace(/^\[|\]$/g, '')

// Hosts a shell command connects to, from ssh/sftp/mosh arguments and
// scp/rsync `host:path` operands.
export const targets = (command: string): string[] => {
  const out = new Set<string>()
  for (const seg of command.split(/&&|\|\||[;|\n]/)) {
    const words = seg.trim().split(/\s+/).filter(Boolean)
    const i = words.findIndex(w => /^(ssh|sftp|mosh)$/.test(w.replace(/^.*\//, '')))
    if (i >= 0) {
      for (let j = i + 1; j < words.length; j++) {
        const w = words[j]!
        if (SSH_OPTS_WITH_VALUE.has(w)) { j++; continue }
        if (w.startsWith('-')) continue
        out.add(stripUser(w))
        break
      }
    }
    if (words.some(w => /^(scp|rsync)$/.test(w.replace(/^.*\//, '')))) {
      for (const w of words) {
        const m = /^(?:[^@\s:/]+@)?([A-Za-z0-9.-]+):/.exec(w)
        if (m && !w.includes('://')) out.add(m[1]!)
      }
    }
  }
  return [...out]
}

async function resolveHost($: EngineInterface, host: string): Promise<string> {
  const ran = await $.process.run(['ssh', '-G', host], { timeoutMs: 5000 })
  return /^hostname (\S+)/m.exec(ran.stdout)?.[1]?.toLowerCase() ?? host.toLowerCase()
}

export const register: Register = (on, options) => {
  let retired: Retired[] = []

  on('session.start', async ($, e, next) => {
    const home = (await $.env.get('HOME')) ?? ''
    const path = String(options.hosts_file ?? '~/.claude/decommissioned_hosts.md').replace(/^~(?=\/)/, home)
    if (await $.fs.exists(path)) retired = parseRetired(await $.fs.read(path))
    return next(e)
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    if (retired.length === 0 || e.command.includes(OVERRIDE)) return next(e)
    for (const host of targets(e.command)) {
      const resolved = await resolveHost($, host)
      const hit = retired.find(r => r.keys.includes(host.toLowerCase()) || r.keys.includes(resolved))
      if (hit) {
        return {
          deny: `ssh-guard: ${host}${resolved !== host.toLowerCase() ? ` (${resolved})` : ''} is a decommissioned host: "${hit.title}" (${String(options.hosts_file)}). If you really mean it (e.g. pulling data before the wipe), add \`${OVERRIDE}\` to the command after the user agrees.`,
        }
      }
    }
    return next(e)
  }).catch(($, e, next) => next(e)) // a guard that cannot read hosts must not block every ssh
}
