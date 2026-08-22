import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_TARGETS,
  handleEgressProbe,
  runEgressProbe,
  secureEqual,
} from '../worker/egress-probe.js'

const ORIGIN = 'https://dp.round1.cc'
const SECRET = 'diag-secret-123'

function probeRequest(body, headers = { 'x-dp-diag-secret': SECRET }) {
  return new Request(`${ORIGIN}/api/_diag/egress`, {
    method: 'POST',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

test('the default target list covers both DingTalk entry points plus controls', () => {
  const hosts = DEFAULT_TARGETS.map((target) => target.host)
  // 老接入点是当前 webhook 用的；新 OpenAPI 是不同接入点，值得单独测一次。
  assert.ok(hosts.includes('oapi.dingtalk.com'))
  assert.ok(hosts.includes('api.dingtalk.com'))
  // 没有对照组就分不清「钉钉不通」和「探针自己坏了」。
  assert.ok(hosts.includes('www.cloudflare.com'))
  assert.equal(new Set(hosts).size, hosts.length)
})

test('every probe reports both egress paths for every target', async () => {
  let clock = 0
  const report = await runEgressProbe(
    [{ host: 'example.test', note: 'unit' }],
    {
      fetchImpl: async () => new Response(null, { status: 204 }),
      loadConnect: async () => null,
      now: () => (clock += 5),
    },
  )

  assert.equal(report.results.length, 1)
  const [entry] = report.results
  assert.equal(entry.host, 'example.test')
  assert.equal(entry.fetch.reachable, true)
  assert.equal(entry.fetch.status, 204)
  // connect() 不可用时如实报告，而不是伪装成「不通」。
  assert.equal(entry.socket.reachable, false)
  assert.match(entry.socket.error, /cloudflare:sockets unavailable/)
})

test('a blocked fetch is reported with its error, not swallowed', async () => {
  const report = await runEgressProbe(
    [{ host: 'blocked.test', note: 'unit' }],
    {
      fetchImpl: async () => {
        throw new TypeError('Network connection lost')
      },
      loadConnect: async () => null,
      now: () => 0,
    },
  )
  assert.equal(report.results[0].fetch.reachable, false)
  assert.match(report.results[0].fetch.error, /Network connection lost/)
})

test('the raw socket path reports the peer status line when TLS succeeds', async () => {
  const written = []
  const fakeConnect = () => ({
    opened: Promise.resolve({ remoteAddress: '203.0.113.7' }),
    writable: {
      getWriter: () => ({
        write: async (chunk) => written.push(new TextDecoder().decode(chunk)),
        releaseLock: () => {},
      }),
    },
    readable: {
      getReader: () => ({
        read: async () => ({
          value: new TextEncoder().encode('HTTP/1.1 200 OK\r\nServer: nginx\r\n\r\n'),
        }),
        releaseLock: () => {},
      }),
    },
    close: async () => {},
  })

  const report = await runEgressProbe(
    [{ host: 'reachable.test', note: 'unit' }],
    { fetchImpl: async () => new Response(null), loadConnect: async () => fakeConnect, now: () => 0 },
  )
  assert.equal(report.results[0].socket.reachable, true)
  assert.equal(report.results[0].socket.statusLine, 'HTTP/1.1 200 OK')
  assert.match(written[0], /^HEAD \/ HTTP\/1\.1/)
  assert.match(written[0], /Host: reachable\.test/)
})

test('the endpoint is invisible without a configured secret and on a mismatch', async () => {
  assert.equal(await handleEgressProbe(probeRequest(), {}), null)
  assert.equal(
    await handleEgressProbe(
      probeRequest(undefined, { 'x-dp-diag-secret': 'nope' }),
      { EGRESS_DIAG_SECRET: SECRET },
    ),
    null,
  )
  assert.equal(
    await handleEgressProbe(probeRequest(undefined, {}), { EGRESS_DIAG_SECRET: SECRET }),
    null,
  )
})

test('an authenticated probe accepts a custom host list and rejects junk', async () => {
  const runtime = {
    fetchImpl: async () => new Response(null, { status: 200 }),
    loadConnect: async () => null,
    now: () => 0,
  }

  const ok = await handleEgressProbe(
    probeRequest({ hosts: ['oapi.dingtalk.com'] }),
    { EGRESS_DIAG_SECRET: SECRET },
    runtime,
  )
  const body = await ok.json()
  assert.equal(ok.status, 200)
  assert.equal(ok.headers.get('x-robots-tag'), 'noindex, nofollow')
  assert.equal(body.results.length, 1)
  assert.equal(body.results[0].host, 'oapi.dingtalk.com')

  const rejected = await handleEgressProbe(
    probeRequest({ hosts: ['not a host/../etc'] }),
    { EGRESS_DIAG_SECRET: SECRET },
    runtime,
  )
  assert.equal(rejected.status, 422)
  assert.equal((await rejected.json()).error, 'no_targets')
})

test('secureEqual compares in constant time and rejects length mismatches', () => {
  assert.equal(secureEqual('abc', 'abc'), true)
  assert.equal(secureEqual('abc', 'abd'), false)
  assert.equal(secureEqual('abc', 'abcd'), false)
  assert.equal(secureEqual('', ''), true)
  assert.equal(secureEqual(null, undefined), true)
})
