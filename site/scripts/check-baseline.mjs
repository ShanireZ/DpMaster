import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import browserslist from 'browserslist'

import { VITE_BASELINE_TARGETS } from '../baseline-targets.ts'

const root = process.cwd()
const policy = JSON.parse(await readFile(resolve(root, 'baseline.config.json'), 'utf8'))
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))

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

assert.equal(policy.buildTarget.consumer, 'vite.config.ts build.target')
assert.deepEqual(VITE_BASELINE_TARGETS, policy.buildTarget.targets)
assert.ok(
  packageJson.browserslist.includes(policy.policyQuery),
  'package.json 未声明 Baseline Widely with downstream 能力审查查询',
)

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
