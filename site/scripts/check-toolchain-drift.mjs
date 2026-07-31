import { readFile } from 'node:fs/promises'

const packageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
)
const nodeVersion = (
  await readFile(new URL('../.node-version', import.meta.url), 'utf8')
).trim()
const githubToken = process.env.GITHUB_TOKEN
const maturityCutoff = Date.now() - 24 * 60 * 60 * 1000

const actions = [
  ['actions/checkout', 'v7'],
  ['actions/setup-node', 'v7'],
  ['pnpm/action-setup', 'v6'],
]

const packageEntries = [
  ...Object.entries(packageJson.dependencies ?? {}),
  ...Object.entries(packageJson.devDependencies ?? {}),
]
const edgeOneVersion = packageJson.scripts['deploy:eo'].match(
  /edgeone@(\d+\.\d+\.\d+)/,
)?.[1]

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
    .filter((version) => name !== '@types/node' || version.startsWith('24.'))
    .toSorted(compareVersions)
    .at(-1)
}

async function latestNode24() {
  const releases = await fetchJson('https://nodejs.org/dist/index.json')
  return releases
    .map((release) => release.version.replace(/^v/, ''))
    .filter((version) => version.startsWith('24.'))
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

async function record(label, current, getLatest) {
  try {
    const latest = await getLatest()
    checks.push({ label, current, latest, drifted: current !== latest })
  } catch (error) {
    failures.push({
      label,
      message: error instanceof Error ? error.message : String(error),
    })
  }
}

await Promise.all([
  record('Node.js 24 LTS', nodeVersion, latestNode24),
  record(
    'pnpm',
    packageJson.packageManager.replace(/^pnpm@/, ''),
    () => latestPackageVersion('pnpm'),
  ),
  record('EdgeOne CLI', edgeOneVersion, () => latestPackageVersion('edgeone')),
  ...packageEntries.map(([name, range]) =>
    record(name, numericVersion(range), () => latestPackageVersion(name)),
  ),
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
  console.log('当前声明版本均处于约定的最新稳定主线。')
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
      check.drifted ? '需升级' : '已对齐'
    } |`,
  )
}

if (drifted.length > 0 || failures.length > 0) {
  process.exitCode = 2
}
