import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { PUBLIC_PATHS } from '../src/lib/publicRoutes.ts'
import {
  semanticRouteFiles,
  semanticSourceForDigest,
  staticImportSpecifiersForSource,
} from './semantic-source-graph.mjs'

function publicConfigSource(prefix, brandProperties) {
  return `${prefix}\nexport const BRAND = Object.freeze({ ${brandProperties}, subtitle: 'DP Master', owner: 'AzureL蔚澜算法' })\nexport const SITE = Object.freeze({ origin: 'https://dp.round1.cc', language: 'zh-Hans' })\nexport const SITE_ORIGIN = SITE.origin`
}

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

  for (const [before, after] of [
    [
      publicConfigSource(`const BRAND_NAME = '一'`, 'name: BRAND_NAME'),
      publicConfigSource(`const BRAND_NAME = '二'`, 'name: BRAND_NAME'),
    ],
    [
      publicConfigSource(`const shared = { name: '一' }`, '...shared'),
      publicConfigSource(`const shared = { name: '二' }`, '...shared'),
    ],
    [
      publicConfigSource(`const key = 'name'`, `[key]: '一'`),
      publicConfigSource(`const key = 'name'`, `[key]: '二'`),
    ],
  ]) {
    assert.notEqual(
      semanticSourceForDigest('site/src/config/site.ts', before),
      semanticSourceForDigest('site/src/config/site.ts', after),
    )
  }

  assert.throws(
    () => semanticSourceForDigest(
      'site/src/config/site.ts',
      publicConfigSource(`const key = getPublicKey()`, `[key]: '正文'`),
    ),
    /Unsupported public site configuration/,
  )

  for (const mutableConfig of [
    publicConfigSource(`let BRAND_NAME = '一'\nBRAND_NAME = '二'`, 'name: BRAND_NAME'),
    publicConfigSource(
      `const shared = { name: '一' }\nshared.name = '二'`,
      '...shared',
    ),
  ]) {
    assert.throws(
      () => semanticSourceForDigest('site/src/config/site.ts', mutableConfig),
      /Unsupported public site configuration/,
    )
  }
})

