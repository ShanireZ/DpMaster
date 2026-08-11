import { expect, test, type Page } from '@playwright/test'

const representativeLessons = [
  '/part/a/01',
  '/part/b/path',
  '/part/c/stone',
  '/part/d/grid',
  '/part/e/basic',
  '/part/f/select',
  '/part/g/board',
]

async function expectTargetAligned(page: Page, selector: string): Promise<void> {
  await expect.poll(async () => {
    const [targetTop, topbarBottom] = await Promise.all([
      page.locator(selector).evaluate((target) => target.getBoundingClientRect().top),
      page.locator('.topbar').evaluate((topbar) => topbar.getBoundingClientRect().bottom),
    ])
    return Math.abs(targetTop - topbarBottom - 24)
  }, { timeout: 4_000 }).toBeLessThanOrEqual(2)
}

test('lesson outline links align consistently across all seven families', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })

  for (const route of representativeLessons) {
    await page.goto(route)
    const links = page.locator('.lesson-outline--desktop a')
    await expect.poll(() => links.count()).toBeGreaterThan(3)

    const link = links.nth(3)
    const href = await link.getAttribute('href')
    expect(href).toMatch(/^#section-/)
    await link.click()

    await expectTargetAligned(page, href ?? '')
    await expect(link).toHaveAttribute('aria-current', 'location')
  }
})

test('lesson outline deep links restore their offset on direct navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/part/a/01')

  const links = page.locator('.lesson-outline--desktop a')
  await expect.poll(() => links.count()).toBeGreaterThan(3)
  const href = await links.nth(3).getAttribute('href')
  expect(href).toMatch(/^#section-/)

  await page.goto('/method')
  await page.goto(`/part/a/01${href}`)
  await expect(page.locator(href ?? '')).toBeVisible()
  await expectTargetAligned(page, href ?? '')
  await expect(
    page.locator(`.lesson-outline--desktop a[href="${href}"]`),
  ).toHaveAttribute('aria-current', 'location')
})

test('mobile outline and ordinary page fragments use the same sticky-header offset', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/part/a/01')

  const outline = page.locator('.lesson-outline--mobile')
  await outline.locator('summary').click()
  const links = outline.getByRole('link')
  await expect.poll(() => links.count()).toBeGreaterThan(3)
  const href = await links.nth(3).getAttribute('href')
  await links.nth(3).click()
  await expectTargetAligned(page, href ?? '')

  await page.goto('/method')
  await page.goto('/part/a#partlab-title')
  await expectTargetAligned(page, '#partlab-title')
})

test('cross-page navigation resets scroll immediately instead of animating from the old page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/part/a/01')
  await page.locator('.type-nav').scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1_000)

  await page.locator('.type-nav a').last().click()
  await expect(page).toHaveURL('/part/a/complete')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1)
})
