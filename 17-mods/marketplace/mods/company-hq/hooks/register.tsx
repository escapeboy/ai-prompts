import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Project, Spawn, Specialist } from '../types'

// Back office of the /company skill (~/.claude/skills/company). The skill
// decides; this mod keeps the books:
// - hire: registers a project specialist as agent type `company-hq:<name>`,
//   usable by the Agent tool and by Workflow `agentType` from the next turn on;
// - every subagent spawn (Workflow agents included) is checked against the
//   project's budget cap and refused past it;
// - a pane shows the phase, the org and the spend.
// State survives sessions in $.store; specialists are registered again at start.

const PANE = 'company'
const project = atom({ plugin: 'company-hq', key: 'project' } as const, null)
const roster = atom({ plugin: 'company-hq', key: 'roster' } as const, [])
const spawns = atom({ plugin: 'company-hq', key: 'spawns' } as const, [])

const MODELS = new Set(['haiku', 'sonnet', 'opus', 'inherit'])
const NAME = /^[a-z][a-z0-9-]{1,40}$/

export const inProject = (cwd: string, dir: string) => cwd === dir || cwd.startsWith(dir.endsWith('/') ? dir : dir + '/')
export const overCap = (p: Project, liveUsd: number) => p.capUsd > 0 && p.spentUsd + liveUsd >= p.capUsd
export const nearCap = (p: Project, liveUsd: number) => p.capUsd > 0 && p.spentUsd + liveUsd >= p.capUsd * 0.8

export const validateHire = (a: Record<string, unknown>): string | undefined => {
  if (typeof a.name !== 'string' || !NAME.test(a.name)) return 'name must be kebab-case, 2-41 chars'
  if (typeof a.prompt !== 'string' || a.prompt.length < 40) return 'prompt (the system prompt) is required, at least 40 chars'
  if (typeof a.description !== 'string' || !a.description) return 'description (when to delegate to it) is required'
  if (typeof a.model !== 'string' || !MODELS.has(a.model)) return 'model must be haiku, sonnet, opus or inherit'
  return undefined
}

async function liveUsd($: EngineInterface, since: number) {
  return Math.max(0, ((await $.session.usage()).cost?.usd ?? since) - since)
}

async function save($: EngineInterface) {
  await $.store.set('project', await read($, project))
  await $.store.set('roster', await read($, roster))
}

async function registerSpecialist($: EngineInterface, s: Specialist, prompt: string, tools?: string[], skills?: string[]) {
  await $.agent.register({
    name: s.name,
    description: `[company/${s.team}] ${s.description}`,
    prompt,
    model: s.model,
    ...(tools?.length ? { tools } : {}),
    ...(skills?.length ? { skills } : {}),
  })
}

const TOOLS = [
  {
    name: 'open_project',
    description: 'company-hq: open (or switch to) a /company project: sets the budget cap that every subagent spawn is checked against and opens the status pane.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'kebab-case project id' },
        title: { type: 'string' },
        capUsd: { type: 'number', description: 'budget cap in USD for all agents of this project; 0 = no cap' },
        dir: { type: 'string', description: 'working directory of the project' },
      },
      required: ['slug', 'title', 'capUsd'],
    },
  },
  {
    name: 'hire',
    description: 'company-hq: hire a project specialist: registers agent type company-hq:<name> with its own system prompt and model. Usable by Agent/Workflow agentType from the NEXT turn.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        team: { type: 'string' },
        description: { type: 'string', description: 'when to delegate to it' },
        prompt: { type: 'string', description: 'its system prompt: role, expertise, owned files, rules, deliverable' },
        model: { type: 'string', enum: ['haiku', 'sonnet', 'opus', 'inherit'] },
        tools: { type: 'array', items: { type: 'string' } },
        skills: { type: 'array', items: { type: 'string' } },
      },
      required: ['name', 'team', 'description', 'prompt', 'model'],
    },
  },
  {
    name: 'set_phase',
    description: 'company-hq: record the current /company phase and a one-line note in the status pane.',
    inputSchema: { type: 'object', properties: { phase: { type: 'string' }, note: { type: 'string' } }, required: ['phase'] },
  },
  {
    name: 'close_project',
    description: 'company-hq: close the active project: returns final spend and the roster (with prompts) so the skill can record it and offer to keep specialists.',
    inputSchema: { type: 'object', properties: {} },
  },
] as const