test('mixed shell modules hash their AST-backed render dependencies', () => {
  const shellBefore = `import { useEffect, useRef } from 'react'\nexport default function Shell() {\n  useEffect(() => first())\n  const mainRef = useRef(null)\n  return <main id="main-content" ref={mainRef}><RouteStage /></main>\n}`
  const shellAfterClientChange = `import { useEffect, useRef } from 'react'\nexport default function Shell() {\n  useEffect(() => second())\n  const mainRef = useRef(null)\n  return <main id="main-content" ref={mainRef}><RouteStage /></main>\n}`
  const shellAfterSemanticChange = `import { useEffect, useRef } from 'react'\nexport default function Shell() {\n  useEffect(() => second())\n  const mainRef = useRef(null)\n  return <main id="main-content" ref={mainRef}><RouteStage /><p>正文</p></main>\n}`

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

  const stageBefore = `import { useEffect, useState } from 'react'\nconst routeEase = [0, 1]\nexport default function RouteStage() {\n  const outlet = useOutlet()\n  const hasMounted = useState(false)[0]\n  useEffect(() => first())\n  return <motion.div initial={hasMounted} transition={routeEase}>{outlet}</motion.div>\n}`
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

test('runtime AST projection ignores proven client-effect callback bodies', () => {
  const before = `import { useEffect } from 'react'\nexport function Demo({ value }) { useEffect(() => { queueMicrotask(() => sync('客户端一')) }, [value]); return <p>{value}</p> }`
  const afterClientChange = before.replace('客户端一', '客户端二')
  const afterDependencyChange = before.replace('[value]', '[value, enabled]')
  const fakeHookBefore = `function useEffect(callback) { callback() }\nexport function Demo() { useEffect(() => sync('同步一')); return <p>正文</p> }`
  const patchedNamespaceBefore = `import * as React from 'react'\nObject.assign(React, { useEffect: callback => callback() })\nexport function Demo() { React.useEffect(() => sync('同步一')); return <p>正文</p> }`

  assert.equal(
    semanticSourceForDigest('site/src/components/Demo.tsx', before),
    semanticSourceForDigest('site/src/components/Demo.tsx', afterClientChange),
  )
  assert.notEqual(
    semanticSourceForDigest('site/src/components/Demo.tsx', before),
    semanticSourceForDigest('site/src/components/Demo.tsx', afterDependencyChange),
  )
  assert.notEqual(
    semanticSourceForDigest('site/src/components/Demo.tsx', fakeHookBefore),
    semanticSourceForDigest(
      'site/src/components/Demo.tsx',
      fakeHookBefore.replace('同步一', '同步二'),
    ),
  )
  assert.notEqual(
    semanticSourceForDigest('site/src/components/Demo.tsx', patchedNamespaceBefore),
    semanticSourceForDigest(
      'site/src/components/Demo.tsx',
      patchedNamespaceBefore.replace('同步一', '同步二'),
    ),
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
  assert.notEqual(
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      ambiguousHelperWrite,
    ),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      ambiguousHelperWrite.replace('变化', '变化二'),
    ),
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

  const pushBefore = `const items = []\nfunction AppContent() { items.push('正文一'); return <Routes>{items[0]}</Routes> }`
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

  for (const containerBefore of [
    `const state = { value: '正文' }\nconst holder = { current: state }\nfunction AppContent() { holder.current.value = '正文一'; return <Routes>{state.value}</Routes> }`,
    `const state = { value: '正文' }\nconst holder = [state]\nfunction AppContent() { holder[0].value = '正文一'; return <Routes>{state.value}</Routes> }`,
  ]) {
    const containerAfter = containerBefore.replace('正文一', '正文二')
    assert.notEqual(
      semanticSourceForDigest('site/src/app/AppContent.tsx', containerBefore),
      semanticSourceForDigest('site/src/app/AppContent.tsx', containerAfter),
    )
  }

  const lateContainerAlias = `const state = { value: '正文' }\nconst holder = {}\nholder.current = state\nfunction AppContent() { holder.current.value = '变化'; return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', lateContainerAlias),
    /Unsupported ambiguous mutation of state/,
  )

  const spreadCopyBefore = `const state = { value: '正文' }\nconst holder = { current: { ...state } }\nfunction AppContent() { holder.current.value = '副本一'; return <Routes>{state.value}</Routes> }`
  const spreadCopyAfter = spreadCopyBefore.replace('副本一', '副本二')
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', spreadCopyBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', spreadCopyAfter),
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
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', ambiguousArgumentCall),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      ambiguousArgumentCall.replace('变化', '变化二'),
    ),
  )

  const importedClosureCall = `import { state, prepare } from './store'\nfunction AppContent() { prepare(); return <Routes>{state.value}</Routes> }`
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', importedClosureCall),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      importedClosureCall.replace('prepare(); ', ''),
    ),
  )

  for (const [call, importedAliasCall] of [
    ['run(); ', `import { state, prepare } from './store'\nconst run = prepare\nfunction AppContent() { run(); return <Routes>{state.value}</Routes> }`],
    ['prepare(); ', `import { state } from './store'\nimport { prepare } from './store/index'\nfunction AppContent() { prepare(); return <Routes>{state.value}</Routes> }`],
  ]) {
    assert.notEqual(
      semanticSourceForDigest('site/src/app/AppContent.tsx', importedAliasCall),
      semanticSourceForDigest(
        'site/src/app/AppContent.tsx',
        importedAliasCall.replace(call, ''),
      ),
    )
  }

  const importedMemberCall = `import { state, controller } from './store'\nfunction AppContent() { controller.prepare(); return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', importedMemberCall),
    /Unsupported ambiguous mutation of controller/,
  )

  for (const [call, crossModuleCall] of [
    ['prepare(); ', `import { state } from './store'\nimport { prepare } from './prepare'\nfunction AppContent() { prepare(); return <Routes>{state.value}</Routes> }`],
    ['prepare(); ', `import { state } from './store'\nimport { prepare } from './barrel'\nfunction AppContent() { prepare(); return <Routes>{state.value}</Routes> }`],
    ['Reflect.apply(prepare, null, []); ', `import { state, prepare } from './store'\nfunction AppContent() { Reflect.apply(prepare, null, []); return <Routes>{state.value}</Routes> }`],
  ]) {
    assert.notEqual(
      semanticSourceForDigest('site/src/app/AppContent.tsx', crossModuleCall),
      semanticSourceForDigest(
        'site/src/app/AppContent.tsx',
        crossModuleCall.replace(call, ''),
      ),
    )
  }

  const mutatingAssignSource = `const state = { value: '正文', get leak() { this.value = '变化'; return 1 } }\nfunction AppContent() { Object.assign({}, state); return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', mutatingAssignSource),
    /Unsupported ambiguous mutation of state/,
  )

  const proxyTargetBefore = `const state = { value: '正文' }\nfunction AppContent() { new Proxy(state, {}).value = '正文一'; return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', proxyTargetBefore),
    /Unsupported ambiguous mutation of state/,
  )

  const dynamicTarget = `const state = { value: '正文' }\nfunction current() { return state }\nfunction AppContent() { current().value = '变化'; return <Routes>{state.value}</Routes> }`
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', dynamicTarget),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      dynamicTarget.replace('变化', '变化二'),
    ),
  )

  for (const hiddenDynamicTarget of [
    `const state = { value: '正文' }\nfunction current() { return state }\ncurrent().value = '变化'\nfunction AppContent() { return <Routes>{state.value}</Routes> }`,
    `const state = { value: '正文' }\nfunction current() { return state }\nfunction prepare() { current().value = '变化' }\nfunction AppContent() { prepare(); return <Routes>{state.value}</Routes> }`,
    `const state = { value: '正文' }\nfunction current() { return state }\nfunction AppContent() { const alias = current(); alias.value = '变化'; return <Routes>{state.value}</Routes> }`,
    `const state = { value: '正文' }\nconst holder = { get current() { return state } }\nfunction AppContent() { holder.current.value = '变化'; return <Routes>{state.value}</Routes> }`,
  ]) {
    assert.notEqual(
      semanticSourceForDigest('site/src/app/AppContent.tsx', hiddenDynamicTarget),
      semanticSourceForDigest(
        'site/src/app/AppContent.tsx',
        hiddenDynamicTarget.replace('变化', '变化二'),
      ),
    )
  }

  const customConstructorTarget = `const state = { value: '正文' }\nclass Holder { constructor() { this.current = state } }\nconst holder = new Holder()\nfunction AppContent() { holder.current.value = '变化'; return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', customConstructorTarget),
    /Unsupported ambiguous mutation of state/,
  )

  const dynamicImportedGetter = `import { state, prepare } from './store'\nconst controller = { get run() { return prepare } }\nfunction AppContent() { controller.run(); return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', dynamicImportedGetter),
    /Unsupported ambiguous mutation of controller/,
  )

  const customNamedMutator = `const state = { value: '正文' }\nconst mutator = { set(target, value) { target.value = value } }\nfunction AppContent() { mutator.set(state, '正文一'); return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', customNamedMutator),
    /Unsupported ambiguous mutation of state/,
  )

  const shadowedObjectMutator = `const state = { value: '正文' }\nconst Object = { assign(target, source) { target.value = source.value } }\nfunction AppContent() { Object.assign(state, { value: '正文一' }); return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', shadowedObjectMutator),
    /Unsupported ambiguous mutation of Object/,
  )

  const patchedGlobalObject = `const state = { value: '正文' }\nconst other = {}\nObject.assign = (_target, source) => { source.value = '变化' }\nfunction AppContent() { Object.assign(other, state); return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', patchedGlobalObject),
    /Unsupported ambiguous mutation of state/,
  )

  for (const [name, indirectGlobalPatch] of [
    ['member', `const state = { value: '正文' }\nglobalThis.Object.assign = target => { target.value = '变化' }\nfunction AppContent() { Object.assign(state, {}); return <Routes>{state.value}</Routes> }`],
    ['alias', `const state = { value: '正文' }\nconst BuiltinObject = Object\nBuiltinObject.assign = target => { target.value = '变化' }\nfunction AppContent() { Object.assign(state, {}); return <Routes>{state.value}</Routes> }`],
    ['owner', `const state = { value: '正文' }\nglobalThis.Object = { assign(target) { target.value = '变化' } }\nfunction AppContent() { Object.assign(state, {}); return <Routes>{state.value}</Routes> }`],
    ['defineProperty', `const state = { value: '正文' }\nObject.defineProperty(globalThis, 'Object', { value: { assign(target) { target.value = '变化' } } })\nfunction AppContent() { Object.assign(state, {}); return <Routes>{state.value}</Routes> }`],
  ]) {
    assert.throws(
      () => semanticSourceForDigest('site/src/app/AppContent.tsx', indirectGlobalPatch),
      /Unsupported ambiguous mutation of state/,
      name,
    )
  }

  const patchedReflectApply = `import { state, prepare } from './store'\nglobalThis.Reflect = { apply(callable) { return callable() } }\nfunction AppContent() { Reflect.apply(prepare, null, []); return <Routes>{state.value}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', patchedReflectApply),
    /Unsupported/,
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

  const stableAliasBefore = `import { useEffect } from 'react'\nconst useAfterRender = useEffect\nfunction AppContent() { let label = '正文'; useAfterRender(() => { label = '客户端一' }, []); return <Routes>{label}</Routes> }`
  const stableAliasAfter = stableAliasBefore.replace('客户端一', '客户端二')
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', stableAliasBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', stableAliasAfter),
  )

  for (const memberAliasBefore of [
    `import * as React from 'react'\nconst useAfterRender = React.useEffect\nfunction AppContent() { let label = '正文'; useAfterRender(() => { label = '客户端一' }, []); return <Routes>{label}</Routes> }`,
    `import React from 'react'\nconst { useEffect: useAfterRender } = React\nfunction AppContent() { let label = '正文'; useAfterRender(() => { label = '客户端一' }, []); return <Routes>{label}</Routes> }`,
  ]) {
    const memberAliasAfter = memberAliasBefore.replace('客户端一', '客户端二')
    assert.equal(
      semanticSourceForDigest('site/src/app/AppContent.tsx', memberAliasBefore),
      semanticSourceForDigest('site/src/app/AppContent.tsx', memberAliasAfter),
    )
  }

  const mixedEffectAlias = `import { useEffect } from 'react'\nfunction runNow(callback) { callback() }\nconst afterRender = false ? useEffect : runNow\nfunction AppContent() { let label = '正文'; afterRender(() => { label = '同步变化' }, []); return <Routes>{label}</Routes> }`
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', mixedEffectAlias),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      mixedEffectAlias.replace('同步变化', '同步变化二'),
    ),
  )

  const patchedReactEffect = `import * as React from 'react'\nReact.useEffect = callback => callback()\nfunction AppContent() { let label = '正文'; React.useEffect(() => { label = '同步变化' }, []); return <Routes>{label}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', patchedReactEffect),
    /Unsupported/,
  )

  const wrappedCallbackBefore = `import { useEffect } from 'react'\nfunction AppContent() { let label = '正文'; useEffect((() => { label = '客户端一' }) as () => void, []); return <Routes>{label}</Routes> }`
  const wrappedCallbackAfter = wrappedCallbackBefore.replace('客户端一', '客户端二')
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', wrappedCallbackBefore),
    semanticSourceForDigest('site/src/app/AppContent.tsx', wrappedCallbackAfter),
  )

  const fakeLocalHook = `function useEffect(callback) { callback() }\nfunction AppContent() { let label = '正文'; useEffect(() => { label = '同步变化' }); return <Routes>{label}</Routes> }`
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', fakeLocalHook),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      fakeLocalHook.replace('同步变化', '同步变化二'),
    ),
  )

  const fakeMemberHook = `const scheduler = { useEffect(callback) { callback() } }\nfunction AppContent() { let label = '正文'; scheduler.useEffect(() => { label = '同步变化' }); return <Routes>{label}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', fakeMemberHook),
    /Unsupported ambiguous mutation of scheduler/,
  )

  const shadowedReactHook = `import { useEffect } from 'react'\nfunction AppContent() { function useEffect(callback) { callback() } let label = '正文'; useEffect(() => { label = '同步变化' }); return <Routes>{label}</Routes> }`
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', shadowedReactHook),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      shadowedReactHook.replace('同步变化', '同步变化二'),
    ),
  )
})

