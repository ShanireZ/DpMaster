import { expect, test } from '@playwright/test'

test('B category renders the approved index-rail family sculpture and journey map', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/part/b')

  await expect(page.locator('[data-family-art="b"][data-family-mode="hero"]')).toBeVisible()
  await expect(page.locator('.linear-hero__nodes circle')).toHaveCount(7)
  await expect(page.locator('[data-family-art="b"][data-family-mode="journey"]')).toBeVisible()
  await expect(page.locator('.linear-journey__node circle')).toHaveCount(7)
  await expect(page.locator('.partjourney--b .typewaypoint')).toHaveCount(7)
  await expect(page.locator('.partcover--b .partcover__glyph')).toHaveCount(0)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
  ).toBe(true)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('.partcover__family-art')).toBeVisible()
  await expect(page.locator('.partjourney--b .partjourney__art')).toBeHidden()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
  ).toBe(true)
  expect(runtimeErrors).toEqual([])
})

test('LIS and edit-distance use distinct accessible B pilot plates', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  for (const slug of ['edit', 'lis'] as const) {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`/part/b/${slug}`)

    const plate = page.locator(`.linear-plate--${slug}[data-lesson-plate="${slug}"]`)
    await expect(plate).toBeVisible()
    await expect(plate).toHaveAttribute('data-family-art', 'b')
    await expect(plate).toHaveAttribute('data-family-mode', 'lesson')
    await expect(plate.locator('title')).toHaveCount(1)
    await expect(plate.locator('desc')).toHaveCount(1)
    await expect(page.locator('.typehead__art-code')).toHaveCount(0)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    ).toBe(true)
    expect(runtimeErrors, `${slug} should hydrate without errors`).toEqual([])
  }

  await page.goto('/part/b/path')
  await expect(page.locator('[data-family-art="b"][data-family-mode="fallback"][data-lesson-plate="path"]')).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/part/b/edit')
  await expect(page.locator('.linear-plate--edit')).toBeVisible()
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
