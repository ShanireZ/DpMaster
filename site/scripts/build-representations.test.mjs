import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'

import { checkMarkdownRepresentations } from './check-html.mjs'

function write(root, relative, content) {
  const path = join(root, relative)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content, 'utf8')
}

test('the build gate requires one clean and compact Markdown asset per public path', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dpmaster-representations-'))
  try {
    write(dir, 'index.html', '<main><h1>首页</h1><p>完整互动页面正文'.repeat(30) + '</p></main>')
    write(dir, 'part/a/index.html', '<main><h1>背包</h1><p>完整互动页面正文'.repeat(30) + '</p></main>')
    write(
      dir,
      '_representations/markdown/index.md',
      '# 首页\n\n正文\n\n---\n\n[在原页面查看完整互动内容](https://dp.round1.cc/)\n',
    )
    write(
      dir,
      '_representations/markdown/part/a.md',
      '# 背包\n\n正文\n\n---\n\n[在原页面查看完整互动内容](https://dp.round1.cc/part/a)\n',
    )

    assert.deepEqual(
      checkMarkdownRepresentations({ dir, paths: ['/', '/part/a'] }),
      { ok: true, markdownFiles: 2, errors: [] },
    )

    write(
      dir,
      '_representations/markdown/part/a.md',
      '# 背包\n\n<script>leak()</script>\n\n/_representations/markdown/secret.md\n',
    )
    const failed = checkMarkdownRepresentations({ dir, paths: ['/', '/part/a'] })
    assert.equal(failed.ok, false)
    assert.ok(failed.errors.some((error) => error.includes('browser-only markup')))
    assert.ok(failed.errors.some((error) => error.includes('internal representation path')))
    assert.ok(failed.errors.some((error) => error.includes('canonical interactive-content link')))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('the build gate rejects missing and unexpected Markdown assets', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dpmaster-representations-'))
  try {
    write(dir, '_representations/markdown/index.md', '# 首页')
    write(dir, '_representations/markdown/private.md', '# 私有页面')

    const result = checkMarkdownRepresentations({ dir, paths: ['/', '/part/a'] })
    assert.equal(result.ok, false)
    assert.ok(result.errors.some((error) => error.includes('missing')))
    assert.ok(result.errors.some((error) => error.includes('unexpected')))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
