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
  await expect(page.locator('.partcover__backpack .poly-backpack__face')).toHaveCount(27)
  await expect(page.locator('.partjourney__polygon')).toBeVisible()
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
    await expect(page.locator(`.typepage[data-lesson-slug="${slug}"]`)).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    ).toBe(true)
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/part/a/cost2d')
  await expect(page.locator('.knapsack-plate[data-lesson-plate="cost2d"]')).toBeVisible()
  await expect(page.locator('.lesson-outline--mobile')).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
  ).toBe(true)
  expect(runtimeErrors).toEqual([])
})
