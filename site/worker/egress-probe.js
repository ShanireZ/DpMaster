// Worker 出口可达性探针（一次性诊断用，不属于站点功能）。
//
// 背景：Cloudflare 数据中心出口到钉钉 oapi.dingtalk.com 的 TLS 被系统性打断
// （2026-08 多轮实测稳定 525），而普通海外节点到钉钉正常。站点收敛到单一 CF
// Worker 之后，原来经国内站中转的告警链路没了，必须先测清楚"到底哪条出口能通"
// 才能选送达方案。
//
// 探针对每个目标跑两条出口：
//   - fetch()：走 Cloudflare 的反向代理栈，出口在 Cloudflare 公开 IP 段内。
//   - connect()（cloudflare:sockets）：官方文档明确说明其出口前缀**不在**
//     Cloudflare 公开 IP 段里。如果对端是按 CF 公开段封的，这条有机会通。
//
// 两种模式：
//   - 默认（可达性）：对每个目标 GET / 与 HEAD /，纯读，无副作用。
//   - `{"mode":"post"}`（POST 往返）：向钉钉两个接入点发一次真实的 HTTPS POST，
//     验证「发请求体 + 完整读回响应（含 chunked）」这条链路。★ 不带 access_token
//     与签名，钉钉会用 errcode 拒绝，不会向任何群投递消息。
//
// 启用方式：给 Worker 配 EGRESS_DIAG_SECRET，然后带 x-dp-diag-secret 头 POST。
// 不配这个变量时端点不存在（请求落回静态资源，与任意未知路径同样返回
// POST 405 / GET 404，不泄露端点是否存在）。

const DEFAULT_TARGETS = Object.freeze([
  { host: 'oapi.dingtalk.com', note: '钉钉自定义机器人（当前 webhook 接入点）' },
  { host: 'api.dingtalk.com', note: '钉钉新版 OpenAPI（不同接入点）' },
  { host: 'qyapi.weixin.qq.com', note: '企业微信群机器人' },
  { host: 'open.feishu.cn', note: '飞书（国内）' },
  { host: 'open.larksuite.com', note: 'Lark（国际）' },
  { host: 'api.telegram.org', note: 'Telegram Bot（海外对照组）' },
  { host: 'www.cloudflare.com', note: '对照组：探针自身是否正常' },
])

const DEFAULT_TIMEOUT_MS = 8000
const MAX_TARGETS = 12
const MAX_RESPONSE_BYTES = 64 * 1024

/**
 * POST 往返验证目标。★ 一律不带 access_token / 签名：钉钉会用 errcode 拒绝，
 * 不会向任何群投递消息。这里要验证的是「连接 + 发请求体 + 完整读回响应」这条
 * 链路本身，不是投递。
 */
const DEFAULT_POST_TARGETS = Object.freeze([
  {
    host: 'oapi.dingtalk.com',
    path: '/robot/send',
    note: '钉钉自定义机器人（无 token，预期 errcode 拒绝）',
  },
  {
    host: 'api.dingtalk.com',
    path: '/v1.0/robot/oToMessages/batchSend',
    note: '钉钉新版 OpenAPI（无凭证，预期鉴权拒绝）',
  },
])

/** 恒定时间字符串比较，避免诊断密钥被时序侧信道探测。 */
export function secureEqual(a, b) {
  const bytesA = new TextEncoder().encode(String(a || ''))
  const bytesB = new TextEncoder().encode(String(b || ''))
  if (bytesA.length !== bytesB.length) return false
  let diff = 0
  for (let i = 0; i < bytesA.length; i++) diff |= bytesA[i] ^ bytesB[i]
  return diff === 0
}

