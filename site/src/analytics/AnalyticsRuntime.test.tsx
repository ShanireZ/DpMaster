import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AnalyticsRuntime } from './AnalyticsRuntime.tsx'

const webVitals = vi.hoisted(() => ({
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
}))
const analytics = vi.hoisted(() => ({
  trackAnalyticsEvent: vi.fn(),
}))

vi.mock('web-vitals', () => webVitals)
vi.mock('./index.ts', () => analytics)

const arrayAtDescriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'at')

afterEach(() => {
  if (arrayAtDescriptor) {
    Object.defineProperty(Array.prototype, 'at', arrayAtDescriptor)
  }
  vi.clearAllMocks()
})

describe('AnalyticsRuntime', () => {
  it('does not load web-vitals when Array.prototype.at is unavailable', async () => {
    Reflect.deleteProperty(Array.prototype, 'at')

    render(<AnalyticsRuntime />)
    await vi.dynamicImportSettled()

    expect(webVitals.onCLS).not.toHaveBeenCalled()
    expect(webVitals.onFCP).not.toHaveBeenCalled()
    expect(webVitals.onINP).not.toHaveBeenCalled()
    expect(webVitals.onLCP).not.toHaveBeenCalled()
    expect(webVitals.onTTFB).not.toHaveBeenCalled()
  })

  it('filters ResizeObserver delivery diagnostics without hiding real client errors', () => {
    render(<AnalyticsRuntime />)

    window.dispatchEvent(new ErrorEvent('error', {
      message: 'ResizeObserver loop limit exceeded',
    }))
    window.dispatchEvent(new ErrorEvent('error', {
      message: 'ResizeObserver loop completed with undelivered notifications.',
    }))

    expect(analytics.trackAnalyticsEvent).not.toHaveBeenCalled()

    window.dispatchEvent(new ErrorEvent('error', {
      message: 'real application failure',
      lineno: 12,
      colno: 34,
    }))

    expect(analytics.trackAnalyticsEvent).toHaveBeenCalledWith({
      event: 'client_error',
      path: '/',
      metadata: {
        source: 'window',
        message: 'real application failure',
        line: 12,
        column: 34,
      },
    })
  })

  it('keeps the browser message when error is an opaque non-Error value', () => {
    render(<AnalyticsRuntime />)
    window.dispatchEvent(new ErrorEvent('error', {
      error: {},
      message: 'browser supplied failure',
      lineno: 675,
      colno: 29,
    }))

    expect(analytics.trackAnalyticsEvent).toHaveBeenCalledWith(expect.objectContaining({
      metadata: expect.objectContaining({ message: 'browser supplied failure' }),
    }))
  })

  it('keeps a cross-realm error message and only the same-origin script location', () => {
    render(<AnalyticsRuntime />)
    window.dispatchEvent(new ErrorEvent('error', {
      error: { message: 'cross-realm failure' },
      filename: `${window.location.origin}/assets/catalog-hash.js?private=value#fragment`,
      lineno: 2,
      colno: 100072,
    }))

    expect(analytics.trackAnalyticsEvent).toHaveBeenCalledWith(expect.objectContaining({
      metadata: expect.objectContaining({
        message: 'cross-realm failure',
        file: '/assets/catalog-hash.js',
        line: 2,
        column: 100072,
      }),
    }))
  })
})
