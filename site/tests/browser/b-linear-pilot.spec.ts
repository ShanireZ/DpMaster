import { expect, test } from '@playwright/test'

test('B category renders the high-fidelity polygon index sculpture and an integrated two-rail course score', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/part/b')

  const hero = page.locator('img.linear-hero--image[data-family-art="b"][data-family-mode="hero"]')
  await expect(hero).toBeVisible()
  await expect(hero).toHaveAttribute('alt', '')
  await expect(hero).toHaveAttribute('aria-hidden', 'true')
  await expect(hero).toHaveJSProperty('complete', true)
  const heroAsset = await hero.evaluate((image: HTMLImageElement) => ({
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    src: image.currentSrc,
  }))
  expect(heroAsset.naturalWidth).toBe(1536)
  expect(heroAsset.naturalHeight).toBe(1024)
  expect(heroAsset.src).toContain('linear-hero')
  const categoryResources = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((entry) => entry.name),
  )
  expect(categoryResources.some((resource) => resource.includes('backpack-hero'))).toBe(false)
  expect(categoryResources.some((resource) => resource.includes('knapsack-lessons'))).toBe(false)
  await expect(page.locator('.linear-hero__state')).toHaveCount(0)
  await expect(page.locator('[data-family-art="b"][data-family-mode="journey"]')).toBeVisible()
  await expect(page.locator('.linear-journey__relations path')).toHaveCount(6)
  await expect(page.locator('.partjourney--b .typewaypoint')).toHaveCount(7)
  await expect(page.locator('.partcover--b .partcover__glyph')).toHaveCount(0)
  const secondRowOrder = await page.locator(
    '.partjourney--b .typewaypoint--pos-5, .partjourney--b .typewaypoint--pos-6, .partjourney--b .typewaypoint--pos-7',
  ).evaluateAll((items) => items.map((item) => item.getBoundingClientRect().left))
  expect(secondRowOrder[0]).toBeGreaterThan(secondRowOrder[1])
  expect(secondRowOrder[1]).toBeGreaterThan(secondRowOrder[2])
  await expect(page.locator('.partjourney--b .typepath__transition')).toHaveCount(6)
  const arrowGeometry = await page.locator('.partjourney--b .typewaypoint').evaluateAll((items) => {
    const boxes = items.map((item) => item.getBoundingClientRect())
    const transitions = Array.from(
      document.querySelectorAll<HTMLElement>('.partjourney--b .typepath__transition'),
      (item) => item.getBoundingClientRect(),
    )
    const center = (box: DOMRect) => ({ x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 })

    return {
      firstRowBoundaryDeltas: [0, 1, 2].map((index) => {
        const arrow = transitions[index]
        return Math.abs(center(arrow).x - boxes[index].right)
      }),
      firstRowVerticalSpread: Math.max(...[0, 1, 2].map((index) => center(transitions[index]).y))
        - Math.min(...[0, 1, 2].map((index) => center(transitions[index]).y)),
      boundaryArrowWidths: [0, 1, 2, 4, 5].map((index) => transitions[index]?.width ?? 0),
      foldArrow: transitions[3]
        ? {
            y: center(transitions[3]).y,
            rowGapCenter: (boxes[3].bottom + boxes[4].top) / 2,
            transform: getComputedStyle(document.querySelector<HTMLElement>('.typepath__transition--4')!).transform,
          }
        : undefined,
      secondRowBoundaryDeltas: [4, 5].map((index) => {
        const arrow = transitions[index]
        return Math.abs(center(arrow).x - boxes[index].left)
      }),
      secondRowVerticalSpread: Math.abs(center(transitions[4]).y - center(transitions[5]).y),
      nodeArrowDisplays: items.map((item) => getComputedStyle(item.querySelector<HTMLElement>('.typewaypoint__arrow')!).display),
    }
  })
  expect(Math.max(...arrowGeometry.firstRowBoundaryDeltas)).toBeLessThanOrEqual(1)
  expect(arrowGeometry.firstRowVerticalSpread).toBeLessThanOrEqual(1)
  expect(Math.max(...arrowGeometry.secondRowBoundaryDeltas)).toBeLessThanOrEqual(1)
  expect(arrowGeometry.secondRowVerticalSpread).toBeLessThanOrEqual(1)
  expect(Math.min(...arrowGeometry.boundaryArrowWidths)).toBeGreaterThanOrEqual(19)
  expect(Math.abs(arrowGeometry.foldArrow!.y - arrowGeometry.foldArrow!.rowGapCenter)).toBeLessThanOrEqual(2)
  expect(arrowGeometry.foldArrow!.transform).not.toBe('none')
  expect(arrowGeometry.nodeArrowDisplays).toEqual(Array(7).fill('none'))
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
  ).toBe(true)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('.partcover__family-art')).toBeVisible()
  await expect(page.locator('.partjourney--b .partjourney__art')).toBeHidden()
  await expect(page.locator('.partjourney--b .typepath__transitions')).toBeHidden()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
  ).toBe(true)
  expect(runtimeErrors).toEqual([])
})

