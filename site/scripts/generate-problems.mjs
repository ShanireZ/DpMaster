import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseSync } from 'oxc-parser'

const siteDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const catalogPath = join(siteDir, 'src', 'data', 'catalog.ts')
const outputPath = join(siteDir, 'src', 'data', 'problems.ts')

function sourceFile(path) {
  const { program, errors } = parseSync(path, readFileSync(path, 'utf8'))
  if (errors.length > 0) {
    throw new Error(`Unable to parse ${path}: ${errors[0].message}`)
  }
  return program
}

function findVariable(file, name) {
  for (const statement of file.body) {
    const declaration =
      statement.type === 'ExportNamedDeclaration'
        ? statement.declaration
        : statement
    if (declaration?.type !== 'VariableDeclaration') continue
    for (const variable of declaration.declarations) {
      if (variable.id.type === 'Identifier' && variable.id.name === name) {
        return variable.init
      }
    }
  }
  throw new Error(`Missing variable ${name} in ${catalogPath}`)
}

function propertyName(property) {
  if (property.key.type === 'Identifier') return property.key.name
  if (property.key.type === 'Literal') return property.key.value
  return undefined
}

function objectProperty(object, name, fileName = catalogPath) {
  const property = object.properties.find(
    (candidate) =>
      candidate.type === 'Property' && propertyName(candidate) === name,
  )
  if (!property || property.type !== 'Property') {
    throw new Error(`Missing property ${name} in ${fileName}`)
  }
  return property.value
}

function literalText(node, label, fileName = catalogPath) {
  if (node?.type === 'Literal' && typeof node.value === 'string') {
    return node.value
  }
  if (
    node?.type === 'TemplateLiteral' &&
    node.expressions.length === 0 &&
    node.quasis.length === 1
  ) {
    return node.quasis[0].value.cooked ?? node.quasis[0].value.raw
  }
  throw new Error(`${label} must be a string literal in ${fileName}`)
}

function collectLessons() {
  const file = sourceFile(catalogPath)
  const initializer = findVariable(file, 'PARTS')
  if (initializer?.type !== 'ArrayExpression') {
    throw new Error('PARTS must be an array literal')
  }

  const lessons = new Map()
  for (const partNode of initializer.elements) {
    if (partNode?.type !== 'ObjectExpression') continue
    const part = literalText(objectProperty(partNode, 'id'), 'part.id')
    const partTitle = literalText(objectProperty(partNode, 'title'), 'part.title')
    const typesNode = objectProperty(partNode, 'types')
    if (typesNode.type !== 'ArrayExpression') {
      throw new Error(`types for ${part} must be an array literal`)
    }
    for (const typeNode of typesNode.elements) {
      if (typeNode?.type !== 'ObjectExpression') continue
      const slug = literalText(objectProperty(typeNode, 'slug'), 'type.slug')
      const contentPath = lessonContentTarget(typeNode)
      if (!contentPath) throw new Error(`Missing lesson content source for ${part}/${slug}`)
      lessons.set(`${part}/${slug}`, {
        part,
        partTitle,
        slug,
        typeTitle: literalText(objectProperty(typeNode, 'title'), 'type.title'),
        sourcePath: resolve(dirname(catalogPath), contentPath),
      })
    }
  }
  return lessons
}

function lessonContentTarget(object) {
  let target = null
  function visit(current) {
    if (!current || typeof current !== 'object' || target) return
    if (
      current.type === 'CallExpression' &&
      current.callee.type === 'Identifier' &&
      current.callee.name === 'lessonContent' &&
      current.arguments.length > 0
    ) {
      target = literalText(current.arguments[0], 'lesson content source')
      return
    }
    for (const value of Object.values(current)) {
      if (Array.isArray(value)) {
        for (const child of value) visit(child)
      } else {
        visit(value)
      }
    }
  }
  visit(object)
  return target
}

function jsxName(node) {
  if (node.type === 'JSXIdentifier') return node.name
  return ''
}

