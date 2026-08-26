import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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

test('semantic site config contains only public representation inputs', () => {
  const source = readFileSync(
    new URL('../src/config/site.ts', import.meta.url),
    'utf8',
  )
  for (const clientOnlyField of [
    'analyticsEndpoint',
    'feedbackEndpoint',
    'copyrightHolder',
    'slogan',
  ]) {
    assert.doesNotMatch(source, new RegExp(`\\b${clientOnlyField}\\b`))
  }

  for (const pathname of PUBLIC_PATHS) {
    const files = new Set(semanticRouteFiles(pathname))
    assert.equal(files.has('site/src/config/client-runtime.ts'), false, pathname)
    assert.equal(files.has('site/src/config/sidebar-copy.ts'), false, pathname)
  }
})

test('mixed shell modules hash their AST-backed render dependencies', () => {
  const shellBefore = `export default function Shell() {\n  useEffect(() => first())\n  const mainRef = useRef(null)\n  return <main id="main-content" ref={mainRef}><RouteStage /></main>\n}`
  const shellAfterClientChange = `export default function Shell() {\n  useEffect(() => second())\n  const mainRef = useRef(null)\n  return <main id="main-content" ref={mainRef}><RouteStage /></main>\n}`
  const shellAfterSemanticChange = `export default function Shell() {\n  useEffect(() => second())\n  const mainRef = useRef(null)\n  return <main id="main-content" ref={mainRef}><RouteStage /><p>正文</p></main>\n}`

  assert.equal(
    semanticSourceForDigest('site/src/components/layout/Shell.tsx', shellBefore),
    semanticSourceForDigest('site/src/components/layout/Shell.tsx', shellAfterClientChange),
  )
  assert.notEqual(
    semanticSourceForDigest('site/src/components/layout/Shell.tsx', shellBefore),
    semanticSourceForDigest('site/src/components/layout/Shell.tsx', shellAfterSemanticChange),
  )

  const appBefore = `function RouteView({ View }) { return <View /> }\nexport function AppContent({ views }) {\n  const { Home: HomeView } = views\n  return <><AnalyticsRuntime /><Routes><Route element={<RouteView View={HomeView} />} /></Routes></>\n}`
  const appAfterAnalyticsChange = appBefore.replace('AnalyticsRuntime', 'AnalyticsTracker')
  const appAfterContentInjection = appBefore.replace(
    'return <View />',
    'return <><View /><p>正文注入</p></>',
  )
  const appAfterRouteBinding = appBefore.replace('View={HomeView}', 'View={MethodView}')
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', appBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', appAfterAnalyticsChange),
  )
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', appBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', appAfterContentInjection),
  )
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', appBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', appAfterRouteBinding),
  )

  const stageBefore = `const routeEase = [0, 1]\nexport default function RouteStage() {\n  const outlet = useOutlet()\n  const hasMounted = useState(false)[0]\n  useEffect(() => first())\n  return <motion.div initial={hasMounted} transition={routeEase}>{outlet}</motion.div>\n}`
  const stageAfterClientChange = stageBefore.replace('first()', 'second()')
  const stageAfterOutletChange = stageBefore.replace('useOutlet()', '<p>替换正文</p>')
  assert.equal(
    semanticSourceForDigest('site/src/components/layout/RouteStage.tsx', stageBefore),
    semanticSourceForDigest('site/src/components/layout/RouteStage.tsx', stageAfterClientChange),
  )
  assert.notEqual(
    semanticSourceForDigest('site/src/components/layout/RouteStage.tsx', stageBefore),
    semanticSourceForDigest('site/src/components/layout/RouteStage.tsx', stageAfterOutletChange),
  )
  assert.throws(
    () => semanticSourceForDigest(
      'site/src/components/layout/Shell.tsx',
      'export default function Shell() { return <div /> }',
    ),
    /Expected one semantic JSX root/,
  )
})

test('mixed-module closure follows lexical symbols instead of bare names', () => {
  const shadowBefore = `const label = '正文一'\nfunction AppContent() { return <Routes>{label}</Routes> }\nfunction clientOnly() { const label = '客户端一'; return label }`
  const shadowAfterSemanticChange = shadowBefore.replace('正文一', '正文二')
  const shadowAfterClientChange = shadowBefore.replace('客户端一', '客户端二')
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', shadowBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', shadowAfterSemanticChange),
  )
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', shadowBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', shadowAfterClientChange),
  )

  const classBefore = `class RouteLabel { static value = '正文一' }\nfunction AppContent() { return <Routes>{RouteLabel.value}</Routes> }`
  const classAfter = classBefore.replace('正文一', '正文二')
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', classBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', classAfter),
  )

  const assignmentBefore = `let label\nlabel = '正文一'\nfunction AppContent() { return <Routes>{label}</Routes> }`
  const assignmentAfter = assignmentBefore.replace('正文一', '正文二')
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', assignmentBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', assignmentAfter),
  )

  const attributeBefore = `const path = '客户端一'\nfunction AppContent() { return <Routes path="/fixed" /> }`
  const attributeAfter = attributeBefore.replace('客户端一', '客户端二')
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', attributeBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', attributeAfter),
  )
})
