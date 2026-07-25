export function clip(value, maxLength) {
  const text = String(value == null ? '' : value)
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
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
