import { expect, test } from '@playwright/test'

const ALL_LESSON_ROUTES = [
  '/part/a/01',
  '/part/a/complete',
  '/part/a/multiple',
  '/part/a/group',
  '/part/a/mixed',
  '/part/a/cost2d',
  '/part/a/dep',
  '/part/a/variant',
  '/part/a/fractional',
  '/part/b/path',
  '/part/b/maxseg',
  '/part/b/lis',
  '/part/b/lcs',
  '/part/b/edit',
  '/part/b/fsm',
  '/part/b/count',
  '/part/c/stone',
  '/part/c/ring',
  '/part/c/palindrome',
  '/part/c/tree',
  '/part/c/merge',
  '/part/d/grid',
  '/part/d/matpow',
  '/part/e/basic',
  '/part/e/distsum',
  '/part/e/inout',
  '/part/e/center',
  '/part/f/select',
  '/part/f/knapsack',
  '/part/f/diameter',
  '/part/f/cover',
  '/part/f/count',
  '/part/g/board',
  '/part/g/tsp',
  '/part/g/cover',
  '/part/g/subset',
  '/part/g/plug',
] as const

const ALL_LESSON_HEROES = [
  { route: '/part/a/01', lesson: '01', asset: 'knapsack-01-instrument-v2' },
  { route: '/part/a/complete', lesson: 'complete', asset: 'knapsack-complete-instrument-v1' },
  { route: '/part/a/multiple', lesson: 'multiple', asset: 'knapsack-multiple-instrument-v1' },
  { route: '/part/a/group', lesson: 'group', asset: 'knapsack-group-instrument-v1' },
  { route: '/part/a/mixed', lesson: 'mixed', asset: 'knapsack-mixed-instrument-v1' },
  { route: '/part/a/cost2d', lesson: 'cost2d', asset: 'knapsack-cost2d-instrument-v1' },
  { route: '/part/a/dep', lesson: 'dep', asset: 'knapsack-dependency-instrument-v1' },
  { route: '/part/a/variant', lesson: 'variant', asset: 'knapsack-variant-instrument-v1' },
  { route: '/part/a/fractional', lesson: 'fractional', asset: 'knapsack-fractional-instrument-v1' },
  { route: '/part/b/path', lesson: 'path', asset: 'linear-path-instrument-v1' },
  { route: '/part/b/maxseg', lesson: 'maxseg', asset: 'linear-maxseg-instrument-v1' },
  { route: '/part/b/lis', lesson: 'lis', asset: 'linear-lis-instrument-v1' },
  { route: '/part/b/lcs', lesson: 'lcs', asset: 'lcs-instrument-v1' },
  { route: '/part/b/edit', lesson: 'edit', asset: 'linear-edit-instrument-v1' },
  { route: '/part/b/fsm', lesson: 'fsm', asset: 'fsm-instrument-v1' },
  { route: '/part/b/count', lesson: 'count', asset: 'linear-count-instrument-v1' },
  { route: '/part/c/stone', lesson: 'stone', asset: 'interval-stone-instrument-v1' },
  { route: '/part/c/ring', lesson: 'ring', asset: 'interval-ring-instrument-v1' },
  { route: '/part/c/palindrome', lesson: 'palindrome', asset: 'interval-palindrome-instrument-v1' },
  { route: '/part/c/tree', lesson: 'tree', asset: 'interval-tree-instrument-v1' },
  { route: '/part/c/merge', lesson: 'merge', asset: 'interval-merge-instrument-v1' },
  { route: '/part/d/grid', lesson: 'grid', asset: 'matrix-grid-instrument-v1' },
  { route: '/part/d/matpow', lesson: 'matpow', asset: 'matrix-power-instrument-v1' },
  { route: '/part/e/basic', lesson: 'basic', asset: 'reroot-basic-instrument-v1' },
  { route: '/part/e/distsum', lesson: 'distsum', asset: 'reroot-distsum-instrument-v1' },
  { route: '/part/e/inout', lesson: 'inout', asset: 'reroot-inout-instrument-v1' },
  { route: '/part/e/center', lesson: 'center', asset: 'reroot-center-instrument-v1' },
  { route: '/part/f/select', lesson: 'select', asset: 'tree-select-instrument-v1' },
  { route: '/part/f/knapsack', lesson: 'knapsack', asset: 'tree-knapsack-instrument-v1' },
  { route: '/part/f/diameter', lesson: 'diameter', asset: 'tree-diameter-instrument-v1' },
  { route: '/part/f/cover', lesson: 'cover', asset: 'tree-cover-instrument-v1' },
  { route: '/part/f/count', lesson: 'count', asset: 'tree-count-instrument-v1' },
  { route: '/part/g/board', lesson: 'board', asset: 'bitmask-board-instrument-v1' },
  { route: '/part/g/tsp', lesson: 'tsp', asset: 'bitmask-tsp-instrument-v1' },
  { route: '/part/g/cover', lesson: 'cover', asset: 'bitmask-cover-instrument-v1' },
  { route: '/part/g/subset', lesson: 'subset', asset: 'bitmask-subset-instrument-v1' },
  { route: '/part/g/plug', lesson: 'plug', asset: 'bitmask-plug-instrument-v1' },
] as const

