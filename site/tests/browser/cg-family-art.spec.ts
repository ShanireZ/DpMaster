import { expect, test } from '@playwright/test'

const families = {
  c: ['stone', 'ring', 'palindrome', 'tree', 'merge'],
  d: ['grid', 'matpow'],
  e: ['basic', 'distsum', 'inout', 'center'],
  f: ['select', 'knapsack', 'diameter', 'cover', 'count'],
  g: ['board', 'tsp', 'cover', 'subset', 'plug'],
} as const

const familyNames = {
  c: 'interval',
  d: 'matrix',
  e: 'reroot',
  f: 'tree',
  g: 'bitmask',
} as const

test('C–G category pages render independent poly heroes and integrated journeys', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  for (const [family, slugs] of Object.entries(families)) {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`/part/${family}`)

    const hero = page.locator(`img[data-family-art="${family}"][data-family-mode="hero"]`)
    await expect(hero).toBeVisible()
    await expect(hero).toHaveAttribute('alt', '')
    await expect(hero).toHaveAttribute('aria-hidden', 'true')
    await expect(hero).toHaveJSProperty('complete', true)
    expect(await hero.evaluate((image: HTMLImageElement) => ({
      width: image.naturalWidth,
      height: image.naturalHeight,
      src: image.currentSrc,
    }))).toEqual(expect.objectContaining({
      width: 1152,
      height: 768,
      src: expect.stringContaining(`${familyNames[family as keyof typeof familyNames]}-hero`),
    }))

    await expect(page.locator(`[data-family-art="${family}"][data-family-mode="journey"]`)).toBeVisible()
    await expect(page.locator(`.partjourney--${family} .typewaypoint`)).toHaveCount(slugs.length)
    await expect(page.locator(`.partcover--${family} .partcover__glyph`)).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true)

    const resources = await page.evaluate(() =>
      performance.getEntriesByType('resource').map((entry) => entry.name),
    )
    const foreignFamilies = Object.values(familyNames).filter((name) => name !== familyNames[family as keyof typeof familyNames])
    expect(foreignFamilies.some((name) => resources.some((resource) => resource.includes(`${name}-hero`)))).toBe(false)

    await page.setViewportSize({ width: 390, height: 844 })
    await expect(hero).toBeVisible()
    await expect(page.locator(`.partjourney--${family} .partjourney__art`)).toBeHidden()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true)
  }

  expect(runtimeErrors).toEqual([])
})

test('C–G lessons use 21 distinct accessible poly atlas plates', async ({ page }) => {
  const cellsByFamily = new Map<string, Set<string>>()
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.setViewportSize({ width: 1440, height: 900 })
  for (const [family, slugs] of Object.entries(families)) {
    const cells = new Set<string>()
    cellsByFamily.set(family, cells)

    for (const slug of slugs) {
      const errorsBeforeNavigation = runtimeErrors.length
      await page.goto(`/part/${family}/${slug}`)
      const plate = page.locator(`[data-family-art="${family}"][data-family-mode="lesson"][data-lesson-plate="${slug}"]`)
      await expect(plate).toBeVisible()
      await expect(plate).toHaveAttribute('role', 'img')
      await expect(plate).toHaveAttribute('aria-label', /：.+/)
      await expect(page.locator('.typehead__art-code')).toHaveCount(0)

      const atlas = plate.locator('.poly-lesson-plate__atlas')
      await expect(atlas).toHaveJSProperty('complete', true)
      expect(await atlas.evaluate((image: HTMLImageElement) => ({
        width: image.naturalWidth,
        height: image.naturalHeight,
        src: image.currentSrc,
      }))).toEqual(expect.objectContaining({
        width: 1152,
        height: 768,
        src: expect.stringContaining(`${familyNames[family as keyof typeof familyNames]}-lessons`),
      }))

      cells.add(`${await plate.getAttribute('data-atlas-column')}:${await plate.getAttribute('data-atlas-row')}`)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true)
      expect(
        runtimeErrors.slice(errorsBeforeNavigation),
        `${family}/${slug} should hydrate without runtime errors`,
      ).toEqual([])
    }

    expect(cells.size).toBe(slugs.length)
  }

  expect([...cellsByFamily.values()].reduce((sum, cells) => sum + cells.size, 0)).toBe(21)
})

