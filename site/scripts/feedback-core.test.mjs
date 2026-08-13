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

function request(body = VALID, headers = {}, eo, url = 'https://dp.betaoi.cc/api/feedback') {
  const req = new Request(url, {
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

test('accepts the allowlisted .cc origin on the .cn endpoint and echoes CORS headers', async () => {
  const { value } = runtime({
    fetch: async () => new Response('{}', { status: 200 }),
  })
  // .cc 浏览器跨域直连 .cn：origin 为 dp.betaoi.cc、URL 为 dp.betaoi.cn。
  const response = await feedback.handleFeedback(
    request(
      VALID,
      { Origin: 'https://dp.betaoi.cc', 'CF-Connecting-IP': '' },
      { geo: { countryCodeAlpha2: 'CN' }, uuid: 'eo-test', clientIp: '9.9.9.9' },
      'https://dp.betaoi.cn/api/feedback',
    ),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test' },
    value,
  )

  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://dp.betaoi.cc')
  assert.match(response.headers.get('Vary') || '', /Origin/)
})

test('denies non-allowlisted origins on the .cn endpoint without CORS headers', async () => {
  const { value } = runtime({
    fetch: async () => new Response('{}', { status: 200 }),
  })
  const response = await feedback.handleFeedback(
    request(
      VALID,
      { Origin: 'https://evil.example' },
      undefined,
      'https://dp.betaoi.cn/api/feedback',
    ),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test' },
    value,
  )

  assert.equal(response.status, 403)
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null)
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

test('derives IP from EdgeOne request.eo.clientIp, ignoring forgeable headers', async () => {
  const { value, logs } = runtime({
    fetch: async () => new Response('{}', { status: 200 }),
  })
  // EdgeOne 不注入 IP 头：客户端伪造的 cf-connecting-ip / x-real-ip / x-forwarded-for
  // 必须被忽略，只信平台属性 request.eo.clientIp。
  const response = await feedback.handleFeedback(
    request(
      { ...VALID, ip: '198.51.100.8' },
      { 'CF-Connecting-IP': '6.6.6.6', 'X-Real-Ip': '6.6.6.6', 'X-Forwarded-For': '6.6.6.6' },
      { geo: { countryCodeAlpha2: 'CN' }, uuid: 'eo-test', clientIp: '203.0.113.99' },
    ),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test' },
    value,
  )

  assert.equal(response.status, 200)
  assert.equal(logs[0].feedback.ip, '203.0.113.99')
  assert.notEqual(logs[0].feedback.ip, 'anonymous')
})

test('falls back to anonymous on EdgeOne when eo.clientIp is absent', async () => {
  const { value, logs } = runtime({
    fetch: async () => new Response('{}', { status: 200 }),
  })
  // eo 存在但 clientIp 缺失，以及 eo 完全不存在，都应回退 anonymous。
  for (const eo of [{}, undefined]) {
    const response = await feedback.handleFeedback(
      request(VALID, { 'CF-Connecting-IP': '', 'X-Real-Ip': '', 'X-Forwarded-For': '' }, eo),
      { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test' },
      value,
    )
    assert.equal(response.status, 200)
  }
  assert.ok(
    logs
      .filter((entry) => entry.event === 'feedback_received')
      .every((entry) => entry.feedback.ip === 'anonymous'),
  )
})

test('rate-limits EdgeOne submitters by eo.clientIp, not a shared anonymous bucket', async () => {
  const limiter = feedback.createFeedbackLimiter({ limit: 1, windowMs: 1_800_000 })
  // 不注入 sourceKey：生产 EdgeOne 路径的限流键就是推导出的 IP。
  const { value } = runtime({ limiter, sourceKey: undefined })
  const edgeOneRequest = (clientIp) =>
    request(
      VALID,
      { 'CF-Connecting-IP': '', 'X-Real-Ip': '', 'X-Forwarded-For': '' },
      { geo: { countryCodeAlpha2: 'CN' }, uuid: 'eo-test', clientIp },
    )

  // 无 webhook 配置时，限流通过后才会走到 503 delivery_unavailable。
  const first = await feedback.handleFeedback(edgeOneRequest('203.0.113.1'), {}, value)
  assert.equal(first.status, 503)

  // 同一 IP 的第二次提交命中限流（429），而不是共享 anonymous 桶。
  const second = await feedback.handleFeedback(edgeOneRequest('203.0.113.1'), {}, value)
  assert.equal(second.status, 429)

  // 不同 IP 拥有独立限流桶，不受影响。
  const other = await feedback.handleFeedback(edgeOneRequest('203.0.113.2'), {}, value)
  assert.equal(other.status, 503)
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

test('accepts a trusted relay request and uses the forwarded client IP', async () => {
  const { value, logs } = runtime({
    fetch: async () => new Response('{}', { status: 200 }),
  })
  // .cn 收到 .cc 的可信转发：即使 EdgeOne 平台给了 eo.clientIp（Cloudflare 出口 IP），
  // 密钥匹配时也必须用转发头里的原始客户端 IP 作为展示 IP 与限流键。
  const response = await feedback.handleFeedback(
    request(
      VALID,
      {
        'CF-Connecting-IP': '',
        'X-Dp-Relay-Secret': 'relay-secret-123',
        'X-Dp-Client-Ip': '203.0.113.77',
      },
      { geo: { countryCodeAlpha2: 'CN' }, uuid: 'eo-test', clientIp: '9.9.9.9' },
    ),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test', FEEDBACK_RELAY_SECRET: 'relay-secret-123' },
    value,
  )

  assert.equal(response.status, 200)
  assert.equal(logs[0].feedback.ip, '203.0.113.77')
})

test('ignores relay headers when the shared secret does not match', async () => {
  const { value, logs } = runtime({
    fetch: async () => new Response('{}', { status: 200 }),
  })
  const response = await feedback.handleFeedback(
    request(
      VALID,
      { 'X-Dp-Relay-Secret': 'wrong-secret', 'X-Dp-Client-Ip': '203.0.113.77' },
      { geo: { countryCodeAlpha2: 'CN' }, uuid: 'eo-test', clientIp: '9.9.9.9' },
    ),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test', FEEDBACK_RELAY_SECRET: 'right-secret' },
    value,
  )

  assert.equal(response.status, 200)
  assert.equal(logs[0].feedback.ip, '9.9.9.9')
})

test('relays feedback to FEEDBACK_RELAY_URL with secret and client IP', async () => {
  let relayRequest
  const { value, logs } = runtime({
    fetch: async (url, init) => {
      relayRequest = { url, init }
      return new Response(
        JSON.stringify({ ok: true, status: 'delivered', requestId: 'relayed-id' }),
        { status: 200 },
      )
    },
  })
  const response = await feedback.handleFeedback(
    request(VALID),
    {
      FEEDBACK_RELAY_URL: 'https://dp.betaoi.cn/api/feedback',
      FEEDBACK_RELAY_SECRET: 'relay-secret-123',
    },
    value,
  )

  assert.equal(response.status, 200)
  assert.equal((await response.json()).requestId, 'relayed-id')
  assert.equal(relayRequest.url, 'https://dp.betaoi.cn/api/feedback')
  assert.equal(relayRequest.init.headers['x-dp-relay-secret'], 'relay-secret-123')
  assert.equal(relayRequest.init.headers['x-dp-client-ip'], '203.0.113.42')
  assert.equal(relayRequest.init.body, JSON.stringify(VALID))
  assert.equal(logs[0].webhook.status, 'relay_pending')
  assert.ok(logs.some((entry) => entry.event === 'feedback_relay'))
})

test('propagates 429 from the relay as rate_limited', async () => {
  const { value } = runtime({
    fetch: async () =>
      new Response(JSON.stringify({ ok: false, error: 'rate_limited' }), { status: 429 }),
  })
  const response = await feedback.handleFeedback(
    request(VALID),
    {
      FEEDBACK_RELAY_URL: 'https://dp.betaoi.cn/api/feedback',
      FEEDBACK_RELAY_SECRET: 'relay-secret-123',
    },
    value,
  )

  assert.equal(response.status, 429)
  assert.equal((await response.json()).error, 'rate_limited')
})

test('fails visibly when the relay cannot be reached', async () => {
  const { value } = runtime({
    fetch: async () => {
      throw new Error('relay unreachable')
    },
  })
  const response = await feedback.handleFeedback(
    request(VALID),
    {
      FEEDBACK_RELAY_URL: 'https://dp.betaoi.cn/api/feedback',
      FEEDBACK_RELAY_SECRET: 'relay-secret-123',
    },
    value,
  )

  assert.equal(response.status, 502)
  assert.equal((await response.json()).error, 'delivery_failed')
})

test('falls back to platform IP when a trusted relay omits the client IP', async () => {
  const { value, logs } = runtime({
    fetch: async () => new Response('{}', { status: 200 }),
  })
  const response = await feedback.handleFeedback(
    request(
      VALID,
      { 'X-Dp-Relay-Secret': 'relay-secret-123' },
      { geo: { countryCodeAlpha2: 'CN' }, uuid: 'eo-test', clientIp: '9.9.9.9' },
    ),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test', FEEDBACK_RELAY_SECRET: 'relay-secret-123' },
    value,
  )

  assert.equal(response.status, 200)
  assert.equal(logs[0].feedback.ip, '9.9.9.9')
})

test('rejects a non-literal client IP from a trusted relay', async () => {
  const { value, logs } = runtime({
    fetch: async () => new Response('{}', { status: 200 }),
  })
  const response = await feedback.handleFeedback(
    request(
      VALID,
      { 'X-Dp-Relay-Secret': 'relay-secret-123', 'X-Dp-Client-Ip': '9.9.9.9, evil' },
      { geo: { countryCodeAlpha2: 'CN' }, uuid: 'eo-test', clientIp: '9.9.9.9' },
    ),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test', FEEDBACK_RELAY_SECRET: 'relay-secret-123' },
    value,
  )

  assert.equal(response.status, 200)
  assert.equal(logs[0].feedback.ip, '9.9.9.9')
})

test('never forwards a trusted relay request again, even when relay is misconfigured', async () => {
  let forwardedUrl
  const { value } = runtime({
    fetch: async (url) => {
      forwardedUrl = url
      return new Response('{}', { status: 200 })
    },
  })
  // 模拟 .cn 被误配了 FEEDBACK_RELAY_URL：已命中可信转发的请求必须走 webhook 直达，
  // 而不是再次被转发出去（防止转发循环）。
  const response = await feedback.handleFeedback(
    request(
      VALID,
      { 'X-Dp-Relay-Secret': 'relay-secret-123', 'X-Dp-Client-Ip': '203.0.113.77' },
      { geo: { countryCodeAlpha2: 'CN' }, uuid: 'eo-test', clientIp: '9.9.9.9' },
    ),
    {
      FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test',
      FEEDBACK_RELAY_URL: 'https://dp.betaoi.cn/api/feedback',
      FEEDBACK_RELAY_SECRET: 'relay-secret-123',
    },
    value,
  )

  assert.equal(response.status, 200)
  assert.equal(forwardedUrl, 'https://hooks.example.test')
})

test('returns 502 and relays the failure alert through the relay channel', async () => {
  const fetches = []
  let relayCalls = 0
  const { value, logs } = runtime({
    errorLog: (entry) => logs.push(entry),
    fetch: async (url, init) => {
      fetches.push({ url, init })
      if (url === 'https://dp.betaoi.cn/api/feedback') {
        relayCalls++
        // 第一次调用是反馈 relay（失败），第二次是告警 relay（成功）。
        return relayCalls === 1
          ? new Response(JSON.stringify({ ok: false, error: 'delivery_failed' }), { status: 502 })
          : new Response(JSON.stringify({ ok: true, status: 'alerted' }), { status: 200 })
      }
      return new Response('{}', { status: 200 })
    },
  })
  const response = await feedback.handleFeedback(
    request(VALID),
    {
      FEEDBACK_RELAY_URL: 'https://dp.betaoi.cn/api/feedback',
      FEEDBACK_RELAY_SECRET: 'relay-secret-123',
      ALERT_WEBHOOK_URL: 'https://alert.example.test',
    },
    value,
  )

  assert.equal(response.status, 502)
  assert.equal((await response.json()).error, 'delivery_failed')
  assert.ok(logs.some((entry) => entry.event === 'feedback_delivery_failed'))
  const alertCall = fetches.find(({ init }) => init.headers['x-dp-relay-kind'] === 'alert')
  assert.ok(alertCall)
  assert.equal(alertCall.url, 'https://dp.betaoi.cn/api/feedback')
  assert.equal(alertCall.init.headers['x-dp-relay-secret'], 'relay-secret-123')
  assert.match(JSON.parse(alertCall.init.body).text, /反馈通道异常/)
})

test('does not call the direct webhook when relay is configured', async () => {
  const fetches = []
  const { value } = runtime({
    fetch: async (url) => {
      fetches.push(url)
      return new Response(JSON.stringify({ ok: true, status: 'delivered', requestId: 'relayed-id' }), { status: 200 })
    },
  })
  const response = await feedback.handleFeedback(
    request(VALID),
    {
      FEEDBACK_RELAY_URL: 'https://dp.betaoi.cn/api/feedback',
      FEEDBACK_RELAY_SECRET: 'relay-secret-123',
      FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test',
    },
    value,
  )

  assert.equal(response.status, 200)
  assert.deepEqual(fetches, ['https://dp.betaoi.cn/api/feedback'])
})

test('a forged relay IP cannot shift the limiter bucket without the secret', async () => {
  const limiter = feedback.createFeedbackLimiter({ limit: 1, windowMs: 1_800_000 })
  const { value } = runtime({
    limiter,
    sourceKey: undefined,
    fetch: async () => new Response('{}', { status: 200 }),
  })
  const forged = (clientIp) =>
    request(
      VALID,
      { 'X-Dp-Relay-Secret': 'wrong-secret', 'X-Dp-Client-Ip': clientIp },
      { geo: { countryCodeAlpha2: 'CN' }, uuid: 'eo-test', clientIp: '9.9.9.9' },
    )

  const first = await feedback.handleFeedback(
    forged('203.0.113.77'),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test', FEEDBACK_RELAY_SECRET: 'right-secret' },
    value,
  )
  assert.equal(first.status, 200)

  // 换一个伪造 IP 再提交：限流键必须仍是平台 IP（9.9.9.9），而不是伪造值。
  const second = await feedback.handleFeedback(
    forged('203.0.113.78'),
    { FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test', FEEDBACK_RELAY_SECRET: 'right-secret' },
    value,
  )
  assert.equal(second.status, 429)
})

test('forwards a trusted alert relay to the local ALERT_WEBHOOK_URL', async () => {
  let alerted
  const { value, logs } = runtime({
    fetch: async (url, init) => {
      alerted = { url, init }
      return new Response('{}', { status: 200 })
    },
  })
  // .cn 收到 .cc 的告警 relay：密钥匹配 + kind=alert + body{text} → 转发到本地告警机器人。
  const response = await feedback.handleFeedback(
    request(
      { text: 'DP大师反馈通道异常\n编号：abc' },
      { 'X-Dp-Relay-Secret': 'relay-secret-123', 'X-Dp-Relay-Kind': 'alert' },
      { geo: { countryCodeAlpha2: 'CN' }, uuid: 'eo-test', clientIp: '9.9.9.9' },
    ),
    {
      FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test',
      FEEDBACK_RELAY_SECRET: 'relay-secret-123',
      ALERT_WEBHOOK_URL: 'https://alert.example.test',
    },
    value,
  )

  assert.equal(response.status, 200)
  assert.equal((await response.json()).status, 'alerted')
  assert.equal(alerted.url, 'https://alert.example.test')
  assert.match(JSON.parse(alerted.init.body).text.content, /反馈通道异常/)
  assert.ok(logs.some((entry) => entry.event === 'alert_relay_received'))
})

test('rejects an alert relay when no alert channel is configured', async () => {
  const { value } = runtime({
    fetch: async () => new Response('{}', { status: 200 }),
  })
  const response = await feedback.handleFeedback(
    request(
      { text: 'DP大师前端告警' },
      { 'X-Dp-Relay-Secret': 'relay-secret-123', 'X-Dp-Relay-Kind': 'alert' },
      { geo: { countryCodeAlpha2: 'CN' }, uuid: 'eo-test', clientIp: '9.9.9.9' },
    ),
    {
      FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test',
      FEEDBACK_RELAY_SECRET: 'relay-secret-123',
    },
    value,
  )

  assert.equal(response.status, 503)
  assert.equal((await response.json()).error, 'delivery_unavailable')
})

test('falls through to feedback validation when the alert relay secret is wrong', async () => {
  const { value } = runtime({
    fetch: async () => new Response('{}', { status: 200 }),
  })
  const response = await feedback.handleFeedback(
    request(
      { text: 'DP大师前端告警' },
      { 'X-Dp-Relay-Secret': 'wrong-secret', 'X-Dp-Relay-Kind': 'alert' },
      { geo: { countryCodeAlpha2: 'CN' }, uuid: 'eo-test', clientIp: '9.9.9.9' },
    ),
    {
      FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test',
      FEEDBACK_RELAY_SECRET: 'right-secret',
      ALERT_WEBHOOK_URL: 'https://alert.example.test',
    },
    value,
  )

  // 告警 body 不是反馈格式，密钥又不匹配：必须走正常反馈校验并拒绝。
  assert.equal(response.status, 422)
  assert.equal((await response.json()).error, 'invalid_kind')
})

test('never forwards an alert relay again, even when relay is misconfigured', async () => {
  const fetches = []
  const { value } = runtime({
    fetch: async (url, init) => {
      fetches.push({ url, init })
      return new Response('{}', { status: 200 })
    },
  })
  // .cn 被误配 FEEDBACK_RELAY_URL 时，告警 relay 必须直接送本地告警机器人，绝不二次转发。
  const response = await feedback.handleFeedback(
    request(
      { text: 'DP大师前端告警' },
      { 'X-Dp-Relay-Secret': 'relay-secret-123', 'X-Dp-Relay-Kind': 'alert' },
      { geo: { countryCodeAlpha2: 'CN' }, uuid: 'eo-test', clientIp: '9.9.9.9' },
    ),
    {
      FEEDBACK_WEBHOOK_URL: 'https://hooks.example.test',
      FEEDBACK_RELAY_URL: 'https://dp.betaoi.cn/api/feedback',
      FEEDBACK_RELAY_SECRET: 'relay-secret-123',
      ALERT_WEBHOOK_URL: 'https://alert.example.test',
    },
    value,
  )

  assert.equal(response.status, 200)
  assert.equal((await response.json()).status, 'alerted')
  assert.deepEqual(fetches.map(({ url }) => url), ['https://alert.example.test'])
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
