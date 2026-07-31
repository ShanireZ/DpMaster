import { expect, test } from '@playwright/test'

test('@cross-browser lesson shell keeps navigation, theme, scroll, and focus operable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/part/b/lcs')

  await expect(page).toHaveTitle(/最长公共子序列/)
  await expect(page.locator('h1')).toContainText('最长公共子序列')
  await expect(page.locator('#main-content')).toBeVisible()

  const root = page.locator('html')
  const initialTheme = await root.getAttribute('data-theme')
  const themeToggle = page.getByRole('button', { name: '切换深浅色' })
  await expect(themeToggle).toBeVisible()
  await themeToggle.click()
  await expect(root).not.toHaveAttribute('data-theme', initialTheme ?? 'dark')

  const outlineLink = page.locator('.lesson-outline a:visible').first()
  await outlineLink.focus()
  await expect(outlineLink).toBeFocused()

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }))
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0)

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    )
    .toBeLessThanOrEqual(1)
})
