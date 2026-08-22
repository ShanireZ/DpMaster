import { loadConnect, postOverSocket } from './socket-fetch.js'

/**
 * Cloudflare 反代「连不上源站」这一类状态码。它们不是对端应用层的拒绝，
 * 而是 CF 到源站那一跳失败 —— 钉钉稳定命中 525。碰到这些才值得换出口重试；
 * 普通 4xx/5xx 是对端自己的回复，重试没有意义。
 */
const CLOUDFLARE_ORIGIN_ERRORS = new Set([520, 521, 522, 523, 524, 525, 526, 527, 530])

export function clip(value, maxLength) {
  const text = String(value == null ? '' : value)
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
}

/**
 * 跨站直连白名单。站点收敛成单域单 Worker 后，浏览器请求一律同源，
 * 白名单为空 —— 任何带 Origin 且非同源的请求都会被拒绝。
 *
 * 保留这个机制而不是删掉：如果告警链路日后改成「另一台主机跑 relay」，
 * relay 侧复用本模块时需要放行 dp.round1.cc 的 origin。
 */
export const CROSS_ORIGIN_ALLOWLIST = new Set()

/** 判定请求的 CORS 决策：{ origin, allowed, cross }。 */
export function corsDecision(request) {
  const originHeader = request.headers.get('origin')
  if (!originHeader) return { origin: null, allowed: true, cross: false }
  try {
    const value = new URL(originHeader).origin
    const own = new URL(request.url).origin
    if (value === own) return { origin: value, allowed: true, cross: false }
    if (CROSS_ORIGIN_ALLOWLIST.has(value)) return { origin: value, allowed: true, cross: true }
  } catch {
    // 非法 origin 落到拒绝分支。
  }
  return { origin: originHeader, allowed: false, cross: false }
}

/** 给跨域白名单响应补 CORS 头；同源/无 origin 响应原样返回。 */
export function applyCors(response, cors) {
  if (!cors?.cross) return response
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', cors.origin)
  headers.append('Vary', 'Origin')
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/** 跨域白名单的 OPTIONS preflight 响应（204 + CORS 头）。 */
export function preflightResponse(cors) {
  if (!cors?.cross) return new Response(null, { status: 204 })
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': cors.origin,
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    },
  })
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

/** 统一 fetch 与 raw socket 两条出口的结果形状。 */
function outcomeFromResponse(transport, status, text) {
  return { transport, status, ok: status >= 200 && status < 300, text }
}

/**
 * 投递一次 webhook。**fetch 优先，只有在 CF 到源站那一跳失败时才降级到 raw socket。**
 *
 * ★ 顺序不能反：`connect()` 被禁止连 Cloudflare 自己的 IP 段，而 Discord / Slack
 * 这类 webhook 常托管在 Cloudflare 后面 —— socket 优先会把它们全打死。反过来，
 * 钉钉这类拒绝 CF 反代出口的对端，fetch 会稳定拿到 525，正好触发降级。
 */
async function deliver({ url, payload, fetchImpl, connectImpl, timeoutMs }) {
  let outcome
  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    })
    outcome = outcomeFromResponse('fetch', response.status, await response.text())
  } catch (error) {
    outcome = { transport: 'fetch', failure: error }
  }

  const retryable = outcome.failure || CLOUDFLARE_ORIGIN_ERRORS.has(outcome.status)
  if (!retryable) return outcome

  try {
    const connect = connectImpl ?? (await loadConnect())
    if (!connect) return outcome
    const viaSocket = await postOverSocket({ url, body: payload, connect, timeoutMs })
    return outcomeFromResponse('socket', viaSocket.status, viaSocket.body)
  } catch (error) {
    // 降级也失败：保留 fetch 那次的结论，并把 socket 的失败原因附上，
    // 否则运维只能看到一个 525，不知道第二条出口也试过了。
    return outcome.failure
      ? { transport: 'fetch+socket', failure: outcome.failure, socketError: error }
      : { ...outcome, transport: 'fetch+socket', socketError: error }
  }
}

export async function forwardWebhook({
  baseUrl,
  kind,
  secret,
  text,
  fetchImpl = fetch,
  now = Date.now,
  connectImpl,
  timeoutMs,
}) {
  try {
    const url = kind === 'dingtalk' && secret
      ? await dingtalkSignedUrl(baseUrl, secret, now)
      : baseUrl
    const payload = JSON.stringify(webhookBody(kind, text))
    const outcome = await deliver({ url, payload, fetchImpl, connectImpl, timeoutMs })

    if (outcome.failure) {
      return {
        status: 'network_error',
        message: clip(String(outcome.failure), 200),
        transport: outcome.transport,
      }
    }
    if (!outcome.ok) {
      return { status: 'http_error', code: outcome.status, transport: outcome.transport }
    }

    try {
      const body = JSON.parse(outcome.text)
      if (body && typeof body === 'object') {
        if (Number(body.errcode) !== 0 && body.errcode != null) {
          return {
            status: 'business_error',
            code: Number(body.errcode),
            message: clip(body.errmsg, 160),
            transport: outcome.transport,
          }
        }
        if (Number(body.code) !== 0 && body.code != null) {
          return {
            status: 'business_error',
            code: Number(body.code),
            message: clip(body.msg, 160),
            transport: outcome.transport,
          }
        }
      }
    } catch {
      // 非 JSON 的 2xx 响应仍视为转发成功。
    }
    return { status: 'forwarded', code: outcome.status, transport: outcome.transport }
  } catch (error) {
    return { status: 'network_error', message: clip(String(error), 200) }
  }
}

/**
 * 向 relay 主机的 /api/feedback 端点做可信转发（relay 协议）。
 * 共享密钥 x-dp-relay-secret 由接收侧恒定时间校验；x-dp-relay-kind 区分
 * 反馈（省略）与告警（alert）；x-dp-client-ip 携带原始客户端 IP。
 * body 是已序列化的字符串，由调用方负责。
 */
export async function forwardRelay({
  relayUrl,
  secret,
  kind,
  clientIp,
  body,
  fetchImpl = fetch,
}) {
  const headers = { 'Content-Type': 'application/json' }
  if (secret) headers['x-dp-relay-secret'] = secret
  if (kind) headers['x-dp-relay-kind'] = kind
  if (clientIp) headers['x-dp-client-ip'] = clientIp
  const response = await fetchImpl(relayUrl, {
    method: 'POST',
    headers,
    body,
  })
  let payload = null
  try {
    payload = await response.json()
  } catch {
    // 非 JSON 响应视为转发失败。
  }
  return { status: response.status, body: payload }
}
