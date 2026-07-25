import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getSiteConfig } from '../src/config/site.ts'
import { generateDiscoveryFiles } from '../src/lib/discovery.ts'
import { PUBLIC_PATHS } from '../src/lib/publicRoutes.ts'
import {
  collectRouteLastModified,
  renderRouteLastModifiedModule,
} from './last-modified.mjs'

const lastModified = collectRouteLastModified()
const files = generateDiscoveryFiles(getSiteConfig('international'), lastModified)
const outputs = Object.entries(files).map(([name, content]) => [
  new URL(`../public/${name}`, import.meta.url),
  content,
])
outputs.push([
  new URL('../src/data/routeLastModified.ts', import.meta.url),
  renderRouteLastModifiedModule(lastModified),
])

const write = process.argv.includes('--write')
const check = process.argv.includes('--check')
if (write === check) {
  console.error('Usage: node scripts/generate-seo.mjs --write | --check')
  process.exit(2)
}

if (write) {
  for (const [url, content] of outputs) writeFileSync(url, content, 'utf8')
  console.log(`[seo] generated ${PUBLIC_PATHS.length} routes + sitemap/robots/llms/summaries`)
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
  console.log(`[seo] verified ${PUBLIC_PATHS.length} routes + sitemap/robots/llms/summaries`)
}
