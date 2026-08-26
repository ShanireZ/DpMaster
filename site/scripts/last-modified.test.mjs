import assert from 'node:assert/strict'
import test from 'node:test'

import {
  normalizeContentForDigest,
  resolveContentLastModified,
  semanticProjectionChanged,
} from './last-modified.mjs'

test('semantic digests ignore checkout-specific CRLF conversion', () => {
  assert.equal(
    normalizeContentForDigest('first\r\nsecond\r\n'),
    normalizeContentForDigest('first\nsecond\n'),
  )
})

test('a changed semantic digest requires source-backed lastmod evidence', () => {
  assert.throws(
    () => (
    resolveContentLastModified({
      previousDigest: 'old-digest',
      currentDigest: 'new-digest',
      previousLastModified: '2026-08-26',
      candidateLastModified: '2026-08-26',
    })
    ),
    /changed without lastmod advancing/,
  )
  assert.throws(
    () => resolveContentLastModified({
      previousDigest: 'old-digest',
      currentDigest: 'new-digest',
      previousLastModified: '2026-08-26T10:00:00.000Z',
      candidateLastModified: '2026-08-25T10:00:00.000Z',
    }),
    /changed without lastmod advancing/,
  )
  assert.equal(
    resolveContentLastModified({
      previousDigest: 'new-digest',
      currentDigest: 'new-digest',
      previousLastModified: '2026-08-26T02:29:00.000Z',
      candidateLastModified: '2026-08-27T01:00:00.000Z',
    }),
    '2026-08-26T02:29:00.000Z',
  )
  assert.equal(
    resolveContentLastModified({
      previousDigest: 'old-digest',
      currentDigest: 'new-digest',
      previousLastModified: '2026-08-25',
      candidateLastModified: '2026-08-26T02:29:00.000Z',
    }),
    '2026-08-26T02:29:00.000Z',
  )
  assert.equal(
    resolveContentLastModified({
      previousDigest: 'old-schema-digest',
      currentDigest: 'new-schema-digest',
      previousLastModified: '2026-08-26T02:29:00.000Z',
      candidateLastModified: '2026-08-26T02:29:00.000Z',
      evidenceSchemaChanged: true,
    }),
    '2026-08-26T02:29:00.000Z',
  )
  assert.equal(
    resolveContentLastModified({
      previousDigest: 'old-schema-digest',
      currentDigest: 'new-schema-and-content-digest',
      previousLastModified: '2026-08-26T02:29:00.000Z',
      candidateLastModified: '2026-08-26T03:29:00.000Z',
      evidenceSchemaChanged: true,
      hasSemanticContentChange: false,
    }),
    '2026-08-26T02:29:00.000Z',
  )
  assert.equal(
    resolveContentLastModified({
      previousDigest: 'old-schema-digest',
      currentDigest: 'new-schema-and-content-digest',
      previousLastModified: '2026-08-26T02:29:00.000Z',
      candidateLastModified: '2026-08-26T03:29:00.000Z',
      evidenceSchemaChanged: true,
      hasSemanticContentChange: true,
    }),
    '2026-08-26T03:29:00.000Z',
  )
})

test('schema migrations distinguish pruned client edits from semantic edits', () => {
  const before = `import { useEffect } from 'react'\nfunction AppContent() { useEffect(() => first()); return <Routes><p>正文一</p></Routes> }`
  assert.equal(
    semanticProjectionChanged(
      'site/src/app/AppContent.tsx',
      before.replace('first()', 'second()'),
      before,
    ),
    false,
  )
  assert.equal(
    semanticProjectionChanged(
      'site/src/app/AppContent.tsx',
      before.replace('正文一', '正文二'),
      before,
    ),
    true,
  )
})
