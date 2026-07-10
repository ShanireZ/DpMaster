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
import { solveMaxSubarray, solveMinSubarray } from '../src/algorithms/max-subarray/index.ts'
import { executeSubarray, recordSubarray } from '../src/algorithms/max-subarray/internal.ts'
import { solveIntegerPartition, solveStairCount } from '../src/algorithms/linear-count/index.ts'
import {
  executeIntegerPartition,
  executeStairCount,
  recordIntegerPartition,
  recordStairCount,
} from '../src/algorithms/linear-count/internal.ts'
import { solveEditDistance } from '../src/algorithms/edit-distance/index.ts'
import { executeEditDistance, recordEditDistance } from '../src/algorithms/edit-distance/internal.ts'
import { solveLcs } from '../src/algorithms/lcs/index.ts'
import { executeLcs, recordLcs } from '../src/algorithms/lcs/internal.ts'
import { solveTwoPath } from '../src/algorithms/two-path/index.ts'
import { executeTwoPath, recordTwoPath } from '../src/algorithms/two-path/internal.ts'
import { solveGridPathCount, solveTrianglePath } from '../src/algorithms/grid-path/index.ts'
import {
  executeGridPathCount,
  executeTrianglePath,
  recordGridPathCount,
  recordTrianglePath,
} from '../src/algorithms/grid-path/internal.ts'
import { solveMaxSquare } from '../src/algorithms/max-square/index.ts'
import { executeMaxSquare, recordMaxSquare } from '../src/algorithms/max-square/internal.ts'
import { solveLinearFsm, solveStockFsm } from '../src/algorithms/linear-fsm/index.ts'
import {
  executeLinearFsm,
  executeStockFsm,
  recordLinearFsm,
  recordStockFsm,
} from '../src/algorithms/linear-fsm/internal.ts'
import { knapsack2D } from '../src/components/demos/knapsack/solvers.ts'
import { lisNaive } from '../src/components/demos/lis/lisSolver.ts'
import { stoneMerge } from '../src/components/demos/interval/stoneSolver.ts'
import { kadane, minSegViz } from '../src/components/demos/linear/maxsegSolver.ts'
import { integerPartition, stairCount } from '../src/components/demos/linear/countSolver.ts'
import { edit2D } from '../src/components/demos/grid/editSolver.ts'
import { lcs2D } from '../src/components/demos/grid/lcsSolver.ts'
import { twoPath2D } from '../src/components/demos/grid/twoPathSolver.ts'
import { gridCount2D, triangle2D } from '../src/components/demos/grid/pathSolver.ts'
import { maxSquare2D } from '../src/components/demos/grid/maxSquareSolver.ts'
import { fsmPickTable, stockStates } from '../src/components/demos/fsm/fsmSolver.ts'
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

function bruteSubarray(values, objective) {
  if (values.length === 0) return { sum: 0, start: null, end: null }
  let sum = objective === 'max' ? -Infinity : Infinity
  let start = 0
  let end = 0
  for (let left = 0; left < values.length; left++) {
    let candidate = 0
    for (let right = left; right < values.length; right++) {
      candidate += values[right]
      const better = objective === 'max' ? candidate > sum : candidate < sum
      if (better) ({ sum, start, end } = { sum: candidate, start: left, end: right })
    }
  }
  return { sum, start, end }
}

function bruteStairCount(step) {
  if (step < 2) return 1
  return bruteStairCount(step - 1) + bruteStairCount(step - 2)
}

function bruteIntegerPartition(total) {
  const visit = (remaining, maximum) => {
    if (remaining === 0) return 1
    if (remaining < 0 || maximum === 0) return 0
    return visit(remaining, maximum - 1) + visit(remaining - maximum, maximum)
  }
  return visit(total, total)
}

function bruteEditDistance(a, b) {
  const memo = new Map()
  const visit = (i, j) => {
    if (i === a.length) return b.length - j
    if (j === b.length) return a.length - i
    const key = `${i},${j}`
    if (memo.has(key)) return memo.get(key)
    const answer = a[i] === b[j]
      ? visit(i + 1, j + 1)
      : 1 + Math.min(visit(i + 1, j), visit(i, j + 1), visit(i + 1, j + 1))
    memo.set(key, answer)
    return answer
  }
  return visit(0, 0)
}

