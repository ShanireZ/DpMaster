// DP correctness fixtures anchored to representative lessons.
//
// The 39 solver entry points already have oracle tests, but those prove the
// *algorithm* is right in isolation. These cases tie a lesson's "跟着算一遍"
// example to the solver so a lesson that documents "f[5] = 7" can never
// silently drift from what the taught algorithm actually computes.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { solveZeroOneKnapsack } from '../src/algorithms/knapsack/index.ts'
import { solveLis } from '../src/algorithms/lis/index.ts'
import { solveLcs } from '../src/algorithms/lcs/index.ts'

describe('lesson-anchored DP results', () => {
  test('a/Knapsack01 — 01 背包最大值与选取 (采药式样例)', () => {
    // 容量 5，物品 (w,v) = (2,3)(3,4)(4,5) → 选前两件 = 价值 7
    const result = solveZeroOneKnapsack(
      [
        { w: 2, v: 3 },
        { w: 3, v: 4 },
        { w: 4, v: 5 },
      ],
      5,
    )
    assert.equal(result.value, 7)
    assert.deepEqual(result.pick, [true, true, false])
  })

  test('b/LIS — 最长上升子序列长度', () => {
    // [10,9,2,5,3,7,101,18] → 长度 4（如 2,3,7,101）
    const result = solveLis([10, 9, 2, 5, 3, 7, 101, 18])
    assert.equal(result.length, 4)
  })

  test('b/LCS — 最长公共子序列', () => {
    // "ABCDGH" ∩ "AEDFHR" = "ADH" → 长度 3
    const result = solveLcs('ABCDGH', 'AEDFHR')
    assert.equal(result.length, 3)
    assert.equal(result.subsequence, 'ADH')
  })
})
