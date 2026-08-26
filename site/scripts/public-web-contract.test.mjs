import assert from 'node:assert/strict'
import test from 'node:test'

import baseline from '../baseline.config.json' with { type: 'json' }
import {
  CONTENT_SIGNAL_HEADER,
  markdownAssetPath,
  markdownAssetRelativePath,
  PUBLIC_CONTENT_SIGNAL,
} from '../src/lib/publicWebContract.ts'

test('one public-Web contract owns the content signal and Markdown asset mapping', () => {
  assert.deepEqual(
    PUBLIC_CONTENT_SIGNAL,
    baseline.markdownNegotiation.contentSignal,
  )
  assert.equal(CONTENT_SIGNAL_HEADER, 'ai-train=yes, search=yes, ai-input=yes')
  assert.equal(markdownAssetPath('/'), '/_representations/markdown/index.md')
  assert.equal(markdownAssetRelativePath('/'), '_representations/markdown/index.md')
  assert.equal(
    markdownAssetPath('/part/a/01'),
    '/_representations/markdown/part/a/01.md',
  )
  assert.equal(
    markdownAssetRelativePath('/part/a/01'),
    '_representations/markdown/part/a/01.md',
  )
})
