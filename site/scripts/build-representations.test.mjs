import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'

import { checkMarkdownRepresentations } from './check-html.mjs'
import { renderMarkdownRepresentation } from './markdown-representation.mjs'

function write(root, relative, content) {
  const path = join(root, relative)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content, 'utf8')
}

test('the build gate requires one clean and compact Markdown asset per public path', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dpmaster-representations-'))
  try {
    const homeHtml = `<!doctype html><html><head><meta name="abstract" content="首页摘要"></head><body><main><h1>首页</h1><p>正文</p></main><div aria-hidden="true">${'装饰'.repeat(200)}</div></body></html>`
    const partHtml = `<!doctype html><html><head><meta name="abstract" content="背包摘要"></head><body><main><h1>背包</h1><p>正文</p></main><div aria-hidden="true">${'装饰'.repeat(200)}</div></body></html>`
    write(dir, 'index.html', homeHtml)
    write(dir, 'part/a/index.html', partHtml)
    write(
      dir,
      '_representations/markdown/index.md',
      renderMarkdownRepresentation({
        html: homeHtml,
        canonical: 'https://dp.round1.cc/',
        summary: '首页摘要',
      }),
    )
    write(
      dir,
      '_representations/markdown/part/a.md',
      renderMarkdownRepresentation({
        html: partHtml,
        canonical: 'https://dp.round1.cc/part/a',
        summary: '背包摘要',
      }),
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

test('the build gate rejects either side of an HTML and Markdown semantic drift', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dpmaster-representations-'))
  try {
    const canonical = 'https://dp.round1.cc/'
    const summary = '同一内容模型生成的摘要。'
    const originalHtml = `<!doctype html><html><head><meta name="abstract" content="${summary}"></head><body>
      <main><h1>首页</h1><p>原始正文需要与 Markdown 保持一致。</p></main>
      <div aria-hidden="true">${'装饰'.repeat(200)}</div>
    </body></html>`
    write(dir, 'index.html', originalHtml)
    write(
      dir,
      '_representations/markdown/index.md',
      renderMarkdownRepresentation({ html: originalHtml, canonical, summary }),
    )
    assert.equal(checkMarkdownRepresentations({ dir, paths: ['/'] }).ok, true)

    write(
      dir,
      'index.html',
      originalHtml.replace('原始正文需要与 Markdown 保持一致。', '已经改变但 Markdown 没有更新的正文。'),
    )
    const htmlDrift = checkMarkdownRepresentations({ dir, paths: ['/'] })
    assert.equal(htmlDrift.ok, false)
    assert.ok(htmlDrift.errors.some((error) => error.includes('does not match semantic HTML')))

    write(dir, 'index.html', originalHtml)
    write(
      dir,
      '_representations/markdown/index.md',
      renderMarkdownRepresentation({ html: originalHtml, canonical, summary })
        .replace('原始正文', 'Markdown 独有正文'),
    )
    const markdownDrift = checkMarkdownRepresentations({ dir, paths: ['/'] })
    assert.equal(markdownDrift.ok, false)
    assert.ok(markdownDrift.errors.some((error) => error.includes('does not match semantic HTML')))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('the build gate rejects an illegal Markdown heading hierarchy', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dpmaster-representations-'))
  try {
    const canonical = 'https://dp.round1.cc/'
    const html = `<!doctype html><html><head><meta name="abstract" content="摘要"></head><body>
      <main><h1>首页</h1><h3>跳级小节</h3><p>正文</p></main>
      <div aria-hidden="true">${'装饰'.repeat(200)}</div>
    </body></html>`
    write(dir, 'index.html', html)
    write(
      dir,
      '_representations/markdown/index.md',
      renderMarkdownRepresentation({ html, canonical, summary: '摘要' })
        .replace(/^## 跳级小节$/m, '### 跳级小节'),
    )

    const result = checkMarkdownRepresentations({ dir, paths: ['/'] })
    assert.equal(result.ok, false)
    assert.ok(result.errors.some((error) => error.includes('illegal heading hierarchy')))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('the heading gate ignores hash comments inside fenced code', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dpmaster-representations-'))
  try {
    const canonical = 'https://dp.round1.cc/'
    const html = `<!doctype html><html><head><meta name="abstract" content="摘要"></head><body>
      <main><h1>首页</h1><pre><code># 伪代码注释\nvalue = 1</code></pre></main>
      <div aria-hidden="true">${'装饰'.repeat(200)}</div>
    </body></html>`
    write(dir, 'index.html', html)
    write(
      dir,
      '_representations/markdown/index.md',
      renderMarkdownRepresentation({ html, canonical, summary: '摘要' }),
    )

    assert.deepEqual(
      checkMarkdownRepresentations({ dir, paths: ['/'] }),
      { ok: true, markdownFiles: 1, errors: [] },
    )
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('the build gate rejects an unresolved same-origin Markdown link', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dpmaster-representations-'))
  try {
    const canonical = 'https://dp.round1.cc/'
    const html = `<!doctype html><html><head><meta name="abstract" content="摘要"></head><body>
      <main><h1>首页</h1><p><a href="/missing-public">失效入口</a></p></main>
      <div aria-hidden="true">${'装饰'.repeat(200)}</div>
    </body></html>`
    write(dir, 'index.html', html)
    write(
      dir,
      '_representations/markdown/index.md',
      renderMarkdownRepresentation({ html, canonical, summary: '摘要' }),
    )

    const result = checkMarkdownRepresentations({ dir, paths: ['/'] })
    assert.equal(result.ok, false)
    assert.ok(result.errors.some((error) => error.includes('unresolved same-origin link')))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
