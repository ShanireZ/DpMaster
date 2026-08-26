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

function childNodes(node) {
  const children = []
  for (const [key, value] of Object.entries(node)) {
    if (key === 'type' || key === 'start' || key === 'end') continue
    if (Array.isArray(value)) {
      for (const child of value) {
        if (child && typeof child === 'object' && typeof child.type === 'string') {
          children.push([child, key])
        }
      }
    } else if (value && typeof value === 'object' && typeof value.type === 'string') {
      children.push([value, key])
    }
  }
  return children
}

function bindingIdentifiers(pattern, identifiers = []) {
  if (!pattern || typeof pattern !== 'object') return identifiers
  if (pattern.type === 'Identifier') {
    identifiers.push(pattern)
  } else if (pattern.type === 'AssignmentPattern') {
    bindingIdentifiers(pattern.left, identifiers)
  } else if (pattern.type === 'RestElement') {
    bindingIdentifiers(pattern.argument, identifiers)
  } else if (pattern.type === 'ArrayPattern') {
    for (const element of pattern.elements) bindingIdentifiers(element, identifiers)
  } else if (pattern.type === 'ObjectPattern') {
    for (const property of pattern.properties) {
      if (property.type === 'Property') bindingIdentifiers(property.value, identifiers)
      if (property.type === 'RestElement') bindingIdentifiers(property.argument, identifiers)
    }
  } else if (pattern.type === 'TSParameterProperty') {
    bindingIdentifiers(pattern.parameter, identifiers)
  }
  return identifiers
}

function createScope(parent, kind) {
  return { parent, kind, bindings: new Map() }
}

function nearestFunctionScope(scope) {
  let current = scope
  while (current.parent && current.kind !== 'function' && current.kind !== 'program') {
    current = current.parent
  }
  return current
}

function semanticBindingGraph(program) {
  const rootScope = createScope(null, 'program')
  const nodeScopes = new WeakMap()
  const nodeParents = new WeakMap()
  const declaredIdentifiers = new WeakSet()

  function declare(pattern, scope, semanticNode) {
    for (const identifier of bindingIdentifiers(pattern)) {
      declaredIdentifiers.add(identifier)
      const existing = scope.bindings.get(identifier.name)
      if (existing) {
        if (semanticNode) existing.semanticNodes.add(semanticNode)
      } else {
        scope.bindings.set(identifier.name, {
          identifier,
          semanticNodes: new Set(semanticNode ? [semanticNode] : []),
          writes: [],
        })
      }
    }
  }

  function build(node, scope, parent = null, key = null, functionBody = false) {
    nodeScopes.set(node, scope)
    if (parent) nodeParents.set(node, { parent, key })

    if (node.type === 'Program') {
      for (const [child, childKey] of childNodes(node)) build(child, scope, node, childKey)
      return
    }
    if (
      node.type === 'FunctionDeclaration'
      || node.type === 'FunctionExpression'
      || node.type === 'ArrowFunctionExpression'
    ) {
      if (node.type === 'FunctionDeclaration' && node.id) declare(node.id, scope, node)
      const functionScope = createScope(scope, 'function')
      if (node.type === 'FunctionExpression' && node.id) {
        declare(node.id, functionScope, node)
      }
      for (const parameter of node.params ?? []) declare(parameter, functionScope, parameter)
      if (node.id) build(node.id, functionScope, node, 'id')
      for (const parameter of node.params ?? []) build(parameter, functionScope, node, 'params')
      if (node.body) build(node.body, functionScope, node, 'body', true)
      return
    }
    if (node.type === 'BlockStatement') {
      const blockScope = functionBody ? scope : createScope(scope, 'block')
      for (const [child, childKey] of childNodes(node)) build(child, blockScope, node, childKey)
      return
    }
    if (node.type === 'VariableDeclaration') {
      const declarationScope = node.kind === 'var' ? nearestFunctionScope(scope) : scope
      for (const declarator of node.declarations) {
        declare(declarator.id, declarationScope, node)
      }
      for (const [child, childKey] of childNodes(node)) build(child, scope, node, childKey)
      return
    }
    if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
      if (node.type === 'ClassDeclaration' && node.id) declare(node.id, scope, node)
      const classScope = createScope(scope, 'class')
      if (node.type === 'ClassDeclaration' && node.id) {
        const classBinding = scope.bindings.get(node.id.name)
        if (classBinding) classScope.bindings.set(node.id.name, classBinding)
      }
      if (node.type === 'ClassExpression' && node.id) declare(node.id, classScope, node)
      for (const [child, childKey] of childNodes(node)) {
        build(child, child === node.id ? scope : classScope, node, childKey)
      }
      return
    }
    if (node.type === 'CatchClause') {
      const catchScope = createScope(scope, 'block')
      if (node.param) declare(node.param, catchScope, node.param)
      for (const [child, childKey] of childNodes(node)) build(child, catchScope, node, childKey)
      return
    }
    if (node.type === 'ImportDeclaration') {
      for (const specifier of node.specifiers ?? []) {
        if (specifier.local) declare(specifier.local, scope, null)
      }
      for (const [child, childKey] of childNodes(node)) build(child, scope, node, childKey)
      return
    }
    if (node.type === 'TSEnumDeclaration' && node.id) declare(node.id, scope, node)
    for (const [child, childKey] of childNodes(node)) build(child, scope, node, childKey)
  }
  build(program, rootScope)

  function lookup(node) {
    let scope = nodeScopes.get(node)
    while (scope) {
      const binding = scope.bindings.get(node.name)
      if (binding) return binding
      scope = scope.parent
    }
    return null
  }

  function writtenBindings(node, bindings = []) {
    if (!node || typeof node !== 'object') return bindings
    if (node.type === 'Identifier') {
      const binding = lookup(node)
      if (binding) bindings.push(binding)
    } else if (node.type === 'AssignmentPattern') {
      writtenBindings(node.left, bindings)
    } else if (node.type === 'ArrayPattern' || node.type === 'ArrayExpression') {
      for (const element of node.elements) writtenBindings(element, bindings)
    } else if (node.type === 'ObjectPattern' || node.type === 'ObjectExpression') {
      for (const property of node.properties) {
        if (property.type === 'Property') writtenBindings(property.value, bindings)
        if (property.type === 'RestElement' || property.type === 'SpreadElement') {
          writtenBindings(property.argument, bindings)
        }
      }
    } else if (node.type === 'MemberExpression') {
      writtenBindings(node.object, bindings)
    } else if (node.type === 'ParenthesizedExpression') {
      writtenBindings(node.expression, bindings)
    }
    return bindings
  }

  function indexWrites(node) {
    if (node.type === 'AssignmentExpression') {
      for (const binding of writtenBindings(node.left)) binding.writes.push(node)
    }
    if (node.type === 'UpdateExpression') {
      for (const binding of writtenBindings(node.argument)) binding.writes.push(node)
    }
    for (const [child] of childNodes(node)) indexWrites(child)
  }
  indexWrites(program)

  function isTypeReference(node) {
    let current = node
    while (nodeParents.has(current)) {
      const { parent, key } = nodeParents.get(current)
      if (parent.type.startsWith('TS')) {
        if (
          (parent.type === 'TSAsExpression'
            || parent.type === 'TSSatisfiesExpression'
            || parent.type === 'TSNonNullExpression')
          && key === 'expression'
        ) {
          current = parent
          continue
        }
        return true
      }
      current = parent
    }
    return false
  }

  function isReference(node) {
    if (declaredIdentifiers.has(node) || isTypeReference(node)) return false
    const relation = nodeParents.get(node)
    if (!relation) return false
    const { parent, key } = relation
    if (node.type === 'JSXIdentifier') {
      if (parent.type === 'JSXAttribute' && key === 'name') return false
      if (parent.type === 'JSXMemberExpression' && key === 'property') return false
      if (/^[a-z]/.test(node.name)) return false
      return true
    }
    if (node.type !== 'Identifier') return false
    if (
      (parent.type === 'MemberExpression' && key === 'property' && !parent.computed)
      || (parent.type === 'Property' && key === 'key' && !parent.computed && !parent.shorthand)
      || (parent.type === 'MethodDefinition' && key === 'key' && !parent.computed)
      || parent.type === 'ImportSpecifier'
      || parent.type === 'ImportDefaultSpecifier'
      || parent.type === 'ImportNamespaceSpecifier'
      || parent.type === 'ExportSpecifier'
      || parent.type === 'LabeledStatement'
      || parent.type === 'BreakStatement'
      || parent.type === 'ContinueStatement'
    ) return false
    return true
  }

  return { childNodes, isReference, lookup }
}

