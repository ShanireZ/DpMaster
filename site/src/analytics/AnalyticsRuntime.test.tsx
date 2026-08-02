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

vi.mock('web-vitals', () => webVitals)
vi.mock('./index.ts', () => ({ trackAnalyticsEvent: vi.fn() }))

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
})
