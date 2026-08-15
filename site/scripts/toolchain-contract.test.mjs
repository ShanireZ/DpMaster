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

// Node 版本在四个地方各写一遍：`.node-version`（CI 的 node-version-file 读它）、
// `pnpm-workspace.yaml` 的 nodeVersion（本地强制相等）、`package.json` 的
// devEngines.runtime.version，以及 engines.node 的下限。真正要守的不变式是
// **四处一致**，而不是某个字面量 —— 所以这里不再写死版本号：写死的话每次抬版本
// 都会红一次假警报，而真正危险的「只改了其中两处」反而可能蒙混过去。
// 2026-08-15 从 24.18.1 抬到 26.7.0 时，就是这条测试挡下了漏改。
test('the package root pins one Node version consistently across all four declarations', () => {
  const nodeVersion = readFileSync(join(siteDir, '.node-version'), 'utf8').trim()
  const settings = readFileSync(join(siteDir, 'pnpm-workspace.yaml'), 'utf8')

  assert.match(nodeVersion, /^\d+\.\d+\.\d+$/)
  assert.equal(packageJson.devEngines.runtime.name, 'node')
  assert.equal(packageJson.devEngines.runtime.version, nodeVersion)
  assert.match(settings, new RegExp(`^nodeVersion: ${nodeVersion}$`, 'm'))
  assert.equal(packageJson.engines.node, `>=${nodeVersion}`)
})

// 同 Node：pnpm 版本也在三处各写一遍（packageManager、devEngines.packageManager、
// engines.pnpm 的下限），要守的是**三处一致**而不是某个字面量。写死的话每次升级
// 都会红一次假警报，而真正危险的「只改了其中两处」反而可能溜过去。
test('the package root pins one pnpm version consistently', () => {
  const pnpmVersion = packageJson.packageManager.replace(/^pnpm@/, '')

  assert.match(pnpmVersion, /^\d+\.\d+\.\d+$/)
  assert.equal(packageJson.devEngines.packageManager.name, 'pnpm')
  assert.equal(packageJson.devEngines.packageManager.version, pnpmVersion)
  assert.equal(packageJson.engines.pnpm, `>=${pnpmVersion} <12`)
  assert.equal(existsSync(join(siteDir, 'package-lock.json')), false)
  assert.equal(existsSync(join(siteDir, 'pnpm-lock.yaml')), true)

  const settings = readFileSync(join(siteDir, 'pnpm-workspace.yaml'), 'utf8')
  assert.match(settings, /^minimumReleaseAge: 1440$/m)
  assert.match(settings, /^minimumReleaseAgeStrict: true$/m)
  assert.match(settings, /^allowBuilds:$/m)
  assert.doesNotMatch(settings, /onlyBuiltDependencies/)
})

test('CI fetches complete history for Git-derived route metadata', () => {
  const workflow = readFileSync(
    join(projectDir, '.github', 'workflows', 'ci.yml'),
    'utf8',
  )

  assert.match(
    workflow,
    /uses:\s*actions\/checkout@v7[\s\S]*?fetch-depth:\s*0/,
  )
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
