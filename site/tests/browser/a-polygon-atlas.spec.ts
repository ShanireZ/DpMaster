import { expect, test } from '@playwright/test'

const lessons = [
  '01',
  'complete',
  'multiple',
  'group',
  'mixed',
  'cost2d',
  'dep',
  'variant',
  'fractional',
] as const

test('A category renders the solid and wireframe polygon backpack', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.goto('/part/a')

  await expect(page.locator('.partcover__backpack')).toBeVisible()
  await expect(page.locator('[data-family-art="a"][data-family-mode="hero"]')).toBeVisible()
  await expect(page.locator('.partcover__backpack .poly-backpack__face')).toHaveCount(38)
  await expect(page.locator('.partjourney__polygon')).toBeVisible()
  await expect(page.locator('[data-family-art="a"][data-family-mode="journey"]')).toBeVisible()
  await expect(page.locator('.partjourney__polygon .poly-backpack__geometry--wireframe')).toBeVisible()
  await expect(page.locator('.partjourney--a .typewaypoint')).toHaveCount(9)
  await expect(page.locator('.partcover--a .partcover__glyph')).toHaveCount(0)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('.partcover__backpack')).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
  ).toBe(true)
  expect(runtimeErrors).toEqual([])
})

test('all nine A lessons render their own scientific plate', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  for (const slug of lessons) {
    await page.goto(`/part/a/${slug}`)
    const plate = page.locator(`.knapsack-plate[data-lesson-plate="${slug}"]`)
    await expect(plate).toBeVisible()
    await expect(plate).toHaveAttribute('data-family-art', 'a')
    await expect(plate).toHaveAttribute('data-family-mode', 'lesson')
    await expect(plate.locator('title')).toHaveCount(1)
    await expect(plate.locator('desc')).toHaveCount(1)
    await expect(plate.locator('.knapsack-plate__grid')).toHaveCount(0)
    await expect(plate.locator('.knapsack-plate__watermark')).toHaveCount(0)
    await expect(page.locator(`.typepage[data-lesson-slug="${slug}"]`)).toBeVisible()
    await expect(page.getByRole('button', { name: /学完/ })).toHaveCount(0)
    await expect(page.getByText(/内容维护：|审核状态：|最近更新：/)).toHaveCount(0)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    ).toBe(true)
  }

  const desktopOutline = page.locator('.lesson-outline--desktop')
  expect(await desktopOutline.evaluate((outline) => {
    const style = getComputedStyle(outline)
    return {
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      fits: outline.scrollWidth <= outline.clientWidth + 1,
    }
  })).toEqual({
    overflowX: 'visible',
    overflowY: 'visible',
    fits: true,
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/part/a/cost2d')
  await expect(page.locator('.knapsack-plate[data-lesson-plate="cost2d"]')).toBeVisible()
  await expect(page.locator('.lesson-outline--mobile')).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
  ).toBe(true)
  expect(runtimeErrors).toEqual([])
})

test('A lesson cues keep inline copy readable and DP panels use the available width', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })

  for (const slug of lessons) {
    await page.goto(`/part/a/${slug}`)
    await expect(page.locator('.lesson-flow')).toBeVisible()

    const layout = await page.evaluate(() => {
      const brokenCueChildren = [...document.querySelectorAll('.pointer-cue')]
        .flatMap((cue) => [...cue.children])
        .filter((child) => {
          if (child.tagName.toLowerCase() === 'svg') return false
          const rect = child.getBoundingClientRect()
          return rect.width <= 30 && rect.height > 40
        })
        .map((child) => child.textContent?.trim())

      const dpPanels = [...document.querySelectorAll('.dpviz')].map((viz) => {
        const table = viz.querySelector('.dpviz__scroll')?.getBoundingClientRect()
        const panel = viz.querySelector('.dpviz__panel')?.getBoundingClientRect()
        return {
          aligned: !!table && !!panel && Math.abs(table.top - panel.top) <= 1,
          separated: !!table && !!panel && panel.left >= table.right - 1,
        }
      })
      const demoInsets = [...document.querySelectorAll('.demo__body')].map((body) => {
        const style = getComputedStyle(body)
        return {
          left: Number.parseFloat(style.paddingLeft),
          right: Number.parseFloat(style.paddingRight),
        }
      })
      const art = document.querySelector('.typehead__art')?.getBoundingClientRect()
      const glyph = document.querySelector('.typehead__glyph')?.getBoundingClientRect()

      return {
        brokenCueChildren,
        dpPanels,
        demoInsets,
        heroCenterDelta: art && glyph
          ? Math.abs((art.left + art.width / 2) - (glyph.left + glyph.width / 2))
          : Number.POSITIVE_INFINITY,
        noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      }
    })

    expect(layout.brokenCueChildren, `${slug}: pointer cue copy should not collapse into the icon column`).toEqual([])
    expect(layout.dpPanels.every(({ aligned, separated }) => aligned && separated), `${slug}: DP table and explanation panel should share the first row`).toBe(true)
    expect(layout.demoInsets.every(({ left, right }) => left >= 23 && right >= 23), `${slug}: demo content should keep desktop safe spacing`).toBe(true)
    expect(layout.heroCenterDelta, `${slug}: lesson plate should share the art-column center`).toBeLessThanOrEqual(2)
    expect(layout.noOverflow, `${slug}: desktop page should not overflow horizontally`).toBe(true)
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/part/a/01')
  await expect(page.locator('.lesson-flow')).toBeVisible()

  const mobileLayout = await page.evaluate(() => {
    const cue = document.querySelector('.pointer-cue')?.getBoundingClientRect()
    const table = document.querySelector('.dpviz__scroll')?.getBoundingClientRect()
    const panel = document.querySelector('.dpviz__panel')?.getBoundingClientRect()
    const body = document.querySelector('.demo__body')
    const bodyStyle = body ? getComputedStyle(body) : null
    return {
      cueFits: !!cue && cue.right <= document.documentElement.clientWidth + 1,
      demoInset: bodyStyle
        ? Math.min(Number.parseFloat(bodyStyle.paddingLeft), Number.parseFloat(bodyStyle.paddingRight))
        : 0,
      panelBelowTable: !!table && !!panel && panel.top >= table.bottom - 1,
      noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
    }
  })

  expect(mobileLayout.cueFits).toBe(true)
  expect(mobileLayout.demoInset).toBeGreaterThanOrEqual(11)
  expect(mobileLayout.panelBelowTable).toBe(true)
  expect(mobileLayout.noOverflow).toBe(true)
})
