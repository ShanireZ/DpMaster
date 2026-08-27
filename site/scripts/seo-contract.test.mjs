import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { CLIENT_RUNTIME } from '../src/config/client-runtime.ts'
import { SITE, SITE_ORIGIN } from '../src/config/site.ts'
import { PARTS } from '../src/data/catalog.ts'
import {
  ROUTE_CONTENT_DIGEST_VERSION,
  ROUTE_CONTENT_DIGESTS,
} from '../src/data/routeLastModified.ts'
import { getPageMeta } from '../src/lib/pageMeta.ts'
import {
  INTERNAL_PATHS,
  PRERENDER_PATHS,
  PUBLIC_PATHS,
} from '../src/lib/publicRoutes.ts'

const siteRoot = new URL('../', import.meta.url)
const NEWLINE = String.fromCharCode(10)

function isW3CDateTime(value) {
  return (
    typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T/.test(value)
    && !Number.isNaN(Date.parse(value))
  )
}

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
  const meta = getPageMeta(INTERNAL_PATHS[0], SITE)
  assert.equal(meta.indexable, false)
  assert.equal(meta.canonical, null)
})

test('the single origin owns every canonical and emits no hreflang alternates', () => {
  assert.equal(SITE_ORIGIN, SITE.origin)
  assert.equal(SITE.origin, 'https://dp.round1.cc')
  assert.equal(CLIENT_RUNTIME.productionHostname, 'dp.round1.cc')
  assert.equal(SITE.language, 'zh-Hans')
  // API 一律同源：没有跨域端点，也就没有跨站 CORS 面。
  assert.equal(CLIENT_RUNTIME.analyticsEndpoint, '/api/analytics')
  assert.equal(CLIENT_RUNTIME.feedbackEndpoint, '/api/feedback')

  for (const path of PUBLIC_PATHS) {
    const meta = getPageMeta(path, SITE)
    assert.equal(meta.canonical, `${SITE.origin}${path}`)
    assert.equal(meta.indexable, true)
    assert.equal('alternates' in meta, false)
    assert.ok(meta.description.length >= 30)
    assert.ok(meta.summary.length >= 30)
    assert.equal(isW3CDateTime(meta.dateModified), true)
  }
})

test('nothing in the shipped site still points at a retired domain or region', async () => {
  const files = [
    'src/config/site.ts',
    'src/lib/pageMeta.ts',
    'src/lib/seoHead.ts',
    'src/lib/discovery.ts',
    'src/analytics/index.ts',
    'index.html',
    'wrangler.jsonc',
    'worker.js',
    'public/sitemap.xml',
    'public/robots.txt',
    'public/llms.txt',
  ]
  for (const file of files) {
    const source = await siteSource(file)
    assert.doesNotMatch(source, /betaoi/i, file)
    assert.doesNotMatch(source, /edgeone/i, file)
    assert.doesNotMatch(source, /hreflang/i, file)
  }
})

test('all families and lessons derive branded metadata from the catalog', () => {
  const home = getPageMeta('/', SITE)
  assert.equal(home.title, 'DP大师 · DP Master')
  assert.doesNotMatch(home.description, /动态规划交互式教程/)

  for (const part of PARTS) {
    const family = getPageMeta(`/part/${part.id}`, SITE)
    assert.equal(family.title, `${part.title} · DP大师`)
    assert.match(family.description, new RegExp(part.title))
    assert.equal(family.routeKind, 'family')

    for (const type of part.types.filter((entry) => entry.status === 'ready')) {
      const lesson = getPageMeta(
        `/part/${part.id}/${type.slug}`,
        SITE,
      )
      assert.equal(lesson.title, `${type.title} · ${part.title} · DP大师`)
      assert.equal(lesson.ogType, 'article')
      assert.equal(lesson.routeKind, 'lesson')
      assert.equal(lesson.breadcrumbs.length, 3)
    }
  }
})

test('unknown routes are explicitly non-indexable and have no canonical alternates', () => {
  const meta = getPageMeta('/part/z/missing', SITE)
  assert.equal(meta.title, '页面未找到 · DP大师')
  assert.equal(meta.canonical, null)
  assert.equal(meta.indexable, false)
  assert.equal(meta.routeKind, 'not-found')
})

