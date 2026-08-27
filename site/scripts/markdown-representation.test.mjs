import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import {
  renderMarkdownRepresentation,
  writeMarkdownRepresentation,
} from './markdown-representation.mjs'

test('the Markdown renderer preserves semantic content and removes browser-only noise', () => {
  const html = `<!doctype html><html><body>
    <nav>重复导航</nav>
    <main>
      <h1>01 背包</h1>
      <p>先看 <strong>取或不取</strong>，再读 <code>f[j]</code>。</p>
      <span class="katex"><annotation encoding="application/x-tex">f[j]=\\max(f[j], f[j-w]+v)</annotation></span>
      <figure><svg role="img" aria-label="容量状态图"></svg><figcaption>容量从小到大排列。</figcaption></figure>
      <table><thead><tr><th>容量</th><th>价值</th></tr></thead><tbody><tr><td>3</td><td>5</td></tr></tbody></table>
      <pre><code>#include &lt;iostream&gt;\nint main() {}</code></pre>
      <p><a href="/problems?q=背包">打开题目索引</a></p>
      <button>播放</button><input value="secret"><script>leak()</script>
    </main>
  </body></html>`

  const markdown = renderMarkdownRepresentation({
    html,
    canonical: 'https://dp.round1.cc/part/a/01',
    summary: '用一维逆推理解每件物品只能取一次。',
  })

  assert.match(markdown, /^# 01 背包/m)
  assert.match(markdown, /> 用一维逆推理解每件物品只能取一次。/)
  assert.match(markdown, /\*\*取或不取\*\*/)
  assert.match(markdown, /`f\[j\]`/)
  assert.match(markdown, /\$f\[j\]=\\max\(f\[j\], f\[j-w\]\+v\)\$/)
  assert.match(markdown, /> 图示：容量状态图。容量从小到大排列。/)
  assert.match(markdown, /\| 容量 \| 价值 \|/)
  assert.match(markdown, /```cpp\n#include <iostream>/)
  assert.match(markdown, /\[打开题目索引\]\(https:\/\/dp\.round1\.cc\/problems\?q=/)
  assert.match(markdown, /\[在原页面查看完整互动内容\]\(https:\/\/dp\.round1\.cc\/part\/a\/01\)/)
  assert.doesNotMatch(markdown, /重复导航|播放|secret|leak\(\)|<script|<input|<button/)
})

test('a route writes its Markdown representation only under the internal asset prefix', () => {
  const outDir = mkdtempSync(join(tmpdir(), 'dpmaster-markdown-'))
  try {
    const relative = writeMarkdownRepresentation({
      outDir,
      pathname: '/part/a/01',
      html: '<main><h1>01 背包</h1><p>正文</p></main>',
      canonical: 'https://dp.round1.cc/part/a/01',
      summary: '摘要',
    })

    assert.equal(relative, '_representations/markdown/part/a/01.md')
    assert.match(readFileSync(join(outDir, relative), 'utf8'), /^> 摘要\n\n# 01 背包/m)
  } finally {
    rmSync(outDir, { recursive: true, force: true })
  }
})

test('the Markdown projection normalizes skipped HTML heading levels', () => {
  const markdown = renderMarkdownRepresentation({
    html: '<main><h1>方法论</h1><h2>前提</h2><h4>最优子结构</h4><h2>步骤</h2><h5>状态</h5></main>',
    canonical: 'https://dp.round1.cc/method',
    summary: '',
  })

  assert.match(markdown, /^# 方法论$/m)
  assert.match(markdown, /^## 前提$/m)
  assert.match(markdown, /^### 最优子结构$/m)
  assert.match(markdown, /^## 步骤$/m)
  assert.match(markdown, /^### 状态$/m)
  assert.doesNotMatch(markdown, /^####/m)
})
