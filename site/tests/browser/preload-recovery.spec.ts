import { expect, test } from '@playwright/test'

for (const [family, chunk] of [['c', 'interval'], ['d', 'matrix']] as const) {
  test(`@cross-browser ${family} art failure preserves the import error and reloads the current SPA route once`, async ({ page, browserName }) => {
    let reloads = 0
    let failures = 0
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('request', (request) => {
      if (request.isNavigationRequest() && new URL(request.url()).pathname === `/part/${family}`) reloads++
    })
    await page.addInitScript(() => {
      window.addEventListener('vite:preloadError', (event) => {
        queueMicrotask(() => {
          const cancelled = JSON.parse(sessionStorage.getItem('test:preload-cancelled') || '[]') as boolean[]
          cancelled.push(event.defaultPrevented)
          sessionStorage.setItem('test:preload-cancelled', JSON.stringify(cancelled))
        })
      })
    })
    await page.route(new RegExp(`/assets/${chunk}-[^/]+\\.js$`, 'u'), async (route) => {
      if (reloads === 0) {
        failures++
        await route.fulfill({ status: 503, headers: { 'cache-control': 'no-store' } })
      } else {
        await route.continue()
      }
    })

    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    // The announcer is already prerendered; client effects prove hydration has run.
    await expect(page.locator('.home')).toHaveClass(/home--gsap/u)
    const link = page.locator(`nav[aria-label="主导航"] a[href="/part/${family}"]`)
    await link.focus()
    await link.press('Enter')
    await expect(page).toHaveURL(`/part/${family}`)
    await expect.poll(() => reloads).toBe(1)
    await expect(page.locator(`img[data-family-art="${family}"][data-family-mode="hero"]`)).toBeVisible()
    await expect(page.locator('.route-announcer')).toContainText(family === 'c' ? '区间 DP' : '矩阵 DP')
    expect(failures).toBeGreaterThan(0)

    const recovery = await page.evaluate(() => ({
      keys: Object.keys(sessionStorage).filter((key) => key.startsWith('dp:preload-recovery:')),
      cancelled: JSON.parse(sessionStorage.getItem('test:preload-cancelled') || '[]') as boolean[],
    }))
    expect(recovery.keys).toHaveLength(1)
    expect(recovery.keys[0]).toMatch(new RegExp(`:/part/${family}$`, 'u'))
    expect(recovery.cancelled.length).toBeGreaterThan(0)
    expect(recovery.cancelled.every((cancelled) => !cancelled)).toBe(true)
    expect(errors.some((message) => /reading ['"]default['"]/u.test(message))).toBe(false)
    // WebKit can reuse the failed module preload after reload (bug 270357).
    // The persistent-failure case exercises the resulting manual recovery.
    if (browserName !== 'webkit') await expect(page.locator('.error-boundary')).toHaveCount(0)
  })

  test(`@cross-browser ${family} keeps its prerendered lesson and offers retry after a persistent chunk failure`, async ({ page, baseURL, browserName }) => {
    const path = `/part/${family}`
    const origin = 'https://dp.round1.cc'
    const asset = new RegExp(`^/assets/${chunk}-[^/]+\\.js$`, 'u')
    const clientErrors: unknown[] = []
    let navigationCount = 0
    let chunkFailures = 0
    let blockChunk = true
    let pageViews = 0

    // Exercise the production-only analytics sender, serving every response from the local fixture.
    await page.route('**/*', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      if (url.origin !== origin) return route.abort()
      if (url.pathname === '/api/analytics' && request.method() === 'POST') {
        const payload = request.postDataJSON() as { event: string } | null
        if (payload?.event === 'client_error') clientErrors.push(payload)
        if (payload?.event === 'page_view') pageViews++
        return route.fulfill({ status: 204 })
      }
      if (request.isNavigationRequest() && url.pathname === path) navigationCount++
      if (blockChunk && asset.test(url.pathname)) {
        chunkFailures++
        return route.fulfill({ status: 503, headers: { 'cache-control': 'no-store' } })
      }
      const response = await route.fetch({ url: new URL(url.pathname, baseURL).href, maxRedirects: 0 })
      return route.fulfill({ response })
    })
    await page.addInitScript((useFetch) => {
      // WebKit's request interception does not expose the beacon's Blob body.
      if (useFetch) Object.defineProperty(navigator, 'sendBeacon', { value: () => false })
      sessionStorage.removeItem('test:preload-message')
      window.addEventListener('vite:preloadError', (event) => {
        const { payload } = event as Event & { payload?: unknown }
        if (payload instanceof Error && !sessionStorage.getItem('test:preload-message')) {
          sessionStorage.setItem('test:preload-message', payload.message)
        }
      })
    }, browserName === 'webkit')

    await page.goto(`${origin}${path}`, { waitUntil: 'commit' })
    const retry = page.getByRole('button', { name: '重新加载' })
    await expect(retry).toBeVisible()
    expect(chunkFailures).toBeGreaterThan(0)
    await expect(page.getByRole('heading', { name: family === 'c' ? '区间 DP' : '矩阵 DP', level: 1 })).toBeVisible()
    await expect(page.getByRole('region', { name: '沿状态路径学习' })).toBeVisible()
    expect(navigationCount).toBe(2)

    const originalMessage = await page.evaluate(() => sessionStorage.getItem('test:preload-message'))
    expect(originalMessage).toBeTruthy()
    await expect.poll(() => clientErrors).toMatchObject([{
      event: 'client_error',
      path,
      metadata: { source: 'startup', recovery: 'exhausted', message: originalMessage?.slice(0, 160) },
    }])

    await retry.click()
    await expect.poll(() => clientErrors).toHaveLength(2)
    await expect(retry).toBeVisible()
    expect(navigationCount).toBe(3)

    blockChunk = false
    await retry.click()
    await expect.poll(() => pageViews).toBeGreaterThan(0)
    await expect(page.locator(`img[data-family-art="${family}"][data-family-mode="hero"]`)).toBeVisible()
    await expect(retry).toHaveCount(0)
    expect(navigationCount).toBe(4)
    expect(clientErrors).toHaveLength(2)
  })
}