function bruteLcs(a, b) {
  let longest = ''
  for (let mask = 0; mask < 1 << a.length; mask++) {
    let candidate = ''
    for (let index = 0; index < a.length; index++) {
      if ((mask & (1 << index)) !== 0) candidate += a[index]
    }
    let cursor = 0
    for (const char of b) if (char === candidate[cursor]) cursor++
    if (cursor === candidate.length && candidate.length > longest.length) longest = candidate
  }
  return longest.length
}

function enumerateGridPaths(rows, cols) {
  const paths = []
  const visit = (row, col, path) => {
    const next = [...path, [row, col]]
    if (row === rows - 1 && col === cols - 1) {
      paths.push(next)
      return
    }
    if (row + 1 < rows) visit(row + 1, col, next)
    if (col + 1 < cols) visit(row, col + 1, next)
  }
  visit(0, 0, [])
  return paths
}

function bruteTwoPath(grid) {
  const paths = enumerateGridPaths(grid.length, grid[0].length)
  let best = -Infinity
  for (const first of paths) {
    for (const second of paths) {
      const cells = new Set([...first, ...second].map(([row, col]) => `${row},${col}`))
      let value = 0
      for (const cell of cells) {
        const [row, col] = cell.split(',').map(Number)
        value += grid[row][col]
      }
      best = Math.max(best, value)
    }
  }
  return best
}

function bruteTrianglePath(triangle) {
  const visit = (row, col) => row === triangle.length - 1
    ? triangle[row][col]
    : triangle[row][col] + Math.max(visit(row + 1, col), visit(row + 1, col + 1))
  return visit(0, 0)
}

function bruteGridPathCount(rows, cols, blocked) {
  const visit = (row, col) => {
    if (row > rows || col > cols || blocked.has(`${row},${col}`)) return 0
    if (row === rows && col === cols) return 1
    return visit(row + 1, col) + visit(row, col + 1)
  }
  return visit(1, 1)
}

function bruteMaxSquare(grid) {
  let side = 0
  for (let top = 0; top < grid.length; top++) {
    for (let left = 0; left < grid[0].length; left++) {
      for (let size = 1; top + size <= grid.length && left + size <= grid[0].length; size++) {
        let allOne = true
        for (let row = top; row < top + size; row++) {
          for (let col = left; col < left + size; col++) allOne &&= grid[row][col] === 1
        }
        if (allOne) side = Math.max(side, size)
      }
    }
  }
  return side
}

function bruteLinearFsm(values) {
  let best = 0
  for (let mask = 0; mask < 1 << values.length; mask++) {
    let valid = true
    let value = 0
    for (let index = 0; index < values.length; index++) {
      if ((mask & (1 << index)) === 0) continue
      if (index > 0 && (mask & (1 << (index - 1))) !== 0) {
        valid = false
        break
      }
      value += values[index]
    }
    if (valid) best = Math.max(best, value)
  }
  return best
}

function bruteStockFsm(prices, cooldown) {
  const memo = new Map()
  const visit = (day, holding, frozen) => {
    if (day === prices.length) return holding ? -Infinity : 0
    const key = `${day},${holding},${frozen}`
    if (memo.has(key)) return memo.get(key)
    let best = visit(day + 1, holding, false)
    if (holding) best = Math.max(best, prices[day] + visit(day + 1, false, cooldown))
    else if (!frozen) best = Math.max(best, -prices[day] + visit(day + 1, true, false))
    memo.set(key, best)
    return best
  }
  return visit(0, false, false)
}