test('all seven B lessons use distinct accessible semantic plates', async ({ page }) => {
  const runtimeErrors: string[] = []
  const atlasCells = new Set<string>()
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  for (const slug of ['path', 'maxseg', 'lis', 'lcs', 'edit', 'fsm', 'count'] as const) {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`/part/b/${slug}`)

    const plate = page.locator(`.linear-plate--${slug}[data-lesson-plate="${slug}"]`)
    await expect(plate).toBeVisible()
    await expect(plate).toHaveAttribute('data-family-art', 'b')
    await expect(plate).toHaveAttribute('data-family-mode', 'lesson')
    await expect(plate).toHaveAttribute('role', 'img')
    await expect(plate).toHaveAttribute('aria-label', /：.+/)
    const atlas = plate.locator('.poly-lesson-plate__atlas')
    await expect(atlas).toHaveJSProperty('complete', true)
    const atlasAsset = await atlas.evaluate((image: HTMLImageElement) => ({
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      src: image.currentSrc,
    }))
    expect(atlasAsset.naturalWidth).toBe(1536)
    expect(atlasAsset.naturalHeight).toBe(1024)
    expect(atlasAsset.src).toContain('linear-lessons')
    const routeResources = await page.evaluate(() =>
      performance.getEntriesByType('resource').map((entry) => entry.name),
    )
    expect(routeResources.some((resource) => resource.includes('knapsack-lessons'))).toBe(false)
    atlasCells.add(
      `${await plate.getAttribute('data-atlas-column')}:${await plate.getAttribute('data-atlas-row')}`,
    )
    await expect(page.locator('.typehead__art-code')).toHaveCount(0)
    expect(await plate.locator('.poly-lesson-plate__viewport').evaluate((viewport) => {
      const style = getComputedStyle(viewport)
      return style.overflow === 'hidden'
        && viewport.scrollWidth >= viewport.clientWidth
        && viewport.scrollHeight >= viewport.clientHeight
    })).toBe(true)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    ).toBe(true)
    expect(runtimeErrors, `${slug} should hydrate without errors`).toEqual([])
  }
  expect(atlasCells.size).toBe(7)

  await page.setViewportSize({ width: 390, height: 844 })
  for (const slug of ['path', 'maxseg', 'lis', 'lcs', 'edit', 'fsm', 'count'] as const) {
    await page.goto(`/part/b/${slug}`)
    await expect(page.locator(`.linear-plate--${slug}`)).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    ).toBe(true)
  }

  await page.goto('/part/b/edit')
  await expect(page.locator('.linear-plate--edit')).toHaveAttribute('data-atlas-column', '0')
  await expect(page.locator('.linear-plate--edit')).toHaveAttribute('data-atlas-row', '1')
  await expect(page.getByText('当前前缀对', { exact: true })).toHaveCount(0)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
  ).toBe(true)
})

test('LIS workbench advances a real DP state without runtime errors', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.goto('/part/b/lis')
  const player = page.getByRole('group', { name: 'DP 表格逐帧播放' })
  await expect(player.getByText('1/56', { exact: true })).toBeVisible()
  await player.getByRole('button', { name: '下一步', exact: true }).click()
  await expect(player.getByText('2/56', { exact: true })).toBeVisible()
  await expect(player.getByText('1/56', { exact: true })).toHaveCount(0)
  expect(runtimeErrors).toEqual([])
})
