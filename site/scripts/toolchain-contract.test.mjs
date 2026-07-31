import assert from 'node:assert/strict'
import {
  existsSync,
  readFileSync,
  readdirSync,
} from 'node:fs'
import { dirname, extname, join, relative } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const siteDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const projectDir = join(siteDir, '..')
const packageJson = JSON.parse(readFileSync(join(siteDir, 'package.json'), 'utf8'))

function textFiles(directory, extensions) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return textFiles(path, extensions)
    return extensions.has(extname(entry.name)) ? [path] : []
  })
}

test('the package root uses the pinned pnpm 11 and Node 24 contract', () => {
  assert.equal(packageJson.packageManager, 'pnpm@11.18.0')
  assert.equal(packageJson.devEngines.runtime.version, '24.18.1')
  assert.equal(packageJson.devEngines.packageManager.version, '11.18.0')
  assert.equal(readFileSync(join(siteDir, '.node-version'), 'utf8').trim(), '24.18.1')
  assert.equal(existsSync(join(siteDir, 'package-lock.json')), false)
  assert.equal(existsSync(join(siteDir, 'pnpm-lock.yaml')), true)

  const settings = readFileSync(join(siteDir, 'pnpm-workspace.yaml'), 'utf8')
  assert.match(settings, /^minimumReleaseAge: 1440$/m)
  assert.match(settings, /^minimumReleaseAgeStrict: true$/m)
  assert.match(settings, /^allowBuilds:$/m)
  assert.doesNotMatch(settings, /onlyBuiltDependencies/)
})

test('active source and maintained guidance contain no retired compatibility surface', () => {
  const sourceFiles = textFiles(
    join(siteDir, 'src'),
    new Set(['.css', '.js', '.mjs', '.ts', '.tsx']),
  )
  const maintainedFiles = [
    join(projectDir, 'AGENTS.md'),
    join(projectDir, 'README.md'),
    join(projectDir, 'deploy.md'),
    ...textFiles(join(projectDir, 'docs'), new Set(['.md'])),
    ...textFiles(join(projectDir, '.github'), new Set(['.yaml', '.yml'])),
  ]

  const offenders = []
  for (const path of [...sourceFiles, ...maintainedFiles]) {
    const source = readFileSync(path, 'utf8')
    if (
      /\b(?:npm run|npm ci|npx)\b/.test(source) ||
      /\b(?:kd__|fbug__|kd--editor)\b/.test(source) ||
      /\bmodule\.exports\b|\brequire\s*\(|\bnew Buffer\s*\(/.test(source)
    ) {
      offenders.push(relative(projectDir, path))
    }
  }
  assert.deepEqual(offenders, [])
})
