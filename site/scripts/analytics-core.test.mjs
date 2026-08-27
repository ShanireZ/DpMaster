import assert from 'node:assert/strict'
import test from 'node:test'
import { handleAnalytics } from '../worker/analytics-core.js'
import worker from '../worker.js'

function request(body, options = {}) {
  return new Request(options.url ?? 'https://dp.round1.cc/api/analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://dp.round1.cc',
      ...options.headers,
    },
    body: JSON.stringify(body),
  })
}

test('analytics accepts a bounded first-party event without personal identifiers', async () => {
  const entries = []
  const points = []
  const response = await handleAnalytics(
    request({
      provider: 'cloudflare',
      event: 'page_view',
      path: '/part/a/linear',
      title: '线性 DP',
      metadata: { region: 'international', ignored: { email: 'never logged' } },
      ts: '2026-07-25T00:00:00.000Z',
    }),
    {
      log: (entry) => entries.push(entry),
      write: (entry) => points.push(entry),
    },
  )

  assert.equal(response.status, 204)
  assert.equal(entries.length, 1)
  assert.deepEqual(entries[0].metadata, { region: 'international' })
  assert.equal(entries[0].provider, 'cloudflare')
  assert.equal(entries[0].name, 'page_view')
  assert.equal(points.length, 1)
})

test('analytics preserves bounded numeric Web Vitals metadata', async () => {
  const entries = []
  const response = await handleAnalytics(
    request({
      provider: 'cloudflare',
      event: 'web_vital',
      path: '/part/a/01',
      title: '01 背包',
      metadata: { name: 'LCP', value: 1480.25, delta: 120.5, rating: 'good' },
      ts: '2026-07-25T00:00:00.000Z',
    }),
    { log: (entry) => entries.push(entry) },
  )

  assert.equal(response.status, 204)
  assert.equal(entries[0].metadata.value, 1480.25)
  assert.equal(entries[0].metadata.name, 'LCP')
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

  for (const retiredEvent of ['lesson_started', 'lesson_completed']) {
    const retired = await handleAnalytics(
      request({ provider: 'cloudflare', event: retiredEvent, path: '/part/a/01' }),
    )
    assert.equal(retired.status, 422)
  }
})

test('Cloudflare worker exposes the analytics endpoint and keeps static assets isolated', async () => {
  const env = { ASSETS: { fetch: async () => new Response('asset') } }
  const get = await worker.fetch(new Request('https://dp.round1.cc/api/analytics'), env)
  assert.equal(get.status, 405)
  assert.equal(get.headers.get('Allow'), 'POST')

  const options = await worker.fetch(
    new Request('https://dp.round1.cc/api/analytics', { method: 'OPTIONS' }),
    env,
  )
  assert.equal(options.status, 204)
})

test('cross-site analytics is rejected outright: the site is single-origin', async () => {
  const env = { ASSETS: { fetch: async () => new Response('asset') } }
  const preflight = await worker.fetch(
    new Request('https://dp.round1.cc/api/analytics', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://evil.example.test',
        'Access-Control-Request-Method': 'POST',
      },
    }),
    env,
  )
  assert.equal(preflight.status, 204)
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), null)

  const response = await handleAnalytics(
    request(
      { provider: 'cloudflare', event: 'page_view', path: '/' },
      { headers: { Origin: 'https://evil.example.test' } },
    ),
    { log: () => {} },
  )
  assert.equal(response.status, 403)
  assert.equal(JSON.parse(await response.text()).error, 'forbidden_origin')
})

test('the single analytics provider stays on the production host and never inject a source beacon', async () => {
  const source = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('../src/analytics/index.ts', import.meta.url), 'utf8'),
  )
  assert.match(
    source,
    /window\.location\.hostname !== CLIENT_RUNTIME\.productionHostname/,
  )
  assert.match(source, /CLIENT_RUNTIME\.analyticsEndpoint/)
  assert.doesNotMatch(source, /static\.cloudflareinsights\.com/)
  assert.doesNotMatch(source, /script\.dataset\.cfBeacon/)
  assert.match(source, /ANALYTICS_PROVIDER = 'cloudflare'/)
  assert.doesNotMatch(source, /tencent-edgeone/)
  assert.match(source, /navigator\.sendBeacon/)
  assert.match(source, /keepalive:\s*true/)
})

test('relays alert events through the relay channel when configured', async () => {
  let alerted
  const response = await handleAnalytics(
    request({
      provider: 'cloudflare',
      event: 'client_error',
      path: '/part/a/01',
      metadata: { message: 'boom' },
    }),
    {
      log: () => {},
      env: {
        FEEDBACK_RELAY_URL: 'https://relay.example.test/api/feedback',
        FEEDBACK_RELAY_SECRET: 'relay-secret-123',
        ALERT_WEBHOOK_URL: 'https://alert.example.test',
      },
      fetch: async (url, init) => {
        alerted = { url, init }
        return new Response(JSON.stringify({ ok: true, status: 'alerted' }), { status: 200 })
      },
    },
  )

  assert.equal(response.status, 204)
  assert.equal(alerted.url, 'https://relay.example.test/api/feedback')
  assert.equal(alerted.init.headers['x-dp-relay-kind'], 'alert')
  assert.equal(alerted.init.headers['x-dp-relay-secret'], 'relay-secret-123')
  assert.match(JSON.parse(alerted.init.body).text, /client_error/)
})

test('alerts directly to the alert webhook when no relay is configured', async () => {
  let alerted
  const response = await handleAnalytics(
    request({
      provider: 'cloudflare',
      event: 'feedback_failed',
      path: '/',
      metadata: { status: 'network' },
    }),
    {
      log: () => {},
      env: { ALERT_WEBHOOK_URL: 'https://alert.example.test' },
      fetch: async (url, init) => {
        alerted = { url, init }
        return new Response('{}', { status: 200 })
      },
    },
  )

  assert.equal(response.status, 204)
  assert.equal(alerted.url, 'https://alert.example.test')
  assert.match(JSON.parse(alerted.init.body).text.content, /feedback_failed/)
})
