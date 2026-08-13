// 反馈处理核心 —— 被 Cloudflare Worker / Pages Functions / EdgeOne 共用。
// 仅依赖 Fetch API 与 Web Crypto；运行时 Adapter 不得复制校验、限流或回执语义。
import { clip, forwardWebhook } from './_webhook-core.js'

const BODY_LIMIT_BYTES = 16_000
const DEFAULT_LIMIT = 10
const DEFAULT_WINDOW_MS = 30 * 60 * 1000
const FEEDBACK_KINDS = new Set(['内容错漏', '显示异常', '其他建议'])
const FIELD_LIMITS = {
  page: 120,
  path: 160,
  description: 2000,
  contact: 120,
  url: 500,
  viewport: 40,
  screen: 80,
  ua: 300,
  browser: 160,
  device: 240,
  locale: 80,
  timezone: 120,
  ts: 40,
}

const json = (body, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  })

const fail = (error, message, status, extraHeaders) =>
  json({ ok: false, error, message }, status, extraHeaders)

const defaultLog = (entry) => console.log('[feedback]', JSON.stringify(entry))
const defaultErrorLog = (entry) => console.error('[feedback]', JSON.stringify(entry))

function sourceFromRequest(request) {
  // 平台注入的客户端 IP 在两个托管商身上的位置不同：
  // - EdgeOne：request.eo.clientIp 运行时属性。该运行时上任何 IP 相关请求头
  //   （含 cf-connecting-ip）都是客户端可伪造的，一律不可信。
  // - Cloudflare：cf-connecting-ip 请求头（Worker 里平台保证注入并覆盖）。
  // x-real-ip / x-forwarded-for 只作为非平台部署的兜底，同样可伪造。
  const eo = request.eo
  if (eo) return String(eo.clientIp || '').trim() || 'anonymous'
  const forwarded = request.headers.get('cf-connecting-ip')
    || request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || 'anonymous'
}

const RELAY_SECRET_HEADER = 'x-dp-relay-secret'
const RELAY_CLIENT_IP_HEADER = 'x-dp-client-ip'

/** 恒定时间字符串比较，避免共享密钥被时序侧信道探测。 */
function secureEqual(a, b) {
  const bytesA = new TextEncoder().encode(String(a || ''))
  const bytesB = new TextEncoder().encode(String(b || ''))
  if (bytesA.length !== bytesB.length) return false
  let diff = 0
  for (let i = 0; i < bytesA.length; i++) diff |= bytesA[i] ^ bytesB[i]
  return diff === 0
}

/**
 * 识别来自 .cc Worker 的可信转发请求。
 * .cc 的 Cloudflare 出口到钉钉 TLS 不通（525），反馈经 .cn 中转；
 * 中转请求携带共享密钥与原始客户端 IP，只有密钥匹配才信任转发 IP。
 * 转发 IP 仅接受 IPv4/IPv6 字面量，避免异常字符进入消息与日志。
 */
function trustedRelay(request, env) {
  const secret = env.FEEDBACK_RELAY_SECRET
  if (!secret) return null
  const offered = request.headers.get(RELAY_SECRET_HEADER)
  if (!offered || !secureEqual(offered, secret)) return null
  const clientIp = String(request.headers.get(RELAY_CLIENT_IP_HEADER) || '').trim()
  return /^[0-9a-fA-F:.]{1,64}$/.test(clientIp) ? clientIp : null
}

async function forwardRelay({ relayUrl, secret, clientIp, rawBody, fetchImpl = fetch }) {
  const headers = { 'Content-Type': 'application/json' }
  if (secret) headers[RELAY_SECRET_HEADER] = secret
  if (clientIp && clientIp !== 'anonymous') headers[RELAY_CLIENT_IP_HEADER] = clientIp
  const response = await fetchImpl(relayUrl, {
    method: 'POST',
    headers,
    body: rawBody,
  })
  let body = null
  try {
    body = await response.json()
  } catch {
    // 非 JSON 响应视为中转失败。
  }
  return { status: response.status, body }
}

async function alertFailure({ env, runtime, requestId, relay, webhook, kind }) {
  const alertUrl = env.ALERT_WEBHOOK_URL
  if (!alertUrl) return
  const detail = relay ? `中转状态：${relay.status}` : `状态：${webhook.status}`
  await forwardWebhook({
    baseUrl: alertUrl,
    kind: env.ALERT_WEBHOOK_KIND || kind,
    secret: env.ALERT_WEBHOOK_SECRET,
    text: `DP大师反馈通道异常\n编号：${requestId}\n${detail}`,
    fetchImpl: runtime.fetch || fetch,
    now: runtime.now || Date.now,
  })
}

