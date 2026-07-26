import { expect, test } from '@playwright/test'

test('lesson atlas stays interactive, console-clean, and contained on desktop and mobile', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.goto('/part/a/01')

  await expect(page.locator('.typehead h1')).toHaveText('01 背包')
  await expect(page.locator('.typehead__glyph')).toBeVisible()
  await expect(page.locator('.lesson-outline--desktop')).toBeVisible()
  await expect(page.locator('.lesson-outline--desktop a[aria-current="location"]')).toHaveCount(1)

  const firstDemo = page.locator('.demo').first()
  await firstDemo.locator('.playback__primary').click()
  await expect(firstDemo.locator('.dp-cell.is-current')).toHaveCount(1)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('.lesson-outline--mobile')).toBeVisible()
  await expect(page.locator('.lesson-outline--desktop')).toBeHidden()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
  ).toBe(true)

  expect(runtimeErrors).toEqual([])
})
