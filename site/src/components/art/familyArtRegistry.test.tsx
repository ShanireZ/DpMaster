import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KnapsackLessonPlate } from './PolygonBackpack.tsx'
import { LinearLessonPlate } from './LinearFamilyArt.tsx'
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

  it('gives every lesson-plate instance unique accessible SVG definitions', () => {
    const { container } = render(
      <>
        <KnapsackLessonPlate slug="01" title="01 背包" />
        <KnapsackLessonPlate slug="cost2d" title="二维费用背包" />
      </>,
    )

    const plates = [...container.querySelectorAll<SVGSVGElement>('.knapsack-plate')]
    const markerIds = plates.map((plate) => plate.querySelector('marker')?.id)
    const labelledBy = plates.map((plate) => plate.getAttribute('aria-labelledby'))
    const markerUrls = plates.map((plate) =>
      plate.style.getPropertyValue('--knapsack-arrow-id'),
    )

    expect(new Set(markerIds).size).toBe(2)
    expect(new Set(labelledBy).size).toBe(2)
    expect(new Set(markerUrls).size).toBe(2)
    expect(plates.every((plate) => plate.querySelector('title') && plate.querySelector('desc'))).toBe(true)
  })

  it('gives both B pilot plates unique accessible SVG definitions', () => {
    const { container } = render(
      <>
        <LinearLessonPlate slug="lis" title="最长上升子序列 LIS" />
        <LinearLessonPlate slug="edit" title="编辑距离" />
      </>,
    )

    const plates = [...container.querySelectorAll<SVGSVGElement>('.linear-plate')]
    const markerIds = plates.map((plate) => plate.querySelector('marker')?.id)
    const labelledBy = plates.map((plate) => plate.getAttribute('aria-labelledby'))

    expect(plates).toHaveLength(2)
    expect(new Set(markerIds).size).toBe(2)
    expect(new Set(labelledBy).size).toBe(2)
    expect(plates.every((plate) => plate.querySelector('title') && plate.querySelector('desc'))).toBe(true)
  })

  it('keeps unfinished B lesson plates on an explicit fallback', () => {
    const { container } = render(
      <LinearLessonPlate slug="path" title="路径型 / 递推入门" />,
    )

    expect(container.querySelector('[data-family-mode="fallback"]')).not.toBeNull()
    expect(container.querySelector('.linear-plate')).toBeNull()
  })
})
