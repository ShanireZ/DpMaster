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
 * ★★★ 2026-08-21：這道門補上了它一直缺的那條判據 —— **可達性**。
 *
 * 它此前的作用域是全的（`markdownFiles` 遞歸），frontmatter 與斷鏈也都在查，
 * 但它**從來沒問過「這份文件從 index.md 走得到嗎」**。於是 owner 08-21 推的
 * `docs/agents/` 六份進了 bundle、通過了 frontmatter 檢查，卻從入口一份都到不了。
 *
 * ★ 對照：betai 與貝塔通那道同族的門是反過來壞的 —— 判據在，作用域漏了子目錄。
 * 一個作用域全判據缺，一個判據在作用域缺，**同一個漂移有兩種漏法**。
 */

/**
 * ★★ 只要求通用 OKF 欄位、不要求本儲存庫 `generated` 溯源的目錄。
 *
 * `agents/` 與兩份頂層 Web 契約是 workspace 級共享文件，同一批檔案**逐位元組**鋪在
 * 多個專案。給它們補本儲存庫特有的 `generated:` 與 `sources: - resource:` 寫法，等於讓
 * 本儲存庫的副本從此和上游分叉，下次同步必衝突。
 * ⇒ 它們仍須有 `type` 與 `status`，也仍須**可達**，只是不受本儲存庫溯源格式約束。
 *
 * ★★★ 豁免名單底下有斷言守著（目錄真的在、且 index 真的宣告了它的定位）——
 * **把「跳過」寫成「斷言它缺席」**，否則名單腐爛了沒有任何聲音。
 */
const SHARED_UPSTREAM_DIRS = ['agents']
const SHARED_UPSTREAM_FILES = ['web-baseline.md', 'web-contracts.md']

/**
 * ★★ 有意不進導覽的檔案：範本不是知識，列進 index 只會讓目錄多一條沒人讀的項。
 * 同樣配一條斷言守著 —— 檔案哪天沒了，這條豁免必須跟著響。
 */
const NOT_IN_NAVIGATION = ['concepts/README.template.md']

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(path)
    return extname(entry.name) === '.md' ? [path] : []
  })
}

/** 一份文件裡指向本機 Markdown 的連結，按它自己所在目錄解析，回傳絕對路徑。 */
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
    const projectRelative = relative(projectDir, link.resolved).split('\\').join('/')
    assert.ok(
      projectRelative !== '..' && !projectRelative.startsWith('../'),
      `${relative(projectDir, path)} links outside the repository to ${link.raw}`,
    )
    assert.ok(
      existsSync(link.resolved),
      `${relative(projectDir, path)} links to missing ${link.raw}`,
    )
  }
}

/** 從 index.md 出發的傳遞閉包 —— 「在 bundle 裡」不夠，要**走得到**。 */
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

  // ★ 掃描沒瞎：遞歸確實進了子目錄。退化回「只有頂層」時，下面的可達性會變成空斷言。
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
    // OKF 保留檔案名按 **basename** 判定：子目錄的 index.md 也是目錄入口，同樣不是概念文件。
    // ★ 原來這裡只跳過根 index.md，於是 agents/index.md 被當成概念文件要求 frontmatter。
    if (rel === 'index.md' || rel.endsWith('/index.md')) continue
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    assert.ok(frontmatter, `${relative(projectDir, path)} has OKF frontmatter`)
    assert.match(frontmatter[1], /^type:\s*\S.+$/m)
    assert.match(frontmatter[1], /^status: (draft|stable|deprecated)$/m)
    if (
      SHARED_UPSTREAM_FILES.includes(rel) ||
      SHARED_UPSTREAM_DIRS.some((dir) => inDir(rel, dir))
    ) continue
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

  for (const rel of SHARED_UPSTREAM_FILES) {
    assert.ok(
      files.includes(rel),
      `exempt shared file ${rel} is gone — drop the exemption`,
    )
    assert.ok(
      index.includes(`](./${rel})`),
      `index.md no longer links to exempt shared file ${rel}`,
    )
  }

  for (const rel of NOT_IN_NAVIGATION) {
    assert.ok(
      files.includes(rel),
      `${rel} is gone — drop it from NOT_IN_NAVIGATION`,
    )
  }
})
