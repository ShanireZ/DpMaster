import { BRAND, SITE_CONFIGS } from '../config/site.ts'
import type { SiteConfig } from '../config/site.ts'
import type { PageMeta } from './pageMeta.ts'

export const ROUTE_HEAD_START = '<!-- dp-route-head:start -->'
export const ROUTE_HEAD_END = '<!-- dp-route-head:end -->'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function jsonForHtml(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c')
}

export function structuredDataForPage(page: PageMeta, site: SiteConfig): object {
  const websiteId = `${site.origin}/#website`
  const publisherId = `${site.origin}/#publisher`
  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'Organization',
      '@id': publisherId,
      name: BRAND.owner,
      url: site.origin,
      brand: { '@type': 'Brand', name: BRAND.name },
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: BRAND.name,
      url: `${site.origin}/`,
      description: `${BRAND.name}是${BRAND.shortDescription}。`,
      inLanguage: site.language,
      publisher: { '@id': publisherId },
    },
  ]

  if (page.indexable && page.canonical) {
    const pageId = `${page.canonical}#webpage`
    const pageType =
      page.routeKind === 'lesson'
        ? 'Course'
        : page.routeKind === 'family'
          ? 'CollectionPage'
          : 'WebPage'
    graph.push({
      '@type': pageType,
      '@id': pageId,
      url: page.canonical,
      name: page.title,
      description: page.description,
      abstract: page.summary,
      inLanguage: site.language,
      isPartOf: { '@id': websiteId },
      provider: page.routeKind === 'lesson' ? { '@id': publisherId } : undefined,
      publisher: { '@id': publisherId },
    })

    if (page.breadcrumbs.length > 1) {
      graph.push({
        '@type': 'BreadcrumbList',
        '@id': `${page.canonical}#breadcrumb`,
        itemListElement: page.breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${site.origin}${item.path}`,
        })),
      })
    }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

export function renderRouteHead(page: PageMeta, site: SiteConfig): string {
  const tags = [
    ROUTE_HEAD_START,
    `    <title>${escapeHtml(page.title)}</title>`,
    `    <meta name="description" content="${escapeHtml(page.description)}" />`,
    `    <meta name="abstract" content="${escapeHtml(page.summary)}" />`,
    `    <meta name="robots" content="${page.indexable ? 'index,follow' : 'noindex,nofollow'}" />`,
  ]

  if (page.canonical) {
    tags.push(`    <link rel="canonical" href="${escapeHtml(page.canonical)}" />`)
  }
  for (const alternate of page.alternates) {
    tags.push(
      `    <link rel="alternate" hreflang="${escapeHtml(alternate.hreflang)}" href="${escapeHtml(alternate.href)}" />`,
    )
  }

  tags.push(
    `    <meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(page.description)}" />`,
    `    <meta property="og:url" content="${escapeHtml(page.canonical ?? `${site.origin}${page.path}`)}" />`,
    `    <meta property="og:type" content="${page.ogType}" />`,
    `    <meta property="og:site_name" content="${BRAND.name}" />`,
    `    <meta property="og:locale" content="zh_CN" />`,
    '    <meta name="twitter:card" content="summary" />',
    `    <meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    `    <meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    `    <script id="dp-structured-data" type="application/ld+json">${jsonForHtml(structuredDataForPage(page, site))}</script>`,
    ROUTE_HEAD_END,
  )

  return tags.join('\n')
}

export function replaceRouteHead(documentHtml: string, routeHead: string): string {
  const start = documentHtml.indexOf(ROUTE_HEAD_START)
  const end = documentHtml.indexOf(ROUTE_HEAD_END)
  if (start < 0 || end < start) throw new Error('Route head markers are missing from index.html')
  return `${documentHtml.slice(0, start)}${routeHead}${documentHtml.slice(end + ROUTE_HEAD_END.length)}`
}

export function alternateOrigins(): ReadonlyArray<string> {
  return [SITE_CONFIGS.international.origin, SITE_CONFIGS.china.origin]
}
