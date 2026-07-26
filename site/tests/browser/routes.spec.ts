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
    title: 'DP大师 · DP Master',
    description:
      'DP大师面向算法学习者，用精讲、逐帧可视化、题目索引和小游戏讲清状态定义、转移顺序与模型迁移。',
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
  await expect(outline.locator('.lesson-outline__status')).toHaveCount(0)
  await expect(outline.getByText('读到文末自动完成', { exact: true })).toHaveCount(0)

  await expect(page.getByRole('button', { name: /学完/ })).toHaveCount(0)
  await page.locator('.lesson-completion-marker').scrollIntoViewIfNeeded()
  await expect.poll(
    () => page.evaluate(() => localStorage.getItem('dp-master-progress:v1')),
  ).toContain('/part/a/01')
  await expect(page.locator('.nav-type.active .nav-type__progress svg')).toBeVisible()
  await expect(page.getByText('学习进度', { exact: true })).toHaveCount(0)

  const stored = await page.evaluate(() => localStorage.getItem('dp-master-progress:v1'))
  expect(stored).toContain('/part/a/01')
  await page.reload()
  await expect(page.getByRole('button', { name: /学完/ })).toHaveCount(0)
  await expect(page.locator('.nav-type.active .nav-type__progress svg')).toBeVisible()
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
  const brandMarkPosition = await page.locator('.brand__mark').boundingBox()
  const familyBadgePosition = await page.locator(
    '.nav-part.active .nav-part__badge',
  ).boundingBox()
  const parentTitle = await page.locator('.nav-part.active .nav-part__title').boundingBox()
  const childTitle = await page.locator('.nav-type.active .nav-type__label').boundingBox()
  expect(brandPosition).not.toBeNull()
  expect(brandMarkPosition).not.toBeNull()
  expect(familyBadgePosition).not.toBeNull()
  expect(parentTitle).not.toBeNull()
  expect(childTitle).not.toBeNull()
  expect(
    Math.abs(
      (brandMarkPosition?.x ?? 0) + (brandMarkPosition?.width ?? 0) / 2
      - (familyBadgePosition?.x ?? 0) - (familyBadgePosition?.width ?? 0) / 2,
    ),
  ).toBeLessThanOrEqual(1)
  expect(
    Math.abs((brandPosition?.x ?? 0) - (parentTitle?.x ?? 0)),
  ).toBeLessThanOrEqual(1)
  expect(Math.abs((parentTitle?.x ?? 0) - (childTitle?.x ?? 0))).toBeLessThanOrEqual(1)

  const expandedWidth = (await sidebar.boundingBox())?.width ?? 0
  const familyYBefore = await page.locator('.nav-part__code').evaluateAll((codes) =>
    codes.map((code) => code.getBoundingClientRect().y),
  )
  const collapseTransition = await page.evaluate(async () => {
    const button = document.querySelector<HTMLButtonElement>('.sidebar-collapse')
    const main = document.querySelector<HTMLElement>('.main')
    const wordmark = document.querySelector<HTMLElement>('.brand__wordmark')
    const title = document.querySelector<HTMLElement>('.nav-part__title')
    if (!button || !main || !wordmark || !title) return null
    button.click()
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    return {
      mainTransform: getComputedStyle(main).transform,
      wordmarkDisplay: getComputedStyle(wordmark).display,
      titleDisplay: getComputedStyle(title).display,
    }
  })
  expect(collapseTransition).toEqual({
    mainTransform: 'none',
    wordmarkDisplay: 'block',
    titleDisplay: 'block',
  })
  await expect(page.locator('.shell')).toHaveClass(/shell--sidebar-collapsed/)
  await expect(page.getByRole('button', { name: '展开侧栏' })).toBeVisible()
  await expect(page.locator('.brand__mark img')).toHaveAttribute('src', '/favicon.svg')
  await expect(page.locator('.brand__mark')).toBeVisible()
  const compactLessons = page.locator('.nav-types .nav-type__compact')
  await expect(compactLessons).toHaveCount(9)
  await expect(page.locator('.nav-type.active .nav-type__compact')).toHaveText('01')
  await expect(page.locator('.nav-type.active .nav-type__compact')).toBeVisible()
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

  await page.locator('.nav-types a[href="/part/a/complete"]').click()
  await expect(page).toHaveURL(/\/part\/a\/complete$/)
  await expect(page.locator('.nav-type.active .nav-type__compact')).toHaveText('02')

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
      imageWidth: image.getBoundingClientRect().width,
      heroWidth: hero.getBoundingClientRect().width,
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
      (firstFrameContract?.imageWidth ?? 0)
      - (firstFrameContract?.heroWidth ?? 0),
    ),
  ).toBeLessThanOrEqual(1)
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

