import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const siteDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const catalogPath = join(siteDir, 'src', 'data', 'catalog.ts')
const outputPath = join(siteDir, 'src', 'data', 'problems.ts')

function sourceFile(path, kind = ts.ScriptKind.TS) {
  return ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, kind)
}

function findVariable(file, name) {
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name) return declaration.initializer
    }
  }
  throw new Error(`Missing variable ${name} in ${file.fileName}`)
}

function objectProperty(object, name) {
  const property = object.properties.find(
    (candidate) =>
      ts.isPropertyAssignment(candidate) &&
      ((ts.isIdentifier(candidate.name) && candidate.name.text === name) ||
        (ts.isStringLiteral(candidate.name) && candidate.name.text === name)),
  )
  if (!property || !ts.isPropertyAssignment(property)) {
    throw new Error(`Missing property ${name} in ${object.getSourceFile().fileName}`)
  }
  return property.initializer
}

function literalText(node, label) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  throw new Error(`${label} must be a string literal in ${node.getSourceFile().fileName}`)
}

function collectLessons() {
  const file = sourceFile(catalogPath)
  const initializer = findVariable(file, 'PARTS')
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) throw new Error('PARTS must be an array literal')

  const lessons = new Map()
  for (const partNode of initializer.elements) {
    if (!ts.isObjectLiteralExpression(partNode)) continue
    const part = literalText(objectProperty(partNode, 'id'), 'part.id')
    const partTitle = literalText(objectProperty(partNode, 'title'), 'part.title')
    const typesNode = objectProperty(partNode, 'types')
    if (!ts.isArrayLiteralExpression(typesNode)) throw new Error(`types for ${part} must be an array literal`)
    for (const typeNode of typesNode.elements) {
      if (!ts.isObjectLiteralExpression(typeNode)) continue
      const slug = literalText(objectProperty(typeNode, 'slug'), 'type.slug')
      const contentPath = importTarget(objectProperty(typeNode, 'content'))
      if (!contentPath) throw new Error(`Missing content import for ${part}/${slug}`)
      lessons.set(`${part}/${slug}`, {
        part,
        partTitle,
        slug,
        typeTitle: literalText(objectProperty(typeNode, 'title'), 'type.title'),
        sourcePath: resolve(dirname(catalogPath), `${contentPath}.tsx`),
      })
    }
  }
  return lessons
}

function importTarget(node) {
  let target = null
  function visit(current) {
    if (
      ts.isCallExpression(current) &&
      current.expression.kind === ts.SyntaxKind.ImportKeyword &&
      current.arguments.length === 1
    ) {
      target = literalText(current.arguments[0], 'lazy import')
      return
    }
    ts.forEachChild(current, visit)
  }
  visit(node)
  return target
}

function jsxAttribute(node, name, required = true) {
  const attribute = node.attributes.properties.find(
    (candidate) => ts.isJsxAttribute(candidate) && candidate.name.text === name,
  )
  if (!attribute || !ts.isJsxAttribute(attribute) || !attribute.initializer) {
    if (required) throw new Error(`Missing ${name} on ${node.tagName.getText()} in ${node.getSourceFile().fileName}`)
    return ''
  }
  if (ts.isStringLiteral(attribute.initializer)) return attribute.initializer.text
  if (
    ts.isJsxExpression(attribute.initializer) &&
    attribute.initializer.expression &&
    (ts.isStringLiteral(attribute.initializer.expression) ||
      ts.isNoSubstitutionTemplateLiteral(attribute.initializer.expression))
  ) {
    return attribute.initializer.expression.text
  }
  throw new Error(`${name} must be a string literal in ${node.getSourceFile().fileName}`)
}

function collectLessonProblems(path, lesson) {
  const file = sourceFile(path, ts.ScriptKind.TSX)
  const problems = []
  const metadata = {
    part: lesson.part,
    partTitle: lesson.partTitle,
    slug: lesson.slug,
    typeTitle: lesson.typeTitle,
    route: `${lesson.part}/${lesson.slug}`,
  }
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(file)
      if (tag === 'ExampleCard' || tag === 'Exercise') {
        problems.push({
          ...metadata,
          pid: jsxAttribute(node, 'pid'),
          name: jsxAttribute(node, 'name'),
          diff: tag === 'ExampleCard' ? jsxAttribute(node, 'diff', false) : '',
          kind: tag === 'ExampleCard' ? 'example' : 'exercise',
          src: tag === 'ExampleCard' ? jsxAttribute(node, 'src', false) : '',
        })
      }
    }
    ts.forEachChild(node, visit)
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
      console.error('[content] src/data/problems.ts is stale; run npm run content:generate')
      process.exitCode = 1
    }
    return
  }
  throw new Error(`Unknown mode: ${mode}`)
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) main()
