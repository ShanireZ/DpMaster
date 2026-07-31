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

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(path)
    return extname(entry.name) === '.md' ? [path] : []
  })
}

function assertLocalLinks(path, source) {
  for (const match of source.matchAll(/\[[^\]]*]\(([^)]+)\)/g)) {
    const target = match[1].trim().replace(/^<|>$/g, '').split('#')[0]
    if (!target || /^(?:https?:|mailto:)/.test(target)) continue
    const resolvedTarget = target.startsWith('/')
      ? join(docsDir, target.slice(1))
      : resolve(dirname(path), target)
    assert.ok(
      existsSync(resolvedTarget),
      `${relative(projectDir, path)} links to missing ${target}`,
    )
  }
}

test('the documentation bundle follows the current OKF v0.2 contract', () => {
  const index = readFileSync(join(docsDir, 'index.md'), 'utf8')
  assert.match(index, /^---\r?\nokf_version: "0\.2"\r?\n---/)
  assert.equal(existsSync(join(docsDir, 'log.md')), false)
  assert.equal(existsSync(join(docsDir, 'maintenance', 'staleness-register.md')), false)
  assert.equal(existsSync(join(docsDir, 'superpowers')), false)

  for (const path of markdownFiles(docsDir)) {
    const source = readFileSync(path, 'utf8')
    assertLocalLinks(path, source)
    if (path === join(docsDir, 'index.md')) continue
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    assert.ok(frontmatter, `${relative(projectDir, path)} has OKF frontmatter`)
    assert.match(frontmatter[1], /^type:\s*\S.+$/m)
    assert.match(frontmatter[1], /^status: (draft|stable|deprecated)$/m)
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
