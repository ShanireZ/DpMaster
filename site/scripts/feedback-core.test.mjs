import assert from 'node:assert/strict'
import test from 'node:test'
import * as feedback from '../functions/_feedback-core.js'

const VALID = {
  kind: '内容错漏',
  page: 'A 背包 DP · 01 背包',
  path: '/part/a/01',
  description: '这里的状态转移公式需要复核',
  contact: '',
  url: 'https://dp.betaoi.cc/part/a/01',
  viewport: '1280×720',
  screen: '2560×1440 @ 2x',
  ua: 'test-agent',
  browser: 'Google Chrome 140.0.0.0',
  device: 'Windows 15.0 / x86 64 位 / 桌面设备',
  locale: 'zh-CN',
  timezone: 'Asia/Shanghai',
  ts: '2026-07-10T10:00:00.000Z',
}

function request(body = VALID, headers = {}, eo) {
  const req = new Request('https://dp.betaoi.cc/api/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://dp.betaoi.cc',
      'CF-Connecting-IP': '203.0.113.42',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  // EdgeOne 运行时把客户端 GEO/IP 挂在 request.eo 上，而不是 HTTP 头。
  if (eo !== undefined) req.eo = eo
  return req
}

function runtime(overrides = {}) {
  const logs = []
  return {
    logs,
    value: {
      now: () => 1_000_000,
      sourceKey: () => 'source-a',
      log: (entry) => logs.push(entry),
      randomUUID: () => 'feedback-test-id',
      limiter: typeof feedback.createFeedbackLimiter === 'function'
        ? feedback.createFeedbackLimiter({ limit: 10, windowMs: 1_800_000 })
        : undefined,
      ...overrides,
    },
  }
}

test('exports a portable feedback limiter', () => {
  assert.equal(typeof feedback.createFeedbackLimiter, 'function')
})

test('rejects a non-JSON content type', async () => {
  const { value } = runtime()
  const response = await feedback.handleFeedback(request(VALID, { 'Content-Type': 'text/plain' }), {}, value)
  assert.equal(response.status, 415)
  assert.equal((await response.json()).error, 'unsupported_media_type')
})

test('rejects malformed JSON with a stable response', async () => {
  const { value } = runtime()
  const response = await feedback.handleFeedback(request('{oops'), {}, value)
  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'bad_json',
    message: '反馈内容不是有效的 JSON',
  })
})

test('rejects cross-origin browser requests', async () => {
  const { value } = runtime()
  const response = await feedback.handleFeedback(request(VALID, { Origin: 'https://evil.example' }), {}, value)
  assert.equal(response.status, 403)
  assert.equal((await response.json()).error, 'forbidden_origin')
})

test('validates kind and field lengths', async () => {
  const { value } = runtime()
  const invalidKind = await feedback.handleFeedback(request({ ...VALID, kind: '随便看看' }), {}, value)
  assert.equal(invalidKind.status, 422)
  assert.equal((await invalidKind.json()).error, 'invalid_kind')

  const tooLong = await feedback.handleFeedback(
    request({ ...VALID, description: 'x'.repeat(2001) }),
    {},
    value,
  )
  assert.equal(tooLong.status, 422)
  assert.equal((await tooLong.json()).error, 'description_too_long')

  for (const oldKind of ['内容有误', '功能问题', '建议', '其他']) {
    const removedKind = await feedback.handleFeedback(request({ ...VALID, kind: oldKind }), {}, value)
    assert.equal(removedKind.status, 422)
    assert.equal((await removedKind.json()).error, 'invalid_kind')
  }
})

test('fails visibly when the delivery webhook is not configured', async () => {
  const { value, logs } = runtime()
  const response = await feedback.handleFeedback(request(), {}, value)
  assert.equal(response.status, 503)
  assert.equal((await response.json()).error, 'delivery_unavailable')
  assert.equal(logs.length, 1)
  assert.equal(logs[0].requestId, 'feedback-test-id')
  assert.equal(logs[0].webhook.status, 'not_configured')
})

test('only returns success after the webhook confirms delivery', async () => {
  const { value } = runtime({ fetch: async () => new Response('{}', { status: 200 }) })
  const response = await feedback.handleFeedback(
    request(),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test', FEEDBACK_WEBHOOK_KIND: 'wecom' },
    value,
  )
  assert.deepEqual(await response.json(), {
    ok: true,
    status: 'delivered',
    forwarded: true,
    requestId: 'feedback-test-id',
  })
})

