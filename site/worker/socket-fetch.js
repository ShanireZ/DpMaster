// 走 cloudflare:sockets 的最小 HTTPS 用戶端。
//
// 存在的理由：Cloudflare 反代出口（`fetch()`）到釘釘等一批對端的 TLS 握手被
// 系統性打斷，穩定回傳 52x；而官方文件寫明 TCP 出站（`connect()`）的出口前綴
// **不在** Cloudflare 公開 IP 段內 —— 2026-08-22 生產實測，同樣的目標 `fetch()`
// 得 525、`connect()` 得 200，POST + JSON body + 讀迴回應整條連線路徑都通。
//
// 只實作投遞 webhook 需要的那一小塊：單次 HTTPS POST、`Connection: close`、
// 讀到 EOF、解析狀態行與回應體（Content-Length 與 chunked 都支援）。
// 不做 keep-alive、不做重定向、不做壓縮協商，也不接受明文 http://。
//
// ★ 反向限制：Cloudflare 禁止 TCP 出站連到自己的 IP 段。所以這條通道**不能**
// 頂替 fetch 去投遞託管在 Cloudflare 後面的 webhook（Discord / Slack 常見），
// 呼叫方必須保持「fetch 優先，失敗才降級到這裡」的順序。

const DEFAULT_TIMEOUT_MS = 10_000
const MAX_RESPONSE_BYTES = 64 * 1024

/** 惰性載入執行環境 API：Node 下不存在，回傳 null 讓呼叫方降級。 */
export async function loadConnect() {
  try {
    return (await import('cloudflare:sockets')).connect
  } catch {
    return null
  }
}

async function withTimeout(promise, timeoutMs, label) {
  let timer
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

/** 讀到對端關閉為止。請求帶 Connection: close，所以 EOF 就是回應結束。 */
async function readAll(socket, timeoutMs) {
  const reader = socket.readable.getReader()
  const chunks = []
  let total = 0
  try {
    while (total < MAX_RESPONSE_BYTES) {
      const { value, done } = await withTimeout(reader.read(), timeoutMs, 'socket read')
      if (done) break
      if (value) {
        chunks.push(value)
        total += value.byteLength
      }
    }
  } finally {
    try {
      reader.releaseLock()
    } catch {
      // 讀側隨連接關閉時釋放會拋，不影響結果。
    }
  }
  const merged = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return merged
}

export function decodeChunked(body) {
  let rest = body
  let out = ''
  while (true) {
    const lineEnd = rest.indexOf('\r\n')
    if (lineEnd < 0) break
    const size = Number.parseInt(rest.slice(0, lineEnd).split(';', 1)[0].trim(), 16)
    if (!Number.isFinite(size) || size <= 0) break
    out += rest.slice(lineEnd + 2, lineEnd + 2 + size)
    rest = rest.slice(lineEnd + 2 + size + 2)
  }
  return out
}

/** 把原始位元組切成 { status, statusLine, headers, body }，按需解 chunked。 */
export function parseHttpResponse(bytes) {
  const text = new TextDecoder().decode(bytes)
  const split = text.indexOf('\r\n\r\n')
  const head = split < 0 ? text : text.slice(0, split)
  const rawBody = split < 0 ? '' : text.slice(split + 4)
  const [statusLine, ...headerLines] = head.split('\r\n')
  const headers = {}
  for (const line of headerLines) {
    const at = line.indexOf(':')
    if (at > 0) headers[line.slice(0, at).trim().toLowerCase()] = line.slice(at + 1).trim()
  }
  const chunked = (headers['transfer-encoding'] || '').toLowerCase().includes('chunked')
  return {
    status: Number.parseInt(statusLine.split(' ')[1], 10) || 0,
    statusLine: statusLine.slice(0, 120),
    headers,
    body: chunked ? decodeChunked(rawBody) : rawBody,
  }
}

/**
 * 對 `url` 發一次 HTTPS POST，回傳 `{ status, statusLine, headers, body }`。
 * 連接失敗、超時、非 https、回應無法解析都會拋出，由呼叫方決定如何降級。
 */
export async function postOverSocket({
  url,
  body,
  contentType = 'application/json',
  connect,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  if (!connect) throw new Error('cloudflare:sockets unavailable in this runtime')
  const target = new URL(url)
  if (target.protocol !== 'https:') {
    throw new Error(`refusing to post over ${target.protocol} — https only`)
  }

  const payload = new TextEncoder().encode(body)
  const head = [
    `POST ${target.pathname}${target.search} HTTP/1.1`,
    `Host: ${target.host}`,
    `Content-Type: ${contentType}`,
    `Content-Length: ${payload.byteLength}`,
    // 不協商壓縮，省掉一層解碼；不 keep-alive，靠 EOF 判定回應結束。
    'Accept-Encoding: identity',
    'Connection: close',
    '',
    '',
  ].join('\r\n')

  let socket
  try {
    socket = connect(
      { hostname: target.hostname, port: Number(target.port) || 443 },
      { secureTransport: 'on' },
    )
    await withTimeout(socket.opened, timeoutMs, 'tls handshake')

    // ★ 必須按編碼後的位元組長度拼，不能用 head.length —— 那是 UTF-16 碼元數。
    const headBytes = new TextEncoder().encode(head)
    const request = new Uint8Array(headBytes.byteLength + payload.byteLength)
    request.set(headBytes, 0)
    request.set(payload, headBytes.byteLength)

    const writer = socket.writable.getWriter()
    await withTimeout(writer.write(request), timeoutMs, 'socket write')
    writer.releaseLock()

    const parsed = parseHttpResponse(await readAll(socket, timeoutMs))
    if (!parsed.status) throw new Error('malformed HTTP response over socket')
    return parsed
  } finally {
    try {
      await socket?.close()
    } catch {
      // 關閉失敗不影響已經拿到的回應。
    }
  }
}
