import assert from 'node:assert/strict'
import test from 'node:test'

import { PUBLIC_PATHS } from '../src/lib/publicRoutes.ts'
import {
  semanticRouteFiles,
  semanticSourceForDigest,
} from './semantic-source-graph.mjs'

test('lesson evidence follows the full static semantic dependency graph', () => {
  const files = new Set(semanticRouteFiles('/part/a/01'))

  for (const file of [
    'site/src/entry-server.tsx',
    'site/src/app/StaticApp.tsx',
    'site/src/app/AppContent.tsx',
    'site/src/app/StaticLessonContentContext.tsx',
    'site/src/components/art/StaticFamilyArtContext.tsx',
    'site/src/components/layout/Shell.tsx',
    'site/src/components/layout/RouteStage.tsx',
    'site/src/config/site.ts',
    'site/src/lib/pageMeta.ts',
    'site/src/lib/seoHead.ts',
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
  assert.equal(files.has('site/src/components/feedback/FeedbackWidget.tsx'), false)
  assert.equal(files.has('site/src/components/layout/Sidebar.tsx'), false)
  assert.equal(files.has('site/src/components/layout/TopBar.tsx'), false)
  assert.equal(files.has('site/src/theme/ThemeContext.tsx'), false)
  assert.equal(files.has('site/src/analytics/index.ts'), false)
  assert.equal(files.has('site/src/analytics/AnalyticsRouteTracker.tsx'), false)
  assert.equal(files.has('site/src/analytics/AnalyticsRuntime.tsx'), false)
})

test('home evidence includes semantic content and excludes its motion-only controller', () => {
  const files = new Set(semanticRouteFiles('/'))

  assert.ok(files.has('site/src/pages/Home.tsx'))
  assert.ok(files.has('site/src/components/PartGlyph.tsx'))
  assert.equal(files.has('site/src/pages/HomeMotionController.tsx'), false)
  assert.equal(files.has('site/src/pages/TypePage.tsx'), false)
})

test('all public route evidence excludes non-semantic client branches', () => {
  const forbiddenFiles = new Set([
    'site/src/components/feedback/FeedbackWidget.tsx',
    'site/src/components/layout/ErrorBoundary.tsx',
    'site/src/components/layout/Sidebar.tsx',
    'site/src/components/layout/TopBar.tsx',
    'site/src/components/seo/RouteMeta.tsx',
    'site/src/lib/hashNavigation.ts',
    'site/src/pages/HomeMotionController.tsx',
    'site/src/theme/ThemeContext.tsx',
  ])
  for (const pathname of PUBLIC_PATHS) {
    const files = semanticRouteFiles(pathname)
    assert.equal(
      files.some((file) => (
        forbiddenFiles.has(file) || file.startsWith('site/src/analytics/')
      )),
      false,
      pathname,
    )
  }
})

test('mixed shell modules hash only their semantic rendering slice', () => {
  const shellBefore = `useEffect(() => first())\n<main id="main-content"><RouteStage /></main>`
  const shellAfterClientChange = `useEffect(() => second())\n<main id="main-content"><RouteStage /></main>`
  const shellAfterSemanticChange = `useEffect(() => second())\n<main id="main-content"><RouteStage /><p>正文</p></main>`

  assert.equal(
    semanticSourceForDigest('site/src/components/layout/Shell.tsx', shellBefore),
    semanticSourceForDigest('site/src/components/layout/Shell.tsx', shellAfterClientChange),
  )
  assert.notEqual(
    semanticSourceForDigest('site/src/components/layout/Shell.tsx', shellBefore),
    semanticSourceForDigest('site/src/components/layout/Shell.tsx', shellAfterSemanticChange),
  )

  assert.equal(
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      '<AnalyticsRuntime /><Routes><Route /></Routes>',
    ),
    '<Routes><Route /></Routes>',
  )
  assert.equal(
    semanticSourceForDigest(
      'site/src/components/layout/RouteStage.tsx',
      'useEffect(() => clientOnly())\n<motion.div>{outlet}</motion.div>',
    ),
    '<motion.div>{outlet}</motion.div>',
  )
  assert.throws(
    () => semanticSourceForDigest('site/src/components/layout/Shell.tsx', '<div />'),
    /Missing semantic source slice/,
  )
})
