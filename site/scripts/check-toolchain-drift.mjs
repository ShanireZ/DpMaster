import { readFile } from 'node:fs/promises'

const packageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
)
const nodeVersion = (
  await readFile(new URL('../.node-version', import.meta.url), 'utf8')
).trim()
const deployDoc = await readFile(
  new URL('../../deploy.md', import.meta.url),
  'utf8',
)
const githubToken = process.env.GITHUB_TOKEN
const maturityCutoff = Date.now() - 24 * 60 * 60 * 1000

const actions = [
  ['actions/checkout', 'v7'],
  ['actions/setup-node', 'v7'],
  ['pnpm/action-setup', 'v6'],
]

// Shiki 4.4.3 把按需 C++ grammar chunk 從約 733 KB 推到 869 KB，突破已驗證的
// 單檔案與總資源預算。保留這個可見、可巡檢的固定點，直到上游體積回落或拆包方案通過門禁。
//
// TypeScript 7.1.0-beta 是 owner 於 2026-10-29 批准的**精確預發佈固定**，隨工作區整體升到
// TypeScript 7.1 beta；預發佈的 caret 範圍會解析到 nightly dev 版本，所以必須寫精確版本。
// 7.1.0 穩定版發佈後複核並回到穩定 caret 範圍。固定點按 package.json 的**原始範圍字串**比對，
// 改成 `^7.1.0-beta` 或別的版本都會被判為待升級。
const approvedPackagePins = {
  shiki: { version: '4.3.1', reason: '资源预算批准固定 4.3.1' },
  typescript: {
    version: '7.1.0-beta',
    reason: 'owner 2026-10-29 批准固定预发布 7.1.0-beta；7.1.0 稳定版发布后复核',
  },
}

const packageEntries = [
  ...Object.entries(packageJson.dependencies ?? {}),
  ...Object.entries(packageJson.devDependencies ?? {}),
]
// wrangler 由發佈機全域安裝，基線宣告在 deploy.md 的「全域 CLI 基線」表格。
const globalCliBaselines = Object.fromEntries(
  [...deployDoc.matchAll(/^\| (wrangler) \| (\d+\.\d+\.\d+) \|$/gm)].map(
    (match) => [match[1], match[2]],
  ),
)

function numericVersion(value) {
  return value.match(/\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/)?.[0]
}

function compareVersions(left, right) {
  const normalize = (value) =>
    value
      .split(/[.-]/)
      .slice(0, 3)
      .map((part) => Number.parseInt(part, 10))
  const a = normalize(left)
  const b = normalize(right)
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index]
  }
  return 0
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'dpmaster-toolchain-drift-check',
      ...headers,
    },
  })
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`)
  }
  return response.json()
}

async function latestPackageVersion(name) {
  const metadata = await fetchJson(
    `https://registry.npmjs.org/${encodeURIComponent(name)}`,
  )
  return Object.keys(metadata.versions)
    .filter((version) => !version.includes('-'))
    .filter(
      (version) =>
        Date.parse(metadata.time?.[version] ?? 0) <= maturityCutoff,
    )
    .filter(
      (version) =>
        name !== '@types/node' || version.startsWith(`${nodeMajor}.`),
    )
    .toSorted(compareVersions)
    .at(-1)
}

// 跟隨 `.node-version` 宣告的**那條大版本線**取最新補丁，而不是把某個大版本寫死 ——
// 寫死的話每次抬大版本都要記得回來改這裡，而漏改的表現是「巡檢一直報已對齊」，
// 一道永遠紅不了的門。2026-08-15 從 24 抬到 26 時就是這麼發現的。
const nodeMajor = nodeVersion.split('.')[0]

async function latestNodeInLine() {
  const releases = await fetchJson('https://nodejs.org/dist/index.json')
  return releases
    .map((release) => release.version.replace(/^v/, ''))
    .filter((version) => version.startsWith(`${nodeMajor}.`))
    .toSorted(compareVersions)
    .at(-1)
}

async function latestActionMajor(repository) {
  const headers = githubToken
    ? { Authorization: `Bearer ${githubToken}` }
    : undefined
  const release = await fetchJson(
    `https://api.github.com/repos/${repository}/releases/latest`,
    headers,
  )
  return release.tag_name.match(/^v\d+/)?.[0] ?? release.tag_name
}

const checks = []
const failures = []

async function record(
  label,
  current,
  getLatest,
  isDrifted = (declared, latest) => declared !== latest,
  approval,
) {
  try {
    const latest = await getLatest()
    checks.push({
      label,
      current,
      latest,
      drifted: isDrifted(current, latest),
      approval,
    })
  } catch (error) {
    failures.push({
      label,
      message: error instanceof Error ? error.message : String(error),
    })
  }
}

await Promise.all([
  record(`Node.js ${nodeMajor}`, nodeVersion, latestNodeInLine),
  record(
    'pnpm',
    packageJson.packageManager.replace(/^pnpm@/, ''),
    () => latestPackageVersion('pnpm'),
    (current, latest) => compareVersions(current, latest) < 0,
  ),
  record('Wrangler CLI（全局）', globalCliBaselines.wrangler, () =>
    latestPackageVersion('wrangler'),
  ),
  ...packageEntries.map(([name, range]) => {
    const approvedPin = approvedPackagePins[name]
    return record(
      name,
      numericVersion(range),
      () => latestPackageVersion(name),
      approvedPin
        ? () => range !== approvedPin.version
        : (current, latest) => current !== latest,
      approvedPin?.reason,
    )
  }),
  ...actions.map(([repository, current]) =>
    record(`GitHub Action ${repository}`, current, () =>
      latestActionMajor(repository),
    ),
  ),
])

checks.sort((left, right) => left.label.localeCompare(right.label, 'en'))
const drifted = checks.filter((check) => check.drifted)

console.log('# DP大师工具链与依赖漂移报告')
console.log('')
console.log(`生成时间：${new Date().toISOString()}`)
console.log('')

if (drifted.length === 0 && failures.length === 0) {
  console.log('当前声明版本均处于约定的最新稳定主线或已批准固定点。')
} else {
  if (drifted.length > 0) {
    console.log('## 待升级')
    console.log('')
    console.log('| 项目 | 当前声明 | 最新稳定 |')
    console.log('|---|---:|---:|')
    for (const check of drifted) {
      console.log(`| ${check.label} | ${check.current} | ${check.latest} |`)
    }
    console.log('')
  }

  if (failures.length > 0) {
    console.log('## 巡检失败')
    console.log('')
    for (const failure of failures) {
      console.log(`- ${failure.label}: ${failure.message}`)
    }
    console.log('')
  }
}

console.log('## 当前基线')
console.log('')
console.log('| 项目 | 当前声明 | 最新稳定 | 状态 |')
console.log('|---|---:|---:|---|')
for (const check of checks) {
  console.log(
    `| ${check.label} | ${check.current} | ${check.latest} | ${
      check.drifted ? '需升级' : (check.approval ?? '已对齐')
    } |`,
  )
}

if (drifted.length > 0 || failures.length > 0) {
  process.exitCode = 2
}