function assertEventSnapshots(execute) {
  const events = []
  const snapshots = []
  const result = execute((event) => {
    events.push(event)
    snapshots.push(structuredClone(event))
  })
  assert.ok(events.length > 0)
  assert.deepEqual(events, snapshots)
  for (let index = 1; index < events.length; index++) assert.notEqual(events[index - 1], events[index])
  return result
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

test('max and min subarray results match exhaustive contiguous ranges with legal witnesses', () => {
  const cases = [...vectors([-2, 0, 3], 6)]
  for (const objective of ['max', 'min']) {
    verifyCases({
      name: `${objective}-subarray`,
      cases,
      solve: (values) => objective === 'max' ? solveMaxSubarray(values) : solveMinSubarray(values),
      oracle: (values) => bruteSubarray(values, objective),
      equivalent: (actual, expected) => actual.sum === expected.sum,
      invariants: [
        (actual, values) => {
          assert.equal(Object.hasOwn(actual, 'frames'), false)
          assert.equal(actual.sums.length, values.length)
          if (values.length === 0) {
            assert.equal(actual.start, null)
            assert.equal(actual.end, null)
          } else {
            assert.ok(actual.start >= 0 && actual.end >= actual.start && actual.end < values.length)
            assert.equal(values.slice(actual.start, actual.end + 1).reduce((sum, value) => sum + value, 0), actual.sum)
          }
        },
      ],
    })
  }
})

test('linear counting results match independent recurrences', () => {
  verifyCases({
    name: 'stair-count',
    cases: Array.from({ length: 13 }, (_, step) => step),
    solve: solveStairCount,
    oracle: bruteStairCount,
    equivalent: (actual, expected) => actual.count === expected,
    invariants: [(actual, step) => {
      assert.equal(actual.counts.length, step + 1)
      assert.equal(Object.hasOwn(actual, 'frames'), false)
    }],
  })
  verifyCases({
    name: 'integer-partition',
    cases: Array.from({ length: 11 }, (_, total) => total),
    solve: solveIntegerPartition,
    oracle: bruteIntegerPartition,
    equivalent: (actual, expected) => actual.count === expected,
    invariants: [(actual, total) => {
      assert.equal(actual.table.length, total + 1)
      assert.equal(Object.hasOwn(actual, 'frames'), false)
    }],
  })
})

test('edit-distance results match a memoized suffix oracle', () => {
  const words = [...vectors(['a', 'b'], 3)].map((letters) => letters.join(''))
  const cases = words.flatMap((a) => words.map((b) => ({ a, b })))
  verifyCases({
    name: 'edit-distance',
    cases,
    solve: ({ a, b }) => solveEditDistance(a, b),
    oracle: ({ a, b }) => bruteEditDistance(a, b),
    equivalent: (actual, expected) => actual.distance === expected,
    invariants: [(actual, { a, b }) => {
      assert.equal(actual.table.length, a.length + 1)
      assert.equal(actual.table[0].length, b.length + 1)
      assert.equal(Object.hasOwn(actual, 'frames'), false)
    }],
  })
})

test('LCS results match exhaustive subsequences and return a common witness', () => {
  const words = [...vectors(['a', 'b'], 4)].map((letters) => letters.join(''))
  const cases = words.flatMap((a) => words.map((b) => ({ a, b })))
  verifyCases({
    name: 'lcs-grid',
    cases,
    solve: ({ a, b }) => solveLcs(a, b),
    oracle: ({ a, b }) => bruteLcs(a, b),
    equivalent: (actual, expected) => actual.length === expected,
    invariants: [(actual, { a, b }) => {
      const isSubsequence = (candidate, value) => {
        let index = 0
        for (const char of value) if (char === candidate[index]) index++
        return index === candidate.length
      }
      assert.equal(actual.subsequence.length, actual.length)
      assert.equal(isSubsequence(actual.subsequence, a), true)
      assert.equal(isSubsequence(actual.subsequence, b), true)
      assert.equal(Object.hasOwn(actual, 'model'), false)
    }],
  })
})

test('two-path results match exhaustive pairs of right/down paths', () => {
  const cases = [
    [[5]],
    [[1, 2], [3, 4]],
    [[1, -2, 3], [4, 5, -6]],
    [[1, 2, 3], [0, 4, 5], [7, -1, 6]],
  ]
  verifyCases({
    name: 'two-path',
    cases,
    solve: solveTwoPath,
    oracle: bruteTwoPath,
    equivalent: (actual, expected) => actual.value === expected,
    invariants: [(actual, grid) => {
      assert.equal(actual.table.length, grid.length)
      assert.equal(actual.table[0].length, grid.length)
      assert.equal(Object.hasOwn(actual, 'frames'), false)
    }],
  })
})

test('triangle and blocked-grid path results match recursive enumeration', () => {
  const triangles = [
    [[4]],
    [[1], [2, 3]],
    [[2], [-1, 4], [3, 5, -2]],
    [[0], [7, 1], [2, -3, 4], [5, 6, 1, 2]],
  ]
  verifyCases({
    name: 'triangle-path',
    cases: triangles,
    solve: solveTrianglePath,
    oracle: bruteTrianglePath,
    equivalent: (actual, expected) => actual.value === expected,
    invariants: [(actual, triangle) => assert.equal(actual.table.length, triangle.length)],
  })

  const cases = []
  for (let rows = 1; rows <= 4; rows++) {
    for (let cols = 1; cols <= 4; cols++) {
      for (let variant = 0; variant < 8; variant++) {
        const blocked = new Set()
        for (let row = 1; row <= rows; row++) {
          for (let col = 1; col <= cols; col++) {
            if (((row * 5 + col * 3 + variant) % 11) === 0) blocked.add(`${row},${col}`)
          }
        }
        cases.push({ rows, cols, blocked })
      }
    }
  }
  verifyCases({
    name: 'grid-path-count',
    cases,
    solve: ({ rows, cols, blocked }) => solveGridPathCount(rows, cols, blocked),
    oracle: ({ rows, cols, blocked }) => bruteGridPathCount(rows, cols, blocked),
    equivalent: (actual, expected) => actual.count === expected,
    invariants: [(actual, { rows, cols }) => {
      assert.equal(actual.table.length, rows)
      assert.equal(actual.table[0].length, cols)
    }],
  })
})

test('maximum-square results match exhaustive square scans', () => {
  const cases = []
  for (let rows = 1; rows <= 4; rows++) {
    for (let cols = 1; cols <= 4; cols++) {
      for (let variant = 0; variant < 16; variant++) {
        cases.push(Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => ((row * 7 + col * 5 + variant) % 4 === 0 ? 0 : 1))))
      }
    }
  }
  verifyCases({
    name: 'max-square',
    cases,
    solve: solveMaxSquare,
    oracle: bruteMaxSquare,
    equivalent: (actual, expected) => actual.side === expected,
    invariants: [(actual) => {
      assert.equal(actual.area, actual.side ** 2)
      assert.equal(Object.hasOwn(actual, 'frames'), false)
    }],
  })
})

