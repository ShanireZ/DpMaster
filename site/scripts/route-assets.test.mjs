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
    'src/components/art/families/backpack.tsx',
  ])
  assert.deepEqual(routeModuleIds('/part/a'), [
    'src/pages/PartPage.tsx',
    'src/components/art/families/backpack.tsx',
  ])
  assert.deepEqual(routeModuleIds('/part/b/lis'), [
    'src/pages/TypePage.tsx',
    'src/content/b/LIS.tsx',
    'src/components/art/families/linear.tsx',
  ])
  assert.deepEqual(routeModuleIds('/part/b'), [
    'src/pages/PartPage.tsx',
    'src/components/art/families/linear.tsx',
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
    'src/components/art/families/backpack.tsx': {
      file: 'assets/family-a.js',
      css: ['assets/family-a.css'],
      imports: ['src/shared.ts'],
    },
    'src/content/b/LIS.tsx': {
      file: 'assets/lesson-lis.js',
      css: ['assets/lesson-lis.css'],
      imports: ['src/shared.ts'],
    },
    'src/components/art/families/linear.tsx': {
      file: 'assets/family-b.js',
      css: ['assets/family-b.css'],
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
  assert.match(links, /assets\/family-a\.css/)
  assert.match(links, /assets\/shared\.css/)
  assert.equal((links.match(/data-dp-route-css/g) || []).length, 4)

  const assets = renderRouteAssetLinks(manifest, '/part/a/01')
  assert.equal((assets.match(/data-dp-route-module/g) || []).length, 4)
  assert.match(assets, /assets\/lesson-01\.js/)
  assert.match(assets, /assets\/family-a\.js/)

  const linearLinks = renderRouteCssLinks(manifest, '/part/b/lis')
  assert.match(linearLinks, /assets\/lesson-lis\.css/)
  assert.match(linearLinks, /assets\/family-b\.css/)

  const linearAssets = renderRouteAssetLinks(manifest, '/part/b/lis')
  assert.match(linearAssets, /assets\/lesson-lis\.js/)
  assert.match(linearAssets, /assets\/family-b\.js/)
})
