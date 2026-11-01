import { expect, test } from '@playwright/test'

for (const [family, chunk] of [['c', 'interval'], ['d', 'matrix']] as const) {
  test(`@cross-browser ${family} art failure preserves the import error and reloads the current SPA route once`, async ({ page }) => {
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
        await route.abort('failed')
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
    await expect(page.locator('.error-boundary')).toHaveCount(0)
  })
}