function requestId(randomUUID, now) {
  if (randomUUID) return randomUUID()
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `feedback-${now.toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizePayload(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { error: fail('invalid_payload', '反馈内容必须是一个对象', 422) }
  }

  const kind = String(data.kind == null ? '' : data.kind).trim()
  if (!FEEDBACK_KINDS.has(kind)) {
    return { error: fail('invalid_kind', '请选择有效的反馈类型', 422) }
  }

  const normalized = { kind }
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    const value = String(data[field] == null ? '' : data[field]).trim()
    if (value.length > limit) {
      return { error: fail(`${field}_too_long`, `${field} 字段过长`, 422) }
    }
    normalized[field] = value
  }

  if (normalized.description.length < 4) {
    return { error: fail('description_too_short', '请至少填写 4 个字的具体描述', 422) }
  }
  return { value: normalized }
}

export function createFeedbackLimiter({ limit = DEFAULT_LIMIT, windowMs = DEFAULT_WINDOW_MS } = {}) {
  if (!Number.isInteger(limit) || limit <= 0) throw new RangeError('limit must be a positive integer')
  if (!Number.isFinite(windowMs) || windowMs <= 0) throw new RangeError('windowMs must be positive')

  const buckets = new Map()
  let requestCount = 0

  const cleanup = (now) => {
    const cutoff = now - windowMs
    for (const [source, timestamps] of buckets) {
      if (timestamps.length === 0 || timestamps[timestamps.length - 1] <= cutoff) buckets.delete(source)
    }
  }

  return {
    take(source, now = Date.now()) {
      requestCount++
      if (requestCount % 64 === 0) cleanup(now)

      const cutoff = now - windowMs
      const active = (buckets.get(source) || []).filter((timestamp) => timestamp > cutoff)
      if (active.length >= limit) {
        buckets.set(source, active)
        return {
          allowed: false,
          retryAfter: Math.max(1, Math.ceil((active[0] + windowMs - now) / 1000)),
        }
      }
      active.push(now)
      buckets.set(source, active)
      return { allowed: true, retryAfter: 0 }
    },
  }
}

const defaultLimiter = createFeedbackLimiter()

function buildText(data, id) {
  const lines = [
    '🐞 DP大师 · 问题反馈',
    `编号：${id}`,
    `类型：${clip(data.kind, 20)}`,
    `页面：${clip(data.page, 120)}（${clip(data.path, 160)}）`,
    `描述：${clip(data.description, 2000)}`,
  ]
  if (data.contact) lines.push(`联系：${clip(data.contact, 120)}`)
  if (data.url) lines.push(`网址：${clip(data.url, 500)}`)
  lines.push(`浏览器：${clip(data.browser, 160)}`)
  lines.push(`设备：${clip(data.device, 240)}`)
  lines.push(`视口：${clip(data.viewport, 40)}；屏幕：${clip(data.screen, 80)}`)
  lines.push(`区域：${clip(data.locale, 80)}；时区：${clip(data.timezone, 120)}`)
  lines.push(`UA：${clip(data.ua, 300)}`)
  lines.push(`IP：${clip(data.ip, 80)}`)
  lines.push(`时间：${clip(data.ts, 40)}`)
  return lines.join('\n')
}

export async function handleFeedback(request, env = {}, runtime = {}) {
  if (request.method !== 'POST') {
    return fail('method_not_allowed', '只支持 POST 请求', 405, { Allow: 'POST' })
  }

  const contentType = request.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return fail('unsupported_media_type', '请使用 application/json 提交反馈', 415)
  }

  const origin = request.headers.get('origin')
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return fail('forbidden_origin', '不接受跨站反馈请求', 403)
      }
    } catch {
      return fail('forbidden_origin', '反馈来源无效', 403)
    }
  }

  const raw = await request.text()
  if (new TextEncoder().encode(raw).byteLength > BODY_LIMIT_BYTES) {
    return fail('too_large', '反馈内容过大', 413)
  }

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    return fail('bad_json', '反馈内容不是有效的 JSON', 400)
  }

  const normalized = normalizePayload(data)
  if (normalized.error) return normalized.error

  const now = runtime.now || Date.now
  const timestamp = now()
  const relayTrust = trustedRelay(request, env)
  const ip = relayTrust || sourceFromRequest(request)
  const source = runtime.sourceKey ? runtime.sourceKey(request) : ip
  const limiter = runtime.limiter || defaultLimiter
  const rate = limiter.take(source, timestamp)
  if (!rate.allowed) {
    return fail(
      'rate_limited',
      '提交太频繁，请稍后再试',
      429,
      { 'Retry-After': String(rate.retryAfter) },
    )
  }

  const id = requestId(runtime.randomUUID, timestamp)
  const baseUrl = env.FEEDBACK_WEBHOOK_URL
  const relayUrl = env.FEEDBACK_RELAY_URL
  const kind = env.FEEDBACK_WEBHOOK_KIND || 'wecom'
  const log = runtime.log || defaultLog
  const errorLog = runtime.errorLog || defaultErrorLog
  const feedback = { ...normalized.value, ip }
  const receipt = {
    event: 'feedback_received',
    requestId: id,
    feedback,
    webhook: { status: relayUrl ? 'relay_pending' : baseUrl ? 'pending' : 'not_configured' },
  }

  try {
    log(receipt)
  } catch {
    return fail('log_failed', '反馈服务暂时不可用', 500)
  }

  if (!baseUrl && !relayUrl) {
    errorLog({
      event: 'feedback_delivery_unavailable',
      requestId: id,
      reason: 'webhook_not_configured',
    })
    return fail(
      'delivery_unavailable',
      '反馈通道尚未配置，请先复制反馈内容后通过公开渠道发送。',
      503,
    )
  }

  // .cc 的 Cloudflare 出口到钉钉 TLS 不通（525），配置 relay 时经 .cn 中转进钉钉。
  // 已识别为可信转发的请求（trustedRelay 命中）绝不再次转发，防止误配造成转发循环。
  if (relayUrl && !relayTrust) {
    let relayed
    try {
      relayed = await forwardRelay({
        relayUrl,
        secret: env.FEEDBACK_RELAY_SECRET,
        clientIp: ip,
        rawBody: raw,
        fetchImpl: runtime.fetch || fetch,
      })
    } catch {
      relayed = { status: 0, body: null }
    }
    try {
      log({ event: 'feedback_relay', requestId: id, relay: { status: relayed.status } })
    } catch {
      // 首条反馈日志已成功，转发诊断日志失败不改变最终送达判断。
    }

    if (relayed.status === 429) {
      return fail('rate_limited', '提交太频繁，请稍后再试', 429)
    }
    if (relayed.status !== 200 || !relayed.body?.ok) {
      const failure = {
        event: 'feedback_delivery_failed',
        requestId: id,
        relay: { status: relayed.status, error: relayed.body?.error },
      }
      errorLog(failure)
      await alertFailure({ env, runtime, requestId: id, relay: failure.relay, kind })
      return fail(
        'delivery_failed',
        '反馈暂时无法送达，请稍后重试，或复制反馈内容后通过公开渠道发送。',
        502,
      )
    }

    return json({
      ok: true,
      status: 'delivered',
      forwarded: true,
      requestId: String(relayed.body.requestId || id),
    })
  }

  const webhook = await forwardWebhook({
    baseUrl,
    kind,
    secret: env.FEEDBACK_WEBHOOK_SECRET,
    text: buildText(feedback, id),
    fetchImpl: runtime.fetch || fetch,
    now,
  })
  try {
    log({ event: 'feedback_webhook', requestId: id, webhook })
  } catch {
    // 首条反馈日志已成功，转发诊断日志失败不改变最终送达判断。
  }

  if (webhook.status !== 'forwarded') {
    const failure = {
      event: 'feedback_delivery_failed',
      requestId: id,
      webhook,
    }
    errorLog(failure)
    const alertUrl = env.ALERT_WEBHOOK_URL
    if (alertUrl && alertUrl !== baseUrl) {
      await alertFailure({ env, runtime, requestId: id, webhook, kind })
    }
    return fail(
      'delivery_failed',
      '反馈暂时无法送达，请稍后重试，或复制反馈内容后通过公开渠道发送。',
      502,
    )
  }

  return json({
    ok: true,
    status: 'delivered',
    forwarded: true,
    requestId: id,
  })
}
