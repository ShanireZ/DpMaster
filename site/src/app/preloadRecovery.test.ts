import { describe, expect, it, vi } from 'vitest'
import {
  createModuleLoadRecovery,
  createVitePreloadRecoveryHandler,
  isModuleLoadError,
} from './preloadRecovery.ts'

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

  // 兩條恢復路徑共用同一把鎖。分開計數的話，同一次失敗會被刷兩次 ——
  // 第二次刷新發生在第一次的導覽過程中，表現為閃一下再白屏，很難重現。
  it('shares one reload budget with the error boundary path', () => {
    const storage = memoryStorage()
    const reload = vi.fn()
    const options = {
      buildId: 'build-a',
      pathname: '/part/a/group',
      reload,
      storage,
    }

    const handler = createVitePreloadRecoveryHandler(options)
    handler(new Event('vite:preloadError', { cancelable: true }))
    expect(reload).toHaveBeenCalledTimes(1)

    // 邊界隨後就同一次失敗再來一遍，必須被拒。
    expect(createModuleLoadRecovery(options).reserve()).toBe(false)

    // 換一條路徑仍有自己的額度：一次部署裡多個路由各允許恢復一次。
    expect(
      createModuleLoadRecovery({ ...options, pathname: '/part/b' }).reserve(),
    ).toBe(true)
  })
})

describe('isModuleLoadError', () => {
  // 三家瀏覽器措辭各不相同，而我們只拿得到 message。少認一種，那家瀏覽器的使用者
  // 就完全走不到自動恢復 —— 而且不會有任何跡象表明少認了。
  it.each([
    'Failed to fetch dynamically imported module: https://dp.round1.cc/assets/KnapsackGroup-CS9oy4kI.js',
    'error loading dynamically imported module: https://dp.round1.cc/assets/KnapsackGroup-CS9oy4kI.js',
    'Importing a module script failed.',
    'Failed to load module script: expected a JavaScript module',
    "Cannot read properties of undefined (reading 'default')",
    'Cannot read properties of undefined (reading "default")',
    "Cannot read property 'default' of undefined",
    "undefined is not an object (evaluating 'e.default')",
  ])('recognises %s', (message) => {
    expect(isModuleLoadError(new Error(message))).toBe(true)
  })

  // 刷新只對「資源當時取不到」有用。元件自身的異常刷幾次都一樣，必須留給人工
  // 路徑，否則就是拿自動刷新掩蓋真 bug。
  it.each([
    'Cannot read properties of undefined (reading of map)',
    'NetworkError when attempting to fetch resource.',
    'ChunkLoadError',
  ])('leaves %s to the manual path', (message) => {
    expect(isModuleLoadError(new Error(message))).toBe(false)
  })

  it('tolerates non-Error values', () => {
    expect(isModuleLoadError('Failed to fetch dynamically imported module')).toBe(
      false,
    )
    expect(isModuleLoadError(null)).toBe(false)
  })
})
