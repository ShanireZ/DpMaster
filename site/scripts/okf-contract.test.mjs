import assert from 'node:assert/strict'
import {
  existsSync,
  readFileSync,
  readdirSync,
} from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const siteDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const projectDir = join(siteDir, '..')
const docsDir = join(projectDir, 'docs')

/**
 * ★★★ 2026-08-21：这道门补上了它一直缺的那条判据 —— **可达性**。
 *
 * 它此前的作用域是全的（`markdownFiles` 递归），frontmatter 与断链也都在查，
 * 但它**从来没问过「这份文档从 index.md 走得到吗」**。于是 owner 08-21 推的
 * `docs/agents/` 六份进了 bundle、通过了 frontmatter 检查，却从入口一份都到不了。
 *
 * ★ 对照：betai 与贝塔通那道同族的门是反过来坏的 —— 判据在，作用域漏了子目录。
 * 一个作用域全判据缺，一个判据在作用域缺，**同一个漂移有两种漏法**。
 */

/**
 * ★★ 只要求通用 OKF 字段、不要求本仓 `generated` 溯源的目录。
 *
 * `agents/` 是 workspace 级的共享 agent 约定包，同一批文件**逐字节**铺在 betai、
 * 贝塔通、成均、枢衡、问天录与本仓（sha256 相同）。给它补本仓特有的 `generated:`
 * 与 `sources: - resource:` 写法，等于让本仓的副本从此和上游分叉，下次同步必冲突。
 * ⇒ 它们仍须有 `type` 与 `status`，也仍须**可达**，只是不受本仓溯源格式约束。
 *
 * ★★★ 豁免名单底下有断言守着（目录真的在、且 index 真的声明了它的定位）——
 * **把「跳过」写成「断言它缺席」**，否则名单腐烂了没有任何声音。
 */
const SHARED_UPSTREAM_DIRS = ['agents']

/**
 * ★★ 有意不进导航的文件：模板不是知识，列进 index 只会让目录多一条没人读的项。
 * 同样配一条断言守着 —— 文件哪天没了，这条豁免必须跟着响。
 */
const NOT_IN_NAVIGATION = ['concepts/README.template.md']

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(path)
    return extname(entry.name) === '.md' ? [path] : []
  })
}

/** 一份文档里指向本地 Markdown 的链接，按它自己所在目录解析，返回绝对路径。 */
function localMarkdownLinks(path, source) {
  const targets = []
  for (const match of source.matchAll(/\[[^\]]*]\(([^)]+)\)/g)) {
    const target = match[1].trim().replace(/^<|>$/g, '').split('#')[0]
    if (!target || /^(?:https?:|mailto:)/.test(target)) continue
    targets.push({
      raw: target,
      resolved: target.startsWith('/')
        ? join(docsDir, target.slice(1))
        : resolve(dirname(path), target),
    })
  }
  return targets
}

function assertLocalLinks(path, source) {
  for (const link of localMarkdownLinks(path, source)) {
    assert.ok(
      existsSync(link.resolved),
      `${relative(projectDir, path)} links to missing ${link.raw}`,
    )
  }
}

/** 从 index.md 出发的传递闭包 —— 「在 bundle 里」不够，要**走得到**。 */
function reachableFromIndex(files) {
  const known = new Set(files)
  const entry = join(docsDir, 'index.md')
  const seen = new Set([entry])
  const queue = [entry]
  while (queue.length > 0) {
    const current = queue.shift()
    for (const link of localMarkdownLinks(current, readFileSync(current, 'utf8'))) {
      if (!known.has(link.resolved) || seen.has(link.resolved)) continue
      seen.add(link.resolved)
      queue.push(link.resolved)
    }
  }
  return seen
}

function inDir(rel, dir) {
  return rel.startsWith(`${dir}/`)
}

test('the documentation bundle follows the current OKF v0.2 contract', () => {
  const index = readFileSync(join(docsDir, 'index.md'), 'utf8')
  assert.match(index, /^---\r?\nokf_version: "0\.2"\r?\n---/)
  assert.equal(existsSync(join(docsDir, 'log.md')), false)
  assert.equal(existsSync(join(docsDir, 'maintenance', 'staleness-register.md')), false)
  assert.equal(existsSync(join(docsDir, 'superpowers')), false)

  const files = markdownFiles(docsDir)
  const relative_ = (path) => relative(docsDir, path).split('\\').join('/')

  // ★ 扫描没瞎：递归确实进了子目录。退化回「只有顶层」时，下面的可达性会变成空断言。
  assert.ok(
    files.some((path) => relative_(path).includes('/')),
    'recursive scan reached no subdirectory',
  )

  const reachable = reachableFromIndex(files)
  const orphans = files
    .map(relative_)
    .filter((rel) => rel !== 'index.md')
    .filter((rel) => !NOT_IN_NAVIGATION.includes(rel))
    .filter((rel) => !reachable.has(join(docsDir, ...rel.split('/'))))
  assert.deepEqual(
    orphans,
    [],
    `unreachable from index.md (an agent reading the entry point never sees these): ${orphans.join(', ')}`,
  )

  for (const path of files) {
    const rel = relative_(path)
    const source = readFileSync(path, 'utf8')
    assertLocalLinks(path, source)
    // OKF 保留文件名按 **basename** 判定：子目录的 index.md 也是目录入口，同样不是概念文档。
    // ★ 原来这里只跳过根 index.md，于是 agents/index.md 被当成概念文档要求 frontmatter。
    if (rel === 'index.md' || rel.endsWith('/index.md')) continue
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    assert.ok(frontmatter, `${relative(projectDir, path)} has OKF frontmatter`)
    assert.match(frontmatter[1], /^type:\s*\S.+$/m)
    assert.match(frontmatter[1], /^status: (draft|stable|deprecated)$/m)
    if (SHARED_UPSTREAM_DIRS.some((dir) => inDir(rel, dir))) continue
    assert.match(
      frontmatter[1],
      /^generated: \{ by: [^,]+, at: \d{4}-\d{2}-\d{2}T[^}]+ \}$/m,
    )
    assert.doesNotMatch(frontmatter[1], /^(timestamp|source_paths):/m)
    if (/^sources:/m.test(frontmatter[1])) {
      assert.match(frontmatter[1], /^  - resource: \S+/m)
    }
  }
})

test('the exemptions above still describe something that exists', () => {
  const files = markdownFiles(docsDir).map((path) =>
    relative(docsDir, path).split('\\').join('/'),
  )
  const index = readFileSync(join(docsDir, 'index.md'), 'utf8')

  for (const dir of SHARED_UPSTREAM_DIRS) {
    assert.ok(
      files.some((rel) => inDir(rel, dir)),
      `exempt directory ${dir}/ is empty or gone — drop the exemption`,
    )
    assert.ok(
      index.includes(`\`${dir}/\``),
      `index.md no longer explains what ${dir}/ is`,
    )
  }

  for (const rel of NOT_IN_NAVIGATION) {
    assert.ok(
      files.includes(rel),
      `${rel} is gone — drop it from NOT_IN_NAVIGATION`,
    )
  }
})
