import { useEffect } from 'react'
import { trackAnalyticsEvent } from './index.ts'
import { clientErrorFile, clientErrorMessage } from './clientError.ts'

let initialized = false

const resizeObserverDiagnostics = new Set([
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications.',
])

function startRuntime(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  window.addEventListener('error', (event) => {
    const message = clientErrorMessage(event.error, event.message)
    if (resizeObserverDiagnostics.has(message)) return
    const file = clientErrorFile(event.filename)

    trackAnalyticsEvent({
      event: 'client_error',
      path: window.location.pathname,
      metadata: {
        source: 'window',
        message,
        line: event.lineno,
        column: event.colno,
        ...(file ? { file } : {}),
      },
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    trackAnalyticsEvent({
      event: 'client_error',
      path: window.location.pathname,
      metadata: {
        source: 'promise',
        message: clientErrorMessage(event.reason),
      },
    })
  })

  // web-vitals v6 uses Array.prototype.at internally. Keep optional RUM from
  // generating client_error noise in older WebViews that can still read the site.
  if (typeof Array.prototype.at !== 'function') return

  void import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
    const report = (metric: {
      name: string
      value: number
      delta: number
      rating: string
      navigationType: string
    }) => {
      trackAnalyticsEvent({
        event: 'web_vital',
        path: window.location.pathname,
        metadata: {
          name: metric.name,
          value: Math.round(metric.value * 100) / 100,
          delta: Math.round(metric.delta * 100) / 100,
          rating: metric.rating,
          navigationType: metric.navigationType,
        },
      })
    }

    onCLS(report)
    onFCP(report)
    onINP(report)
    onLCP(report)
    onTTFB(report)
  }).catch(() => {
    // RUM 模組載入失敗不影響課程正文。
  })
}

export function AnalyticsRuntime() {
  useEffect(startRuntime, [])
  return null
}
