import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseSync } from 'oxc-parser'

import { ROUTE_PAGE_MODULES, routeModuleIds } from './route-assets.mjs'

const projectRoot = fileURLToPath(new URL('../../', import.meta.url))
const PARSED_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx'])
const RESOLVED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json']
const SELF_GENERATED_FILES = new Set(['site/src/data/routeLastModified.ts'])
const NON_SEMANTIC_FILES = new Set([
  'site/src/components/feedback/FeedbackWidget.tsx',
  'site/src/components/layout/ErrorBoundary.tsx',
  'site/src/components/layout/Sidebar.tsx',
  'site/src/components/layout/TopBar.tsx',
  'site/src/components/seo/RouteMeta.tsx',
  'site/src/lib/hashNavigation.ts',
  'site/src/pages/HomeMotionController.tsx',
  'site/src/theme/ThemeContext.tsx',
])
const NON_SEMANTIC_PREFIXES = ['site/src/analytics/']
const SEMANTIC_ELEMENT_ROOTS = new Map([
  ['site/src/app/AppContent.tsx', 'Routes'],
  ['site/src/components/layout/Shell.tsx', 'main'],
  ['site/src/components/layout/RouteStage.tsx', 'motion.div'],
])

function isNonSemanticFile(path) {
  return (
    NON_SEMANTIC_FILES.has(path)
    || NON_SEMANTIC_PREFIXES.some((prefix) => path.startsWith(prefix))
  )
}

function visitNodes(value, visitor, parent = null) {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    for (const entry of value) visitNodes(entry, visitor, parent)
    return
  }
  if (typeof value.type === 'string') visitor(value, parent)
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') visitNodes(child, visitor, value)
  }
}

function boundNames(pattern) {
  if (!pattern || typeof pattern !== 'object') return []
  if (pattern.type === 'Identifier') return [pattern.name]
  if (pattern.type === 'AssignmentPattern') return boundNames(pattern.left)
  if (pattern.type === 'RestElement') return boundNames(pattern.argument)
  if (pattern.type === 'ArrayPattern') {
    return pattern.elements.flatMap((element) => boundNames(element))
  }
  if (pattern.type === 'ObjectPattern') {
    return pattern.properties.flatMap((property) => (
      property.type === 'Property'
        ? boundNames(property.value)
        : boundNames(property.argument)
    ))
  }
  return []
}

function referencedNames(node) {
  const names = new Set()
  visitNodes(node, (candidate) => {
    if (candidate.type === 'Identifier' || candidate.type === 'JSXIdentifier') {
      names.add(candidate.name)
    }
  })
  return names
}

export function semanticSourceForDigest(path, source) {
  const rootName = SEMANTIC_ELEMENT_ROOTS.get(path)
  if (!rootName) return source
  const { program, errors } = parseSync(path, source)
  if (errors.length > 0) {
    throw new Error(`Unable to parse semantic source ${path}: ${errors[0].message}`)
  }

  const declarations = new Map()
  const roots = []
  visitNodes(program, (node, parent) => {
    if (node.type === 'FunctionDeclaration' && node.id?.name) {
      declarations.set(node.id.name, node)
    }
    if (node.type === 'VariableDeclarator') {
      const declaration = parent?.type === 'VariableDeclaration' ? parent : node
      for (const name of boundNames(node.id)) declarations.set(name, declaration)
    }
    if (
      node.type === 'JSXElement'
      && source.slice(node.openingElement.name.start, node.openingElement.name.end) === rootName
    ) {
      roots.push(node)
    }
  })
  if (roots.length !== 1) {
    throw new Error(`Expected one semantic JSX root ${rootName} in ${path}, found ${roots.length}`)
  }

  const slices = new Map()
  const pendingNames = [...referencedNames(roots[0])]
  slices.set(`${roots[0].start}:${roots[0].end}`, roots[0])
  while (pendingNames.length > 0) {
    const name = pendingNames.pop()
    const declaration = declarations.get(name)
    if (!declaration) continue
    const key = `${declaration.start}:${declaration.end}`
    if (slices.has(key)) continue
    slices.set(key, declaration)
    pendingNames.push(...referencedNames(declaration))
  }

  return [...slices.values()]
    .sort((left, right) => left.start - right.start)
    .map((node) => source.slice(node.start, node.end))
    .join('\n')
}

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
    resolve(projectRoot, 'site/src/entry-server.tsx'),
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
    if (isNonSemanticFile(relativePath)) continue
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
