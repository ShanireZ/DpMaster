import assert from 'node:assert/strict'
import test from 'node:test'
import { negotiateRepresentation } from '../worker/content-negotiation.js'

test('content negotiation follows the approved HTML and Markdown Accept matrix', () => {
  const vectors = [
    [null, 'html'],
    ['text/html', 'html'],
    ['text/markdown', 'markdown'],
    ['text/markdown, */*;q=0.5', 'markdown'],
    ['text/html;q=1, text/markdown;q=0.8', 'html'],
    ['text/html;q=0, text/markdown;q=1', 'markdown'],
    ['text/*', 'html'],
    ['*/*', 'html'],
    ['text/html;q=0, text/markdown;q=0', null],
    ['application/json', null],
    ['text/markdown;q=0, */*;q=1', 'html'],
    ['not a media range, text/html', 'html'],
    ['not a media range', null],
    ['text/markdown;foo=', null],
    ['text/markdown;foo="unterminated', null],
    ['text/html, text/markdown;foo="unterminated', 'html'],
    ['text/markdown;foo="unterminated, text/html', 'html'],
    ['text/markdown;charset=iso-8859-1, text/html;q=0.5', 'html'],
    ['text/markdown;charset=utf-8, text/html;q=0.5', 'markdown'],
    ['text/markdown;q=1;charset=iso-8859-1, text/html;q=0.5', 'html'],
    ['text/markdown;q=1;charset=utf-8, text/html;q=0.5', 'markdown'],
    ['text/markdown;charset =utf-8, text/html;q=0.5', 'html'],
    ['text/markdown;;q=1, text/html;q=0.5', 'markdown'],
    ['text/markdown;q=1;foo, text/html;q=0.5', 'html'],
  ]

  for (const [accept, expected] of vectors) {
    assert.equal(negotiateRepresentation(accept), expected, accept ?? '<missing>')
  }
})