test('linear and stock FSM results match exhaustive decisions', () => {
  verifyCases({
    name: 'linear-fsm',
    cases: vectors([-2, 0, 3], 7),
    solve: solveLinearFsm,
    oracle: bruteLinearFsm,
    equivalent: (actual, expected) => actual.value === expected,
    invariants: [(actual, values) => {
      assert.equal(actual.table.length, 2)
      assert.equal(actual.table[0].length, values.length + 1)
    }],
  })

  const priceCases = []
  for (const prices of vectors([1, 2, 3], 5)) {
    for (const cooldown of [false, true]) priceCases.push({ prices, cooldown })
  }
  verifyCases({
    name: 'stock-fsm',
    cases: priceCases,
    solve: ({ prices, cooldown }) => solveStockFsm(prices, cooldown),
    oracle: ({ prices, cooldown }) => bruteStockFsm(prices, cooldown),
    equivalent: (actual, expected) => actual.profit === expected,
    invariants: [(actual, { prices }) => assert.equal(actual.days.length, prices.length)],
  })
})

test('linear, grid, and FSM recorded runs share their exact result Implementations', () => {
  const values = [3, -5, 4, 2, -1]
  for (const objective of ['max', 'min']) {
    const solved = objective === 'max' ? solveMaxSubarray(values) : solveMinSubarray(values)
    assert.deepEqual(recordSubarray(values, objective).result, solved)
  }
  assert.deepEqual(recordStairCount(7).result, solveStairCount(7))
  assert.deepEqual(recordIntegerPartition(7).result, solveIntegerPartition(7))
  assert.deepEqual(recordEditDistance('kitten', 'sitting').result, solveEditDistance('kitten', 'sitting'))
  assert.deepEqual(recordLcs('ABCBDAB', 'BDCABA').result, solveLcs('ABCBDAB', 'BDCABA'))
  const grid = [[1, 2, 3], [4, 5, 6]]
  assert.deepEqual(recordTwoPath(grid).result, solveTwoPath(grid))
  const triangle = [[2], [3, 4], [6, 5, 7]]
  assert.deepEqual(recordTrianglePath(triangle).result, solveTrianglePath(triangle))
  const blocked = new Set(['2,2'])
  assert.deepEqual(recordGridPathCount(4, 5, blocked).result, solveGridPathCount(4, 5, blocked))
  const binary = [[1, 1, 0], [1, 1, 1], [0, 1, 1]]
  assert.deepEqual(recordMaxSquare(binary).result, solveMaxSquare(binary))
  assert.deepEqual(recordLinearFsm(values).result, solveLinearFsm(values))
  assert.deepEqual(recordStockFsm([1, 3, 2, 5], true).result, solveStockFsm([1, 3, 2, 5], true))
})

