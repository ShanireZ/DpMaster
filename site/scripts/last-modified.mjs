import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import { extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PUBLIC_PATHS } from '../src/lib/publicRoutes.ts'
import {
  semanticRuntimePackageNamesForRoute,
  semanticRouteFiles,
  semanticSourceForDigest,
} from './semantic-source-graph.mjs'

const projectRoot = fileURLToPath(new URL('../../', import.meta.url))
export const ROUTE_CONTENT_DIGEST_VERSION = 17

const historicalSourceCache = new Map()
const headSourceCache = new Map()
const routeProjectionCache = new Map()
const semanticFileEvidenceCache = new Map()
const TEXT_SOURCE_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.mjs',
  '.svg',
  '.ts',
  '.tsx',
  '.txt',
  '.xml',
  '.yaml',
  '.yml',
])

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

function runtimePackageKey(runtimePackages) {
  return [...runtimePackages].sort().join(',')
}

function routeContentDigest(files, runtimePackages) {
  const digest = createHash('sha256')
  for (const file of files) {
    digest.update(file)
    digest.update('\0')
    const cacheKey = `${file}\0${runtimePackageKey(runtimePackages)}`
    if (!routeProjectionCache.has(cacheKey)) {
      const source = readFileSync(new URL(`../../${file}`, import.meta.url))
      routeProjectionCache.set(
        cacheKey,
        semanticProjection(file, source, { runtimePackages }),
      )
    }
    digest.update(routeProjectionCache.get(cacheKey))
    digest.update('\0')
  }
  return digest.digest('hex')
}

function gitSource(file, revision) {
  const result = spawnSync('git', ['show', `${revision}:${file}`], {
    cwd: projectRoot,
  })
  return result.status === 0 ? result.stdout : null
}

function historicalSource(file, lastModified) {
  const cacheKey = `${file}\0${lastModified}`
  if (historicalSourceCache.has(cacheKey)) return historicalSourceCache.get(cacheKey)
  const revision = spawnSync(
    'git',
    ['log', '-1', '--format=%H', `--until=${lastModified}`, '--', file],
    { cwd: projectRoot, encoding: 'utf8' },
  )
  if (revision.status !== 0) {
    throw new Error(`Unable to inspect historical semantic source ${file}: ${revision.stderr.trim()}`)
  }
  const hash = revision.stdout.trim()
  const source = hash ? gitSource(file, hash) : null
  historicalSourceCache.set(cacheKey, source)
  return source
}

function headSource(file) {
  if (!headSourceCache.has(file)) headSourceCache.set(file, gitSource(file, 'HEAD'))
  return headSourceCache.get(file)
}

function semanticProjection(path, source, options = {}) {
  if (source === null) return null
  if (Buffer.isBuffer(source) && !TEXT_SOURCE_EXTENSIONS.has(extname(path))) return source
  const decodedSource = Buffer.isBuffer(source) ? source.toString('utf8') : source
  return normalizeContentForDigest(semanticSourceForDigest(path, decodedSource, options))
}

export function semanticProjectionChanged(path, currentSource, previousSource, options = {}) {
  const currentProjection = semanticProjection(path, currentSource, options)
  const previousProjection = semanticProjection(path, previousSource, options)
  if (Buffer.isBuffer(currentProjection) && Buffer.isBuffer(previousProjection)) {
    return !currentProjection.equals(previousProjection)
  }
  return currentProjection !== previousProjection
}

function latestDate(dates) {
  return dates.reduce((latest, candidate) => (
    !latest || Date.parse(candidate) > Date.parse(latest) ? candidate : latest
  ), null)
}

function latestSemanticGitDate(file, previousLastModified, options) {
  const history = spawnSync(
    'git',
    ['log', `--since=${previousLastModified}`, '--format=%H%x09%cI', 'HEAD', '--', file],
    { cwd: projectRoot, encoding: 'utf8' },
  )
  if (history.status !== 0) {
    throw new Error(`Unable to inspect semantic history for ${file}: ${history.stderr.trim()}`)
  }
  for (const line of history.stdout.split('\n').filter(Boolean)) {
    const [revision, committedAt] = line.split('\t')
    if (semanticProjectionChanged(
      file,
      gitSource(file, revision),
      gitSource(file, `${revision}^`),
      options,
    )) return committedAt
  }
  throw new Error(`Semantic source changed without a matching Git revision for ${file}`)
}

