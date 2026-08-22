// 走 cloudflare:sockets 的最小 HTTPS 客户端。
//
// 存在的理由：Cloudflare 反代出口（`fetch()`）到钉钉等一批对端的 TLS 握手被
// 系统性打断，稳定返回 52x；而官方文档写明 TCP 出站（`connect()`）的出口前缀
// **不在** Cloudflare 公开 IP 段内 —— 2026-08-22 生产实测，同样的目标 `fetch()`
// 得 525、`connect()` 得 200，POST + JSON body + 读回响应整条链路都通。
//
// 只实现投递 webhook 需要的那一小块：单次 HTTPS POST、`Connection: close`、
// 读到 EOF、解析状态行与响应体（Content-Length 与 chunked 都支持）。
// 不做 keep-alive、不做重定向、不做压缩协商，也不接受明文 http://。
//
// ★ 反向限制：Cloudflare 禁止 TCP 出站连到自己的 IP 段。所以这条通道**不能**
// 顶替 fetch 去投递托管在 Cloudflare 后面的 webhook（Discord / Slack 常见），
// 调用方必须保持「fetch 优先，失败才降级到这里」的顺序。

const DEFAULT_TIMEOUT_MS = 10_000
const MAX_RESPONSE_BYTES = 64 * 1024

/** 惰性加载运行时 API：Node 下不存在，返回 null 让调用方降级。 */
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

/** 读到对端关闭为止。请求带 Connection: close，所以 EOF 就是响应结束。 */
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
      // 读侧随连接关闭时释放会抛，不影响结果。
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

/** 把原始字节切成 { status, statusLine, headers, body }，按需解 chunked。 */
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
 * 对 `url` 发一次 HTTPS POST，返回 `{ status, statusLine, headers, body }`。
 * 连接失败、超时、非 https、响应无法解析都会抛出，由调用方决定如何降级。
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
    // 不协商压缩，省掉一层解码；不 keep-alive，靠 EOF 判定响应结束。
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

    // ★ 必须按编码后的字节长度拼，不能用 head.length —— 那是 UTF-16 码元数。
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
      // 关闭失败不影响已经拿到的响应。
    }
  }
}
