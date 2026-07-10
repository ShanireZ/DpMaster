import assert from 'node:assert/strict'
import test from 'node:test'
import { verifyCases, vectors } from './lib/verify-algorithm.mjs'
import { solveZeroOneKnapsack } from '../src/algorithms/knapsack/index.ts'
import { recordZeroOneKnapsack } from '../src/algorithms/knapsack/internal.ts'
import { solveLis } from '../src/algorithms/lis/index.ts'
import { recordLis } from '../src/algorithms/lis/internal.ts'
import { solveStoneMerge } from '../src/algorithms/stone-merge/index.ts'
import { recordStoneMerge } from '../src/algorithms/stone-merge/internal.ts'
import { buildTree as buildRerootTree, bruteDistSum, rerootDistSum } from '../src/components/demos/reroot/rerootSolver.ts'
import { buildTree as buildRootedTree, solveIndepSet } from '../src/components/demos/treedp/treedpSolver.ts'

function bruteKnapsack(items, capacity) {
  let value = 0
  for (let mask = 0; mask < 1 << items.length; mask++) {
    let weight = 0
    let candidate = 0
    for (let i = 0; i < items.length; i++) {
      if ((mask & (1 << i)) === 0) continue
      weight += items[i].w
      candidate += items[i].v
    }
    if (weight <= capacity) value = Math.max(value, candidate)
  }
  return value
}

function bruteLis(values) {
  let length = 0
  for (let mask = 0; mask < 1 << values.length; mask++) {
    let previous = -Infinity
    let candidate = 0
    let valid = true
    for (let i = 0; i < values.length; i++) {
      if ((mask & (1 << i)) === 0) continue
      if (values[i] <= previous) {
        valid = false
        break
      }
      previous = values[i]
      candidate++
    }
    if (valid) length = Math.max(length, candidate)
  }
  return length
}

function bruteStone(values, objective) {
  const prefix = [0]
  for (const value of values) prefix.push(prefix[prefix.length - 1] + value)
  const memo = new Map()
  const visit = (left, right) => {
    if (left === right) return 0
    const key = `${left},${right}`
    if (memo.has(key)) return memo.get(key)
    let best = objective === 'min' ? Infinity : -Infinity
    for (let split = left; split < right; split++) {
      const candidate = visit(left, split) + visit(split + 1, right)
      best = objective === 'min' ? Math.min(best, candidate) : Math.max(best, candidate)
    }
    const answer = best + prefix[right + 1] - prefix[left]
    memo.set(key, answer)
    return answer
  }
  return values.length < 2 ? 0 : visit(0, values.length - 1)
}

test('01 knapsack result matches exhaustive subsets and returns a legal witness', () => {
  const itemKinds = [
    { w: 1, v: 1 },
    { w: 1, v: 3 },
    { w: 2, v: 2 },
    { w: 2, v: 5 },
    { w: 3, v: 4 },
  ]
  const cases = []
  for (const indices of vectors([0, 1, 2, 3, 4], 4)) {
    const items = indices.map((index) => itemKinds[index])
    for (let capacity = 0; capacity <= 7; capacity++) cases.push({ items, capacity })
  }

  verifyCases({
    name: 'zero-one-knapsack',
    cases,
    solve: ({ items, capacity }) => solveZeroOneKnapsack(items, capacity),
    oracle: ({ items, capacity }) => bruteKnapsack(items, capacity),
    equivalent: (actual, expected) => actual.value === expected,
    invariants: [
      (actual, { items, capacity }) => {
        assert.equal(Object.hasOwn(actual, 'frames'), false)
        assert.equal(actual.pick.length, items.length)
        const weight = items.reduce((sum, item, index) => sum + (actual.pick[index] ? item.w : 0), 0)
        const value = items.reduce((sum, item, index) => sum + (actual.pick[index] ? item.v : 0), 0)
        assert.ok(weight <= capacity)
        assert.equal(value, actual.value)
      },
    ],
  })
})

test('LIS result matches exhaustive subsequences and returns a legal witness', () => {
  verifyCases({
    name: 'lis',
    cases: vectors([-1, 0, 1], 6),
    solve: (values) => solveLis(values),
    oracle: bruteLis,
    equivalent: (actual, expected) => actual.length === expected,
    invariants: [
      (actual, values) => {
        assert.equal(Object.hasOwn(actual, 'frames'), false)
        assert.equal(actual.pick.length, values.length)
        const picked = values.filter((_, index) => actual.pick[index])
        assert.equal(picked.length, actual.length)
        for (let i = 1; i < picked.length; i++) assert.ok(picked[i - 1] < picked[i])
      },
    ],
  })
})

test('stone merge min and max results match recursive interval enumeration', () => {
  const arrays = [...vectors([1, 2, 3], 6, false)]
  for (const objective of ['min', 'max']) {
    verifyCases({
      name: `stone-merge-${objective}`,
      cases: arrays,
      solve: (values) => solveStoneMerge(values, objective),
      oracle: (values) => bruteStone(values, objective),
      equivalent: (actual, expected) => actual.cost === expected,
      invariants: [
        (actual) => {
          assert.equal(Object.hasOwn(actual, 'frames'), false)
          assert.equal(Object.hasOwn(actual, 'caption'), false)
        },
      ],
    })
  }
})

test('recorded teaching runs share the exact result Implementation', () => {
  const knapsackInput = [[{ w: 2, v: 3 }, { w: 3, v: 4 }, { w: 4, v: 5 }], 8]
  assert.deepEqual(recordZeroOneKnapsack(...knapsackInput).result, solveZeroOneKnapsack(...knapsackInput))
  assert.deepEqual(recordLis([3, 1, 2, 5, 4]).result, solveLis([3, 1, 2, 5, 4]))
  assert.deepEqual(recordStoneMerge([7, 6, 5, 4], 'min').result, solveStoneMerge([7, 6, 5, 4], 'min'))
})

test('reroot distance sums match the existing quadratic oracle', () => {
  const cases = []
  for (let n = 1; n <= 8; n++) {
    for (let variant = 0; variant < 12; variant++) {
      const edges = []
      for (let node = 1; node < n; node++) edges.push({ u: node, v: (node * 7 + variant) % node })
      cases.push(buildRerootTree(n, edges))
    }
  }
  verifyCases({
    name: 'reroot-distance-sum',
    cases,
    solve: (tree) => rerootDistSum(tree).dist,
    oracle: (tree) => bruteDistSum(tree).dist,
  })
})

test('tree independent-set results match exhaustive node subsets', () => {
  const cases = []
  for (let n = 1; n <= 9; n++) {
    const parent = [-1]
    for (let node = 1; node < n; node++) parent.push(Math.floor((node - 1) / 2))
    for (let seed = 0; seed < 8; seed++) {
      const weight = Array.from({ length: n }, (_, index) => 1 + ((index * 5 + seed * 3) % 9))
      cases.push({ parent, weight })
    }
  }
  verifyCases({
    name: 'tree-independent-set',
    cases,
    solve: ({ parent, weight }) => solveIndepSet(buildRootedTree(parent, weight)).ans,
    oracle: ({ parent, weight }) => {
      let best = 0
      for (let mask = 0; mask < 1 << parent.length; mask++) {
        let valid = true
        let value = 0
        for (let node = 0; node < parent.length; node++) {
          if ((mask & (1 << node)) === 0) continue
          if (parent[node] >= 0 && (mask & (1 << parent[node])) !== 0) {
            valid = false
            break
          }
          value += weight[node]
        }
        if (valid) best = Math.max(best, value)
      }
      return best
    },
  })
})

