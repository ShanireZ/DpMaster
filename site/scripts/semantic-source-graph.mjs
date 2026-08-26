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
const CLIENT_EFFECT_CALLEES = new Set([
  'useEffect',
  'useInsertionEffect',
  'useLayoutEffect',
])
const MUTATING_MEMBER_CALLEES = new Set([
  'add',
  'clear',
  'copyWithin',
  'delete',
  'fill',
  'pop',
  'push',
  'reverse',
  'set',
  'shift',
  'sort',
  'splice',
  'unshift',
])
const STATIC_TARGET_MUTATORS = new Map([
  ['Object', new Set([
    'assign',
    'defineProperties',
    'defineProperty',
    'setPrototypeOf',
  ])],
  ['Reflect', new Set([
    'defineProperty',
    'deleteProperty',
    'set',
    'setPrototypeOf',
  ])],
])
const EXPRESSION_WRAPPERS = new Set([
  'ParenthesizedExpression',
  'TSAsExpression',
  'TSInstantiationExpression',
  'TSNonNullExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
])
const TYPE_ONLY_KEYS = new Set([
  'accessibility',
  'abstract',
  'declare',
  'definite',
  'implements',
  'importKind',
  'override',
  'readonly',
  'returnType',
  'typeAnnotation',
  'typeArguments',
  'typeParameters',
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

function projectRuntimeObject(value, overrides = {}, options = {}) {
  const projected = {}
  const source = { ...value, ...overrides }
  for (const key of Object.keys(source).sort()) {
    if (
      key === 'end'
      || key === 'loc'
      || key === 'raw'
      || key === 'start'
      || (key === 'optional'
        && value.type !== 'CallExpression'
        && value.type !== 'MemberExpression')
      || TYPE_ONLY_KEYS.has(key)
    ) continue
    const child = runtimeAstProjection(source[key], options)
    if (child !== null) projected[key] = child
  }
  return projected
}

function runtimeAstProjection(value, options = {}) {
  if (Array.isArray(value)) {
    return value
      .map((item) => runtimeAstProjection(item, options))
      .filter((item) => item !== null)
  }
  if (typeof value === 'string') {
    return value.replaceAll('\r\n', '\n').replaceAll('\r', '\n')
  }
  if (!value || typeof value !== 'object') return value
  if (value.type === 'CallExpression' && options.isClientEffectCall?.(value)) {
    return projectRuntimeObject(value, {
      arguments: [
        { type: 'ClientEffectCallback' },
        ...(value.arguments?.slice(1) ?? []),
      ],
    }, options)
  }
  if (EXPRESSION_WRAPPERS.has(value.type)) {
    return runtimeAstProjection(value.expression, options)
  }
  if (value.type === 'TSParameterProperty') {
    return projectRuntimeObject(value, {}, options)
  }
  if (
    typeof value.type === 'string'
    && value.type.startsWith('TS')
    && value.type !== 'TSEnumDeclaration'
    && value.type !== 'TSModuleDeclaration'
  ) return null
  if (value.type === 'ImportDeclaration') {
    const specifiers = value.specifiers.filter((specifier) => specifier.importKind !== 'type')
    if (value.importKind === 'type' || (value.specifiers.length > 0 && specifiers.length === 0)) {
      return null
    }
    return projectRuntimeObject(value, { specifiers }, options)
  }
  if (value.type === 'ExportNamedDeclaration') {
    const specifiers = value.specifiers.filter((specifier) => specifier.exportKind !== 'type')
    if (value.exportKind === 'type' || (value.specifiers.length > 0 && specifiers.length === 0)) {
      return null
    }
    return projectRuntimeObject(value, { specifiers }, options)
  }
  if (value.type === 'ExportAllDeclaration' && value.exportKind === 'type') return null

  return projectRuntimeObject(value, {}, options)
}

function memberNameFromNode(member) {
  if (member?.type !== 'MemberExpression') return null
  if (!member.computed && member.property.type === 'Identifier') return member.property.name
  if (
    member.computed
    && (member.property.type === 'StringLiteral' || member.property.type === 'Literal')
  ) return member.property.value
  return null
}

function publicSiteConfigProjection(program) {
  const selectedKeys = new Map([
    ['BRAND', new Set(['name', 'owner', 'subtitle'])],
    ['SITE', new Set(['language', 'origin'])],
  ])
  const bindings = new Map()
  const bindingKinds = new Map()
  for (const statement of program.body) {
    const declaration = statement.type === 'ExportNamedDeclaration'
      ? statement.declaration
      : statement
    if (declaration?.type !== 'VariableDeclaration') continue
    for (const declarator of declaration.declarations) {
      if (declarator.id.type === 'Identifier' && declarator.init) {
        bindings.set(declarator.id.name, declarator.init)
        bindingKinds.set(declarator.id.name, declaration.kind)
      }
    }
  }

  const unsupported = (detail) => {
    throw new Error(`Unsupported public site configuration: ${detail}`)
  }
  const usedBindings = new Set()
  const bindingValue = (name) => {
    if (bindingKinds.get(name) !== 'const') return unsupported(`mutable binding ${name}`)
    usedBindings.add(name)
    return bindings.get(name)
  }
  const unwrap = (node) => (
    node && EXPRESSION_WRAPPERS.has(node.type) ? unwrap(node.expression) : node
  )
  const staticKey = (node, stack = new Set()) => {
    const value = unwrap(node)
    if (value?.type === 'Literal' || value?.type === 'StringLiteral') {
      return typeof value.value === 'string' ? value.value : unsupported('non-string key')
    }
    if (value?.type === 'Identifier' && bindings.has(value.name)) {
      if (stack.has(value.name)) return unsupported(`cyclic binding ${value.name}`)
      return staticKey(bindingValue(value.name), new Set([...stack, value.name]))
    }
    return unsupported('dynamic computed key')
  }
  const propertyKey = (property, stack) => (
    property.computed
      ? staticKey(property.key, stack)
      : property.key.type === 'Identifier'
        ? property.key.name
        : property.key.value
  )
  const resolveObject = (node, stack = new Set()) => {
    const value = unwrap(node)
    if (value?.type === 'Identifier' && bindings.has(value.name)) {
      if (stack.has(value.name)) return unsupported(`cyclic binding ${value.name}`)
      return resolveObject(bindingValue(value.name), new Set([...stack, value.name]))
    }
    if (
      value?.type === 'CallExpression'
      && value.callee.type === 'MemberExpression'
      && value.callee.object.type === 'Identifier'
      && value.callee.object.name === 'Object'
      && !bindings.has('Object')
      && memberNameFromNode(value.callee) === 'freeze'
      && value.arguments?.length === 1
    ) return resolveObject(value.arguments[0], stack)
    if (value?.type !== 'ObjectExpression') return unsupported('expected a static object')
    const properties = new Map()
    for (const property of value.properties) {
      if (property.type === 'SpreadElement') {
        for (const [name, spreadValue] of resolveObject(property.argument, stack)) {
          properties.set(name, spreadValue)
        }
        continue
      }
      if (property.type !== 'Property' || property.kind !== 'init' || property.method) {
        return unsupported('getter, setter, or method property')
      }
      properties.set(propertyKey(property, stack), property.value)
    }
    return properties
  }
  const projectValue = (node, stack = new Set()) => {
    const value = unwrap(node)
    if (value?.type === 'Identifier' && bindings.has(value.name)) {
      if (stack.has(value.name)) return unsupported(`cyclic binding ${value.name}`)
      return projectValue(bindingValue(value.name), new Set([...stack, value.name]))
    }
    if (value?.type === 'MemberExpression') {
      const name = memberNameFromNode(value)
      if (name === null) return unsupported('dynamic member lookup')
      if (
        value.object.type === 'Identifier'
        && selectedKeys.get(value.object.name)?.has(name)
      ) return runtimeAstProjection(value)
      const memberValue = resolveObject(value.object, stack).get(name)
      if (!memberValue) return unsupported(`missing member ${name}`)
      return projectValue(memberValue, stack)
    }
    if (
      value?.type === 'Literal'
      || value?.type === 'StringLiteral'
      || (value?.type === 'TemplateLiteral' && value.expressions.length === 0)
    ) return runtimeAstProjection(value)
    return unsupported(`dynamic value ${value?.type ?? '<missing>'}`)
  }

  const projection = {}
  for (const [bindingName, keys] of selectedKeys) {
    if (!bindings.has(bindingName)) return unsupported(`missing ${bindingName}`)
    const object = resolveObject(bindingValue(bindingName), new Set([bindingName]))
    projection[bindingName] = [...object].flatMap(([name, value]) => (
      keys.has(name) ? [{ name, value: projectValue(value) }] : []
    ))
    for (const name of keys) {
      if (!object.has(name)) return unsupported(`missing ${bindingName}.${name}`)
    }
  }
  if (!bindings.has('SITE_ORIGIN')) return unsupported('missing SITE_ORIGIN')
  projection.SITE_ORIGIN = projectValue(bindingValue('SITE_ORIGIN'))
  if (!projection.BRAND || !projection.SITE || !projection.SITE_ORIGIN) {
    throw new Error('Missing public site configuration projection')
  }

  const identityNames = (node, names = new Set()) => {
    const value = unwrap(node)
    if (!value || typeof value !== 'object') return names
    if (value.type === 'Identifier') {
      names.add(value.name)
    } else if (value.type === 'MemberExpression') {
      identityNames(value.object, names)
    } else if (value.type === 'ArrayExpression') {
      for (const element of value.elements) identityNames(element, names)
    } else if (value.type === 'ObjectExpression') {
      for (const property of value.properties) {
        identityNames(
          property.type === 'SpreadElement' ? property.argument : property.value,
          names,
        )
      }
    } else if (value.type === 'ConditionalExpression') {
      identityNames(value.consequent, names)
      identityNames(value.alternate, names)
    } else if (value.type === 'LogicalExpression') {
      identityNames(value.left, names)
      identityNames(value.right, names)
    } else if (value.type === 'SequenceExpression') {
      for (const expression of value.expressions) identityNames(expression, names)
    } else if (value.type === 'AwaitExpression' || value.type === 'YieldExpression') {
      identityNames(value.argument, names)
    }
    return names
  }
  const rejectUsedIdentity = (node, detail) => {
    for (const name of identityNames(node)) {
      if (usedBindings.has(name)) return unsupported(`${detail} ${name}`)
    }
  }
  const scanMutations = (node) => {
    if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') {
      rejectUsedIdentity(node.type === 'AssignmentExpression' ? node.left : node.argument, 'mutation of')
    } else if (node.type === 'UnaryExpression' && node.operator === 'delete') {
      rejectUsedIdentity(node.argument, 'mutation of')
    } else if (node.type === 'CallExpression' || node.type === 'NewExpression') {
      const safeObjectFreeze = node.type === 'CallExpression'
        && node.callee.type === 'MemberExpression'
        && node.callee.object.type === 'Identifier'
        && node.callee.object.name === 'Object'
        && !bindings.has('Object')
        && memberNameFromNode(node.callee) === 'freeze'
      if (!safeObjectFreeze) {
        if (node.callee.type === 'MemberExpression') {
          rejectUsedIdentity(node.callee.object, 'call through')
        }
        for (const argument of node.arguments ?? []) {
          rejectUsedIdentity(argument, 'escape of')
        }
      }
    }
    for (const [child] of childNodes(node)) scanMutations(child)
  }
  scanMutations(program)
  return projection
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

function createScope(parent, kind, ownerNode = null) {
  return { parent, kind, ownerNode, bindings: new Map() }
}

function nearestFunctionScope(scope) {
  let current = scope
  while (current.parent && current.kind !== 'function' && current.kind !== 'program') {
    current = current.parent
  }
  return current
}

function nearestVarScope(scope) {
  let current = scope
  while (
    current.parent
    && current.kind !== 'function'
    && current.kind !== 'program'
    && current.kind !== 'static-block'
  ) {
    current = current.parent
  }
  return current
}

function canonicalImportIdentity(importerPath, specifier) {
  if (!specifier.startsWith('.')) return specifier
  const importer = resolve(projectRoot, importerPath)
  const resolvedImport = resolveStaticImport(importer, specifier)
  if (resolvedImport) return projectPath(resolvedImport)

  const unresolved = projectPath(resolve(dirname(importer), specifier))
    .replace(/\.(?:m?[jt]sx?|json)$/u, '')
  return unresolved.endsWith('/index') ? unresolved.slice(0, -'/index'.length) : unresolved
}

function semanticBindingGraph(program, path) {
  const rootScope = createScope(null, 'program', program)
  const nodeScopes = new WeakMap()
  const nodeParents = new WeakMap()
  const declaredIdentifiers = new WeakSet()
  const importedBindingsByIdentity = new Map()
  const reactNamespaceBindings = new Set()
  const sideEffectImports = []
  const synchronousCalls = []
  const unresolvedMutations = []

  function declare(pattern, scope, semanticNode, metadata = {}) {
    const { valueOrigins = [], ...bindingMetadata } = metadata
    for (const identifier of bindingIdentifiers(pattern)) {
      declaredIdentifiers.add(identifier)
      const existing = scope.bindings.get(identifier.name)
      if (existing) {
        if (semanticNode) existing.semanticNodes.add(semanticNode)
      } else {
        const binding = {
          aliasUnstable: false,
          callable: false,
          dynamicIdentity: false,
          executionScope: nearestFunctionScope(scope),
          identifier,
          valueOrigins: new Set(valueOrigins),
          ...bindingMetadata,
          semanticNodes: new Set(semanticNode ? [semanticNode] : []),
          writes: [],
        }
        binding.aliases = new Set([binding])
        scope.bindings.set(identifier.name, binding)
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
      if (node.type === 'FunctionDeclaration' && node.id) {
        declare(node.id, scope, node, { callable: true, valueOrigins: ['other'] })
      }
      const functionScope = createScope(scope, 'function', node)
      if (node.type === 'FunctionExpression' && node.id) {
        declare(node.id, functionScope, node, { callable: true, valueOrigins: ['other'] })
      }
      for (const parameter of node.params ?? []) {
        declare(parameter, functionScope, parameter, { valueOrigins: ['other'] })
      }
      if (node.id) build(node.id, functionScope, node, 'id')
      for (const parameter of node.params ?? []) build(parameter, functionScope, node, 'params')
      if (node.body) build(node.body, functionScope, node, 'body', true)
      for (const [child, childKey] of childNodes(node)) {
        if (child === node.id || child === node.body || childKey === 'params') continue
        build(child, functionScope, node, childKey)
      }
      return
    }
    if (node.type === 'BlockStatement') {
      const blockScope = functionBody ? scope : createScope(scope, 'block')
      for (const [child, childKey] of childNodes(node)) build(child, blockScope, node, childKey)
      return
    }
    if (node.type === 'SwitchStatement') {
      build(node.discriminant, scope, node, 'discriminant')
      const lexicalScope = createScope(scope, 'block')
      for (const switchCase of node.cases ?? []) {
        build(switchCase, lexicalScope, node, 'cases')
      }
      return
    }
    if (
      node.type === 'ForStatement'
      || node.type === 'ForInStatement'
      || node.type === 'ForOfStatement'
    ) {
      const lexicalScope = createScope(scope, 'block')
      for (const [child, childKey] of childNodes(node)) build(child, lexicalScope, node, childKey)
      return
    }
    if (node.type === 'VariableDeclaration') {
      const declarationScope = node.kind === 'var' ? nearestVarScope(scope) : scope
      for (const declarator of node.declarations) {
        declare(declarator.id, declarationScope, node)
      }
      for (const [child, childKey] of childNodes(node)) build(child, scope, node, childKey)
      return
    }
    if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
      if (node.type === 'ClassDeclaration' && node.id) {
        declare(node.id, scope, node, { valueOrigins: ['other'] })
      }
      const classScope = createScope(scope, 'class')
      if (node.type === 'ClassDeclaration' && node.id) {
        const classBinding = scope.bindings.get(node.id.name)
        if (classBinding) classScope.bindings.set(node.id.name, classBinding)
      }
      if (node.type === 'ClassExpression' && node.id) {
        declare(node.id, classScope, node, { valueOrigins: ['other'] })
      }
      for (const [child, childKey] of childNodes(node)) {
        build(child, child === node.id ? scope : classScope, node, childKey)
      }
      return
    }
    if (node.type === 'StaticBlock') {
      const staticBlockScope = createScope(scope, 'static-block')
      for (const [child, childKey] of childNodes(node)) {
        build(child, staticBlockScope, node, childKey)
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
      if (node.importKind !== 'type' && (node.specifiers?.length ?? 0) === 0) {
        sideEffectImports.push(node)
      }
      for (const specifier of node.specifiers ?? []) {
        if (
          !specifier.local
          || node.importKind === 'type'
          || specifier.importKind === 'type'
        ) continue
        const importedName = specifier.type === 'ImportSpecifier'
          ? (specifier.imported?.name ?? specifier.imported?.value)
          : specifier.type === 'ImportNamespaceSpecifier'
            ? '*'
            : 'default'
        declare(specifier.local, scope, specifier, {
          importIdentity: canonicalImportIdentity(path, node.source?.value),
          importSource: node.source?.value,
          importedName,
          valueOrigins: node.source?.value === 'react'
            && CLIENT_EFFECT_CALLEES.has(importedName)
            ? ['react-effect']
            : node.source?.value === 'react'
              && (importedName === '*' || importedName === 'default')
              ? ['react-namespace']
              : ['other'],
        })
        const binding = scope.bindings.get(specifier.local.name)
        if (binding && node.source) {
          if (
            node.source.value === 'react'
            && (importedName === '*' || importedName === 'default')
          ) reactNamespaceBindings.add(binding)
          binding.semanticNodes.add(node.source)
          const identityBindings = importedBindingsByIdentity.get(binding.importIdentity) ?? new Set()
          identityBindings.add(binding)
          importedBindingsByIdentity.set(binding.importIdentity, identityBindings)
        }
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
    } else if (node.type === 'NewExpression') {
      for (const argument of node.arguments ?? []) writtenBindings(argument, bindings)
    } else if (node.type === 'ConditionalExpression') {
      writtenBindings(node.consequent, bindings)
      writtenBindings(node.alternate, bindings)
    } else if (node.type === 'LogicalExpression') {
      writtenBindings(node.left, bindings)
      writtenBindings(node.right, bindings)
    } else if (node.type === 'SequenceExpression') {
      for (const expression of node.expressions) writtenBindings(expression, bindings)
    } else if (node.type === 'AwaitExpression' || node.type === 'YieldExpression') {
      writtenBindings(node.argument, bindings)
    } else if (node.type === 'RestElement' || node.type === 'SpreadElement') {
      writtenBindings(node.argument, bindings)
    } else if (EXPRESSION_WRAPPERS.has(node.type)) {
      writtenBindings(node.expression, bindings)
    }
    return bindings
  }

  function identityBindings(node, bindings = []) {
    if (!node || typeof node !== 'object') return bindings
    if (node.type === 'Identifier') {
      const binding = lookup(node)
      if (binding) bindings.push(binding)
    } else if (node.type === 'AssignmentPattern') {
      identityBindings(node.left, bindings)
      identityBindings(node.right, bindings)
    } else if (node.type === 'ArrayPattern') {
      for (const element of node.elements) {
        if (element?.type !== 'RestElement') identityBindings(element, bindings)
      }
    } else if (node.type === 'ObjectPattern') {
      for (const property of node.properties) {
        if (property.type === 'Property') identityBindings(property.value, bindings)
      }
    } else if (node.type === 'MemberExpression') {
      identityBindings(node.object, bindings)
    } else if (node.type === 'ArrayExpression') {
      for (const element of node.elements) identityBindings(element, bindings)
    } else if (node.type === 'ObjectExpression') {
      for (const property of node.properties) {
        if (property.type === 'Property') identityBindings(property.value, bindings)
      }
    } else if (node.type === 'NewExpression') {
      for (const argument of node.arguments ?? []) identityBindings(argument, bindings)
    } else if (node.type === 'ConditionalExpression') {
      identityBindings(node.consequent, bindings)
      identityBindings(node.alternate, bindings)
    } else if (node.type === 'LogicalExpression') {
      identityBindings(node.left, bindings)
      identityBindings(node.right, bindings)
    } else if (node.type === 'SequenceExpression') {
      for (const expression of node.expressions) identityBindings(expression, bindings)
    } else if (node.type === 'AwaitExpression' || node.type === 'YieldExpression') {
      identityBindings(node.argument, bindings)
    } else if (EXPRESSION_WRAPPERS.has(node.type)) {
      identityBindings(node.expression, bindings)
    }
    return bindings
  }

  function isMemberMutationTarget(node) {
    if (!node || typeof node !== 'object') return false
    if (node.type === 'MemberExpression') return true
    if (EXPRESSION_WRAPPERS.has(node.type)) {
      return isMemberMutationTarget(node.expression)
    }
    return false
  }

  function containsDynamicIdentity(node) {
    if (!node || typeof node !== 'object') return false
    if (node.type === 'CallExpression') return true
    if (node.type === 'MemberExpression') return containsDynamicIdentity(node.object)
    if (node.type === 'ConditionalExpression') {
      return containsDynamicIdentity(node.consequent)
        || containsDynamicIdentity(node.alternate)
    }
    if (node.type === 'LogicalExpression') {
      return containsDynamicIdentity(node.left) || containsDynamicIdentity(node.right)
    }
    if (node.type === 'SequenceExpression') {
      return node.expressions.some(containsDynamicIdentity)
    }
    if (EXPRESSION_WRAPPERS.has(node.type)) return containsDynamicIdentity(node.expression)
    return false
  }

  function hasDynamicInitializer(node) {
    if (!node || typeof node !== 'object') return false
    if (node.type === 'CallExpression' || node.type === 'NewExpression') return true
    if (node.type === 'ObjectExpression') {
      return node.properties.some((property) => (
        property.type === 'Property'
        && (property.kind === 'get' || property.kind === 'set' || hasDynamicInitializer(property.value))
      ))
    }
    if (node.type === 'ArrayExpression') return node.elements.some(hasDynamicInitializer)
    if (node.type === 'ConditionalExpression') {
      return hasDynamicInitializer(node.consequent) || hasDynamicInitializer(node.alternate)
    }
    if (node.type === 'LogicalExpression') {
      return hasDynamicInitializer(node.left) || hasDynamicInitializer(node.right)
    }
    if (node.type === 'SequenceExpression') {
      return node.expressions.some(hasDynamicInitializer)
    }
    if (EXPRESSION_WRAPPERS.has(node.type)) return hasDynamicInitializer(node.expression)
    return false
  }

  function mergeAliases(bindings, unstable = false) {
    const uniqueBindings = [...new Set(bindings)]
    if (uniqueBindings.length < 2) return
    const merged = new Set(uniqueBindings.flatMap((binding) => [...binding.aliases]))
    const aliasUnstable = unstable || [...merged].some((binding) => binding.aliasUnstable)
    for (const binding of merged) {
      binding.aliases = merged
      binding.aliasUnstable = aliasUnstable
    }
  }

  function reassignedBindings(node, bindings = []) {
    if (!node || typeof node !== 'object') return bindings
    if (node.type === 'Identifier') {
      const binding = lookup(node)
      if (binding) bindings.push(binding)
    } else if (node.type === 'AssignmentPattern') {
      reassignedBindings(node.left, bindings)
    } else if (node.type === 'ArrayPattern') {
      for (const element of node.elements) reassignedBindings(element, bindings)
    } else if (node.type === 'ObjectPattern') {
      for (const property of node.properties) {
        if (property.type === 'Property') reassignedBindings(property.value, bindings)
        if (property.type === 'RestElement') reassignedBindings(property.argument, bindings)
      }
    } else if (node.type === 'RestElement') {
      reassignedBindings(node.argument, bindings)
    } else if (EXPRESSION_WRAPPERS.has(node.type)) {
      reassignedBindings(node.expression, bindings)
    }
    return bindings
  }

  function aliasTargetBindings(node, bindings = []) {
    if (!node || typeof node !== 'object') return bindings
    if (node.type === 'Identifier') {
      const binding = lookup(node)
      if (binding) bindings.push(binding)
    } else if (node.type === 'AssignmentPattern') {
      aliasTargetBindings(node.left, bindings)
    } else if (node.type === 'ArrayPattern') {
      for (const element of node.elements) {
        if (element?.type !== 'RestElement') aliasTargetBindings(element, bindings)
      }
    } else if (node.type === 'ObjectPattern') {
      for (const property of node.properties) {
        if (property.type === 'Property') aliasTargetBindings(property.value, bindings)
      }
    } else if (EXPRESSION_WRAPPERS.has(node.type)) {
      aliasTargetBindings(node.expression, bindings)
    }
    return bindings
  }

  function patternDefaultBindings(node, bindings = []) {
    if (!node || typeof node !== 'object') return bindings
    if (node.type === 'AssignmentPattern') {
      identityBindings(node.right, bindings)
      patternDefaultBindings(node.left, bindings)
    } else if (node.type === 'ArrayPattern') {
      for (const element of node.elements) {
        if (element?.type !== 'RestElement') patternDefaultBindings(element, bindings)
      }
    } else if (node.type === 'ObjectPattern') {
      for (const property of node.properties) {
        if (property.type === 'Property') patternDefaultBindings(property.value, bindings)
      }
    } else if (EXPRESSION_WRAPPERS.has(node.type)) {
      patternDefaultBindings(node.expression, bindings)
    }
    return bindings
  }

  function indexAliases(node) {
    if (node.type === 'VariableDeclarator' && node.init) {
      const targets = reassignedBindings(node.id)
      const initializer = EXPRESSION_WRAPPERS.has(node.init.type)
        ? node.init.expression
        : node.init
      if (
        initializer.type === 'ArrowFunctionExpression'
        || initializer.type === 'FunctionExpression'
      ) {
        for (const target of targets) target.callable = true
      }
      if (hasDynamicInitializer(node.init)) {
        for (const target of targets) target.dynamicIdentity = true
      }
      mergeAliases([
        ...aliasTargetBindings(node.id),
        ...patternDefaultBindings(node.id),
        ...identityBindings(node.init),
      ])
    }
    if (node.type === 'AssignmentExpression' && node.operator === '=') {
      const targets = reassignedBindings(node.left)
      for (const target of targets) {
        target.aliasUnstable = true
        for (const binding of target.aliases) binding.aliasUnstable = true
      }
      if (hasDynamicInitializer(node.right)) {
        for (const target of targets) target.dynamicIdentity = true
      }
      mergeAliases([
        ...aliasTargetBindings(node.left),
        ...patternDefaultBindings(node.left),
        ...identityBindings(node.right),
      ], true)
    }
    for (const [child] of childNodes(node)) indexAliases(child)
  }
  indexAliases(program)

  function exactOrigin(binding, origin) {
    return binding?.valueOrigins.size === 1 && binding.valueOrigins.has(origin)
  }

  function expressionValueOrigins(node) {
    if (!node || typeof node !== 'object') return new Set(['other'])
    if (node.type === 'Identifier') {
      const binding = lookup(node)
      return binding ? new Set(binding.valueOrigins) : new Set(['other'])
    }
    if (node.type === 'MemberExpression') {
      const objectOrigins = expressionValueOrigins(node.object)
      return objectOrigins.size === 1
        && objectOrigins.has('react-namespace')
        && CLIENT_EFFECT_CALLEES.has(memberNameFromNode(node))
        ? new Set(['react-effect'])
        : new Set(['other'])
    }
    if (node.type === 'ConditionalExpression') {
      return new Set([
        ...expressionValueOrigins(node.consequent),
        ...expressionValueOrigins(node.alternate),
      ])
    }
    if (node.type === 'LogicalExpression') {
      return new Set([
        ...expressionValueOrigins(node.left),
        ...expressionValueOrigins(node.right),
      ])
    }
    if (node.type === 'SequenceExpression') {
      return new Set(node.expressions.flatMap((expression) => [
        ...expressionValueOrigins(expression),
      ]))
    }
    if (EXPRESSION_WRAPPERS.has(node.type)) return expressionValueOrigins(node.expression)
    return new Set(['other'])
  }

  function addValueOrigins(bindings, origins) {
    let changed = false
    for (const binding of bindings) {
      for (const origin of origins) {
        if (binding.valueOrigins.has(origin)) continue
        binding.valueOrigins.add(origin)
        changed = true
      }
    }
    return changed
  }

  function indexValueOrigins() {
    let changed = true
    while (changed) {
      changed = false
      function visit(node) {
        if (node.type === 'VariableDeclarator' && node.init) {
          const initOrigins = expressionValueOrigins(node.init)
          if (
            node.id.type === 'ObjectPattern'
            && initOrigins.size === 1
            && initOrigins.has('react-namespace')
          ) {
            for (const property of node.id.properties) {
              if (property.type !== 'Property') continue
              const name = property.key.type === 'Identifier'
                ? property.key.name
                : property.key.value
              changed = addValueOrigins(
                reassignedBindings(property.value),
                new Set(CLIENT_EFFECT_CALLEES.has(name) ? ['react-effect'] : ['other']),
              ) || changed
            }
          } else {
            changed = addValueOrigins(reassignedBindings(node.id), initOrigins) || changed
          }
        }
        if (node.type === 'AssignmentExpression' && node.operator === '=') {
          changed = addValueOrigins(
            reassignedBindings(node.left),
            expressionValueOrigins(node.right),
          ) || changed
        }
        for (const [child] of childNodes(node)) visit(child)
      }
      visit(program)
    }
  }
  indexValueOrigins()

  const patchedReactBindings = new Set()
  function markReactBindingsPatched(bindings) {
    const aliases = new Set(
      [...bindings].flatMap((binding) => [...binding.aliases]),
    )
    if (![...aliases].some((binding) => exactOrigin(binding, 'react-namespace'))) return
    for (const binding of aliases) patchedReactBindings.add(binding)
  }
  function markAllReactBindingsPatched() {
    for (const binding of reactNamespaceBindings) {
      for (const alias of binding.aliases) patchedReactBindings.add(alias)
    }
  }
  function indexPatchedReactBindings(node) {
    const target = node.type === 'AssignmentExpression'
      ? node.left
      : node.type === 'UpdateExpression'
        ? node.argument
        : node.type === 'UnaryExpression' && node.operator === 'delete'
          ? node.argument
          : null
    if (target?.type === 'MemberExpression') {
      markReactBindingsPatched(identityBindings(target.object))
      if (containsDynamicIdentity(target.object)) markAllReactBindingsPatched()
    }
    const possiblyEscapedValues = [
      ...(node.type === 'CallExpression' ? node.arguments ?? [] : []),
      ...(node.type === 'AssignmentExpression' && isMemberMutationTarget(node.left)
        ? [node.right]
        : []),
    ]
    for (const value of possiblyEscapedValues) {
      markReactBindingsPatched(identityBindings(value))
      if (containsDynamicIdentity(value)) markAllReactBindingsPatched()
    }
    for (const [child] of childNodes(node)) indexPatchedReactBindings(child)
  }
  indexPatchedReactBindings(program)

  function memberName(member) {
    if (member.type !== 'MemberExpression') return null
    if (!member.computed && member.property.type === 'Identifier') {
      return member.property.name
    }
    if (
      member.computed
      && (member.property.type === 'StringLiteral' || member.property.type === 'Literal')
    ) {
      return member.property.value
    }
    return null
  }

  function isReactEffectCall(call) {
    const callee = call.callee
    if (callee.type === 'Identifier') {
      const binding = lookup(callee)
      return Boolean(
        binding
        && !binding.aliasUnstable
        && exactOrigin(binding, 'react-effect')
        && ![...binding.aliases].some((alias) => patchedReactBindings.has(alias)),
      )
    }
    if (callee.type !== 'MemberExpression') return false
    const hookName = memberName(callee)
    if (!CLIENT_EFFECT_CALLEES.has(hookName)) return false
    if (callee.object.type !== 'Identifier') return false
    const binding = lookup(callee.object)
    return Boolean(
      binding
      && !binding.aliasUnstable
      && exactOrigin(binding, 'react-namespace')
      && ![...binding.aliases].some((alias) => patchedReactBindings.has(alias)),
    )
  }

  function enclosingExecutionStatement(node, executionScope) {
    const owner = executionScope.ownerNode
    const boundary = owner.type === 'Program' ? owner : owner.body
    let current = node
    while (nodeParents.has(current)) {
      const { parent } = nodeParents.get(current)
      if (parent === boundary || parent === owner) return current
      current = parent
    }
    return node
  }

  const patchedStaticOwners = new Set()
  const staticOwnerAliases = new Map()

  function unboundGlobalContainer(node) {
    if (!node || typeof node !== 'object') return false
    if (EXPRESSION_WRAPPERS.has(node.type)) return unboundGlobalContainer(node.expression)
    return node.type === 'Identifier'
      && ['global', 'globalThis', 'self', 'window'].includes(node.name)
      && !lookup(node)
  }

  function globalStaticOwner(node) {
    if (!node || typeof node !== 'object') return null
    if (EXPRESSION_WRAPPERS.has(node.type)) return globalStaticOwner(node.expression)
    if (node.type === 'Identifier') {
      const binding = lookup(node)
      if (!binding && STATIC_TARGET_MUTATORS.has(node.name)) return node.name
      return staticOwnerAliases.get(binding) ?? null
    }
    if (node.type === 'MemberExpression' && unboundGlobalContainer(node.object)) {
      const name = memberName(node)
      return STATIC_TARGET_MUTATORS.has(name) ? name : null
    }
    return null
  }

  function indexStaticOwnerAliases() {
    let changed = true
    while (changed) {
      changed = false
      function visit(node) {
        if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && node.init) {
          const owner = globalStaticOwner(node.init)
          const binding = lookup(node.id)
          if (owner && binding && staticOwnerAliases.get(binding) !== owner) {
            staticOwnerAliases.set(binding, owner)
            changed = true
          }
        }
        if (
          node.type === 'AssignmentExpression'
          && node.operator === '='
          && node.left.type === 'Identifier'
        ) {
          const owner = globalStaticOwner(node.right)
          const binding = lookup(node.left)
          if (owner && binding && staticOwnerAliases.get(binding) !== owner) {
            staticOwnerAliases.set(binding, owner)
            changed = true
          }
        }
        for (const [child] of childNodes(node)) visit(child)
      }
      visit(program)
    }
  }
  indexStaticOwnerAliases()

  function mutationMemberOwner(node) {
    if (!node || typeof node !== 'object') return null
    if (EXPRESSION_WRAPPERS.has(node.type)) return mutationMemberOwner(node.expression)
    if (node.type !== 'MemberExpression') return null
    return globalStaticOwner(node.object)
  }

  function indexPatchedStaticOwners(node) {
    if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') {
      const target = node.type === 'AssignmentExpression' ? node.left : node.argument
      const owner = mutationMemberOwner(target) ?? globalStaticOwner(target)
      if (owner) patchedStaticOwners.add(owner)
    }
    if (node.type === 'UnaryExpression' && node.operator === 'delete') {
      const owner = mutationMemberOwner(node.argument) ?? globalStaticOwner(node.argument)
      if (owner) patchedStaticOwners.add(owner)
    }
    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
      const owner = globalStaticOwner(node.callee.object)
      const method = memberName(node.callee)
      if (
        owner
        && STATIC_TARGET_MUTATORS.get(owner)?.has(method)
        && globalStaticOwner(node.arguments?.[0])
      ) {
        patchedStaticOwners.add(globalStaticOwner(node.arguments[0]))
      }
      if (unboundGlobalContainer(node.arguments?.[0])) {
        const patchAllOwners = () => {
          for (const name of STATIC_TARGET_MUTATORS.keys()) patchedStaticOwners.add(name)
        }
        const patchOwnerKey = (key) => {
          const name = (
            key?.type === 'StringLiteral'
            || key?.type === 'Literal'
          ) && typeof key.value === 'string'
            ? key.value
            : null
          if (name && STATIC_TARGET_MUTATORS.has(name)) patchedStaticOwners.add(name)
          else if (!name) patchAllOwners()
        }
        const patchObjectKeys = (value) => {
          if (value?.type !== 'ObjectExpression') {
            patchAllOwners()
            return
          }
          for (const property of value.properties) {
            if (property.type !== 'Property' || property.computed) {
              patchAllOwners()
              continue
            }
            patchOwnerKey(property.key)
          }
        }
        if (owner === 'Object' && method === 'assign') {
          for (const source of node.arguments?.slice(1) ?? []) patchObjectKeys(source)
        } else if (owner === 'Object' && method === 'defineProperties') {
          patchObjectKeys(node.arguments?.[1])
        } else if (
          (owner === 'Object' && method === 'defineProperty')
          || (owner === 'Reflect' && (method === 'defineProperty' || method === 'set'))
        ) {
          patchOwnerKey(node.arguments?.[1])
        } else if (owner && STATIC_TARGET_MUTATORS.get(owner)?.has(method)) {
          patchAllOwners()
        }
      }
    }
    for (const [child] of childNodes(node)) indexPatchedStaticOwners(child)
  }
  indexPatchedStaticOwners(program)

  function indexWrites(node) {
    const executionScope = nearestFunctionScope(nodeScopes.get(node))
    const semanticNode = enclosingExecutionStatement(node, executionScope)
    const record = (
      target,
      kind = 'write',
      { propagateAliases = true, trackDynamic = true } = {},
    ) => {
      const directBindings = new Set(writtenBindings(target))
      if (
        trackDynamic
        && (
          (directBindings.size === 0 && containsDynamicIdentity(target))
          || [...directBindings].some((binding) => binding.dynamicIdentity)
        )
      ) {
        unresolvedMutations.push({
          executionScope,
          message: 'Unsupported dynamic mutation target',
          mutationNode: node,
          semanticNode,
        })
      }
      const aliasedBindings = propagateAliases
        ? new Set([...directBindings].flatMap((binding) => [...binding.aliases]))
        : directBindings
      const unstableAliasMutation = propagateAliases && [...directBindings].some((binding) => (
        binding.aliasUnstable && binding.aliases.size > 1
      ))
      for (const binding of aliasedBindings) {
        binding.writes.push({
          executionScope,
          kind: unstableAliasMutation ? 'ambiguous-mutation' : kind,
          mutationNode: node,
          semanticNode,
        })
      }
    }
    if (node.type === 'AssignmentExpression') {
      record(node.left, 'write', {
        propagateAliases: isMemberMutationTarget(node.left),
      })
      if (isMemberMutationTarget(node.left)) {
        record(node.right, 'ambiguous-mutation', { trackDynamic: false })
      }
    }
    if (node.type === 'UpdateExpression') {
      record(node.argument, 'write', {
        propagateAliases: isMemberMutationTarget(node.argument),
      })
    }
    if (node.type === 'UnaryExpression' && node.operator === 'delete') {
      record(node.argument)
    }
    if (
      (node.type === 'ForInStatement' || node.type === 'ForOfStatement')
      && node.left.type !== 'VariableDeclaration'
    ) {
      record(node.left, 'write', { propagateAliases: false })
    }
    if (node.type === 'CallExpression' && !isReactEffectCall(node)) {
      const callee = node.callee
      const calleeInputs = callee.type === 'MemberExpression'
        ? [callee.object]
        : [callee]
      const isGlobalReflectApply = callee.type === 'MemberExpression'
        && callee.object.type === 'Identifier'
        && callee.object.name === 'Reflect'
        && !lookup(callee.object)
        && memberName(callee) === 'apply'
      const reflectApplyCallable = isGlobalReflectApply
        && !patchedStaticOwners.has('Reflect')
        ? node.arguments?.[0]
        : null
      const invocationInputs = [
        callee.type === 'MemberExpression' ? callee.object : callee,
        ...(reflectApplyCallable ? [reflectApplyCallable] : []),
      ]
      const calleeBindings = new Set(
        calleeInputs.flatMap((input) => identityBindings(input)),
      )
      const invocationBindings = new Set(
        invocationInputs.flatMap((input) => identityBindings(input)),
      )
      const calleeAliases = new Set(
        [...calleeBindings].flatMap((binding) => [...binding.aliases]),
      )
      const invocationAliases = new Set(
        [...invocationBindings].flatMap((binding) => [...binding.aliases]),
      )
      const callableIsInspectable = [...invocationAliases].some((binding) => (
        !binding.importSource || binding.importSource.startsWith('.')
      ))
      const hasPotentialCallback = (node.arguments ?? []).some((argument) => {
        let value = argument
        while (EXPRESSION_WRAPPERS.has(value.type)) value = value.expression
        if (
          value.type === 'ArrowFunctionExpression'
          || value.type === 'FunctionExpression'
        ) return true
        const aliases = new Set(
          identityBindings(value).flatMap((binding) => [...binding.aliases]),
        )
        return [...aliases].some((binding) => (
          binding.callable
          || (typeof binding.importSource === 'string' && binding.importSource.startsWith('.'))
        ))
      })
      if ([...calleeAliases].some((binding) => binding.dynamicIdentity)) {
        unresolvedMutations.push({
          executionScope,
          message: 'Unsupported dynamic call target',
          mutationNode: node,
          semanticNode,
        })
      }
      if (isGlobalReflectApply && patchedStaticOwners.has('Reflect')) {
        unresolvedMutations.push({
          executionScope,
          message: 'Unsupported patched Reflect.apply target',
          mutationNode: node,
          semanticNode,
        })
      }
      if ((callableIsInspectable || hasPotentialCallback) && !isReactEffectCall(node)) {
        synchronousCalls.push({
          executionScope,
          mutationNode: node,
          semanticNode,
        })
      }
      const method = callee.type === 'MemberExpression' ? memberName(callee) : null
      const staticOwner = callee.type === 'MemberExpression'
        && callee.object.type === 'Identifier'
        ? callee.object.name
        : null
      const isStaticTargetMutator = method
        && callee.object.type === 'Identifier'
        && !lookup(callee.object)
        && !patchedStaticOwners.has(staticOwner)
        && STATIC_TARGET_MUTATORS.get(staticOwner)?.has(method)
      if (isStaticTargetMutator) {
        record(node.arguments?.[0])
        for (const argument of node.arguments?.slice(1) ?? []) {
          record(argument, 'ambiguous-mutation', { trackDynamic: false })
        }
      } else if (callee.type === 'MemberExpression') {
        record(
          callee.object,
          MUTATING_MEMBER_CALLEES.has(method) ? 'write' : 'ambiguous-mutation',
          { trackDynamic: false },
        )
        const possiblyMutatedArguments = reflectApplyCallable
          ? node.arguments?.slice(1) ?? []
          : node.arguments ?? []
        for (const argument of possiblyMutatedArguments) {
          record(argument, 'ambiguous-mutation', { trackDynamic: false })
        }
        const receiverBindings = new Set(identityBindings(callee.object))
        const receiverAliases = new Set(
          [...receiverBindings].flatMap((binding) => [...binding.aliases]),
        )
        const importIdentities = new Set(
          [...receiverAliases]
            .map((binding) => binding.importIdentity)
            .filter((identity) => typeof identity === 'string' && identity.startsWith('site/')),
        )
        for (const importIdentity of importIdentities) {
          for (const binding of importedBindingsByIdentity.get(importIdentity) ?? []) {
            if (receiverAliases.has(binding)) continue
            binding.writes.push({
              ambientCallee: method ?? '<member call>',
              executionScope,
              kind: 'ambient-mutation',
              mutationNode: node,
              semanticNode,
            })
          }
        }
      } else {
        if (!callableIsInspectable) {
          for (const argument of node.arguments ?? []) {
            record(argument, 'ambiguous-mutation', { trackDynamic: false })
          }
        }
        if (callee.type === 'Identifier') {
          const calleeBinding = lookup(callee)
          const calleeAliases = new Set(calleeBinding?.aliases ?? [])
          const importIdentities = new Set(
            [...calleeAliases]
              .map((binding) => binding.importIdentity)
              .filter((identity) => typeof identity === 'string' && identity.startsWith('site/')),
          )
          for (const importIdentity of importIdentities) {
            for (const binding of importedBindingsByIdentity.get(importIdentity) ?? []) {
              if (calleeAliases.has(binding)) continue
              binding.writes.push({
                ambientCallee: callee.name,
                executionScope,
                kind: 'ambient-mutation',
                mutationNode: node,
                semanticNode,
              })
            }
          }
        }
      }
    }
    if (node.type === 'NewExpression') {
      const calleeBindings = new Set(identityBindings(node.callee))
      const calleeAliases = new Set(
        [...calleeBindings].flatMap((binding) => [...binding.aliases]),
      )
      const callableIsInspectable = [...calleeAliases].some((binding) => (
        !binding.importSource || binding.importSource.startsWith('.')
      ))
      if (
        calleeBindings.size === 0 && containsDynamicIdentity(node.callee)
        || [...calleeAliases].some((binding) => binding.dynamicIdentity)
      ) {
        unresolvedMutations.push({
          executionScope,
          message: 'Unsupported dynamic constructor target',
          mutationNode: node,
          semanticNode,
        })
      }
      if (callableIsInspectable) {
        synchronousCalls.push({
          executionScope,
          mutationNode: node,
          semanticNode,
        })
      } else {
        for (const argument of node.arguments ?? []) {
          record(argument, 'ambiguous-mutation', { trackDynamic: false })
        }
      }
    }
    if (node.type === 'VariableDeclarator' && node.init?.type === 'ObjectExpression') {
      for (const property of node.init.properties) {
        if (property.type === 'SpreadElement') {
          record(property.argument, 'write', { trackDynamic: false })
        }
      }
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
      || (parent.type === 'PropertyDefinition' && key === 'key' && !parent.computed)
      || (parent.type === 'AccessorProperty' && key === 'key' && !parent.computed)
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

  function isClientOnlyEffectScope(scope) {
    let currentScope = scope
    while (currentScope) {
      const functionNode = currentScope.ownerNode
      if (functionNode?.type === 'Program') return false
      let callbackNode = functionNode
      let relation = nodeParents.get(callbackNode)
      while (
        relation
        && EXPRESSION_WRAPPERS.has(relation.parent.type)
        && relation.key === 'expression'
      ) {
        callbackNode = relation.parent
        relation = nodeParents.get(callbackNode)
      }
      if (
        relation
        && relation.key === 'arguments'
        && relation.parent.type === 'CallExpression'
        && isReactEffectCall(relation.parent)
      ) return true
      currentScope = currentScope.parent
    }
    return false
  }

  return {
    childNodes,
    executionScopeFor: (node) => nearestFunctionScope(nodeScopes.get(node)),
    isClientOnlyEffectScope,
    isClientEffectCall: isReactEffectCall,
    isReference,
    lookup,
    sideEffectImports,
    synchronousCalls,
    unresolvedMutations,
  }
}

export function semanticSourceForDigest(path, source) {
  const rootName = SEMANTIC_ELEMENT_ROOTS.get(path)
  if (!PARSED_EXTENSIONS.has(extname(path))) return source
  const { program, errors } = parseSync(path, source)
  if (errors.length > 0) {
    throw new Error(`Unable to parse semantic source ${path}: ${errors[0].message}`)
  }
  if (path === 'site/src/config/site.ts') {
    return JSON.stringify(publicSiteConfigProjection(program))
  }
  const bindingGraph = semanticBindingGraph(program, path)
  const projectionOptions = { isClientEffectCall: bindingGraph.isClientEffectCall }
  if (!rootName) return JSON.stringify(runtimeAstProjection(program, projectionOptions))
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
  const rootExecutionScope = bindingGraph.executionScopeFor(roots[0])
  const visitedBindings = new Set()
  const pendingNodes = [roots[0]]
  for (const sideEffectImport of bindingGraph.sideEffectImports) {
    slices.add(sideEffectImport)
    pendingNodes.push(sideEffectImport)
  }
  const executesDuringRootRender = (entry) => (
    entry.executionScope === rootExecutionScope
    || entry.executionScope.ownerNode?.type === 'Program'
  )
  for (const entry of [
    ...bindingGraph.synchronousCalls,
    ...bindingGraph.unresolvedMutations,
  ]) {
    if (!executesDuringRootRender(entry)) continue
    if (bindingGraph.isClientOnlyEffectScope(entry.executionScope)) continue
    if (slices.has(entry.semanticNode)) continue
    slices.add(entry.semanticNode)
    pendingNodes.push(entry.semanticNode)
  }
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
            if (bindingGraph.isClientOnlyEffectScope(write.executionScope)) continue
            if (write.kind === 'ambiguous-mutation') {
              throw new Error(
                `Unsupported ambiguous mutation of ${binding.identifier.name} in ${path}`,
              )
            }
            const mutationAlreadySelected = [...slices].some((slice) => (
              slice.start <= write.mutationNode.start
              && slice.end >= write.mutationNode.end
            ))
            if (mutationAlreadySelected) continue
            if (write.kind === 'ambient-mutation') {
              throw new Error(
                `Unsupported ambient mutation from ${write.ambientCallee} in ${path}`,
              )
            }
            if (
              write.executionScope !== binding.executionScope
              && write.executionScope !== rootExecutionScope
            ) {
              throw new Error(
                `Unsupported nested semantic write to ${binding.identifier.name} in ${path}`,
              )
            }
            if (!slices.has(write.semanticNode)) {
              slices.add(write.semanticNode)
              pendingNodes.push(write.semanticNode)
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
  return JSON.stringify(outermostSlices.map((node) => (
    runtimeAstProjection(node, projectionOptions)
  )))
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

export function staticImportSpecifiersForSource(path, source) {
  const { program, errors } = parseSync(path, source)
  if (errors.length > 0) {
    throw new Error(`Unable to parse semantic dependency ${path}: ${errors[0].message}`)
  }
  return program.body.flatMap((statement) => {
    if (typeof statement.source?.value !== 'string') return []
    if (statement.type === 'ImportDeclaration') {
      if (statement.importKind === 'type') return []
      if (
        statement.specifiers.length > 0
        && statement.specifiers.every((specifier) => specifier.importKind === 'type')
      ) return []
      return [statement.source.value]
    }
    if (statement.type === 'ExportNamedDeclaration') {
      if (statement.exportKind === 'type') return []
      if (
        statement.specifiers.length > 0
        && statement.specifiers.every((specifier) => specifier.exportKind === 'type')
      ) return []
      return [statement.source.value]
    }
    if (statement.type === 'ExportAllDeclaration') {
      return statement.exportKind === 'type' ? [] : [statement.source.value]
    }
    return []
  })
}

function staticImportSpecifiers(path) {
  if (!PARSED_EXTENSIONS.has(extname(path))) return []
  return staticImportSpecifiersForSource(path, readFileSync(path, 'utf8'))
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
