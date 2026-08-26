import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveContentLastModified } from './last-modified.mjs'

test('a changed semantic digest always advances lastmod without destabilizing reruns', () => {
  const now = new Date('2026-08-26T02:30:00.000Z')

  assert.equal(
    resolveContentLastModified({
      previousDigest: 'old-digest',
      currentDigest: 'new-digest',
      previousLastModified: '2026-08-26',
      candidateLastModified: '2026-08-26',
      now,
    }),
    '2026-08-26T02:30:00.000Z',
  )
  assert.equal(
    resolveContentLastModified({
      previousDigest: 'new-digest',
      currentDigest: 'new-digest',
      previousLastModified: '2026-08-26T02:30:00.000Z',
      candidateLastModified: '2026-08-27',
      now: new Date('2026-08-27T01:00:00.000Z'),
    }),
    '2026-08-26T02:30:00.000Z',
  )
  assert.equal(
    resolveContentLastModified({
      previousDigest: 'old-digest',
      currentDigest: 'new-digest',
      previousLastModified: '2026-08-25',
      candidateLastModified: '2026-08-26',
      now,
    }),
    '2026-08-26',
  )
})
