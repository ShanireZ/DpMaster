// Cloudflare Worker 入口（wrangler.jsonc 的 "main"）—— 站点唯一的发布目标。
// 作用：先接住反馈、统计与诊断端点，在公开 GET/HEAD 上协商 HTML/Markdown，
// 其余请求交回静态资源绑定（含预渲染 HTML 与真实 404）。
import { handleFeedback } from './worker/feedback-core.js'
import { handleAnalytics } from './worker/analytics-core.js'
import { corsDecision, preflightResponse } from './worker/webhook-core.js'
import { handleEgressProbe } from './worker/egress-probe.js'
import { negotiateRepresentation } from './worker/content-negotiation.js'
import {
  CONTENT_SIGNAL_HEADER,
  markdownAssetPath,
} from './src/lib/publicWebContract.ts'
import routeSummaries from './public/route-summaries.json' with { type: 'json' }

const PUBLIC_PATHS = new Set(routeSummaries.routes.map((route) => route.path))

function mergeVary(headers, value) {
  const values = (headers.get('Vary') ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
  if (!values.some((entry) => entry.toLowerCase() === value.toLowerCase())) {
    values.push(value)
  }
  headers.set('Vary', values.join(', '))
}

function representationResponse(asset, url, representation, includeBody) {
  const headers = new Headers(asset.headers)
  const canonical = `${routeSummaries.origin}${url.pathname}`
  mergeVary(headers, 'Accept')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Content-Signal', CONTENT_SIGNAL_HEADER)
  // 页面表示都必须重验证；Markdown 不得因内部 `.md` 扩展名获得比 HTML 更宽的浏览器缓存。
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
  if (representation === 'markdown') {
    headers.set('Content-Type', 'text/markdown; charset=utf-8')
    headers.set('Content-Language', 'zh-CN')
    headers.set(
      'Link',
      `<${canonical}>; rel="canonical", <${canonical}>; rel="alternate"; type="text/html"`,
    )
  } else {
    // Static Assets exposes a strong validator, but Cloudflare may encode HTML on
    // the way out. A weak validator remains valid across that byte transformation
    // and is therefore not stripped at the edge.
    const etag = headers.get('ETag')
    if (etag && !etag.startsWith('W/')) headers.set('ETag', `W/${etag}`)
    headers.set('Link', `<${canonical}>; rel="alternate"; type="text/markdown"`)
  }
  return new Response(includeBody ? asset.body : null, { status: asset.status, headers })
}

async function negotiatedResponse(request, env, url, representation) {
  if (representation === null) {
    return new Response(request.method === 'HEAD' ? null : 'Not Acceptable', {
      status: 406,
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
        Vary: 'Accept',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }
  const assetRequest = representation === 'markdown'
    ? new Request(new URL(markdownAssetPath(url.pathname), url), request)
    : request
  const asset = await env.ASSETS.fetch(assetRequest)
  return representationResponse(asset, url, representation, request.method !== 'HEAD')
}

// cloudflare:sockets 只在 Workers 运行时存在；用惰性动态 import，
// 这样 Node 下的合同测试也能直接 import 本文件。
const loadConnect = async () => {
  try {
    return (await import('cloudflare:sockets')).connect
  } catch {
    return null
  }
}

function analyticsRuntime(env, context) {
  return {
    env,
    waitUntil: context?.waitUntil?.bind(context),
    write(entry) {
      if (!env.ANALYTICS) return
      const metadata = entry.metadata || {}
      env.ANALYTICS.writeDataPoint({
        blobs: [
          entry.provider,
          entry.name,
          entry.path,
          entry.title,
          String(metadata.name || ''),
          String(metadata.rating || ''),
          // blob7 原来是 region。区域概念已取消，但 dpmaster 数据集里还有历史行，
          // 抽掉这一格会让 build 从 blob8 移到 blob7、新旧数据混在一起，
          // 因此保留空占位，位置不动。
          '',
          String(metadata.build || ''),
        ],
        doubles: [
          Number(metadata.value || 0),
          Number(metadata.delta || 0),
          1,
        ],
        indexes: [entry.provider],
      })
    },
  }
}

export default {
  async fetch(request, env, context) {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/_representations/')) {
      return new Response(request.method === 'HEAD' ? null : 'Not Found', {
        status: 404,
        headers: { 'X-Robots-Tag': 'noindex, nofollow' },
      })
    }
    if (url.pathname === '/api/feedback') {
      if (request.method === 'POST') return handleFeedback(request, env)
      if (request.method === 'OPTIONS') return preflightResponse(corsDecision(request))
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
    }
    if (url.pathname === '/api/analytics') {
      if (request.method === 'POST') {
        return handleAnalytics(request, analyticsRuntime(env, context))
      }
      if (request.method === 'OPTIONS') return preflightResponse(corsDecision(request))
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
    }
    if (url.pathname === '/api/_diag/egress') {
      // 未配置 EGRESS_DIAG_SECRET 或密钥不匹配时返回 null，请求落回静态资源，
      // 得到与任何其他未知路径一样的真实 404 —— 不泄露端点是否存在。
      const probe = await handleEgressProbe(request, env, { loadConnect })
      if (probe) return probe
    }
    if (
      (request.method === 'GET' || request.method === 'HEAD')
      && PUBLIC_PATHS.has(url.pathname)
    ) {
      return negotiatedResponse(
        request,
        env,
        url,
        negotiateRepresentation(request.headers.get('Accept')),
      )
    }
    // 其余请求交给静态资源绑定：已知路由命中预渲染 HTML，未知路径返回真实 404。
    return env.ASSETS.fetch(request)
  },
}