test('reviewed runtime boundaries cannot hide public render changes', () => {
  const constructorBefore = `const state = { value: '正文' }\nclass Writer { constructor(target) { target.value = '变化一' } }\nfunction AppContent() { new Writer(state); return <Routes>{state.value}</Routes> }`
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', constructorBefore),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      constructorBefore.replace('变化一', '变化二'),
    ),
  )

  const parameterProperty = `class Model { constructor(public label = '正文') {} }\nconst model = new Model()\nfunction AppContent() { return <Routes>{model.label}</Routes> }`
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', parameterProperty),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      parameterProperty.replace('public label', 'label'),
    ),
  )

  const optionalChain = `function AppContent() { let label = 'before'; const state = null; try { state?.value } catch { label = 'caught' } return <Routes>{label}</Routes> }`
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', optionalChain),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      optionalChain.replace('state?.value', 'state.value'),
    ),
  )

  const synchronousCallback = `const state = { value: '正文' }\nfunction current() { return state }\nfunction AppContent() { Array.from([1], () => { current().value = '变化一' }); return <Routes>{state.value}</Routes> }`
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', synchronousCallback),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      synchronousCallback.replace('变化一', '变化二'),
    ),
  )

  const destructuringDefault = `const state = {}\nconst fallback = { value: '正文' }\nconst { nested = fallback } = state\nfunction AppContent() { nested.value = '变化一'; return <Routes>{fallback.value}</Routes> }`
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', destructuringDefault),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      destructuringDefault.replace('变化一', '变化二'),
    ),
  )

  const objectRestBefore = `const state = { value: '正文' }\nconst { ...copy } = state\nfunction AppContent() { copy.value = '副本一'; return <Routes>{state.value}</Routes> }`
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', objectRestBefore),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      objectRestBefore.replace('副本一', '副本二'),
    ),
  )

  for (const patchedReact of [
    `import React from 'react'\nconst holder = { react: React }\nholder.react.useEffect = callback => callback()\nfunction AppContent() { let label = '正文'; React.useEffect(() => { label = '同步一' }, []); return <Routes>{label}</Routes> }`,
    `import React from 'react'\nconst getReact = () => React\ngetReact().useEffect = callback => callback()\nfunction AppContent() { let label = '正文'; React.useEffect(() => { label = '同步一' }, []); return <Routes>{label}</Routes> }`,
  ]) {
    assert.throws(
      () => semanticSourceForDigest('site/src/app/AppContent.tsx', patchedReact),
      /Unsupported/,
    )
  }

  for (const patchedOwner of [
    `const state = { value: '正文' }\nlet O\nO = Object\nO.assign = target => { target.value = '变化' }\nfunction AppContent() { Object.assign(state, {}); return <Routes>{state.value}</Routes> }`,
    `const state = { value: '正文' }\nObject.assign(globalThis, { Object: { assign(target) { target.value = '变化' } } })\nfunction AppContent() { Object.assign(state, {}); return <Routes>{state.value}</Routes> }`,
  ]) {
    assert.throws(
      () => semanticSourceForDigest('site/src/app/AppContent.tsx', patchedOwner),
      /Unsupported ambiguous mutation of state/,
    )
  }

  const sideEffectImportBefore = `import 'ssr-patch-a'\nfunction AppContent() { return <Routes><p>正文</p></Routes> }`
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', sideEffectImportBefore),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      sideEffectImportBefore.replace('ssr-patch-a', 'ssr-patch-b'),
    ),
  )
})

