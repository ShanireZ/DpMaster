import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../src/components/', import.meta.url)

async function component(path) {
  return readFile(new URL(path, root), 'utf8')
}

const remainingTransports = [
  'demos/lis/LISPatienceDemo.tsx',
  'demos/grid/LCSToLISDemo.tsx',
  'demos/interval/PalindromeInsertDemo.tsx',
  'demos/grid/EditTracebackDemo.tsx',
]

test('deep playback hook exposes one typed player contract', async () => {
  const [types, hook] = await Promise.all([
    component('dp-engine/playback/types.ts'),
    component('dp-engine/playback/useStepPlayer.ts'),
  ])

  assert.match(types, /export interface StepPlayer/)
  for (const field of ['canPrevious', 'canNext', 'canPlay', 'previous', 'next', 'reset', 'play', 'pause', 'toggle', 'setSpeed']) {
    assert.match(types, new RegExp(`\\b${field}\\b`))
  }
  assert.match(hook, /clampPlaybackIndex/)
  assert.match(hook, /nextPlaybackIndex/)
  assert.match(hook, /previousPlaybackIndex/)
  assert.match(hook, /setPlaying\(false\)/)
  assert.match(hook, /count > 0/)
})

test('the shallow legacy playback hook is removed', async () => {
  await assert.rejects(access(new URL('dp-engine/useStepPlayer.ts', root)))
})

test('one playback Adapter exposes full and compact controls with keyboard semantics', async () => {
  const controls = await component('dp-engine/playback/PlaybackControls.tsx')

  assert.match(controls, /variant\?: ['"]full['"] \| ['"]compact['"]/)
  assert.match(controls, /role="group"/)
  assert.match(controls, /tabIndex=\{0\}/)
  for (const label of ['重置', '上一步', '播放', '暂停', '下一步', '进度', '速度']) {
    assert.match(controls, new RegExp(label))
  }
  for (const key of ['Home', 'ArrowLeft', 'ArrowRight']) {
    assert.match(controls, new RegExp(key))
  }
  assert.match(controls, /event\.key === ['"] ['"]/)
  assert.match(controls, /aria-keyshortcuts=/)
  assert.match(controls, /aria-live="polite"/)
  assert.match(controls, /isEditableTarget/)
  assert.match(controls, /isContentEditable/)
})

test('grid and tree carriers delegate rendering to the common playback Adapter', async () => {
  const [grid, tree] = await Promise.all([
    component('dp-engine/DPViz.tsx'),
    component('demos/treedp/TreeCanvas.tsx'),
  ])

  assert.match(grid, /PlaybackControls/)
  assert.match(grid, /variant="full"/)
  assert.doesNotMatch(grid, /className="dpctl/)
  assert.match(tree, /PlaybackControls/)
  assert.match(tree, /variant="compact"/)
  assert.doesNotMatch(tree, /<button/)
})

test('board, subset, cover, and reroot carriers share compact playback semantics', async () => {
  const paths = [
    'demos/bitmask/BoardDemo.tsx',
    'demos/bitmask/SubsetEnumDemo.tsx',
    'demos/bitmask/CoverDemo.tsx',
    'demos/reroot/RerootTwoPassDemo.tsx',
  ]
  for (const path of paths) {
    const text = await component(path)
    assert.match(text, /PlaybackControls/, `${path} must use the common Adapter`)
    assert.match(text, /variant="compact"/, `${path} must keep the compact layout`)
    assert.doesNotMatch(text, /className="dpctl/, `${path} must remove its duplicated transport`)
    assert.doesNotMatch(text, /className="rr__transport/, `${path} must remove its duplicated transport`)
  }
})

for (const path of remainingTransports) {
  test(`${path} delegates its transport to the shared player`, async () => {
    const text = await component(path)

    assert.match(text, /dp-engine\/playback\/useStepPlayer/)
    assert.match(text, /dp-engine\/playback\/PlaybackControls/)
    assert.match(text, /variant="compact"/)
    assert.doesNotMatch(text, /\b(?:playing|setPlaying|timer|setTimeout|clearTimeout)\b/)
    assert.doesNotMatch(text, /\[(?:idx|shown),\s*set(?:Idx|Shown)\]/)
    assert.doesNotMatch(text, /className="(?:lp|ll|etb)__ctl-btns"/)
  })
}

test('caption carriers use SafeCaption and raw HTML sinks remain restricted', async () => {
  const captionCarriers = [
    'dp-engine/DPViz.tsx',
    'demos/treedp/TreeCanvas.tsx',
    'demos/reroot/RerootTwoPassDemo.tsx',
    'demos/bitmask/BoardDemo.tsx',
  ]
  for (const path of captionCarriers) {
    const text = await component(path)
    assert.match(text, /SafeCaption/, `${path} must render teaching captions safely`)
    assert.doesNotMatch(text, /dangerouslySetInnerHTML/, `${path} must not own a raw HTML sink`)
  }

  const allowedRawSinks = new Set(['ui/CodeBlock.tsx', 'ui/Math.tsx'])
  const paths = (await readdir(root, { recursive: true }))
    .map((path) => path.replaceAll('\\', '/'))
    .filter((path) => /\.[jt]sx?$/.test(path))
  for (const path of paths) {
    const text = await component(path)
    if (!allowedRawSinks.has(path)) {
      assert.doesNotMatch(text, /dangerouslySetInnerHTML/, `${path} introduces an unapproved raw HTML sink`)
    }
  }
})

test('every playback caller imports the deep hook path', async () => {
  const paths = [
    'dp-engine/DPViz.tsx',
    'demos/treedp/IndepSetDemo.tsx',
    'demos/treedp/DiameterDemo.tsx',
    'demos/treedp/CoverDemo.tsx',
    'demos/bitmask/BoardDemo.tsx',
    'demos/bitmask/SubsetEnumDemo.tsx',
    'demos/bitmask/CoverDemo.tsx',
    'demos/reroot/RerootTwoPassDemo.tsx',
    ...remainingTransports,
  ]
  for (const path of paths) {
    const text = await component(path)
    assert.match(text, /dp-engine\/playback\/useStepPlayer|\.\/playback\/useStepPlayer/)
    assert.doesNotMatch(text, /dp-engine\/useStepPlayer|\.\/useStepPlayer/)
  }
})