test('home state atlas drag stays aligned and settles without catch-up motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const home = page.locator('.home')
  const atlas = page.locator('.state-atlas')
  const track = page.locator('.state-atlas__track')
  await expect(home).toHaveClass(/home--gsap/)
  await expect(atlas).toHaveClass(/state-atlas--draggable/)
  await expect(page.getByText('滚动或左右拖动浏览')).toBeVisible()

  const range = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>('.home-hero')
    const atlasElement = document.querySelector<HTMLElement>('.state-atlas')
    const trackElement = document.querySelector<HTMLElement>('.state-atlas__track')
    const routeStage = document.querySelector<HTMLElement>('.route-stage')
    if (!hero || !atlasElement || !trackElement || !routeStage) return null
    return {
      start: hero.offsetHeight,
      distance: trackElement.scrollWidth - atlasElement.clientWidth,
      routeFilter: getComputedStyle(routeStage).filter,
    }
  })

  expect(range).not.toBeNull()
  expect(range?.routeFilter).toBe('none')
  expect(range?.distance ?? 0).toBeGreaterThan(0)

  const middle = (range?.start ?? 0) + (range?.distance ?? 0) * 0.42
  await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), middle)
  await expect.poll(() => atlas.evaluate((element) =>
    Math.abs(element.getBoundingClientRect().top),
  )).toBeLessThanOrEqual(1)
  await page.evaluate(() => {
    document.documentElement.dataset.atlasNativeDragStarts = '0'
    document.addEventListener('dragstart', () => {
      const count = Number(document.documentElement.dataset.atlasNativeDragStarts ?? 0)
      document.documentElement.dataset.atlasNativeDragStarts = String(count + 1)
    }, { capture: true, once: true })
  })

  const beforeDrag = await page.evaluate(() => ({
    scrollY: window.scrollY,
    transform: getComputedStyle(
      document.querySelector<HTMLElement>('.state-atlas__track')!,
    ).transform,
  }))
  const box = await atlas.boundingBox()
  expect(box).not.toBeNull()
  const y = (box?.y ?? 0) + (box?.height ?? 0) * 0.55
  const startX = (box?.x ?? 0) + (box?.width ?? 0) * 0.72
  const leftX = (box?.x ?? 0) + (box?.width ?? 0) * 0.38
  const releaseX = (box?.x ?? 0) + (box?.width ?? 0) * 0.51
  await page.mouse.move(startX, y)
  await page.mouse.down()
  await page.mouse.move(leftX, y, { steps: 12 })
  await page.mouse.move(releaseX, y, { steps: 6 })
  await page.mouse.up()

  const released = await page.evaluate(() => {
    const matrixX = (element: Element) => {
      const transform = getComputedStyle(element).transform
      if (transform === 'none') return 0
      return new DOMMatrixReadOnly(transform).m41
    }
    const atlasElement = document.querySelector<HTMLElement>('.state-atlas')!
    const trackElement = document.querySelector<HTMLElement>('.state-atlas__track')!
    return {
      scrollY: window.scrollY,
      trackX: matrixX(trackElement),
      atlasTop: atlasElement.getBoundingClientRect().top,
      dragging: atlasElement.classList.contains('state-atlas--dragging'),
    }
  })
  await page.waitForTimeout(450)
  const settled = await page.evaluate(() => {
    const matrixX = (element: Element) => {
      const transform = getComputedStyle(element).transform
      if (transform === 'none') return 0
      return new DOMMatrixReadOnly(transform).m41
    }
    const atlasElement = document.querySelector<HTMLElement>('.state-atlas')!
    const trackElement = document.querySelector<HTMLElement>('.state-atlas__track')!
    return {
      scrollY: window.scrollY,
      trackX: matrixX(trackElement),
      atlasTop: atlasElement.getBoundingClientRect().top,
      dragging: atlasElement.classList.contains('state-atlas--dragging'),
      nativeDragStarts: Number(
        document.documentElement.dataset.atlasNativeDragStarts ?? 0,
      ),
      animatedSceneChildren: document.querySelectorAll(
        '.family-scene__glyph[style*="transform"], .family-scene__copy[style*="transform"]',
      ).length,
    }
  })

  await expect.poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(beforeDrag.scrollY + 200)
  expect(Math.abs(released.scrollY - settled.scrollY)).toBeLessThanOrEqual(1)
  expect(Math.abs(released.trackX - settled.trackX)).toBeLessThanOrEqual(1)
  expect(
    Math.abs(settled.trackX + settled.scrollY - (range?.start ?? 0)),
  ).toBeLessThanOrEqual(1)
  expect(Math.abs(released.atlasTop)).toBeLessThanOrEqual(1)
  expect(Math.abs(settled.atlasTop)).toBeLessThanOrEqual(1)
  expect(released.dragging).toBe(false)
  expect(settled.dragging).toBe(false)
  expect(settled.nativeDragStarts).toBe(0)
  expect(settled.animatedSceneChildren).toBe(0)
  await expect(track).not.toHaveCSS('transform', beforeDrag.transform)
  await expect(page).toHaveURL('/')
})

test('first client-side route change keeps the application shell mounted', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => {
    const monitor = new MutationObserver(() => {
      if (!document.querySelector('.shell')) {
        document.documentElement.dataset.shellWasMissing = 'true'
      }
      if (document.querySelectorAll('.route-stage').length > 1) {
        document.documentElement.dataset.routeContentOverlapped = 'true'
      }
    })
    monitor.observe(document.body, { childList: true, subtree: true })
  })

  await page.getByRole('link', { name: /从背包 DP 开始/ }).click()
  await expect(page).toHaveURL(/\/part\/a$/)
  await expect(page.locator('.partcover')).toBeVisible()
  expect(await page.locator('html').getAttribute('data-shell-was-missing')).toBeNull()
  expect(await page.locator('html').getAttribute('data-route-content-overlapped')).toBeNull()
})
