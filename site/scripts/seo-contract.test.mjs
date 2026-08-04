import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { SITE_CONFIGS, SITE_ORIGIN } from '../src/config/site.ts'
import { PARTS } from '../src/data/catalog.ts'
import { getPageMeta } from '../src/lib/pageMeta.ts'
import {
  INTERNAL_PATHS,
  PRERENDER_PATHS,
  PUBLIC_PATHS,
} from '../src/lib/publicRoutes.ts'

const siteRoot = new URL('../', import.meta.url)

async function siteSource(path) {
  return readFile(new URL(path, siteRoot), 'utf8')
}

test('the 47-route catalog is the single public-route contract', () => {
  assert.equal(PUBLIC_PATHS.length, 47)
  assert.equal(new Set(PUBLIC_PATHS).size, 47)
  assert.equal(PARTS.length, 7)
  assert.equal(
    PARTS.flatMap((part) => part.types.filter((type) => type.status === 'ready')).length,
    37,
  )
})

test('the internal specimen is prerendered but excluded from public discovery', () => {
  assert.deepEqual(INTERNAL_PATHS, ['/lab/body-demo-standard'])
  assert.equal(PRERENDER_PATHS.length, 48)
  assert.equal(PUBLIC_PATHS.includes(INTERNAL_PATHS[0]), false)
  const meta = getPageMeta(INTERNAL_PATHS[0], SITE_CONFIGS.international)
  assert.equal(meta.indexable, false)
  assert.equal(meta.canonical, null)
  assert.deepEqual(meta.alternates, [])
})

test('both regions use host-aware canonical and equivalent hreflang alternates', () => {
  assert.equal(SITE_ORIGIN, SITE_CONFIGS.international.origin)
  assert.equal(SITE_CONFIGS.international.origin, 'https://dp.betaoi.cc')
  assert.equal(SITE_CONFIGS.china.origin, 'https://dp.betaoi.cn')
  assert.equal(
    SITE_CONFIGS.international.analytics.cloudflareWebAnalytics.delivery,
    'automatic',
  )
  assert.equal(
    SITE_CONFIGS.china.analytics.cloudflareWebAnalytics.delivery,
    'static',
  )
  assert.equal(
    SITE_CONFIGS.china.analytics.cloudflareWebAnalytics.token,
    'c113fb69d7e84d38a645c5160f6f1bda',
  )

  for (const path of PUBLIC_PATHS) {
    for (const site of Object.values(SITE_CONFIGS)) {
      const meta = getPageMeta(path, site)
      assert.equal(meta.canonical, `${site.origin}${path}`)
      assert.equal(meta.indexable, true)
      assert.equal(meta.alternates.length, 3)
      assert.deepEqual(meta.alternates, [
        {
          hreflang: 'zh-Hans',
          href: `${SITE_CONFIGS.international.origin}${path}`,
        },
        {
          hreflang: 'zh-CN',
          href: `${SITE_CONFIGS.china.origin}${path}`,
        },
        {
          hreflang: 'x-default',
          href: `${SITE_CONFIGS.international.origin}${path}`,
        },
      ])
      assert.ok(meta.description.length >= 30)
      assert.ok(meta.summary.length >= 30)
      assert.match(meta.dateModified, /^\d{4}-\d{2}-\d{2}$/)
    }
  }
})

test('all families and lessons derive branded metadata from the catalog', () => {
  const home = getPageMeta('/', SITE_CONFIGS.international)
  assert.equal(home.title, 'DP大师 · DP Master')
  assert.doesNotMatch(home.description, /动态规划交互式教程/)

  for (const part of PARTS) {
    const family = getPageMeta(`/part/${part.id}`, SITE_CONFIGS.international)
    assert.equal(family.title, `${part.title} · DP大师`)
    assert.match(family.description, new RegExp(part.title))
    assert.equal(family.routeKind, 'family')

    for (const type of part.types.filter((entry) => entry.status === 'ready')) {
      const lesson = getPageMeta(
        `/part/${part.id}/${type.slug}`,
        SITE_CONFIGS.international,
      )
      assert.equal(lesson.title, `${type.title} · ${part.title} · DP大师`)
      assert.equal(lesson.ogType, 'article')
      assert.equal(lesson.routeKind, 'lesson')
      assert.equal(lesson.breadcrumbs.length, 3)
    }
  }
})

test('unknown routes are explicitly non-indexable and have no canonical alternates', () => {
  const meta = getPageMeta('/part/z/missing', SITE_CONFIGS.international)
  assert.equal(meta.title, '页面未找到 · DP大师')
  assert.equal(meta.canonical, null)
  assert.equal(meta.indexable, false)
  assert.equal(meta.routeKind, 'not-found')
  assert.deepEqual(meta.alternates, [])
})

