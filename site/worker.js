// Cloudflare Worker 入口（wrangler.jsonc 的 "main"）—— 站台唯一的發佈目標。
// 作用：先接住回饋、統計與診斷端點，在公開 GET/HEAD 上協商 HTML/Markdown，
// 其餘請求交回靜態資源綁定（含預繪製 HTML 與真實 404）。
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
  // 頁面表示都必須重驗證；Markdown 不得因內部 `.md` 副檔名獲得比 HTML 更寬的瀏覽器快取。
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
  if (representation === 'markdown') {
    headers.set('Content-Type', 'text/markdown; charset=utf-8')
    headers.set('Content-Language', 'zh-CN')
    headers.set(
      'Link',
      `<${canonical}>; rel="canonical", <${canonical}>; rel="alternate"; type="text/html"`,
    )
  } else {
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

// cloudflare:sockets 只在 Workers 執行環境存在；用惰性動態 import，
// 這樣 Node 下的合同測試也能直接 import 本檔案。
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
          // blob7 原來是 region。區域概念已取消，但 dpmaster 資料集裡還有歷史行，
          // 抽掉這一格會讓 build 從 blob8 移到 blob7、新舊資料混在一起，
          // 因此保留空佔位，位置不動。
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
      // 未設定 EGRESS_DIAG_SECRET 或金鑰不匹配時回傳 null，請求落回靜態資源，
      // 得到與任何其他未知路徑一樣的真實 404 —— 不洩露端點是否存在。
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
    // 其餘請求交給靜態資源綁定：已知路由命中預繪製 HTML，未知路徑回傳真實 404。
    return env.ASSETS.fetch(request)
  },
}
