// 反馈处理核心 —— 被三处入口复用（单一事实来源）：
//   - CF Workers 静态资源托管：../worker.js 里 import 本文件，路由 /api/feedback。
//   - CF Pages Functions：./api/feedback.js 薄封装 import 本文件（若改用 Pages 部署）。
//   - EdgeOne Pages 边缘函数：scripts/postbuild.mjs 构建期把本文件内联进 dist/edge-functions/api/feedback.js。
// 三家运行时都基于 Fetch API（Request/Response/fetch/crypto.subtle），故同一函数通用。
//
// ★环境变量（在各托管平台配置）：
//   FEEDBACK_WEBHOOK_URL    群机器人 webhook（钉钉 / 企业微信 / 飞书 / Discord / Slack）
//   FEEDBACK_WEBHOOK_KIND   'dingtalk' | 'wecom'(默认) | 'feishu' | 'discord' | 'slack'
//   FEEDBACK_WEBHOOK_SECRET 仅钉钉「加签」模式：机器人加签密钥（SEC 开头）。用「关键词」模式则不设。

const MAX = 4000

function clip(s, n) {
  s = String(s == null ? '' : s)
  return s.length > n ? s.slice(0, n) + '…' : s
}

function buildText(d) {
  // 开头含「反馈」「DP 图谱」，方便钉钉「自定义关键词」模式命中
  const lines = [
    '🐞 DP 图谱 · 新反馈',
    `类型：${clip(d.kind, 20)}`,
    `页面：${clip(d.page, 120)}（${clip(d.path, 120)}）`,
    `描述：${clip(d.description, 1500)}`,
  ]
  if (d.steps) lines.push(`复现/期望：${clip(d.steps, 800)}`)
  if (d.contact) lines.push(`联系：${clip(d.contact, 120)}`)
  lines.push(`环境：${clip(d.viewport, 40)} · ${clip(d.ua, 300)}`)
  lines.push(`时间：${clip(d.ts, 40)}`)
  return lines.join('\n')
}

// 钉钉与企业微信同为 {msgtype:'text', text:{content}}
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

// 钉钉「加签」：sign = urlEncode(base64(HmacSHA256(secret, `${timestamp}\n${secret}`)))，
// 再把 &timestamp=..&sign=.. 拼到 URL。用 Web Crypto（三家运行时原生支持）。
async function dingtalkSignedUrl(baseUrl, secret) {
  const timestamp = Date.now()
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(`${timestamp}\n${secret}`))
  let bin = ''
  const bytes = new Uint8Array(sigBuf)
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  const sign = encodeURIComponent(btoa(bin))
  const sep = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${sep}timestamp=${timestamp}&sign=${sign}`
}

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })

// 主处理：POST 一条反馈 → 落日志 + 转发 webhook。任何合法请求都回 {ok:true}（学生侧顺滑）。
export async function handleFeedback(request, env) {
  let data
  try {
    data = await request.json()
  } catch {
    return json({ ok: false, error: 'bad_json' }, 400)
  }

  const description = String(data && data.description ? data.description : '').trim()
  if (description.length < 4) return json({ ok: false, error: 'empty' }, 422)
  if (JSON.stringify(data).length > MAX * 4) return json({ ok: false, error: 'too_large' }, 413)

  const text = buildText({
    kind: data.kind,
    page: data.page,
    path: data.path,
    description,
    steps: data.steps,
    contact: data.contact,
    viewport: data.viewport,
    ua: data.ua,
    ts: data.ts,
  })

  console.log('[feedback]', text.replace(/\n/g, ' | '))

  const baseUrl = env && env.FEEDBACK_WEBHOOK_URL
  if (baseUrl) {
    const kind = (env && env.FEEDBACK_WEBHOOK_KIND) || 'wecom'
    try {
      let url = baseUrl
      if (kind === 'dingtalk' && env.FEEDBACK_WEBHOOK_SECRET) {
        url = await dingtalkSignedUrl(baseUrl, env.FEEDBACK_WEBHOOK_SECRET)
      }
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookBody(kind, text)),
      })
      if (!r.ok) console.log('[feedback] webhook non-2xx:', r.status)
      else {
        try {
          const j = await r.clone().json()
          if (j && j.errcode) console.log('[feedback] webhook errcode:', j.errcode, j.errmsg)
        } catch {
          /* 非 JSON 响应忽略 */
        }
      }
    } catch (e) {
      console.log('[feedback] webhook error:', String(e))
    }
  }

  return json({ ok: true })
}
