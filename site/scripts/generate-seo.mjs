import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { SITE } from '../src/config/site.ts'
import { generateDiscoveryFiles } from '../src/lib/discovery.ts'
import { getPageMeta } from '../src/lib/pageMeta.ts'
import { PUBLIC_PATHS } from '../src/lib/publicRoutes.ts'
import { renderRouteHead, replaceRouteHead } from '../src/lib/seoHead.ts'
import {
  collectRouteLastModified,
  renderRouteLastModifiedModule,
} from './last-modified.mjs'

const lastModified = collectRouteLastModified()
const files = generateDiscoveryFiles(SITE, lastModified)
const outputs = Object.entries(files).map(([name, content]) => [
  new URL(`../public/${name}`, import.meta.url),
  content,
])
outputs.push([
  new URL('../src/data/routeLastModified.ts', import.meta.url),
  renderRouteLastModifiedModule(lastModified),
])

// index.html 的首页 head 由渲染 47 条路由的同一个渲染器生成。手工维护过一次
// canonical / hreflang / og:url 之后就会和 SITE.origin 漂移，这里彻底断掉这条路。
const indexUrl = new URL('../index.html', import.meta.url)
const indexHtml = readFileSync(indexUrl, 'utf8').replace(/\r\n/g, '\n')
outputs.push([
  indexUrl,
  replaceRouteHead(
    indexHtml,
    renderRouteHead(getPageMeta('/', SITE, lastModified['/']), SITE),
  ),
])

const write = process.argv.includes('--write')
const check = process.argv.includes('--check')
if (write === check) {
  console.error('Usage: node scripts/generate-seo.mjs --write | --check')
  process.exit(2)
}

if (write) {
  for (const [url, content] of outputs) writeFileSync(url, content, 'utf8')
  console.log(
    `[seo] generated ${PUBLIC_PATHS.length} routes + sitemap/robots/llms/summaries + index.html head`,
  )
} else {
  let drift = false
  for (const [url, expected] of outputs) {
    let actual = ''
    try {
      actual = readFileSync(url, 'utf8').replace(/\r\n/g, '\n')
    } catch {
      // 统一按“生成产物缺失”报告，不暴露平台差异的异常格式。
    }
    if (actual !== expected) {
      drift = true
      console.error(`[seo] stale: ${fileURLToPath(url)}`)
    }
  }
  if (drift) process.exit(1)
  console.log(
    `[seo] verified ${PUBLIC_PATHS.length} routes + sitemap/robots/llms/summaries + index.html head`,
  )
}
