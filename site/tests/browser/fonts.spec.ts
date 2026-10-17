import { expect, test } from '@playwright/test'

const FONT_FILE = /\.(?:woff2?|ttf|otf|eot)(?:[?#]|$)/i

// 建置只發布 woff2（見 woff2-fonts.ts）。三個引擎都要真的把公式字體從 woff2 裝上，
// 並且不去請求任何舊格式字體。
test('@cross-browser formula and UI fonts load from woff2 only', async ({ page }) => {
  const fontRequests: string[] = []
  page.on('request', (request) => {
    const { pathname } = new URL(request.url())
    if (FONT_FILE.test(pathname)) fontRequests.push(pathname)
  })

  await page.goto('/part/b/lcs')
  await expect(page.locator('.katex').first()).toBeVisible()

  await expect
    .poll(() =>
      page.evaluate(async () => {
        await document.fonts.ready
        return [...document.fonts]
          .filter((face) => face.status === 'loaded')
          .map((face) => face.family.replaceAll(/["']/g, ''))
      }),
    )
    .toEqual(expect.arrayContaining(['KaTeX_Main', 'Space Grotesk']))

  expect(fontRequests.some((path) => /KaTeX_Main-[^/]*\.woff2$/.test(path))).toBe(true)
  expect(fontRequests.filter((path) => !path.endsWith('.woff2'))).toEqual([])
})
