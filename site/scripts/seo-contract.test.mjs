import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { PARTS } from '../src/data/catalog.ts'
import { SITE_ORIGIN, getPageMeta } from '../src/lib/pageMeta.ts'

const siteRoot = new URL('../', import.meta.url)

async function siteSource(path) {
  return readFile(new URL(path, siteRoot), 'utf8')
}

test('homepage and static routes have stable canonical metadata', () => {
  assert.equal(SITE_ORIGIN, 'https://dp.betaoi.cc')
  const cases = [
    ['/', 'DP大师 · 动态规划交互式教程'],
    ['/method', '通用方法论 · DP大师'],
    ['/problems', '题目索引 · DP大师'],
    ['/about', '关于 · DP大师'],
  ]
  for (const [path, title] of cases) {
    const meta = getPageMeta(path)
    assert.equal(meta.title, title)
    assert.equal(meta.canonical, `${SITE_ORIGIN}${path === '/' ? '/' : path}`)
    assert.equal(meta.ogType, 'website')
    assert.ok(meta.description.length >= 30)
  }
})

test('all seven families derive metadata from the catalog', () => {
  assert.equal(PARTS.length, 7)
  for (const part of PARTS) {
    const meta = getPageMeta(`/part/${part.id}`)
    assert.equal(meta.title, `${part.title} · DP大师`)
    assert.equal(meta.canonical, `${SITE_ORIGIN}/part/${part.id}`)
    assert.match(meta.description, new RegExp(part.title))
    assert.equal(meta.ogType, 'website')
  }
})

test('all 37 ready lessons use the approved title order and article metadata', () => {
  const lessons = PARTS.flatMap((part) =>
    part.types.filter((type) => type.status === 'ready').map((type) => ({ part, type })),
  )
  assert.equal(lessons.length, 37)
  for (const { part, type } of lessons) {
    const path = `/part/${part.id}/${type.slug}`
    const meta = getPageMeta(path)
    assert.equal(meta.title, `${type.title} · ${part.title} · DP大师`)
    assert.equal(meta.canonical, `${SITE_ORIGIN}${path}`)
    assert.match(meta.description, new RegExp(type.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.equal(meta.ogType, 'article')
  }
})

test('unknown routes receive not-found metadata without borrowing a lesson', () => {
  const meta = getPageMeta('/part/z/missing')
  assert.equal(meta.title, '页面未找到 · DP大师')
  assert.equal(meta.canonical, `${SITE_ORIGIN}/part/z/missing`)
  assert.equal(meta.ogType, 'website')
})

test('RouteMeta is the single DOM-head Adapter for every required tag', async () => {
  const [adapter, app] = await Promise.all([
    siteSource('src/components/seo/RouteMeta.tsx'),
    siteSource('src/app/App.tsx'),
  ])

  assert.match(adapter, /useLocation\(\)/)
  assert.match(adapter, /getPageMeta\(location\.pathname\)/)
  assert.match(adapter, /document\.title\s*=\s*page\.title/)
  for (const key of ['description', 'og:title', 'og:description', 'og:url', 'og:type', 'og:site_name']) {
    assert.match(adapter, new RegExp(key.replace(':', '\\:')))
  }
  assert.match(adapter, /rel\s*=\s*['"]canonical['"]/)
  assert.match(adapter, /querySelector/)
  assert.match(adapter, /createElement/)
  assert.match(app, /<RouteMeta \/>/)
  assert.equal((app.match(/<RouteMeta \/>/g) || []).length, 1)
})

test('sitemap and robots expose exactly the 48 approved canonical URLs', async () => {
  const [sitemap, robots, generator, packageJson] = await Promise.all([
    siteSource('public/sitemap.xml'),
    siteSource('public/robots.txt'),
    siteSource('scripts/generate-seo.mjs'),
    siteSource('package.json').then(JSON.parse),
  ])
  const expectedPaths = [
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
  const expected = expectedPaths.map((path) => `${SITE_ORIGIN}${path}`)
  const actual = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

  assert.equal(expected.length, 48)
  assert.equal(new Set(expected).size, 48)
  assert.deepEqual(actual, expected)
  assert.match(robots, /User-agent:\s*\*/)
  assert.match(robots, /Allow:\s*\//)
  assert.match(robots, new RegExp(`Sitemap: ${SITE_ORIGIN}/sitemap\\.xml`))
  assert.match(generator, /\.\.\/src\/data\/catalog\.ts/)
  assert.match(generator, /--write/)
  assert.match(generator, /--check/)
  assert.equal(packageJson.scripts['check:seo'], 'node scripts/generate-seo.mjs --check')
  assert.match(packageJson.scripts.prebuild, /seo:generate/)
  assert.match(packageJson.scripts.verify, /check:content && npm run check:seo && npm run test/)
})

test('static HTML gives crawlers complete homepage metadata before React runs', async () => {
  const html = await siteSource('index.html')
  assert.match(html, /<meta name="description" content="[^"]{30,}"/)
  assert.match(html, /<link rel="canonical" href="https:\/\/dp\.betaoi\.cc\/"/)
  for (const property of ['og:title', 'og:description', 'og:url', 'og:type', 'og:site_name']) {
    assert.match(html, new RegExp(`<meta property="${property}" content="[^"]+"`))
  }
  assert.match(html, /<meta name="theme-color" content="#[0-9a-fA-F]{6}"/)
  assert.match(html, /<script type="application\/ld\+json">/)
  assert.match(html, /"@type":\s*"WebSite"/)
  assert.match(html, /"url":\s*"https:\/\/dp\.betaoi\.cc\/"/)
})
