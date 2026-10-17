import { expect, test, type Page } from '@playwright/test'

/**
 * Core Web Vitals 迴歸門禁。
 *
 * 線上 Cloudflare Web Analytics 暴露過兩處真實問題：首頁 hero 直接用 1200×630
 * 的社交分享圖導致 LCP 長尾（P99 5.8s），以及 `section.state-atlas`（GSAP pin）
 * 與 `div.lesson-flow`（Suspense fallback 高度不足）兩處佈局偏移。這套斷言
 * 把修好之後的形態鎖住。
 *
 * ★ 量的是真實繪製指標，不是原始碼形狀 —— 只有會合成影格的瀏覽器才測得到，
 * 所以這套只能跑在 Playwright 裡，不能挪進 jsdom 單測。
 */

interface ShiftRecord {
  value: number
  at: number
  spacers: number
  scrollY: number
  sources: string[]
}

interface ShiftReport {
  cls: number
  worst: ShiftRecord[]
}

/** 安裝 layout-shift 觀察器；回傳一個取當前累計值的函式。 */
async function trackLayoutShift(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __dpShifts?: ShiftRecord[] }
    w.__dpShifts = []
    const describe = (node: Node | null) => {
      const el = node as Element | null
      if (!el?.tagName) return 'unknown'
      const cls = typeof el.className === 'string' && el.className
        ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
        : ''
      return `${el.tagName.toLowerCase()}${cls}`
    }
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          value: number
          hadRecentInput: boolean
          sources?: Array<{ node: Node | null }>
        }
        // hadRecentInput 的偏移是使用者交互引起的，CWV 本身就不計入。
        if (shift.hadRecentInput) continue
        w.__dpShifts!.push({
          value: shift.value,
          at: Math.round(shift.startTime),
          spacers: document.querySelectorAll('.pin-spacer').length,
          scrollY: Math.round(window.scrollY),
          sources: (shift.sources ?? []).map((s) => describe(s.node)),
        })
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
}

async function readLayoutShift(page: Page): Promise<ShiftReport> {
  return page.evaluate(() => {
    const w = window as unknown as { __dpShifts?: ShiftRecord[] }
    const shifts = w.__dpShifts ?? []
    return {
      cls: shifts.reduce((total, s) => total + s.value, 0),
      worst: [...shifts].sort((a, b) => b.value - a.value).slice(0, 5),
    }
  })
}

function formatWorst(report: ShiftReport): string {
  return report.worst
    .map((s) => `${s.value.toFixed(4)} ← ${s.sources.join(', ') || '(no source)'}`)
    .join(' | ')
}

test('the home page stays below the CLS "good" threshold while the atlas pins', async ({ page }) => {
  await page.goto('/')
  await trackLayoutShift(page)
  await expect(page.locator('.home-hero')).toBeVisible()

  // 滾到狀態圖譜附近，觸發 GSAP ScrollTrigger 的 pin —— pin-spacer 是 JS 之後
  // 才插進 DOM 的，歷史上就是在這一步把下方內容整體頂開。
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  for (let step = 0; step < 12; step += 1) {
    await page.evaluate(() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'instant' }))
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(400)

  const report = await readLayoutShift(page)
  expect(report.cls, `CLS=${report.cls.toFixed(4)} 最大偏移：${formatWorst(report)}`).toBeLessThan(0.1)
})

test('scrolling through a lesson does not shift the article body', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.route('**/*.{woff,woff2,ttf}', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 900))
    await route.continue()
  })
  await page.goto('/part/a/01')
  await expect(page.locator('.lesson-flow')).toBeVisible()
  await trackLayoutShift(page)

  // ★ 關鍵在捲動，不在跳轉。`.lesson` 用了 content-visibility: auto 加
  // contain-intrinsic-size 估值；估值與真實高度不符時，每滾過一節就會修正一次
  // 高度，把下方內容頂動 —— 線上把這些偏移都歸到了父容器 div.lesson-flow。
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
    await page.waitForTimeout(80)
  }
  await page.waitForTimeout(500)

  const report = await readLayoutShift(page)
  expect(report.cls, `CLS=${report.cls.toFixed(4)} 最大偏移：${formatWorst(report)}`).toBeLessThan(0.1)
})

test('the hero image is served in a modern format and stays small', async ({ page }) => {
  const heroResponses: Array<{ url: string; type: string; bytes: number }> = []
  page.on('response', async (response) => {
    // ★ 按 URL 過濾，不按 content-type —— 本機預覽伺服器曾經把 avif/webp
    // 當二進位流發，用 content-type 過濾會把要測的東西全漏掉。
    if (!/\.(avif|webp|jpe?g|png)(\?|$)/i.test(response.url())) return
    // ★ 位元組數必須讀真實回應體。預覽伺服器不發 content-length，用回應頭會拿到
    // 0，於是「小於 40KB」變成恆真的空斷言 —— 這條斷言就白寫了。
    let bytes = 0
    try {
      bytes = (await response.body()).length
    } catch {
      bytes = -1
    }
    heroResponses.push({ url: response.url(), type: response.headers()['content-type'] ?? '', bytes })
  })

  await page.goto('/')
  await expect(page.locator('.home-hero')).toBeVisible()
  await page.waitForTimeout(1200)

  const hero = heroResponses.filter((r) => /dpmaster-social|hero/.test(r.url))
  expect(hero.length, `抓到的图片：${JSON.stringify(heroResponses, null, 2)}`).toBeGreaterThan(0)

  // ★ 只應下載一張 hero：歷史上主題不匹配會讓 dark/light 兩張都被拉下來。
  expect(hero.length, `hero 请求：${hero.map((h) => h.url).join(', ')}`).toBe(1)
  expect(hero[0].type, `hero 格式：${hero[0].type}`).toMatch(/avif|webp/)
  expect(hero[0].bytes, `hero 字节：${hero[0].bytes}`).toBeGreaterThan(0)
  // 原來是兩張 JPEG 共約 150KB；現在一張 AVIF 約 24KB。留一倍餘量防迴歸。
  expect(hero[0].bytes, `hero 字节：${hero[0].bytes}`).toBeLessThan(40_000)
})