test('secondary review boundaries preserve SSR precision and fail closed', () => {
  for (const runtimeSource of [
    `const state = { value: '正文' }\nfunction current() { return state }\nfunction tag(_strings, target) { target.value = '变化一' }\nfunction AppContent() { tag\`${'${state}'}\`; return <Routes>{state.value}</Routes> }`,
    `const state = { value: '正文' }\nfunction current() { return state }\nfunction AppContent() { (() => { current().value = '变化一' })(); return <Routes>{state.value}</Routes> }`,
    `const state = { value: '正文' }\nfunction current() { return state }\nfunction AppContent() { new (class { constructor() { current().value = '变化一' } })(); return <Routes>{state.value}</Routes> }`,
    `const state = { value: '正文' }\nfunction current() { return state }\nfunction AppContent() { new Promise(resolve => { current().value = '变化一'; resolve() }); return <Routes>{state.value}</Routes> }`,
    `const state = { value: '正文' }\nfunction current() { return state }\nfunction AppContent() { Array.from([1], true ? () => { current().value = '变化一' } : () => {}); return <Routes>{state.value}</Routes> }`,
  ]) {
    assert.notEqual(
      semanticSourceForDigest('site/src/app/AppContent.tsx', runtimeSource),
      semanticSourceForDigest(
        'site/src/app/AppContent.tsx',
        runtimeSource.replace('变化一', '变化二'),
      ),
    )
  }
  assert.throws(
    () => semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      `const state = { value: '正文' }\nfunction current() { return state }\nconst callbacks = { run: () => { current().value = '变化一' } }\nfunction AppContent() { Array.from([1], callbacks.run); return <Routes>{state.value}</Routes> }`,
    ),
    /Unsupported ambiguous mutation of callbacks/,
  )

  for (const shallowCopy of [
    `const state = { nested: { value: '正文' } }\nconst copy = { ...state }\nfunction AppContent() { copy.nested.value = '变化一'; return <Routes>{state.nested.value}</Routes> }`,
    `const state = { nested: { value: '正文' } }\nconst { ...copy } = state\nfunction AppContent() { copy.nested.value = '变化一'; return <Routes>{state.nested.value}</Routes> }`,
  ]) {
    assert.throws(
      () => semanticSourceForDigest('site/src/app/AppContent.tsx', shallowCopy),
      /Unsupported ambiguous mutation of state/,
    )
  }

  for (const moduleEvaluation of [
    `import { unused } from 'ssr-patch-a'\nfunction AppContent() { return <Routes>正文</Routes> }`,
    `export * from 'ssr-patch-a'\nfunction AppContent() { return <Routes>正文</Routes> }`,
  ]) {
    assert.notEqual(
      semanticSourceForDigest('site/src/app/AppContent.tsx', moduleEvaluation),
      semanticSourceForDigest(
        'site/src/app/AppContent.tsx',
        moduleEvaluation.replace('ssr-patch-a', 'ssr-patch-b'),
      ),
    )
  }

  for (const patchedReact of [
    `import React from 'react'\nfunction getReact() { return React }\nconst alias = getReact()\nalias.useEffect = callback => callback()\nfunction AppContent() { let label = '正文'; React.useEffect(() => { label = '同步一' }, []); return <Routes>{label}</Routes> }`,
    `import './patch-react'\nimport React from 'react'\nfunction AppContent() { let label = '正文'; React.useEffect(() => { label = '同步一' }, []); return <Routes>{label}</Routes> }`,
  ]) {
    assert.throws(
      () => semanticSourceForDigest('site/src/app/AppContent.tsx', patchedReact),
      /Unsupported/,
    )
  }

  for (const patchedOwner of [
    `const state = { value: '正文' }\nconst root = globalThis\nroot.Object = { assign(target) { target.value = '变化' } }\nfunction AppContent() { Object.assign(state, {}); return <Routes>{state.value}</Routes> }`,
    `const state = { value: '正文' }\nglobalThis['Ob' + 'ject'] = { assign(target) { target.value = '变化' } }\nfunction AppContent() { Object.assign(state, {}); return <Routes>{state.value}</Routes> }`,
  ]) {
    assert.throws(
      () => semanticSourceForDigest('site/src/app/AppContent.tsx', patchedOwner),
      /Unsupported ambiguous mutation of state/,
    )
  }

  const intrinsicClientBefore = `function AppContent() { return <Routes><button onClick={() => track('客户端一')} ref={() => track('引用一')}>正文</button></Routes> }`
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', intrinsicClientBefore),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      intrinsicClientBefore.replace('客户端一', '客户端二').replace('引用一', '引用二'),
    ),
  )
  const intrinsicDeferredWrite = `function AppContent() { let label = '正文'; return <Routes><button onClick={() => { label = '客户端一' }}>{label}</button></Routes> }`
  assert.equal(
    semanticSourceForDigest('site/src/app/AppContent.tsx', intrinsicDeferredWrite),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      intrinsicDeferredWrite.replace('客户端一', '客户端二'),
    ),
  )
  const intrinsicCallbackFactory = `function AppContent() { let label = '正文'; return <Routes><button onClick={(() => { label = '变化一'; return () => {} })()}>{label}</button></Routes> }`
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', intrinsicCallbackFactory),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      intrinsicCallbackFactory.replace('变化一', '变化二'),
    ),
  )
  for (const intrinsicSpread of [
    `function AppContent() { return <Routes><button {...{ onClick: () => track('客户端一') }}>正文</button></Routes> }`,
    `const props = { onClick: () => track('客户端一') }\nfunction AppContent() { return <Routes><button {...props}>正文</button></Routes> }`,
  ]) {
    assert.equal(
      semanticSourceForDigest('site/src/app/AppContent.tsx', intrinsicSpread),
      semanticSourceForDigest(
        'site/src/app/AppContent.tsx',
        intrinsicSpread.replace('客户端一', '客户端二'),
      ),
    )
  }
  assert.notEqual(
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      `function AppContent() { return <Routes><Widget render={() => track('正文一')} /></Routes> }`,
    ),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      `function AppContent() { return <Routes><Widget render={() => track('正文二')} /></Routes> }`,
    ),
  )

  for (const asyncCallback of [
    `function AppContent() { setTimeout(() => track('客户端一'), 0); return <Routes>正文</Routes> }`,
    `function AppContent() { queueMicrotask(() => track('客户端一')); return <Routes>正文</Routes> }`,
    `function AppContent() { Promise.resolve().then(() => track('客户端一')); return <Routes>正文</Routes> }`,
    `function AppContent() { let label = '正文'; setTimeout(() => { label = '客户端一' }, 0); return <Routes>{label}</Routes> }`,
    `function AppContent() { new Promise(resolve => { setTimeout(() => track('客户端一'), 0); resolve() }); return <Routes>正文</Routes> }`,
  ]) {
    assert.equal(
      semanticSourceForDigest('site/src/app/AppContent.tsx', asyncCallback),
      semanticSourceForDigest(
        'site/src/app/AppContent.tsx',
        asyncCallback.replace('客户端一', '客户端二'),
      ),
    )
  }
  for (const namedAsyncCallback of [
    `const callback = () => { label = '客户端一' }\nlet label = '正文'\nfunction AppContent() { setTimeout(callback, 0); return <Routes>{label}</Routes> }`,
    `import { useEffect } from 'react'\nconst callback = () => { label = '客户端一' }\nlet label = '正文'\nfunction AppContent() { useEffect(callback, []); return <Routes>{label}</Routes> }`,
  ]) {
    assert.equal(
      semanticSourceForDigest('site/src/app/AppContent.tsx', namedAsyncCallback),
      semanticSourceForDigest(
        'site/src/app/AppContent.tsx',
        namedAsyncCallback.replace('客户端一', '客户端二'),
      ),
    )
  }
  for (const aliasedAsyncCallback of [
    `const callback = () => { label = '客户端一' }\nconst alias = callback\nlet label = '正文'\nfunction AppContent() { setTimeout(alias, 0); return <Routes>{label}</Routes> }`,
    `import { useEffect } from 'react'\nconst callback = () => { label = '客户端一' }\nconst alias = callback\nlet label = '正文'\nfunction AppContent() { useEffect(alias, []); return <Routes>{label}</Routes> }`,
    `const callback = () => track('客户端一')\nconst alias = callback\nconst props = { onClick: alias }\nfunction AppContent() { return <Routes><button {...props}>正文</button></Routes> }`,
  ]) {
    assert.equal(
      semanticSourceForDigest('site/src/app/AppContent.tsx', aliasedAsyncCallback),
      semanticSourceForDigest(
        'site/src/app/AppContent.tsx',
        aliasedAsyncCallback.replace('客户端一', '客户端二'),
      ),
    )
  }

  for (const callbackFactory of [
    `function AppContent() { let label = '正文'; setTimeout((label = '变化一', () => {}), 0); return <Routes>{label}</Routes> }`,
    `import { useEffect } from 'react'\nfunction AppContent() { let label = '正文'; useEffect((() => { label = '变化一'; return () => {} })(), []); return <Routes>{label}</Routes> }`,
  ]) {
    assert.notEqual(
      semanticSourceForDigest('site/src/app/AppContent.tsx', callbackFactory),
      semanticSourceForDigest(
        'site/src/app/AppContent.tsx',
        callbackFactory.replace('变化一', '变化二'),
      ),
    )
  }
  for (const deferredFactory of [
    `function make() { track('同步获取'); return () => track('客户端一') }\nfunction AppContent() { setTimeout(make(), 0); return <Routes>正文</Routes> }`,
    `import { useEffect } from 'react'\nfunction make() { track('同步获取'); return () => track('客户端一') }\nfunction AppContent() { useEffect(make(), []); return <Routes>正文</Routes> }`,
    `function make() { track('同步获取'); return () => track('客户端一') }\nfunction AppContent() { return <Routes><button onClick={make()}>正文</button></Routes> }`,
    `function make() { track('同步获取'); return () => track('客户端一') }\nconst props = { onClick: make() }\nfunction AppContent() { return <Routes><button {...props}>正文</button></Routes> }`,
  ]) {
    assert.equal(
      semanticSourceForDigest('site/src/app/AppContent.tsx', deferredFactory),
      semanticSourceForDigest(
        'site/src/app/AppContent.tsx',
        deferredFactory.replace('客户端一', '客户端二'),
      ),
    )
    assert.notEqual(
      semanticSourceForDigest('site/src/app/AppContent.tsx', deferredFactory),
      semanticSourceForDigest(
        'site/src/app/AppContent.tsx',
        deferredFactory.replace('同步获取', '同步变化'),
      ),
    )
  }

  for (const patchedCallbackSemantic of [
    `globalThis.setTimeout = callback => callback()\nfunction AppContent() { setTimeout(() => track('同步一'), 0); return <Routes>正文</Routes> }`,
    `Promise.prototype.then = callback => { callback(); return Promise.resolve() }\nfunction AppContent() { Promise.resolve().then(() => track('同步一')); return <Routes>正文</Routes> }`,
    `Array.prototype.map = callback => { callback('同步一'); return [] }\nfunction AppContent() { [1].map(value => track(value)); return <Routes>正文</Routes> }`,
  ]) {
    assert.throws(
      () => semanticSourceForDigest('site/src/app/AppContent.tsx', patchedCallbackSemantic),
      /Unsupported callback execution timing/,
    )
  }
  for (const importedPatch of [
    `import '../../scripts/fixtures/semantic-patch-timer.mjs'\nfunction AppContent() { setTimeout(() => track('同步一'), 0); return <Routes>正文</Routes> }`,
    `import { unused } from '../../scripts/fixtures/semantic-patch-react.mjs'\nimport { useEffect } from 'react'\nfunction AppContent() { useEffect(() => track('同步一'), []); return <Routes>正文</Routes> }`,
  ]) {
    assert.throws(
      () => semanticSourceForDigest('site/src/app/AppContent.tsx', importedPatch),
      /Unsupported/,
    )
  }

  for (const destructuredOwner of [
    `const state = { value: '正文' }\nconst { Object: O } = globalThis\nO.assign = target => { target.value = '变化' }\nfunction AppContent() { Object.assign(state, {}); return <Routes>{state.value}</Routes> }`,
    `const state = { value: '正文' }\nconst { ['Object']: O } = globalThis\nO.assign = target => { target.value = '变化' }\nfunction AppContent() { Object.assign(state, {}); return <Routes>{state.value}</Routes> }`,
  ]) {
    assert.throws(
      () => semanticSourceForDigest('site/src/app/AppContent.tsx', destructuredOwner),
      /Unsupported ambiguous mutation of state/,
    )
  }
  for (const indirectOwner of [
    `const state = { value: '正文' }\nconst [O] = [Object]\nO.assign = target => { target.value = '变化' }\nfunction AppContent() { Object.assign(state, {}); return <Routes>{state.value}</Routes> }`,
    `const state = { value: '正文' }\nconst holder = { O: Object }\nconst { O } = holder\nO.assign = target => { target.value = '变化' }\nfunction AppContent() { Object.assign(state, {}); return <Routes>{state.value}</Routes> }`,
    `const state = { value: '正文' }\nconst O = true ? Object : Object\nO.assign = target => { target.value = '变化' }\nfunction AppContent() { Object.assign(state, {}); return <Routes>{state.value}</Routes> }`,
    `const state = { value: '正文' }\nconst O = [Object][0]\nO.assign = target => { target.value = '变化' }\nfunction AppContent() { Object.assign(state, {}); return <Routes>{state.value}</Routes> }`,
    `let label = '正文'\nconst proto = Promise.prototype\nproto.then = callback => { callback(); return Promise.resolve() }\nfunction AppContent() { Promise.resolve().then(() => { label = '变化' }); return <Routes>{label}</Routes> }`,
    `const state = { value: '正文' }\nconst G = true ? globalThis : globalThis\nG.Object = { assign(target) { target.value = '变化' } }\nfunction AppContent() { Object.assign(state, {}); return <Routes>{state.value}</Routes> }`,
  ]) {
    assert.throws(
      () => semanticSourceForDigest('site/src/app/AppContent.tsx', indirectOwner),
      /Unsupported/,
    )
  }

  for (const externalCall of [
    `import { mutate as externalMutate, state } from 'pkg'\nfunction AppContent() { externalMutate(); return <Routes>{state.value}</Routes> }`,
    `function AppContent() { externalMutate(); return <Routes>{globalThis.state.value}</Routes> }`,
  ]) {
    assert.throws(
      () => semanticSourceForDigest('site/src/app/AppContent.tsx', externalCall),
      /Unsupported external synchronous call/,
    )
  }
  for (const externalStandalone of [
    `import { mutateOne as mutate, state } from 'pkg'\nmutate()\nfunction AppContent() { return <Routes>{state.value}</Routes> }`,
    `mutateOne()\nfunction AppContent() { return <Routes>{globalThis.state.value}</Routes> }`,
    `import api from 'pkg'\napi.mutateOne()\nfunction AppContent() { return <Routes>{globalThis.state.value}</Routes> }`,
    `import { patch } from 'pkg'\nfunction AppContent() { let label = '正文'; patch(); Promise.resolve().then(() => { label = '变化' }); return <Routes>{label}</Routes> }`,
  ]) {
    assert.throws(
      () => semanticSourceForDigest('site/src/app/AppContent.tsx', externalStandalone),
      /Unsupported external synchronous call/,
    )
  }

  const exportedDeferred = `let label = '正文'\nexport function callback() { label = '客户端一' }\nfunction AppContent() { setTimeout(callback, 0); return <Routes>{label}</Routes> }`
  assert.throws(
    () => semanticSourceForDigest('site/src/app/AppContent.tsx', exportedDeferred),
    /Unsupported nested semantic write/,
  )

  for (const unstableAlias of [
    `const state = { value: '正文' }\nlet alias = {}\nfunction AppContent() { alias ||= state; alias.value = '变化一'; return <Routes>{state.value}</Routes> }`,
    `const state = { value: '正文' }\nlet alias = {}\nfunction AppContent() { for (alias of [state]) alias.value = '变化一'; return <Routes>{state.value}</Routes> }`,
  ]) {
    assert.throws(
      () => semanticSourceForDigest('site/src/app/AppContent.tsx', unstableAlias),
      /Unsupported/,
    )
  }
  const catchAlias = `const state = { value: '正文' }\nfunction AppContent() { try { throw state } catch (alias) { alias.value = '变化一' } return <Routes>{state.value}</Routes> }`
  assert.notEqual(
    semanticSourceForDigest('site/src/app/AppContent.tsx', catchAlias),
    semanticSourceForDigest(
      'site/src/app/AppContent.tsx',
      catchAlias.replace('变化一', '变化二'),
    ),
  )

  for (const conditionalClientValue of [
    `const enabled = true\nfunction AppContent() { return <Routes><button onClick={enabled ? () => track('客户端一') : () => {}}>正文</button></Routes> }`,
    `const enabled = true\nconst props = { onClick: enabled ? () => track('客户端一') : () => {} }\nfunction AppContent() { return <Routes><button {...props}>正文</button></Routes> }`,
  ]) {
    assert.equal(
      semanticSourceForDigest('site/src/app/AppContent.tsx', conditionalClientValue),
      semanticSourceForDigest(
        'site/src/app/AppContent.tsx',
        conditionalClientValue.replace('客户端一', '客户端二'),
      ),
    )
  }
})

