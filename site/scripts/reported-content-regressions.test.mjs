import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const scriptsDir = dirname(fileURLToPath(import.meta.url))
const contentDir = join(scriptsDir, '..', 'src', 'content', 'a')

test('P1616 reference solution covers the full time range with 64-bit values', () => {
  const source = readFileSync(join(contentDir, 'KnapsackComplete.tsx'), 'utf8')

  assert.match(source, /long long f\[10000005\];/)
  assert.match(source, /1\s*<=\s*T\s*<=\s*10\^7/)
})

test('multiple knapsack includes a worked monotonic-queue example and solution', () => {
  const source = readFileSync(join(contentDir, 'KnapsackMultiple.tsx'), 'utf8')

  assert.match(source, /const CODE_MULTIPLE_MONOQUEUE = `/)
  assert.match(source, /跟着算一遍：按余数链维护滑动窗口/)
  assert.match(source, /code=\{CODE_MULTIPLE_MONOQUEUE\}/)
  assert.match(source, /g\[r\+xw\]-xv/)
})

test('P2347 reference solution prints the required Total prefix', () => {
  const source = readFileSync(join(contentDir, 'KnapsackMultiple.tsx'), 'utf8')

  assert.match(source, /cout\s*<<\s*"Total="\s*<<\s*cnt\s*<<\s*endl;/)
})
