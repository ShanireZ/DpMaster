import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SafeCaption } from './SafeCaption.tsx'

describe('<SafeCaption>', () => {
  it('renders approved inline tags', () => {
    const { container } = render(<SafeCaption html="<b>重点</b>" />)
    const b = container.querySelector('b')
    expect(b).not.toBeNull()
    expect(b?.textContent).toBe('重点')
  })

  it('applies approved span className', () => {
    const { container } = render(<SafeCaption html='<span class="ok">对</span>' />)
    const span = container.querySelector('span.ok')
    expect(span).not.toBeNull()
    expect(span?.textContent).toBe('对')
  })

  it('renders a <br> element', () => {
    const { container } = render(<SafeCaption html="a<br>b" />)
    expect(container.querySelector('br')).not.toBeNull()
  })

  it('never produces live HTML for disallowed markup (XSS safety)', () => {
    const { container } = render(<SafeCaption html="<script>alert(1)</script>" />)
    // No real <script> element is ever mounted.
    expect(container.querySelector('script')).toBeNull()
    // The raw text is preserved as inert text content.
    expect(container.textContent).toContain('<script>alert(1)</script>')
  })

  it('strips unapproved span classes to inert text', () => {
    const { container } = render(<SafeCaption html='<span class="evil">x</span>' />)
    expect(container.querySelector('span.evil')).toBeNull()
    expect(container.textContent).toContain('<span class="evil">x</span>')
  })
})