const REPRESENTATIVE_HEROES = [
  { route: '/part/a/01', lesson: '01', asset: 'knapsack-01-instrument-v2' },
  { route: '/part/a/dep', lesson: 'dep', asset: 'knapsack-dependency-instrument-v1' },
  { route: '/part/b/lcs', lesson: 'lcs', asset: 'lcs-instrument-v1' },
  { route: '/part/b/fsm', lesson: 'fsm', asset: 'fsm-instrument-v1' },
  { route: '/part/c/stone', lesson: 'stone', asset: 'interval-stone-instrument-v1' },
  { route: '/part/c/ring', lesson: 'ring', asset: 'interval-ring-instrument-v1' },
  { route: '/part/d/grid', lesson: 'grid', asset: 'matrix-grid-instrument-v1' },
  { route: '/part/d/matpow', lesson: 'matpow', asset: 'matrix-power-instrument-v1' },
  { route: '/part/e/basic', lesson: 'basic', asset: 'reroot-basic-instrument-v1' },
  { route: '/part/e/distsum', lesson: 'distsum', asset: 'reroot-distsum-instrument-v1' },
  { route: '/part/f/knapsack', lesson: 'knapsack', asset: 'tree-knapsack-instrument-v1' },
  { route: '/part/f/cover', lesson: 'cover', asset: 'tree-cover-instrument-v1' },
  { route: '/part/g/board', lesson: 'board', asset: 'bitmask-board-instrument-v1' },
  { route: '/part/g/plug', lesson: 'plug', asset: 'bitmask-plug-instrument-v1' },
] as const

test('all 37 lessons use the approved instrument shell without page overflow', async ({ page }) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 1440, height: 900 })

  for (const route of ALL_LESSON_ROUTES) {
    await page.goto(route)
    await expect(page.locator('.typepage')).toHaveAttribute('data-demo-standard', 'instrument')
    await expect(page.locator('.typepage')).toHaveAttribute('data-demo-intensity', 'enhanced')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
      `${route} should not overflow horizontally`,
    ).toBe(true)

    const instruments = page.locator('.demo, .demo-workbench')
    expect(await instruments.count(), `${route} should expose at least one algorithm instrument`).toBeGreaterThan(0)
  }
})

test('all 37 high-fidelity heroes stay decorative and course-specific', async ({ page }) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 1440, height: 900 })

  const loadedSources = new Set<string>()
  for (const { route, lesson, asset } of ALL_LESSON_HEROES) {
    await page.goto(route)
    const hero = page.locator(`[data-demo-hero="${lesson}"]`).first()
    const image = hero.locator('img')
    await expect(hero, `${route} should expose its own decorative sculpture`).toBeVisible()
    await expect(hero).toHaveAttribute('aria-hidden', 'true')
    await expect(image).toHaveAttribute('alt', '')
    await expect(image).toHaveAttribute('src', new RegExp(`${asset}-.+\\.avif$`))
    await expect(image).toHaveCSS('object-fit', 'contain')
    await expect(hero.locator('button, input, select, svg, [data-step]')).toHaveCount(0)
    const source = await image.getAttribute('src')
    expect(source, `${route} should load a concrete Hero asset`).toBeTruthy()
    expect(loadedSources.has(source ?? ''), `${route} should not reuse another lesson's Hero`).toBe(false)
    loadedSources.add(source ?? '')
  }
  expect(loadedSources.size).toBe(ALL_LESSON_HEROES.length)
})

