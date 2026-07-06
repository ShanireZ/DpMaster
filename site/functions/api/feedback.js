// Cloudflare Pages Functions 入口（若改用 CF Pages 部署时生效）。
// 真正的逻辑在 ../_feedback-core.js（单一事实来源，被 Worker / Pages / EdgeOne 三处复用）。
//
// ★注意：你当前的 CF 部署用的是「Workers 静态资源托管」(wrangler.jsonc)，不是 Pages，
//   所以这个 functions/ 目录不会被自动加载 —— /api/feedback 由 ../worker.js 提供。
//   本文件仅在你日后切到 CF Pages 时才用得上。
import { handleFeedback } from '../_feedback-core.js'

export const onRequestPost = (context) => handleFeedback(context.request, context.env)

// 同源无需 CORS；保险起见给个 OPTIONS 兜底
export const onRequestOptions = () => new Response(null, { status: 204 })
