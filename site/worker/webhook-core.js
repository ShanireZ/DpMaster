import { loadConnect, postOverSocket } from './socket-fetch.js'

/**
 * Cloudflare 反代「連不上源站」這一類狀態碼。它們不是對端應用層的拒絕，
 * 而是 CF 到源站那一跳失敗 —— 釘釘穩定命中 525。碰到這些才值得換出口重試；
 * 普通 4xx/5xx 是對端自己的回覆，重試沒有意義。
 */
const CLOUDFLARE_ORIGIN_ERRORS = new Set([520, 521, 522, 523, 524, 525, 526, 527, 530])

export function clip(value, maxLength) {
  const text = String(value == null ? '' : value)
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
}

/**
 * 跨站直連白名單。站台收斂成單域單 Worker 後，瀏覽器請求一律同源，
 * 白名單為空 —— 任何帶 Origin 且非同源的請求都會被拒絕。
 *
 * 保留這個機制而不是刪掉：如果告警連線路徑日後改成「另一臺主機跑 relay」，
 * relay 側重複使用本模組時需要放行 dp.round1.cc 的 origin。
 */
export const CROSS_ORIGIN_ALLOWLIST = new Set()

/** 判定請求的 CORS 決策：{ origin, allowed, cross }。 */
export function corsDecision(request) {
  const originHeader = request.headers.get('origin')
  if (!originHeader) return { origin: null, allowed: true, cross: false }
  try {
    const value = new URL(originHeader).origin
    const own = new URL(request.url).origin
    if (value === own) return { origin: value, allowed: true, cross: false }
    if (CROSS_ORIGIN_ALLOWLIST.has(value)) return { origin: value, allowed: true, cross: true }
  } catch {
    // 非法 origin 落到拒絕分支。
  }
  return { origin: originHeader, allowed: false, cross: false }
}

/** 給跨域白名單回應補 CORS 頭；同源/無 origin 回應原樣回傳。 */
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

/** 跨域白名單的 OPTIONS preflight 回應（204 + CORS 頭）。 */
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

/** 統一 fetch 與 raw socket 兩條出口的結果形狀。 */
function outcomeFromResponse(transport, status, text) {
  return { transport, status, ok: status >= 200 && status < 300, text }
}

/**
 * 投遞一次 webhook。**fetch 優先，只有在 CF 到源站那一跳失敗時才降級到 raw socket。**
 *
 * ★ 順序不能反：`connect()` 被禁止連 Cloudflare 自己的 IP 段，而 Discord / Slack
 * 這類 webhook 常託管在 Cloudflare 後面 —— socket 優先會把它們全打死。反過來，
 * 釘釘這類拒絕 CF 反代出口的對端，fetch 會穩定拿到 525，正好觸發降級。
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
    // 降級也失敗：保留 fetch 那次的結論，並把 socket 的失敗原因附上，
    // 否則維運只能看到一個 525，不知道第二條出口也試過了。
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
      // 非 JSON 的 2xx 回應仍視為轉發成功。
    }
    return { status: 'forwarded', code: outcome.status, transport: outcome.transport }
  } catch (error) {
    return { status: 'network_error', message: clip(String(error), 200) }
  }
}

/**
 * 向 relay 主機的 /api/feedback 端點做可信轉發（relay 協定）。
 * 共享金鑰 x-dp-relay-secret 由接收側恆定時間檢核；x-dp-relay-kind 區分
 * 回饋（省略）與告警（alert）；x-dp-client-ip 攜帶原始用戶端 IP。
 * body 是已序列化的字串，由呼叫方負責。
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
    // 非 JSON 回應視為轉發失敗。
  }
  return { status: response.status, body: payload }
}
