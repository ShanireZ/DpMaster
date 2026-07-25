import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { BRAND, getRuntimeSiteConfig } from '../../config/site.ts'
import { getPageMeta } from '../../lib/pageMeta.ts'
import { structuredDataForPage } from '../../lib/seoHead.ts'

function upsertMeta(attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.content = content
}

function syncCanonical(href: string | null): void {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!href) {
    existing?.remove()
    return
  }
  const element = existing ?? document.createElement('link')
  element.rel = 'canonical'
  element.href = href
  if (!existing) document.head.append(element)
}

function syncAlternates(alternates: ReadonlyArray<{ hreflang: string; href: string }>): void {
  document.head
    .querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')
    .forEach((element) => element.remove())
  for (const alternate of alternates) {
    const element = document.createElement('link')
    element.rel = 'alternate'
    element.hreflang = alternate.hreflang
    element.href = alternate.href
    document.head.append(element)
  }
}

function syncStructuredData(value: object): void {
  let element = document.head.querySelector<HTMLScriptElement>('#dp-structured-data')
  if (!element) {
    element = document.createElement('script')
    element.id = 'dp-structured-data'
    element.type = 'application/ld+json'
    document.head.append(element)
  }
  element.textContent = JSON.stringify(value)
}

export function RouteMeta() {
  const location = useLocation()
  const site = useMemo(() => getRuntimeSiteConfig(), [])
  const page = useMemo(
    () => getPageMeta(location.pathname, site),
    [location.pathname, site],
  )

  useEffect(() => {
    document.title = page.title
    upsertMeta('name', 'description', page.description)
    upsertMeta('name', 'abstract', page.summary)
    upsertMeta('name', 'robots', page.indexable ? 'index,follow' : 'noindex,nofollow')
    syncCanonical(page.canonical)
    syncAlternates(page.alternates)
    upsertMeta('property', 'og:title', page.title)
    upsertMeta('property', 'og:description', page.description)
    upsertMeta('property', 'og:url', page.canonical ?? `${site.origin}${page.path}`)
    upsertMeta('property', 'og:type', page.ogType)
    upsertMeta('property', 'og:site_name', BRAND.name)
    upsertMeta('property', 'og:locale', 'zh_CN')
    upsertMeta('property', 'og:image', `${site.origin}/og/dpmaster-social.jpg`)
    upsertMeta('property', 'og:image:width', '1200')
    upsertMeta('property', 'og:image:height', '630')
    upsertMeta('property', 'og:image:alt', `${BRAND.name}动态规划状态空间与信标视觉`)
    if (page.dateModified && page.ogType === 'article') {
      upsertMeta('property', 'article:modified_time', page.dateModified)
    } else {
      document.head
        .querySelector<HTMLMetaElement>('meta[property="article:modified_time"]')
        ?.remove()
    }
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', page.title)
    upsertMeta('name', 'twitter:description', page.description)
    upsertMeta('name', 'twitter:image', `${site.origin}/og/dpmaster-social.jpg`)
    syncStructuredData(structuredDataForPage(page, site))
  }, [page, site])

  return null
}