test('group lesson sculpture stays inside its frame above the editor controls', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 617 })
  await page.goto('/part/a/group')

  const demo = page.locator('.demo__body').first()
  const hero = demo.locator('[data-demo-hero="group"]')
  const image = hero.locator('img')
  const toolbar = demo.locator('.demo-control__toolbar')

  expect(await hero.evaluate((element) => {
    const frame = element.getBoundingClientRect()
    const art = element.querySelector('img')?.getBoundingClientRect()
    return art
      ? art.top >= frame.top - 1
        && art.right <= frame.right + 1
        && art.bottom <= frame.bottom + 1
        && art.left >= frame.left - 1
      : false
  })).toBe(true)
  expect(await toolbar.evaluate((element) => {
    const controls = element.getBoundingClientRect()
    const art = element.previousElementSibling?.querySelector('img')?.getBoundingClientRect()
    return art ? controls.top >= art.bottom : false
  })).toBe(true)
  await expect(image).toHaveCSS('position', 'absolute')
  await expect(hero).toHaveCSS('overflow', 'hidden')
})

test('approved review archive links every high-fidelity representative lesson', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('dpmaster:body-demo-review:v1', '{}')
  })
  await page.goto('/lab/body-demo-standard')
  await page.getByRole('button', { name: '打开评审归档' }).click()

  const review = page.getByRole('dialog', { name: '代表课程评审归档' })
  await expect(review).toBeVisible()
  await expect(review.locator('.standard-review__routes a')).toHaveCount(REPRESENTATIVE_HEROES.length)
  expect(await review.locator('.standard-review__routes a').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')),
  )).toEqual(REPRESENTATIVE_HEROES.map(({ route }) => route))
})

test('A/01 keeps a decorative hero separate from the editable DP data flow', async ({ page }) => {
  const consoleProblems: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => consoleProblems.push(error.message))

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/part/a/01')

  const demo = page.locator('.kd.demo-editor')
  const hero = demo.locator('.knapsack-hero')
  const heroImage = hero.locator('img')
  await expect(hero).toBeVisible()
  await expect(hero).toHaveAttribute('aria-hidden', 'true')
  await expect(heroImage).toHaveAttribute('alt', '')
  await expect(heroImage).toHaveAttribute('src', /knapsack-01-instrument-v2-.+\.avif$/)
  await expect(heroImage).toHaveCSS('object-fit', 'contain')
  await expect(hero.locator('svg, ol, [data-decision]')).toHaveCount(0)
  await expect(demo.locator('.knapsack-settings > summary')).toHaveText('自主设计数值')
  const heroSrc = await heroImage.getAttribute('src')
  const initialHeroBox = await hero.boundingBox()
  expect(initialHeroBox?.height).toBeGreaterThanOrEqual(350)
  expect(initialHeroBox?.height).toBeLessThanOrEqual(365)

  const capacity = demo.getByRole('spinbutton', { name: 'm 数值' })
  await capacity.fill('20')
  await capacity.press('Tab')
  const firstItem = demo.locator('.demo-control__item').first()
  const firstWeight = firstItem.getByRole('spinbutton', { name: '重量 w 数值' })
  await firstWeight.fill('7')
  await firstWeight.press('Tab')
  await demo.getByRole('button', { name: '加物品' }).click()
  await expect(demo.locator('.demo-control__item')).toHaveCount(4)
  await expect(capacity).toHaveValue('20')
  await expect(firstWeight).toHaveValue('7')
  await expect(heroImage).toHaveAttribute('src', heroSrc ?? '')
  await expect(hero.locator('svg, ol, [data-decision]')).toHaveCount(0)

  const next = demo.getByRole('group', { name: 'DP 表格逐帧播放' }).getByRole('button', { name: '下一步' })
  for (let index = 0; index < 21; index += 1) await next.click()
  await expect(heroImage).toHaveAttribute('src', heroSrc ?? '')
  await expect(hero.locator('[data-decision]')).toHaveCount(0)

  const scroller = demo.locator('.demo-table-viewport__scroller')
  const currentCell = demo.locator('.dp-cell.is-current')
  expect(await scroller.evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingBottom))).toBeGreaterThanOrEqual(8)
  expect(await scroller.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
  expect(await currentCell.evaluate((element) => {
    const cell = element.getBoundingClientRect()
    const viewport = element.closest('.demo-table-viewport__scroller')?.getBoundingClientRect()
    return viewport ? cell.left >= viewport.left - 1 && cell.right <= viewport.right + 1 : false
  })).toBe(true)
  await expect(demo.locator('.demo-table-viewport__position')).not.toHaveCSS('left', '0px')
  expect(await demo.evaluate((element) => {
    const rail = element.querySelector('.instrument-rail')?.getBoundingClientRect()
    const body = element.closest('.demo__body')?.getBoundingClientRect()
    return rail && body ? body.bottom - rail.bottom : Number.POSITIVE_INFINITY
  })).toBeLessThanOrEqual(20)
  expect(await demo.evaluate((element) => {
    const instrument = element.closest('.demo')
    const nextHeading = instrument?.closest('.lesson')?.nextElementSibling?.querySelector('.section-title')
    const instrumentBox = instrument?.getBoundingClientRect()
    const headingBox = nextHeading?.getBoundingClientRect()
    return instrumentBox && headingBox ? headingBox.top - instrumentBox.bottom : Number.POSITIVE_INFINITY
  })).toBeLessThanOrEqual(100)

  await page.setViewportSize({ width: 390, height: 844 })
  expect((await hero.boundingBox())?.height).toBeGreaterThanOrEqual(215)
  expect((await hero.boundingBox())?.height).toBeLessThanOrEqual(225)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
  ).toBe(true)
  expect(consoleProblems).toEqual([])
})