function describeError(error) {
  const message = String(error?.message || error || 'unknown error')
  const cause = error?.cause ? ` (cause: ${String(error.cause.message || error.cause)})` : ''
  return `${error?.name ? `${error.name}: ` : ''}${message}${cause}`.slice(0, 300)
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

async function probeFetch(host, timeoutMs, fetchImpl, now) {
  const started = now()
  try {
    const response = await withTimeout(
      fetchImpl(`https://${host}/`, {
        method: 'GET',
        headers: { 'user-agent': 'dpmaster-egress-probe' },
        redirect: 'manual',
      }),
      timeoutMs,
      'fetch',
    )
    return { reachable: true, status: response.status, ms: now() - started }
  } catch (error) {
    return { reachable: false, error: describeError(error), ms: now() - started }
  }
}

/** 读到对端关闭为止。请求里带了 Connection: close，所以 EOF 就是响应结束。 */
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
      // 读侧已随连接关闭时释放会抛，不影响结论。
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

function decodeChunked(body) {
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

/** 把原始字节切成 { statusLine, headers, body }，并按需要解 chunked。 */
function parseHttpResponse(bytes) {
  const text = new TextDecoder().decode(bytes)
  const split = text.indexOf('\r\n\r\n')
  if (split < 0) return { statusLine: text.split('\r\n', 1)[0].slice(0, 120), headers: {}, body: '' }
  const head = text.slice(0, split)
  const rawBody = text.slice(split + 4)
  const [statusLine, ...headerLines] = head.split('\r\n')
  const headers = {}
  for (const line of headerLines) {
    const at = line.indexOf(':')
    if (at > 0) headers[line.slice(0, at).trim().toLowerCase()] = line.slice(at + 1).trim()
  }
  const chunked = (headers['transfer-encoding'] || '').toLowerCase().includes('chunked')
  return {
    statusLine: statusLine.slice(0, 120),
    headers,
    body: chunked ? decodeChunked(rawBody) : rawBody,
  }
}

/**
 * 走 raw socket 发一次真实的 HTTPS POST 并完整读回响应。
 * 这是「能不能用 connect() 顶替 fetch() 投递 webhook」的决定性验证：
 * 光有 TLS 握手不够，还要能发请求体、能把响应（可能是 chunked）解回来。
 */
async function probeSocketPost(target, timeoutMs, connect, now) {
  if (!connect) {
    return { reachable: false, error: 'cloudflare:sockets unavailable in this runtime' }
  }
  const started = now()
  let socket
  try {
    const payload = JSON.stringify({ msgtype: 'text', text: { content: 'dpmaster egress probe' } })
    const body = new TextEncoder().encode(payload)
    socket = connect({ hostname: target.host, port: 443 }, { secureTransport: 'on' })
    await withTimeout(socket.opened, timeoutMs, 'tls handshake')

    const head = [
      `POST ${target.path} HTTP/1.1`,
      `Host: ${target.host}`,
      'User-Agent: dpmaster-egress-probe',
      'Content-Type: application/json',
      `Content-Length: ${body.byteLength}`,
      // 不要压缩响应，省掉一层解码；也不要 keep-alive，靠 EOF 判定响应结束。
      'Accept-Encoding: identity',
      'Connection: close',
      '',
      '',
    ].join('\r\n')

    const writer = socket.writable.getWriter()
    // ★ 用编码后的字节长度拼，不能用 head.length —— 那是 UTF-16 码元数，
    // 一旦请求头里出现非 ASCII 就会算错偏移。
    const headBytes = new TextEncoder().encode(head)
    const request = new Uint8Array(headBytes.byteLength + body.byteLength)
    request.set(headBytes, 0)
    request.set(body, headBytes.byteLength)
    await withTimeout(writer.write(request), timeoutMs, 'socket write')
    writer.releaseLock()

    const raw = await readAll(socket, timeoutMs)
    const parsed = parseHttpResponse(raw)
    return {
      reachable: true,
      statusLine: parsed.statusLine,
      contentType: parsed.headers['content-type'] || null,
      transferEncoding: parsed.headers['transfer-encoding'] || null,
      bytes: raw.byteLength,
      body: parsed.body.slice(0, 300),
      ms: now() - started,
    }
  } catch (error) {
    return { reachable: false, error: describeError(error), ms: now() - started }
  } finally {
    try {
      await socket?.close()
    } catch {
      // 关闭失败不影响探测结论。
    }
  }
}

async function probeSocket(host, timeoutMs, connect, now) {
  if (!connect) {
    return { reachable: false, error: 'cloudflare:sockets unavailable in this runtime' }
  }
  const started = now()
  let socket
  try {
    socket = connect({ hostname: host, port: 443 }, { secureTransport: 'on' })
    await withTimeout(socket.opened, timeoutMs, 'tls handshake')

    const writer = socket.writable.getWriter()
    const request = [
      'HEAD / HTTP/1.1',
      `Host: ${host}`,
      'User-Agent: dpmaster-egress-probe',
      'Connection: close',
      '',
      '',
    ].join('\r\n')
    await withTimeout(writer.write(new TextEncoder().encode(request)), timeoutMs, 'socket write')
    writer.releaseLock()

    const reader = socket.readable.getReader()
    const { value } = await withTimeout(reader.read(), timeoutMs, 'socket read')
    reader.releaseLock()
    const statusLine = new TextDecoder()
      .decode(value ?? new Uint8Array())
      .split('\r\n', 1)[0]
      .slice(0, 120)
    return { reachable: true, statusLine, ms: now() - started }
  } catch (error) {
    return { reachable: false, error: describeError(error), ms: now() - started }
  } finally {
    try {
      await socket?.close()
    } catch {
      // 关闭失败不影响探测结论。
    }
  }
}

/**
 * 跑一轮出口探测。
 * `runtime` 可注入 `fetchImpl` / `loadConnect` / `now`，便于在 Node 里测试外壳逻辑。
 */
export async function runEgressProbe(targets = DEFAULT_TARGETS, runtime = {}) {
  const fetchImpl = runtime.fetchImpl || fetch
  const now = runtime.now || Date.now
  const timeoutMs = runtime.timeoutMs || DEFAULT_TIMEOUT_MS
  const connect = runtime.loadConnect ? await runtime.loadConnect() : null

  const results = []
  for (const target of targets.slice(0, MAX_TARGETS)) {
    const [viaFetch, viaSocket] = await Promise.all([
      probeFetch(target.host, timeoutMs, fetchImpl, now),
      probeSocket(target.host, timeoutMs, connect, now),
    ])
    results.push({ host: target.host, note: target.note, fetch: viaFetch, socket: viaSocket })
  }
  return { schema: 1, timeoutMs, results }
}

/** 只跑 POST 往返验证。目标固定，不接受自定义主机：这条路径会真的发请求体。 */
export async function runPostRoundTrip(runtime = {}) {
  const now = runtime.now || Date.now
  const timeoutMs = runtime.timeoutMs || DEFAULT_TIMEOUT_MS
  const connect = runtime.loadConnect ? await runtime.loadConnect() : null
  const results = []
  for (const target of DEFAULT_POST_TARGETS) {
    results.push({
      host: target.host,
      path: target.path,
      note: target.note,
      socket: await probeSocketPost(target, timeoutMs, connect, now),
    })
  }
  return { schema: 1, mode: 'post-round-trip', timeoutMs, results }
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  })

/**
 * 端点处理器。返回 `null` 表示"这个端点不存在"，调用方应把请求交回静态资源，
 * 从而在未启用诊断时得到真实 404，不泄露端点是否存在。
 */
export async function handleEgressProbe(request, env, runtime = {}) {
  const secret = env?.EGRESS_DIAG_SECRET
  if (!secret) return null
  if (!secureEqual(request.headers.get('x-dp-diag-secret'), secret)) return null
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
  }

  let targets = DEFAULT_TARGETS
  let mode = 'reachability'
  try {
    const body = await request.text()
    if (body.trim()) {
      const parsed = JSON.parse(body)
      if (parsed?.mode === 'post') mode = 'post'
      if (Array.isArray(parsed?.hosts) && parsed.hosts.length > 0) {
        targets = parsed.hosts
          .filter((host) => typeof host === 'string' && /^[a-z0-9.-]{1,253}$/i.test(host))
          .map((host) => ({ host, note: 'custom' }))
      }
    }
  } catch {
    return json({ ok: false, error: 'bad_json', message: '探针请求体不是有效 JSON' }, 400)
  }
  if (mode === 'post') {
    return json({ ok: true, ...(await runPostRoundTrip(runtime)) })
  }
  if (targets.length === 0) {
    return json({ ok: false, error: 'no_targets', message: '没有合法的目标主机' }, 422)
  }

  return json({ ok: true, ...(await runEgressProbe(targets, runtime)) })
}

export { DEFAULT_TARGETS, DEFAULT_POST_TARGETS }
