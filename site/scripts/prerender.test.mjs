import assert from 'node:assert/strict'
import test from 'node:test'
import { settleSuspenseMarkup } from './prerender.mjs'

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
