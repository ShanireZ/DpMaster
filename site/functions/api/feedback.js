// Cloudflare Pages Function —— 接收 DP 图谱的用户反馈，转发到你的 webhook。
//
// 部署后可用地址：POST /api/feedback（同源，前端 FeedbackWidget 已对接）。
//
// ★配置（二选一，在 Cloudflare Pages 项目 → Settings → Environment variables 里加）：
//   FEEDBACK_WEBHOOK_URL   一个群机器人 webhook（企业微信 / 飞书 / 钉钉 / Discord / Slack 均可）
//   FEEDBACK_WEBHOOK_KIND  可选：'wecom'(企业微信,默认) | 'feishu'(飞书) | 'discord' | 'slack'
// 未配置 webhook 也不会报错：内容会 console.log 进 Cloudflare 函数日志，前端仍显示成功。
//
// EdgeOne Pages 用户：EdgeOne 边缘函数入口/API 与此略不同，需按其文档另包一层同名端点。

const MAX = 4000

function clip(s, n) {
  s = String(s == null ? '' : s)
  return s.length > n ? s.slice(0, n) + '…' : s
}

function buildText(d) {
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

// 各家群机器人的 body 格式不同，这里按 kind 组装。
function webhookBody(kind, text) {
  switch (kind) {
    case 'feishu':
      return { msg_type: 'text', content: { text } }
    case 'discord':
      return { content: text }
    case 'slack':
      return { text }
    case 'wecom':
    default:
      return { msgtype: 'text', text: { content: text } }
  }
}

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })

export async function onRequestPost(context) {
  const { request, env } = context
  let data
  try {
    data = await request.json()
  } catch {
    return json({ ok: false, error: 'bad_json' }, 400)
  }

  const description = String(data && data.description ? data.description : '').trim()
  if (description.length < 4) return json({ ok: false, error: 'empty' }, 422)

  // 简单防滥用：整体体积上限
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

  // 无论是否配置 webhook，都落一条日志（Cloudflare 函数日志可查，避免丢失）
  console.log('[feedback]', text.replace(/\n/g, ' | '))

  const url = env && env.FEEDBACK_WEBHOOK_URL
  if (url) {
    const kind = (env && env.FEEDBACK_WEBHOOK_KIND) || 'wecom'
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookBody(kind, text)),
      })
      if (!r.ok) console.log('[feedback] webhook non-2xx:', r.status)
    } catch (e) {
      console.log('[feedback] webhook error:', String(e))
    }
  }

  // 只要请求合法就回成功，保证学生侧体验顺滑（内容已进日志/或已转发）
  return json({ ok: true })
}

// 同源无需 CORS；保险起见给个 OPTIONS 兜底
export function onRequestOptions() {
  return new Response(null, { status: 204 })
}