test('public config rejects alias mutation, pattern writes, and patched freeze', () => {
  for (const mutableConfig of [
    publicConfigSource(
      `const shared = { name: '初始' }\nconst alias = shared\nalias.name = '运行时'`,
      '...shared',
    ),
    publicConfigSource(
      `const shared = { name: '初始' }\n({ name: shared.name } = { name: '运行时' })`,
      '...shared',
    ),
    publicConfigSource(
      `Object.freeze = value => { value.name = '运行时'; return value }`,
      `name: '初始'`,
    ),
    publicConfigSource(
      `const root = globalThis\nroot.Object = { freeze(value) { value.name = '运行时'; return value } }`,
      `name: '初始'`,
    ),
    publicConfigSource(
      `Reflect.set(Object, 'freeze', value => { value.name = '运行时'; return value })`,
      `name: '初始'`,
    ),
    publicConfigSource(
      `const { Object: O } = globalThis\nO.freeze = value => { value.name = '运行时'; return value }`,
      `name: '初始'`,
    ),
    publicConfigSource(
      `const { ['Object']: O } = globalThis\nO.freeze = value => { value.name = '运行时'; return value }`,
      `name: '初始'`,
    ),
    publicConfigSource(
      `const [O] = [Object]\nO.freeze = value => { value.name = '运行时'; return value }`,
      `name: '初始'`,
    ),
    publicConfigSource(
      `const holder = { O: Object }\nconst { O } = holder\nO.freeze = value => { value.name = '运行时'; return value }`,
      `name: '初始'`,
    ),
    publicConfigSource(
      `const O = true ? Object : Object\nO.freeze = value => { value.name = '运行时'; return value }`,
      `name: '初始'`,
    ),
    publicConfigSource(
      `const O = [Object][0]\nO.freeze = value => { value.name = '运行时'; return value }`,
      `name: '初始'`,
    ),
  ]) {
    assert.throws(
      () => semanticSourceForDigest('site/src/config/site.ts', mutableConfig),
      /Unsupported public site configuration/,
    )
  }
})

test('static dependency discovery excludes specifier-level type-only edges', () => {
  assert.deepEqual(
    staticImportSpecifiersForSource(
      'site/src/app/AppContent.tsx',
      `import { type ClientOnly } from './client'\nimport { Runtime, type RuntimeType } from './runtime'\nexport { type ExportedType } from './types'\nexport { RuntimeValue } from './values'`,
    ),
    ['./runtime', './values'],
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
