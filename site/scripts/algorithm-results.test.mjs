import assert from 'node:assert/strict'
import test from 'node:test'
import { verifyCases, vectors } from './lib/verify-algorithm.mjs'
import { solveZeroOneKnapsack } from '../src/algorithms/knapsack/index.ts'
import { recordZeroOneKnapsack } from '../src/algorithms/knapsack/internal.ts'
import { solveGroupKnapsack } from '../src/algorithms/knapsack-group/index.ts'
import { recordGroupKnapsack } from '../src/algorithms/knapsack-group/internal.ts'
import { solveMultipleKnapsack } from '../src/algorithms/knapsack-multiple/index.ts'
import { recordMultipleKnapsack } from '../src/algorithms/knapsack-multiple/internal.ts'
import { solveMixedKnapsack } from '../src/algorithms/knapsack-mixed/index.ts'
import { recordMixedKnapsack } from '../src/algorithms/knapsack-mixed/internal.ts'
import { solveCost2DKnapsack } from '../src/algorithms/knapsack-cost2d/index.ts'
import { recordCost2DKnapsack } from '../src/algorithms/knapsack-cost2d/internal.ts'
import { solveDependencyKnapsack } from '../src/algorithms/knapsack-dependency/index.ts'
import { recordDependencyKnapsack } from '../src/algorithms/knapsack-dependency/internal.ts'
import { solveCountKnapsack } from '../src/algorithms/knapsack-variant/index.ts'
import { recordCountKnapsack } from '../src/algorithms/knapsack-variant/internal.ts'
import { solveLis } from '../src/algorithms/lis/index.ts'
import { recordLis } from '../src/algorithms/lis/internal.ts'
import { solveStoneMerge } from '../src/algorithms/stone-merge/index.ts'
import { recordStoneMerge } from '../src/algorithms/stone-merge/internal.ts'
import { knapsack2D } from '../src/components/demos/knapsack/solvers.ts'
import { lisNaive } from '../src/components/demos/lis/lisSolver.ts'
import { stoneMerge } from '../src/components/demos/interval/stoneSolver.ts'
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

function bruteGroupKnapsack(groups, capacity) {
  const visit = (groupIndex, weight, value) => {
    if (groupIndex === groups.length) return value
    let best = visit(groupIndex + 1, weight, value)
    for (const item of groups[groupIndex]) {
      if (weight + item.w <= capacity) {
        best = Math.max(best, visit(groupIndex + 1, weight + item.w, value + item.v))
      }
    }
    return best
  }
  return visit(0, 0, 0)
}

function bruteMultipleKnapsack(items, capacity) {
  const visit = (itemIndex, weight, value) => {
    if (itemIndex === items.length) return value
    const item = items[itemIndex]
    let best = value
    for (let count = 0; count <= item.m && weight + count * item.w <= capacity; count++) {
      best = Math.max(best, visit(itemIndex + 1, weight + count * item.w, value + count * item.v))
    }
    return best
  }
  return visit(0, 0, 0)
}

function bruteMixedKnapsack(items, capacity) {
  const visit = (itemIndex, weight, value) => {
    if (itemIndex === items.length) return value
    const item = items[itemIndex]
    const limit = item.kind === '01'
      ? 1
      : item.kind === 'multiple'
        ? Math.max(1, item.m ?? 1)
        : Math.floor((capacity - weight) / item.w)
    let best = value
    for (let count = 0; count <= limit && weight + count * item.w <= capacity; count++) {
      best = Math.max(best, visit(itemIndex + 1, weight + count * item.w, value + count * item.v))
    }
    return best
  }
  return visit(0, 0, 0)
}

function bruteCost2DKnapsack(items, capacityA, capacityB, mode) {
  let best = 0
  for (let mask = 0; mask < 1 << items.length; mask++) {
    let costA = 0
    let costB = 0
    let value = 0
    for (let index = 0; index < items.length; index++) {
      if ((mask & (1 << index)) === 0) continue
      costA += items[index].a
      costB += items[index].b
      value += mode === 'count' ? 1 : items[index].v
    }
    if (costA <= capacityA && costB <= capacityB) best = Math.max(best, value)
  }
  return best
}

function bruteDependencyKnapsack(master, accessories, capacity) {
  let best = 0
  for (let mask = 0; mask < 1 << accessories.length; mask++) {
    let weight = master.w
    let value = master.v
    for (let index = 0; index < accessories.length; index++) {
      if ((mask & (1 << index)) === 0) continue
      weight += accessories[index].w
      value += accessories[index].v
    }
    if (weight <= capacity) best = Math.max(best, value)
  }
  return best
}

