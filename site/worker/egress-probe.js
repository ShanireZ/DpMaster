// Worker 出口可達性探針（一次性診斷用，不屬於站台功能）。
//
// 背景：Cloudflare 資料中心出口到釘釘 oapi.dingtalk.com 的 TLS 被系統性打斷
// （2026-08 多輪實測穩定 525），而普通海外節點到釘釘正常。站台收斂到單一 CF
// Worker 之後，原來經國內站中轉的告警連線路徑沒了，必須先測清楚"到底哪條出口能通"
// 才能選送達方案。
//
// 探針對每個目標跑兩條出口：
//   - fetch()：走 Cloudflare 的反向代理棧，出口在 Cloudflare 公開 IP 段內。
//   - connect()（cloudflare:sockets）：官方文件明確說明其出口前綴**不在**
//     Cloudflare 公開 IP 段裡。如果對端是按 CF 公開段封的，這條有機會通。
//
// 兩種模式：
//   - 預設（可達性）：對每個目標 GET / 與 HEAD /，純讀，無副作用。
//   - `{"mode":"post"}`（POST 往返）：向釘釘兩個接入點發一次真實的 HTTPS POST，
//     驗證「發請求體 + 完整讀迴回應（含 chunked）」這條連線路徑。★ 不帶 access_token
//     與簽名，釘釘會用 errcode 拒絕，不會向任何群投遞訊息。
//
// 啟用方式：給 Worker 配 EGRESS_DIAG_SECRET，然後帶 x-dp-diag-secret 頭 POST。
// 不配這個變數時端點不存在（請求落回靜態資源，與任意未知路徑同樣回傳
// POST 405 / GET 404，不洩露端點是否存在）。

const DEFAULT_TARGETS = Object.freeze([
  { host: 'oapi.dingtalk.com', note: '钉钉自定义机器人（当前 webhook 接入点）' },
  { host: 'api.dingtalk.com', note: '钉钉新版 OpenAPI（不同接入点）' },
  { host: 'qyapi.weixin.qq.com', note: '企业微信群机器人' },
  { host: 'open.feishu.cn', note: '飞书（国内）' },
  { host: 'open.larksuite.com', note: 'Lark（国际）' },
  { host: 'api.telegram.org', note: 'Telegram Bot（海外对照组）' },
  { host: 'www.cloudflare.com', note: '对照组：探针自身是否正常' },
])

import { postOverSocket } from './socket-fetch.js'

const DEFAULT_TIMEOUT_MS = 8000
const MAX_TARGETS = 12

/**
 * POST 往返驗證目標。★ 一律不帶 access_token / 簽名：釘釘會用 errcode 拒絕，
 * 不會向任何群投遞訊息。這裡要驗證的是「連接 + 發請求體 + 完整讀迴回應」這條
 * 連線路徑本身，不是投遞。
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

/** 恆定時間字串比較，避免診斷金鑰被時序側信道探測。 */
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

/**
 * 走 raw socket 發一次真實的 HTTPS POST 並完整讀迴回應。
 * 這是「能不能用 connect() 頂替 fetch() 投遞 webhook」的決定性驗證：
 * 光有 TLS 握手不夠，還要能發請求體、能把回應（可能是 chunked）解回來。
 * ★ 重複使用 worker/socket-fetch.js —— 那份是生產投遞真正在用的實作，探針必須
 * 測的是它，而不是一份長得像它的副本。
 */
async function probeSocketPost(target, timeoutMs, connect, now) {
  if (!connect) {
    return { reachable: false, error: 'cloudflare:sockets unavailable in this runtime' }
  }
  const started = now()
  try {
    const parsed = await postOverSocket({
      url: `https://${target.host}${target.path}`,
      body: JSON.stringify({ msgtype: 'text', text: { content: 'dpmaster egress probe' } }),
      connect,
      timeoutMs,
    })
    return {
      reachable: true,
      statusLine: parsed.statusLine,
      contentType: parsed.headers['content-type'] || null,
      transferEncoding: parsed.headers['transfer-encoding'] || null,
      body: parsed.body.slice(0, 300),
      ms: now() - started,
    }
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
      // 關閉失敗不影響探測結論。
    }
  }
}

/**
 * 跑一輪出口探測。
 * `runtime` 可注入 `fetchImpl` / `loadConnect` / `now`，便於在 Node 裡測試外殼邏輯。
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

/** 只跑 POST 往返驗證。目標固定，不接受自定義主機：這條路徑會真的發請求體。 */
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
 * 端點處理器。回傳 `null` 表示"這個端點不存在"，呼叫方應把請求交回靜態資源，
 * 從而在未啟用診斷時得到真實 404，不洩露端點是否存在。
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
