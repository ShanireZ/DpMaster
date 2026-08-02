import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PARTS, type PartId } from '../../data/catalog.ts'
import { PolyLessonPlate } from './PolyLessonPlate.tsx'
import {
  getFamilyArtSource,
  hasFamilyArt,
  loadFamilyArt,
} from './familyArtRegistry.ts'

describe('family art registry', () => {
  it('registers all seven families behind independent lazy modules', async () => {
    const sources: Record<PartId, string> = {
      a: 'src/components/art/families/backpack.tsx',
      b: 'src/components/art/families/linear.tsx',
      c: 'src/components/art/families/interval.tsx',
      d: 'src/components/art/families/matrix.tsx',
      e: 'src/components/art/families/reroot.tsx',
      f: 'src/components/art/families/tree.tsx',
      g: 'src/components/art/families/bitmask.tsx',
    }

    for (const part of PARTS) {
      expect(hasFamilyArt(part.id)).toBe(true)
      expect(getFamilyArtSource(part.id)).toBe(sources[part.id])
      await expect(loadFamilyArt(part.id)).resolves.toMatchObject({
        HeroArt: expect.any(Function),
        JourneyArt: expect.any(Function),
        LessonPlate: expect.any(Function),
      })
    }
  })

  it('maps A lessons to distinct accessible atlas cells', () => {
    const { container } = render(
      <>
        <PolyLessonPlate family="a" slug="01" title="01 背包" atlas="/a-lessons.avif" />
        <PolyLessonPlate family="a" slug="cost2d" title="二维费用背包" atlas="/a-lessons.avif" />
      </>,
    )

    const plates = [...container.querySelectorAll<HTMLElement>('.knapsack-plate')]
    const cells = plates.map((plate) =>
      `${plate.dataset.atlasColumn}:${plate.dataset.atlasRow}`,
    )

    expect(new Set(cells).size).toBe(2)
    expect(plates.every((plate) => plate.getAttribute('role') === 'img')).toBe(true)
    expect(plates.every((plate) => plate.getAttribute('aria-label')?.includes('：'))).toBe(true)
    expect(plates.every((plate) => plate.querySelector('img[alt=""]'))).toBe(true)
  })

  it('gives every B lesson an accessible semantic plate in a distinct atlas cell', () => {
    const { container } = render(
      <>
        <PolyLessonPlate family="b" slug="path" title="路径型 / 递推入门" atlas="/b-lessons.avif" />
        <PolyLessonPlate family="b" slug="maxseg" title="最大子段和" atlas="/b-lessons.avif" />
        <PolyLessonPlate family="b" slug="lis" title="最长上升子序列 LIS" atlas="/b-lessons.avif" />
        <PolyLessonPlate family="b" slug="lcs" title="最长公共子序列 LCS" atlas="/b-lessons.avif" />
        <PolyLessonPlate family="b" slug="edit" title="编辑距离" atlas="/b-lessons.avif" />
        <PolyLessonPlate family="b" slug="fsm" title="线性状态机 DP" atlas="/b-lessons.avif" />
        <PolyLessonPlate family="b" slug="count" title="计数 / 划分型" atlas="/b-lessons.avif" />
      </>,
    )

    const plates = [...container.querySelectorAll<HTMLElement>('.linear-plate')]
    const cells = plates.map((plate) =>
      `${plate.dataset.atlasColumn}:${plate.dataset.atlasRow}`,
    )

    expect(plates).toHaveLength(7)
    expect(new Set(cells).size).toBe(7)
    expect(plates.every((plate) => plate.getAttribute('role') === 'img')).toBe(true)
    expect(plates.every((plate) => plate.getAttribute('aria-label')?.includes('：'))).toBe(true)
    expect(plates.every((plate) => plate.dataset.atlasFrame?.split(' ').length === 4)).toBe(true)
    expect(plates.every((plate) => plate.style.getPropertyValue('--atlas-width').endsWith('%'))).toBe(true)
    expect(plates.every((plate) => plate.style.getPropertyValue('--atlas-left').endsWith('%'))).toBe(true)
    expect(plates.every((plate) => plate.style.getPropertyValue('--atlas-top').endsWith('%'))).toBe(true)
    expect(plates.every((plate) => plate.style.getPropertyValue('--atlas-clip-right').endsWith('%'))).toBe(true)
    expect(plates.every((plate) => plate.style.getPropertyValue('--atlas-clip-bottom').endsWith('%'))).toBe(true)
    expect(container.querySelector('[data-family-mode="fallback"]')).toBeNull()
  })

  it('fails safely for unknown lesson slugs', () => {
    const { container } = render(
      <PolyLessonPlate family="b" slug="unknown" title="未知课程" atlas="/b-lessons.avif" />,
    )

    expect(container.childElementCount).toBe(0)
    expect(container.querySelector('.linear-plate')).toBeNull()
  })

  it('maps all 37 catalog lessons to distinct accessible family atlas cells', () => {
    const { container } = render(
      <>
        {PARTS.flatMap((part) => part.types.map((lesson) => (
          <PolyLessonPlate
            key={`${part.id}-${lesson.slug}`}
            family={part.id}
            slug={lesson.slug}
            title={lesson.title}
            atlas={`/${part.id}-lessons.webp`}
          />
        )))}
      </>,
    )

    const plates = [...container.querySelectorAll<HTMLElement>('.poly-lesson-plate')]
    expect(plates).toHaveLength(37)

    for (const part of PARTS) {
      const familyPlates = plates.filter((plate) => plate.dataset.familyArt === part.id)
      const cells = familyPlates.map((plate) => `${plate.dataset.atlasColumn}:${plate.dataset.atlasRow}`)
      expect(familyPlates).toHaveLength(part.types.length)
      expect(new Set(cells).size).toBe(part.types.length)
      expect(familyPlates.every((plate) => plate.dataset.atlasFrame?.split(' ').length === 4)).toBe(true)
      expect(familyPlates.every((plate) => plate.getAttribute('aria-label')?.includes('：'))).toBe(true)
    }
  })

  it('exposes lesson frame metadata in each optimized atlas native pixel space', () => {
    const { container } = render(
      <PolyLessonPlate
        family="c"
        slug="stone"
        title="石子合并"
        atlas="/interval-lessons.avif"
      />,
    )

    const plate = container.querySelector<HTMLElement>('.interval-plate--stone')

    expect(plate?.dataset.atlasFrame).toBe('25.5 46.5 333 289.5')
    expect(plate?.dataset.atlasClip).toBe('0 0 384 384')
  })
})
