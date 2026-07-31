import { expect, test, type Page } from '@playwright/test'

const lessons = {
  a: ['01', 'complete', 'multiple', 'group', 'mixed', 'cost2d', 'dep', 'variant', 'fractional'],
  b: ['path', 'maxseg', 'lis', 'lcs', 'edit', 'fsm', 'count'],
} as const

type Viewport = {
  width: number
  height: number
  mode: 'desktop' | 'mobile'
}

const viewports: Viewport[] = [
  { width: 1440, height: 900, mode: 'desktop' },
  { width: 390, height: 844, mode: 'mobile' },
]

async function inspectHero(page: Page) {
  return page.locator('.typepage').evaluate((root) => {
    const title = root.querySelector<HTMLElement>('.typehead h1')!
    const copy = root.querySelector<HTMLElement>('.typehead__copy')!
    const art = root.querySelector<HTMLElement>('.typehead__art')!
    const plate = root.querySelector<HTMLElement>('.poly-lesson-plate')!
    const viewport = plate.querySelector<HTMLElement>('.poly-lesson-plate__viewport')!
    const atlas = plate.querySelector<HTMLImageElement>('.poly-lesson-plate__atlas')!
    const [x, y, width, height] = plate.getAttribute('data-atlas-frame')!
      .split(' ')
      .map(Number)
    const [clipX, clipY, clipWidth, clipHeight] = plate.getAttribute('data-atlas-clip')!
      .split(' ')
      .map(Number)
    const titleBox = title.getBoundingClientRect()
    const copyBox = copy.getBoundingClientRect()
    const artBox = art.getBoundingClientRect()
    const plateBox = plate.getBoundingClientRect()
    const viewportBox = viewport.getBoundingClientRect()
    const atlasBox = atlas.getBoundingClientRect()
    const scale = atlasBox.width / atlas.naturalWidth
    const contentBox = {
      left: atlasBox.left + x * scale,
      top: atlasBox.top + y * scale,
      right: atlasBox.left + (x + width) * scale,
      bottom: atlasBox.top + (y + height) * scale,
      width: width * scale,
      height: height * scale,
    }
    const titleStyle = getComputedStyle(title)
    const lineHeight = Number.parseFloat(titleStyle.lineHeight)

    return {
      title: {
        fontSize: Number.parseFloat(titleStyle.fontSize),
        lineCount: titleBox.height / lineHeight,
        left: titleBox.left,
        right: titleBox.right,
      },
      copy: {
        left: copyBox.left,
        right: copyBox.right,
        bottom: copyBox.bottom,
      },
      art: {
        left: artBox.left,
        top: artBox.top,
        right: artBox.right,
        center: artBox.left + artBox.width / 2,
      },
      plate: {
        left: plateBox.left,
        right: plateBox.right,
        width: plateBox.width,
        center: plateBox.left + plateBox.width / 2,
      },
      framing: {
        inset: {
          left: contentBox.left - viewportBox.left,
          top: contentBox.top - viewportBox.top,
          right: viewportBox.right - contentBox.right,
          bottom: viewportBox.bottom - contentBox.bottom,
        },
        insetBalance: {
          horizontal: Math.abs(
            (contentBox.left - viewportBox.left)
            - (viewportBox.right - contentBox.right),
          ),
          vertical: Math.abs(
            (contentBox.top - viewportBox.top)
            - (viewportBox.bottom - contentBox.bottom),
          ),
        },
        clipSafety: {
          left: x - clipX,
          top: y - clipY,
          right: clipX + clipWidth - x - width,
          bottom: clipY + clipHeight - y - height,
        },
        dominantOccupancy: Math.max(
          contentBox.width / viewportBox.width,
          contentBox.height / viewportBox.height,
        ),
        overflow: getComputedStyle(viewport).overflow,
        clipPath: getComputedStyle(atlas).clipPath,
      },
      document: {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      },
    }
  })
}

test('all A and B lesson titles and plates fit at desktop and 390px mobile', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)

    for (const [part, slugs] of Object.entries(lessons)) {
      for (const slug of slugs) {
        const route = `${part}/${slug} at ${viewport.width}x${viewport.height}`
        await page.goto(`/part/${part}/${slug}`)
        await expect(page.locator('.typehead h1')).toBeVisible()
        await expect(page.locator('.poly-lesson-plate__atlas')).toHaveJSProperty('complete', true)

        const hero = await inspectHero(page)

        expect(hero.title.lineCount, `${route}: title should stay on one line`).toBeLessThanOrEqual(1.05)
        expect(hero.title.fontSize, `${route}: title should stay readable`).toBeGreaterThanOrEqual(31.5)
        expect(hero.title.left, `${route}: title should stay inside the copy column`).toBeGreaterThanOrEqual(hero.copy.left - 1)
        expect(hero.title.right, `${route}: title should stay inside the viewport`).toBeLessThanOrEqual(hero.document.clientWidth + 1)
        expect(hero.framing.overflow, `${route}: atlas viewport should crop only the other atlas cells`).toBe('hidden')
        expect(hero.framing.clipPath, `${route}: neighboring atlas cells should be masked`).not.toBe('none')
        expect(
          Math.min(...Object.values(hero.framing.inset)),
          `${route}: illustration content should keep a safe inset`,
        ).toBeGreaterThanOrEqual(13.5)
        expect(
          Math.max(...Object.values(hero.framing.insetBalance)),
          `${route}: visible content frame should be geometrically centered`,
        ).toBeLessThanOrEqual(1)
        expect(
          Math.min(...Object.values(hero.framing.clipSafety)),
          `${route}: atlas mask should not cut into the visible content frame`,
        ).toBeGreaterThanOrEqual(0)
        expect(hero.framing.dominantOccupancy, `${route}: illustration should use the available frame`).toBeGreaterThanOrEqual(0.87)
        expect(hero.framing.dominantOccupancy, `${route}: illustration should not crowd the frame`).toBeLessThanOrEqual(0.89)
        expect(hero.plate.left, `${route}: plate should not be cut off on the left`).toBeGreaterThanOrEqual(-1)
        expect(hero.plate.right, `${route}: plate should not be cut off on the right`).toBeLessThanOrEqual(hero.document.clientWidth + 1)
        expect(Math.abs(hero.plate.center - hero.art.center), `${route}: plate should stay centered in its art column`).toBeLessThanOrEqual(2)
        expect(hero.document.scrollWidth, `${route}: page should not overflow horizontally`).toBeLessThanOrEqual(hero.document.clientWidth + 1)

        if (viewport.mode === 'desktop') {
          expect(hero.title.right, `${route}: title should not collide with the illustration`).toBeLessThanOrEqual(hero.art.left + 1)
          expect(hero.art.left, `${route}: illustration should remain to the right of the copy`).toBeGreaterThanOrEqual(hero.copy.left)
        } else {
          expect(hero.art.top, `${route}: illustration should follow the title copy`).toBeGreaterThanOrEqual(hero.copy.bottom - 1)
          expect(hero.plate.width, `${route}: illustration should remain legible`).toBeGreaterThanOrEqual(340)
        }
      }
    }
  }

  expect(runtimeErrors).toEqual([])
})
