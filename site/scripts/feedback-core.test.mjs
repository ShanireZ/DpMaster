import assert from 'node:assert/strict'
import test from 'node:test'
import * as feedback from '../functions/_feedback-core.js'

const VALID = {
  kind: '内容有误',
  page: 'A 背包 DP · 01 背包',
  path: '/part/a/01',
  description: '这里的状态转移公式需要复核',
  steps: '打开页面并播放到第三步',
  contact: '',
  url: 'https://dp.betaoi.cc/part/a/01',
  viewport: '1280×720',
  ua: 'test-agent',
  ts: '2026-07-10T10:00:00.000Z',
}

function request(body = VALID, headers = {}) {
  return new Request('https://dp.betaoi.cc/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://dp.betaoi.cc', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
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
})

test('returns logged receipt when webhook is not configured', async () => {
  const { value, logs } = runtime()
  const response = await feedback.handleFeedback(request(), {}, value)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    ok: true,
    status: 'logged',
    forwarded: false,
    requestId: 'feedback-test-id',
  })
  assert.equal(logs.length, 1)
  assert.equal(logs[0].requestId, 'feedback-test-id')
  assert.equal(logs[0].webhook.status, 'not_configured')
})

test('reports webhook success without changing logged semantics', async () => {
  const { value } = runtime({ fetch: async () => new Response('{}', { status: 200 }) })
  const response = await feedback.handleFeedback(
    request(),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test', FEEDBACK_WEBHOOK_KIND: 'wecom' },
    value,
  )
  assert.deepEqual(await response.json(), {
    ok: true,
    status: 'logged',
    forwarded: true,
    requestId: 'feedback-test-id',
  })
})

test('keeps success when webhook returns non-2xx', async () => {
  const { value, logs } = runtime({ fetch: async () => new Response('failed', { status: 503 }) })
  const response = await feedback.handleFeedback(
    request(),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test' },
    value,
  )
  assert.equal(response.status, 200)
  assert.equal((await response.json()).forwarded, false)
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
  const { value } = runtime({ limiter })
  for (let index = 0; index < 10; index++) {
    const accepted = await feedback.handleFeedback(request(), {}, value)
    assert.equal(accepted.status, 200)
  }
  const blocked = await feedback.handleFeedback(request(), {}, value)
  assert.equal(blocked.status, 429)
  assert.ok(Number(blocked.headers.get('Retry-After')) >= 1)
  assert.equal((await blocked.json()).error, 'rate_limited')
})
