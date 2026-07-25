// 区域构建后的平台 Adapter：
// - Cloudflare 直接使用 dist/cloudflare 与 wrangler 的 404-page。
// - EdgeOne 使用 dist/edgeone，并生成一个 catch-all Edge Function：
//   /api/feedback 与 /api/analytics 进入同源 API；其余静态未命中请求返回真实 404。

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const edgeOneDir = fileURLToPath(new URL('../dist/edgeone/', import.meta.url))
const notFoundPath = join(edgeOneDir, '404.html')

if (!existsSync(notFoundPath)) {
  console.error('[postbuild] 未找到 dist/edgeone/404.html，无法生成 EdgeOne Adapter')
  process.exit(1)
}

function inlineModule(relativeUrl, returnNames, prelude = '') {
  const source = readFileSync(fileURLToPath(new URL(relativeUrl, import.meta.url)), 'utf8')
    .replace(/^import .*_webhook-core\.js['"]\r?\n/gm, '')
    .replace(/^export /gm, '')
  return `(() => {\n${prelude}\n${source}\nreturn { ${returnNames.join(', ')} }\n})()`
}

const webhookModule = inlineModule('../functions/_webhook-core.js', ['clip', 'forwardWebhook'])
const feedbackModule = inlineModule(
  '../functions/_feedback-core.js',
  ['handleFeedback'],
  'const { clip, forwardWebhook } = webhook',
)
const analyticsModule = inlineModule(
  '../functions/_analytics-core.js',
  ['handleAnalytics'],
  'const { forwardWebhook } = webhook',
)
const notFoundHtml = readFileSync(notFoundPath, 'utf8')
const internalBody = JSON.stringify({
  ok: false,
  error: 'internal',
  message: '服务暂时不可用',
})

const fnDir = join(edgeOneDir, 'edge-functions')
mkdirSync(fnDir, { recursive: true })
const fnSource = `// 自动生成，请勿手改（源见 scripts/postbuild.mjs 与 functions/_*-core.js）。
const webhook = ${webhookModule}
const feedback = ${feedbackModule}
const analytics = ${analyticsModule}
const NOT_FOUND_HTML = ${JSON.stringify(notFoundHtml)}

function internalError(label, error) {
  console.error(label, error)
  return new Response(${JSON.stringify(internalBody)}, {
    status: 500,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export default async function onRequest(context) {
  const request = context && context.request
  if (!request) {
    return new Response(NOT_FOUND_HTML, {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
  }

  const pathname = new URL(request.url).pathname
  if (pathname === '/api/feedback') {
    try {
      if (request.method === 'POST') {
        return await feedback.handleFeedback(request, (context && context.env) || {})
      }
      if (request.method === 'OPTIONS') return new Response(null, { status: 204 })
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
    } catch (error) {
      return internalError('[feedback] edge handler failed', error)
    }
  }

  if (pathname === '/api/analytics') {
    try {
      if (request.method === 'POST') {
        return await analytics.handleAnalytics(request, {
          env: (context && context.env) || {},
          waitUntil: context && typeof context.waitUntil === 'function'
            ? context.waitUntil.bind(context)
            : undefined,
        })
      }
      if (request.method === 'OPTIONS') return new Response(null, { status: 204 })
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
    } catch (error) {
      return internalError('[analytics] edge handler failed', error)
    }
  }

  return new Response(NOT_FOUND_HTML, {
    status: 404,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}
`

writeFileSync(join(fnDir, '[[default]].js'), fnSource, 'utf8')
console.log(
  '[postbuild] EdgeOne Adapter 已生成：反馈 + 区域统计 + 未知路径真实 404',
)
