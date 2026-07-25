import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getPageMeta } from '../lib/pageMeta.ts'
import { trackAnalyticsEvent } from './index.ts'

let lastTrackedPath = ''

export function AnalyticsRouteTracker() {
  const location = useLocation()

  useEffect(() => {
    if (lastTrackedPath === location.pathname) return
    lastTrackedPath = location.pathname
    const page = getPageMeta(location.pathname)
    trackAnalyticsEvent({
      event: 'page_view',
      path: page.path,
      title: page.title,
    })
    if (!page.indexable) {
      trackAnalyticsEvent({
        event: 'route_not_found',
        path: location.pathname,
        title: page.title,
      })
    }
  }, [location.pathname])

  return null
}
