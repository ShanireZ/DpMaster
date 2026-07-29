import { describe, expect, it, vi } from 'vitest'
import { createVitePreloadRecoveryHandler } from './preloadRecovery.ts'

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  }
}

describe('createVitePreloadRecoveryHandler', () => {
  it('prevents the first stale preload error and reloads once per build and path', () => {
    const reload = vi.fn()
    const handler = createVitePreloadRecoveryHandler({
      buildId: 'build-a',
      pathname: '/part/a/variant',
      reload,
      storage: memoryStorage(),
    })

    const first = new Event('vite:preloadError', { cancelable: true })
    handler(first)
    expect(first.defaultPrevented).toBe(true)
    expect(reload).toHaveBeenCalledTimes(1)

    const repeated = new Event('vite:preloadError', { cancelable: true })
    handler(repeated)
    expect(repeated.defaultPrevented).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('does not risk a reload loop when session storage is unavailable', () => {
    const reload = vi.fn()
    const handler = createVitePreloadRecoveryHandler({
      buildId: 'build-a',
      pathname: '/',
      reload,
      storage: {
        getItem: () => {
          throw new Error('storage blocked')
        },
        setItem: () => {
          throw new Error('storage blocked')
        },
      },
    })
    const event = new Event('vite:preloadError', { cancelable: true })

    handler(event)

    expect(event.defaultPrevented).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  })
})
