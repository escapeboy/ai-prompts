import type { Register } from 'claude-code'

// Model routing policy: Opus only for judgement-heavy agents, Haiku for
// mechanical ones, Sonnet for the rest. Agent frontmatter says the same, but a
// plugin update can overwrite it; this table keeps the policy in force anyway.
const POLICY: Record<string, string> = {
  'adversarial-verifier': 'opus',
  'plan-challenger': 'opus',
  'security-engineer': 'opus',
  'system-architect': 'opus',
  'business-panel-experts': 'opus',
  'icon-manager': 'haiku',
  'loop-monitor': 'haiku',
  'output-evaluator': 'haiku',
  'repo-index': 'haiku',
  'requirements-analyst': 'haiku',
  'technical-writer': 'haiku',
  // Built-in catch-alls inherit the parent's model otherwise, which is Opus
  // whenever the main session runs on Opus.
  'general-purpose': 'sonnet',
  claude: 'sonnet',
}

const LOG_KEY = 'spawns'
const LOG_MAX = 500

export type SpawnRecord = {
  at: number
  type: string
  asked?: string
  set?: string
  ran?: string
  cwd: string
}

export const policyModel = (subagentType: string, asked: string | undefined): string | undefined =>
  asked === undefined ? POLICY[subagentType] : undefined

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'agent-models',
      description: 'Show the last subagent spawns and the model each ran on',
      argumentHint: '[count]',
    })
    return next(e)
  })

  on('agent.spawn', async ($, e, next) => {
    // An explicit `model` from the caller wins; forks always inherit.
    const set = e.fork ? undefined : policyModel(e.subagentType, e.model)
    const result = await next(set ? { ...e, model: set } : e)

    const log = ((await $.store.get(LOG_KEY)) as SpawnRecord[] | undefined) ?? []
    log.push({
      at: await $.clock.now(),
      type: e.subagentType,
      asked: e.model,
      set,
      ran: result.deny === undefined ? result.model : undefined,
      cwd: await $.session.cwd(),
    })
    await $.store.set(LOG_KEY, log.slice(-LOG_MAX))
    return result
  }).catch(($, e, next) => next(e)) // a failure here must never stop a subagent

  on('command.run', { command: 'agent-models' }, async ($, e) => {
    const count = Number(e.args) || 20
    const log = ((await $.store.get(LOG_KEY)) as SpawnRecord[] | undefined) ?? []
    if (log.length === 0) return { text: 'No subagent spawns recorded yet.' }
    const lines = log.slice(-count).map(r => {
      const when = new Date(r.at).toISOString().slice(5, 16).replace('T', ' ')
      const how = r.set ? `policy → ${r.set}` : r.asked ? `asked ${r.asked}` : 'own/inherit'
      return `${when}  ${r.type.padEnd(28)} ${(r.ran ?? 'denied').padEnd(22)} ${how}`
    })
    return { text: `Last ${lines.length} of ${log.length} spawns:\n${lines.join('\n')}` }
  })
}
