import assert from 'node:assert/strict'
import test from 'node:test'
import { handleAnalytics } from '../functions/_analytics-core.js'
import worker from '../worker.js'

function request(body, options = {}) {
  return new Request('https://dp.betaoi.cc/api/analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://dp.betaoi.cc',
      ...options.headers,
    },
    body: JSON.stringify(body),
  })
}

test('analytics accepts a bounded first-party event without personal identifiers', async () => {
  const entries = []
  const response = await handleAnalytics(
    request({
      provider: 'cloudflare',
      event: 'page_view',
      path: '/part/a/linear',
      title: '线性 DP',
      metadata: { region: 'international', ignored: { email: 'never logged' } },
      ts: '2026-07-25T00:00:00.000Z',
    }),
    { log: (entry) => entries.push(entry) },
  )

  assert.equal(response.status, 204)
  assert.equal(entries.length, 1)
  assert.deepEqual(entries[0].metadata, { region: 'international' })
  assert.equal(entries[0].provider, 'cloudflare')
  assert.equal(entries[0].name, 'page_view')
})

test('analytics rejects cross-origin and unsupported provider or event values', async () => {
  const crossOrigin = await handleAnalytics(
    request(
      { provider: 'cloudflare', event: 'page_view', path: '/' },
      { headers: { Origin: 'https://example.com' } },
    ),
  )
  assert.equal(crossOrigin.status, 403)

  const provider = await handleAnalytics(
    request({ provider: 'other', event: 'page_view', path: '/' }),
  )
  assert.equal(provider.status, 422)

  const event = await handleAnalytics(
    request({ provider: 'cloudflare', event: 'email_collected', path: '/' }),
  )
  assert.equal(event.status, 422)
})

test('Cloudflare worker exposes the analytics endpoint and keeps static assets isolated', async () => {
  const env = { ASSETS: { fetch: async () => new Response('asset') } }
  const get = await worker.fetch(new Request('https://dp.betaoi.cc/api/analytics'), env)
  assert.equal(get.status, 405)
  assert.equal(get.headers.get('Allow'), 'POST')

  const options = await worker.fetch(
    new Request('https://dp.betaoi.cc/api/analytics', { method: 'OPTIONS' }),
    env,
  )
  assert.equal(options.status, 204)
})

test('analytics provider defers the Cloudflare beacon and keeps Tencent traffic same-origin', async () => {
  const source = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('../src/analytics/index.ts', import.meta.url), 'utf8'),
  )
  assert.match(source, /window\.location\.hostname !== site\.hostname/)
  assert.match(source, /static\.cloudflareinsights\.com\/beacon\.min\.js/)
  assert.match(source, /script\.dataset\.cfBeacon/)
  assert.match(source, /sendFirstPartyEvent\('cloudflare'/)
  assert.match(source, /sendFirstPartyEvent\('tencent-edgeone'/)
  assert.match(source, /navigator\.sendBeacon/)
  assert.match(source, /keepalive:\s*true/)
})