test('RouteMeta owns every dynamic SEO tag including JSON-LD and noindex', async () => {
  const [adapter, appContent] = await Promise.all([
    siteSource('src/components/seo/RouteMeta.tsx'),
    siteSource('src/app/AppContent.tsx'),
  ])

  assert.match(adapter, /useLocation\(\)/)
  assert.match(adapter, /getRuntimeSiteConfig\(\)/)
  assert.match(adapter, /getPageMeta\(location\.pathname,\s*site\)/)
  assert.match(adapter, /document\.title\s*=\s*page\.title/)
  for (const key of [
    'description',
    'abstract',
    'robots',
    'og:title',
    'og:description',
    'og:url',
    'og:type',
    'og:site_name',
    'twitter:card',
  ]) {
    assert.match(adapter, new RegExp(key.replace(':', '\\:')))
  }
  assert.match(adapter, /structuredDataForPage/)
  assert.match(adapter, /application\/ld\+json/)
  assert.match(adapter, /hreflang/)
  assert.match(adapter, /rel\s*=\s*['"]canonical['"]/)
  assert.match(appContent, /<RouteMeta \/>/)
  assert.equal((appContent.match(/<RouteMeta \/>/g) || []).length, 1)
})

test('discovery files expose the 47 approved URLs and real summaries', async () => {
  const [sitemap, robots, llms, routeSummaries, generator, lastModified, publicRoutes, packageJson] =
    await Promise.all([
      siteSource('public/sitemap.xml'),
      siteSource('public/robots.txt'),
      siteSource('public/llms.txt'),
      siteSource('public/route-summaries.json').then(JSON.parse),
      siteSource('scripts/generate-seo.mjs'),
      siteSource('scripts/last-modified.mjs'),
      siteSource('src/lib/publicRoutes.ts'),
      siteSource('package.json').then(JSON.parse),
    ])
  const expected = PUBLIC_PATHS.map((path) => `${SITE_CONFIGS.international.origin}${path}`)
  const actual = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

  assert.deepEqual(actual, expected)
  assert.equal((sitemap.match(/<xhtml:link /g) || []).length, 47 * 3)
  assert.match(sitemap, /hreflang="zh-Hans"/)
  assert.match(sitemap, /hreflang="zh-CN"/)
  assert.match(sitemap, /hreflang="x-default"/)
  assert.match(robots, /User-agent:\s*\*/)
  assert.match(robots, /Allow:\s*\//)
  assert.match(robots, /Sitemap: https:\/\/dp\.betaoi\.cc\/sitemap\.xml/)
  assert.equal(routeSummaries.routes.length, 47)
  assert.equal(routeSummaries.brand, 'DP大师')
  assert.ok(routeSummaries.routes.every((route) => /^\d{4}-\d{2}-\d{2}$/.test(route.lastModified)))
  assert.equal((sitemap.match(/<lastmod>/g) || []).length, 47)
  assert.equal(
    (llms.match(/^- \[[^\]]+\]\(https:\/\/dp\.betaoi\.cc/gm) || []).length,
    47,
  )
  assert.match(llms, /## 可引用页面/)
  assert.match(generator, /\.\.\/src\/lib\/publicRoutes\.ts/)
  assert.match(generator, /generateDiscoveryFiles/)
  assert.match(generator, /collectRouteLastModified/)
  assert.match(lastModified, /gitNames\(\['diff', '--name-only', '-z', 'HEAD'/)
  assert.match(lastModified, /gitNames\(\['ls-files', '--others', '--exclude-standard', '-z'/)
  assert.match(lastModified, /files\.some\(\(file\) => dirtyFiles\.has\(file\)\)/)
  assert.match(lastModified, /localDate\(\)/)
  assert.match(publicRoutes, /\.\.\/data\/catalog\.ts/)
  assert.equal(packageJson.scripts['check:seo'], 'node scripts/generate-seo.mjs --check')
  assert.match(packageJson.scripts.prebuild, /seo:generate/)
  assert.match(packageJson.scripts.verify, /check:content && pnpm check:seo && pnpm test/)
})

test('static HTML gives crawlers complete homepage metadata before React runs', async () => {
  const html = await siteSource('index.html')
  assert.match(html, /<meta name="description" content="[^"]{30,}"/)
  assert.match(html, /<meta name="abstract" content="[^"]{30,}"/)
  assert.match(html, /<meta name="robots" content="index,follow"/)
  assert.match(html, /<link rel="canonical" href="https:\/\/dp\.betaoi\.cc\/"/)
  assert.match(html, /hreflang="zh-Hans"/)
  assert.match(html, /hreflang="zh-CN"/)
  assert.match(html, /hreflang="x-default"/)
  for (const property of ['og:title', 'og:description', 'og:url', 'og:type', 'og:site_name']) {
    assert.match(html, new RegExp(`<meta property="${property}" content="[^"]+"`))
  }
  assert.match(html, /<meta name="theme-color" content="#[0-9a-fA-F]{6}"/)
  assert.match(html, /<script[^>]+type="application\/ld\+json">/)
  assert.match(html, /"@graph"/)
  assert.match(html, /"@type":\s*"WebSite"/)
  assert.match(html, /"url":\s*"https:\/\/dp\.betaoi\.cc\/"/)
  assert.match(html, /og\/dpmaster-social\.jpg/)
})

test('build contracts provide two region outputs, SSR prerendering, hydration, and real 404s', async () => {
  const [regions, prerender, main, wrangler, postbuild, preview, packageJson] =
    await Promise.all([
      siteSource('scripts/build-regions.mjs'),
      siteSource('scripts/prerender.mjs'),
      siteSource('src/main.tsx'),
      siteSource('wrangler.jsonc'),
      siteSource('scripts/postbuild.mjs'),
      siteSource('scripts/preview.mjs'),
      siteSource('package.json').then(JSON.parse),
    ])

  assert.match(regions, /dist\/cloudflare/)
  assert.match(regions, /dist\/edgeone/)
  assert.match(prerender, /PRERENDER_PATHS/)
  assert.match(prerender, /404\.html/)
  assert.match(prerender, /renderRouteHead/)
  assert.match(prerender, /renderStaticWebAnalytics/)
  assert.match(main, /hydrateRoot/)
  assert.match(wrangler, /"not_found_handling":\s*"404-page"/)
  assert.match(postbuild, /status:\s*404/)
  assert.match(postbuild, /x-robots-tag/)
  assert.match(preview, /const status = file \? 200 : 404/)
  assert.equal(packageJson.scripts.build, 'tsc -b && node scripts/build-regions.mjs')
  assert.match(packageJson.scripts.preview, /scripts\/preview\.mjs/)
})
