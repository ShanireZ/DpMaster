import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ErrorBoundary from './ErrorBoundary.tsx'

const analytics = vi.hoisted(() => ({ trackAnalyticsEvent: vi.fn() }))
vi.mock('../../analytics/index.ts', () => analytics)

describe('ErrorBoundary diagnostics', () => {
  it('reports the actual throw location and leaves non-module failures on the manual path', () => {
    const error = new TypeError("Cannot read properties of null (reading 'tagName')")
    error.stack = `TypeError: ${error.message}\n    at mount (${window.location.origin}/assets/catalog-hash.js:2:100072)`
    function Broken(): never { throw error }
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    window.sessionStorage.clear()
    try {
      render(<ErrorBoundary><Broken /></ErrorBoundary>)
      expect(screen.getByRole('alert')).toHaveTextContent(error.message)
      expect(analytics.trackAnalyticsEvent).toHaveBeenCalledWith({
        event: 'client_error',
        path: '/',
        metadata: expect.objectContaining({
          source: 'react_boundary',
          message: error.message,
          frame: '/assets/catalog-hash.js:2:100072',
          recovery: 'none',
        }),
      })
      expect(Object.keys(window.sessionStorage)).toEqual([])
    } finally {
      consoleError.mockRestore()
      analytics.trackAnalyticsEvent.mockClear()
    }
  })
})
