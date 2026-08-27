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
  ]

  for (const [accept, expected] of vectors) {
    assert.equal(negotiateRepresentation(accept), expected, accept ?? '<missing>')
  }
})
