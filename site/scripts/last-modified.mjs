import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
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

function gitNames(args) {
  const result = spawnSync('git', args, {
    cwd: projectRoot,
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    throw new Error(`Unable to inspect Git changes: ${result.stderr.trim()}`)
  }
  return result.stdout.split('\0').filter(Boolean)
}

function dirtyRouteFiles(files) {
  return new Set([
    ...gitNames(['diff', '--name-only', '-z', 'HEAD', '--', ...files]),
    ...gitNames(['ls-files', '--others', '--exclude-standard', '-z', '--', ...files]),
  ])
}

function localDate(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function routeContentDigest(files) {
  const digest = createHash('sha256')
  for (const file of files) {
    digest.update(file)
    digest.update('\0')
    digest.update(readFileSync(new URL(`../../${file}`, import.meta.url)))
    digest.update('\0')
  }
  return digest.digest('hex')
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
  return collectRouteContentEvidence().lastModified
}

export function resolveContentLastModified({
  previousDigest,
  currentDigest,
  previousLastModified,
  candidateLastModified,
  now = new Date(),
}) {
  if (previousDigest && previousDigest === currentDigest && previousLastModified) {
    return previousLastModified
  }
  if (
    previousDigest
    && previousDigest !== currentDigest
    && previousLastModified === candidateLastModified
  ) {
    return now.toISOString()
  }
  return candidateLastModified
}

export function collectRouteContentEvidence({
  previousLastModified = {},
  previousContentDigests = {},
  now = new Date(),
} = {}) {
  const filesByRoute = new Map(
    PUBLIC_PATHS.map((pathname) => [pathname, routeFiles(pathname)]),
  )
  const dirtyFiles = dirtyRouteFiles(new Set([...filesByRoute.values()].flat()))
  const workingDate = dirtyFiles.size > 0 ? localDate(now) : null
  const contentDigests = Object.fromEntries(
    [...filesByRoute].map(([pathname, files]) => [
      pathname,
      routeContentDigest(files),
    ]),
  )

  const lastModified = Object.fromEntries(
    [...filesByRoute].map(([pathname, files]) => [
      pathname,
      resolveContentLastModified({
        previousDigest: previousContentDigests[pathname],
        currentDigest: contentDigests[pathname],
        previousLastModified: previousLastModified[pathname],
        candidateLastModified: files.some((file) => dirtyFiles.has(file))
        ? workingDate
        : gitDate(files),
        now,
      }),
    ]),
  )
  return { lastModified, contentDigests }
}

export function renderRouteLastModifiedModule(lastModified, contentDigests = {}) {
  return [
    '// 由 scripts/generate-seo.mjs 从 Git 历史生成，请勿手改。',
    `export const ROUTE_LAST_MODIFIED: Readonly<Record<string, string>> = Object.freeze(${JSON.stringify(lastModified, null, 2)})`,
    `export const ROUTE_CONTENT_DIGESTS: Readonly<Record<string, string>> = Object.freeze(${JSON.stringify(contentDigests, null, 2)})`,
    '',
  ].join('\n')
}
