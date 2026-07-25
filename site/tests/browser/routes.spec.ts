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
  const abstract = await page.locator('meta[name="abstract"]').getAttribute('content')
  expect(abstract?.length).toBeGreaterThanOrEqual(30)
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
  ) as { '@graph'?: Array<{ '@type'?: string | string[] }> }
  const structuredTypes = structuredData['@graph']
    ?.flatMap((entry) => Array.isArray(entry['@type']) ? entry['@type'] : [entry['@type']])
    .filter(Boolean) ?? []
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
  if (route.path === '/') {
    await expect(page.locator('nav[aria-label="面包屑"]')).toHaveCount(0)
  } else {
    await expect(
      page.locator('nav[aria-label="面包屑"] [aria-current="page"]'),
    ).toHaveText(route.currentLabel)
  }
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
  expect(html).toContain('"@type":["Course","LearningResource","TechArticle"]')
  expect(html).toContain('data-dp-route-css')
  expect(html).not.toContain('<!--$?-->')
  expect(html).not.toContain('id="S:')
  expect(html).not.toContain('$RB=function')
})

test('first paint keeps the prerendered route styled and avoids visible hydration shift', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('dp-master-theme', 'light')
    ;(window as typeof window & { __dpCls?: number }).__dpCls = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & {
        value: number
        hadRecentInput: boolean
      }>) {
        if (!entry.hadRecentInput) {
          const target = window as typeof window & { __dpCls?: number }
          target.__dpCls = (target.__dpCls || 0) + entry.value
        }
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })

  await page.goto('/part/a/01')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('html')).toHaveAttribute('data-part', 'a')
  await expect(page.locator('link[data-dp-route-css]')).not.toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('01 背包')
  await page.waitForTimeout(800)

  const cls = await page.evaluate(
    () => (window as typeof window & { __dpCls?: number }).__dpCls || 0,
  )
  expect(cls).toBeLessThan(0.05)
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

test('problem pagination and filters survive reload through URL state', async ({ page }) => {
  await page.goto('/problems')
  const rows = page.locator('.prob')
  await expect(rows).toHaveCount(30)

  await page.getByRole('button', { name: '下一页' }).click()
  await expect(page).toHaveURL(/\/problems\?page=2$/)
  expect(await rows.count()).toBeLessThanOrEqual(30)

  const search = page.getByRole('textbox', { name: '搜索题目' })
  await search.fill('P1048')
  await expect(page).toHaveURL(/q=P1048/)
  await expect(page).not.toHaveURL(/page=/)
  await expect(rows.first()).toBeVisible()

  await page.reload()
  await expect(search).toHaveValue('P1048')
  expect(await rows.count()).toBeLessThanOrEqual(30)
})

test('lesson outline and versioned local progress remain available after reload', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/part/a/01')

  const outline = page.locator('aside[aria-label="本课目录"]')
  await expect(outline).toBeVisible()
  expect(await outline.getByRole('link').count()).toBeGreaterThan(3)

  const complete = page.getByRole('button', { name: '标为学完' })
  await complete.click()
  await expect(page.getByRole('button', { name: '已学完' })).toBeVisible()
  await expect(page.locator('.nav-type.active .nav-type__progress svg')).toBeVisible()
  await expect(page.getByText('学习进度', { exact: true })).toHaveCount(0)

  const stored = await page.evaluate(() => localStorage.getItem('dp-master-progress:v1'))
  expect(stored).toContain('/part/a/01')
  await page.reload()
  await expect(page.getByRole('button', { name: '已学完' })).toBeVisible()
})