export const register: Register = on => {
  // Session cost at the last turn end: the base for "spent since".
  let baseUsd = 0
  let warned = false
  const prompts = new Map<string, { prompt: string; tools?: string[]; skills?: string[] }>()

  on('session.start', async ($, e, next) => {
    baseUsd = (await $.session.usage()).cost?.usd ?? 0
    for (const t of TOOLS) await $.tool.register({ ...t, inputSchema: t.inputSchema as never })
    await $.command.register({ name: 'company-status', description: 'Show the /company project pane (phase, org, spend)', immediate: true })

    const p = (await $.store.get('project')) as Project | null | undefined
    const r = ((await $.store.get('roster')) as Specialist[] | undefined) ?? []
    const saved = ((await $.store.get('prompts')) as Record<string, { prompt: string; tools?: string[]; skills?: string[] }> | undefined) ?? {}
    await update($, project, () => p ?? null)
    await update($, roster, () => r)
    for (const s of r) {
      const sp = saved[s.name]
      if (sp) {
        prompts.set(s.name, sp)
        await registerSpecialist($, s, sp.prompt, sp.tools, sp.skills).catch(() => undefined)
      }
    }
    return next(e)
  })

  on('tool.call', { tool: 'mcp__company-hq__open_project' }, async ($, e) => {
    const a = e as unknown as { slug: string; title: string; capUsd: number; dir?: string }
    const cur = await read($, project)
    const same = cur?.slug === a.slug
    const p: Project = {
      slug: a.slug, title: a.title, capUsd: Math.max(0, a.capUsd),
      spentUsd: same ? cur!.spentUsd : 0, phase: same ? cur!.phase : 'intake', note: '', dir: a.dir ?? (await $.session.cwd()),
    }
    baseUsd = (await $.session.usage()).cost?.usd ?? 0
    warned = false
    await update($, project, () => p)
    if (!same) {
      // A new project starts with an empty org; the previous one's hires go.
      await update($, spawns, () => [])
      await update($, roster, () => [])
      prompts.clear()
      await $.store.set('prompts', {})
    }
    await save($)
    void $.ui.open({ id: PANE, title: `Company: ${p.title}` })
    return { result: `Project ${p.slug} open; cap $${p.capUsd || '∞'}; spent so far $${p.spentUsd.toFixed(2)}.` }
  }).catch(() => ({ result: 'company-hq: open_project failed; see claude --debug.' }))

  on('tool.call', { tool: 'mcp__company-hq__hire' }, async ($, e) => {
    const a = e as unknown as { name: string; team: string; description: string; prompt: string; model: string; tools?: string[]; skills?: string[] }
    const bad = validateHire(a as unknown as Record<string, unknown>)
    if (bad) return { result: `hire refused: ${bad}` }
    if (!(await read($, project))) return { result: 'hire refused: open_project first.' }
    const s: Specialist = { name: a.name, agent: `company-hq:${a.name}`, team: a.team, model: a.model, description: a.description }
    await registerSpecialist($, s, a.prompt, a.tools, a.skills)
    prompts.set(a.name, { prompt: a.prompt, tools: a.tools, skills: a.skills })
    await update($, roster, list => [...list.filter(x => x.name !== a.name), s])
    await $.store.set('prompts', Object.fromEntries(prompts))
    await save($)
    return { result: `Hired ${s.agent} (${s.model}) for team ${s.team}. Usable as subagent_type / Workflow agentType from the next turn.` }
  }).catch(() => ({ result: 'company-hq: hire failed; see claude --debug.' }))

  on('tool.call', { tool: 'mcp__company-hq__set_phase' }, async ($, e) => {
    const a = e as unknown as { phase: string; note?: string }
    const p = await read($, project)
    if (!p) return { result: 'No open project.' }
    await update($, project, () => ({ ...p, phase: a.phase, note: a.note ?? '' }))
    await save($)
    return { result: `Phase: ${a.phase}` }
  }).catch(() => ({ result: 'company-hq: set_phase failed; see claude --debug.' }))

  on('tool.call', { tool: 'mcp__company-hq__close_project' }, async $ => {
    const p = await read($, project)
    if (!p) return { result: 'No open project.' }
    const spent = p.spentUsd + (await liveUsd($, baseUsd))
    const r = await read($, roster)
    const out = {
      project: p.slug, title: p.title, capUsd: p.capUsd, spentUsd: Number(spent.toFixed(2)),
      roster: r.map(s => ({ ...s, ...(prompts.get(s.name) ?? {}) })),
      spawns: (await read($, spawns)).length,
    }
    await update($, project, () => null)
    await update($, roster, () => [])
    prompts.clear()
    await $.store.set('prompts', {})
    await save($)
    return { result: JSON.stringify(out) }
  }).catch(() => ({ result: 'company-hq: close_project failed; see claude --debug.' }))

  // Budget cap on every spawn, Workflow agents included.
  on('agent.spawn', async ($, e, next) => {
    // The cap belongs to the project's folder: an abandoned project must not
    // throttle work in other repos.
    const open = await read($, project)
    const p = open && inProject(await $.session.cwd(), open.dir) ? open : null
    if (p) {
      const live = await liveUsd($, baseUsd)
      if (overCap(p, live)) {
        await update($, spawns, list => [...list, { type: e.subagentType, description: e.description, status: 'denied' as const }].slice(-200))
        return { deny: `company-hq: project "${p.slug}" reached its budget cap ($${p.capUsd}). Stop, report progress to the user and ask before spending more.` }
      }
      if (!warned && nearCap(p, live)) {
        warned = true
        $.ui.toast(`company: ${p.slug} at 80% of its $${p.capUsd} cap`)
      }
    }
    const result = await next(e)
    if (p) {
      await update($, spawns, list => [...list, {
        agentId: result.agentId, type: e.subagentType, model: result.deny ? undefined : result.model,
        description: e.description, status: result.deny ? ('denied' as const) : ('running' as const),
      } satisfies Spawn].slice(-200))
    }
    return result
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    const p = await read($, project)
    if (!p) return result
    if (e.agentId !== undefined) {
      await update($, spawns, list => list.map(s => (s.agentId === e.agentId ? { ...s, status: 'done' as const } : s)))
      return result
    }
    const now = (await $.session.usage()).cost?.usd ?? baseUsd
    const delta = Math.max(0, now - baseUsd)
    baseUsd = now
    await update($, project, () => ({ ...p, spentUsd: p.spentUsd + delta }))
    await save($)
    return result
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'company-status' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Company' })
    return {}
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const p = await read($, project)
    if (!p) return <Text dimColor>No open /company project.</Text>
    const r = await read($, roster)
    const s = await read($, spawns)
    const teams = [...new Set(r.map(x => x.team))]
    const running = s.filter(x => x.status === 'running').length
    const pct = p.capUsd ? Math.round((p.spentUsd / p.capUsd) * 100) : 0
    return (
      <Box flexDirection="column">
        <Text bold>{p.title}</Text>
        <Text>phase: {p.phase}{p.note ? ` · ${p.note}` : ''}</Text>
        <Text color={pct >= 80 ? 'red' : undefined}>spent ${p.spentUsd.toFixed(2)}{p.capUsd ? ` of $${p.capUsd} (${pct}%)` : ''} · agents {s.length} ({running} running, {s.filter(x => x.status === 'denied').length} denied)</Text>
        {teams.map(t => (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>{t}</Text>
            {r.filter(x => x.team === t).map(x => <Text>  {x.name} · {x.model} · {x.description.slice(0, 60)}</Text>)}
          </Box>
        ))}
        <Box flexDirection="column" marginTop={1}>
          <Text bold>recent agents</Text>
          {s.slice(-8).map(x => <Text dimColor={x.status !== 'running'}>  {x.status === 'running' ? '▶' : x.status === 'done' ? '✓' : '✗'} {x.type} {x.model ? `(${x.model})` : ''} {x.description.slice(0, 40)}</Text>)}
        </Box>
      </Box>
    )
  })
}
