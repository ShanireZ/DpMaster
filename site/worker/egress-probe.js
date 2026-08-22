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
// 全部目标都只做无副作用的探测（GET 根路径 / HEAD 根路径），不会真的发出消息。
//
// 启用方式：给 Worker 配 EGRESS_DIAG_SECRET，然后带 x-dp-diag-secret 头 POST。
// 不配这个变量时端点不存在（请求落回静态资源，返回真实 404）。

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
  try {
    const body = await request.text()
    if (body.trim()) {
      const parsed = JSON.parse(body)
      if (Array.isArray(parsed?.hosts) && parsed.hosts.length > 0) {
        targets = parsed.hosts
          .filter((host) => typeof host === 'string' && /^[a-z0-9.-]{1,253}$/i.test(host))
          .map((host) => ({ host, note: 'custom' }))
      }
    }
  } catch {
    return json({ ok: false, error: 'bad_json', message: '探针请求体不是有效 JSON' }, 400)
  }
  if (targets.length === 0) {
    return json({ ok: false, error: 'no_targets', message: '没有合法的目标主机' }, 422)
  }

  return json({ ok: true, ...(await runEgressProbe(targets, runtime)) })
}

export { DEFAULT_TARGETS }