test('desktop sidebar aligns nested lessons and remembers its compact rail state', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/part/a/01')

  const sidebar = page.locator('#site-sidebar')
  const brand = page.locator('.brand__wordmark')
  await expect(brand).toContainText('DP大师')
  await expect(brand).toContainText('DP Master')
  await expect(page.getByText('<DP Master>', { exact: true })).toHaveCount(0)

  const brandPosition = await brand.boundingBox()
  const familyCodePosition = await page.locator(
    '.nav-part.active .nav-part__code',
  ).boundingBox()
  const parentTitle = await page.locator('.nav-part.active .nav-part__title').boundingBox()
  const childTitle = await page.locator('.nav-type.active .nav-type__label').boundingBox()
  expect(brandPosition).not.toBeNull()
  expect(familyCodePosition).not.toBeNull()
  expect(parentTitle).not.toBeNull()
  expect(childTitle).not.toBeNull()
  expect(
    Math.abs((brandPosition?.x ?? 0) - (familyCodePosition?.x ?? 0)),
  ).toBeLessThanOrEqual(1)
  expect(Math.abs((parentTitle?.x ?? 0) - (childTitle?.x ?? 0))).toBeLessThanOrEqual(1)

  const expandedWidth = (await sidebar.boundingBox())?.width ?? 0
  const familyYBefore = await page.locator('.nav-part__code').evaluateAll((codes) =>
    codes.map((code) => code.getBoundingClientRect().y),
  )
  await page.getByRole('button', { name: '收起侧栏' }).click()
  await expect(page.locator('.shell')).toHaveClass(/shell--sidebar-collapsed/)
  await expect(page.getByRole('button', { name: '展开侧栏' })).toBeVisible()
  await expect(page.locator('.brand__compact')).toHaveText('DP')
  await expect(page.locator('.brand__compact')).toBeVisible()
  await expect
    .poll(async () => (await sidebar.boundingBox())?.width ?? expandedWidth)
    .toBeLessThan(expandedWidth)
  const familyYAfter = await page.locator('.nav-part__code').evaluateAll((codes) =>
    codes.map((code) => code.getBoundingClientRect().y),
  )
  expect(familyYAfter).toHaveLength(familyYBefore.length)
  familyYAfter.forEach((y, index) => {
    expect(Math.abs(y - familyYBefore[index])).toBeLessThanOrEqual(1)
  })
  await expect.poll(() => page.evaluate(
    () => localStorage.getItem('dp-master-sidebar-collapsed:v1'),
  )).toBe('true')

  await page.reload()
  await expect(page.locator('.shell')).toHaveClass(/shell--sidebar-collapsed/)
  await page.getByRole('button', { name: '展开侧栏' }).click()
  await expect(page.locator('.shell')).not.toHaveClass(/shell--sidebar-collapsed/)
})

test('home starts its entrance on the first styled frame and cancels trailing content padding', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  await expect(page.locator('.home-hero')).toBeVisible()
  await expect(page.locator('.home')).toHaveClass(/home--gsap/)
  const firstFrameContract = await page.evaluate(() => {
    const image = document.querySelector<HTMLElement>('.home-hero__image')
    const line = document.querySelector<HTMLElement>('[data-home-line]')
    const home = document.querySelector<HTMLElement>('.home')
    const content = document.querySelector<HTMLElement>('.content')
    const hero = document.querySelector<HTMLElement>('.home-hero')
    const atlas = document.querySelector<HTMLElement>('.state-atlas')
    const track = document.querySelector<HTMLElement>('.state-atlas__track')
    if (!image || !line || !home || !content || !hero || !atlas || !track) return null
    return {
      imageAnimation: getComputedStyle(image).animationName,
      lineAnimation: getComputedStyle(line).animationName,
      homeMarginBottom: Number.parseFloat(getComputedStyle(home).marginBottom),
      contentPaddingBottom: Number.parseFloat(getComputedStyle(content).paddingBottom),
      maximumScroll: document.documentElement.scrollHeight - window.innerHeight,
      atlasScrollEnd: hero.offsetHeight + track.scrollWidth - atlas.clientWidth,
    }
  })

  expect(firstFrameContract).not.toBeNull()
  expect(firstFrameContract?.imageAnimation).toBe('home-hero-image-intro')
  expect(firstFrameContract?.lineAnimation).toBe('home-hero-copy-intro')
  expect(
    Math.abs(
      (firstFrameContract?.homeMarginBottom ?? 0)
      + (firstFrameContract?.contentPaddingBottom ?? 0),
    ),
  ).toBeLessThanOrEqual(1)
  expect(
    Math.abs(
      (firstFrameContract?.maximumScroll ?? 0)
      - (firstFrameContract?.atlasScrollEnd ?? 0),
    ),
  ).toBeLessThanOrEqual(2)
})

test('first client-side route change keeps the application shell mounted', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => {
    const monitor = new MutationObserver(() => {
      if (!document.querySelector('.shell')) {
        document.documentElement.dataset.shellWasMissing = 'true'
      }
    })
    monitor.observe(document.body, { childList: true, subtree: true })
  })

  await page.getByRole('link', { name: /从背包 DP 开始/ }).click()
  await expect(page).toHaveURL(/\/part\/a$/)
  await expect(page.locator('.partcover')).toBeVisible()
  expect(await page.locator('html').getAttribute('data-shell-was-missing')).toBeNull()
})