test('knapsack editor and playback rail keep deliberate spacing at narrow widths', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 })
  await page.goto('/part/a/01')

  const demo = page.locator('.kd.demo-editor')
  const itemBoxes = await demo.locator('.demo-control__item').evaluateAll((items) =>
    items.slice(0, 2).map((item) => item.getBoundingClientRect().toJSON()),
  )
  expect(itemBoxes).toHaveLength(2)
  expect(itemBoxes[0].width).toBeLessThanOrEqual(230)
  expect(Math.abs(itemBoxes[0].top - itemBoxes[1].top)).toBeLessThanOrEqual(1)

  const rightInset = await demo.evaluate((element) => {
    const viewport = element.querySelector('.dpviz__viewport')?.getBoundingClientRect()
    const scroller = element.querySelector('.demo-table-viewport__scroller')?.getBoundingClientRect()
    return viewport && scroller ? viewport.right - scroller.right : 0
  })
  expect(rightInset).toBeGreaterThanOrEqual(16)

  const railAtTablet = await demo.evaluate((element) => {
    const box = (selector: string) => element.querySelector(selector)?.getBoundingClientRect()
    return {
      transport: box('.instrument-rail .playback__transport'),
      progress: box('.instrument-rail .playback__progress'),
      speed: box('.instrument-rail .playback__speed'),
    }
  })
  expect(Math.abs((railAtTablet.transport?.top ?? 0) - (railAtTablet.speed?.top ?? 0))).toBeLessThanOrEqual(1)
  expect((railAtTablet.speed?.left ?? 0) - (railAtTablet.transport?.right ?? 0)).toBeGreaterThanOrEqual(8)
  expect((railAtTablet.progress?.top ?? 0)).toBeGreaterThanOrEqual(railAtTablet.transport?.bottom ?? Infinity)

  await page.setViewportSize({ width: 390, height: 844 })
  const railAtMobile = await demo.evaluate((element) => {
    const box = (selector: string) => element.querySelector(selector)?.getBoundingClientRect()
    return {
      transport: box('.instrument-rail .playback__transport'),
      progress: box('.instrument-rail .playback__progress'),
      speed: box('.instrument-rail .playback__speed'),
    }
  })
  expect((railAtMobile.progress?.top ?? 0)).toBeGreaterThanOrEqual(railAtMobile.transport?.bottom ?? Infinity)
  expect((railAtMobile.speed?.top ?? 0)).toBeGreaterThanOrEqual(railAtMobile.progress?.bottom ?? Infinity)
  await demo.getByRole('button', { name: '速度 2 倍' }).click()
  await expect(demo.getByRole('button', { name: '速度 2 倍' })).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true)

  for (const width of [320, 360, 390, 430, 480, 540, 600, 640, 720, 740, 768]) {
    await page.setViewportSize({ width, height: 900 })
    const audit = await demo.evaluate((element) => {
      const rect = (selector: string) => element.querySelector(selector)?.getBoundingClientRect()
      const item = element.querySelector('.demo-control__item')
      const itemBox = item?.getBoundingClientRect()
      const itemControls = item ? [...item.querySelectorAll('button, input')].map((control) => control.getBoundingClientRect()) : []
      const rail = rect('.instrument-rail')
      const railParts = [
        rect('.instrument-rail .playback__transport'),
        rect('.instrument-rail .playback__progress'),
        rect('.instrument-rail .playback__speed'),
      ].filter((box): box is DOMRect => Boolean(box))
      const playbackButtons = [...element.querySelectorAll('.instrument-rail .playback button')]
        .map((button) => button.getBoundingClientRect())
      const overlaps = railParts.some((box, index) => railParts.slice(index + 1).some((other) =>
        Math.min(box.right, other.right) - Math.max(box.left, other.left) > 1
        && Math.min(box.bottom, other.bottom) - Math.max(box.top, other.top) > 1,
      ))
      const viewport = rect('.dpviz__viewport')
      const scroller = rect('.demo-table-viewport__scroller')

      return {
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        demoOverflow: element.scrollWidth - element.clientWidth,
        settingsOverflow: (element.querySelector('.knapsack-settings__body')?.scrollWidth ?? 0)
          - (element.querySelector('.knapsack-settings__body')?.clientWidth ?? 0),
        itemWidth: itemBox?.width ?? Number.POSITIVE_INFINITY,
        itemControlOverflow: itemBox
          ? itemControls.some((box) => box.left < itemBox.left - 1 || box.right > itemBox.right + 1)
          : true,
        railOverflow: rail
          ? railParts.some((box) => box.left < rail.left - 1 || box.right > rail.right + 1)
          : true,
        railPartsOverlap: overlaps,
        minPlaybackButton: Math.min(...playbackButtons.map((box) => Math.min(box.width, box.height))),
        rightInset: viewport && scroller ? viewport.right - scroller.right : 0,
      }
    })

    expect(audit.pageOverflow, `${width}px page overflow`).toBeLessThanOrEqual(1)
    expect(audit.demoOverflow, `${width}px demo overflow`).toBeLessThanOrEqual(1)
    expect(audit.settingsOverflow, `${width}px settings overflow`).toBeLessThanOrEqual(1)
    expect(audit.itemWidth, `${width}px item width`).toBeLessThanOrEqual(225)
    expect(audit.itemControlOverflow, `${width}px item controls`).toBe(false)
    expect(audit.railOverflow, `${width}px rail overflow`).toBe(false)
    expect(audit.railPartsOverlap, `${width}px rail overlap`).toBe(false)
    expect(audit.minPlaybackButton, `${width}px playback target`).toBeGreaterThanOrEqual(44)
    expect(audit.rightInset, `${width}px table inset`).toBeGreaterThanOrEqual(16)

    if (width === 320) {
      const crumb = page.locator('.crumbs .cur')
      await expect(crumb).toHaveText('01 背包')
      expect((await crumb.boundingBox())?.height).toBeLessThanOrEqual(22)
      expect(await page.locator('.crumbs > a, .crumbs > .sep').evaluateAll((elements) =>
        elements.every((element) => getComputedStyle(element).display === 'none'),
      )).toBe(true)
    }
  }
})

