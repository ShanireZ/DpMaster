import { expect, test, type Locator, type Page } from '@playwright/test'

const browserErrors = new WeakMap<Page, string[]>()

test.beforeEach(({ page }) => {
  const errors: string[] = []
  browserErrors.set(page, errors)
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`))
})

test.afterEach(({ page }) => {
  expect(browserErrors.get(page)).toEqual([])
})

async function loadDeferredGame(page: Page, label: string): Promise<Locator> {
  const game = page.getByLabel(label)
  await expect(game).toContainText('互动游戏将在接近时自动加载')
  await expect(game.getByRole('button')).toHaveCount(0)
  await game.scrollIntoViewIfNeeded()
  await expect(game).not.toContainText('互动游戏将在接近时自动加载')
  return game
}

async function readSeed(game: Locator): Promise<number> {
  const status = await game.getByText(/已玩 \d+ 局.*种子 \d+/).textContent()
  const match = status?.match(/种子 (\d+)/)
  if (!match) throw new Error(`Missing numeric game seed in: ${status}`)
  return Number(match[1])
}

async function readPackItems(game: Locator): Promise<string[]> {
  return game.getByRole('button', { name: /价值/ }).evaluateAll((buttons) =>
    buttons.map((button) => button.textContent?.replace(/\s+/g, ' ').trim() ?? ''),
  )
}

test('Pack rounds lazy-load automatically and replay from the displayed seed', async ({ page }) => {
  const packRequests: string[] = []
  page.on('request', (request) => {
    if (/\/PackMasterGame-[^/]+\.js$/.test(request.url())) packRequests.push(request.url())
  })

  await page.goto('/part/a')
  const game = page.getByLabel('装包大师互动游戏')
  await expect(game).toContainText('互动游戏将在接近时自动加载')
  expect(packRequests).toEqual([])

  await loadDeferredGame(page, '装包大师互动游戏')
  await expect(game.getByText('装包大师', { exact: true })).toBeVisible()
  await expect.poll(() => packRequests.length).toBe(1)

  const originalSeed = await readSeed(game)
  const originalItems = await readPackItems(game)
  await expect(game.getByRole('button', { name: /价值/ })).toHaveCount(5)

  const firstItem = game.getByRole('button', { name: /价值/ }).first()
  await firstItem.click()
  await expect(firstItem).toHaveClass(/\bin\b/)
  await game.getByRole('button', { name: '看 DP 最优' }).click()
  await expect(game.locator('.game__compare')).toBeVisible()
  await expect(game.locator('.game__stats')).toContainText('已玩 1 局')

  await game.getByRole('button', { name: '重放此种子' }).click()
  expect(await readSeed(game)).toBe(originalSeed)
  expect(await readPackItems(game)).toEqual(originalItems)
  await expect(game.getByRole('button', { name: /价值/ }).first()).not.toHaveClass(/\bin\b/)
  await expect(game.locator('.game__value b')).toHaveText('0')
  await expect(game.locator('.game__compare')).toHaveCount(0)

  await game.getByRole('button', { name: '换一批' }).click()
  await expect.poll(() => readSeed(game)).not.toBe(originalSeed)
  await expect
    .poll(async () => JSON.stringify(await readPackItems(game)))
    .not.toBe(JSON.stringify(originalItems))

  const shuffledSeed = await readSeed(game)
  await game.getByRole('button', { name: '困难' }).click()
  await expect(game.getByRole('button', { name: '困难' })).toHaveAttribute('aria-pressed', 'true')
  await expect(game.getByRole('button', { name: /价值/ })).toHaveCount(6)
  expect(await readSeed(game)).toBe(shuffledSeed)

  await game.getByRole('button', { name: '看 DP 最优' }).click()
  await expect(game.locator('.game__stats')).toContainText('已玩 2 局')
})

test('BitBoard records one success per round and clear rearms the shared guard', async ({ page }) => {
  await page.goto('/part/g')
  const game = await loadDeferredGame(page, '棋盘布阵互动游戏')
  await expect(game.getByText('棋盘布阵', { exact: true })).toBeVisible()
  await expect(game.getByRole('button', { name: '简单' })).toHaveAttribute('aria-pressed', 'true')

  const cells = game.locator('.gbb__board svg > g')
  await expect(cells).toHaveCount(16)
  const legalLayout = [0, 2, 8, 10]
  for (const index of legalLayout) await cells.nth(index).click()
  await expect(game.locator('.gbb__stats')).toHaveText('已玩 1 局 · 已完成布局 1 次')

  await cells.nth(10).click()
  await cells.nth(10).click()
  await expect(game.locator('.gbb__stats')).toHaveText('已玩 1 局 · 已完成布局 1 次')

  await game.getByRole('button', { name: '清空' }).click()
  for (const index of legalLayout) await cells.nth(index).click()
  await expect(game.locator('.gbb__stats')).toHaveText('已玩 2 局 · 已完成布局 2 次')
})
