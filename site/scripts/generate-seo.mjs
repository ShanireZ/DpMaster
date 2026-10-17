import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { SITE } from '../src/config/site.ts'
import { generateDiscoveryFiles } from '../src/lib/discovery.ts'
import { getPageMeta } from '../src/lib/pageMeta.ts'
import { PUBLIC_PATHS } from '../src/lib/publicRoutes.ts'
import * as previousRouteEvidence from '../src/data/routeLastModified.ts'
import { renderRouteHead, replaceRouteHead } from '../src/lib/seoHead.ts'
import {
  collectRouteContentEvidence,
  renderRouteLastModifiedModule,
} from './last-modified.mjs'

const routeEvidence = collectRouteContentEvidence({
  previousLastModified: previousRouteEvidence.ROUTE_LAST_MODIFIED,
  previousContentDigests: previousRouteEvidence.ROUTE_CONTENT_DIGESTS ?? {},
  previousContentDigestVersion: previousRouteEvidence.ROUTE_CONTENT_DIGEST_VERSION ?? 0,
})
const { lastModified } = routeEvidence
const files = generateDiscoveryFiles(SITE, lastModified)
const outputs = Object.entries(files).map(([name, content]) => [
  new URL(`../public/${name}`, import.meta.url),
  content,
])
outputs.push([
  new URL('../src/data/routeLastModified.ts', import.meta.url),
  renderRouteLastModifiedModule(
    lastModified,
    routeEvidence.contentDigests,
    routeEvidence.contentDigestVersion,
  ),
])

// index.html 的首頁 head 由繪製 47 條路由的同一個繪製器生成。手動維護過一次
// canonical / hreflang / og:url 之後就會和 SITE.origin 漂移，這裡徹底斷掉這條路。
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
      // 統一按“生成產物缺失”報告，不暴露平台差異的異常格式。
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
