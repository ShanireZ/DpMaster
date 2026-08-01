import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import test from 'node:test'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const demoRoot = new URL('../src/components/demos/', import.meta.url)
const familyArtRoot = new URL('../src/assets/family-art/', import.meta.url)

const optimizedFamilyArt = [
  'bitmask-hero.avif',
  'bitmask-lessons.avif',
  'interval-hero.avif',
  'interval-lessons.avif',
  'linear-hero.avif',
  'matrix-hero.avif',
  'matrix-lessons.avif',
  'reroot-hero.avif',
  'reroot-lessons.avif',
  'tree-hero.avif',
  'tree-lessons.avif',
]

const componentFiles = (directory = demoRoot) => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory)
    if (entry.isDirectory()) return componentFiles(url)
    return entry.name.endsWith('.tsx') ? [url] : []
  })

test('family art owns upgraded route visuals without duplicating catalog content', () => {
  const registry = source('src/components/art/familyArtRegistry.ts')
  const partPage = source('src/pages/PartPage.tsx')
  const typePage = source('src/pages/TypePage.tsx')

  assert.match(registry, /familyArt\(\s*'a'/)
  assert.match(registry, /familyArt\(\s*'b'/)
  assert.doesNotMatch(registry, /\btitle:\s*['"]/)
  assert.doesNotMatch(registry, /\bslug:\s*['"]/)
  assert.match(partPage, /FamilyHeroArt/)
  assert.match(partPage, /FamilyJourneyArt/)
  assert.doesNotMatch(partPage, /import PolygonBackpack/)
  assert.match(typePage, /FamilyLessonPlate/)
  assert.doesNotMatch(typePage, /KnapsackLessonPlate/)
})

test('route family art keeps the reclaimed AVIF asset budget', () => {
  const assetNames = readdirSync(familyArtRoot)
  const familySources = [
    source('src/components/art/LinearFamilyArt.tsx'),
    source('src/components/art/families/bitmask.tsx'),
    source('src/components/art/families/interval.tsx'),
    source('src/components/art/families/matrix.tsx'),
    source('src/components/art/families/reroot.tsx'),
    source('src/components/art/families/tree.tsx'),
  ].join('\n')

  for (const assetName of optimizedFamilyArt) {
    assert.equal(assetNames.includes(assetName), true, `${assetName} must remain available`)
  }
  assert.deepEqual(assetNames.filter((name) => name.endsWith('.webp')), [])
  assert.doesNotMatch(familySources, /family-art\/[a-z-]+\.webp/)
})

test('non-backpack demos consume the shared workbench stylesheet', () => {
  const sharedCss = source('src/components/demos/shared/demo-workbench.css')
  const knapsackCss = source('src/components/demos/knapsack/knapsack-demo.css')
  const nonBackpackComponents = componentFiles()
    .filter((url) => !url.pathname.includes('/demos/knapsack/'))

  assert.equal(nonBackpackComponents.length > 0, true)
  for (const file of nonBackpackComponents) {
    const component = readFileSync(file, 'utf8')
    assert.doesNotMatch(component, /knapsack\/knapsack-demo\.css/, file.pathname)
  }
  assert.equal(
    nonBackpackComponents.filter((file) => /shared\/demo-workbench\.css/.test(readFileSync(file, 'utf8'))).length,
    32,
  )
  assert.match(sharedCss, /\.stepper__row/)
  assert.match(sharedCss, /\.demo-control__toolbar/)
  assert.match(knapsackCss, /@import '\.\.\/shared\/demo-workbench\.css'/)
  assert.match(knapsackCss, /\.demo-editor/)
  assert.doesNotMatch(knapsackCss, /^\.stepper__row/m)
})