test('linear, grid, and FSM events remain immutable snapshots after later transitions', () => {
  assertEventSnapshots((emit) => executeSubarray([3, -5, 4], 'max', emit))
  assertEventSnapshots((emit) => executeStairCount(6, emit))
  assertEventSnapshots((emit) => executeIntegerPartition(5, emit))
  assertEventSnapshots((emit) => executeEditDistance('abc', 'adc', emit))
  assertEventSnapshots((emit) => executeLcs('abca', 'acba', emit))
  assertEventSnapshots((emit) => executeTwoPath([[1, 2, 3], [4, 5, 6]], emit))
  assertEventSnapshots((emit) => executeTrianglePath([[2], [3, 4], [6, 5, 7]], emit))
  assertEventSnapshots((emit) => executeGridPathCount(3, 4, new Set(['2,2']), emit))
  assertEventSnapshots((emit) => executeMaxSquare([[1, 1], [1, 1]], emit))
  assertEventSnapshots((emit) => executeLinearFsm([2, 7, 9, 3], emit))
  assertEventSnapshots((emit) => executeStockFsm([1, 3, 2, 5], true, emit))
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

  const subarrayValues = [3, -5, 4, 2, -1]
  for (const [model, solved] of [
    [kadane(subarrayValues), solveMaxSubarray(subarrayValues)],
    [minSegViz(subarrayValues), solveMinSubarray(subarrayValues)],
  ]) {
    assertTeachingModel(model)
    assert.equal(model.frames.at(-1).values[1][solved.end], solved.sum)
  }

  const stairModel = stairCount(7)
  assertTeachingModel(stairModel)
  assert.equal(stairModel.frames.at(-1).values[0][7], solveStairCount(7).count)
  const partitionModel = integerPartition(6)
  assertTeachingModel(partitionModel)
  assert.equal(partitionModel.frames.at(-1).values[6][6], solveIntegerPartition(6).count)

  const editModel = edit2D('kitten', 'sitting')
  assertTeachingModel(editModel)
  assert.equal(editModel.frames.at(-1).values[6][7], solveEditDistance('kitten', 'sitting').distance)
  const lcsTeaching = lcs2D('ABCBDAB', 'BDCABA')
  assertTeachingModel(lcsTeaching.model)
  assert.equal(lcsTeaching.len, solveLcs('ABCBDAB', 'BDCABA').length)
  assert.equal(lcsTeaching.lcs, solveLcs('ABCBDAB', 'BDCABA').subsequence)

  const pathGrid = [[1, 2, 3], [4, 5, 6]]
  const twoPathModel = twoPath2D(pathGrid)
  assertTeachingModel(twoPathModel)
  assert.equal(twoPathModel.frames.at(-1).values[1][1], solveTwoPath(pathGrid).value)
  const triangle = [[2], [3, 4], [6, 5, 7]]
  const triangleModel = triangle2D(triangle)
  assertTeachingModel(triangleModel)
  assert.equal(triangleModel.frames.at(-1).values[0][0], solveTrianglePath(triangle).value)
  const blocked = new Set(['2,2'])
  const pathModel = gridCount2D(3, 4, blocked)
  assertTeachingModel(pathModel)
  assert.equal(pathModel.frames.at(-1).values[2][3], solveGridPathCount(3, 4, blocked).count)

  const binary = [[1, 1, 0], [1, 1, 1], [0, 1, 1]]
  const squareModel = maxSquare2D(binary)
  assertTeachingModel(squareModel)
  assert.equal(Math.max(...squareModel.frames.at(-1).values.flat()), solveMaxSquare(binary).side)
  const fsmModel = fsmPickTable(subarrayValues)
  assertTeachingModel(fsmModel)
  assert.equal(Math.max(...fsmModel.frames.at(-1).values.map((row) => row.at(-1))), solveLinearFsm(subarrayValues).value)
  assert.deepEqual(stockStates([1, 3, 2, 5], true), solveStockFsm([1, 3, 2, 5], true).days)
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
