import { expect, mock, test } from 'claude-code/testing'

import { classify, toMarkdown } from './register'

test('classify', async () => {
  expect(classify('curl -sL https://x/y.tgz -o /tmp/y.tgz')).toBe('download')
  expect(classify('curl -s https://api.github.com/x | jq .')).toBe(undefined)
  expect(classify('brew install jq')).toBe('install')
  expect(classify('docker run -d --name pg postgres:16')).toBe('docker')
  expect(classify('docker compose -f a.yml up -d')).toBe('docker')
  expect(classify('git clone git@github.com:a/b.git')).toBe('clone')
  expect(classify('git status')).toBe(undefined)
  expect(classify('npm install -g typescript')).toBe('install')
  expect(classify('npm install')).toBe(undefined)
})

test('markdown groups by kind', async () => {
  const md = toMarkdown([
    { at: 0, kind: 'install', cwd: '/a', cmd: 'brew install jq' },
    { at: 0, kind: 'docker', cwd: '/a', cmd: 'docker run x' },
  ])
  expect(md).toContain('## install')
  expect(md).toContain('## docker')
  expect(md).toContain('`brew install jq`')
})

test('/cleanup-list reads the store and clear empties it', async ($, on) => {
  mock.store(on, { entries: [{ at: 0, kind: 'install', cwd: '/a', cmd: 'brew install jq' }] })
  const run = (args: string) => $.command.run({ command: 'cleanup-list', args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })
  expect((await run('')).text).toContain('brew install jq')
  expect((await run('clear')).text).toContain('Cleared 1')
  expect((await run('')).text).toBe('Nothing recorded.')
})
