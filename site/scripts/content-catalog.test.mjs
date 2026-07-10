import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import test from 'node:test'

const scriptsDir = dirname(fileURLToPath(import.meta.url))
const siteDir = join(scriptsDir, '..')
const generator = join(scriptsDir, 'generate-problems.mjs')

function run(mode) {
  return spawnSync(process.execPath, [generator, mode], {
    cwd: siteDir,
    encoding: 'utf8',
  })
}

test('lesson JSX produces the complete public problem corpus', () => {
  const result = run('--json')
  assert.equal(result.status, 0, result.stderr || result.stdout)

  const report = JSON.parse(result.stdout)
  assert.equal(report.total, 177)
  assert.equal(report.unique, 116)
  assert.equal(report.examples + report.exercises, report.total)
  assert.equal(Object.hasOwn(report.problems[0], 'sourcePath'), false)
  assert.ok(
    report.problems.some(
      (problem) =>
        problem.route === 'c/tree' && problem.pid === 'P1880' && problem.kind === 'example',
    ),
  )
  assert.ok(
    report.problems.some(
      (problem) =>
        problem.route === 'c/tree' && problem.pid === 'P1436' && problem.kind === 'exercise',
    ),
  )
})

test('checked-in problem data matches the lesson source', () => {
  const result = run('--check')
  assert.equal(result.status, 0, result.stderr || result.stdout)
})