test('complete knapsack owns a distinct decorative hero and repeat-use language', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/part/a/complete')

  const demo = page.locator('.kd.demo-editor')
  const hero = demo.locator('.knapsack-hero')
  const heroImage = hero.locator('img')
  await expect(demo).toHaveAttribute('data-knapsack-variant', 'complete')
  await expect(hero).toHaveAttribute('data-variant', 'complete')
  await expect(heroImage).toHaveAttribute('src', /knapsack-complete-instrument-v1-.+\.avif$/)
  await expect(demo.locator('.knapsack-settings__rule')).toContainText('每种物品可重复取用 · 容量正序更新')
  await expect(demo.locator('.demo-control__group-label').first()).toContainText('每种可重复取用')
  await expect(demo.locator('.demo-control__modes')).toHaveCount(0)

  const heroSrc = await heroImage.getAttribute('src')
  await demo.getByRole('spinbutton', { name: 'm 数值' }).fill('18')
  await demo.getByRole('spinbutton', { name: 'm 数值' }).press('Tab')
  await demo.getByRole('group', { name: 'DP 表格逐帧播放' }).getByRole('button', { name: '下一步' }).click()
  await expect(heroImage).toHaveAttribute('src', heroSrc ?? '')
  await expect(hero.locator('svg, ol, [data-decision]')).toHaveCount(0)
})

