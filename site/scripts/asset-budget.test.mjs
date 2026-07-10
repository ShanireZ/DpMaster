import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const scriptsDir = dirname(fileURLToPath(import.meta.url))
const checker = join(scriptsDir, 'check-assets.mjs')

function fixture(name, bytes) {
  const root = mkdtempSync(join(tmpdir(), `dp-master-${name}-`))
  const assets = join(root, 'assets')
  mkdirSync(assets)
  writeFileSync(join(assets, `${name}.js`), Buffer.alloc(bytes))
  return root
}

function run(root) {
  return spawnSync(process.execPath, [checker, root], {
    encoding: 'utf8',
  })
}

test('asset checker accepts output within every budget', (t) => {
  const root = fixture('small', 1024)
  t.after(() => rmSync(root, { recursive: true, force: true }))

  const result = run(root)
  assert.equal(result.status, 0, result.stderr || result.stdout)
})

test('asset checker rejects an oversized file', (t) => {
  const root = fixture('oversized', 760001)
  t.after(() => rmSync(root, { recursive: true, force: true }))

  const result = run(root)
  assert.notEqual(result.status, 0)
  assert.match(result.stderr + result.stdout, /760,000|oversized/i)
})

