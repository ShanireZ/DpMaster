import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { settleSuspenseMarkup } from './prerender.mjs'

test('the prerenderer never injects a Web Analytics beacon', async () => {
  // Cloudflare 代理自動注入 Web Analytics / RUM。預繪製再手動塞一份 beacon
  // 會讓同一次瀏覽重複統計，所以這條路必須從源頭上不存在。
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
