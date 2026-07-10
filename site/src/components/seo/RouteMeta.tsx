import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { getPageMeta } from '../../lib/pageMeta.ts'

function upsertMeta(attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.content = content
}

function upsertCanonical(href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.append(element)
  }
  element.href = href
}

export function RouteMeta() {
  const location = useLocation()
  const page = useMemo(() => getPageMeta(location.pathname), [location.pathname])

  useEffect(() => {
    document.title = page.title
    upsertMeta('name', 'description', page.description)
    upsertCanonical(page.canonical)
    upsertMeta('property', 'og:title', page.title)
    upsertMeta('property', 'og:description', page.description)
    upsertMeta('property', 'og:url', page.canonical)
    upsertMeta('property', 'og:type', page.ogType)
    upsertMeta('property', 'og:site_name', 'DP大师')
  }, [page])

  return null
}
