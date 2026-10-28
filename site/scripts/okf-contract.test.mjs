import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, extname, join, relative, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const siteDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const projectDir = join(siteDir, '..')
const docsDir = join(projectDir, 'docs')

// These exact ignored files are local workspace-copy inputs, checked by the
// unchanged baseline-copy gate. They are not part of the published OKF bundle.
const LOCAL_WORKSPACE_INPUTS = ['web-baseline.md', 'web-contracts.md']
const NOT_IN_NAVIGATION = ['concepts/README.template.md']

function markdownFiles(directory, bundleRoot = directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(path, bundleRoot)
    const rel = relative(bundleRoot, path).split('\\').join('/')
    return extname(entry.name) === '.md' && !LOCAL_WORKSPACE_INPUTS.includes(rel) ? [path] : []
  })
}

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
    assert.ok(
      !LOCAL_WORKSPACE_INPUTS.some((rel) => link.resolved === join(docsDir, rel)),
      `${relative(projectDir, path)} links to unpublished workspace input ${link.raw}`,
    )
  }
}

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

test('the documentation bundle follows the current OKF v0.2 contract', () => {
  const index = readFileSync(join(docsDir, 'index.md'), 'utf8')
  assert.match(index, /^---\r?\nokf_version: "0\.2"\r?\n---/)
  assert.equal(existsSync(join(docsDir, 'log.md')), false)
  assert.equal(existsSync(join(docsDir, 'maintenance', 'staleness-register.md')), false)
  assert.equal(existsSync(join(docsDir, 'superpowers')), false)

  const files = markdownFiles(docsDir)
  const relative_ = (path) => relative(docsDir, path).split('\\').join('/')
  assert.ok(files.some((path) => relative_(path).includes('/')), 'recursive scan reached no subdirectory')

  const reachable = reachableFromIndex(files)
  const orphans = files
    .map(relative_)
    .filter((rel) => rel !== 'index.md')
    .filter((rel) => !NOT_IN_NAVIGATION.includes(rel))
    .filter((rel) => !reachable.has(join(docsDir, ...rel.split('/'))))
  assert.deepEqual(orphans, [], `unreachable from index.md: ${orphans.join(', ')}`)

  for (const path of files) {
    const rel = relative_(path)
    const source = readFileSync(path, 'utf8')
    assertLocalLinks(path, source)
    if (rel === 'index.md' || rel.endsWith('/index.md')) continue
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    assert.ok(frontmatter, `${relative(projectDir, path)} has OKF frontmatter`)
    assert.match(frontmatter[1], /^type:\s*\S.+$/m)
    assert.match(frontmatter[1], /^status: (draft|stable|deprecated)$/m)
    assert.match(frontmatter[1], /^generated: \{ by: [^,]+, at: \d{4}-\d{2}-\d{2}T[^}]+ \}$/m)
    assert.doesNotMatch(frontmatter[1], /^(timestamp|source_paths):/m)
    if (/^sources:/m.test(frontmatter[1])) assert.match(frontmatter[1], /^  - resource: \S+/m)
  }
})

test('local inputs are explicitly ignored and navigation exemptions exist', () => {
  const trackedInputs = execFileSync('git', ['ls-files', '--', ...LOCAL_WORKSPACE_INPUTS.map((rel) => 'docs/' + rel)], { cwd: projectDir, encoding: 'utf8' })
  assert.equal(trackedInputs.trim(), '', 'workspace inputs must stay outside the published index')
  const ignore = readFileSync(join(projectDir, '.gitignore'), 'utf8').split(/\r?\n/)
  for (const rel of LOCAL_WORKSPACE_INPUTS) {
    assert.ok(ignore.includes(`/docs/${rel}`), `${rel} must remain unpublished`)
  }
  const files = markdownFiles(docsDir).map((path) => relative(docsDir, path).split('\\').join('/'))
  for (const rel of NOT_IN_NAVIGATION) assert.ok(files.includes(rel), `${rel} is gone — remove its exemption`)
})

test('workspace exclusions apply only to the two exact root paths', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'dpmaster-docs-scope-'))
  try {
    mkdirSync(join(fixture, 'nested'))
    for (const rel of ['index.md', ...LOCAL_WORKSPACE_INPUTS, 'nested/web-baseline.md', 'nested/orphan.md']) {
      writeFileSync(join(fixture, rel), '# Fixture\n')
    }
    assert.deepEqual(
      markdownFiles(fixture).map((path) => relative(fixture, path).split('\\').join('/')).sort(),
      ['index.md', 'nested/orphan.md', 'nested/web-baseline.md'],
    )
    for (const rel of LOCAL_WORKSPACE_INPUTS) rmSync(join(fixture, rel))
    assert.deepEqual(
      markdownFiles(fixture).map((path) => relative(fixture, path).split('\\').join('/')).sort(),
      ['index.md', 'nested/orphan.md', 'nested/web-baseline.md'],
      'a standalone checkout must not require local workspace copies',
    )
    assert.throws(
      () => assertLocalLinks(join(docsDir, 'index.md'), '[Hidden input](web-baseline.md)'),
      /unpublished workspace input|missing/,
    )
    assert.throws(
      () => assertLocalLinks(join(docsDir, 'index.md'), '[Outside](../../AGENTS.md)'),
      /outside the repository/,
    )
    assert.throws(
      () => assertLocalLinks(join(docsDir, 'index.md'), '[Missing](missing-public-document.md)'),
      /missing/,
    )
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})
