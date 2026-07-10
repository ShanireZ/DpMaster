// 反馈处理核心 —— 被 Cloudflare Worker / Pages Functions / EdgeOne 共用。
// 仅依赖 Fetch API 与 Web Crypto；运行时 Adapter 不得复制校验、限流或回执语义。

const BODY_LIMIT_BYTES = 16_000
const DEFAULT_LIMIT = 10
const DEFAULT_WINDOW_MS = 30 * 60 * 1000
const FEEDBACK_KINDS = new Set(['内容有误', '显示异常', '功能问题', '建议', '其他'])
const FIELD_LIMITS = {
  page: 120,
  path: 160,
  description: 2000,
  steps: 1000,
  contact: 120,
  url: 500,
  viewport: 40,
  ua: 300,
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

function clip(value, maxLength) {
  const text = String(value == null ? '' : value)
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
}

function sourceFromRequest(request) {
  const forwarded = request.headers.get('cf-connecting-ip')
    || request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || 'anonymous'
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
    '🐞 DP大师 · 新反馈',
    `编号：${id}`,
    `类型：${clip(data.kind, 20)}`,
    `页面：${clip(data.page, 120)}（${clip(data.path, 160)}）`,
    `描述：${clip(data.description, 2000)}`,
  ]
  if (data.steps) lines.push(`复现/期望：${clip(data.steps, 1000)}`)
  if (data.contact) lines.push(`联系：${clip(data.contact, 120)}`)
  lines.push(`环境：${clip(data.viewport, 40)} · ${clip(data.ua, 300)}`)
  lines.push(`时间：${clip(data.ts, 40)}`)
  return lines.join('\n')
}

function webhookBody(kind, text) {
  switch (kind) {
    case 'feishu':
      return { msg_type: 'text', content: { text } }
    case 'discord':
      return { content: text }
    case 'slack':
      return { text }
    case 'dingtalk':
    case 'wecom':
    default:
      return { msgtype: 'text', text: { content: text } }
  }
}

async function dingtalkSignedUrl(baseUrl, secret, now) {
  const timestamp = now()
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${timestamp}\n${secret}`),
  )
  let binary = ''
  for (const byte of new Uint8Array(signature)) binary += String.fromCharCode(byte)
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}timestamp=${timestamp}&sign=${encodeURIComponent(btoa(binary))}`
}

async function forwardWebhook({ baseUrl, kind, secret, text, fetchImpl, now }) {
  try {
    const url = kind === 'dingtalk' && secret
      ? await dingtalkSignedUrl(baseUrl, secret, now)
      : baseUrl
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookBody(kind, text)),
    })
    if (!response.ok) return { status: 'http_error', code: response.status }

    try {
      const body = await response.clone().json()
      if (body && typeof body === 'object') {
        if (Number(body.errcode) !== 0 && body.errcode != null) {
          return { status: 'business_error', code: Number(body.errcode), message: clip(body.errmsg, 160) }
        }
        if (Number(body.code) !== 0 && body.code != null) {
          return { status: 'business_error', code: Number(body.code), message: clip(body.msg, 160) }
        }
      }
    } catch {
      // 非 JSON 的 2xx 响应仍视为转发成功。
    }
    return { status: 'forwarded', code: response.status }
  } catch (error) {
    return { status: 'network_error', message: clip(String(error), 200) }
  }
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
  const source = runtime.sourceKey ? runtime.sourceKey(request) : sourceFromRequest(request)
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
  const kind = env.FEEDBACK_WEBHOOK_KIND || 'wecom'
  const log = runtime.log || defaultLog
  const receipt = {
    event: 'feedback_received',
    requestId: id,
    feedback: normalized.value,
    webhook: { status: baseUrl ? 'pending' : 'not_configured' },
  }

  try {
    log(receipt)
  } catch {
    return fail('log_failed', '反馈服务暂时不可用', 500)
  }

  if (!baseUrl) {
    return json({ ok: true, status: 'logged', forwarded: false, requestId: id })
  }

  const webhook = await forwardWebhook({
    baseUrl,
    kind,
    secret: env.FEEDBACK_WEBHOOK_SECRET,
    text: buildText(normalized.value, id),
    fetchImpl: runtime.fetch || fetch,
    now,
  })
  try {
    log({ event: 'feedback_webhook', requestId: id, webhook })
  } catch {
    // 首条反馈日志已成功，转发诊断日志失败不改变“已收到”语义。
  }

  return json({
    ok: true,
    status: 'logged',
    forwarded: webhook.status === 'forwarded',
    requestId: id,
  })
}
