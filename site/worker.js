// CF Workers 静态资源托管的入口脚本（wrangler.jsonc 的 "main"）。
// 作用：先接住反馈与统计端点，其余请求交回静态资源绑定（含预渲染 HTML 与真实 404）。
// 逻辑复用 functions/_feedback-core.js（单一事实来源）；wrangler 构建期会打包这个 import。
import { handleFeedback } from './functions/_feedback-core.js'
import { handleAnalytics } from './functions/_analytics-core.js'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/api/feedback') {
      if (request.method === 'POST') return handleFeedback(request, env)
      if (request.method === 'OPTIONS') return new Response(null, { status: 204 })
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
    }
    if (url.pathname === '/api/analytics') {
      if (request.method === 'POST') return handleAnalytics(request)
      if (request.method === 'OPTIONS') return new Response(null, { status: 204 })
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
    }
    // 其余请求交给静态资源绑定：已知路由命中预渲染 HTML，未知路径返回真实 404。
    return env.ASSETS.fetch(request)
  },
}
