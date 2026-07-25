import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const siteDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalogPath = join(siteDir, 'src', 'data', 'catalog.ts')

test('one catalog owns every lesson and game implementation', () => {
  assert.equal(existsSync(catalogPath), true, 'src/data/catalog.ts must exist')
  const catalog = existsSync(catalogPath) ? readFileSync(catalogPath, 'utf8') : ''

  assert.equal((catalog.match(/lessonContent\('\.\.\/content\//g) ?? []).length, 37)
  assert.equal((catalog.match(/import\('\.\.\/components\/games\//g) ?? []).length, 7)
})

test('shallow content and game registries are deleted', () => {
  assert.equal(existsSync(join(siteDir, 'src', 'content', 'registry.tsx')), false)
  assert.equal(existsSync(join(siteDir, 'src', 'components', 'games', 'registry.ts')), false)
  assert.equal(existsSync(join(siteDir, 'src', 'data', 'parts.ts')), false)
})

test('SSR reuses catalog loaders without creating an eager duplicate lesson graph', () => {
  const staticApp = readFileSync(join(siteDir, 'src', 'app', 'StaticApp.tsx'), 'utf8')
  const appContent = readFileSync(join(siteDir, 'src', 'app', 'AppContent.tsx'), 'utf8')
  const entryServer = readFileSync(join(siteDir, 'src', 'entry-server.tsx'), 'utf8')

  assert.doesNotMatch(staticApp, /import\.meta\.glob/)
  assert.doesNotMatch(appContent, /CLIENT_ROUTE_VIEWS/)
  assert.match(entryServer, /lesson\.type\.loadContent\(\)/)
})

test('lesson navigation is owned by TypePage instead of lesson JSX', () => {
  const contentRoot = join(siteDir, 'src', 'content')
  const lessonFiles = readdirSync(contentRoot, { recursive: true })
    .filter((path) => path.endsWith('.tsx'))
    .map((path) => join(contentRoot, path))
  const owners = lessonFiles.filter((path) => readFileSync(path, 'utf8').includes('className="type-nav"'))

  assert.deepEqual(owners, [])
  assert.match(readFileSync(join(siteDir, 'src', 'pages', 'TypePage.tsx'), 'utf8'), /className="type-nav"/)
})
