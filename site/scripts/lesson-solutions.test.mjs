// Lesson solution guard (static parse, no React import needed).
//
// Every lesson that renders `<CodeBlock code={CODE_X} />` must also define a
// non-empty C++ `const CODE_X = `...`` in the same file. This catches the
// "题解被清空 / 引用了不存在的常量" regressions flagged in the staleness
// register without having to boot the whole SPA.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const contentDir = join(here, '..', 'src', 'content')

// Broad set of C/C++ tokens — accepts both full programs and the
// teaching snippets (e.g. the `for (int T = S; T; T = (T-1) & S)`
// subset idiom) that intentionally omit #include / int main.
const CPP_SIGNAL =
  /#include|int\s+main|std::|using\s+namespace|cout|cin|printf|scanf|for\s*\(int|vector\s*</

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (full.endsWith('.tsx')) out.push(full)
  }
  return out
}

const DECL = /const\s+(CODE_[A-Za-z0-9_]+)\s*=\s*`([\s\S]*?)`/g
const REF = /code=\{(CODE_[A-Za-z0-9_]+)\}/g

describe('lesson C++ solutions are present and non-empty', () => {
  const files = walk(contentDir)

  for (const file of files) {
    const src = readFileSync(file, 'utf8')
    const decls = new Map()
    for (const m of src.matchAll(DECL)) decls.set(m[1], m[2])
    const refs = [...src.matchAll(REF)].map((m) => m[1])

    // Only lessons that actually embed a solution matter here.
    if (refs.length === 0 && decls.size === 0) continue

    const rel = file.replace(contentDir, 'src/content')

    test(`${rel}: every CodeBlock reference resolves to a defined CODE_ constant`, () => {
      for (const name of refs) {
        assert.ok(decls.has(name), `引用了未定义的常量 ${name}（${rel}）`)
      }
    })

    test(`${rel}: every CODE_ constant is a non-empty C++ block`, () => {
      for (const [name, body] of decls) {
        assert.ok(body.trim().length > 0, `题解 ${name} 为空（${rel}）`)
        assert.ok(
          CPP_SIGNAL.test(body),
          `题解 ${name} 不像 C++（缺少 #include / int main / std:: 等标记，${
            rel
          }）`,
        )
      }
    })
  }
})
