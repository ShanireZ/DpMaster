import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PARTS } from '../src/data/catalog.ts'
import { SITE_ORIGIN } from '../src/lib/pageMeta.ts'

const paths = [
  '/',
  ...PARTS.map((part) => `/part/${part.id}`),
  ...PARTS.flatMap((part) =>
    part.types
      .filter((type) => type.status === 'ready')
      .map((type) => `/part/${part.id}/${type.slug}`),
  ),
  '/method',
  '/problems',
  '/about',
]

if (new Set(paths).size !== paths.length) throw new Error('SEO route list contains duplicates')

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...paths.map((path) => `  <url><loc>${SITE_ORIGIN}${path}</loc></url>`),
  '</urlset>',
  '',
].join('\n')

const robots = [
  'User-agent: *',
  'Allow: /',
  '',
  `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
  '',
].join('\n')

const outputs = [
  [new URL('../public/sitemap.xml', import.meta.url), sitemap],
  [new URL('../public/robots.txt', import.meta.url), robots],
]

const write = process.argv.includes('--write')
const check = process.argv.includes('--check')
if (write === check) {
  console.error('Usage: node scripts/generate-seo.mjs --write | --check')
  process.exit(2)
}

if (write) {
  for (const [url, content] of outputs) writeFileSync(url, content, 'utf8')
  console.log(`[seo] generated ${paths.length} canonical URLs`)
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
  console.log(`[seo] verified ${paths.length} canonical URLs`)
}
