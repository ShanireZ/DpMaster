import { expect, test, type Page, type Response } from '@playwright/test'

const origin = 'https://dp.betaoi.cc'

interface RouteExpectation {
  path: string
  title: string
  description: string
  ogType: 'website' | 'article'
  currentLabel: string
}

const routes: RouteExpectation[] = [
  {
    path: '/',
    title: 'DP大师 · 动态规划交互式教程',
    description:
      'DP大师是一套面向算法学习者的动态规划交互式教程，通过精讲、逐帧可视化、题目索引和小游戏掌握 DP。',
    ogType: 'website',
    currentLabel: '首页',
  },
  {
    path: '/part/a',
    title: '背包 DP · DP大师',
    description:
      '背包 DP：容量受限下的取舍：物品件数属性决定了背包的谱系。通过 9 门系统课程、逐帧演示和互动游戏建立完整知识谱系。',
    ogType: 'website',
    currentLabel: '背包 DP',
  },
  {
    path: '/part/a/01',
    title: '01 背包 · 背包 DP · DP大师',
    description:
      '01 背包是DP大师「背包 DP」家族课程：取或不取·一维逆推·恰好装满。通过状态定义、转移推导、可编辑演示和配套题目掌握这一类 DP。',
    ogType: 'article',
    currentLabel: '01 背包',
  },
  {
    path: '/method',
    title: '通用方法论 · DP大师',
    description:
      '用状态设计、转移方程、计算顺序、空间优化和调试清单，建立可复用的动态规划解题方法。',
    ogType: 'website',
    currentLabel: '通用方法论',
  },
  {
    path: '/part/g/plug',
    title: '插头 DP（选修） · 状压 DP · DP大师',
    description:
      '插头 DP（选修）是DP大师「状压 DP」家族课程：轮廓线连通性。通过状态定义、转移推导、可编辑演示和配套题目掌握这一类 DP。',
    ogType: 'article',
    currentLabel: '插头 DP（选修）',
  },
]

function captureBrowserErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`))
  return errors
}

function routeByPath(path: string): RouteExpectation {
  const route = routes.find((candidate) => candidate.path === path)
  if (!route) throw new Error(`Missing browser route expectation for ${path}`)
  return route
}

async function assertRoute(
  page: Page,
  route: RouteExpectation,
  browserErrors: string[],
  response?: Response | null,
): Promise<void> {
  if (response !== undefined) {
    expect(response).not.toBeNull()
    expect(response?.status()).toBe(200)
  }
  await expect(page).toHaveTitle(route.title)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    route.description,
  )
  await expect(page.locator('meta[name="abstract"]')).toHaveAttribute(
    'content',
    route.description,
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `${origin}${route.path}`,
  )
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(3)
  await expect(page.locator('link[hreflang="zh-Hans"]')).toHaveAttribute(
    'href',
    `${origin}${route.path}`,
  )
  await expect(page.locator('link[hreflang="zh-CN"]')).toHaveAttribute(
    'href',
    `https://dp.betaoi.cn${route.path}`,
  )
  await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
    'href',
    `${origin}${route.path}`,
  )
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    'content',
    route.ogType,
  )
  const structuredData = JSON.parse(
    (await page.locator('#dp-structured-data').textContent()) ?? '{}',
  ) as { '@graph'?: Array<{ '@type'?: string }> }
  const structuredTypes = structuredData['@graph']?.map((entry) => entry['@type']) ?? []
  expect(structuredTypes).toContain('Organization')
  expect(structuredTypes).toContain('WebSite')
  expect(structuredTypes).toContain(
    route.ogType === 'article'
      ? 'Course'
      : route.path.startsWith('/part/')
        ? 'CollectionPage'
        : 'WebPage',
  )
  if (route.path !== '/') expect(structuredTypes).toContain('BreadcrumbList')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('.route-announcer')).toHaveText(`已进入 ${route.title}`)
  await expect(
    page.locator(`nav[aria-label="主导航"] a[href="${route.path}"]`),
  ).toHaveAttribute('aria-current', 'page')
  await expect(
    page.locator('nav[aria-label="面包屑"] [aria-current="page"]'),
  ).toHaveText(route.currentLabel)
  expect(browserErrors).toEqual([])
}

for (const route of routes.filter(({ path }) => path !== '/part/g/plug')) {
  test(`${route.path} exposes production route metadata and current-page state`, async ({ page }) => {
    const browserErrors = captureBrowserErrors(page)
    const response = await page.goto(route.path)

    await assertRoute(page, route, browserErrors, response)
  })
}

test('/part/g/plug works as an explicit direct production-preview deep link', async ({ page }) => {
  const browserErrors = captureBrowserErrors(page)
  const route = routeByPath('/part/g/plug')
  const response = await page.goto(route.path)

  await assertRoute(page, route, browserErrors, response)
})

test('direct lesson response contains prerendered HTML before JavaScript hydration', async ({
  request,
}) => {
  const response = await request.get('/part/a/01')
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toContain('<div id="root">')
  expect(html).not.toContain('<div id="root"></div>')
  expect(html).toContain('<h1')
  expect(html).toContain('01 背包')
  expect(html).toContain('<link rel="canonical" href="https://dp.betaoi.cc/part/a/01"')
  expect(html).toContain('"@type":"Course"')
})

test('unknown routes return the themed document with HTTP 404 and noindex', async ({ page }) => {
  const browserErrors = captureBrowserErrors(page)
  const response = await page.goto('/this-route-does-not-exist')

  expect(response).not.toBeNull()
  expect(response?.status()).toBe(404)
  await expect(page).toHaveTitle('页面未找到 · DP大师')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex,nofollow',
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('状态不可达 · 页面越界')
  expect(browserErrors).toEqual([
    'console: Failed to load resource: the server responded with a status of 404 (Not Found)',
  ])
})

test('client navigation refreshes the complete route contract', async ({ page }) => {
  const browserErrors = captureBrowserErrors(page)
  const home = routeByPath('/')
  const response = await page.goto(home.path)
  await assertRoute(page, home, browserErrors, response)

  const familyLink = page.locator('nav[aria-label="主导航"] a[href="/part/a"]')
  await familyLink.click()
  await expect(page).toHaveURL('/part/a')
  await assertRoute(page, routeByPath('/part/a'), browserErrors)
})

test('keyboard route navigation and skip-link activation focus main without stealing initial focus', async ({
  page,
}) => {
  const browserErrors = captureBrowserErrors(page)
  await page.goto('/')
  const main = page.locator('#main-content')
  await expect(main).toBeVisible()
  await expect(main).not.toBeFocused()

  const familyLink = page.locator('nav[aria-label="主导航"] a[href="/part/a"]')
  await familyLink.focus()
  await expect(familyLink).toBeFocused()
  await page.keyboard.press('Enter')

  await expect(page).toHaveURL('/part/a')
  await expect(main).toBeFocused()

  await page.goto('/')
  await expect(main).toBeVisible()
  await expect(main).not.toBeFocused()
  await page.keyboard.press('Tab')
  const skipLink = page.getByRole('link', { name: '跳到主要内容' })
  await expect(skipLink).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(main).toBeFocused()
  expect(browserErrors).toEqual([])
})
