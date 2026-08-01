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
})
