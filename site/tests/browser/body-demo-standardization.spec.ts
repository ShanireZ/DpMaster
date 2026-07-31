import { expect, test } from '@playwright/test'

const REPRESENTATIVE_ROUTES = [
  '/part/a/01',
  '/part/a/dep',
  '/part/b/lcs',
  '/part/b/fsm',
  '/part/c/stone',
  '/part/c/ring',
  '/part/d/grid',
  '/part/d/matpow',
  '/part/e/basic',
  '/part/e/distsum',
  '/part/f/knapsack',
  '/part/f/cover',
  '/part/g/board',
  '/part/g/plug',
] as const

test('fourteen representative lessons use the approved instrument shell without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })

  for (const route of REPRESENTATIVE_ROUTES) {
    await page.goto(route)
    await expect(page.locator('.typepage')).toHaveAttribute('data-demo-standard', 'representative')
    await expect(page.locator('.typepage')).toHaveAttribute('data-demo-intensity', 'enhanced')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
      `${route} should not overflow horizontally`,
    ).toBe(true)

    const instruments = page.locator('.demo, .demo-workbench')
    expect(await instruments.count(), `${route} should expose at least one algorithm instrument`).toBeGreaterThan(0)
  }
})

test('shared DP tables use local scrolling and the unified instrument rail', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/part/b/lcs')

  const viewport = page.locator('.demo-table-viewport').first()
  const scroller = viewport.locator('.demo-table-viewport__scroller')
  await expect(viewport).toBeVisible()
  await expect(scroller).toHaveAttribute('role', 'region')
  await expect(scroller).toHaveAttribute('tabindex', '0')
  expect(await scroller.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true)
  await expect(page.locator('.instrument-rail')).toHaveCount(2)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
  ).toBe(true)
})

test('plug DP is a formal operable Demo with mobile detail switching and 44px controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/part/g/plug')

  const workbench = page.locator('.plug-contour-demo')
  await expect(workbench).toBeVisible()
  await expect(workbench.locator('.plug-stage > svg')).toBeHidden()
  await expect(workbench.locator('.plug-stage__mobile')).toBeVisible()
  await expect(workbench.locator('.plug-stage__mobile li')).toHaveCount(5)
  await expect(workbench.getByText('1 / 6', { exact: true })).toBeVisible()
  await workbench.getByRole('button', { name: '下一步' }).click()
  await expect(workbench.getByText('2 / 6', { exact: true })).toBeVisible()

  await workbench.getByRole('tab', { name: '表格' }).click()
  const tableScroller = workbench.getByRole('region', { name: '插头 DP 轮廓状态转移表' })
  await expect(tableScroller).toBeVisible()
  expect(await tableScroller.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true)

  const controlSizes = await workbench.locator('button, [role="tab"]').evaluateAll((controls) =>
    controls
      .filter((control) => getComputedStyle(control).display !== 'none')
      .map((control) => {
        const box = control.getBoundingClientRect()
        return Math.min(box.width, box.height)
      }),
  )
  expect(Math.min(...controlSizes)).toBeGreaterThanOrEqual(44)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
  ).toBe(true)
})

test('plug DP preserves geometry between themes and resolves completion under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/part/g/plug')

  const workbench = page.locator('.plug-contour-demo')
  const before = await workbench.boundingBox()
  await page.getByRole('button', { name: '切换深浅色' }).click()
  const after = await workbench.boundingBox()
  expect(after).toEqual(before)

  const next = workbench.getByRole('button', { name: '下一步' })
  for (let index = 0; index < 5; index += 1) await next.click()
  await expect(workbench).toHaveAttribute('data-complete', 'true')
  await expect(workbench.getByText('6 / 6', { exact: true })).toBeVisible()
  await expect(workbench.locator('.demo-workbench__completion')).toHaveCSS('animation-name', 'none')
})
