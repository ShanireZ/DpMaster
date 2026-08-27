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

  // 两条恢复路径共用同一把锁。分开计数的话，同一次失败会被刷两次 ——
  // 第二次刷新发生在第一次的导航过程中，表现为闪一下再白屏，很难复现。
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

    // 边界随后就同一次失败再来一遍，必须被拒。
    expect(createModuleLoadRecovery(options).reserve()).toBe(false)

    // 换一条路径仍有自己的额度：一次部署里多个路由各允许恢复一次。
    expect(
      createModuleLoadRecovery({ ...options, pathname: '/part/b' }).reserve(),
    ).toBe(true)
  })
})

describe('isModuleLoadError', () => {
  // 三家浏览器措辞各不相同，而我们只拿得到 message。少认一种，那家浏览器的用户
  // 就完全走不到自动恢复 —— 而且不会有任何迹象表明少认了。
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

  // 刷新只对「资源当时取不到」有用。组件自身的异常刷几次都一样，必须留给人工
  // 路径，否则就是拿自动刷新掩盖真 bug。
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
