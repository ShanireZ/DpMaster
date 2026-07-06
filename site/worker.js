// CF Workers 静态资源托管的入口脚本（wrangler.jsonc 的 "main"）。
// 作用：先接住 /api/feedback（反馈端点），其余请求全部交回静态资源绑定（含 SPA 回退）。
// 逻辑复用 functions/_feedback-core.js（单一事实来源）；wrangler 构建期会打包这个 import。
import { handleFeedback } from './functions/_feedback-core.js'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/api/feedback') {
      if (request.method === 'POST') return handleFeedback(request, env)
      if (request.method === 'OPTIONS') return new Response(null, { status: 204 })
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
    }
    // 其余请求交给静态资源绑定：命中文件则返回文件，未命中按 SPA 回退到 index.html。
    return env.ASSETS.fetch(request)
  },
}
