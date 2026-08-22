// 反馈处理核心 —— Cloudflare Worker 与（可选的）外部 relay 主机共用。
// 仅依赖 Fetch API 与 Web Crypto；运行时 Adapter 不得复制校验、限流或回执语义。
import {
  applyCors,
  clip,
  corsDecision,
  forwardRelay,
  forwardWebhook,
} from './webhook-core.js'

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
  // Cloudflare Worker 里 cf-connecting-ip 由平台保证注入并覆盖，可信。
  // x-real-ip / x-forwarded-for 只作为非 Cloudflare 部署（外部 relay 主机）的
  // 兜底，客户端可伪造；relay 会用 x-dp-client-ip 携带经密钥认证的真实 IP。
  const forwarded = request.headers.get('cf-connecting-ip')
    || request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || 'anonymous'
}

/**
 * 从 Cloudflare 的 `request.cf` 取粗粒度地理位置，用来给反馈里的 IP 加注解。
 *
 * 用平台字段而不是第三方 IP 库：`request.cf` 由 Cloudflare 边缘填充，客户端
 * 伪造不了，也不需要额外出站请求。国家码经 Intl.DisplayNames 转成中文；
 * 城市与一级行政区是 Cloudflare 给的英文原文，不做翻译（没有可信的映射表）。
 *
 * ★ 经 relay 转发时必须返回空：那时 `request.cf` 描述的是 relay 主机的位置，
 * 不是访客的，标上去就是错的。
 */
function geoFromRequest(request, { relayed = false } = {}) {
  if (relayed) return ''
  const cf = request.cf
  if (!cf || typeof cf !== 'object') return ''
  const parts = []
  const country = String(cf.country || '').trim()
  if (country) {
    let label = country
    try {
      label = new Intl.DisplayNames(['zh'], { type: 'region' }).of(country) || country
    } catch {
      // 运行时没有对应 ICU 数据时退回两位国家码。
    }
    parts.push(label)
  }
  const region = String(cf.region || '').trim()
  const city = String(cf.city || '').trim()
  // region 与 city 常常重复（例如「Shanghai / Shanghai」），去重后更好读。
  for (const value of [region, city]) {
    if (value && !parts.includes(value)) parts.push(value)
  }
  return clip(parts.join(' · '), 120)
}

const RELAY_SECRET_HEADER = 'x-dp-relay-secret'
const RELAY_CLIENT_IP_HEADER = 'x-dp-client-ip'
const RELAY_KIND_HEADER = 'x-dp-relay-kind'
const RELAY_ALERT_KIND = 'alert'
const ALERT_TEXT_LIMIT = 1000

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
 * 识别来自上游 Worker 的可信转发请求（relay 主机侧使用）。
 * Cloudflare 出口到钉钉的 TLS 被打断，反馈与告警需要经一台能连钉钉的主机中转；
 * 转发请求携带共享密钥（x-dp-relay-secret），只有密钥匹配才视为可信。
 * 返回 { trusted, clientIp }：clientIp 仅在 x-dp-client-ip 为合法 IPv4/IPv6
 * 字面量时给出，否则为 null（调用方回退平台 IP）。
 */
function trustedRelay(request, env) {
  const secret = env.FEEDBACK_RELAY_SECRET
  if (!secret) return null
  const offered = request.headers.get(RELAY_SECRET_HEADER)
  if (!offered || !secureEqual(offered, secret)) return null
  const clientIp = String(request.headers.get(RELAY_CLIENT_IP_HEADER) || '').trim()
  return {
    trusted: true,
    clientIp: /^[0-9a-fA-F:.]{1,64}$/.test(clientIp) ? clientIp : null,
  }
}

async function forwardRelayFeedback({ relayUrl, secret, clientIp, rawBody, fetchImpl = fetch }) {
  return forwardRelay({ relayUrl, secret, clientIp, body: rawBody, fetchImpl })
}

/** 告警送达：配了 relay 就经 relay 主机中转，否则直连告警机器人。告警失败不得影响主流程。 */
async function deliverAlert({ env, runtime, text }) {
  const relayUrl = env.FEEDBACK_RELAY_URL
  if (relayUrl) {
    try {
      const relayed = await forwardRelay({
        relayUrl,
        secret: env.FEEDBACK_RELAY_SECRET,
        kind: RELAY_ALERT_KIND,
        body: JSON.stringify({ text }),
        fetchImpl: runtime.fetch || fetch,
      })
      if (relayed.status !== 200 || !relayed.body?.ok) {
        console.error('[feedback-alert-relay]', JSON.stringify({ status: relayed.status, body: relayed.body }))
      }
    } catch (error) {
      console.error('[feedback-alert-relay]', String(error))
    }
    return
  }
  await forwardWebhook({
    baseUrl: env.ALERT_WEBHOOK_URL,
    kind: env.ALERT_WEBHOOK_KIND || 'wecom',
    secret: env.ALERT_WEBHOOK_SECRET,
    text,
    fetchImpl: runtime.fetch || fetch,
    now: runtime.now || Date.now,
  })
}

async function alertFailure({ env, runtime, requestId, relay, webhook }) {
  const alertUrl = env.ALERT_WEBHOOK_URL
  if (!alertUrl && !env.FEEDBACK_RELAY_URL) return
  const detail = relay ? `中转状态：${relay.status}` : `状态：${webhook.status}`
  await deliverAlert({
    env,
    runtime,
    text: `DP大师反馈通道异常\n编号：${requestId}\n${detail}`,
  })
}

