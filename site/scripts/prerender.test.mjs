import assert from 'node:assert/strict'
import test from 'node:test'
import { SITE_CONFIGS } from '../src/config/site.ts'
import { renderStaticWebAnalytics, settleSuspenseMarkup } from './prerender.mjs'

const webAnalyticsSnippet =
  '<!-- Cloudflare Web Analytics --><script type=\'module\' src=\'https://static.cloudflareinsights.com/beacon.min.js\' data-cf-beacon=\'{"token": "c113fb69d7e84d38a645c5160f6f1bda"}\'></script><!-- End Cloudflare Web Analytics -->'

test('EdgeOne receives the exact static Cloudflare Web Analytics snippet', () => {
  assert.equal(renderStaticWebAnalytics(SITE_CONFIGS.china), webAnalyticsSnippet)
  assert.equal(renderStaticWebAnalytics(SITE_CONFIGS.international), '')
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
