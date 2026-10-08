export type Specialist = { name: string; agent: string; team: string; model: string; description: string }
export type Member = Omit<Specialist, 'team'>
export type Team = { name: string; members: Member[] }
export type AgentRun = {
  agentId?: string; type: string; model?: string; part: string | null; description: string
  status: 'running' | 'done' | 'denied'; startedAt: string; endedAt?: string
}
export type Dashboard = 'off' | 'local' | 'fleetq' | 'local+fleetq'
export type Budget = { capUsd: number; spentUsd: number }
// A question for the user that blocks a part; decided only by the user.
export type Question = {
  id: string; part: string | null; class: string; text: string; options: string[]
  askedAt: string; status: 'open' | 'answered'; answer: string | null; answeredAt: string | null
}
// A non-critical choice made without the user, kept so it can be reviewed and reversed.
export type Decision = {
  id: string; part: string | null; class: string; text: string; options: string[]
  jev?: { scores: number[]; mode: 'shadow' | 'decide' }; chosen: string; by: 'agent' | 'jev'; at: string
}
// One /company run. Written to ~/.claude/company-hq/companies/<id>/state.json by
// the session that owns it; the dashboard server and the FleetQ adapter read it.
export type Company = {
  schema: 1; id: string; slug: string; title: string; task: string; kind: string
  machine: string; sessionId: string; dir: string; docsDir: string; dashboard: Dashboard
  status: 'open' | 'closed'; phase: string; note: string; budget: Budget
  teams: Team[]; agents: AgentRun[]; questions: Question[]; decisions: Decision[]
  result: { pr?: string; report?: string }
  seq: number; openedAt: string; updatedAt: string; closedAt: string | null
}
export type Hire = { prompt: string; tools?: string[]; skills?: string[] }

declare module 'claude-code' {
  interface PluginState {
    'company-hq': { companies: Company[]; activeId: string | null }
  }
}
