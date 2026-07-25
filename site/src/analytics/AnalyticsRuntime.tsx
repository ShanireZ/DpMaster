import { useEffect } from 'react'
import { trackAnalyticsEvent } from './index.ts'

let initialized = false

function safeMessage(value: unknown): string {
  if (value instanceof Error) return value.message.slice(0, 160)
  if (typeof value === 'string') return value.slice(0, 160)
  return 'unknown client error'
}

function startRuntime(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  window.addEventListener('error', (event) => {
    trackAnalyticsEvent({
      event: 'client_error',
      path: window.location.pathname,
      metadata: {
        source: 'window',
        message: safeMessage(event.error ?? event.message),
        line: event.lineno,
        column: event.colno,
      },
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    trackAnalyticsEvent({
      event: 'client_error',
      path: window.location.pathname,
      metadata: {
        source: 'promise',
        message: safeMessage(event.reason),
      },
    })
  })

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
    // RUM 模块加载失败不影响课程正文。
  })
}

export function AnalyticsRuntime() {
  useEffect(startRuntime, [])
  return null
}
