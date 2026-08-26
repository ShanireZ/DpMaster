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
  'ChainExpression',
  'ParenthesizedExpression',
  'TSAsExpression',
  'TSInstantiationExpression',
  'TSNonNullExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
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
  const unresolvedMutations = []

  function declare(pattern, scope, semanticNode, metadata = {}) {
    for (const identifier of bindingIdentifiers(pattern)) {
      declaredIdentifiers.add(identifier)
      const existing = scope.bindings.get(identifier.name)
      if (existing) {
        if (semanticNode) existing.semanticNodes.add(semanticNode)
      } else {
        const binding = {
          aliasUnstable: false,
          executionScope: nearestFunctionScope(scope),
          identifier,
          ...metadata,
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
      if (node.type === 'FunctionDeclaration' && node.id) declare(node.id, scope, node)
      const functionScope = createScope(scope, 'function', node)
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
        })
        const binding = scope.bindings.get(specifier.local.name)
        if (binding && node.source) {
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
    } else if (node.type === 'MemberExpression') {
      identityBindings(node.object, bindings)
    } else if (node.type === 'ArrayExpression') {
      for (const element of node.elements) identityBindings(element, bindings)
    } else if (node.type === 'ObjectExpression') {
      for (const property of node.properties) {
        if (property.type === 'Property') identityBindings(property.value, bindings)
        if (property.type === 'SpreadElement') identityBindings(property.argument, bindings)
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

  function indexAliases(node) {
    if (node.type === 'VariableDeclarator' && node.init) {
      mergeAliases([
        ...reassignedBindings(node.id),
        ...identityBindings(node.init),
      ])
    }
    if (node.type === 'AssignmentExpression' && node.operator === '=') {
      const targets = reassignedBindings(node.left)
      for (const target of targets) {
        if (target.aliases.size < 2) continue
        for (const binding of target.aliases) binding.aliasUnstable = true
      }
      mergeAliases([
        ...targets,
        ...identityBindings(node.right),
      ], true)
    }
    for (const [child] of childNodes(node)) indexAliases(child)
  }
  indexAliases(program)

  function memberName(member) {
    if (member.type !== 'MemberExpression') return null
    if (!member.computed && member.property.type === 'Identifier') {
      return member.property.name
    }
    if (member.computed && member.property.type === 'StringLiteral') {
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
        && [...binding.aliases].some((alias) => (
          alias.importSource === 'react'
          && CLIENT_EFFECT_CALLEES.has(alias.importedName)
        )),
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
      && [...binding.aliases].some((alias) => (
        alias.importSource === 'react'
        && (alias.importedName === '*' || alias.importedName === 'default')
      )),
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
      const owner = mutationMemberOwner(
        node.type === 'AssignmentExpression' ? node.left : node.argument,
      )
      if (owner) patchedStaticOwners.add(owner)
    }
    if (node.type === 'UnaryExpression' && node.operator === 'delete') {
      const owner = mutationMemberOwner(node.argument)
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
    }
    for (const [child] of childNodes(node)) indexPatchedStaticOwners(child)
  }
  indexPatchedStaticOwners(program)

  function indexWrites(node) {
    const executionScope = nearestFunctionScope(nodeScopes.get(node))
    const semanticNode = enclosingExecutionStatement(node, executionScope)
    const record = (target, kind = 'write', { propagateAliases = true } = {}) => {
      const directBindings = new Set(writtenBindings(target))
      if (directBindings.size === 0 && containsDynamicIdentity(target)) {
        unresolvedMutations.push({ executionScope, mutationNode: node })
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
          record(argument, 'ambiguous-mutation')
        }
      } else if (callee.type === 'MemberExpression') {
        record(
          callee.object,
          MUTATING_MEMBER_CALLEES.has(method) ? 'write' : 'ambiguous-mutation',
        )
        for (const argument of node.arguments ?? []) {
          record(argument, 'ambiguous-mutation')
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
        for (const argument of node.arguments ?? []) {
          record(argument, 'ambiguous-mutation')
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
    const functionNode = scope.ownerNode
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
    return Boolean(
      relation
      && relation.key === 'arguments'
      && relation.parent.type === 'CallExpression'
      && isReactEffectCall(relation.parent),
    )
  }

  return {
    childNodes,
    executionScopeFor: (node) => nearestFunctionScope(nodeScopes.get(node)),
    isClientOnlyEffectScope,
    isReference,
    lookup,
    unresolvedMutations,
  }
}

export function semanticSourceForDigest(path, source) {
  const rootName = SEMANTIC_ELEMENT_ROOTS.get(path)
  if (!rootName) return source
  const { program, errors } = parseSync(path, source)
  if (errors.length > 0) {
    throw new Error(`Unable to parse semantic source ${path}: ${errors[0].message}`)
  }
  const bindingGraph = semanticBindingGraph(program, path)
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
            const mutationAlreadySelected = [...slices].some((slice) => (
              slice.start <= write.mutationNode.start
              && slice.end >= write.mutationNode.end
            ))
            if (mutationAlreadySelected) continue
            if (bindingGraph.isClientOnlyEffectScope(write.executionScope)) continue
            if (write.kind === 'ambient-mutation') {
              throw new Error(
                `Unsupported ambient mutation from ${write.ambientCallee} in ${path}`,
              )
            }
            if (write.kind === 'ambiguous-mutation') {
              throw new Error(
                `Unsupported ambiguous mutation of ${binding.identifier.name} in ${path}`,
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

  for (const write of bindingGraph.unresolvedMutations) {
    if (write.executionScope !== rootExecutionScope) continue
    if (bindingGraph.isClientOnlyEffectScope(write.executionScope)) continue
    const mutationAlreadySelected = [...slices].some((slice) => (
      slice.start <= write.mutationNode.start
      && slice.end >= write.mutationNode.end
    ))
    if (!mutationAlreadySelected) {
      throw new Error(`Unsupported dynamic mutation target in ${path}`)
    }
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
