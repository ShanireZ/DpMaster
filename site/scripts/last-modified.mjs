import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { PUBLIC_PATHS } from '../src/lib/publicRoutes.ts'
import { routeModuleIds } from './route-assets.mjs'

const projectRoot = fileURLToPath(new URL('../../', import.meta.url))
const COMMON_FILES = [
  'site/src/data/catalog.ts',
  'site/src/data/editorial.ts',
  'site/src/lib/pageMeta.ts',
  'site/src/lib/seoHead.ts',
]

function routeFiles(pathname) {
  return [
    ...COMMON_FILES,
    ...routeModuleIds(pathname).map((moduleId) => `site/${moduleId}`),
  ]
}

function gitDate(files) {
  const result = spawnSync(
    'git',
    ['log', '-1', '--format=%cs', '--', ...files],
    { cwd: projectRoot, encoding: 'utf8' },
  )
  if (result.status !== 0) {
    throw new Error(`Unable to read Git lastmod: ${result.stderr.trim()}`)
  }
  const value = result.stdout.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Missing Git lastmod for ${files.join(', ')}`)
  }
  return value
}

export function collectRouteLastModified() {
  return Object.fromEntries(
    PUBLIC_PATHS.map((pathname) => [pathname, gitDate(routeFiles(pathname))]),
  )
}

export function renderRouteLastModifiedModule(lastModified) {
  return [
    '// 由 scripts/generate-seo.mjs 从 Git 历史生成，请勿手改。',
    `export const ROUTE_LAST_MODIFIED: Readonly<Record<string, string>> = Object.freeze(${JSON.stringify(lastModified, null, 2)})`,
    '',
  ].join('\n')
}
