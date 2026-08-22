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

export async function forwardWebhook({
  baseUrl,
  kind,
  secret,
  text,
  fetchImpl = fetch,
  now = Date.now,
}) {
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
          return {
            status: 'business_error',
            code: Number(body.errcode),
            message: clip(body.errmsg, 160),
          }
        }
        if (Number(body.code) !== 0 && body.code != null) {
          return {
            status: 'business_error',
            code: Number(body.code),
            message: clip(body.msg, 160),
          }
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