test('forwards the new schema with automatic diagnostics and server-derived IP', async () => {
  let forwardedBody
  const { value, logs } = runtime({
    fetch: async (_url, init) => {
      forwardedBody = JSON.parse(init.body)
      return new Response('{}', { status: 200 })
    },
  })
  const response = await feedback.handleFeedback(
    request({ ...VALID, steps: '客户端遗留字段不应继续转发', ip: '198.51.100.8' }),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test', FEEDBACK_WEBHOOK_KIND: 'wecom' },
    value,
  )

  assert.equal(response.status, 200)
  assert.equal(logs[0].feedback.ip, '203.0.113.42')
  assert.equal(logs[0].feedback.steps, undefined)
  const text = forwardedBody.text.content
  assert.match(text, /DP大师 · 问题反馈/)
  assert.match(text, /类型：内容错漏/)
  assert.match(text, /网址：https:\/\/dp\.betaoi\.cc\/part\/a\/01/)
  assert.match(text, /浏览器：Google Chrome 140\.0\.0\.0/)
  assert.match(text, /设备：Windows 15\.0/)
  assert.match(text, /视口：1280×720；屏幕：2560×1440 @ 2x/)
  assert.match(text, /IP：203\.0\.113\.42/)
  assert.doesNotMatch(text, /复现|客户端遗留字段/)
  assert.doesNotMatch(text, /198\.51\.100\.8/)
})

test('derives IP from EdgeOne request.eo.clientIp when no platform headers exist', async () => {
  const { value, logs } = runtime({
    fetch: async () => new Response('{}', { status: 200 }),
  })
  // EdgeOne 不注入 cf-connecting-ip / x-real-ip / x-forwarded-for，IP 在 request.eo.clientIp。
  const response = await feedback.handleFeedback(
    request(
      { ...VALID, ip: '198.51.100.8' },
      { 'CF-Connecting-IP': '', 'X-Real-Ip': '', 'X-Forwarded-For': '' },
      { geo: { countryCodeAlpha2: 'CN' }, uuid: 'eo-test', clientIp: '203.0.113.99' },
    ),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test' },
    value,
  )

  assert.equal(response.status, 200)
  assert.equal(logs[0].feedback.ip, '203.0.113.99')
  assert.notEqual(logs[0].feedback.ip, 'anonymous')
})

test('falls back to anonymous on EdgeOne when request.eo is absent', async () => {
  const { value, logs } = runtime({
    fetch: async () => new Response('{}', { status: 200 }),
  })
  const response = await feedback.handleFeedback(
    request(VALID, { 'CF-Connecting-IP': '', 'X-Real-Ip': '', 'X-Forwarded-For': '' }, {}),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test' },
    value,
  )

  assert.equal(response.status, 200)
  assert.equal(logs[0].feedback.ip, 'anonymous')
})

test('returns a retryable failure when the webhook returns non-2xx', async () => {
  const { value, logs } = runtime({ fetch: async () => new Response('failed', { status: 503 }) })
  const response = await feedback.handleFeedback(
    request(),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test' },
    value,
  )
  assert.equal(response.status, 502)
  assert.equal((await response.json()).error, 'delivery_failed')
  assert.equal(logs.at(-1).webhook.status, 'http_error')
  assert.equal(logs.at(-1).webhook.code, 503)
})

test('limits one source to ten requests in a rolling thirty-minute window', () => {
  assert.equal(typeof feedback.createFeedbackLimiter, 'function')
  const limiter = feedback.createFeedbackLimiter({ limit: 10, windowMs: 1_800_000 })
  for (let index = 0; index < 10; index++) {
    assert.equal(limiter.take('source-a', 1_000_000 + index).allowed, true)
  }
  const blocked = limiter.take('source-a', 1_000_100)
  assert.equal(blocked.allowed, false)
  assert.ok(blocked.retryAfter >= 1)
  assert.equal(limiter.take('source-b', 1_000_100).allowed, true)
  assert.equal(limiter.take('source-a', 2_800_010).allowed, true)
})

test('returns 429 and Retry-After for request eleven', async () => {
  assert.equal(typeof feedback.createFeedbackLimiter, 'function')
  const limiter = feedback.createFeedbackLimiter({ limit: 10, windowMs: 1_800_000 })
  const { value } = runtime({
    limiter,
    fetch: async () => new Response('{}', { status: 200 }),
  })
  for (let index = 0; index < 10; index++) {
    const accepted = await feedback.handleFeedback(
      request(),
      { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test' },
      value,
    )
    assert.equal(accepted.status, 200)
  }
  const blocked = await feedback.handleFeedback(
    request(),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test' },
    value,
  )
  assert.equal(blocked.status, 429)
  assert.ok(Number(blocked.headers.get('Retry-After')) >= 1)
  assert.equal((await blocked.json()).error, 'rate_limited')
})
