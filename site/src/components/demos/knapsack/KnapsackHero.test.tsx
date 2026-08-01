import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KnapsackHero } from './KnapsackHero.tsx'

describe('KnapsackHero', () => {
  it('stays decorative and contains no data or playback graphics', () => {
    const { container } = render(<KnapsackHero />)
    const hero = container.querySelector('.knapsack-hero')

    expect(hero).toHaveAttribute('aria-hidden', 'true')
    expect(hero?.querySelector('img')).toHaveAttribute('alt', '')
    expect(hero?.querySelector('svg')).not.toBeInTheDocument()
    expect(hero?.querySelector('ol')).not.toBeInTheDocument()
    expect(hero).not.toHaveAttribute('data-decision')
  })

  it('uses a distinct static asset for complete knapsack', () => {
    const zeroOne = render(<KnapsackHero variant="01" />)
    const complete = render(<KnapsackHero variant="complete" />)

    expect(zeroOne.container.querySelector('img')?.getAttribute('src')).toContain('knapsack-01-instrument-v2')
    expect(complete.container.querySelector('img')?.getAttribute('src')).toContain('knapsack-complete-instrument-v1')
    expect(complete.container.querySelector('.knapsack-hero')).toHaveAttribute('data-variant', 'complete')
  })
})
