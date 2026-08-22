import { expect, test, type Page } from '@playwright/test'

/**
 * Core Web Vitals 回归门禁。
 *
 * 线上 Cloudflare Web Analytics 暴露过两处真实问题：首页 hero 直接用 1200×630
 * 的社交分享图导致 LCP 长尾（P99 5.8s），以及 `section.state-atlas`（GSAP pin）
 * 与 `div.lesson-flow`（Suspense fallback 高度不足）两处布局偏移。这套断言
 * 把修好之后的形态锁住。
 *
 * ★ 量的是真实渲染指标，不是源码形状 —— 只有会合成帧的浏览器才测得到，
 * 所以这套只能跑在 Playwright 里，不能挪进 jsdom 单测。
 */

interface ShiftReport {
  cls: number
  worst: Array<{ value: number; sources: string[] }>
}

/** 安装 layout-shift 观察器；返回一个取当前累计值的函数。 */
async function trackLayoutShift(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __dpShifts?: Array<{ value: number; sources: string[] }> }
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
        // hadRecentInput 的偏移是用户交互引起的，CWV 本身就不计入。
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
    const w = window as unknown as { __dpShifts?: Array<{ value: number; sources: string[] }> }
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

  // 滚到状态图谱附近，触发 GSAP ScrollTrigger 的 pin —— pin-spacer 是 JS 之后
  // 才插进 DOM 的，历史上就是在这一步把下方内容整体顶开。
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

  // ★ 关键在滚动，不在跳转。`.lesson` 用了 content-visibility: auto 加
  // contain-intrinsic-size 估值；估值与真实高度不符时，每滚过一节就会修正一次
  // 高度，把下方内容顶动 —— 线上把这些偏移都归到了父容器 div.lesson-flow。
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
    // ★ 按 URL 过滤，不按 content-type —— 本地预览服务器曾经把 avif/webp
    // 当二进制流发，用 content-type 过滤会把要测的东西全漏掉。
    if (!/\.(avif|webp|jpe?g|png)(\?|$)/i.test(response.url())) return
    // ★ 字节数必须读真实响应体。预览服务器不发 content-length，用响应头会拿到
    // 0，于是「小于 40KB」变成恒真的空断言 —— 这条断言就白写了。
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

  // ★ 只应下载一张 hero：历史上主题不匹配会让 dark/light 两张都被拉下来。
  expect(hero.length, `hero 请求：${hero.map((h) => h.url).join(', ')}`).toBe(1)
  expect(hero[0].type, `hero 格式：${hero[0].type}`).toMatch(/avif|webp/)
  expect(hero[0].bytes, `hero 字节：${hero[0].bytes}`).toBeGreaterThan(0)
  // 原来是两张 JPEG 共约 150KB；现在一张 AVIF 约 24KB。留一倍余量防回归。
  expect(hero[0].bytes, `hero 字节：${hero[0].bytes}`).toBeLessThan(40_000)
})
