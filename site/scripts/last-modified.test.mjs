import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
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

test('binary route dependencies compare their exact bytes', () => {
  assert.equal(
    semanticProjectionChanged(
      'site/src/assets/example.avif',
      Buffer.from([0x80]),
      Buffer.from([0x81]),
    ),
    true,
  )
  assert.equal(
    semanticProjectionChanged(
      'site/src/assets/example.avif',
      Buffer.from([0x80]),
      Buffer.from([0x80]),
    ),
    false,
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

  assert.equal(
    semanticProjectionChanged(
      'site/src/lib/pageMeta.ts',
      `interface Meta { readonly title: string }\nexport const value = '正文'`,
      `interface Meta { title: string }\nexport const value = '正文'`,
    ),
    false,
  )

  const currentSiteConfig = readFileSync(
    new URL('../src/config/site.ts', import.meta.url),
    'utf8',
  )
  const historicalSiteConfig = execFileSync(
    'git',
    // Pin fixture bytes, which remain stable when commit history is rewritten.
    ['cat-file', 'blob', '7f55f11f8edf829a4f454e43ab2dff4fd31a43fa'],
    { encoding: 'utf8', cwd: new URL('../../', import.meta.url) },
  )
  assert.equal(
    semanticProjectionChanged(
      'site/src/config/site.ts',
      currentSiteConfig,
      historicalSiteConfig,
    ),
    false,
  )
})

test('historical client-effect maintenance stays outside public lastmod evidence', () => {
  for (const { file, beforeBlob, afterBlob } of [
    {
      file: 'site/src/components/demos/knapsack/KnapsackDemo.tsx',
      beforeBlob: '4dd89304925cace8f53adc462f09777090309b27',
      afterBlob: 'acb0568b66e7f67dbdc1be880639e01e9207c033',
    },
    {
      file: 'site/src/components/dp-engine/playback/useStepPlayer.ts',
      beforeBlob: '155755143a0c92ac364142938a370f3b7a25b615',
      afterBlob: '8a84a3cae674cb95a208ec56ae991e7432b2a068',
    },
  ]) {
    const before = execFileSync(
      'git',
      ['cat-file', 'blob', beforeBlob],
      { cwd: new URL('../../', import.meta.url), encoding: 'utf8' },
    )
    const after = execFileSync(
      'git',
      ['cat-file', 'blob', afterBlob],
      { cwd: new URL('../../', import.meta.url), encoding: 'utf8' },
    )
    assert.equal(semanticProjectionChanged(file, after, before), false, file)
  }
})
