// 构建后处理：为纯静态 SPA 生成深链回退入口。
//
// 背景：本站用 react-router 的 BrowserRouter（history 模式），像
// /part/a/knapsack-01 这类深链在服务器上没有对应文件，直接访问或刷新
// 会 404。两家托管的回退机制不同：
//   - Cloudflare Workers：wrangler.jsonc 里 assets.not_found_handling
//     = "single-page-application"，未命中即返回 index.html（HTTP 200）。
//   - EdgeOne Pages：不支持 rewrites 做 SPA 回退，但会把 dist 根目录下的
//     404.html 作为「未命中路径」的响应返回（HTTP 404，但内容是 SPA 入口，
//     浏览器加载后 react-router 用 History API 接管，页面正常渲染）。
//
// 因此这里把 index.html 复制一份为 404.html，让 EdgeOne 侧深链可用。
// 对 Cloudflare 无副作用（它优先走 not_found_handling）。

import { copyFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const dist = new URL('../dist/', import.meta.url)
const index = new URL('index.html', dist)
const notFound = new URL('404.html', dist)

if (!existsSync(index)) {
  console.error('[postbuild] 未找到 dist/index.html，跳过 404.html 生成')
  process.exit(0)
}

copyFileSync(index, notFound)
console.log('[postbuild] 已生成 ' + fileURLToPath(notFound) + '（EdgeOne SPA 深链回退）')