test('RouteMeta owns every dynamic SEO tag including JSON-LD and noindex', async () => {
  const [adapter, appContent] = await Promise.all([
    siteSource('src/components/seo/RouteMeta.tsx'),
    siteSource('src/app/AppContent.tsx'),
  ])

  assert.match(adapter, /useLocation\(\)/)
  assert.match(adapter, /const site = SITE/)
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
  // 单域站点没有 alternate：RouteMeta 不得再往 head 里塞 hreflang。
  assert.doesNotMatch(adapter, /hreflang/)
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
  const expected = PUBLIC_PATHS.map((path) => `${SITE.origin}${path}`).sort()
  const actual = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

  assert.deepEqual(actual, expected)
  // 单域站点的 sitemap 不带 xhtml alternate，连命名空间都不该出现。
  assert.equal((sitemap.match(/<xhtml:link /g) || []).length, 0)
  assert.doesNotMatch(sitemap, /xmlns:xhtml/)
  assert.equal((sitemap.match(/<lastmod>/g) || []).length, 47)

  assert.match(robots, /User-agent:\s*\*/)
  assert.match(robots, /Allow:\s*\//)
  assert.match(robots, /Sitemap: https:\/\/dp\.round1\.cc\/sitemap\.xml/)
  // GEO：已批准公开内容允许检索、引用、输入与训练；源代码立场保持单向明确。
  for (const agent of [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-User',
    'Claude-SearchBot',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'CCBot',
    'Bytespider',
    'Amazonbot',
    'meta-externalagent',
  ]) {
    assert.ok(robots.includes(`User-agent: ${agent}` + NEWLINE), agent)
  }

  assert.equal(routeSummaries.routes.length, 47)
  assert.equal(routeSummaries.brand, 'DP大师')
  assert.equal(routeSummaries.origin, SITE.origin)
  assert.equal('region' in routeSummaries, false)
  assert.ok(routeSummaries.routes.every((route) => isW3CDateTime(route.lastModified)))
  assert.ok(routeSummaries.routes.every((route) => !('alternates' in route)))

  assert.equal(
    (llms.match(/^- \[[^\]]+\]\(https:\/\/dp\.round1\.cc/gm) || []).length,
    47,
  )
  // llms.txt 按家族分节，比一张 47 条的平表更好被生成式引擎消化。
  assert.match(llms, /^## 入口$/m)
  assert.match(llms, /^## 使用说明$/m)
  assert.equal((llms.match(/^## /gm) || []).length, 2 + PARTS.length)
  assert.match(llms, /无账号、无登录、无付费墙/)
  assert.match(llms, /ai-train=yes, search=yes, ai-input=yes/)
  assert.match(llms, /同一 URL 请求 `text\/markdown`/)

  assert.match(generator, /\.\.\/src\/lib\/publicRoutes\.ts/)
  assert.match(generator, /generateDiscoveryFiles/)
  assert.match(generator, /collectRouteContentEvidence/)
  // index.html 的 head 也由生成器产出，手工维护会和 SITE.origin 漂移。
  assert.match(generator, /replaceRouteHead/)
  assert.match(lastModified, /gitNames\(\['diff', '--name-only', '-z', 'HEAD'/)
  assert.match(lastModified, /gitNames\(\['ls-files', '--others', '--exclude-standard', '-z'/)
  assert.match(lastModified, /semanticChangeEvidence/)
  assert.match(lastModified, /latestSemanticGitDate/)
  assert.match(lastModified, /files\.filter\(\(file\) => dirtyFiles\.has\(file\)\)/)
  assert.match(lastModified, /workingTreeDate/)
  assert.match(lastModified, /--format=%cI/)
  assert.match(lastModified, /normalizeContentForDigest/)
  assert.match(lastModified, /semanticRouteFiles/)
  assert.equal(ROUTE_CONTENT_DIGEST_VERSION, 16)
  assert.equal(Object.keys(ROUTE_CONTENT_DIGESTS).length, PUBLIC_PATHS.length)
  assert.ok(Object.values(ROUTE_CONTENT_DIGESTS).every((digest) => /^[0-9a-f]{64}$/.test(digest)))
  assert.match(publicRoutes, /\.\.\/data\/catalog\.ts/)
  assert.equal(packageJson.scripts['check:seo'], 'node scripts/generate-seo.mjs --check')
  assert.match(packageJson.scripts.prebuild, /seo:generate/)
  assert.match(packageJson.scripts.verify, /check:content && pnpm check:seo && pnpm test/)
})

test('static HTML gives crawlers complete homepage metadata before React runs', async () => {
  const html = await siteSource('index.html')
  assert.match(html, /<html lang="zh-Hans">/)
  assert.match(html, /<meta name="description" content="[^"]{30,}"/)
  assert.match(html, /<meta name="abstract" content="[^"]{30,}"/)
  assert.match(html, /<meta name="robots" content="index,follow"/)
  assert.match(html, /<link rel="canonical" href="https:\/\/dp\.round1\.cc\/"/)
  for (const property of ['og:title', 'og:description', 'og:url', 'og:type', 'og:site_name']) {
    assert.match(html, new RegExp(`<meta property="${property}" content="[^"]+"`))
  }
  assert.match(html, /<meta name="theme-color" content="#[0-9a-fA-F]{6}"/)
  assert.match(html, /<script[^>]+type="application\/ld\+json">/)
  assert.match(html, /"@graph"/)
  assert.match(html, /"@type":\s*"WebSite"/)
  assert.match(html, /"url":\s*"https:\/\/dp\.round1\.cc\/"/)
  assert.match(html, /og\/dpmaster-social\.jpg/)
  // GEO：站内检索是真实可深链的，声明成 SearchAction 才对生成式引擎有意义。
  assert.match(html, /"@type":\s*"SearchAction"/)
  assert.match(html, /problems\?q=\{search_term_string\}/)
  assert.match(html, /"isAccessibleForFree":\s*true/)
})

test('build contracts provide one Cloudflare output, SSR prerendering, hydration, and real 404s', async () => {
  const [buildScript, prerender, main, wrangler, preview, packageJson] =
    await Promise.all([
      siteSource('scripts/build.mjs'),
      siteSource('scripts/prerender.mjs'),
      siteSource('src/main.tsx'),
      siteSource('wrangler.jsonc'),
      siteSource('scripts/preview.mjs'),
      siteSource('package.json').then(JSON.parse),
    ])

  // 只有一个产物目录，也只有一个发布目标。
  assert.match(buildScript, /const outDir = resolve\('dist'\)/)
  assert.doesNotMatch(buildScript, /regions/)
  assert.match(prerender, /PRERENDER_PATHS/)
  assert.match(prerender, /404\.html/)
  assert.match(prerender, /renderRouteHead/)
  assert.match(main, /hydrateRoot/)
  assert.match(wrangler, /"not_found_handling":\s*"404-page"/)
  assert.match(wrangler, /"pattern":\s*"dp\.round1\.cc"/)
  assert.match(wrangler, /"zone_name":\s*"round1\.cc"/)
  assert.match(wrangler, /"directory":\s*"\.\/dist\/"/)
  assert.match(wrangler, /"run_worker_first":\s*true/)
  assert.match(preview, /const status = file \? 200 : 404/)
  assert.match(preview, /new URL\('\.\.\/dist\/', import\.meta\.url\)/)
  assert.equal(packageJson.scripts.build, 'tsc -b && node scripts/build.mjs')
  assert.equal(packageJson.scripts.release, 'pnpm verify && pnpm deploy:cf')
  assert.equal(packageJson.scripts['deploy:eo'], undefined)
  assert.match(packageJson.scripts.preview, /scripts\/preview\.mjs/)
})

test('deployment verification documents the single-origin negotiation exit gate', async () => {
  const verification = await siteSource('../docs/operations/verification.md')

  assert.doesNotMatch(verification, /both domains|regional variants/i)
  for (const contract of [
    'dp.round1.cc',
    'text/markdown',
    'HEAD',
    '406',
    'ETag',
    'Vary: Accept',
    '/_representations/',
    'Content-Signal',
    'ai-train=yes, search=yes, ai-input=yes',
  ]) {
    assert.ok(verification.includes(contract), contract)
  }
})
