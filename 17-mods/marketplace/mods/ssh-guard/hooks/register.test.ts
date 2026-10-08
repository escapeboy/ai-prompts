import { expect, test } from 'claude-code/testing'

import { parseRetired, targets } from './register'

const MD = [
  '# log', '',
  '## old app VPS — 203.0.113.10 (vmi0000001, Contabo)', '- x',
  '## build box — 203.0.113.20 (vm2.example.net)',
  '## api-01 — 198.51.100.7 (ssh.example.com)',
  '## How to add a new decommissioned host',
].join('\n')

test('parse retired hosts', async () => {
  const r = parseRetired(MD)
  expect(r.length).toBe(3)
  expect(r[0]!.keys).toEqual(['203.0.113.10'])
  expect(r[1]!.keys).toEqual(['203.0.113.20', 'vm2.example.net'])
  expect(r[2]!.keys).toEqual(['198.51.100.7', 'ssh.example.com'])
})

test('targets', async () => {
  expect(targets('ssh deploy@203.0.113.10 uptime')).toEqual(['203.0.113.10'])
  expect(targets('ssh -p 2222 -o ConnectTimeout=5 buildbox ls')).toEqual(['buildbox'])
  expect(targets('timeout 20 ssh -i ~/.ssh/k root@1.2.3.4')).toEqual(['1.2.3.4'])
  expect(targets('scp ./a.tgz deploy@ssh.example.com:/tmp/')).toEqual(['ssh.example.com'])
  expect(targets('rsync -a ./x/ buildbox:src/x/ && echo ok')).toEqual(['buildbox'])
  expect(targets('curl https://example.com:443/x')).toEqual([])
  expect(targets('git push origin main')).toEqual([])
})
