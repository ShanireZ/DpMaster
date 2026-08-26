import assert from 'node:assert/strict'
import test from 'node:test'

import { semanticRouteFiles } from './semantic-source-graph.mjs'

test('lesson evidence follows the full static semantic dependency graph', () => {
  const files = new Set(semanticRouteFiles('/part/a/01'))

  for (const file of [
    'site/src/entry-server.tsx',
    'site/src/app/AppContent.tsx',
    'site/src/components/layout/Shell.tsx',
    'site/src/config/site.ts',
    'site/src/pages/TypePage.tsx',
    'site/src/components/PartGlyph.tsx',
    'site/src/content/a/Knapsack01.tsx',
    'site/src/content/a/KnapsackArt.tsx',
    'site/src/components/ui/CodeBlock.tsx',
  ]) {
    assert.ok(files.has(file), file)
  }
  assert.equal(files.has('site/src/pages/Home.tsx'), false)
  assert.equal(files.has('site/src/data/routeLastModified.ts'), false)
})

test('home evidence includes its route-only motion controller', () => {
  const files = new Set(semanticRouteFiles('/'))

  assert.ok(files.has('site/src/pages/Home.tsx'))
  assert.ok(files.has('site/src/pages/HomeMotionController.tsx'))
  assert.equal(files.has('site/src/pages/TypePage.tsx'), false)
})
