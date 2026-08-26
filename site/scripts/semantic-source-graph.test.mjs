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

  const conditionalBefore = `function AppContent() { let label = '正文'; const enabled = true; if (enabled) label = '条件正文'; return <Routes>{label}</Routes> }`
  const conditionalAfter = conditionalBefore.replace('enabled = true', 'enabled = false')
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', conditionalBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', conditionalAfter),
  )

  const effectBefore = `import { useEffect } from 'react'\nfunction AppContent() { let label = '正文'; useEffect(() => { label = '客户端一' }, []); return <Routes>{label}</Routes> }`
  const effectAfter = effectBefore.replace('客户端一', '客户端二')
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', effectBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', effectAfter),
  )

  const ambiguousHelperWrite = `let label = '正文'\nfunction prepare() { label = '变化' }\nfunction AppContent() { prepare(); return <Routes>{label}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      ambiguousHelperWrite,
    ),
    /Unsupported nested semantic write to label/,
  )

  const attributeBefore = `const path = '客户端一'\nfunction AppContent() { return <Routes path="/fixed" /> }`
  const attributeAfter = attributeBefore.replace('客户端一', '客户端二')
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', attributeBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', attributeAfter),
  )

  const loopBefore = `const label = '正文'\nfor (const label of ['客户端一']) consume(label)\nfunction AppContent() { return <Routes>{label}</Routes> }`
  const loopAfter = loopBefore.replace('客户端一', '客户端二')
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', loopBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', loopAfter),
  )

  const switchBefore = `const label = '正文'\nswitch (mode) { case 1: const label = '客户端一'; consume(label) }\nfunction AppContent() { return <Routes>{label}</Routes> }`
  const switchAfter = switchBefore.replace('客户端一', '客户端二')
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', switchBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', switchAfter),
  )

  const fieldBefore = `const value = '客户端一'\nclass RouteLabel { static value = '正文' }\nfunction AppContent() { return <Routes>{RouteLabel.value}</Routes> }`
  const fieldAfterClientChange = fieldBefore.replace('客户端一', '客户端二')
  const fieldAfterSemanticChange = fieldBefore.replace("static value = '正文'", "static value = '正文二'")
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', fieldBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', fieldAfterClientChange),
  )
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', fieldBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', fieldAfterSemanticChange),
  )

  const staticBlockBefore = `const label = '正文一'\nclass RouteLabel { static value = label; static { const label = '客户端' } }\nfunction AppContent() { return <Routes>{RouteLabel.value}</Routes> }`
  const staticBlockAfter = staticBlockBefore.replace('正文一', '正文二')
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', staticBlockBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', staticBlockAfter),
  )

  const importBefore = `import { ViewA as View } from './views'\nfunction AppContent() { return <Routes><View /></Routes> }`
  const importAfter = importBefore.replace('ViewA as View', 'ViewB as View')
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', importBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', importAfter),
  )

  const typeSiblingBefore = `import { Suspense, type ComponentType } from 'react'\nfunction AppContent() { return <Routes><Suspense /></Routes> }`
  const typeSiblingAfter = typeSiblingBefore.replace('ComponentType', 'OtherType')
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', typeSiblingBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', typeSiblingAfter),
  )

  const runtimeSiblingBefore = `import { View, clientHelper } from './views'\nfunction AppContent() { return <Routes><View /></Routes> }`
  const runtimeSiblingAfter = runtimeSiblingBefore.replace('clientHelper', 'otherHelper')
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', runtimeSiblingBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', runtimeSiblingAfter),
  )

  const staticVarBefore = `const label = '正文'\nclass ClientOnly { static { var label = '客户端一' } }\nfunction AppContent() { return <Routes>{label}</Routes> }`
  const staticVarAfter = staticVarBefore.replace('客户端一', '客户端二')
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', staticVarBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', staticVarAfter),
  )
})

test('mixed-module closure tracks every supported mutation of selected bindings', () => {
  const forOfBefore = `function AppContent() { let label = '正文'; for (label of ['循环一']) {} return <Routes>{label}</Routes> }`
  const forOfAfter = forOfBefore.replace('循环一', '循环二')
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', forOfBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', forOfAfter),
  )

  const forInBefore = `function AppContent() { let label = '正文'; for (label in { 键一: true }) {} return <Routes>{label}</Routes> }`
  const forInAfter = forInBefore.replace('键一', '键二')
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', forInBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', forInAfter),
  )

  const deleteBefore = `const state = { value: '正文' }\nfunction AppContent() { delete state.value; return <Routes>{state.value}</Routes> }`
  const deleteAfter = deleteBefore.replace('delete state.value', 'delete state.other')
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', deleteBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', deleteAfter),
  )

  const pushBefore = `const items = []\nfunction AppContent() { items.push('正文一'); return <Routes>{items.join(',')}</Routes> }`
  const pushAfter = pushBefore.replace('正文一', '正文二')
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', pushBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', pushAfter),
  )

  const assignBefore = `const state = {}\nfunction AppContent() { Object.assign(state, { value: '正文一' }); return <Routes>{state.value}</Routes> }`
  const assignAfter = assignBefore.replace('正文一', '正文二')
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', assignBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', assignAfter),
  )

  const typedAssignmentBefore = `const state = { value: '正文' }\nfunction AppContent() { (state as { value: string }).value = '正文一'; return <Routes>{state.value}</Routes> }`
  const typedAssignmentAfter = typedAssignmentBefore.replace('正文一', '正文二')
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', typedAssignmentBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', typedAssignmentAfter),
  )

  const aliasBefore = `const state = { value: '正文' }\nconst alias = state\nfunction AppContent() { alias.value = '正文一'; return <Routes>{state.value}</Routes> }`
  const aliasAfter = aliasBefore.replace('正文一', '正文二')
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', aliasBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', aliasAfter),
  )

  const destructuredAliasBefore = `const state = { nested: { value: '正文' } }\nconst { nested: alias } = state\nfunction AppContent() { alias.value = '正文一'; return <Routes>{state.nested.value}</Routes> }`
  const destructuredAliasAfter = destructuredAliasBefore.replace('正文一', '正文二')
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', destructuredAliasBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', destructuredAliasAfter),
  )

  const aliasRebindBefore = `const state = { value: '正文' }\nlet alias = state\nfunction AppContent() { alias = { value: '客户端一' }; return <Routes>{state.value}</Routes> }`
  const aliasRebindAfter = aliasRebindBefore.replace('客户端一', '客户端二')
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', aliasRebindBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', aliasRebindAfter),
  )

  const unstableAlias = `const state = { value: '正文' }\nlet alias\nalias = state\nfunction AppContent() { alias.value = '变化'; return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', unstableAlias),
    /Unsupported ambiguous mutation of state/,
  )

  const reboundAliasMutation = `const state = { value: '正文' }\nlet alias = state\nalias = { value: '其他' }\nfunction AppContent() { alias.value = '变化'; return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', reboundAliasMutation),
    /Unsupported ambiguous mutation of state/,
  )

  for (const target of [
    'true ? state : other',
    'state || other',
    'other, state',
  ]) {
    const expressionBefore = `const state = { value: '正文' }\nconst other = { value: '其他' }\nfunction AppContent() { (${target}).value = '正文一'; return <Routes>{state.value}</Routes> }`
    const expressionAfter = expressionBefore.replace('正文一', '正文二')
    assert.notEqual(
      semanticSourceForDigest('site/src/app/AppContent.tsx', expressionBefore),
      semanticSourceForDigest('site/src/app/AppContent.tsx', expressionAfter),
      target,
    )
  }

  const ambiguousReceiverCall = `const state = { value: '正文' }\nfunction AppContent() { state.inspect(); return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', ambiguousReceiverCall),
    /Unsupported ambiguous mutation of state/,
  )


  const ambiguousArgumentCall = `const state = { value: '正文' }\nfunction mutate(value) { value.value = '变化' }\nfunction AppContent() { mutate(state); return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', ambiguousArgumentCall),
    /Unsupported ambiguous mutation of state/,
  )

  const importedClosureCall = `import { state, prepare } from './store'\nfunction AppContent() { prepare(); return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', importedClosureCall),
    /Unsupported ambient mutation from prepare/,
  )

  const customNamedMutator = `const state = { value: '正文' }\nconst mutator = { set(target, value) { target.value = value } }\nfunction AppContent() { mutator.set(state, '正文一'); return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', customNamedMutator),
    /Unsupported ambiguous mutation of state/,
  )

  const shadowedObjectMutator = `const state = { value: '正文' }\nconst Object = { assign(target, source) { target.value = source.value } }\nfunction AppContent() { Object.assign(state, { value: '正文一' }); return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', shadowedObjectMutator),
    /Unsupported ambiguous mutation of state/,
  )
})

