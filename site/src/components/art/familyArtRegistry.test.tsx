import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KnapsackLessonPlate } from './PolygonBackpack.tsx'
import {
  getFamilyArtSource,
  hasFamilyArt,
  loadFamilyArt,
} from './familyArtRegistry.ts'

describe('family art registry', () => {
  it('upgrades A without claiming unfinished families', async () => {
    expect(hasFamilyArt('a')).toBe(true)
    expect(hasFamilyArt('b')).toBe(false)
    expect(getFamilyArtSource('a')).toBe(
      'src/components/art/families/backpack.tsx',
    )

    const module = await loadFamilyArt('a')
    expect(module).toMatchObject({
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
})
