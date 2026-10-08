export type Specialist = { name: string; agent: string; team: string; model: string; description: string }
export type Spawn = { agentId?: string; type: string; model?: string; description: string; status: 'running' | 'done' | 'denied' }
export type Project = { slug: string; title: string; capUsd: number; spentUsd: number; phase: string; note: string; dir: string }

declare module 'claude-code' {
  interface PluginState {
    'company-hq': { project: Project | null; roster: Specialist[]; spawns: Spawn[] }
  }
}
