// 第一方统计接收器。只记录无身份、无联系方式的有限事件字段。
import { applyCors, corsDecision, forwardRelay, forwardWebhook } from './webhook-core.js'

const BODY_LIMIT_BYTES = 4_000
const PROVIDERS = new Set(['cloudflare'])
const EVENTS = new Set([
  'page_view',
  'feedback_opened',
  'feedback_submitted',
  'feedback_succeeded',
  'feedback_failed',
  'web_vital',
  'problem_outbound',
  'search_used',
  'search_no_result',
  'client_error',
  'route_not_found',
])
const ALERT_EVENTS = new Set(['client_error', 'feedback_failed'])

const json = (body, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  })

const fail = (error, message, status, extraHeaders) =>
  json({ ok: false, error, message }, status, extraHeaders)

function clippedString(value, maxLength) {
  return String(value == null ? '' : value).trim().slice(0, maxLength)
}

function normalizeMetadata(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const entries = Object.entries(value).slice(0, 8)
  return Object.fromEntries(
    entries
      .filter(([, item]) => ['string', 'number', 'boolean'].includes(typeof item))
      .map(([key, item]) => {
        const normalized = typeof item === 'string'
          ? clippedString(item, 120)
          : typeof item === 'number' && Number.isFinite(item)
            ? item
            : item
        return [clippedString(key, 40), normalized]
      }),
  )
}

export function handleAnalytics(request, runtime = {}) {
  const cors = corsDecision(request)
  if (!cors.allowed) {
    return fail('forbidden_origin', '不接受跨站统计请求', 403)
  }
  return handleAnalyticsCore(request, runtime).then((response) => applyCors(response, cors))
}

async function handleAnalyticsCore(request, runtime) {
  if (request.method !== 'POST') {
    return fail('method_not_allowed', '只支持 POST 请求', 405, { Allow: 'POST' })
  }

  const contentType = request.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return fail('unsupported_media_type', '请使用 application/json 提交统计事件', 415)
  }

  const raw = await request.text()
  if (new TextEncoder().encode(raw).byteLength > BODY_LIMIT_BYTES) {
    return fail('too_large', '统计事件过大', 413)
  }

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    return fail('bad_json', '统计事件不是有效的 JSON', 400)
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return fail('invalid_payload', '统计事件必须是对象', 422)
  }
  if (!PROVIDERS.has(data.provider)) {
    return fail('invalid_provider', '统计 Provider 无效', 422)
  }
  if (!EVENTS.has(data.event)) {
    return fail('invalid_event', '统计事件无效', 422)
  }

  const entry = {
    event: 'analytics_event',
    provider: data.provider,
    name: data.event,
    path: clippedString(data.path, 160),
    title: clippedString(data.title, 160),
    metadata: normalizeMetadata(data.metadata),
    ts: clippedString(data.ts, 40),
    schema: 1,
  }
  const log = runtime.log || ((value) => console.log('[analytics]', JSON.stringify(value)))
  try {
    log(entry)
    runtime.write?.(entry)
  } catch {
    return fail('log_failed', '统计服务暂时不可用', 500)
  }

  const env = runtime.env || {}
  if (ALERT_EVENTS.has(entry.name) && (env.ALERT_WEBHOOK_URL || env.FEEDBACK_RELAY_URL)) {
    const text = [
      'DP大师前端告警',
      `事件：${entry.name}`,
      `页面：${entry.path}`,
      `详情：${JSON.stringify(entry.metadata)}`,
    ].join('\n')
    // Cloudflare 出口直连钉钉握手被打断：配了 relay 时告警经 relay 主机中转，
    // 否则直连告警机器人。目标由环境变量决定，代码不绑定任何具体主机。
    const alert = (env.FEEDBACK_RELAY_URL
      ? forwardRelay({
          relayUrl: env.FEEDBACK_RELAY_URL,
          secret: env.FEEDBACK_RELAY_SECRET,
          kind: 'alert',
          body: JSON.stringify({ text }),
          fetchImpl: runtime.fetch || fetch,
        }).then((result) => {
          if (result.status !== 200 || !result.body?.ok) {
            console.error('[analytics-alert-relay]', JSON.stringify({ status: result.status, body: result.body }))
          }
        })
      : forwardWebhook({
          baseUrl: env.ALERT_WEBHOOK_URL,
          kind: env.ALERT_WEBHOOK_KIND || 'wecom',
          secret: env.ALERT_WEBHOOK_SECRET,
          text,
          fetchImpl: runtime.fetch || fetch,
        }).then((result) => {
          if (result.status !== 'forwarded') {
            console.error('[analytics-alert]', JSON.stringify(result))
          }
        }))
    if (runtime.waitUntil) runtime.waitUntil(alert)
    else await alert
  }
  return new Response(null, { status: 204 })
}
