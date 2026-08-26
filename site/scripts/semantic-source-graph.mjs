import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseSync } from 'oxc-parser'

import { ROUTE_PAGE_MODULES, routeModuleIds } from './route-assets.mjs'

const projectRoot = fileURLToPath(new URL('../../', import.meta.url))
const PARSED_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx'])
const RESOLVED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json']
const SELF_GENERATED_FILES = new Set(['site/src/data/routeLastModified.ts'])

function projectPath(path) {
  return relative(projectRoot, path).replaceAll('\\', '/')
}

function resolveStaticImport(importer, specifier) {
  if (!specifier.startsWith('.')) return null
  const unresolved = resolve(dirname(importer), specifier)
  const candidates = extname(unresolved)
    ? [unresolved]
    : [
        ...RESOLVED_EXTENSIONS.map((extension) => `${unresolved}${extension}`),
        ...RESOLVED_EXTENSIONS.map((extension) => resolve(unresolved, `index${extension}`)),
      ]
  const resolved = candidates.find((candidate) => (
    existsSync(candidate) && statSync(candidate).isFile()
  ))
  if (!resolved || extname(resolved) === '.css') return null
  return resolved
}

function staticImportSpecifiers(path) {
  if (!PARSED_EXTENSIONS.has(extname(path))) return []
  const source = readFileSync(path, 'utf8')
  const { program, errors } = parseSync(path, source)
  if (errors.length > 0) {
    throw new Error(`Unable to parse semantic dependency ${path}: ${errors[0].message}`)
  }
  return program.body.flatMap((statement) => {
    if (
      statement.type !== 'ImportDeclaration'
      && statement.type !== 'ExportNamedDeclaration'
      && statement.type !== 'ExportAllDeclaration'
    ) return []
    if (statement.importKind === 'type' || statement.exportKind === 'type') return []
    return typeof statement.source?.value === 'string' ? [statement.source.value] : []
  })
}

export function semanticRouteFiles(pathname) {
  const routeModules = routeModuleIds(pathname)
  const routePages = new Set(ROUTE_PAGE_MODULES.map((moduleId) => `site/${moduleId}`))
  const allowedPages = new Set(
    routeModules
      .filter((moduleId) => moduleId.startsWith('src/pages/'))
      .map((moduleId) => `site/${moduleId}`),
  )
  const pending = [
    resolve(projectRoot, 'site/src/components/layout/Shell.tsx'),
    resolve(projectRoot, 'site/src/lib/pageMeta.ts'),
    resolve(projectRoot, 'site/src/lib/seoHead.ts'),
    ...routeModules.map((moduleId) => resolve(projectRoot, 'site', moduleId)),
  ]
  const visited = new Set()

  while (pending.length > 0) {
    const path = pending.pop()
    if (!path) continue
    const relativePath = projectPath(path)
    if (SELF_GENERATED_FILES.has(relativePath)) continue
    if (
      routePages.has(relativePath)
      && !allowedPages.has(relativePath)
    ) continue
    if (visited.has(relativePath)) continue
    visited.add(relativePath)

    for (const specifier of staticImportSpecifiers(path)) {
      const dependency = resolveStaticImport(path, specifier)
      if (dependency) pending.push(dependency)
    }
  }

  return [...visited].sort()
}
