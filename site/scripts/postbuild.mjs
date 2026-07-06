// 构建后处理：为纯静态 SPA（react-router BrowserRouter / history 模式）生成
// 深链回退产物，让 /part/a/knapsack-01 这类路径直接访问或刷新时也能进入 SPA。
//
// 两家托管机制不同，这里两手都备好：
//   - Cloudflare Workers：靠 wrangler.jsonc 的 assets.not_found_handling
//     = "single-page-application"（返回 index.html + HTTP 200）。本脚本产物对它无副作用。
//   - EdgeOne Pages：平台不支持 edgeone.json 的 rewrites 做 SPA 回退，因此：
//       (1) 生成 dist/404.html（复制自 index.html）——安全网，未命中路径返回它（状态码 404）。
//       (2) 生成 dist/edge-functions/[[default]].js——catch-all Edge Function，把未命中
//           静态资源的路径回退到 SPA 入口并返回 HTTP 200（优于 404 状态）。EdgeOne 规则
//           「静态资源优先于函数」，故 /assets/* 等真实文件不会进入本函数。
//           ⚠️ EdgeOne 官方未记载此用法，需部署后实测；若未生效则自动回落到 (1) 的 404.html，
//           页面功能不受影响，仅状态码差异。

import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const distDir = fileURLToPath(new URL('../dist/', import.meta.url))
const indexPath = join(distDir, 'index.html')

if (!existsSync(indexPath)) {
  console.error('[postbuild] 未找到 dist/index.html，跳过深链回退产物生成')
  process.exit(0)
}

const html = readFileSync(indexPath, 'utf8')

// (1) 404.html —— EdgeOne 安全网
copyFileSync(indexPath, join(distDir, '404.html'))
console.log('[postbuild] 已生成 dist/404.html（EdgeOne 深链安全网 · 404 状态）')

// (2) Edge Function catch-all —— EdgeOne 深链返回 HTTP 200
//     HTML 内联注入，避免运行时 fetch/asset API 依赖；每次构建随 index.html 的
//     hash 资源引用自动刷新，无需手改。
const fnDir = join(distDir, 'edge-functions')
mkdirSync(fnDir, { recursive: true })
const fnSource =
  '// 自动生成，请勿手改（源见 site/scripts/postbuild.mjs）。\n' +
  '// EdgeOne Pages Edge Function（catch-all）：未命中静态资源的路径 → SPA 入口 + HTTP 200，\n' +
  '// 交给 react-router 的 path="*" 渲染站内 404。静态资源由 EdgeOne 优先命中，不会进入本函数。\n' +
  'const HTML = ' + JSON.stringify(html) + '\n\n' +
  'export default function onRequest() {\n' +
  '  return new Response(HTML, {\n' +
  '    status: 200,\n' +
  "    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },\n" +
  '  })\n' +
  '}\n'
writeFileSync(join(fnDir, '[[default]].js'), fnSource)
console.log('[postbuild] 已生成 dist/edge-functions/[[default]].js（EdgeOne 深链 200 兜底 · 需部署实测）')