/**
 * relay 主机侧处理来自上游 Worker 的告警转发（x-dp-relay-kind: alert）：
 * 密钥已由 trustedRelay 验证，这里按转发 IP 限流后转发到 relay 主机自己的
 * ALERT_WEBHOOK_URL（该主机到钉钉可达）。告警分流直接返回，
 * 不会再进入反馈 relay 分支，天然防循环。
 */
async function handleRelayAlert({ env, runtime, data, ip }) {
  const text = data && typeof data === 'object'
    ? String(data.text || '').trim()
    : ''
  if (!text || text.length > ALERT_TEXT_LIMIT) {
    return fail('invalid_payload', '告警内容无效', 422)
  }

  const now = runtime.now || Date.now
  const timestamp = now()
  const limiter = runtime.limiter || defaultLimiter
  const rate = limiter.take(ip, timestamp)
  if (!rate.allowed) {
    return fail(
      'rate_limited',
      '提交太频繁，请稍后再试',
      429,
      { 'Retry-After': String(rate.retryAfter) },
    )
  }

  const alertUrl = env.ALERT_WEBHOOK_URL
  if (!alertUrl) {
    return fail('delivery_unavailable', '告警通道尚未配置', 503)
  }

  const id = requestId(runtime.randomUUID, timestamp)
  const log = runtime.log || defaultLog
  const errorLog = runtime.errorLog || defaultErrorLog
  try {
    log({ event: 'alert_relay_received', requestId: id, ip })
  } catch {
    return fail('log_failed', '告警服务暂时不可用', 500)
  }

  const webhook = await forwardWebhook({
    baseUrl: alertUrl,
    kind: env.ALERT_WEBHOOK_KIND || 'wecom',
    secret: env.ALERT_WEBHOOK_SECRET,
    text,
    fetchImpl: runtime.fetch || fetch,
    now,
  })
  if (webhook.status !== 'forwarded') {
    errorLog({ event: 'alert_relay_failed', requestId: id, webhook })
    return fail('delivery_failed', '告警暂时无法送达', 502)
  }
  return json({ ok: true, status: 'alerted', requestId: id })
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

/**
 * 拼投递到 IM 的消息文本。
 * ★ 诊断信息（浏览器 / 设备 / 视口 / 区域 / UA）是**用户勾选才附带**的，默认不带。
 * 这些行必须在缺省时整行省略，否则绝大多数反馈都会带一串空标签。
 * 规则与 FeedbackWidget 的「复制反馈内容」兜底文本保持一致。
 */
function buildText(data, id) {
  return [
    '🐞 DP大师 · 问题反馈',
    `编号：${id}`,
    `类型：${clip(data.kind, 20)}`,
    `页面：${clip(data.page, 120)}（${clip(data.path, 160)}）`,
    `描述：${clip(data.description, 2000)}`,
    data.contact && `联系：${clip(data.contact, 120)}`,
    data.url && `网址：${clip(data.url, 500)}`,
    data.browser && `浏览器：${clip(data.browser, 160)}`,
    data.device && `设备：${clip(data.device, 240)}`,
    data.viewport && `视口：${clip(data.viewport, 40)}；屏幕：${clip(data.screen, 80)}`,
    data.locale && `区域：${clip(data.locale, 80)}；时区：${clip(data.timezone, 120)}`,
    data.ua && `UA：${clip(data.ua, 300)}`,
    `IP：${clip(data.ip, 80)}${data.geo ? `（${data.geo}）` : ''}`,
    `时间：${clip(data.ts, 40)}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function handleFeedback(request, env = {}, runtime = {}) {
  const cors = corsDecision(request)
  if (!cors.allowed) {
    return fail('forbidden_origin', '不接受跨站反馈请求', 403)
  }
  return handleFeedbackCore(request, env, runtime).then((response) => applyCors(response, cors))
}

async function handleFeedbackCore(request, env, runtime) {
  if (request.method !== 'POST') {
    return fail('method_not_allowed', '只支持 POST 请求', 405, { Allow: 'POST' })
  }

  const contentType = request.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return fail('unsupported_media_type', '请使用 application/json 提交反馈', 415)
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

  // 告警分流：上游 Worker 的告警也经本端点 relay（x-dp-relay-kind: alert），
  // 由 relay 主机转发到自己的 ALERT_WEBHOOK_URL。仅在密钥匹配时生效，
  // 且必须在反馈格式校验之前，因为告警 body（{text}）不是反馈格式。
  const relay = trustedRelay(request, env)
  if (relay && request.headers.get(RELAY_KIND_HEADER) === RELAY_ALERT_KIND) {
    return handleRelayAlert({ env, runtime, data, ip: relay.clientIp || sourceFromRequest(request) })
  }

  const normalized = normalizePayload(data)
  if (normalized.error) return normalized.error

  const now = runtime.now || Date.now
  const timestamp = now()
  const ip = (relay && relay.clientIp) || sourceFromRequest(request)
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
  // 地区注解跟着 IP 走：经 relay 转发时 request.cf 描述的是 relay 主机，必须省略。
  const geo = runtime.geo ? runtime.geo(request) : geoFromRequest(request, { relayed: Boolean(relay) })
  const feedback = { ...normalized.value, ip, ...(geo ? { geo } : {}) }
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

  // Cloudflare 出口到钉钉 TLS 被打断，配置 relay 时经 relay 主机中转进钉钉。
  // 已识别为可信转发的请求（secret 匹配）绝不再次转发，防止误配造成转发循环。
  if (relayUrl && !relay) {
    let relayed
    try {
      relayed = await forwardRelayFeedback({
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
      await alertFailure({ env, runtime, requestId: id, relay: failure.relay })
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
      await alertFailure({ env, runtime, requestId: id, webhook })
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