function jsxAttribute(node, name, fileName, required = true) {
  const attribute = node.attributes.find(
    (candidate) =>
      candidate.type === 'JSXAttribute' && jsxName(candidate.name) === name,
  )
  if (!attribute || attribute.type !== 'JSXAttribute' || !attribute.value) {
    if (required) {
      throw new Error(`Missing ${name} on ${jsxName(node.name)} in ${fileName}`)
    }
    return ''
  }
  if (
    attribute.value.type === 'Literal' &&
    typeof attribute.value.value === 'string'
  ) {
    return attribute.value.value
  }
  if (
    attribute.value.type === 'JSXExpressionContainer' &&
    attribute.value.expression.type !== 'JSXEmptyExpression'
  ) {
    return literalText(attribute.value.expression, name, fileName)
  }
  throw new Error(`${name} must be a string literal in ${fileName}`)
}

function collectLessonProblems(path, lesson) {
  const file = sourceFile(path)
  const problems = []
  const metadata = {
    part: lesson.part,
    partTitle: lesson.partTitle,
    slug: lesson.slug,
    typeTitle: lesson.typeTitle,
    route: `${lesson.part}/${lesson.slug}`,
  }
  function visit(node) {
    if (!node || typeof node !== 'object') return
    if (node.type === 'JSXOpeningElement') {
      const tag = jsxName(node.name)
      if (tag === 'ExampleCard' || tag === 'Exercise') {
        problems.push({
          ...metadata,
          pid: jsxAttribute(node, 'pid', path),
          name: jsxAttribute(node, 'name', path),
          diff:
            tag === 'ExampleCard'
              ? jsxAttribute(node, 'diff', path, false)
              : '',
          kind: tag === 'ExampleCard' ? 'example' : 'exercise',
          src:
            tag === 'ExampleCard'
              ? jsxAttribute(node, 'src', path, false)
              : '',
        })
      }
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const child of value) visit(child)
      } else {
        visit(value)
      }
    }
  }
  visit(file)
  return problems
}

export function collectProblems() {
  const lessons = collectLessons()
  const problems = []
  for (const lesson of lessons.values()) {
    problems.push(...collectLessonProblems(lesson.sourcePath, lesson))
  }
  return problems
}

function quote(value) {
  return `'${String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`
}

export function renderProblems(problems) {
  const lines = problems.map(
    (problem) =>
      `  { part: ${quote(problem.part)}, partTitle: ${quote(problem.partTitle)}, slug: ${quote(problem.slug)}, typeTitle: ${quote(problem.typeTitle)}, pid: ${quote(problem.pid)}, name: ${quote(problem.name)}, diff: ${quote(problem.diff)}, kind: ${quote(problem.kind)}, src: ${quote(problem.src)} },`,
  )
  return `// AUTO-GENERATED by scripts/generate-problems.mjs from lesson JSX. Do not edit by hand.\n` +
    `export type ProblemKind = 'example' | 'exercise'\n\n` +
    `export interface Problem {\n` +
    `  part: string\n  partTitle: string\n  slug: string\n  typeTitle: string\n` +
    `  pid: string\n  name: string\n  diff: string\n  kind: ProblemKind\n  src: string\n` +
    `}\n\nexport const PROBLEMS: Problem[] = [\n${lines.join('\n')}\n]\n`
}

export function report(problems) {
  return {
    total: problems.length,
    examples: problems.filter((problem) => problem.kind === 'example').length,
    exercises: problems.filter((problem) => problem.kind === 'exercise').length,
    unique: new Set(problems.map((problem) => problem.pid)).size,
    problems,
  }
}

function main() {
  const mode = process.argv[2] ?? '--check'
  const problems = collectProblems()
  const rendered = renderProblems(problems)
  if (mode === '--json') {
    process.stdout.write(`${JSON.stringify(report(problems))}\n`)
    return
  }
  if (mode === '--write') {
    writeFileSync(outputPath, rendered)
    const summary = report(problems)
    console.log(
      `[content] generated ${summary.total} slots (${summary.examples} examples, ${summary.exercises} exercises, ${summary.unique} unique IDs)`,
    )
    return
  }
  if (mode === '--check') {
    // 归一化行尾：生成器用 \n(LF) 拼字符串，而 Windows 检出的文件是 CRLF，
    // 直接逐字节比对会永远报 stale。统一剥掉 \r 后再比。
    const current = readFileSync(outputPath, 'utf8').replace(/\r\n/g, '\n')
    if (current !== rendered) {
      console.error('[content] src/data/problems.ts is stale; run pnpm content:generate')
      process.exitCode = 1
    }
    return
  }
  throw new Error(`Unknown mode: ${mode}`)
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) main()
