export type AsideEntry = { question: string; answer: string; status: 'asking' | 'done' | 'failed'; cacheRead: number; output: number }

declare module 'claude-code' {
  interface PluginState {
    aside: { entries: AsideEntry[] }
  }
}
