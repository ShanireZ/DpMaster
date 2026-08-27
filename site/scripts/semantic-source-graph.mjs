import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseSync } from 'oxc-parser'

import { ROUTE_PAGE_MODULES, routeModuleIds } from './route-assets.mjs'

const projectRoot = fileURLToPath(new URL('../../', import.meta.url))
const PARSED_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx'])
const RESOLVED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json']
const SELF_GENERATED_FILES = new Set(['site/src/data/routeLastModified.ts'])
const TRUSTED_RUNTIME_PACKAGES = new Set([
  'gsap',
  'gsap/ScrollTrigger',
  'katex',
  'lucide-react',
  'motion/react',
  'react',
  'react-dom/static',
  'react-router-dom',
  'shiki/core',
  'shiki/engine/javascript',
  'shiki/langs/cpp.mjs',
  'shiki/themes/github-dark.mjs',
  'shiki/themes/github-light.mjs',
])
const TRUSTED_RUNTIME_PACKAGE_NAMES = new Set(
  [...TRUSTED_RUNTIME_PACKAGES].map((specifier) => (
    specifier.startsWith('@')
      ? specifier.split('/').slice(0, 2).join('/')
      : specifier.split('/')[0]
  )),
)
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
const KNOWN_ASYNC_CALLBACK_CALLEES = new Set([
  'queueMicrotask',
  'requestAnimationFrame',
  'requestIdleCallback',
  'setImmediate',
  'setInterval',
  'setTimeout',
])
const KNOWN_ASYNC_MEMBER_CALLEES = new Set(['catch', 'finally', 'then'])
const KNOWN_SYNC_CALLBACK_MEMBER_CALLEES = new Set([
  'every',
  'filter',
  'find',
  'findIndex',
  'findLast',
  'findLastIndex',
  'flatMap',
  'forEach',
  'map',
  'reduce',
  'reduceRight',
  'replace',
  'replaceAll',
  'some',
  'sort',
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
const CALLBACK_SEMANTIC_OWNERS = new Set([
  'Array',
  'Promise',
  'String',
  ...KNOWN_ASYNC_CALLBACK_CALLEES,
])
const TRACKED_GLOBAL_OWNERS = new Set([
  ...STATIC_TARGET_MUTATORS.keys(),
  ...CALLBACK_SEMANTIC_OWNERS,
])
const TRACKED_OWNER_MUTATION_KEYS = new Set([
  ...TRACKED_GLOBAL_OWNERS,
  ...KNOWN_ASYNC_MEMBER_CALLEES,
  ...KNOWN_SYNC_CALLBACK_MEMBER_CALLEES,
  ...[...STATIC_TARGET_MUTATORS.values()].flatMap((methods) => [...methods]),
  'prototype',
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

function isIntrinsicJsxName(node) {
  return node?.type === 'JSXIdentifier' && /^[a-z]/u.test(node.name)
}

function isClientOnlyIntrinsicPropertyName(name) {
  return name === 'key' || name === 'ref' || /^on[A-Z]/u.test(name)
}

function isPureDeferredValueSyntax(node) {
  const value = node?.type === 'JSXExpressionContainer' ? node.expression : node
  if (!value || value.type === 'JSXEmptyExpression') return true
  if (EXPRESSION_WRAPPERS.has(value.type)) return isPureDeferredValueSyntax(value.expression)
  return value.type === 'ArrowFunctionExpression'
    || value.type === 'FunctionExpression'
    || value.type === 'Identifier'
    || value.type === 'Literal'
    || value.type === 'StringLiteral'
}

function isDroppableClientOnlyIntrinsicJsxAttribute(attribute, openingElement, options = {}) {
  if (
    attribute?.type !== 'JSXAttribute'
    || !isIntrinsicJsxName(openingElement?.name)
    || attribute.name?.type !== 'JSXIdentifier'
  ) return false
  if (!isClientOnlyIntrinsicPropertyName(attribute.name.name)) return false
  return options.isPureDeferredValue?.(attribute.value) ?? isPureDeferredValueSyntax(attribute.value)
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
        options.projectDeferredCallbackValue?.(value.arguments?.[0], 'ClientEffectCallback')
          ?? { type: 'ClientEffectCallback' },
        ...(value.arguments?.slice(1) ?? []),
      ],
    }, options)
  }
  if (value.type === 'CallExpression') {
    const deferredIndexes = options.clientAsyncCallbackIndexes?.(value) ?? []
    if (deferredIndexes.length > 0) {
      const deferred = new Set(deferredIndexes)
      return projectRuntimeObject(value, {
        arguments: value.arguments.map((argument, index) => (
          deferred.has(index)
            ? options.projectDeferredCallbackValue?.(argument, 'ClientAsyncCallback')
              ?? { type: 'ClientAsyncCallback' }
            : argument
        )),
      }, options)
    }
  }
  if (value.type === 'JSXOpeningElement' && isIntrinsicJsxName(value.name)) {
    return projectRuntimeObject(value, {
      attributes: value.attributes.flatMap((attribute) => {
        if (isDroppableClientOnlyIntrinsicJsxAttribute(attribute, value, options)) return []
        if (attribute.type !== 'JSXSpreadAttribute') {
          return [options.projectIntrinsicClientAttribute?.(attribute) ?? attribute]
        }
        return [{
          ...attribute,
          argument: options.projectIntrinsicJsxSpread?.(attribute.argument) ?? attribute.argument,
        }]
      }),
    }, options)
  }
  if (value.type === 'ReturnStatement') {
    const projectedReturnValue = options.projectDeferredReturnValue?.(value)
    if (projectedReturnValue) {
      return projectRuntimeObject(value, { argument: projectedReturnValue }, options)
    }
  }
  if (value.type === 'ArrowFunctionExpression') {
    const projectedBody = options.projectDeferredArrowBody?.(value)
    if (projectedBody) {
      return projectRuntimeObject(value, { body: projectedBody }, options)
    }
  }
  if (value.type === 'Property') {
    const projectedPropertyValue = options.projectIntrinsicSpreadPropertyValue?.(value)
    if (projectedPropertyValue) {
      return projectRuntimeObject(value, { value: projectedPropertyValue }, options)
    }
  }
  if (value.type === 'VariableDeclarator') {
    const projectedInitializer = options.projectIntrinsicSpreadInitializer?.(value)
    if (projectedInitializer) {
      return projectRuntimeObject(value, { init: projectedInitializer }, options)
    }
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

function staticPropertyNameFromNode(property) {
  if (property?.type !== 'Property') return null
  if (!property.computed && property.key.type === 'Identifier') return property.key.name
  if (
    (property.key.type === 'StringLiteral' || property.key.type === 'Literal')
    && typeof property.key.value === 'string'
  ) return property.key.value
  return null
}

function resolveStaticMemberExpressions(
  node,
  key,
  { bindingForIdentifier, initializerForBinding, unwrap },
  seen = new Set(),
) {
  const value = unwrap(node)
  if (!value || typeof value !== 'object') return []
  if (value.type === 'Identifier') {
    const binding = bindingForIdentifier(value)
    if (!binding || seen.has(binding)) return []
    const initializer = initializerForBinding(binding)
    return initializer
      ? resolveStaticMemberExpressions(
          initializer,
          key,
          { bindingForIdentifier, initializerForBinding, unwrap },
          new Set([...seen, binding]),
        )
      : []
  }
  if (value.type === 'ConditionalExpression' || value.type === 'LogicalExpression') {
    const branches = value.type === 'ConditionalExpression'
      ? [value.consequent, value.alternate]
      : [value.left, value.right]
    return branches.flatMap((branch) => resolveStaticMemberExpressions(
      branch,
      key,
      { bindingForIdentifier, initializerForBinding, unwrap },
      seen,
    ))
  }
  if (value.type === 'SequenceExpression') {
    return resolveStaticMemberExpressions(
      value.expressions.at(-1),
      key,
      { bindingForIdentifier, initializerForBinding, unwrap },
      seen,
    )
  }
  if (value.type === 'MemberExpression') {
    const nestedKey = memberNameFromNode(value)
    if (nestedKey === null) return []
    return resolveStaticMemberExpressions(
      value.object,
      nestedKey,
      { bindingForIdentifier, initializerForBinding, unwrap },
      seen,
    ).flatMap((member) => resolveStaticMemberExpressions(
      member,
      key,
      { bindingForIdentifier, initializerForBinding, unwrap },
      seen,
    ))
  }
  if (value.type === 'ArrayExpression' && /^\d+$/u.test(String(key))) {
    const element = value.elements[Number(key)]
    return element && element.type !== 'SpreadElement' ? [element] : []
  }
  if (value.type !== 'ObjectExpression') return []
  const matches = []
  for (const property of value.properties) {
    if (property.type === 'SpreadElement') {
      matches.push(...resolveStaticMemberExpressions(
        property.argument,
        key,
        { bindingForIdentifier, initializerForBinding, unwrap },
        seen,
      ))
    } else if (
      property.type === 'Property'
      && staticPropertyNameFromNode(property) === String(key)
    ) {
      matches.push(property.value)
    }
  }
  return matches
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
  const localMemberName = (node) => memberNameFromNode(unwrap(node))
  const globalContainerAliases = new Set()
  const globalObjectAliases = new Set()
  let dynamicGlobalObjectAlias = false
  const staticPatternPropertyName = staticPropertyNameFromNode
  const patternTargetNames = (property) => (
    property?.type === 'Property'
      ? bindingIdentifiers(property.value).map((identifier) => identifier.name)
      : []
  )
  const constBindingExpression = (name, seen) => (
    bindingKinds.get(name) === 'const' && !seen.has(name)
      ? bindings.get(name)
      : null
  )
  const isGlobalContainer = (node, seen = new Set()) => {
    const value = unwrap(node)
    if (value?.type === 'ConditionalExpression') {
      return isGlobalContainer(value.consequent, seen)
        && isGlobalContainer(value.alternate, seen)
    }
    if (value?.type === 'LogicalExpression') {
      return isGlobalContainer(value.left, seen) && isGlobalContainer(value.right, seen)
    }
    if (value?.type === 'SequenceExpression') {
      return isGlobalContainer(value.expressions.at(-1), seen)
    }
    if (value?.type === 'MemberExpression') {
      const name = localMemberName(value)
      if (name === null) return false
      const members = staticMemberExpressions(value.object, name, seen)
      return members.length > 0
        && members.every((member) => isGlobalContainer(member, seen))
    }
    if (value?.type !== 'Identifier') return false
    if (globalContainerAliases.has(value.name)) return true
    if (!bindings.has(value.name)) {
      return ['global', 'globalThis', 'self', 'window'].includes(value.name)
    }
    const initializer = constBindingExpression(value.name, seen)
    return initializer
      ? isGlobalContainer(initializer, new Set([...seen, value.name]))
      : false
  }
  const publicStaticMemberMayInvokeGetter = (node, key, seen = new Set()) => {
    const value = unwrap(node)
    if (!value || typeof value !== 'object') return false
    if (value.type === 'Identifier' && bindings.has(value.name)) {
      const initializer = constBindingExpression(value.name, seen)
      return initializer
        ? publicStaticMemberMayInvokeGetter(
            initializer,
            key,
            new Set([...seen, value.name]),
          )
        : false
    }
    if (value.type === 'ConditionalExpression') {
      return publicStaticMemberMayInvokeGetter(value.consequent, key, seen)
        || publicStaticMemberMayInvokeGetter(value.alternate, key, seen)
    }
    if (value.type === 'LogicalExpression') {
      return publicStaticMemberMayInvokeGetter(value.left, key, seen)
        || publicStaticMemberMayInvokeGetter(value.right, key, seen)
    }
    if (value.type === 'SequenceExpression') {
      return publicStaticMemberMayInvokeGetter(value.expressions.at(-1), key, seen)
    }
    if (value.type !== 'ObjectExpression') return false
    return value.properties.some((property) => {
      if (property.type === 'SpreadElement') {
        return publicStaticMemberMayInvokeGetter(property.argument, key, seen)
      }
      return property.type === 'Property'
        && staticPropertyNameFromNode(property) === String(key)
        && property.kind === 'get'
    })
  }
  const mayContainGlobalContainer = (node, seen = new Set()) => {
    const value = unwrap(node)
    if (!value || typeof value !== 'object') return false
    if (isGlobalContainer(value, seen)) return true
    if (value.type === 'CallExpression' || value.type === 'NewExpression') return true
    if (value.type === 'Identifier' && bindings.has(value.name)) {
      const initializer = constBindingExpression(value.name, seen)
      return initializer
        ? mayContainGlobalContainer(initializer, new Set([...seen, value.name]))
        : false
    }
    if (value.type === 'ConditionalExpression') {
      return mayContainGlobalContainer(value.consequent, seen)
        || mayContainGlobalContainer(value.alternate, seen)
    }
    if (value.type === 'LogicalExpression') {
      return mayContainGlobalContainer(value.left, seen)
        || mayContainGlobalContainer(value.right, seen)
    }
    if (value.type === 'SequenceExpression') {
      return mayContainGlobalContainer(value.expressions.at(-1), seen)
    }
    if (value.type === 'ArrayExpression') {
      return value.elements.some((element) => mayContainGlobalContainer(
        element?.type === 'SpreadElement' ? element.argument : element,
        seen,
      ))
    }
    if (value.type === 'ObjectExpression') {
      return value.properties.some((property) => mayContainGlobalContainer(
        property.type === 'SpreadElement' ? property.argument : property.value,
        seen,
      ))
    }
    if (value.type === 'MemberExpression') {
      const name = localMemberName(value)
      if (name === null || publicStaticMemberMayInvokeGetter(value.object, name, seen)) {
        return true
      }
      const members = staticMemberExpressions(value.object, name, seen)
      return members.length === 0
        || members.some((member) => mayContainGlobalContainer(member, seen))
    }
    return false
  }
  const indexGlobalContainerAliases = () => {
    let containerAliasesChanged = true
    while (containerAliasesChanged) {
      containerAliasesChanged = false
      const indexGlobalContainerAlias = (node) => {
      const target = node.type === 'VariableDeclarator'
        && node.id.type === 'Identifier'
        && node.init
        ? node.id
        : node.type === 'AssignmentExpression'
          && node.operator === '='
          && node.left.type === 'Identifier'
          ? node.left
          : null
      const source = node.type === 'VariableDeclarator'
        ? node.init
        : node.type === 'AssignmentExpression'
          ? node.right
          : null
      if (
        target
        && source
        && isGlobalContainer(source)
        && !globalContainerAliases.has(target.name)
      ) {
        globalContainerAliases.add(target.name)
        containerAliasesChanged = true
      }
      const pattern = node.type === 'VariableDeclarator'
        ? node.id
        : node.type === 'AssignmentExpression' && node.operator === '='
          ? node.left
          : null
        if (pattern?.type === 'ObjectPattern' && source && isGlobalContainer(source)) {
          for (const property of pattern.properties) {
            if (!['global', 'globalThis', 'self', 'window'].includes(
              staticPatternPropertyName(property),
            )) continue
            for (const name of patternTargetNames(property)) {
              if (globalContainerAliases.has(name)) continue
              globalContainerAliases.add(name)
              containerAliasesChanged = true
            }
          }
        } else if (pattern?.type === 'ObjectPattern' && source) {
          for (const property of pattern.properties) {
            const key = staticPatternPropertyName(property)
            const members = key === null ? [] : staticMemberExpressions(source, key)
            if (
              members.length === 0
              || !members.every((member) => isGlobalContainer(member))
            ) continue
            for (const name of patternTargetNames(property)) {
              if (globalContainerAliases.has(name)) continue
              globalContainerAliases.add(name)
              containerAliasesChanged = true
            }
          }
        } else if (pattern?.type === 'ArrayPattern' && source) {
          for (const [index, element] of pattern.elements.entries()) {
            if (!element) continue
            const members = staticMemberExpressions(source, index)
            if (
              members.length === 0
              || !members.every((member) => isGlobalContainer(member))
            ) continue
            for (const identifier of bindingIdentifiers(element)) {
              if (globalContainerAliases.has(identifier.name)) continue
              globalContainerAliases.add(identifier.name)
              containerAliasesChanged = true
            }
          }
        }
        for (const [child] of childNodes(node)) indexGlobalContainerAlias(child)
      }
      indexGlobalContainerAlias(program)
    }
  }
  const staticMemberExpressions = (node, key, seen = new Set()) => (
    resolveStaticMemberExpressions(node, key, {
      bindingForIdentifier: (identifier) => (
        bindings.has(identifier.name) ? identifier.name : null
      ),
      initializerForBinding: (name) => bindings.get(name),
      unwrap,
    }, seen)
  )
  indexGlobalContainerAliases()
  const isGlobalObject = (node, seen = new Set()) => {
    const value = unwrap(node)
    if (value?.type === 'ConditionalExpression') {
      return isGlobalObject(value.consequent, seen) && isGlobalObject(value.alternate, seen)
    }
    if (value?.type === 'LogicalExpression') {
      return isGlobalObject(value.left, seen) && isGlobalObject(value.right, seen)
    }
    if (value?.type === 'SequenceExpression') {
      return isGlobalObject(value.expressions.at(-1), seen)
    }
    if (value?.type === 'Identifier') {
      if (value.name === 'Object' && !bindings.has('Object')) return true
      if (globalObjectAliases.has(value.name)) return true
      const initializer = constBindingExpression(value.name, seen)
      return initializer
        ? isGlobalObject(initializer, new Set([...seen, value.name]))
        : false
    }
    if (value?.type !== 'MemberExpression') return false
    const name = localMemberName(value)
    if (isGlobalContainer(value.object, seen) && name === 'Object') return true
    if (name === null) return false
    const members = staticMemberExpressions(value.object, name, seen)
    return members.length > 0 && members.every((member) => isGlobalObject(member, seen))
  }
  const containsGlobalObjectIdentity = (node, seen = new Set()) => {
    const value = unwrap(node)
    if (!value || typeof value !== 'object') return false
    if (isGlobalObject(value, seen)) return true
    if (value.type === 'Identifier' && bindings.has(value.name)) {
      const initializer = constBindingExpression(value.name, seen)
      return initializer
        ? containsGlobalObjectIdentity(initializer, new Set([...seen, value.name]))
        : false
    }
    if (value.type === 'MemberExpression') {
      const name = localMemberName(value)
      return name !== null
        && staticMemberExpressions(value.object, name, seen)
          .some((member) => containsGlobalObjectIdentity(member, seen))
    }
    if (value.type === 'ConditionalExpression') {
      return containsGlobalObjectIdentity(value.consequent, seen)
        || containsGlobalObjectIdentity(value.alternate, seen)
    }
    if (value.type === 'LogicalExpression') {
      return containsGlobalObjectIdentity(value.left, seen)
        || containsGlobalObjectIdentity(value.right, seen)
    }
    if (value.type === 'SequenceExpression') {
      return value.expressions.some((expression) => containsGlobalObjectIdentity(expression, seen))
    }
    if (value.type === 'ArrayExpression') {
      return value.elements.some((element) => containsGlobalObjectIdentity(element, seen))
    }
    if (value.type === 'ObjectExpression') {
      return value.properties.some((property) => containsGlobalObjectIdentity(
        property.type === 'SpreadElement' ? property.argument : property.value,
        seen,
      ))
    }
    return false
  }
  let aliasesChanged = true
  while (aliasesChanged) {
    aliasesChanged = false
    const indexGlobalObjectAlias = (node) => {
      const target = node.type === 'VariableDeclarator'
        && node.id.type === 'Identifier'
        && node.init
        ? node.id
        : node.type === 'AssignmentExpression'
          && node.operator === '='
          && node.left.type === 'Identifier'
          ? node.left
          : null
      const source = node.type === 'VariableDeclarator'
        ? node.init
        : node.type === 'AssignmentExpression'
          ? node.right
          : null
      if (
        target
        && source
        && isGlobalObject(source)
        && !globalObjectAliases.has(target.name)
      ) {
        globalObjectAliases.add(target.name)
        aliasesChanged = true
      } else if (target && source && containsGlobalObjectIdentity(source)) {
        dynamicGlobalObjectAlias = true
      }
      const pattern = node.type === 'VariableDeclarator'
        ? node.id
        : node.type === 'AssignmentExpression' && node.operator === '='
          ? node.left
          : null
      if (pattern?.type === 'ObjectPattern' && source && isGlobalContainer(source)) {
        for (const property of pattern.properties) {
          const owner = staticPatternPropertyName(property)
          if (owner === null) {
            dynamicGlobalObjectAlias = true
            continue
          }
          if (owner !== 'Object') continue
          for (const name of patternTargetNames(property)) {
            if (globalObjectAliases.has(name)) continue
            globalObjectAliases.add(name)
            aliasesChanged = true
          }
        }
      } else if (pattern?.type === 'ObjectPattern' && source) {
        for (const property of pattern.properties) {
          const key = staticPatternPropertyName(property)
          const members = key === null ? [] : staticMemberExpressions(source, key)
          if (members.length > 0 && members.every((member) => isGlobalObject(member))) {
            for (const name of patternTargetNames(property)) {
              if (globalObjectAliases.has(name)) continue
              globalObjectAliases.add(name)
              aliasesChanged = true
            }
          } else if (members.some((member) => containsGlobalObjectIdentity(member))) {
            dynamicGlobalObjectAlias = true
          }
        }
      } else if (pattern?.type === 'ArrayPattern' && source) {
        for (const [index, element] of pattern.elements.entries()) {
          if (!element) continue
          const members = staticMemberExpressions(source, index)
          if (members.length > 0 && members.every((member) => isGlobalObject(member))) {
            for (const identifier of bindingIdentifiers(element)) {
              if (globalObjectAliases.has(identifier.name)) continue
              globalObjectAliases.add(identifier.name)
              aliasesChanged = true
            }
          } else if (members.some((member) => containsGlobalObjectIdentity(member))) {
            dynamicGlobalObjectAlias = true
          }
        }
      }
      for (const [child] of childNodes(node)) indexGlobalObjectAlias(child)
    }
    indexGlobalObjectAlias(program)
  }
  let trustedObjectFreeze = !bindings.has('Object') && !dynamicGlobalObjectAlias
  const containsDynamicObjectIdentity = (node, seen = new Set()) => {
    const value = unwrap(node)
    if (!value || typeof value !== 'object') return false
    if (value.type === 'CallExpression' || value.type === 'NewExpression') return true
    if (value.type === 'Identifier' && bindings.has(value.name)) {
      const initializer = constBindingExpression(value.name, seen)
      return initializer
        ? containsDynamicObjectIdentity(initializer, new Set([...seen, value.name]))
        : false
    }
    if (value.type === 'MemberExpression') return containsDynamicObjectIdentity(value.object, seen)
    if (value.type === 'ConditionalExpression') {
      return containsDynamicObjectIdentity(value.consequent, seen)
        || containsDynamicObjectIdentity(value.alternate, seen)
    }
    if (value.type === 'LogicalExpression') {
      return containsDynamicObjectIdentity(value.left, seen)
        || containsDynamicObjectIdentity(value.right, seen)
    }
    if (value.type === 'SequenceExpression') {
      return value.expressions.some((expression) => containsDynamicObjectIdentity(expression, seen))
    }
    return false
  }
  const inspectObjectPatches = (node) => {
    const target = node.type === 'AssignmentExpression'
      ? node.left
      : node.type === 'UpdateExpression'
        ? node.argument
        : node.type === 'UnaryExpression' && node.operator === 'delete'
          ? node.argument
          : null
    const value = unwrap(target)
    if (value?.type === 'Identifier' && isGlobalObject(value)) trustedObjectFreeze = false
    if (value?.type === 'MemberExpression') {
      if (
        isGlobalObject(value.object)
        && (localMemberName(value) === 'freeze' || localMemberName(value) === null)
      ) trustedObjectFreeze = false
      if (
        isGlobalContainer(value.object)
        && (localMemberName(value) === 'Object' || localMemberName(value) === null)
      ) trustedObjectFreeze = false
      if (
        containsDynamicObjectIdentity(value.object)
        && ['Object', 'freeze', null].includes(localMemberName(value))
      ) trustedObjectFreeze = false
    }
    if (node.type === 'CallExpression') {
      const callee = unwrap(node.callee)
      const safeFreezeCall = callee?.type === 'MemberExpression'
        && isGlobalObject(callee.object)
        && localMemberName(callee) === 'freeze'
      if (
        !safeFreezeCall
        && (node.arguments ?? []).some((argument) => isGlobalObject(argument))
      ) trustedObjectFreeze = false
      if (
        callee?.type === 'MemberExpression'
        && isGlobalObject(callee.object)
        && ['assign', 'defineProperties', 'defineProperty', 'setPrototypeOf'].includes(
          localMemberName(callee),
        )
        && (node.arguments ?? []).some((argument) => isGlobalObject(argument))
      ) trustedObjectFreeze = false
    }
    for (const [child] of childNodes(node)) inspectObjectPatches(child)
  }
  inspectObjectPatches(program)
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
      && trustedObjectFreeze
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
    } else if (value.type === 'AssignmentPattern') {
      identityNames(value.left, names)
      identityNames(value.right, names)
    } else if (value.type === 'RestElement' || value.type === 'SpreadElement') {
      identityNames(value.argument, names)
    } else if (value.type === 'ArrayPattern') {
      for (const element of value.elements) identityNames(element, names)
    } else if (value.type === 'ObjectPattern') {
      for (const property of value.properties) {
        identityNames(
          property.type === 'RestElement' ? property.argument : property.value,
          names,
        )
      }
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
    } else if (value.type === 'CallExpression' || value.type === 'NewExpression') {
      for (const argument of value.arguments ?? []) identityNames(argument, names)
    }
    return names
  }
  const taintedBindings = new Set(usedBindings)
  let taintChanged = true
  while (taintChanged) {
    taintChanged = false
    const propagateTaint = (node) => {
      const source = node.type === 'VariableDeclarator'
        ? node.init
        : node.type === 'AssignmentExpression' && node.operator === '='
          ? node.right
          : null
      const target = node.type === 'VariableDeclarator'
        ? node.id
        : node.type === 'AssignmentExpression' && node.operator === '='
          ? node.left
          : null
      if (
        source
        && target
        && [...identityNames(source)].some((name) => taintedBindings.has(name))
      ) {
        for (const name of identityNames(target)) {
          if (taintedBindings.has(name)) continue
          taintedBindings.add(name)
          taintChanged = true
        }
      }
      for (const [child] of childNodes(node)) propagateTaint(child)
    }
    propagateTaint(program)
  }
  const rejectUsedIdentity = (node, detail) => {
    for (const name of identityNames(node)) {
      if (taintedBindings.has(name)) return unsupported(`${detail} ${name}`)
    }
  }
  const scanMutations = (node) => {
    if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') {
      if (
        node.type === 'AssignmentExpression'
        && unwrap(node.left)?.type === 'MemberExpression'
        && mayContainGlobalContainer(node.right)
      ) unsupported('member-stored global container')
      rejectUsedIdentity(node.type === 'AssignmentExpression' ? node.left : node.argument, 'mutation of')
    } else if (node.type === 'UnaryExpression' && node.operator === 'delete') {
      rejectUsedIdentity(node.argument, 'mutation of')
    } else if (node.type === 'CallExpression' || node.type === 'NewExpression') {
      const safeObjectFreeze = node.type === 'CallExpression'
        && node.callee.type === 'MemberExpression'
        && node.callee.object.type === 'Identifier'
        && node.callee.object.name === 'Object'
        && trustedObjectFreeze
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

function staticBooleanValue(node) {
  if (node && EXPRESSION_WRAPPERS.has(node.type)) {
    return staticBooleanValue(node.expression)
  }
  const value = node
  if (value?.type === 'Literal' || value?.type === 'BooleanLiteral') {
    return Boolean(value.value)
  }
  if (value?.type === 'TemplateLiteral' && value.expressions.length === 0) {
    return Boolean(value.quasis[0]?.value?.cooked ?? value.quasis[0]?.value?.raw ?? '')
  }
  if (value?.type === 'UnaryExpression' && value.operator === '!') {
    const argument = staticBooleanValue(value.argument)
    return argument === null ? null : !argument
  }
  if (value?.type === 'UnaryExpression' && value.operator === 'void') return false
  if (value?.type === 'SequenceExpression') {
    return staticBooleanValue(value.expressions.at(-1))
  }
  return null
}

function staticNullishValue(node) {
  if (node && EXPRESSION_WRAPPERS.has(node.type)) {
    return staticNullishValue(node.expression)
  }
  const value = node
  if (value?.type === 'Literal' || value?.type === 'BooleanLiteral') {
    return value.value === null
  }
  if (value?.type === 'UnaryExpression' && value.operator === 'void') return true
  if (value?.type === 'TemplateLiteral' && value.expressions.length === 0) return false
  if (value?.type === 'SequenceExpression') {
    return staticNullishValue(value.expressions.at(-1))
  }
  return null
}

function moduleEvaluationDynamicImportSources(program, path) {
  const sources = []
  const functionTypes = new Set([
    'ArrowFunctionExpression',
    'FunctionDeclaration',
    'FunctionExpression',
  ])
  const callableDefinitions = new Map()
  const callableAliases = new Map()
  const activeFunctions = new Set()

  const register = (map, name, value) => {
    if (!name) return
    const values = map.get(name) ?? new Set()
    values.add(value)
    map.set(name, values)
  }
  for (const statement of program.body ?? []) {
    const declaration = statement.type === 'ExportNamedDeclaration'
      ? statement.declaration
      : statement
    if (declaration?.type === 'FunctionDeclaration') {
      register(callableDefinitions, declaration.id?.name, declaration)
    }
    if (declaration?.type !== 'VariableDeclaration') continue
    for (const declarator of declaration.declarations ?? []) {
      if (declarator.id?.type !== 'Identifier' || !declarator.init) continue
      if (functionTypes.has(declarator.init.type)) {
        register(callableDefinitions, declarator.id.name, declarator.init)
      } else if (declarator.init.type === 'Identifier') {
        register(callableAliases, declarator.id.name, declarator.init.name)
      }
    }
  }

  function resolvedCallables(name, seen = new Set()) {
    if (!name || seen.has(name)) return []
    const nextSeen = new Set([...seen, name])
    return [
      ...(callableDefinitions.get(name) ?? []),
      ...[...(callableAliases.get(name) ?? [])].flatMap((alias) => (
        resolvedCallables(alias, nextSeen)
      )),
    ]
  }

  function executeCallable(callable, options = {}) {
    if (activeFunctions.has(callable)) return
    activeFunctions.add(callable)
    try {
      visit(callable, { ...options, executeFunction: true })
    } finally {
      activeFunctions.delete(callable)
    }
  }

  function visit(node, { executeFunction = false, awaitedCall = false } = {}) {
    if (!node || typeof node !== 'object') return
    if (node.type === 'ImportExpression') {
      if (typeof node.source?.value !== 'string') {
        throw new Error(`Unsupported dynamic module-evaluation import in ${path}`)
      }
      sources.push(node.source)
      return
    }
    if (functionTypes.has(node.type)) {
      if (!executeFunction) return
      for (const parameter of node.params ?? []) visit(parameter)
      visit(node.body)
      return
    }
    if (node.type === 'IfStatement') {
      visit(node.test)
      const condition = staticBooleanValue(node.test)
      if (condition !== false) visit(node.consequent)
      if (condition !== true) visit(node.alternate)
      return
    }
    if (node.type === 'ConditionalExpression') {
      visit(node.test)
      const condition = staticBooleanValue(node.test)
      if (condition !== false) visit(node.consequent)
      if (condition !== true) visit(node.alternate)
      return
    }
    if (node.type === 'LogicalExpression') {
      visit(node.left)
      const condition = staticBooleanValue(node.left)
      const nullish = staticNullishValue(node.left)
      if (
        (node.operator === '&&' && condition !== false)
        || (node.operator === '||' && condition !== true)
        || (node.operator === '??' && nullish !== false)
      ) visit(node.right)
      return
    }
    if (node.type === 'WhileStatement') {
      visit(node.test)
      if (staticBooleanValue(node.test) !== false) visit(node.body)
      return
    }
    if (node.type === 'ForStatement') {
      visit(node.init)
      visit(node.test)
      if (!node.test || staticBooleanValue(node.test) !== false) {
        visit(node.body)
        visit(node.update)
      }
      return
    }
    if (node.type === 'AwaitExpression') {
      visit(node.argument, { awaitedCall: true })
      return
    }
    if (node.type === 'CallExpression' || node.type === 'NewExpression') {
      const immediateFunction = functionTypes.has(node.callee?.type)
      visit(node.callee, { executeFunction: immediateFunction, awaitedCall })
      if (node.callee?.type === 'Identifier') {
        for (const callable of resolvedCallables(node.callee.name)) {
          executeCallable(callable, { awaitedCall })
        }
      }
      for (const argument of node.arguments ?? []) {
        if (functionTypes.has(argument?.type)) {
          if (awaitedCall) visit(argument, { executeFunction: true, awaitedCall: true })
        } else if (awaitedCall && argument?.type === 'Identifier') {
          for (const callable of resolvedCallables(argument.name)) {
            executeCallable(callable, { awaitedCall: true })
          }
        } else {
          visit(argument)
        }
      }
      return
    }
    for (const [child] of childNodes(node)) visit(child)
  }

  visit(program)
  return sources
}

function semanticBindingGraph(program, path, analysisContext = {}) {
  const rootScope = createScope(null, 'program', program)
  const nodeScopes = new WeakMap()
  const nodeParents = new WeakMap()
  const declaredIdentifiers = new WeakSet()
  const importedBindingsByIdentity = new Map()
  const reactNamespaceBindings = new Set()
  const exportedBindings = new Set()
  const moduleEvaluationEdges = []
  let hasOpaqueReactSideEffect = false
  const synchronousCalls = []
  const unsupportedRootCalls = []
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
          shallowCopySources: new Set(),
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
      if (node.param) {
        declare(node.param, catchScope, node.param)
        for (const identifier of bindingIdentifiers(node.param)) {
          const binding = catchScope.bindings.get(identifier.name)
          if (binding) binding.dynamicIdentity = true
        }
      }
      for (const [child, childKey] of childNodes(node)) build(child, catchScope, node, childKey)
      return
    }
    if (node.type === 'ImportDeclaration') {
      const runtimeSpecifiers = (node.specifiers ?? []).filter((specifier) => (
        specifier.importKind !== 'type'
      ))
      if (
        node.importKind !== 'type'
        && ((node.specifiers?.length ?? 0) === 0 || runtimeSpecifiers.length > 0)
      ) {
        moduleEvaluationEdges.push(node.source)
      }
      if (
        node.importKind !== 'type'
        && (node.specifiers?.length ?? 0) === 0
        && node.source?.value !== 'react'
        && !String(node.source?.value ?? '').endsWith('.css')
      ) {
        hasOpaqueReactSideEffect = true
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
            : node.source?.value === 'react' && importedName === 'lazy'
              ? ['react-lazy']
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
    if (
      node.type === 'ExportAllDeclaration'
      && node.exportKind !== 'type'
      && node.source
    ) {
      moduleEvaluationEdges.push(node.source)
    }
    if (
      node.type === 'ExportNamedDeclaration'
      && node.source
      && node.exportKind !== 'type'
      && (
        (node.specifiers?.length ?? 0) === 0
        || node.specifiers.some((specifier) => specifier.exportKind !== 'type')
      )
    ) {
      moduleEvaluationEdges.push(node.source)
    }
    if (node.type === 'TSEnumDeclaration' && node.id) declare(node.id, scope, node)
    for (const [child, childKey] of childNodes(node)) build(child, scope, node, childKey)
  }
  build(program, rootScope)
  moduleEvaluationEdges.push(...moduleEvaluationDynamicImportSources(program, path))

  function lookup(node) {
    let scope = nodeScopes.get(node)
    while (scope) {
      const binding = scope.bindings.get(node.name)
      if (binding) return binding
      scope = scope.parent
    }
    return null
  }

  function indexExportedBindings(node) {
    if (node.type === 'ExportNamedDeclaration') {
      const declaration = node.declaration
      if (declaration?.id) {
        for (const identifier of bindingIdentifiers(declaration.id)) {
          const binding = lookup(identifier)
          if (binding) exportedBindings.add(binding)
        }
      }
      if (declaration?.type === 'VariableDeclaration') {
        for (const declarator of declaration.declarations) {
          for (const identifier of bindingIdentifiers(declarator.id)) {
            const binding = lookup(identifier)
            if (binding) exportedBindings.add(binding)
          }
        }
      }
      for (const specifier of node.specifiers ?? []) {
        const local = specifier.local
        const binding = local?.type === 'Identifier' ? lookup(local) : null
        if (binding) exportedBindings.add(binding)
      }
    }
    if (node.type === 'ExportDefaultDeclaration') {
      const declaration = node.declaration
      if (declaration?.type === 'Identifier') {
        const binding = lookup(declaration)
        if (binding) exportedBindings.add(binding)
      } else if (declaration?.id) {
        const binding = lookup(declaration.id)
        if (binding) exportedBindings.add(binding)
      }
    }
    for (const [child] of childNodes(node)) indexExportedBindings(child)
  }
  indexExportedBindings(program)

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

  function staticMemberMayInvokeGetter(node, key, seen = new Set()) {
    const value = unwrapExpression(node)
    if (!value || typeof value !== 'object') return false
    if (value.type === 'Identifier') {
      const binding = lookup(value)
      if (!binding || seen.has(binding)) return false
      const initializer = directConstInitializer(binding)
      if (initializer) {
        return staticMemberMayInvokeGetter(initializer, key, new Set([...seen, binding]))
      }
      const relation = nodeParents.get(binding.identifier)
      if (
        relation?.key === 'id'
        && (relation.parent.type === 'ClassDeclaration' || relation.parent.type === 'ClassExpression')
      ) {
        return staticMemberMayInvokeGetter(relation.parent, key, new Set([...seen, binding]))
      }
      return false
    }
    if (value.type === 'ConditionalExpression') {
      return staticMemberMayInvokeGetter(value.consequent, key, seen)
        || staticMemberMayInvokeGetter(value.alternate, key, seen)
    }
    if (value.type === 'LogicalExpression') {
      return staticMemberMayInvokeGetter(value.left, key, seen)
        || staticMemberMayInvokeGetter(value.right, key, seen)
    }
    if (value.type === 'SequenceExpression') {
      return staticMemberMayInvokeGetter(value.expressions.at(-1), key, seen)
    }
    if (value.type === 'MemberExpression') {
      const nestedName = memberName(value)
      if (nestedName === null) return true
      return staticMemberExpressions(value.object, nestedName, seen).some((member) => (
        staticMemberMayInvokeGetter(member, key, seen)
      ))
    }
    if (value.type === 'ClassDeclaration' || value.type === 'ClassExpression') {
      return (value.body?.body ?? []).some((member) => {
        if (member.type !== 'MethodDefinition' || !member.static || member.kind !== 'get') {
          return false
        }
        const name = !member.computed && member.key.type === 'Identifier'
          ? member.key.name
          : (member.key.type === 'Literal' || member.key.type === 'StringLiteral')
            ? member.key.value
            : null
        return String(name) === String(key)
      })
    }
    if (value.type !== 'ObjectExpression') return false
    return value.properties.some((property) => {
      if (property.type === 'SpreadElement') {
        return staticMemberMayInvokeGetter(property.argument, key, seen)
      }
      if (
        property.type !== 'Property'
        || staticPropertyNameFromNode(property) !== String(key)
      ) return false
      return property.kind === 'get'
    })
  }

  function hasDynamicInitializer(node) {
    if (!node || typeof node !== 'object') return false
    if (node.type === 'CallExpression' || node.type === 'NewExpression') return true
    if (node.type === 'MemberExpression') {
      const name = memberName(node)
      return name === null || staticMemberMayInvokeGetter(node.object, name)
    }
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
    if (
      node.type === 'AssignmentExpression'
      && ['=', '&&=', '??=', '||='].includes(node.operator)
    ) {
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
    if (node.type === 'ForInStatement' || node.type === 'ForOfStatement') {
      const targets = node.left.type === 'VariableDeclaration'
        ? node.left.declarations.flatMap((declarator) => aliasTargetBindings(declarator.id))
        : aliasTargetBindings(node.left)
      for (const target of targets) {
        target.aliasUnstable = true
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

  function restTargetBindings(pattern, bindings = []) {
    if (!pattern || typeof pattern !== 'object') return bindings
    if (pattern.type === 'RestElement') {
      reassignedBindings(pattern.argument, bindings)
    } else if (pattern.type === 'ArrayPattern') {
      for (const element of pattern.elements) restTargetBindings(element, bindings)
    } else if (pattern.type === 'ObjectPattern') {
      for (const property of pattern.properties) restTargetBindings(property, bindings)
    } else if (pattern.type === 'Property') {
      restTargetBindings(pattern.value, bindings)
    } else if (pattern.type === 'AssignmentPattern') {
      restTargetBindings(pattern.left, bindings)
    }
    return bindings
  }

  function spreadSourceBindings(expression, bindings = []) {
    if (!expression || typeof expression !== 'object') return bindings
    if (expression.type === 'ArrayExpression') {
      for (const element of expression.elements) {
        if (element?.type === 'SpreadElement') identityBindings(element.argument, bindings)
      }
    } else if (expression.type === 'ObjectExpression') {
      for (const property of expression.properties) {
        if (property.type === 'SpreadElement') identityBindings(property.argument, bindings)
      }
    }
    return bindings
  }

  function addShallowCopySources(targets, sources) {
    const sourceAliases = new Set(
      sources.flatMap((binding) => [...binding.aliases]),
    )
    for (const target of targets) {
      for (const source of sourceAliases) target.shallowCopySources.add(source)
    }
  }

  function indexShallowCopies(node) {
    if (node.type === 'VariableDeclarator' && node.init) {
      addShallowCopySources(
        reassignedBindings(node.id),
        spreadSourceBindings(node.init),
      )
      addShallowCopySources(
        restTargetBindings(node.id),
        identityBindings(node.init),
      )
    }
    if (node.type === 'AssignmentExpression' && node.operator === '=') {
      addShallowCopySources(
        reassignedBindings(node.left),
        spreadSourceBindings(node.right),
      )
      addShallowCopySources(
        restTargetBindings(node.left),
        identityBindings(node.right),
      )
    }
    for (const [child] of childNodes(node)) indexShallowCopies(child)
  }
  indexShallowCopies(program)

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
      if (objectOrigins.size === 1 && objectOrigins.has('react-namespace')) {
        if (CLIENT_EFFECT_CALLEES.has(memberNameFromNode(node))) {
          return new Set(['react-effect'])
        }
        if (memberNameFromNode(node) === 'lazy') return new Set(['react-lazy'])
      }
      return new Set(['other'])
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
                new Set(
                  CLIENT_EFFECT_CALLEES.has(name)
                    ? ['react-effect']
                    : name === 'lazy'
                      ? ['react-lazy']
                      : ['other'],
                ),
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
  let patchesGlobalReact = false
  function markReactBindingsPatched(bindings) {
    const aliases = new Set(
      [...bindings].flatMap((binding) => [...binding.aliases]),
    )
    if (![...aliases].some((binding) => exactOrigin(binding, 'react-namespace'))) return
    patchesGlobalReact = true
    for (const binding of aliases) patchedReactBindings.add(binding)
  }
  function markAllReactBindingsPatched() {
    for (const binding of reactNamespaceBindings) {
      for (const alias of binding.aliases) patchedReactBindings.add(alias)
    }
  }
  function markAllReactImportsPatched() {
    for (const binding of importedBindingsByIdentity.get('react') ?? []) {
      for (const alias of binding.aliases) patchedReactBindings.add(alias)
    }
  }
  if (hasOpaqueReactSideEffect) markAllReactImportsPatched()
  function indexPatchedReactBindings(node) {
    const target = node.type === 'AssignmentExpression'
      ? node.left
      : node.type === 'UpdateExpression'
        ? node.argument
        : node.type === 'UnaryExpression' && node.operator === 'delete'
          ? node.argument
          : null
    if (target?.type === 'MemberExpression') {
      const bindings = identityBindings(target.object)
      markReactBindingsPatched(bindings)
      if (
        containsDynamicIdentity(target.object)
        || bindings.some((binding) => binding.dynamicIdentity)
      ) markAllReactBindingsPatched()
    }
    const possiblyEscapedValues = [
      ...(node.type === 'CallExpression' && !isReactEffectCall(node) ? node.arguments ?? [] : []),
      ...(node.type === 'AssignmentExpression' && isMemberMutationTarget(node.left)
        ? [node.right]
        : []),
    ]
    for (const value of possiblyEscapedValues) {
      const bindings = identityBindings(value)
      markReactBindingsPatched(bindings)
      if (
        containsDynamicIdentity(value)
        || bindings.some((binding) => binding.dynamicIdentity)
      ) markAllReactBindingsPatched()
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

  function unwrapExpression(node) {
    let value = node
    while (value && EXPRESSION_WRAPPERS.has(value.type)) value = value.expression
    return value
  }

  function isUnboundGlobalIdentifier(node, names) {
    const value = unwrapExpression(node)
    return value?.type === 'Identifier'
      && names.has(value.name)
      && !lookup(value)
  }

  function isKnownPromiseExpression(node) {
    const value = unwrapExpression(node)
    if (!value || patchedStaticOwners.has('Promise')) return false
    if (
      value.type === 'NewExpression'
      && isUnboundGlobalIdentifier(value.callee, new Set(['Promise']))
    ) return true
    if (value.type !== 'CallExpression' || value.callee.type !== 'MemberExpression') return false
    const method = memberName(value.callee)
    if (
      isUnboundGlobalIdentifier(value.callee.object, new Set(['Promise']))
      && ['all', 'allSettled', 'any', 'race', 'reject', 'resolve', 'try', 'withResolvers'].includes(method)
    ) return true
    return KNOWN_ASYNC_MEMBER_CALLEES.has(method)
      && isKnownPromiseExpression(value.callee.object)
  }

  function isKnownAsyncCallbackCall(call) {
    const callee = unwrapExpression(call.callee)
    if (
      isUnboundGlobalIdentifier(callee, KNOWN_ASYNC_CALLBACK_CALLEES)
      && !patchedStaticOwners.has(callee.name)
    ) return true
    return callee?.type === 'MemberExpression'
      && KNOWN_ASYNC_MEMBER_CALLEES.has(memberName(callee))
      && isKnownPromiseExpression(callee.object)
  }

  function clientAsyncCallbackIndexes(call) {
    if (!isKnownAsyncCallbackCall(call)) return []
    return (call.arguments ?? []).flatMap((argument, index) => (
      containsPotentialCallback(argument) ? [index] : []
    ))
  }

  function isKnownSynchronousCallbackCall(call) {
    const callee = unwrapExpression(call.callee)
    if (callee?.type === 'Identifier') {
      const binding = lookup(callee)
      if (
        binding
        && !binding.aliasUnstable
        && exactOrigin(binding, 'react-lazy')
        && ![...binding.aliases].some((alias) => patchedReactBindings.has(alias))
      ) return true
    }
    if (
      callee?.type === 'MemberExpression'
      && memberName(callee) === 'lazy'
      && callee.object.type === 'Identifier'
    ) {
      const binding = lookup(callee.object)
      if (
        binding
        && !binding.aliasUnstable
        && exactOrigin(binding, 'react-namespace')
        && ![...binding.aliases].some((alias) => patchedReactBindings.has(alias))
      ) return true
    }
    if (callee?.type !== 'MemberExpression') return false
    if (
      isUnboundGlobalIdentifier(callee.object, new Set(['Array']))
      && memberName(callee) === 'from'
    ) return !patchedStaticOwners.has('Array')
    const owner = knownBuiltinCallbackReceiverOwner(callee.object)
    if (!owner || patchedStaticOwners.has(owner)) return false
    const method = memberName(callee)
    return KNOWN_SYNC_CALLBACK_MEMBER_CALLEES.has(method)
      && (owner === 'Array' || (owner === 'String' && ['replace', 'replaceAll'].includes(method)))
  }

  function knownBuiltinCallbackReceiverOwner(node) {
    const value = unwrapExpression(node)
    if (!value) return null
    if (value.type === 'ArrayExpression') return 'Array'
    if (value.type === 'StringLiteral' || value.type === 'TemplateLiteral') return 'String'
    if (
      value.type === 'NewExpression'
      && isUnboundGlobalIdentifier(value.callee, new Set(['Array']))
    ) return 'Array'
    if (value.type !== 'CallExpression' || value.callee.type !== 'MemberExpression') return null
    const method = memberName(value.callee)
    if (
      isUnboundGlobalIdentifier(value.callee.object, new Set(['Array']))
      && method === 'from'
      && !patchedStaticOwners.has('Array')
    ) return 'Array'
    if (
      isUnboundGlobalIdentifier(value.callee.object, new Set(['Object']))
      && ['entries', 'keys', 'values'].includes(method)
      && !patchedStaticOwners.has('Object')
    ) return 'Array'
    const chainedOwner = knownBuiltinCallbackReceiverOwner(value.callee.object)
    return chainedOwner === 'Array' && KNOWN_SYNC_CALLBACK_MEMBER_CALLEES.has(method)
      ? 'Array'
      : null
  }

  function containsPotentialCallback(node) {
    const value = unwrapExpression(node)
    if (!value || typeof value !== 'object') return false
    if (value.type === 'ArrowFunctionExpression' || value.type === 'FunctionExpression') return true
    if (value.type === 'MemberExpression' || value.type === 'CallExpression') return true
    if (value.type === 'ConditionalExpression') {
      return containsPotentialCallback(value.consequent)
        || containsPotentialCallback(value.alternate)
    }
    if (value.type === 'LogicalExpression') {
      return containsPotentialCallback(value.left) || containsPotentialCallback(value.right)
    }
    if (value.type === 'SequenceExpression') {
      return value.expressions.some(containsPotentialCallback)
    }
    if (value.type !== 'Identifier') return false
    const aliases = new Set(
      identityBindings(value).flatMap((binding) => [...binding.aliases]),
    )
    return [...aliases].some((binding) => (
      binding.callable
      || (typeof binding.importSource === 'string' && binding.importSource.startsWith('.'))
    ))
  }

  function stableCallableBinding(node) {
    const value = unwrapExpression(node)
    if (value?.type !== 'Identifier') return null
    const binding = lookup(value)
    if (!binding || binding.aliasUnstable || binding.writes.length > 0) return null
    return [...binding.aliases].some((alias) => alias.callable) ? binding : null
  }

  function isPureDeferredValue(node) {
    const containerValue = node?.type === 'JSXExpressionContainer' ? node.expression : node
    const value = unwrapExpression(containerValue)
    if (!value || value.type === 'JSXEmptyExpression') return true
    return value.type === 'ArrowFunctionExpression'
      || value.type === 'FunctionExpression'
      || value.type === 'Literal'
      || value.type === 'StringLiteral'
      || Boolean(stableCallableBinding(value))
  }

  function projectDeferredCallbackValue(node, markerType) {
    const value = unwrapExpression(node)
    if (!value) return { type: markerType }
    if (isPureDeferredValue(value)) return { type: markerType }
    if (value.type === 'SequenceExpression' && value.expressions.length > 0) {
      return {
        ...value,
        expressions: [
          ...value.expressions.slice(0, -1),
          projectDeferredCallbackValue(value.expressions.at(-1), markerType),
        ],
      }
    }
    if (value.type === 'ConditionalExpression') {
      return {
        ...value,
        consequent: projectDeferredCallbackValue(value.consequent, markerType),
        alternate: projectDeferredCallbackValue(value.alternate, markerType),
      }
    }
    if (value.type === 'LogicalExpression') {
      return {
        ...value,
        left: isPureDeferredValue(value.left)
          ? { type: markerType }
          : value.left,
        right: projectDeferredCallbackValue(value.right, markerType),
      }
    }
    if (value.type === 'AssignmentExpression' && value.operator === '=') {
      return {
        ...value,
        right: projectDeferredCallbackValue(value.right, markerType),
      }
    }
    return node
  }

  const clientOnlyDeferredValues = new WeakSet()
  const clientOnlyDeferredFunctions = new WeakSet()
  const deferredBindingCandidates = new Set()
  const deferredFactoryCandidates = new Set()
  const deferredFactoryCallees = new WeakSet()
  const deferredReturnValues = new WeakMap()
  const deferredArrowBodies = new WeakMap()
  function markClientOnlyDeferredValue(node) {
    const value = unwrapExpression(node)
    if (!value) return
    if (isPureDeferredValue(value)) {
      clientOnlyDeferredValues.add(value)
      if (value.type === 'ArrowFunctionExpression' || value.type === 'FunctionExpression') {
        clientOnlyDeferredFunctions.add(value)
      }
      const binding = stableCallableBinding(value)
      if (binding) deferredBindingCandidates.add(binding)
      return
    }
    if (value.type === 'CallExpression') {
      const factoryBinding = stableCallableBinding(value.callee)
      if (factoryBinding) {
        deferredFactoryCandidates.add(factoryBinding)
        deferredFactoryCallees.add(unwrapExpression(value.callee))
      }
      return
    }
    if (value.type === 'SequenceExpression' && value.expressions.length > 0) {
      markClientOnlyDeferredValue(value.expressions.at(-1))
    } else if (value.type === 'ConditionalExpression') {
      markClientOnlyDeferredValue(value.consequent)
      markClientOnlyDeferredValue(value.alternate)
    } else if (value.type === 'LogicalExpression') {
      if (isPureDeferredValue(value.left)) markClientOnlyDeferredValue(value.left)
      markClientOnlyDeferredValue(value.right)
    } else if (value.type === 'AssignmentExpression' && value.operator === '=') {
      markClientOnlyDeferredValue(value.right)
    }
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
  const ambiguousStaticOwnerAliases = new Set()
  const globalContainerAliases = new Set()

  function staticPatternOwner(property) {
    return staticPropertyNameFromNode(property)
  }

  function patternBindings(property) {
    return property?.type === 'Property' ? reassignedBindings(property.value) : []
  }

  function directConstInitializer(binding) {
    const relation = nodeParents.get(binding?.identifier)
    if (relation?.parent.type !== 'VariableDeclarator' || relation.key !== 'id') return null
    const declaration = nodeParents.get(relation.parent)?.parent
    return declaration?.type === 'VariableDeclaration' && declaration.kind === 'const'
      ? relation.parent.init
      : null
  }

  function unboundGlobalContainer(node, seen = new Set()) {
    if (!node || typeof node !== 'object') return false
    if (EXPRESSION_WRAPPERS.has(node.type)) return unboundGlobalContainer(node.expression, seen)
    if (node.type === 'ConditionalExpression') {
      return unboundGlobalContainer(node.consequent, seen)
        && unboundGlobalContainer(node.alternate, seen)
    }
    if (node.type === 'LogicalExpression') {
      return unboundGlobalContainer(node.left, seen)
        && unboundGlobalContainer(node.right, seen)
    }
    if (node.type === 'SequenceExpression') {
      return unboundGlobalContainer(node.expressions.at(-1), seen)
    }
    if (node.type === 'MemberExpression') {
      const name = memberName(node)
      if (name === null) return false
      const members = staticMemberExpressions(node.object, name, seen)
      return members.length > 0
        && members.every((member) => unboundGlobalContainer(member, seen))
    }
    if (node.type !== 'Identifier') return false
    const binding = lookup(node)
    if (!binding) return ['global', 'globalThis', 'self', 'window'].includes(node.name)
    if (globalContainerAliases.has(binding) || seen.has(binding)) {
      return globalContainerAliases.has(binding)
    }
    const initializer = directConstInitializer(binding)
    return initializer
      ? unboundGlobalContainer(initializer, new Set([...seen, binding]))
      : false
  }

  function mayContainUnboundGlobalContainer(node, seen = new Set()) {
    const value = unwrapExpression(node)
    if (!value || typeof value !== 'object') return false
    if (unboundGlobalContainer(value, seen)) return true
    if (value.type === 'CallExpression' || value.type === 'NewExpression') return true
    if (value.type === 'Identifier') {
      const binding = lookup(value)
      if (!binding || seen.has(binding)) return false
      const initializer = directConstInitializer(binding)
      return initializer
        ? mayContainUnboundGlobalContainer(initializer, new Set([...seen, binding]))
        : false
    }
    if (value.type === 'ConditionalExpression') {
      return mayContainUnboundGlobalContainer(value.consequent, seen)
        || mayContainUnboundGlobalContainer(value.alternate, seen)
    }
    if (value.type === 'LogicalExpression') {
      return mayContainUnboundGlobalContainer(value.left, seen)
        || mayContainUnboundGlobalContainer(value.right, seen)
    }
    if (value.type === 'SequenceExpression') {
      return mayContainUnboundGlobalContainer(value.expressions.at(-1), seen)
    }
    if (value.type === 'ArrayExpression') {
      return value.elements.some((element) => (
        element?.type === 'SpreadElement'
          ? mayContainUnboundGlobalContainer(element.argument, seen)
          : mayContainUnboundGlobalContainer(element, seen)
      ))
    }
    if (value.type === 'ObjectExpression') {
      return value.properties.some((property) => mayContainUnboundGlobalContainer(
        property.type === 'SpreadElement' ? property.argument : property.value,
        seen,
      ))
    }
    if (value.type === 'MemberExpression') {
      const name = memberName(value)
      if (name === null || staticMemberMayInvokeGetter(value.object, name)) return true
      const members = staticMemberExpressions(value.object, name, seen)
      return members.length === 0
        || members.some((member) => mayContainUnboundGlobalContainer(member, seen))
    }
    return false
  }

  function unboundGlobalMemberRoot(node) {
    let value = unwrapExpression(node)
    while (value?.type === 'MemberExpression') value = unwrapExpression(value.object)
    return unboundGlobalContainer(value)
  }

  function indexGlobalContainerAliases() {
    let changed = true
    while (changed) {
      changed = false
      function visit(node) {
        const target = node.type === 'VariableDeclarator'
          && node.id.type === 'Identifier'
          && node.init
          ? node.id
          : node.type === 'AssignmentExpression'
            && node.operator === '='
            && node.left.type === 'Identifier'
            ? node.left
            : null
        const source = node.type === 'VariableDeclarator'
          ? node.init
          : node.type === 'AssignmentExpression'
            ? node.right
            : null
        const binding = target ? lookup(target) : null
        if (
          binding
          && source
          && unboundGlobalContainer(source)
          && !globalContainerAliases.has(binding)
        ) {
          globalContainerAliases.add(binding)
          changed = true
        }
        const pattern = node.type === 'VariableDeclarator'
          ? node.id
          : node.type === 'AssignmentExpression' && node.operator === '='
            ? node.left
            : null
        if (pattern?.type === 'ObjectPattern' && source && unboundGlobalContainer(source)) {
          for (const property of pattern.properties) {
            if (!['global', 'globalThis', 'self', 'window'].includes(
              staticPatternOwner(property),
            )) continue
            for (const targetBinding of patternBindings(property)) {
              if (globalContainerAliases.has(targetBinding)) continue
              globalContainerAliases.add(targetBinding)
              changed = true
            }
          }
        } else if (pattern?.type === 'ObjectPattern' && source) {
          for (const property of pattern.properties) {
            const key = staticPatternOwner(property)
            const members = key === null ? [] : staticMemberExpressions(source, key)
            if (
              members.length === 0
              || !members.every((member) => unboundGlobalContainer(member))
            ) continue
            for (const targetBinding of patternBindings(property)) {
              if (globalContainerAliases.has(targetBinding)) continue
              globalContainerAliases.add(targetBinding)
              changed = true
            }
          }
        } else if (pattern?.type === 'ArrayPattern' && source) {
          for (const [index, element] of pattern.elements.entries()) {
            if (!element) continue
            const members = staticMemberExpressions(source, index)
            if (
              members.length === 0
              || !members.every((member) => unboundGlobalContainer(member))
            ) continue
            for (const targetBinding of reassignedBindings(element)) {
              if (globalContainerAliases.has(targetBinding)) continue
              globalContainerAliases.add(targetBinding)
              changed = true
            }
          }
        }
        for (const [child] of childNodes(node)) visit(child)
      }
      visit(program)
    }
  }

  function staticMemberExpressions(node, key, seen = new Set()) {
    return resolveStaticMemberExpressions(node, key, {
      bindingForIdentifier: lookup,
      initializerForBinding: directConstInitializer,
      unwrap: unwrapExpression,
    }, seen)
  }
  indexGlobalContainerAliases()

  function combinedStaticOwner(nodes) {
    const resolvedOwners = nodes.map((node) => globalStaticOwner(node))
    const owners = new Set(resolvedOwners.filter(Boolean))
    if (owners.size > 0 && resolvedOwners.some((owner) => !owner)) return '*'
    if (owners.has('*') || owners.size > 1) return '*'
    return owners.values().next().value ?? null
  }

  function globalStaticOwner(node, seen = new Set()) {
    if (!node || typeof node !== 'object') return null
    if (EXPRESSION_WRAPPERS.has(node.type)) return globalStaticOwner(node.expression, seen)
    if (node.type === 'ConditionalExpression' || node.type === 'LogicalExpression') {
      const branches = node.type === 'ConditionalExpression'
        ? [node.consequent, node.alternate]
        : [node.left, node.right]
      return combinedStaticOwner(branches)
    }
    if (node.type === 'SequenceExpression') return globalStaticOwner(node.expressions.at(-1), seen)
    if (node.type === 'Identifier') {
      const binding = lookup(node)
      if (!binding && TRACKED_GLOBAL_OWNERS.has(node.name)) return node.name
      if (ambiguousStaticOwnerAliases.has(binding)) return '*'
      const aliasOwner = staticOwnerAliases.get(binding)
      if (aliasOwner || !binding || seen.has(binding)) return aliasOwner ?? null
      const initializer = directConstInitializer(binding)
      return initializer
        ? globalStaticOwner(initializer, new Set([...seen, binding]))
        : null
    }
    if (node.type === 'MemberExpression') {
      const name = memberName(node)
      if (unboundGlobalContainer(node.object)) {
        return TRACKED_GLOBAL_OWNERS.has(name) ? name : name === null ? '*' : null
      }
      const nestedOwner = globalStaticOwner(node.object, seen)
      if (nestedOwner) return nestedOwner
      if (name === null) return null
      return combinedStaticOwner(staticMemberExpressions(node.object, name, seen))
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
        const pattern = node.type === 'VariableDeclarator'
          ? node.id
          : node.type === 'AssignmentExpression' && node.operator === '='
            ? node.left
            : null
        const source = node.type === 'VariableDeclarator'
          ? node.init
          : node.type === 'AssignmentExpression'
            ? node.right
            : null
        if (pattern?.type === 'ObjectPattern' && source && unboundGlobalContainer(source)) {
          for (const property of pattern.properties) {
            const owner = staticPatternOwner(property)
            for (const binding of patternBindings(property)) {
              if (owner !== null && TRACKED_GLOBAL_OWNERS.has(owner)) {
                if (staticOwnerAliases.get(binding) === owner) continue
                staticOwnerAliases.set(binding, owner)
                changed = true
              } else if (owner === null && !ambiguousStaticOwnerAliases.has(binding)) {
                ambiguousStaticOwnerAliases.add(binding)
                changed = true
              }
            }
          }
        } else if (pattern?.type === 'ObjectPattern' && source) {
          for (const property of pattern.properties) {
            const key = staticPatternOwner(property)
            const owner = key === null
              ? '*'
              : combinedStaticOwner(staticMemberExpressions(source, key))
            for (const binding of patternBindings(property)) {
              if (owner && staticOwnerAliases.get(binding) !== owner) {
                staticOwnerAliases.set(binding, owner)
                changed = true
              } else if (!owner && key === null && !ambiguousStaticOwnerAliases.has(binding)) {
                ambiguousStaticOwnerAliases.add(binding)
                changed = true
              }
            }
          }
        } else if (pattern?.type === 'ArrayPattern' && source) {
          for (const [index, element] of pattern.elements.entries()) {
            if (!element) continue
            const owner = combinedStaticOwner(staticMemberExpressions(source, index))
            for (const binding of reassignedBindings(element)) {
              if (!owner || staticOwnerAliases.get(binding) === owner) continue
              staticOwnerAliases.set(binding, owner)
              changed = true
            }
          }
        }
        for (const [child] of childNodes(node)) visit(child)
      }
      visit(program)
    }
  }
  indexStaticOwnerAliases()

  function globalOwnerRoot(node) {
    if (!node || typeof node !== 'object') return null
    if (EXPRESSION_WRAPPERS.has(node.type)) return globalOwnerRoot(node.expression)
    if (node.type === 'MemberExpression') {
      return globalOwnerRoot(node.object) ?? globalStaticOwner(node)
    }
    return globalStaticOwner(node)
  }

  function mutationMemberOwner(node) {
    if (!node || typeof node !== 'object') return null
    if (EXPRESSION_WRAPPERS.has(node.type)) return mutationMemberOwner(node.expression)
    if (node.type !== 'MemberExpression') return null
    if (unboundGlobalContainer(node.object)) return globalStaticOwner(node)
    return globalOwnerRoot(node.object)
  }

  function markAllStaticOwnersPatched() {
    for (const name of TRACKED_GLOBAL_OWNERS) patchedStaticOwners.add(name)
  }

  function markStaticOwnerPatched(owner) {
    if (!owner) return
    if (owner === '*') markAllStaticOwnersPatched()
    else patchedStaticOwners.add(owner)
  }

  function dynamicMutationMayPatchTrackedOwner(node) {
    let value = unwrapExpression(node)
    while (value?.type === 'MemberExpression') {
      const name = memberName(value)
      if (name === null || TRACKED_OWNER_MUTATION_KEYS.has(name)) return true
      value = unwrapExpression(value.object)
    }
    return false
  }

  function indexPatchedStaticOwners(node) {
    if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') {
      const target = node.type === 'AssignmentExpression' ? node.left : node.argument
      const owner = mutationMemberOwner(target) ?? globalStaticOwner(target)
      markStaticOwnerPatched(owner)
      if (
        !owner
        && (
          containsDynamicIdentity(target)
          || identityBindings(target).some((binding) => binding.dynamicIdentity)
        )
        && dynamicMutationMayPatchTrackedOwner(target)
      ) markAllStaticOwnersPatched()
      if (
        target.type === 'MemberExpression'
        && unboundGlobalContainer(target.object)
        && target.computed
        && memberName(target) === null
      ) markAllStaticOwnersPatched()
    }
    if (node.type === 'UnaryExpression' && node.operator === 'delete') {
      const owner = mutationMemberOwner(node.argument) ?? globalStaticOwner(node.argument)
      markStaticOwnerPatched(owner)
    }
    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
      const owner = globalStaticOwner(node.callee.object)
      const method = memberName(node.callee)
      if (
        owner
        && STATIC_TARGET_MUTATORS.get(owner)?.has(method)
        && globalOwnerRoot(node.arguments?.[0])
      ) {
        markStaticOwnerPatched(globalOwnerRoot(node.arguments[0]))
      }
      if (unboundGlobalContainer(node.arguments?.[0])) {
        const patchOwnerKey = (key) => {
          const name = (
            key?.type === 'StringLiteral'
            || key?.type === 'Literal'
          ) && typeof key.value === 'string'
            ? key.value
            : null
          if (name && TRACKED_GLOBAL_OWNERS.has(name)) patchedStaticOwners.add(name)
          else if (!name) markAllStaticOwnersPatched()
        }
        const patchObjectKeys = (value) => {
          if (value?.type !== 'ObjectExpression') {
            markAllStaticOwnersPatched()
            return
          }
          for (const property of value.properties) {
            if (property.type !== 'Property' || property.computed) {
              markAllStaticOwnersPatched()
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
          markAllStaticOwnersPatched()
        }
      }
    }
    for (const [child] of childNodes(node)) indexPatchedStaticOwners(child)
  }
  indexPatchedStaticOwners(program)

  function importedPatchSummary() {
    const cache = analysisContext.patchSummaryCache ?? new Map()
    const currentPath = resolve(projectRoot, path)
    const stack = analysisContext.patchSummaryStack ?? new Set([currentPath])
    const summary = { patchedStaticOwners: new Set(), patchesReact: false }
    const mergeSummary = (imported) => {
      for (const owner of imported.patchedStaticOwners) summary.patchedStaticOwners.add(owner)
      summary.patchesReact ||= imported.patchesReact
    }
    for (const edge of moduleEvaluationEdges) {
      const specifier = edge?.value
      if (typeof specifier !== 'string' || specifier.endsWith('.css')) continue
      if (!specifier.startsWith('.')) {
        if (TRUSTED_RUNTIME_PACKAGES.has(specifier)) continue
        for (const owner of TRACKED_GLOBAL_OWNERS) summary.patchedStaticOwners.add(owner)
        summary.patchesReact = true
        continue
      }
      const resolvedImport = resolveStaticImport(currentPath, specifier)
      if (!resolvedImport) {
        const declaration = nodeParents.get(edge)?.parent
        const runtimeBindings = (declaration?.specifiers ?? []).flatMap((specifier) => {
          const binding = specifier.local ? lookup(specifier.local) : null
          return binding ? [binding] : []
        })
        let hasRuntimeReference = false
        function findRuntimeReference(node) {
          if (hasRuntimeReference) return
          if (
            node.type === 'Identifier'
            && !declaredIdentifiers.has(node)
            && runtimeBindings.some((binding) => lookup(node)?.aliases === binding.aliases)
            && isReference(node)
          ) {
            hasRuntimeReference = true
            return
          }
          for (const [child] of childNodes(node)) findRuntimeReference(child)
        }
        findRuntimeReference(program)
        if ((declaration?.specifiers.length ?? 0) === 0 || !hasRuntimeReference) {
          for (const owner of TRACKED_GLOBAL_OWNERS) summary.patchedStaticOwners.add(owner)
          summary.patchesReact = true
        }
        continue
      }
      if (!PARSED_EXTENSIONS.has(extname(resolvedImport)) || stack.has(resolvedImport)) continue
      if (cache.has(resolvedImport)) {
        mergeSummary(cache.get(resolvedImport))
        continue
      }
      let imported
      try {
        const importedPath = projectPath(resolvedImport)
        const parsed = parseSync(importedPath, readFileSync(resolvedImport, 'utf8'))
        if (parsed.errors.length > 0) throw new Error(parsed.errors[0].message)
        imported = semanticBindingGraph(parsed.program, importedPath, {
          patchSummaryCache: cache,
          patchSummaryOnly: true,
          patchSummaryStack: new Set([...stack, resolvedImport]),
        })
      } catch {
        imported = {
          patchedStaticOwners: new Set(TRACKED_GLOBAL_OWNERS),
          patchesReact: true,
        }
      }
      cache.set(resolvedImport, imported)
      mergeSummary(imported)
    }
    return summary
  }

  const dependencyPatchSummary = importedPatchSummary()
  for (const owner of dependencyPatchSummary.patchedStaticOwners) {
    patchedStaticOwners.add(owner)
  }
  if (dependencyPatchSummary.patchesReact) markAllReactImportsPatched()
  if (analysisContext.patchSummaryOnly) {
    return {
      patchedStaticOwners: new Set(patchedStaticOwners),
      patchesReact: patchesGlobalReact
        || hasOpaqueReactSideEffect
        || dependencyPatchSummary.patchesReact,
    }
  }

  function indexIntrinsicSpreadDeferredValues(node, seen = new Set()) {
    const value = unwrapExpression(node)
    if (!value || typeof value !== 'object') return
    if (value.type === 'Identifier') {
      const binding = lookup(value)
      if (!binding || seen.has(binding)) return
      const initializer = directConstInitializer(binding)
      if (initializer) {
        indexIntrinsicSpreadDeferredValues(initializer, new Set([...seen, binding]))
      }
      return
    }
    if (value.type !== 'ObjectExpression') return
    for (const property of value.properties) {
      if (property.type === 'SpreadElement') {
        indexIntrinsicSpreadDeferredValues(property.argument, seen)
      } else if (
        property.type === 'Property'
        && property.kind === 'init'
        && isClientOnlyIntrinsicPropertyName(staticPatternOwner(property))
      ) {
        markClientOnlyDeferredValue(property.value)
      }
    }
  }

  function indexClientOnlyDeferredValues(node) {
    if (node.type === 'CallExpression') {
      if (isReactEffectCall(node)) {
        markClientOnlyDeferredValue(node.arguments?.[0])
      } else if (isKnownAsyncCallbackCall(node)) {
        for (const index of clientAsyncCallbackIndexes(node)) {
          markClientOnlyDeferredValue(node.arguments[index])
        }
      }
    }
    if (node.type === 'JSXOpeningElement' && isIntrinsicJsxName(node.name)) {
      for (const attribute of node.attributes) {
        if (
          attribute.type === 'JSXAttribute'
          && attribute.name.type === 'JSXIdentifier'
          && isClientOnlyIntrinsicPropertyName(attribute.name.name)
          && attribute.value?.type === 'JSXExpressionContainer'
        ) markClientOnlyDeferredValue(attribute.value.expression)
        if (attribute.type === 'JSXSpreadAttribute') {
          indexIntrinsicSpreadDeferredValues(attribute.argument)
        }
      }
    }
    for (const [child] of childNodes(node)) indexClientOnlyDeferredValues(child)
  }

  function stableAliasPlumbingReference(node, aliases) {
    const relation = nodeParents.get(node)
    if (relation?.parent.type !== 'VariableDeclarator' || relation.key !== 'init') return false
    const declaration = nodeParents.get(relation.parent)?.parent
    if (declaration?.type !== 'VariableDeclaration' || declaration.kind !== 'const') return false
    const targets = aliasTargetBindings(relation.parent.id)
    return targets.length > 0 && targets.every((target) => target.aliases === aliases)
  }

  function bindingReferencesAreDeferredFactoryCalls(binding) {
    let safe = true
    function inspect(node) {
      if (!safe) return
      if (
        node.type === 'Identifier'
        && !declaredIdentifiers.has(node)
        && lookup(node)?.aliases === binding.aliases
        && isReference(node)
        && !deferredFactoryCallees.has(unwrapExpression(node))
        && !stableAliasPlumbingReference(node, binding.aliases)
      ) {
        safe = false
        return
      }
      for (const [child] of childNodes(node)) inspect(child)
    }
    inspect(program)
    return safe
  }

  function callableNodes(binding) {
    const nodes = new Set()
    for (const alias of binding.aliases) {
      const relation = nodeParents.get(alias.identifier)
      if (
        relation?.parent.type === 'FunctionDeclaration'
        || relation?.parent.type === 'FunctionExpression'
      ) {
        nodes.add(relation.parent)
      } else if (relation?.parent.type === 'VariableDeclarator' && relation.key === 'id') {
        const initializer = unwrapExpression(relation.parent.init)
        if (
          initializer?.type === 'ArrowFunctionExpression'
          || initializer?.type === 'FunctionExpression'
        ) nodes.add(initializer)
      }
    }
    return nodes
  }

  function returnStatementsForFunction(functionNode) {
    const returns = []
    function visit(node) {
      if (node !== functionNode && (
        node.type === 'ArrowFunctionExpression'
        || node.type === 'FunctionDeclaration'
        || node.type === 'FunctionExpression'
      )) return
      if (node.type === 'ReturnStatement' && node.argument) returns.push(node)
      for (const [child] of childNodes(node)) visit(child)
    }
    if (functionNode.body?.type === 'BlockStatement') visit(functionNode.body)
    else if (functionNode.body) {
      markClientOnlyDeferredValue(functionNode.body)
      deferredArrowBodies.set(functionNode, projectDeferredCallbackValue(
        functionNode.body,
        'ClientDeferredFactoryResult',
      ))
    }
    return returns
  }

  function finalizeDeferredFactories() {
    const processed = new Set()
    while ([...deferredFactoryCandidates].some((binding) => !processed.has(binding))) {
      for (const binding of [...deferredFactoryCandidates]) {
        if (processed.has(binding)) continue
        processed.add(binding)
        if (
          [...binding.aliases].some((alias) => exportedBindings.has(alias))
          || !bindingReferencesAreDeferredFactoryCalls(binding)
        ) continue
        for (const functionNode of callableNodes(binding)) {
          for (const returnStatement of returnStatementsForFunction(functionNode)) {
            markClientOnlyDeferredValue(returnStatement.argument)
            deferredReturnValues.set(
              returnStatement,
              projectDeferredCallbackValue(
                returnStatement.argument,
                'ClientDeferredFactoryResult',
              ),
            )
          }
        }
      }
    }
  }

  function finalizeClientOnlyDeferredBindings() {
    for (const binding of deferredBindingCandidates) {
      if ([...binding.aliases].some((alias) => exportedBindings.has(alias))) continue
      let usedOnlyDeferred = true
      function inspectReferences(node) {
        if (!usedOnlyDeferred) return
        if (
          node.type === 'Identifier'
          && !declaredIdentifiers.has(node)
          && lookup(node)?.aliases === binding.aliases
          && isReference(node)
          && !clientOnlyDeferredValues.has(unwrapExpression(node))
          && !stableAliasPlumbingReference(node, binding.aliases)
        ) {
          usedOnlyDeferred = false
          return
        }
        for (const [child] of childNodes(node)) inspectReferences(child)
      }
      inspectReferences(program)
      if (!usedOnlyDeferred) continue
      for (const alias of binding.aliases) {
        const relation = nodeParents.get(alias.identifier)
        if (
          relation?.parent.type === 'FunctionDeclaration'
          || relation?.parent.type === 'FunctionExpression'
        ) {
          clientOnlyDeferredFunctions.add(relation.parent)
        } else if (relation?.parent.type === 'VariableDeclarator' && relation.key === 'id') {
          const initializer = unwrapExpression(relation.parent.init)
          if (
            initializer?.type === 'ArrowFunctionExpression'
            || initializer?.type === 'FunctionExpression'
          ) clientOnlyDeferredFunctions.add(initializer)
        }
      }
    }
  }

  function shallowCopyMutationSources(target) {
    let value = target
    while (value && EXPRESSION_WRAPPERS.has(value.type)) value = value.expression
    let depth = 0
    while (value?.type === 'MemberExpression') {
      depth += 1
      value = value.object
      while (value && EXPRESSION_WRAPPERS.has(value.type)) value = value.expression
    }
    if (depth < 2) return new Set()
    const roots = new Set(identityBindings(value))
    const sources = new Set()
    for (const root of roots) {
      for (const alias of root.aliases) {
        for (const source of alias.shallowCopySources) sources.add(source)
      }
    }
    return sources
  }

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
      const memberTarget = unwrapExpression(target)
      if (
        directBindings.size === 0
        && memberTarget?.type === 'MemberExpression'
        && unboundGlobalMemberRoot(memberTarget.object)
      ) {
        unresolvedMutations.push({
          executionScope,
          message: 'Unbound global property mutation',
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
      for (const source of shallowCopyMutationSources(target)) {
        for (const alias of source.aliases) {
          alias.writes.push({
            executionScope,
            kind: 'ambiguous-mutation',
            mutationNode: node,
            semanticNode,
          })
        }
      }
    }
    if (node.type === 'AssignmentExpression') {
      if (
        isMemberMutationTarget(node.left)
        && mayContainUnboundGlobalContainer(node.right)
      ) {
        unsupportedRootCalls.push({
          executionScope,
          message: 'Unsupported member-stored global container',
          mutationNode: node,
          semanticNode,
        })
      }
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
      const provenAsyncCallbackIndexes = new Set(
        isKnownAsyncCallbackCall(node) ? clientAsyncCallbackIndexes(node) : [],
      )
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
      const externalImportSources = new Set(
        [...invocationAliases]
          .map((binding) => binding.importSource)
          .filter((source) => typeof source === 'string' && !source.startsWith('.')),
      )
      const trustedExternalCall = externalImportSources.size > 0
        && [...externalImportSources].every((source) => TRUSTED_RUNTIME_PACKAGES.has(source))
      const callableIsInspectable = [...invocationAliases].some((binding) => (
        !binding.importSource || binding.importSource.startsWith('.')
      )) && [...invocationAliases].every((binding) => (
          !binding.importSource
          || binding.importSource.startsWith('.')
          || TRUSTED_RUNTIME_PACKAGES.has(binding.importSource)
        ))
      const hasPotentialCallback = (node.arguments ?? []).some(containsPotentialCallback)
      const inlineCallee = unwrapExpression(callee)
      const inlineCallable = inlineCallee?.type === 'ArrowFunctionExpression'
        || inlineCallee?.type === 'FunctionExpression'
      const unknownExternalStandaloneCall = !hasPotentialCallback
        && !callableIsInspectable
        && !inlineCallable
        && !trustedExternalCall
        && !isKnownAsyncCallbackCall(node)
        && !isKnownSynchronousCallbackCall(node)
        && !(callee.type === 'MemberExpression' && globalOwnerRoot(callee.object))
      if ([...calleeAliases].some((binding) => binding.dynamicIdentity)) {
        unsupportedRootCalls.push({
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
      if (unknownExternalStandaloneCall) {
        unsupportedRootCalls.push({
          executionScope,
          message: 'Unsupported external synchronous call',
          mutationNode: node,
          semanticNode,
        })
      } else if (
        callableIsInspectable
        || inlineCallable
        || (
          !hasPotentialCallback
          && executionScope.ownerNode?.type !== 'Program'
          && !(callee.type === 'MemberExpression' && globalOwnerRoot(callee.object))
        )
        || (hasPotentialCallback && isKnownSynchronousCallbackCall(node))
      ) {
        synchronousCalls.push({
          executionScope,
          mutationNode: node,
          semanticNode,
        })
      } else if (hasPotentialCallback && !isKnownAsyncCallbackCall(node)) {
        const calleeName = callee.type === 'Identifier'
          ? callee.name
          : callee.type === 'MemberExpression'
            ? memberName(callee) ?? '<computed member>'
            : callee.type
        unsupportedRootCalls.push({
          executionScope,
          message: `Unsupported callback execution timing for ${calleeName}`,
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
        const possiblyMutatedArguments = (node.arguments ?? []).map((argument, index) => ({
          argument,
          index,
        })).filter(({ index }) => (
          !provenAsyncCallbackIndexes.has(index)
          && (!reflectApplyCallable || index > 0)
        ))
        for (const { argument } of possiblyMutatedArguments) {
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
          for (const [index, argument] of (node.arguments ?? []).entries()) {
            if (provenAsyncCallbackIndexes.has(index)) continue
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
      )) && [...calleeAliases].every((binding) => (
          !binding.importSource
          || binding.importSource.startsWith('.')
          || TRUSTED_RUNTIME_PACKAGES.has(binding.importSource)
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
      synchronousCalls.push({
        executionScope,
        mutationNode: node,
        semanticNode,
      })
      if (!callableIsInspectable) {
        for (const argument of node.arguments ?? []) {
          record(argument, 'ambiguous-mutation', { trackDynamic: false })
        }
      }
    }
    if (node.type === 'TaggedTemplateExpression') {
      const tagBindings = new Set(identityBindings(node.tag))
      const tagAliases = new Set(
        [...tagBindings].flatMap((binding) => [...binding.aliases]),
      )
      const tagIsInspectable = [...tagAliases].some((binding) => (
        !binding.importSource || binding.importSource.startsWith('.')
      )) && [...tagAliases].every((binding) => (
          !binding.importSource
          || binding.importSource.startsWith('.')
          || TRUSTED_RUNTIME_PACKAGES.has(binding.importSource)
        ))
      if (
        tagBindings.size === 0 && containsDynamicIdentity(node.tag)
        || [...tagAliases].some((binding) => binding.dynamicIdentity)
      ) {
        unresolvedMutations.push({
          executionScope,
          message: 'Unsupported dynamic tag target',
          mutationNode: node,
          semanticNode,
        })
      }
      synchronousCalls.push({
        executionScope,
        mutationNode: node,
        semanticNode,
      })
      if (!tagIsInspectable) {
        for (const expression of node.quasi.expressions ?? []) {
          record(expression, 'ambiguous-mutation', { trackDynamic: false })
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
  indexClientOnlyDeferredValues(program)
  finalizeDeferredFactories()
  finalizeClientOnlyDeferredBindings()

  const clientOnlyIntrinsicSpreadProperties = new WeakSet()
  const intrinsicClientSpreadValues = new WeakMap()
  const intrinsicSpreadInitializers = new WeakMap()

  function staticIntrinsicSpreadPropertyName(property) {
    if (property?.type !== 'Property') return null
    if (!property.computed && property.key.type === 'Identifier') return property.key.name
    if (
      (property.key.type === 'StringLiteral' || property.key.type === 'Literal')
      && typeof property.key.value === 'string'
    ) return property.key.value
    return null
  }

  function filteredIntrinsicSpreadObject(node) {
    const value = unwrapExpression(node)
    if (value?.type !== 'ObjectExpression') {
      throw new Error(`Unsupported intrinsic JSX spread in ${path}`)
    }
    const properties = []
    for (const property of value.properties) {
      if (property.type === 'SpreadElement') {
        properties.push(...filteredIntrinsicSpreadObject(property.argument).properties)
        continue
      }
      if (property.type !== 'Property') {
        throw new Error(`Unsupported intrinsic JSX spread property in ${path}`)
      }
      const name = staticIntrinsicSpreadPropertyName(property)
      if (name === null) {
        throw new Error(`Unsupported dynamic intrinsic JSX spread property in ${path}`)
      }
      if (
        property.kind === 'init'
        && isClientOnlyIntrinsicPropertyName(name)
      ) {
        markClientOnlyDeferredValue(property.value)
        if (isPureDeferredValue(property.value)) {
          clientOnlyIntrinsicSpreadProperties.add(property)
          continue
        }
        intrinsicClientSpreadValues.set(
          property,
          projectDeferredCallbackValue(property.value, 'ClientEventCallback'),
        )
      }
      properties.push(property)
    }
    return { ...value, properties }
  }

  function directConstDeclarator(binding) {
    const relation = nodeParents.get(binding?.identifier)
    if (relation?.parent.type !== 'VariableDeclarator' || relation.key !== 'id') return null
    const declarationRelation = nodeParents.get(relation.parent)
    if (
      declarationRelation?.parent.type !== 'VariableDeclaration'
      || declarationRelation.parent.kind !== 'const'
    ) return null
    return relation.parent
  }

  function intrinsicSpreadReference(node) {
    const relation = nodeParents.get(node)
    if (relation?.parent.type !== 'JSXSpreadAttribute' || relation.key !== 'argument') return false
    const openingRelation = nodeParents.get(relation.parent)
    return openingRelation?.parent.type === 'JSXOpeningElement'
      && isIntrinsicJsxName(openingRelation.parent.name)
  }

  function bindingUsedOnlyByIntrinsicSpreads(binding) {
    let safe = true
    function visit(node) {
      if (!safe) return
      if (
        node.type === 'Identifier'
        && !declaredIdentifiers.has(node)
        && lookup(node) === binding
        && isReference(node)
        && !intrinsicSpreadReference(node)
      ) {
        safe = false
        return
      }
      for (const [child] of childNodes(node)) visit(child)
    }
    visit(program)
    return safe
  }

  function projectIntrinsicJsxSpread(node) {
    const value = unwrapExpression(node)
    if (value?.type === 'ObjectExpression') return filteredIntrinsicSpreadObject(value)
    if (value?.type !== 'Identifier') {
      throw new Error(`Unsupported dynamic intrinsic JSX spread in ${path}`)
    }
    const binding = lookup(value)
    const declarator = directConstDeclarator(binding)
    if (
      !binding
      || binding.aliasUnstable
      || binding.writes.length > 0
      || !declarator?.init
      || !bindingUsedOnlyByIntrinsicSpreads(binding)
    ) {
      throw new Error(`Unsupported mutable intrinsic JSX spread in ${path}`)
    }
    if (!intrinsicSpreadInitializers.has(declarator)) {
      intrinsicSpreadInitializers.set(
        declarator,
        filteredIntrinsicSpreadObject(declarator.init),
      )
    }
    return value
  }

  function indexIntrinsicJsxSpreads(node) {
    if (node.type === 'JSXOpeningElement' && isIntrinsicJsxName(node.name)) {
      for (const attribute of node.attributes) {
        if (attribute.type === 'JSXSpreadAttribute') {
          projectIntrinsicJsxSpread(attribute.argument)
        }
      }
    }
    for (const [child] of childNodes(node)) indexIntrinsicJsxSpreads(child)
  }
  indexIntrinsicJsxSpreads(program)

  function projectIntrinsicClientAttribute(attribute) {
    if (
      attribute?.type !== 'JSXAttribute'
      || attribute.name?.type !== 'JSXIdentifier'
      || !isClientOnlyIntrinsicPropertyName(attribute.name.name)
      || attribute.value?.type !== 'JSXExpressionContainer'
    ) return attribute
    return {
      ...attribute,
      value: {
        ...attribute.value,
        expression: projectDeferredCallbackValue(
          attribute.value.expression,
          'ClientEventCallback',
        ),
      },
    }
  }

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
      if (clientOnlyDeferredFunctions.has(functionNode)) return true
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
        && (
          isReactEffectCall(relation.parent)
          || isKnownAsyncCallbackCall(relation.parent)
        )
      ) return true
      currentScope = currentScope.parent
    }
    return false
  }

  function isClientOnlyIntrinsicAttribute(node) {
    if (clientOnlyIntrinsicSpreadProperties.has(node)) return true
    const relation = nodeParents.get(node)
    return relation?.parent.type === 'JSXOpeningElement'
      && isDroppableClientOnlyIntrinsicJsxAttribute(node, relation.parent, {
        isPureDeferredValue,
      })
  }

  return {
    childNodes,
    clientAsyncCallbackIndexes,
    executionScopeFor: (node) => nearestFunctionScope(nodeScopes.get(node)),
    isClientOnlyEffectScope,
    isClientOnlyDeferredValue: (node) => clientOnlyDeferredValues.has(unwrapExpression(node)),
    isClientEffectCall: isReactEffectCall,
    isClientOnlyIntrinsicAttribute,
    isPureDeferredValue,
    isReference,
    lookup,
    moduleEvaluationEdges,
    synchronousCalls,
    projectDeferredCallbackValue,
    projectDeferredArrowBody: (node) => deferredArrowBodies.get(node),
    projectDeferredReturnValue: (node) => deferredReturnValues.get(node),
    projectIntrinsicClientAttribute,
    projectIntrinsicJsxSpread,
    projectIntrinsicSpreadPropertyValue: (node) => intrinsicClientSpreadValues.get(node),
    projectIntrinsicSpreadInitializer: (node) => intrinsicSpreadInitializers.get(node),
    unsupportedRootCalls,
    unresolvedMutations,
  }
}

function yamlIndent(line) {
  return line.length - line.trimStart().length
}

function yamlScalar(value) {
  const trimmed = value.trim()
  if (
    trimmed.length >= 2
    && ((trimmed[0] === "'" && trimmed.at(-1) === "'")
      || (trimmed[0] === '"' && trimmed.at(-1) === '"'))
  ) return trimmed.slice(1, -1)
  return trimmed
}

function yamlMapEntry(line, indent) {
  if (yamlIndent(line) !== indent) return null
  const content = line.slice(indent)
  const separator = content.indexOf(':')
  if (separator < 1) return null
  return {
    key: yamlScalar(content.slice(0, separator)),
    value: yamlScalar(content.slice(separator + 1)),
  }
}

function yamlSectionEntries(lines, section, sectionIndent, entryIndent) {
  const sectionLine = `${' '.repeat(sectionIndent)}${section}:`
  const start = lines.findLastIndex((line) => line === sectionLine)
  if (start < 0) return []
  const entries = []
  for (let index = start + 1; index < lines.length;) {
    const line = lines[index]
    if (line.trim() && yamlIndent(line) <= sectionIndent) break
    const parsed = yamlMapEntry(line, entryIndent)
    if (!parsed) {
      index += 1
      continue
    }
    let end = index + 1
    while (
      end < lines.length
      && (!lines[end].trim() || yamlIndent(lines[end]) > entryIndent)
    ) end += 1
    entries.push({ ...parsed, lines: lines.slice(index, end) })
    index = end
  }
  return entries
}

function nestedYamlValue(entry, name, sectionIndent) {
  for (const line of entry.lines) {
    const field = yamlMapEntry(line, sectionIndent + 2)
    if (field?.key === name) return field.value || null
  }
  return null
}

function registryResolutionIntegrity(entry) {
  const supportedIntegrity = /^(?:sha256|sha384|sha512)-([A-Za-z0-9+/]+={0,2})$/u
  for (let index = 1; index < entry.lines.length; index += 1) {
    const resolution = yamlMapEntry(entry.lines[index], 4)
    if (resolution?.key !== 'resolution') continue
    let integrity = null
    if (resolution.value.startsWith('{') && resolution.value.endsWith('}')) {
      const inline = resolution.value.slice(1, -1)
      const match = inline.match(
        /(?:^|,)\s*integrity\s*:\s*(?:"([^"]*)"|'([^']*)'|([^,\s}]+))/u,
      )
      integrity = match ? (match[1] ?? match[2] ?? match[3] ?? '') : null
    } else if (!resolution.value) {
      for (let nestedIndex = index + 1; nestedIndex < entry.lines.length; nestedIndex += 1) {
        if (entry.lines[nestedIndex].trim() && yamlIndent(entry.lines[nestedIndex]) <= 4) break
        const field = yamlMapEntry(entry.lines[nestedIndex], 6)
        if (field?.key === 'integrity') {
          integrity = field.value
          break
        }
      }
    }
    const match = integrity?.match(supportedIntegrity)
    if (!match) return null
    try {
      return Buffer.from(match[1], 'base64').toString('base64') === match[1]
        ? integrity
        : null
    } catch {
      return null
    }
  }
  return null
}

function selectedRuntimePackageNames(runtimePackages, availableNames) {
  const selected = runtimePackages === undefined
    ? [...availableNames].filter((name) => TRUSTED_RUNTIME_PACKAGE_NAMES.has(name))
    : [...runtimePackages]
  for (const name of selected) {
    if (!TRUSTED_RUNTIME_PACKAGE_NAMES.has(name)) {
      throw new Error(`Unsupported trusted runtime package ${name}`)
    }
  }
  return [...new Set(selected)].sort()
}

function runtimePackageJsonProjection(source, runtimePackages) {
  const parsed = JSON.parse(source)
  const dependencies = parsed.dependencies ?? {}
  const selected = selectedRuntimePackageNames(runtimePackages, Object.keys(dependencies))
  for (const name of selected) {
    if (!Object.hasOwn(dependencies, name)) {
      throw new Error(`Missing runtime dependency ${name}`)
    }
  }
  return JSON.stringify(Object.fromEntries(selected.map((name) => [name, dependencies[name]])))
}

function runtimeLockProjection(source, runtimePackages) {
  const lines = source.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n')
  const importerEntries = yamlSectionEntries(lines, 'importers', 0, 2)
  const rootImporter = importerEntries.filter((entry) => entry.key === '.').at(-1)
  const rootDependencies = rootImporter
    ? yamlSectionEntries(rootImporter.lines, 'dependencies', 4, 6)
    : []
  const selectedNames = selectedRuntimePackageNames(
    runtimePackages,
    rootDependencies.map((dependency) => dependency.key),
  )
  if (selectedNames.length > 0 && !rootImporter) {
    throw new Error('Missing root lock importer')
  }
  const roots = new Map()
  if (rootImporter) {
    for (const dependency of rootDependencies) {
      if (!selectedNames.includes(dependency.key)) continue
      const specifier = nestedYamlValue(dependency, 'specifier', 6)
      const version = nestedYamlValue(dependency, 'version', 6)
      if (!specifier || !version) {
        throw new Error(`Missing locked root ${dependency.key}`)
      }
      roots.set(dependency.key, { specifier, version })
    }
  }
  for (const name of selectedNames) {
    if (!roots.has(name)) throw new Error(`Missing locked root ${name}`)
  }

  const packageEntries = new Map(
    yamlSectionEntries(lines, 'packages', 0, 2).map((entry) => [entry.key, entry]),
  )
  const snapshotEntries = new Map(
    yamlSectionEntries(lines, 'snapshots', 0, 2).map((entry) => [entry.key, entry]),
  )
  const selectedPackages = new Map()
  const selectedSnapshots = new Map()
  const pending = [...roots].map(([name, { version }]) => `${name}@${version}`)
  const visited = new Set()
  while (pending.length > 0) {
    const key = pending.pop()
    if (!key || visited.has(key) || /^(?:link|workspace):/u.test(key)) continue
    visited.add(key)
    const snapshot = snapshotEntries.get(key)
    if (!snapshot) throw new Error(`Missing locked snapshot ${key}`)
    selectedSnapshots.set(key, snapshot.lines.join('\n'))
    for (const section of ['dependencies', 'optionalDependencies']) {
      for (const dependency of yamlSectionEntries(snapshot.lines, section, 4, 6)) {
        const version = dependency.value
          || nestedYamlValue(dependency, 'version', 6)
        if (version && !/^(?:link|workspace):/u.test(version)) {
          pending.push(`${dependency.key}@${version}`)
        }
      }
    }
    const packageKey = key.replace(/\(.+$/u, '')
    const packageEntry = packageEntries.get(key) ?? packageEntries.get(packageKey)
    if (!packageEntry) throw new Error(`Missing locked package ${packageKey}`)
    const packageSource = packageEntry.lines.join('\n')
    if (!registryResolutionIntegrity(packageEntry)) {
      throw new Error(`Missing registry integrity ${packageEntry.key}`)
    }
    selectedPackages.set(packageEntry.key, packageSource)
  }

  const sortedObject = (entries) => Object.fromEntries([...entries].sort(([left], [right]) => (
    left.localeCompare(right)
  )))
  return JSON.stringify({
    roots: sortedObject(roots),
    packages: sortedObject(selectedPackages),
    snapshots: sortedObject(selectedSnapshots),
  })
}

export function semanticSourceForDigest(path, source, options = {}) {
  if (path === 'site/package.json') {
    return runtimePackageJsonProjection(source, options.runtimePackages)
  }
  if (path === 'site/pnpm-lock.yaml') {
    return runtimeLockProjection(source, options.runtimePackages)
  }
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
  const runtimePackageSpecifiers = options.runtimePackageSpecifiers ?? new Set()
  const recordRuntimePackageSpecifier = (specifier) => {
    if (typeof specifier !== 'string' || specifier.startsWith('.')) {
      return
    }
    runtimePackageSpecifiers.add(specifier)
  }
  for (const sourceNode of bindingGraph.moduleEvaluationEdges) {
    recordRuntimePackageSpecifier(sourceNode.value)
  }
  const finishProjection = (projection) => {
    for (const specifier of runtimePackageSpecifiers) {
      if (!trustedRuntimePackageName(specifier)) {
        throw new Error(`Unsupported semantic runtime package ${specifier}`)
      }
    }
    return projection
  }
  const collectRuntimePackageSpecifiers = (node) => {
    if (!runtimePackageSpecifiers || !node || typeof node !== 'object') return
    if (bindingGraph.isClientOnlyDeferredValue(node)) return
    if (bindingGraph.isClientOnlyIntrinsicAttribute(node)) return
    if (node.type === 'ImportExpression') {
      if (typeof node.source?.value !== 'string') {
        throw new Error(`Unsupported dynamic semantic runtime import in ${path}`)
      }
      recordRuntimePackageSpecifier(node.source.value)
      return
    }
    for (const [child] of bindingGraph.childNodes(node)) {
      collectRuntimePackageSpecifiers(child)
    }
  }
  const projectionOptions = {
    clientAsyncCallbackIndexes: bindingGraph.clientAsyncCallbackIndexes,
    isClientEffectCall: bindingGraph.isClientEffectCall,
    isPureDeferredValue: bindingGraph.isPureDeferredValue,
    projectDeferredCallbackValue: bindingGraph.projectDeferredCallbackValue,
    projectDeferredArrowBody: bindingGraph.projectDeferredArrowBody,
    projectDeferredReturnValue: bindingGraph.projectDeferredReturnValue,
    projectIntrinsicClientAttribute: bindingGraph.projectIntrinsicClientAttribute,
    projectIntrinsicJsxSpread: bindingGraph.projectIntrinsicJsxSpread,
    projectIntrinsicSpreadPropertyValue: bindingGraph.projectIntrinsicSpreadPropertyValue,
    projectIntrinsicSpreadInitializer: bindingGraph.projectIntrinsicSpreadInitializer,
  }
  if (!rootName) {
    collectRuntimePackageSpecifiers(program)
    return finishProjection(JSON.stringify(runtimeAstProjection(program, projectionOptions)))
  }
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
  for (const moduleEvaluationEdge of bindingGraph.moduleEvaluationEdges) {
    slices.add(moduleEvaluationEdge)
    pendingNodes.push(moduleEvaluationEdge)
  }
  const executesDuringRootRender = (entry) => (
    entry.executionScope === rootExecutionScope
    || entry.executionScope.ownerNode?.type === 'Program'
  )
  for (const entry of bindingGraph.unsupportedRootCalls) {
    if (!executesDuringRootRender(entry)) continue
    if (bindingGraph.isClientOnlyEffectScope(entry.executionScope)) continue
    throw new Error(`${entry.message} in ${path}`)
  }
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
      if (bindingGraph.isClientOnlyDeferredValue(node)) return
      if (bindingGraph.isClientOnlyIntrinsicAttribute(node)) return
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
  for (const node of outermostSlices) collectRuntimePackageSpecifiers(node)
  return finishProjection(JSON.stringify(outermostSlices.map((node) => (
    runtimeAstProjection(node, projectionOptions)
  ))))
}

function projectPath(path) {
  return relative(projectRoot, path).replaceAll('\\', '/')
}

export function resolveStaticImport(importer, specifier) {
  const pathSpecifier = specifier.match(/^[^?#]*/u)?.[0] ?? specifier
  const query = specifier.slice(pathSpecifier.length).match(/^\?([^#]*)/u)?.[1] ?? ''
  const queryParameters = new URLSearchParams(query)
  const importsCssAsValue = ['inline', 'raw', 'url'].some((name) => (
    queryParameters.has(name)
  ))
  if (!pathSpecifier.startsWith('.')) return null
  const unresolved = resolve(dirname(importer), pathSpecifier)
  const candidates = extname(unresolved)
    ? [unresolved]
    : [
        ...RESOLVED_EXTENSIONS.map((extension) => `${unresolved}${extension}`),
        ...RESOLVED_EXTENSIONS.map((extension) => resolve(unresolved, `index${extension}`)),
      ]
  const resolved = candidates.find((candidate) => (
    existsSync(candidate) && statSync(candidate).isFile()
  ))
  if (!resolved || (extname(resolved) === '.css' && !importsCssAsValue)) return null
  return resolved
}

export function staticImportSpecifiersForSource(path, source) {
  const { program, errors } = parseSync(path, source)
  if (errors.length > 0) {
    throw new Error(`Unable to parse semantic dependency ${path}: ${errors[0].message}`)
  }
  const staticSpecifiers = program.body.flatMap((statement) => {
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
  return [
    ...staticSpecifiers,
    ...moduleEvaluationDynamicImportSources(program, path).map((sourceNode) => sourceNode.value),
  ]
}

function trustedRuntimePackageName(specifier) {
  if (!TRUSTED_RUNTIME_PACKAGES.has(specifier)) return null
  return specifier.startsWith('@')
    ? specifier.split('/').slice(0, 2).join('/')
    : specifier.split('/')[0]
}

const semanticRouteEvidenceCache = new Map()

function semanticRouteEvidence(pathname) {
  if (semanticRouteEvidenceCache.has(pathname)) return semanticRouteEvidenceCache.get(pathname)
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
  const runtimePackages = new Set()

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

    if (PARSED_EXTENSIONS.has(extname(relativePath))) {
      const source = readFileSync(path, 'utf8')
      const runtimePackageSpecifiers = new Set()
      semanticSourceForDigest(relativePath, source, { runtimePackageSpecifiers })
      for (const specifier of runtimePackageSpecifiers) {
        const runtimePackage = trustedRuntimePackageName(specifier)
        if (!runtimePackage) {
          throw new Error(`Unsupported semantic runtime package ${specifier}`)
        }
        runtimePackages.add(runtimePackage)
      }

      for (const specifier of staticImportSpecifiersForSource(relativePath, source)) {
        if (!specifier.startsWith('.')) continue
        const dependency = resolveStaticImport(path, specifier)
        if (dependency) pending.push(dependency)
      }
    }
  }

  if (runtimePackages.size > 0) {
    visited.add('site/package.json')
    visited.add('site/pnpm-lock.yaml')
  }
  const evidence = {
    files: [...visited].sort(),
    runtimePackages: [...runtimePackages].sort(),
  }
  semanticRouteEvidenceCache.set(pathname, evidence)
  return evidence
}

export function semanticRouteFiles(pathname) {
  return [...semanticRouteEvidence(pathname).files]
}

export function semanticRuntimePackageNamesForRoute(pathname) {
  return [...semanticRouteEvidence(pathname).runtimePackages]
}
