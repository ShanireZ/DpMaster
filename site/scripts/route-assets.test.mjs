import assert from 'node:assert/strict'
import test from 'node:test'
import {
  renderRouteAssetLinks,
  renderRouteCssLinks,
  routeModuleIds,
} from './route-assets.mjs'

test('lesson routes map to the shell page chunk and their exact content chunk', () => {
  assert.deepEqual(routeModuleIds('/part/a/01'), [
    'src/pages/TypePage.tsx',
    'src/content/a/Knapsack01.tsx',
  ])
  assert.deepEqual(routeModuleIds('/problems'), ['src/pages/ProblemsPage.tsx'])
})

test('route CSS links include page, content, and imported shared CSS before hydration', () => {
  const manifest = {
    'src/pages/TypePage.tsx': {
      file: 'assets/type.js',
      css: ['assets/type.css'],
      imports: ['src/shared.ts'],
    },
    'src/content/a/Knapsack01.tsx': {
      file: 'assets/lesson-01.js',
      css: ['assets/lesson-01.css'],
      imports: ['src/shared.ts'],
    },
    'src/shared.ts': {
      file: 'assets/shared.js',
      css: ['assets/shared.css'],
    },
  }
  const links = renderRouteCssLinks(manifest, '/part/a/01')

  assert.match(links, /assets\/type\.css/)
  assert.match(links, /assets\/lesson-01\.css/)
  assert.match(links, /assets\/shared\.css/)
  assert.equal((links.match(/data-dp-route-css/g) || []).length, 3)

  const assets = renderRouteAssetLinks(manifest, '/part/a/01')
  assert.equal((assets.match(/data-dp-route-module/g) || []).length, 3)
  assert.match(assets, /assets\/lesson-01\.js/)
})
