import assert from 'node:assert/strict'
import test from 'node:test'
import worker from '../worker.js'

const ORIGIN = 'https://dp.round1.cc'

function assetsEnv(extra = {}) {
  return { ASSETS: { fetch: async () => new Response('asset') }, ...extra }
}

test('the worker keeps the feedback route method-safe and leaves assets alone', async () => {
  const env = assetsEnv()
  const get = await worker.fetch(new Request(`${ORIGIN}/api/feedback`), env)
  assert.equal(get.status, 405)
  assert.equal(get.headers.get('Allow'), 'POST')

  const options = await worker.fetch(
    new Request(`${ORIGIN}/api/feedback`, { method: 'OPTIONS' }),
    env,
  )
  assert.equal(options.status, 204)

  const asset = await worker.fetch(new Request(`${ORIGIN}/part/a`), env)
  assert.equal(await asset.text(), 'asset')
})

test('the worker is the only deployment adapter: no Pages or EdgeOne entry points remain', async () => {
  const { readdir } = await import('node:fs/promises')
  const entries = await readdir(new URL('../', import.meta.url))
  assert.equal(entries.includes('functions'), false)
  assert.equal(entries.includes('.edgeone'), false)

  const source = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('../worker.js', import.meta.url), 'utf8'),
  )
  assert.match(source, /env\.ASSETS\.fetch\(request\)/)
  assert.doesNotMatch(source, /functions\//)
})

test('the egress probe does not exist until EGRESS_DIAG_SECRET is configured', async () => {
  const probe = await worker.fetch(
    new Request(`${ORIGIN}/api/_diag/egress`, {
      method: 'POST',
      headers: { 'x-dp-diag-secret': 'anything' },
    }),
    assetsEnv(),
  )
  // 落回静态资源 —— 与任何其他未知路径完全一样，不泄露端点是否存在。
  assert.equal(await probe.text(), 'asset')
})

test('the egress probe rejects a wrong secret the same way it rejects an unknown path', async () => {
  const probe = await worker.fetch(
    new Request(`${ORIGIN}/api/_diag/egress`, {
      method: 'POST',
      headers: { 'x-dp-diag-secret': 'wrong-secret' },
    }),
    assetsEnv({ EGRESS_DIAG_SECRET: 'right-secret' }),
  )
  assert.equal(await probe.text(), 'asset')

  const missingHeader = await worker.fetch(
    new Request(`${ORIGIN}/api/_diag/egress`, { method: 'POST' }),
    assetsEnv({ EGRESS_DIAG_SECRET: 'right-secret' }),
  )
  assert.equal(await missingHeader.text(), 'asset')
})

test('the egress probe is POST-only once authenticated', async () => {
  const probe = await worker.fetch(
    new Request(`${ORIGIN}/api/_diag/egress`, {
      method: 'GET',
      headers: { 'x-dp-diag-secret': 'right-secret' },
    }),
    assetsEnv({ EGRESS_DIAG_SECRET: 'right-secret' }),
  )
  assert.equal(probe.status, 405)
  assert.equal(probe.headers.get('Allow'), 'POST')
})
