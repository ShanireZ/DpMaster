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

test('asset checker rejects legacy font formats: only woff2 is published', (t) => {
  for (const extension of ['woff', 'ttf', 'otf', 'eot']) {
    const root = fixture('font', 1024)
    t.after(() => rmSync(root, { recursive: true, force: true }))
    writeFileSync(join(root, 'assets', `KaTeX_Main-Regular.${extension}`), Buffer.alloc(16))

    const result = run(root)
    assert.notEqual(result.status, 0, extension)
    assert.match(result.stderr + result.stdout, /legacy font/i, extension)
  }

  const root = fixture('woff2', 1024)
  t.after(() => rmSync(root, { recursive: true, force: true }))
  writeFileSync(join(root, 'assets', 'KaTeX_Main-Regular.woff2'), Buffer.alloc(16))
  assert.equal(run(root).status, 0)
})

test('asset checker rejects an oversized file', (t) => {
  const root = fixture('oversized', 760001)
  t.after(() => rmSync(root, { recursive: true, force: true }))

  const result = run(root)
  assert.notEqual(result.status, 0)
  assert.match(result.stderr + result.stdout, /760,000|oversized/i)
})