test('mixed-module closure recognizes React effects by import provenance', () => {
  for (const hook of ['useEffect', 'useLayoutEffect', 'useInsertionEffect']) {
    const before = `import { ${hook} as afterRender } from 'react'\nfunction AppContent() { let label = '正文'; afterRender(() => { label = '客户端一' }, []); return <Routes>{label}</Routes> }`
    const after = before.replace('客户端一', '客户端二')
    assert.equal(
      semanticSourceForDigest('site/src/app/AppContent.tsx', before),
      semanticSourceForDigest('site/src/app/AppContent.tsx', after),
      hook,
    )
  }

  const namespaceBefore = `import * as React from 'react'\nfunction AppContent() { let label = '正文'; React.useEffect(() => { label = '客户端一' }, []); return <Routes>{label}</Routes> }`
  const namespaceAfter = namespaceBefore.replace('客户端一', '客户端二')
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', namespaceBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', namespaceAfter),
  )

  const defaultBefore = `import React from 'react'\nfunction AppContent() { let label = '正文'; React.useLayoutEffect(() => { label = '客户端一' }, []); return <Routes>{label}</Routes> }`
  const defaultAfter = defaultBefore.replace('客户端一', '客户端二')
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', defaultBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', defaultAfter),
  )

  const fakeLocalHook = `function useEffect(callback) { callback() }\nfunction AppContent() { let label = '正文'; useEffect(() => { label = '同步变化' }); return <Routes>{label}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', fakeLocalHook),
    /Unsupported nested semantic write to label/,
  )

  const fakeMemberHook = `const scheduler = { useEffect(callback) { callback() } }\nfunction AppContent() { let label = '正文'; scheduler.useEffect(() => { label = '同步变化' }); return <Routes>{label}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', fakeMemberHook),
    /Unsupported nested semantic write to label/,
  )

  const shadowedReactHook = `import { useEffect } from 'react'\nfunction AppContent() { function useEffect(callback) { callback() } let label = '正文'; useEffect(() => { label = '同步变化' }); return <Routes>{label}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', shadowedReactHook),
    /Unsupported nested semantic write to label/,
  )
})

test('switch discriminants resolve outside the switch lexical scope', () => {
  const before = `function AppContent() { const mode = '外层一'; let label = '正文'; switch (mode) { case 'x': const mode = '分支'; label = mode } return <Routes>{label}</Routes> }`
  const after = before.replace('外层一', '外层二')
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', before),
    semanticSourceForDigest('site/src/app/AppContent.tsx', after),
  )
})