function bruteCountKnapsack(items, capacity) {
  const counts = Array(capacity + 1).fill(0)
  for (let mask = 0; mask < 1 << items.length; mask++) {
    let weight = 0
    for (let index = 0; index < items.length; index++) {
      if ((mask & (1 << index)) !== 0) weight += items[index].w
    }
    if (weight <= capacity) counts[weight]++
  }
  return counts
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

function assertTeachingModel(model) {
  assert.ok(model.frames.length > 0)
  for (let frameIndex = 0; frameIndex < model.frames.length; frameIndex++) {
    const frame = model.frames[frameIndex]
    assert.equal(frame.values.length, model.rows)
    for (const row of frame.values) assert.equal(row.length, model.cols)
    if (frameIndex > 0) {
      assert.notEqual(frame.values, model.frames[frameIndex - 1].values)
      for (let row = 0; row < model.rows; row++) {
        assert.notEqual(frame.values[row], model.frames[frameIndex - 1].values[row])
      }
    }
    for (const ref of [frame.active, ...(frame.arrows ?? []).flatMap((arrow) => [arrow.from, arrow.to])]) {
      if (ref == null) continue
      assert.ok(ref.r >= 0 && ref.r < model.rows)
      assert.ok(ref.c >= 0 && ref.c < model.cols)
    }
  }
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

test('group knapsack result matches exhaustive choices of at most one item per group', () => {
  const groupKinds = [
    [],
    [{ w: 1, v: 2 }, { w: 2, v: 3 }],
    [{ w: 1, v: 1 }, { w: 3, v: 6 }],
  ]
  const cases = []
  for (const groups of vectors(groupKinds, 3)) {
    for (let capacity = 0; capacity <= 6; capacity++) cases.push({ groups, capacity })
  }
  verifyCases({
    name: 'group-knapsack',
    cases,
    solve: ({ groups, capacity }) => solveGroupKnapsack(groups, capacity),
    oracle: ({ groups, capacity }) => bruteGroupKnapsack(groups, capacity),
    equivalent: (actual, expected) => actual.value === expected,
    invariants: [(actual) => assert.equal(Object.hasOwn(actual, 'frames'), false)],
  })
})

test('multiple knapsack result matches exhaustive bounded item counts', () => {
  const itemKinds = [
    { w: 1, v: 2, m: 1 },
    { w: 2, v: 3, m: 2 },
    { w: 3, v: 5, m: 3 },
  ]
  const cases = []
  for (const items of vectors(itemKinds, 3)) {
    for (let capacity = 0; capacity <= 7; capacity++) cases.push({ items, capacity })
  }
  verifyCases({
    name: 'multiple-knapsack',
    cases,
    solve: ({ items, capacity }) => solveMultipleKnapsack(items, capacity),
    oracle: ({ items, capacity }) => bruteMultipleKnapsack(items, capacity),
    equivalent: (actual, expected) => actual.value === expected,
    invariants: [(actual) => assert.equal(Object.hasOwn(actual, 'frames'), false)],
  })
})

test('mixed knapsack result matches exhaustive per-kind item counts', () => {
  const itemKinds = [
    { kind: '01', w: 1, v: 2 },
    { kind: 'complete', w: 2, v: 3 },
    { kind: 'multiple', w: 3, v: 5, m: 2 },
  ]
  const cases = []
  for (const items of vectors(itemKinds, 3)) {
    for (let capacity = 0; capacity <= 7; capacity++) cases.push({ items, capacity })
  }
  verifyCases({
    name: 'mixed-knapsack',
    cases,
    solve: ({ items, capacity }) => solveMixedKnapsack(items, capacity),
    oracle: ({ items, capacity }) => bruteMixedKnapsack(items, capacity),
    equivalent: (actual, expected) => actual.value === expected,
    invariants: [(actual) => assert.equal(Object.hasOwn(actual, 'frames'), false)],
  })
})

test('two-cost knapsack result matches exhaustive subsets in value and count modes', () => {
  const itemKinds = [
    { a: 1, b: 2, v: 2 },
    { a: 2, b: 1, v: 4 },
    { a: 2, b: 2, v: 3 },
  ]
  const cases = []
  for (const items of vectors(itemKinds, 3)) {
    for (let capacityA = 0; capacityA <= 4; capacityA++) {
      for (let capacityB = 0; capacityB <= 4; capacityB++) {
        for (const mode of ['value', 'count']) cases.push({ items, capacityA, capacityB, mode })
      }
    }
  }
  verifyCases({
    name: 'two-cost-knapsack',
    cases,
    solve: ({ items, capacityA, capacityB, mode }) => solveCost2DKnapsack(items, capacityA, capacityB, mode),
    oracle: ({ items, capacityA, capacityB, mode }) => bruteCost2DKnapsack(items, capacityA, capacityB, mode),
    equivalent: (actual, expected) => actual.value === expected,
    invariants: [(actual) => assert.equal(Object.hasOwn(actual, 'frames'), false)],
  })
})

test('dependency knapsack result matches exhaustive legal accessory subsets', () => {
  const masters = [{ w: 1, v: 2 }, { w: 2, v: 3 }]
  const accessoryKinds = [{ w: 1, v: 1 }, { w: 2, v: 4 }, { w: 3, v: 5 }]
  const cases = []
  for (const master of masters) {
    for (const accessories of vectors(accessoryKinds, 3)) {
      for (let capacity = 0; capacity <= 7; capacity++) cases.push({ master, accessories, capacity })
    }
  }
  verifyCases({
    name: 'dependency-knapsack',
    cases,
    solve: ({ master, accessories, capacity }) => solveDependencyKnapsack(master, accessories, capacity),
    oracle: ({ master, accessories, capacity }) => bruteDependencyKnapsack(master, accessories, capacity),
    equivalent: (actual, expected) => actual.value === expected,
    invariants: [(actual) => assert.equal(Object.hasOwn(actual, 'frames'), false)],
  })
})

test('counting knapsack variant returns every exact-fill count from exhaustive subsets', () => {
  const cases = []
  for (const weights of vectors([1, 2, 3], 6)) {
    for (let capacity = 0; capacity <= 7; capacity++) {
      cases.push({ items: weights.map((w) => ({ w })), capacity })
    }
  }
  verifyCases({
    name: 'count-knapsack',
    cases,
    solve: ({ items, capacity }) => solveCountKnapsack(items, capacity),
    oracle: ({ items, capacity }) => bruteCountKnapsack(items, capacity),
    equivalent: (actual, expected) => actual.counts.every((count, index) => count === expected[index]),
    invariants: [
      (actual, { capacity }) => {
        assert.equal(actual.count, actual.counts[capacity])
        assert.equal(Object.hasOwn(actual, 'frames'), false)
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
  const groups = [[{ w: 1, v: 2 }, { w: 2, v: 3 }], [{ w: 2, v: 4 }]]
  assert.deepEqual(recordGroupKnapsack(groups, 4).result, solveGroupKnapsack(groups, 4))
  const multiple = [{ w: 2, v: 3, m: 3 }]
  assert.deepEqual(recordMultipleKnapsack(multiple, 7).result, solveMultipleKnapsack(multiple, 7))
  const mixed = [{ kind: '01', w: 2, v: 3 }, { kind: 'complete', w: 3, v: 4 }]
  assert.deepEqual(recordMixedKnapsack(mixed, 7).result, solveMixedKnapsack(mixed, 7))
  const cost2d = [{ a: 1, b: 2, v: 3 }, { a: 2, b: 1, v: 4 }]
  assert.deepEqual(recordCost2DKnapsack(cost2d, 3, 3).result, solveCost2DKnapsack(cost2d, 3, 3))
  const master = { w: 2, v: 3 }
  const accessories = [{ w: 1, v: 2 }, { w: 2, v: 4 }]
  assert.deepEqual(
    recordDependencyKnapsack(master, accessories, 5).result,
    solveDependencyKnapsack(master, accessories, 5),
  )
  const countItems = [{ w: 1 }, { w: 2 }, { w: 3 }]
  assert.deepEqual(recordCountKnapsack(countItems, 5).result, solveCountKnapsack(countItems, 5))
})

test('teaching Adapters preserve frame contracts and project the typed result', () => {
  const items = [{ w: 2, v: 3 }, { w: 3, v: 4 }, { w: 4, v: 5 }]
  const capacity = 8
  const knapsackModel = knapsack2D(items, capacity)
  assertTeachingModel(knapsackModel)
  assert.equal(
    knapsackModel.frames.at(-1).values[items.length][capacity],
    solveZeroOneKnapsack(items, capacity).value,
  )

  const values = [2, 1, 5, 3, 6, 4, 8, 9, 7]
  const lisModel = lisNaive(values)
  assertTeachingModel(lisModel)
  assert.equal(Math.max(...lisModel.frames.at(-1).values[1]), solveLis(values).length)

  const stones = [7, 6, 5, 4]
  for (const objective of ['min', 'max']) {
    const stoneModel = stoneMerge(stones, objective)
    assertTeachingModel(stoneModel)
    assert.equal(stoneModel.frames.at(-1).values[0][stones.length - 1], solveStoneMerge(stones, objective).cost)
  }
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
