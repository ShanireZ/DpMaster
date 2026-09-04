import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import test from 'node:test'

/**
 * oxlint 走查到的每一个文件，都必须落在本仓某一个 TypeScript Program 里。
 *
 * type-aware lint 遇到程序外文件时可能整趟静默放弃，表现仍是零诊断和成功退出。
 * 因此本门直接锁住静默失效的前提，而不是把「lint 退出 0」误当作充分证据。
 *
 * 根 tsconfig 是 solution 配置；子项目的 files 必须相对各自配置目录解析。
 * 新增走查文件时，应把它纳入环境匹配的子项目，而不是加入 oxlint 忽略清单。
 */

const ROOT = resolve(import.meta.dirname, '..')

function runEntry(entry, args) {
  const output = execFileSync(process.execPath, [resolve(ROOT, entry), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  assert.notEqual(output.length, 0, `${entry} 没有输出`)
  return output
}

function parseShowConfig(project) {
  return JSON.parse(runEntry('node_modules/typescript/bin/tsc', ['--showConfig', '-p', project]))
}

function referencedProjects() {
  const rootConfig = parseShowConfig('tsconfig.json')
  assert.equal(typeof rootConfig, 'object', '根 tsconfig 的 --showConfig 输出不是对象')
  assert.notEqual(rootConfig, null, '根 tsconfig 的 --showConfig 输出是 null')
  assert.ok(Array.isArray(rootConfig.references), '根 tsconfig 的 references 不是数组')

  return rootConfig.references.map((reference) => {
    assert.equal(typeof reference, 'object', '根 tsconfig 有非对象 reference')
    assert.notEqual(reference, null, '根 tsconfig 有 null reference')
    assert.equal(typeof reference.path, 'string', '根 tsconfig 有无 path 的 reference')
    return reference.path
  })
}

function walkedFiles() {
  return runEntry('node_modules/oxlint/bin/oxlint', ['--debug=files'])
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((file) => resolve(ROOT, file))
}

function filesOf(project) {
  const config = parseShowConfig(project)
  assert.equal(typeof config, 'object', `${project} 的 --showConfig 输出不是对象`)
  assert.notEqual(config, null, `${project} 的 --showConfig 输出是 null`)
  assert.ok(Array.isArray(config.files), `${project} 的 files 不是数组`)

  const base = dirname(resolve(ROOT, project))
  return config.files.map((file) => {
    assert.equal(typeof file, 'string', `${project} 的 files 里有非字符串项`)
    return resolve(base, file)
  })
}

test('lint 的 type-aware 覆盖面包含全部 oxlint 走查文件', (context) => {
  const projects = referencedProjects()
  const missingProjects = projects.filter((project) => !existsSync(resolve(ROOT, project)))
  assert.deepEqual(missingProjects, [], '根 tsconfig 引用了不存在的子项目')

  const walked = walkedFiles()
  const program = new Set(projects.flatMap((project) => filesOf(project)))
  assert.ok(walked.length > 100, `oxlint 走查清单异常偏小：${walked.length}`)
  assert.ok(program.size > 100, `TypeScript Program 并集异常偏小：${program.size}`)

  const outside = walked.filter((file) => !program.has(file))
  context.diagnostic(`walked=${walked.length}, program=${program.size}, outside=${outside.length}`)
  assert.deepEqual(
    outside.map((file) => file.replaceAll('\\', '/')),
    [],
    '这些 oxlint 走查文件不属于任何 TypeScript Program',
  )
})