function semanticChangeEvidence(files, previousLastModified, runtimePackages) {
  const dates = []
  for (const file of files) {
    const options = { runtimePackages }
    const cacheKey = `${file}\0${previousLastModified}\0${runtimePackageKey(runtimePackages)}`
    if (!semanticFileEvidenceCache.has(cacheKey)) {
      const currentSource = readFileSync(new URL(`../../${file}`, import.meta.url))
      let date = null
      if (semanticProjectionChanged(
        file,
        currentSource,
        historicalSource(file, previousLastModified),
        options,
      )) {
        const currentDiffersFromHead = semanticProjectionChanged(
          file,
          currentSource,
          headSource(file),
          options,
        )
        date = currentDiffersFromHead
          ? new Date(statSync(new URL(`../../${file}`, import.meta.url)).mtimeMs).toISOString()
          : latestSemanticGitDate(file, previousLastModified, options)
      }
      semanticFileEvidenceCache.set(cacheKey, date)
    }
    const date = semanticFileEvidenceCache.get(cacheKey)
    if (date) dates.push(date)
  }
  return {
    candidateLastModified: latestDate(dates),
    hasSemanticContentChange: dates.length > 0,
  }
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
  hasSemanticContentChange = false,
  pathname = '<unknown>',
}) {
  if (previousDigest && previousDigest === currentDigest && previousLastModified) {
    return previousLastModified
  }
  if (previousDigest && previousDigest !== currentDigest && previousLastModified) {
    if (evidenceSchemaChanged && !hasSemanticContentChange) {
      return previousLastModified
    }
    const previousTime = Date.parse(previousLastModified)
    const candidateTime = Date.parse(candidateLastModified)
    if (
      Number.isNaN(previousTime)
      || Number.isNaN(candidateTime)
    ) {
      throw new Error(`Semantic content changed without lastmod advancing for ${pathname}`)
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
  const packagesByRoute = new Map(
    PUBLIC_PATHS.map((pathname) => [
      pathname,
      semanticRuntimePackageNamesForRoute(pathname),
    ]),
  )
  const dirtyFiles = dirtyRouteFiles(new Set([...filesByRoute.values()].flat()))
  const contentDigests = Object.fromEntries(
    [...filesByRoute].map(([pathname, files]) => [
      pathname,
      routeContentDigest(files, packagesByRoute.get(pathname)),
    ]),
  )

  const lastModified = Object.fromEntries(
    [...filesByRoute].map(([pathname, files]) => {
      const digestChanged = (
        previousContentDigests[pathname]
        && previousContentDigests[pathname] !== contentDigests[pathname]
      )
      const semanticEvidence = previousLastModified[pathname] && digestChanged
        ? semanticChangeEvidence(
            files,
            previousLastModified[pathname],
            packagesByRoute.get(pathname),
          )
        : null
      if (
        digestChanged
        && !evidenceSchemaChanged
        && semanticEvidence
        && !semanticEvidence.hasSemanticContentChange
      ) {
        throw new Error(`Digest changed without semantic source evidence for ${pathname}`)
      }
      const dirtyRouteFiles = files.filter((file) => dirtyFiles.has(file))
      return [pathname, resolveContentLastModified({
        previousDigest: previousContentDigests[pathname],
        currentDigest: contentDigests[pathname],
        previousLastModified: previousLastModified[pathname],
        candidateLastModified: semanticEvidence?.candidateLastModified
          ?? (dirtyRouteFiles.length > 0 ? workingTreeDate(dirtyRouteFiles) : gitDate(files)),
        evidenceSchemaChanged,
        hasSemanticContentChange: semanticEvidence?.hasSemanticContentChange ?? false,
        pathname,
      })]
    }),
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
