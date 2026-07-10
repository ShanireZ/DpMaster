import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import test from 'node:test'

const siteDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const projectDir = join(siteDir, '..')
const textExtensions = new Set(['.css', '.html', '.js', '.json', '.jsonc', '.md', '.mjs', '.ts', '.tsx', '.yaml', '.yml'])
const ignoredDirectories = new Set(['.git', 'dist', 'node_modules'])
const forbiddenNames = [
  new RegExp(['DP', '图谱'].join('\\s*'), 'iu'),
  new RegExp(['DP', 'ATLAS'].join('[ _-]*'), 'iu'),
]

function collectTextFiles(dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...collectTextFiles(join(dir, entry.name)))
      continue
    }
    if (entry.name === 'package-lock.json') continue
    if (textExtensions.has(extname(entry.name))) files.push(join(dir, entry.name))
  }
  return files
}

test('all product-facing text uses the DP大师 name', () => {
  const offenders = []
  for (const file of collectTextFiles(projectDir)) {
    const source = readFileSync(file, 'utf8')
    if (forbiddenNames.some((pattern) => pattern.test(source))) offenders.push(file.slice(projectDir.length + 1))
  }
  assert.deepEqual(offenders, [])
})