export function semanticSourceForDigest(path, source) {
  const rootName = SEMANTIC_ELEMENT_ROOTS.get(path)
  if (!rootName) return source
  const { program, errors } = parseSync(path, source)
  if (errors.length > 0) {
    throw new Error(`Unable to parse semantic source ${path}: ${errors[0].message}`)
  }
  const bindingGraph = semanticBindingGraph(program)
  const roots = []
  function findRoots(node) {
    if (
      node.type === 'JSXElement'
      && source.slice(node.openingElement.name.start, node.openingElement.name.end) === rootName
    ) roots.push(node)
    for (const [child] of bindingGraph.childNodes(node)) findRoots(child)
  }
  findRoots(program)
  if (roots.length !== 1) {
    throw new Error(`Expected one semantic JSX root ${rootName} in ${path}, found ${roots.length}`)
  }

  const slices = new Set([roots[0]])
  const visitedBindings = new Set()
  const pendingNodes = [roots[0]]
  while (pendingNodes.length > 0) {
    const selectedNode = pendingNodes.pop()
    function collectReferences(node) {
      if (
        (node.type === 'Identifier' || node.type === 'JSXIdentifier')
        && bindingGraph.isReference(node)
      ) {
        const binding = bindingGraph.lookup(node)
        if (binding && !visitedBindings.has(binding)) {
          visitedBindings.add(binding)
          for (const semanticNode of binding.semanticNodes) {
            if (slices.has(semanticNode)) continue
            slices.add(semanticNode)
            pendingNodes.push(semanticNode)
          }
          for (const write of binding.writes) {
            if (!slices.has(write)) {
              slices.add(write)
              pendingNodes.push(write)
            }
          }
        }
      }
      for (const [child] of bindingGraph.childNodes(node)) collectReferences(child)
    }
    collectReferences(selectedNode)
  }

  const orderedSlices = [...slices]
    .sort((left, right) => left.start - right.start)
  const outermostSlices = orderedSlices.filter((node, index) => {
    const { start, end } = node
    return !orderedSlices.some((other, otherIndex) => (
      otherIndex !== index
      && other.start <= start
      && other.end >= end
    ))
  })
  return outermostSlices
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
