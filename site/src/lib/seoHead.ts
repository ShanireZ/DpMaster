import { BRAND, SITE_CONFIGS } from '../config/site.ts'
import type { SiteConfig } from '../config/site.ts'
import type { PageMeta } from './pageMeta.ts'
import { getPart } from '../data/catalog.ts'

const OG_IMAGE_PATH = '/og/dpmaster-social.jpg'

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
      logo: `${site.origin}/favicon.svg`,
      brand: { '@type': 'Brand', name: BRAND.name },
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: BRAND.name,
      url: `${site.origin}/`,
      description: `${BRAND.name}用精讲、逐帧可视化、题目索引和小游戏讲清动态规划。`,
      inLanguage: site.language,
      publisher: { '@id': publisherId },
    },
  ]

  if (page.indexable && page.canonical) {
    const pageId = `${page.canonical}#webpage`
    const pageType: string | string[] =
      page.routeKind === 'lesson'
        ? ['Course', 'LearningResource', 'TechArticle']
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
      learningResourceType: page.routeKind === 'lesson' ? '课程讲解' : undefined,
      educationalLevel: page.routeKind === 'lesson' ? '算法竞赛学习者' : undefined,
      teaches: page.teaches.length > 0 ? page.teaches : undefined,
      dateModified: page.dateModified,
      reviewedBy: page.reviewedBy ? {
        '@type': 'Organization',
        name: page.reviewedBy,
      } : undefined,
      image: `${site.origin}${OG_IMAGE_PATH}`,
    })

    if (page.routeKind === 'family') {
      const partId = page.path.match(/^\/part\/([a-g])$/)?.[1]
      const part = partId ? getPart(partId) : undefined
      if (part) {
        graph.push({
          '@type': 'ItemList',
          '@id': `${page.canonical}#courses`,
          name: `${part.title}课程目录`,
          numberOfItems: part.types.filter((type) => type.status === 'ready').length,
          itemListElement: part.types
            .filter((type) => type.status === 'ready')
            .map((type, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: type.title,
              url: `${site.origin}/part/${part.id}/${type.slug}`,
            })),
        })
      }
    }

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
    `    <meta property="og:image" content="${site.origin}${OG_IMAGE_PATH}" />`,
    '    <meta property="og:image:width" content="1200" />',
    '    <meta property="og:image:height" content="630" />',
    `    <meta property="og:image:alt" content="${BRAND.name}动态规划状态空间与信标视觉" />`,
    ...(page.dateModified && page.ogType === 'article'
      ? [`    <meta property="article:modified_time" content="${page.dateModified}" />`]
      : []),
    '    <meta name="twitter:card" content="summary_large_image" />',
    `    <meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    `    <meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    `    <meta name="twitter:image" content="${site.origin}${OG_IMAGE_PATH}" />`,
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
