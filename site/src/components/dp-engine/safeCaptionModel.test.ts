import { describe, it, expect } from 'vitest'
import { parseSafeCaption } from './safeCaptionModel.ts'

describe('parseSafeCaption', () => {
  it('returns empty array for empty input', () => {
    expect(parseSafeCaption('')).toEqual([])
  })

  it('keeps plain text as a single string node', () => {
    expect(parseSafeCaption('f[3] = 6')).toEqual(['f[3] = 6'])
  })

  it('parses approved inline tags', () => {
    expect(parseSafeCaption('<b>重点</b>')).toEqual([
      { tag: 'b', children: ['重点'] },
    ])
    expect(parseSafeCaption('<strong>粗</strong>')).toEqual([
      { tag: 'strong', children: ['粗'] },
    ])
    expect(parseSafeCaption('<code>x</code>')).toEqual([
      { tag: 'code', children: ['x'] },
    ])
  })

  it('parses approved span classes with className', () => {
    expect(parseSafeCaption('<span class="ok">对</span>')).toEqual([
      { tag: 'span', className: 'ok', children: ['对'] },
    ])
    expect(parseSafeCaption('<span class="bad">错</span>')).toEqual([
      { tag: 'span', className: 'bad', children: ['错'] },
    ])
  })

  it('emits a <br> element', () => {
    expect(parseSafeCaption('a<br>b')).toEqual(['a', { tag: 'br', children: [] }, 'b'])
  })

  it('decodes named and numeric entities', () => {
    expect(parseSafeCaption('1 &lt; 2 &amp;&amp; 3 &gt; 2')).toEqual(['1 < 2 && 3 > 2'])
    expect(parseSafeCaption('&#65;&#x42;')).toEqual(['AB'])
  })

  it('falls back to escaped text on disallowed tags (XSS safety)', () => {
    // <script> is not in the approved vocabulary -> malformed -> whole thing
    // returned as inert text, so it can never be interpreted as HTML.
    const out = parseSafeCaption('<script>alert(1)</script>')
    expect(out).toEqual(['<script>alert(1)</script>'])
  })

  it('falls back on unapproved span classes', () => {
    const out = parseSafeCaption('<span class="evil">x</span>')
    expect(out).toEqual(['<span class="evil">x</span>'])
  })

  it('falls back on unclosed tags', () => {
    const out = parseSafeCaption('<b>没闭合')
    expect(out).toEqual(['<b>没闭合'])
  })

  it('falls back on mismatched closing tags', () => {
    const out = parseSafeCaption('<b>hi</code>')
    expect(out).toEqual(['<b>hi</code>'])
  })

  it('supports nested structure', () => {
    expect(parseSafeCaption('<b><code>a</code></b>')).toEqual([
      { tag: 'b', children: [{ tag: 'code', children: ['a'] }] },
    ])
  })
})
