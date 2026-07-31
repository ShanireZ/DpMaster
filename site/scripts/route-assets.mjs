import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const catalogPath = fileURLToPath(new URL('../src/data/catalog.ts', import.meta.url))
const familyArtRegistryPath = fileURLToPath(
  new URL('../src/components/art/familyArtRegistry.ts', import.meta.url),
)

const PAGE_MODULES = Object.freeze({
  home: 'src/pages/Home.tsx',
  family: 'src/pages/PartPage.tsx',
  lesson: 'src/pages/TypePage.tsx',
  method: 'src/pages/MethodPage.tsx',
  problems: 'src/pages/ProblemsPage.tsx',
  bodyDemoStandard: 'src/pages/BodyDemoStandardPage.tsx',
  notFound: 'src/pages/NotFound.tsx',
})

function contentModuleMap() {
  const lines = readFileSync(catalogPath, 'utf8').split(/\r?\n/)
  const modules = new Map()
  let partId = ''

  for (const line of lines) {
    const partMatch = line.match(/\bid:\s*'([a-g])'/)
    if (partMatch) partId = partMatch[1]

    const lessonMatch = line.match(
      /\bslug:\s*'([^']+)'.*?\bstatus:\s*'ready'.*?\blessonContent\('(\.\.\/content\/[^']+)\.tsx'\s*,/,
    )
    if (!lessonMatch || !partId) continue

    const [, slug, relativeModule] = lessonMatch
    const sourceModule = `src/${relativeModule.replace(/^\.\.\//, '')}.tsx`
    modules.set(`/part/${partId}/${slug}`, sourceModule)
  }

  if (modules.size !== 37) {
    throw new Error(`Expected 37 lesson asset modules, found ${modules.size}`)
  }
  return modules
}

const CONTENT_MODULES = contentModuleMap()

function familyArtModuleMap() {
  const source = readFileSync(familyArtRegistryPath, 'utf8')
  const modules = new Map()
  const registrationPattern =
    /familyArt\(\s*'([a-g])'\s*,\s*'(src\/components\/art\/families\/[^']+\.tsx)'/g

  for (const match of source.matchAll(registrationPattern)) {
    modules.set(match[1], match[2])
  }

  if (!modules.has('a')) {
    throw new Error('Family art registry must include the upgraded A family')
  }
  return modules
}

const FAMILY_ART_MODULES = familyArtModuleMap()

function familyArtModule(pathname) {
  const match = pathname.match(/^\/part\/([a-g])(?:\/|$)/)
  return match ? FAMILY_ART_MODULES.get(match[1]) : undefined
}

export function routeModuleIds(pathname) {
  if (pathname === '/') return [PAGE_MODULES.home]
  if (pathname === '/method') return [PAGE_MODULES.method]
  if (pathname === '/problems') return [PAGE_MODULES.problems]
  if (pathname === '/lab/body-demo-standard') return [PAGE_MODULES.bodyDemoStandard]
  if (pathname === '/__dp-not-found__') return [PAGE_MODULES.notFound]
  if (/^\/part\/[a-g]$/.test(pathname)) {
    return [PAGE_MODULES.family, familyArtModule(pathname)].filter(Boolean)
  }

  const contentModule = CONTENT_MODULES.get(pathname)
  if (contentModule) {
    return [PAGE_MODULES.lesson, contentModule, familyArtModule(pathname)].filter(Boolean)
  }
  throw new Error(`No client asset module mapping for ${pathname}`)
}

function importedChunks(manifest, name, seen = new Set()) {
  const chunk = manifest[name]
  if (!chunk) throw new Error(`Vite manifest is missing ${name}`)

  const chunks = []
  for (const dependency of chunk.imports ?? []) {
    if (seen.has(dependency)) continue
    seen.add(dependency)
    chunks.push(...importedChunks(manifest, dependency, seen))
    chunks.push(manifest[dependency])
  }
  return chunks
}

export function routeCssFiles(manifest, pathname) {
  const css = new Set()
  for (const moduleId of routeModuleIds(pathname)) {
    const chunk = manifest[moduleId]
    if (!chunk) throw new Error(`Vite manifest is missing route module ${moduleId}`)
    for (const file of chunk.css ?? []) css.add(file)
    for (const imported of importedChunks(manifest, moduleId)) {
      for (const file of imported.css ?? []) css.add(file)
    }
  }
  return [...css]
}

export function routeModuleFiles(manifest, pathname) {
  const files = new Set()
  for (const moduleId of routeModuleIds(pathname)) {
    const chunk = manifest[moduleId]
    if (!chunk) throw new Error(`Vite manifest is missing route module ${moduleId}`)
    files.add(chunk.file)
    for (const imported of importedChunks(manifest, moduleId)) files.add(imported.file)
  }
  return [...files]
}

export function renderRouteCssLinks(manifest, pathname) {
  return routeCssFiles(manifest, pathname)
    .map((file) => `    <link rel="stylesheet" crossorigin href="/${file}" data-dp-route-css />`)
    .join('\n')
}

export function renderRouteAssetLinks(manifest, pathname) {
  const modules = routeModuleFiles(manifest, pathname)
    .map((file) => `    <link rel="modulepreload" crossorigin href="/${file}" data-dp-route-module />`)
  const css = renderRouteCssLinks(manifest, pathname)
  return [...modules, css].filter(Boolean).join('\n')
}
