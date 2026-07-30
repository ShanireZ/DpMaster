import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PolyLessonPlate } from './PolyLessonPlate.tsx'
import {
  getFamilyArtSource,
  hasFamilyArt,
  loadFamilyArt,
} from './familyArtRegistry.ts'

describe('family art registry', () => {
  it('upgrades A and registers the approved B pilot without claiming later families', async () => {
    expect(hasFamilyArt('a')).toBe(true)
    expect(hasFamilyArt('b')).toBe(true)
    expect(hasFamilyArt('c')).toBe(false)
    expect(getFamilyArtSource('a')).toBe(
      'src/components/art/families/backpack.tsx',
    )
    expect(getFamilyArtSource('b')).toBe(
      'src/components/art/families/linear.tsx',
    )

    const module = await loadFamilyArt('a')
    expect(module).toMatchObject({
      HeroArt: expect.any(Function),
      JourneyArt: expect.any(Function),
      LessonPlate: expect.any(Function),
    })

    const linearModule = await loadFamilyArt('b')
    expect(linearModule).toMatchObject({
      HeroArt: expect.any(Function),
      JourneyArt: expect.any(Function),
      LessonPlate: expect.any(Function),
    })
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
})
