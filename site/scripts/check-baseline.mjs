import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'

import browserslist from 'browserslist'
import { loadConfigFromFile } from 'vite'

import { VITE_BASELINE_TARGETS } from '../baseline-targets.ts'

const root = process.cwd()
const policy = JSON.parse(await readFile(resolve(root, 'baseline.config.json'), 'utf8'))
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const require = createRequire(import.meta.url)

function packageJsonForModule(modulePath) {
  let directory = dirname(modulePath)
  while (true) {
    const candidate = resolve(directory, 'package.json')
    if (existsSync(candidate)) return candidate
    const parent = dirname(directory)
    if (parent === directory) throw new Error(`找不到 ${modulePath} 所属的 package.json`)
    directory = parent
  }
}

async function packageVersion(packageJsonPath) {
  return JSON.parse(await readFile(packageJsonPath, 'utf8')).version
}

function parseVersion(raw) {
  const value = Number(raw.split('-')[0])
  return Number.isFinite(value) ? value : null
}

function minimumsFor(query) {
  const minimums = new Map()

  for (const target of browserslist(query, { path: root, env: 'production' })) {
    const [browser, rawVersion = ''] = target.split(' ')
    const version = parseVersion(rawVersion)
    if (!browser || version === null) continue

    const current = minimums.get(browser)
    if (current === undefined || version < current) minimums.set(browser, version)
  }

  return minimums
}

function policyErrors(query) {
  const minimums = minimumsFor(query)
  const required = [
    ...policy.requiredBrowsers,
    ...(policy.downstream.enabled ? policy.downstream.requiredBrowsers : []),
  ]
  const errors = []

  for (const browser of required) {
    const actual = minimums.get(browser)
    if (actual === undefined) {
      errors.push(`缺少必需浏览器 ${browser}`)
      continue
    }

    const approved = policy.approvedMinimums[browser]
    if (approved === undefined) {
      errors.push(`没有记录 ${browser} 的批准最低版本`)
    } else if (actual > approved) {
      errors.push(`${browser} 的最低版本从批准的 ${approved} 前移到 ${actual}，必须人工复核`)
    }
  }

  return errors
}

assert.equal(policy.runtime, 'public-web')
assert.equal(policy.featureTarget, 'newly')
assert.equal(policy.buildTarget.strategy, 'explicit-browsers')
assert.equal(policy.buildTarget.consumer, 'vite.config.ts build.target')
assert.equal(policy.downstream.enabled, true)
assert.ok(policy.downstream.reason?.trim(), 'downstream 必须记录理由')
assert.ok(policy.criticalFallback?.trim(), 'criticalFallback 不得为空')
assert.ok(policy.verification?.length > 0, 'verification 不得为空')
assert.match(policy.snapshot.approvedAt, /^\d{4}-\d{2}-\d{2}$/u)
const approvedAt = Date.parse(`${policy.snapshot.approvedAt}T00:00:00Z`)
const normalizedApprovedAt = Number.isFinite(approvedAt)
  ? new Date(approvedAt).toISOString().slice(0, 10)
  : ''
const now = new Date()
const todayAt = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
assert.ok(
  Number.isFinite(approvedAt) &&
    normalizedApprovedAt === policy.snapshot.approvedAt &&
    approvedAt <= todayAt &&
    todayAt - approvedAt <= 92 * 24 * 60 * 60 * 1000,
  'Baseline 快照日期无效或已超过季度复核期',
)
assert.deepEqual(VITE_BASELINE_TARGETS, policy.buildTarget.targets)
assert.ok(
  packageJson.browserslist.includes(policy.policyQuery),
  'package.json 未声明 Baseline Widely with downstream 能力审查查询',
)

const loadedViteConfig = await loadConfigFromFile(
  { command: 'build', mode: 'production', isSsrBuild: false, isPreview: false },
  resolve(root, 'vite.config.ts'),
  root,
)
assert.ok(loadedViteConfig, 'Vite 未能加载 vite.config.ts')
assert.deepEqual(
  loadedViteConfig.config.build?.target,
  VITE_BASELINE_TARGETS,
  'Vite 实际 build.target 没有消费共享 Baseline 目标',
)

const browserslistPackage = require.resolve('browserslist/package.json')
const browserslistRequire = createRequire(browserslistPackage)
const actualSnapshot = {
  browserslist: await packageVersion(browserslistPackage),
  vite: await packageVersion(require.resolve('vite/package.json')),
  baselineBrowserMapping: await packageVersion(
    packageJsonForModule(browserslistRequire.resolve('baseline-browser-mapping')),
  ),
  caniuseLite: await packageVersion(
    packageJsonForModule(browserslistRequire.resolve('caniuse-lite')),
  ),
}
for (const key of ['browserslist', 'vite', 'baselineBrowserMapping', 'caniuseLite']) {
  assert.equal(
    actualSnapshot[key],
    policy.snapshot[key],
    `Baseline 数据快照 ${key} 发生变化，必须人工复核`,
  )
}

const productionErrors = policyErrors(policy.policyQuery)
assert.deepEqual(productionErrors, [], `Baseline 生产策略未通过：\n- ${productionErrors.join('\n- ')}`)

const negativeErrors = policyErrors(policy.negativeQuery)
for (const browser of ['firefox', 'safari']) {
  assert.ok(
    negativeErrors.some((error) => error.includes(`缺少必需浏览器 ${browser}`)),
    `反例 ${JSON.stringify(policy.negativeQuery)} 已不再缺少 ${browser}；必须重新审查 Newly 准入`,
  )
}

console.log(`Baseline 守卫通过：Vite 显式目标 ${VITE_BASELINE_TARGETS.join(', ')}`)