test('C–G lesson titles and plates stay intact across the desktop-to-mobile boundary', async ({ page }) => {
  test.setTimeout(90_000)
  const viewports = [
    { width: 1024, height: 900, mode: 'desktop' },
    { width: 821, height: 900, mode: 'desktop' },
    { width: 820, height: 900, mode: 'mobile' },
  ] as const

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)

    for (const [family, slugs] of Object.entries(families)) {
      for (const slug of slugs) {
        const route = `${family}/${slug} at ${viewport.width}x${viewport.height}`
        await page.goto(`/part/${family}/${slug}`)
        await expect(page.locator('.poly-lesson-plate__atlas')).toHaveJSProperty('complete', true)

        const layout = await page.locator('.typepage').evaluate((root) => {
          const title = root.querySelector<HTMLElement>('.typehead h1')!
          const copy = root.querySelector<HTMLElement>('.typehead__copy')!
          const art = root.querySelector<HTMLElement>('.typehead__art')!
          const plate = root.querySelector<HTMLElement>('.poly-lesson-plate')!
          const titleBox = title.getBoundingClientRect()
          const copyBox = copy.getBoundingClientRect()
          const artBox = art.getBoundingClientRect()
          const plateBox = plate.getBoundingClientRect()
          const titleStyle = getComputedStyle(title)

          return {
            titleLineCount: titleBox.height / Number.parseFloat(titleStyle.lineHeight),
            titleFontSize: Number.parseFloat(titleStyle.fontSize),
            titleRight: titleBox.right,
            copyBottom: copyBox.bottom,
            artLeft: artBox.left,
            artTop: artBox.top,
            artCenter: artBox.left + artBox.width / 2,
            plateLeft: plateBox.left,
            plateRight: plateBox.right,
            plateWidth: plateBox.width,
            plateCenter: plateBox.left + plateBox.width / 2,
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
          }
        })

        expect(layout.titleLineCount, `${route}: title should stay on one line`).toBeLessThanOrEqual(1.05)
        expect(layout.titleFontSize, `${route}: title should stay readable`).toBeGreaterThanOrEqual(31.5)
        expect(layout.plateLeft, `${route}: plate should stay inside the viewport`).toBeGreaterThanOrEqual(-1)
        expect(layout.plateRight, `${route}: plate should stay inside the viewport`).toBeLessThanOrEqual(layout.clientWidth + 1)
        expect(Math.abs(layout.plateCenter - layout.artCenter), `${route}: plate should remain centered`).toBeLessThanOrEqual(2)
        expect(layout.scrollWidth, `${route}: page should not overflow horizontally`).toBeLessThanOrEqual(layout.clientWidth + 1)

        if (viewport.mode === 'desktop') {
          expect(layout.titleRight, `${route}: title should not collide with the illustration`).toBeLessThanOrEqual(layout.artLeft + 1)
        } else {
          expect(layout.artTop, `${route}: illustration should follow the copy`).toBeGreaterThanOrEqual(layout.copyBottom - 1)
          expect(layout.plateWidth, `${route}: illustration should remain legible`).toBeGreaterThanOrEqual(340)
        }
      }
    }
  }
})

test('C–G geometry and content remain stable between dark and light themes', async ({ page }) => {
  for (const family of Object.keys(families)) {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.addInitScript(() => localStorage.setItem('dp-master-theme', 'dark'))
    await page.goto(`/part/${family}`)
    const dark = await page.locator(`.partjourney--${family} .typewaypoint`).evaluateAll((items) =>
      items.map((item) => {
        const box = item.getBoundingClientRect()
        return [Math.round(box.left), Math.round(box.top), Math.round(box.width), Math.round(box.height)]
      }),
    )

    await page.evaluate(() => {
      localStorage.setItem('dp-master-theme', 'light')
      document.documentElement.dataset.theme = 'light'
    })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    const light = await page.locator(`.partjourney--${family} .typewaypoint`).evaluateAll((items) =>
      items.map((item) => {
        const box = item.getBoundingClientRect()
        return [Math.round(box.left), Math.round(box.top), Math.round(box.width), Math.round(box.height)]
      }),
    )

    expect(light).toEqual(dark)
  }
})

test('C–G category composition stays safe at intermediate widths and reduced motion', async ({ browser }) => {
  test.setTimeout(60_000)
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  const viewports = [
    { width: 1600, height: 1000 },
    { width: 1024, height: 900 },
    { width: 820, height: 900 },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    for (const [family, slugs] of Object.entries(families)) {
      await page.goto(`/part/${family}`)
      const hero = page.locator(`img[data-family-art="${family}"][data-family-mode="hero"]`)
      await expect(hero).toBeVisible()
      await expect(page.locator(`.partjourney--${family} .typewaypoint`)).toHaveCount(slugs.length)
      const journeyArt = page.locator(`.partjourney--${family} .partjourney__art`)
      if (viewport.width <= 900) await expect(journeyArt).toBeHidden()
      else await expect(journeyArt).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true)
    }
  }

  await context.close()
})

test('C–G representative lesson demos perform a real state change', async ({ page }) => {
  test.setTimeout(60_000)

  await page.goto('/part/c/stone')
  const stoneValue = page
    .locator('.demo-control__item')
    .first()
    .locator('.stepper__val')
  await expect(stoneValue).toHaveText('7')
  await page.getByRole('button', { name: '石子数 a 加' }).first().click()
  await expect(stoneValue).toHaveText('8')

  await page.goto('/part/d/matpow')
  await expect(page.locator('.mpw__result-line')).toContainText('F(6)')
  await page.getByRole('button', { name: 'n 加' }).click()
  await expect(page.locator('.mpw__result-line')).toContainText('F(7)')

  await page.goto('/part/e/distsum')
  await expect(page.locator('.rr__split-card.down .v')).toHaveText('W = 7')
  await page.getByRole('button', { name: '点权（点上带数量）' }).click()
  await expect(page.locator('.rr__split-card.down .v')).toHaveText('W = 13')

  await page.goto('/part/f/knapsack')
  const edgeCountControl = page.locator('.td__toolbar > div').last()
  await expect(edgeCountControl.locator('.stepper__val')).toHaveText('3')
  await edgeCountControl.getByRole('button', { name: '加' }).click()
  await expect(edgeCountControl.locator('.stepper__val')).toHaveText('4')

  await page.goto('/part/g/board')
  const boardPlayback = page.getByRole('group', { name: '棋盘布局逐帧播放' })
  const counter = boardPlayback.locator('.playback__count')
  await expect(counter).toHaveText(/^1\/\d+$/)
  await boardPlayback.getByRole('button', { name: '下一步' }).click()
  await expect(counter).toHaveText(/^2\/\d+$/)
})
