import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { settleSuspenseMarkup } from './prerender.mjs'

test('the prerenderer never injects a Web Analytics beacon', async () => {
  // Cloudflare 代理自动注入 Web Analytics / RUM。预渲染再手工塞一份 beacon
  // 会让同一次浏览重复统计，所以这条路必须从源头上不存在。
  const source = await readFile(new URL('./prerender.mjs', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /cloudflareinsights/)
  assert.doesNotMatch(source, /data-cf-beacon/)
})

test('settleSuspenseMarkup replaces streamed fallbacks with final hydration markup', () => {
  const markup = [
    '<main>',
    '<!--$?--><template id="B:0"></template><div aria-busy="true">loading</div><!--/$-->',
    '</main>',
    '<script>requestAnimationFrame(function(){})</script>',
    '<div hidden id="S:0"><section><h2>ready</h2></section></div>',
    '<script>$RB=[]</script>',
  ].join('')

  const settled = settleSuspenseMarkup(markup)
  assert.match(settled, /<main><!--\$--><section><h2>ready<\/h2><\/section><!--\/\$--><\/main>/)
  assert.doesNotMatch(settled, /loading|B:0|S:0|<script|\$\?/)
})
