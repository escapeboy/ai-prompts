export type Meter = {
  tokens?: number
  window: number
  percent?: number
  cacheRead: number
  cacheWrite: number
  usd?: number
  limits: { kind: string; percentUsed: number }[]
}

declare module 'claude-code' {
  interface PluginState {
    'context-meter': { meter: Meter | null; warned: number; isHidden: boolean }
  }
}
