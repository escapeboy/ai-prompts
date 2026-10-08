import { expect, test } from 'claude-code/testing'

import { isBlockedPath, mapStrings, Vault } from './register'

test('redacts known shapes and keeps plain text', async () => {
  const v = new Vault()
  const out = v.redact([
    'token ghp_abcdefghijklmnopqrstuvwxyz0123456789',
    'Authorization: Bearer abcdefghijklmnopqrstuvwxyz012345',
    'export SENTRY_AUTH_TOKEN=sntrys_eyJpYXQiOjE3MDAwMDAwMDB9xyz',
    'DB_PASSWORD="hunter22secret"',
    '{"api_key": "AAAAbbbbCCCCdddd"}',
    'SSH was password auth: password `pa55w0rd9` (same pw)',
    'the password field is required',
    'commit 0123456789abcdef0123456789abcdef',
  ].join('\n'))
  expect(out).not.toContain('ghp_abc')
  expect(out).not.toContain('abcdefghijklmnopqrstuvwxyz012345')
  expect(out).not.toContain('hunter22secret')
  expect(out).not.toContain('AAAAbbbbCCCCdddd')
  expect(out).not.toContain('pa55w0rd9')
  expect(out).toContain('the password field is required')
  expect(out).toContain('0123456789abcdef0123456789abcdef')
  expect(out).toContain('Bearer ‹secret:')
})

test('same value, same label; restore round-trips', async () => {
  const v = new Vault()
  const a = v.redact('ghp_abcdefghijklmnopqrstuvwxyz0123456789')
  const b = v.redact('again ghp_abcdefghijklmnopqrstuvwxyz0123456789')
  expect(b).toBe(`again ${a}`)
  expect(v.restore(`curl -H "Authorization: token ${a}"`)).toBe('curl -H "Authorization: token ghp_abcdefghijklmnopqrstuvwxyz0123456789"')
  expect(v.redact(a)).toBe(a)
})

test('private keys', async () => {
  const v = new Vault()
  const out = v.redact('x\n-----BEGIN OPENSSH PRIVATE KEY-----\nAAAA\nBBBB\n-----END OPENSSH PRIVATE KEY-----\ny')
  expect(out).toBe('x\n‹secret:1›\ny')
})

test('mapStrings keeps identity when nothing changes', async () => {
  const o = { a: 'x', b: [1, 'y'], c: { d: true } }
  expect(mapStrings(o, s => s)).toBe(o)
  expect(mapStrings(o, s => s.toUpperCase())).toEqual({ a: 'X', b: [1, 'Y'], c: { d: true } })
})

test('blocked paths', async () => {
  expect(isBlockedPath('/home/me/.config/op/sa-token')).toBe(true)
  expect(isBlockedPath('/home/me/.ssh/id_ed25519')).toBe(true)
  expect(isBlockedPath('/home/me/.ssh/id_ed25519.pub')).toBe(false)
  expect(isBlockedPath('/srv/cert.pem')).toBe(true)
  expect(isBlockedPath('/home/me/README.md')).toBe(false)
})
