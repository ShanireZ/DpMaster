import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PUBLIC_PATHS } from '../src/lib/publicRoutes.ts'
import {
  semanticRouteFiles,
  semanticSourceForDigest,
} from './semantic-source-graph.mjs'

const projectRoot = fileURLToPath(new URL('../../', import.meta.url))
export const ROUTE_CONTENT_DIGEST_VERSION = 5

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

export function normalizeContentForDigest(content) {
  return content.replaceAll('\r\n', '\n').replaceAll('\r', '\n')
}

function routeContentDigest(files) {
  const digest = createHash('sha256')
  for (const file of files) {
    digest.update(file)
    digest.update('\0')
    const source = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8')
    digest.update(normalizeContentForDigest(semanticSourceForDigest(file, source)))
    digest.update('\0')
  }
  return digest.digest('hex')
}

function workingTreeDate(files) {
  const latest = Math.max(...files.map((file) => (
    statSync(new URL(`../../${file}`, import.meta.url)).mtimeMs
  )))
  if (!Number.isFinite(latest)) {
    throw new Error(`Missing working-tree lastmod for ${files.join(', ')}`)
  }
  return new Date(latest).toISOString()
}

function gitDate(files) {
  const result = spawnSync(
    'git',
    ['log', '-1', '--format=%cI', '--', ...files],
    { cwd: projectRoot, encoding: 'utf8' },
  )
  if (result.status !== 0) {
    throw new Error(`Unable to read Git lastmod: ${result.stderr.trim()}`)
  }
  const value = result.stdout.trim()
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value) || Number.isNaN(Date.parse(value))) {
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
  evidenceSchemaChanged = false,
  pathname = '<unknown>',
}) {
  if (previousDigest && previousDigest === currentDigest && previousLastModified) {
    return previousLastModified
  }
  if (previousDigest && previousDigest !== currentDigest && previousLastModified) {
    const previousTime = Date.parse(previousLastModified)
    const candidateTime = Date.parse(candidateLastModified)
    if (
      Number.isNaN(previousTime)
      || Number.isNaN(candidateTime)
    ) {
      throw new Error(`Semantic content changed without lastmod advancing for ${pathname}`)
    }
    if (evidenceSchemaChanged && candidateTime <= previousTime) {
      return previousLastModified
    }
    if (candidateTime <= previousTime) {
      throw new Error(`Semantic content changed without lastmod advancing for ${pathname}`)
    }
  }
  return candidateLastModified
}

export function collectRouteContentEvidence({
  previousLastModified = {},
  previousContentDigests = {},
  previousContentDigestVersion = 0,
} = {}) {
  const evidenceSchemaChanged = (
    previousContentDigestVersion !== ROUTE_CONTENT_DIGEST_VERSION
  )
  const filesByRoute = new Map(
    PUBLIC_PATHS.map((pathname) => [pathname, semanticRouteFiles(pathname)]),
  )
  const dirtyFiles = dirtyRouteFiles(new Set([...filesByRoute.values()].flat()))
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
          ? workingTreeDate(files.filter((file) => dirtyFiles.has(file)))
          : gitDate(files),
        evidenceSchemaChanged,
        pathname,
      }),
    ]),
  )
  return {
    lastModified,
    contentDigests,
    contentDigestVersion: ROUTE_CONTENT_DIGEST_VERSION,
  }
}

export function renderRouteLastModifiedModule(
  lastModified,
  contentDigests = {},
  contentDigestVersion = ROUTE_CONTENT_DIGEST_VERSION,
) {
  return [
    '// 由 scripts/generate-seo.mjs 从源码时间证据生成，请勿手改。',
    `export const ROUTE_CONTENT_DIGEST_VERSION = ${contentDigestVersion}`,
    `export const ROUTE_LAST_MODIFIED: Readonly<Record<string, string>> = Object.freeze(${JSON.stringify(lastModified, null, 2)})`,
    `export const ROUTE_CONTENT_DIGESTS: Readonly<Record<string, string>> = Object.freeze(${JSON.stringify(contentDigests, null, 2)})`,
    '',
  ].join('\n')
}
