import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

const ROOT = resolve(import.meta.dirname, '..')
const CHECKER = join(ROOT, 'scripts/check-baseline.mjs')

test('the approved Firefox minimum passes the actual complete Baseline guard', () => {
  const result = spawnSync(process.execPath, [CHECKER], {
    cwd: ROOT, encoding: 'utf8', timeout: 20_000,
  })
  assert.equal(result.error, undefined)
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Baseline 守卫通过/u)
})

test('the actual guard still rejects a stale Firefox minimum of 124', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'dpmaster-baseline-review-'))
  try {
    const original = readFileSync(join(ROOT, 'baseline.config.json'), 'utf8')
    const stale = original.replace(/"firefox":\s*\d+/u, '"firefox": 124')
    assert.notEqual(stale, original)
    const policy = JSON.parse(original)
    writeFileSync(join(fixture, 'baseline.config.json'), stale)
    copyFileSync(join(ROOT, 'package.json'), join(fixture, 'package.json'))
    mkdirSync(join(fixture, 'node_modules'))
    // The isolated config preserves the approved target list without loading unrelated plugins.
    writeFileSync(join(fixture, 'vite.config.ts'), `export default ${JSON.stringify({ build: { target: policy.buildTarget.targets } })}\n`)
    const result = spawnSync(process.execPath, [CHECKER], {
      cwd: fixture, encoding: 'utf8', timeout: 20_000,
    })
    assert.equal(result.error, undefined)
    assert.equal(result.status, 1)
    assert.match(result.stderr, /firefox 的最低版本从批准的 124 前移到 \d+，必须人工复核/u)
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})