test('B/LCS owns a static sequence hero and narrow editors stay inside the instrument', async ({ page }) => {
  const consoleProblems: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => consoleProblems.push(error.message))

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/part/b/lcs')

  const demo = page.locator('.lcs-demo').first()
  const hero = demo.locator('.lcs-hero')
  const heroImage = hero.locator('img')
  await expect(hero).toBeVisible()
  await expect(hero).toHaveAttribute('aria-hidden', 'true')
  await expect(heroImage).toHaveAttribute('alt', '')
  await expect(heroImage).toHaveAttribute('src', /lcs-instrument-v1-.+\.avif$/)
  await expect(heroImage).toHaveCSS('object-fit', 'contain')
  await expect(hero.locator('svg, ol, [data-step], [data-match]')).toHaveCount(0)

  const heroSrc = await heroImage.getAttribute('src')
  await demo.getByRole('button', { name: '完全一致' }).click()
  await demo.getByRole('button', { name: '下一个字符' }).first().click()
  await expect(heroImage).toHaveAttribute('src', heroSrc ?? '')
  await expect(hero.locator('svg, ol, [data-step], [data-match]')).toHaveCount(0)

  for (const width of [320, 360, 390, 430, 480, 540, 600, 640, 720, 740, 768]) {
    await page.setViewportSize({ width, height: 900 })
    const audit = await demo.evaluate((element) => {
      const heroBox = element.querySelector('.lcs-hero')?.getBoundingClientRect()
      const heroImageBox = element.querySelector('.lcs-hero img')?.getBoundingClientRect()
      const editors = [...element.querySelectorAll('.lcs-string-editor')]
      const cards = [...element.querySelectorAll('.lcs-char')]
      const controls = [...element.querySelectorAll('.lcs-char button')]

      return {
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        demoOverflow: element.scrollWidth - element.clientWidth,
        editorOverflow: editors.some((editor) => editor.scrollWidth > editor.clientWidth + 1),
        maxCardWidth: Math.max(...cards.map((card) => card.getBoundingClientRect().width)),
        controlOverflow: cards.some((card) => {
          const cardBox = card.getBoundingClientRect()
          return [...card.querySelectorAll('button')].some((control) => {
            const box = control.getBoundingClientRect()
            return box.left < cardBox.left - 1 || box.right > cardBox.right + 1
          })
        }),
        minControlTarget: Math.min(...controls.map((control) => {
          const box = control.getBoundingClientRect()
          return Math.min(box.width, box.height)
        })),
        heroOverflow: heroBox && heroImageBox
          ? heroImageBox.left < heroBox.left - 1 || heroImageBox.right > heroBox.right + 1
          : true,
        heroHeight: heroBox?.height ?? 0,
      }
    })

    expect(audit.pageOverflow, `${width}px page overflow`).toBeLessThanOrEqual(1)
    expect(audit.demoOverflow, `${width}px demo overflow`).toBeLessThanOrEqual(1)
    expect(audit.editorOverflow, `${width}px editor overflow`).toBe(false)
    expect(audit.maxCardWidth, `${width}px character card`).toBeLessThanOrEqual(133)
    expect(audit.controlOverflow, `${width}px character controls`).toBe(false)
    expect(audit.minControlTarget, `${width}px character target`).toBeGreaterThanOrEqual(44)
    expect(audit.heroOverflow, `${width}px hero overflow`).toBe(false)
    expect(audit.heroHeight, `${width}px hero height`).toBeGreaterThanOrEqual(179)
  }

  expect(consoleProblems).toEqual([])
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
