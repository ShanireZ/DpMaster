import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LCSHero } from './LCSHero.tsx'

describe('LCSHero', () => {
  it('stays decorative and uses its own static asset', () => {
    const { container } = render(<LCSHero />)
    const hero = container.querySelector('.lcs-hero')
    const image = hero?.querySelector('img')

    expect(hero).toHaveAttribute('aria-hidden', 'true')
    expect(image).toHaveAttribute('alt', '')
    expect(image?.getAttribute('src')).toContain('lcs-instrument-v1')
    expect(hero?.querySelector('svg')).not.toBeInTheDocument()
    expect(hero).not.toHaveAttribute('data-step')
    expect(hero).not.toHaveAttribute('data-match')
  })
})
