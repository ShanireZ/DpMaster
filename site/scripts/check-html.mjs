// 构建产物的 HTML 合同门禁。
//
// 1. 每条预渲染路由都要落成 `<route>.html` 与 `<route>/index.html` 两份，加上
//    首页的 index.html 和真实 404.html —— Worker 的静态资源绑定按这两种形态命中。
// 2. 任何 HTML 都不得包含手工注入的 Cloudflare Web Analytics beacon：
//    Cloudflare 代理会自动注入，手工再来一份就是重复统计。

import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PRERENDER_PATHS } from '../src/lib/publicRoutes.ts'

const MANUAL_BEACON_MARKERS = Object.freeze([
  '<!-- Cloudflare Web Analytics -->',
  'static.cloudflareinsights.com',
  'data-cf-beacon',
])

function htmlFilesUnder(root) {
  const files = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name)
    if (entry.isDirectory()) files.push(...htmlFilesUnder(path))
    else if (entry.isFile() && extname(entry.name) === '.html') files.push(path)
  }
  return files
}

export function expectedHtmlCount(paths = PRERENDER_PATHS) {
  // 首页只有 index.html，其余每条路由两份，再加一个 404.html。
  return 1 + (paths.length - 1) * 2 + 1
}

export function checkBuildHtml({ dir = resolve('dist') } = {}) {
  const htmlFiles = htmlFilesUnder(dir)
  const expected = expectedHtmlCount()
  const errors = []

  if (htmlFiles.length !== expected) {
    errors.push(`HTML count ${htmlFiles.length} does not match ${expected}`)
  }

  for (const path of htmlFiles) {
    const html = readFileSync(path, 'utf8')
    const leaked = MANUAL_BEACON_MARKERS.filter((marker) => html.includes(marker))
    if (leaked.length > 0) {
      errors.push(`Manual Web Analytics beacon leaked into ${path}: ${leaked.join(', ')}`)
    }
  }

  return { ok: errors.length === 0, htmlFiles: htmlFiles.length, errors }
}

function main() {
  const result = checkBuildHtml()
  if (!result.ok) {
    for (const error of result.errors) console.error(`[html] ${error}`)
    process.exitCode = 1
    return
  }
  console.log(
    `[html] ${result.htmlFiles} pages rendered, none carries a manual Web Analytics beacon`,
  )
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) main()
