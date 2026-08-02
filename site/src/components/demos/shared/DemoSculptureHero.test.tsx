import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DemoSculptureHero } from './DemoSculptureHero.tsx'

describe('DemoSculptureHero', () => {
  it('stays decorative and exposes the lesson identity for browser contracts', () => {
    const { container } = render(
      <DemoSculptureHero family="c" lesson="stone" src="/stone.avif" />,
    )

    const hero = container.querySelector('.demo-sculpture-hero')
    const image = hero?.querySelector('img')
    expect(hero).toHaveAttribute('aria-hidden', 'true')
    expect(hero).toHaveAttribute('data-demo-hero', 'stone')
    expect(hero).toHaveAttribute('data-family', 'c')
    expect(image).toHaveAttribute('src', '/stone.avif')
    expect(image).toHaveAttribute('alt', '')
    expect(hero?.querySelector('svg, button, input, [data-step]')).toBeNull()
  })
})
