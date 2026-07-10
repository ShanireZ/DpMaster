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
import { solveScoreTree } from '../src/algorithms/score-tree/index.ts'
import { executeScoreTree, recordScoreTree } from '../src/algorithms/score-tree/internal.ts'
import { solveRingInterval } from '../src/algorithms/ring-interval/index.ts'
import { executeRingInterval, recordRingInterval } from '../src/algorithms/ring-interval/internal.ts'
import { solvePalindromeInsertion, solvePalindromeLps } from '../src/algorithms/palindrome/index.ts'
import {
  executePalindromeInsertion,
  executePalindromeLps,
  recordPalindromeInsertion,
  recordPalindromeLps,
} from '../src/algorithms/palindrome/internal.ts'
import { solveMerge248, solveTakeEnds } from '../src/algorithms/interval-merge/index.ts'
import {
  executeMerge248,
  executeTakeEnds,
  recordMerge248,
  recordTakeEnds,
} from '../src/algorithms/interval-merge/internal.ts'
import {
  buildRerootTree,
  solveRerootDistance,
  solveRerootEccentricity,
  solveRerootInOut,
} from '../src/algorithms/reroot/index.ts'
import {
  executeRerootDistance,
  executeRerootEccentricity,
  executeRerootInOut,
  recordRerootDistance,
  recordRerootEccentricity,
  recordRerootInOut,
} from '../src/algorithms/reroot/internal.ts'
import {
  buildRootedTree,
  solveTreeDominatingSet,
  solveTreeIndependentSet,
  solveTreeJointWeight,
  solveTreeKnapsack,
  solveTreeMaxSubtreeChain,
} from '../src/algorithms/tree-dp/index.ts'
import {
  executeTreeDominatingSet,
  executeTreeIndependentSet,
  executeTreeJointWeight,
  executeTreeKnapsack,
  executeTreeMaxSubtreeChain,
  recordTreeDominatingSet,
  recordTreeIndependentSet,
  recordTreeJointWeight,
  recordTreeKnapsack,
  recordTreeMaxSubtreeChain,
} from '../src/algorithms/tree-dp/internal.ts'
import { solveKingsBoard } from '../src/algorithms/bitmask-board/index.ts'
import { executeKingsBoard, recordKingsBoard } from '../src/algorithms/bitmask-board/internal.ts'
import { solveBitmaskCover } from '../src/algorithms/bitmask-cover/index.ts'
import { executeBitmaskCover, recordBitmaskCover } from '../src/algorithms/bitmask-cover/internal.ts'
import { solveBitmaskSubsets } from '../src/algorithms/bitmask-subset/index.ts'
import { executeBitmaskSubsets, recordBitmaskSubsets } from '../src/algorithms/bitmask-subset/internal.ts'
import { solveBitmaskTsp } from '../src/algorithms/bitmask-tsp/index.ts'
import { executeBitmaskTsp, recordBitmaskTsp } from '../src/algorithms/bitmask-tsp/internal.ts'
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
import { buildScoreTree, scoreTree } from '../src/components/demos/interval/scoreTreeSolver.ts'
import { ringMerge } from '../src/components/demos/interval/ringSolver.ts'
import { palindromeInsert, palindromeLps } from '../src/components/demos/interval/palindromeSolver.ts'
import { merge248, takeEnds } from '../src/components/demos/interval/mergeSolver.ts'
import { rerootDistSum } from '../src/components/demos/reroot/rerootSolver.ts'
import { solveIndepSet } from '../src/components/demos/treedp/treedpSolver.ts'
import { countKings, findOneLayout } from '../src/components/demos/bitmask/boardSolver.ts'
import { solveCover } from '../src/components/demos/bitmask/coverSolver.ts'
import { enumerateSubsets } from '../src/components/demos/bitmask/subsetSolver.ts'
import { tspHamilton } from '../src/components/demos/bitmask/tspSolver.ts'

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

function bruteScoreTree(scores) {
  const visit = (left, right) => {
    if (left > right) return 1
    if (left === right) return scores[left]
    let best = -Infinity
    for (let root = left; root <= right; root++) {
      best = Math.max(best, visit(left, root - 1) * visit(root + 1, right) + scores[root])
    }
    return best
  }
  return scores.length === 0 ? 0 : visit(0, scores.length - 1)
}

function brutePalindromeLps(chars) {
  let best = 0
  for (let mask = 0; mask < 1 << chars.length; mask++) {
    const candidate = chars.filter((_, index) => (mask & (1 << index)) !== 0)
    if (candidate.every((char, index) => char === candidate[candidate.length - 1 - index])) {
      best = Math.max(best, candidate.length)
    }
  }
  return best
}

function bruteTakeEnds(values) {
  const visit = (left, right) => {
    if (left === right) return values[left]
    return Math.max(values[left] - visit(left + 1, right), values[right] - visit(left, right - 1))
  }
  return values.length === 0 ? 0 : visit(0, values.length - 1)
}

function bruteMerge248(values) {
  const visit = (left, right) => {
    if (left === right) return values[left]
    let merged = 0
    for (let split = left; split < right; split++) {
      const lhs = visit(left, split)
      const rhs = visit(split + 1, right)
      if (lhs > 0 && lhs === rhs) merged = Math.max(merged, lhs + 1)
    }
    return merged
  }
  let best = 0
  for (let left = 0; left < values.length; left++) {
    for (let right = left; right < values.length; right++) best = Math.max(best, visit(left, right))
  }
  return best
}

function bruteRerootDistance(tree) {
  return Array.from({ length: tree.n }, (_, start) => {
    const distances = Array(tree.n).fill(Infinity)
    distances[start] = 0
    const queue = [start]
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const node = queue[cursor]
      for (const { to, w } of tree.adj[node]) {
        if (distances[to] !== Infinity) continue
        distances[to] = distances[node] + w
        queue.push(to)
      }
    }
    return distances.reduce((sum, distance) => sum + distance, 0)
  })
}

function allPairRerootDistances(tree) {
  return Array.from({ length: tree.n }, (_, start) => {
    const distances = Array(tree.n).fill(Infinity)
    distances[start] = 0
    const queue = [start]
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const node = queue[cursor]
      for (const { to, w } of tree.adj[node]) {
        if (distances[to] !== Infinity) continue
        distances[to] = distances[node] + w
        queue.push(to)
      }
    }
    return distances
  })
}

function* weightedRerootCases(maxSize = 8) {
  for (let n = 1; n <= maxSize; n++) {
    for (let variant = 0; variant < 8; variant++) {
      const edges = []
      for (let node = 1; node < n; node++) {
        edges.push({
          u: node,
          v: (node * 5 + variant * 3) % node,
          w: 1 + ((node * 7 + variant * 2) % 5),
        })
      }
      const weight = Array.from({ length: n }, (_, node) => 1 + ((node * 3 + variant * 7) % 6))
      yield buildRerootTree(n, edges, variant % n, weight)
    }
  }
}

function* weightedRootedCases(maxSize = 7, positiveOnly = false) {
  const values = positiveOnly ? [1, 2, 5, 8] : [-5, -2, 1, 4, 7]
  for (let n = 1; n <= maxSize; n++) {
    for (let variant = 0; variant < 8; variant++) {
      const parent = [-1]
      for (let node = 1; node < n; node++) parent.push((node * 3 + variant * 5) % node)
      const weight = Array.from(
        { length: n },
        (_, node) => values[(node * 7 + variant * 3) % values.length],
      )
      yield buildRootedTree(parent, weight)
    }
  }
}

function rootedAdjacency(tree) {
  const adjacency = Array.from({ length: tree.n }, () => [])
  for (let node = 0; node < tree.n; node++) {
    const parent = tree.parent[node]
    if (parent < 0) continue
    adjacency[node].push(parent)
    adjacency[parent].push(node)
  }
  return adjacency
}

function bruteTreeMaxSubtreeChain(tree) {
  let ans = Number.NEGATIVE_INFINITY
  const visitDescendants = (node, sum) => {
    const nextSum = sum + tree.weight[node]
    ans = Math.max(ans, nextSum)
    for (const child of tree.children[node]) visitDescendants(child, nextSum)
  }
  for (let start = 0; start < tree.n; start++) visitDescendants(start, 0)

  const adjacency = rootedAdjacency(tree)
  let diameter = Number.NEGATIVE_INFINITY
  const visitPaths = (node, parent, sum) => {
    const nextSum = sum + tree.weight[node]
    diameter = Math.max(diameter, nextSum)
    for (const neighbor of adjacency[node]) {
      if (neighbor !== parent) visitPaths(neighbor, node, nextSum)
    }
  }
  for (let start = 0; start < tree.n; start++) visitPaths(start, -1, 0)
  return { ans, diameter }
}

function bruteTreeKnapsack(tree, parentEdge, edgeLimit) {
  const edgeNodes = Array.from({ length: tree.n }, (_, node) => node).filter((node) => node !== tree.root)
  const bitByNode = new Map(edgeNodes.map((node, index) => [node, index]))
  let best = 0
  for (let mask = 0; mask < 1 << edgeNodes.length; mask++) {
    let used = 0
    let value = 0
    let connected = true
    for (let index = 0; index < edgeNodes.length; index++) {
      if ((mask & (1 << index)) === 0) continue
      used++
      const node = edgeNodes[index]
      value += parentEdge[node]
      const parent = tree.parent[node]
      if (parent !== tree.root && (mask & (1 << bitByNode.get(parent))) === 0) connected = false
    }
    if (connected && used === edgeLimit) best = Math.max(best, value)
  }
  return best
}

function bruteTreeJointWeight(tree) {
  const adjacency = rootedAdjacency(tree)
  let unorderedSum = 0
  let globalMax = 0
  for (let first = 0; first < tree.n; first++) {
    const distance = Array(tree.n).fill(Infinity)
    distance[first] = 0
    const queue = [first]
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const node = queue[cursor]
      for (const neighbor of adjacency[node]) {
        if (distance[neighbor] !== Infinity) continue
        distance[neighbor] = distance[node] + 1
        queue.push(neighbor)
      }
    }
    for (let second = first + 1; second < tree.n; second++) {
      if (distance[second] !== 2) continue
      const product = tree.weight[first] * tree.weight[second]
      unorderedSum += product
      globalMax = Math.max(globalMax, product)
    }
  }
  return { totalSum: unorderedSum * 2, globalMax }
}

function bruteDominatingSet(tree) {
  let best = Infinity
  for (let mask = 0; mask < 1 << tree.n; mask++) {
    let cost = 0
    let valid = true
    for (let node = 0; node < tree.n; node++) {
      if ((mask & (1 << node)) !== 0) cost += tree.weight[node]
      const dominated = (mask & (1 << node)) !== 0
        || (tree.parent[node] >= 0 && (mask & (1 << tree.parent[node])) !== 0)
        || tree.children[node].some((child) => (mask & (1 << child)) !== 0)
      if (!dominated) valid = false
    }
    if (valid) best = Math.min(best, cost)
  }
  return best
}

function bruteKingsBoard(size, kings) {
  const cells = size * size
  let total = 0
  for (let mask = 0; mask < 2 ** cells; mask++) {
    let count = 0
    const placed = []
    for (let cell = 0; cell < cells; cell++) {
      if ((mask & 2 ** cell) === 0) continue
      count++
      placed.push([Math.floor(cell / size), cell % size])
    }
    if (count !== kings) continue
    let valid = true
    for (let first = 0; first < placed.length; first++) {
      for (let second = first + 1; second < placed.length; second++) {
        if (
          Math.abs(placed[first][0] - placed[second][0]) <= 1 &&
          Math.abs(placed[first][1] - placed[second][1]) <= 1
        ) valid = false
      }
    }
    if (valid) total++
  }
  return total
}

function bruteBitmaskCover(universe, choices) {
  const full = (1 << universe) - 1
  let best = Infinity
  for (let mask = 0; mask < 1 << choices.length; mask++) {
    let covered = 0
    let cost = 0
    for (let index = 0; index < choices.length; index++) {
      if ((mask & (1 << index)) === 0) continue
      covered |= choices[index].cover
      cost += choices[index].cost
    }
    if (covered === full) best = Math.min(best, cost)
  }
  return Number.isFinite(best) ? best : -1
}

function bruteBitmaskTsp(distances) {
  const remaining = Array.from({ length: distances.length - 1 }, (_, index) => index + 1)
  let best = Infinity
  const visit = (current, left, distance) => {
    if (left.length === 0) {
      best = Math.min(best, distance)
      return
    }
    for (let index = 0; index < left.length; index++) {
      const next = left[index]
      visit(next, [...left.slice(0, index), ...left.slice(index + 1)], distance + distances[current][next])
    }
  }
  visit(0, remaining, 0)
  return best
}

function* rootedParentArrays(size) {
  const parent = [-1]
  function* fill(node) {
    if (node === size) {
      yield parent.slice()
      return
    }
    for (let candidate = 0; candidate < node; candidate++) {
      parent[node] = candidate
      yield* fill(node + 1)
    }
  }
  yield* fill(1)
}

function* dominatingWitnessCases() {
  yield { parent: [-1, 0, 0, 0, 2], weight: [5, 3, 4, 6, 2] }
  yield { parent: [-1], weight: [2_000_000_000] }
  for (let size = 1; size <= 5; size++) {
    for (const parent of rootedParentArrays(size)) {
      for (const weight of vectors([1, 2, 4], size, false)) {
        if (weight.length === size) yield { parent, weight }
      }
    }
  }
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
    invariants: [(actual, { master, accessories, capacity }) => {
      assert.equal(Object.hasOwn(actual, 'frames'), false)
      if (actual.bestCombo === null) {
        assert.equal(actual.value, 0)
        return
      }
      assert.equal(actual.bestCombo.picks.length, accessories.length)
      const pickedWeight = accessories.reduce(
        (sum, accessory, index) => sum + (actual.bestCombo.picks[index] ? accessory.w : 0),
        master.w,
      )
      const pickedValue = accessories.reduce(
        (sum, accessory, index) => sum + (actual.bestCombo.picks[index] ? accessory.v : 0),
        master.v,
      )
      assert.equal(actual.bestCombo.w, pickedWeight)
      assert.equal(actual.bestCombo.v, pickedValue)
      assert.ok(pickedWeight <= capacity)
      assert.equal(pickedValue, actual.value)
    }],
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
        assert.deepEqual(actual.indices, actual.pick.flatMap((take, index) => take ? [index] : []))
        assert.equal(actual.indices.length, actual.length)
        assert.equal(actual.endIndex, actual.indices.at(-1) ?? null)
        for (let index = 0; index < values.length; index++) {
          const previous = actual.previous[index]
          assert.ok(previous === -1 || (previous < index && values[previous] < values[index]))
          assert.equal(actual.lengths[index], previous === -1 ? 1 : actual.lengths[previous] + 1)
        }
        for (let index = actual.indices.length - 1; index > 0; index--) {
          assert.equal(actual.previous[actual.indices[index]], actual.indices[index - 1])
        }
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
      assert.equal(actual.path.length === 0, a.length === 0 || b.length === 0)
      const matched = []
      for (let index = 0; index < actual.path.length; index++) {
        const cell = actual.path[index]
        assert.ok(cell.row >= 1 && cell.row <= a.length)
        assert.ok(cell.column >= 1 && cell.column <= b.length)
        assert.equal(cell.matched, a[cell.row - 1] === b[cell.column - 1])
        if (cell.matched) matched.push(a[cell.row - 1])
        const next = actual.path[index + 1]
        if (!next) continue
        const rowStep = cell.row - next.row
        const columnStep = cell.column - next.column
        assert.ok(rowStep >= 0 && rowStep <= 1)
        assert.ok(columnStep >= 0 && columnStep <= 1)
        assert.equal(cell.matched ? rowStep === 1 && columnStep === 1 : rowStep + columnStep === 1, true)
      }
      assert.equal(matched.reverse().join(''), actual.subsequence)
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
    invariants: [(actual, grid) => {
      assert.equal(actual.area, actual.side ** 2)
      if (actual.side === 0) {
        assert.equal(actual.bottomRight, null)
      } else {
        assert.notEqual(actual.bottomRight, null)
        const { row, column } = actual.bottomRight
        assert.ok(row >= actual.side - 1 && row < grid.length)
        assert.ok(column >= actual.side - 1 && column < grid[0].length)
        for (let squareRow = row - actual.side + 1; squareRow <= row; squareRow++) {
          for (let squareColumn = column - actual.side + 1; squareColumn <= column; squareColumn++) {
            assert.equal(grid[squareRow][squareColumn], 1)
          }
        }
      }
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

test('reroot public distance results match independent weighted and node-weighted oracles', () => {
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
    solve: (tree) => solveRerootDistance(tree).dist,
    oracle: bruteRerootDistance,
  })
  for (const tree of weightedRerootCases()) {
    const distances = allPairRerootDistances(tree)
    for (const mode of ['unweighted', 'nodeWeighted']) {
      const nodeWeight = mode === 'nodeWeighted' ? tree.weight : Array(tree.n).fill(1)
      const expected = distances.map((row) => row.reduce(
        (sum, distance, node) => sum + distance * nodeWeight[node],
        0,
      ))
      const result = solveRerootDistance(tree, mode)
      const best = Math.min(...expected)
      assert.deepEqual(result.dist, expected)
      assert.equal(result.totalW, nodeWeight.reduce((sum, value) => sum + value, 0))
      assert.equal(result.best, best)
      assert.equal(result.bestNode, expected.indexOf(best))
    }
  }
})

test('tree and reroot domain boundaries reject values outside the lesson contracts', () => {
  const tree = buildRootedTree([-1, 0], [2, 3])
  assert.throws(() => solveTreeKnapsack(tree, [0, -1], 1), /non-negative/)
  assert.throws(() => solveTreeKnapsack(tree, [0, Infinity], 1), /finite/)
  assert.throws(() => solveTreeKnapsack(tree, [0, 1], 2), /edge limit/)
  assert.throws(() => solveTreeJointWeight(buildRootedTree([-1], [-1])), /non-negative/)
  assert.throws(
    () => buildRerootTree(3, [{ u: 0, v: 1 }, { u: 1, v: 2 }, { u: 2, v: 0 }]),
    /exactly n - 1 edges/,
  )
})

test('reroot in-out public results match weighted all-pairs distances', () => {
  for (const tree of weightedRerootCases()) {
    const result = solveRerootInOut(tree)
    const distances = allPairRerootDistances(tree)
    const descendants = Array.from({ length: tree.n }, () => new Set())
    for (let node = 0; node < tree.n; node++) {
      let ancestor = node
      while (ancestor >= 0) {
        descendants[ancestor].add(node)
        ancestor = tree.parent[ancestor]
      }
    }
    const dist = distances.map((row) => row.reduce((sum, value) => sum + value, 0))
    const down = distances.map((row, node) => (
      [...descendants[node]].reduce((sum, descendant) => sum + row[descendant], 0)
    ))
    assert.deepEqual(result.sz, descendants.map((nodes) => nodes.size))
    assert.deepEqual(result.down, down)
    assert.deepEqual(result.dist, dist)
    assert.deepEqual(result.up, dist.map((value, node) => value - down[node]))
    assert.equal(result.totalW, tree.n)
  }
})

test('reroot eccentricity public results match weighted all-pairs distances', () => {
  for (const tree of weightedRerootCases()) {
    const result = solveRerootEccentricity(tree)
    const distances = allPairRerootDistances(tree)
    const eccentricity = distances.map((row) => Math.max(...row))
    const radius = Math.min(...eccentricity)
    assert.deepEqual(result.ecc, eccentricity)
    assert.equal(result.radius, radius)
    assert.equal(result.center, eccentricity.indexOf(radius))
    assert.equal(result.diameter, Math.max(...eccentricity))
  }
})

test('tree max-subtree-chain public results match exhaustive rooted and simple paths', () => {
  for (const tree of weightedRootedCases()) {
    const result = solveTreeMaxSubtreeChain(tree)
    const expected = bruteTreeMaxSubtreeChain(tree)
    assert.equal(result.ans, expected.ans)
    assert.equal(result.diameter, expected.diameter)
    assert.ok(result.argMax >= 0 && result.argMax < tree.n)
    assert.ok(result.argThrough >= 0 && result.argThrough < tree.n)
    assert.equal(result.down[result.argMax], result.ans)
    assert.equal(result.through[result.argThrough], result.diameter)
  }
})

test('tree knapsack public results match exhaustive root-connected edge subsets', () => {
  for (const tree of weightedRootedCases()) {
    const parentEdge = Array.from({ length: tree.n }, (_, node) => (
      node === tree.root ? 0 : 1 + ((node * 5 + tree.n * 7) % 11)
    ))
    for (let edgeLimit = 0; edgeLimit <= Math.min(5, tree.n - 1); edgeLimit++) {
      const result = solveTreeKnapsack(tree, parentEdge, edgeLimit)
      assert.equal(
        result.ans,
        bruteTreeKnapsack(tree, parentEdge, edgeLimit),
        JSON.stringify({ parent: tree.parent, parentEdge, edgeLimit }),
      )
      assert.deepEqual([...result.order].sort((a, b) => a - b), Array.from({ length: tree.n }, (_, node) => node))
      const position = new Map(result.order.map((node, index) => [node, index]))
      for (let node = 0; node < tree.n; node++) {
        for (const child of tree.children[node]) assert.ok(position.get(child) < position.get(node))
      }
    }
  }
})

test('tree joint-weight public results match exhaustive distance-two node pairs', () => {
  for (const tree of weightedRootedCases(8, true)) {
    const result = solveTreeJointWeight(tree)
    const expected = bruteTreeJointWeight(tree)
    assert.equal(result.totalSum, expected.totalSum)
    assert.equal(result.globalMax, expected.globalMax)
  }
})

test('tree-DP public independent-set results match exhaustive node subsets', () => {
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
    solve: ({ parent, weight }) => solveTreeIndependentSet(buildRootedTree(parent, weight)),
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
    equivalent: (actual, expected) => actual.ans === expected,
    invariants: [(actual, { parent, weight }) => {
      const chosenWeight = [...actual.chosen].reduce((sum, node) => sum + weight[node], 0)
      assert.equal(chosenWeight, actual.ans)
      for (const node of actual.chosen) {
        assert.ok(node >= 0 && node < parent.length)
        assert.equal(parent[node] >= 0 && actual.chosen.has(parent[node]), false)
      }
    }],
  })
})

test('tree dominating-set witnesses have exactly the reported minimum cost', () => {
  for (const { parent, weight } of dominatingWitnessCases()) {
    const tree = buildRootedTree(parent, weight)
    const result = solveTreeDominatingSet(tree)
    const witnessCost = [...result.guards].reduce((sum, node) => sum + weight[node], 0)
    assert.equal(witnessCost, result.ans, `invalid guard cost for ${JSON.stringify({ parent, weight, guards: [...result.guards] })}`)
    assert.equal(result.ans, bruteDominatingSet(tree), `non-minimum guard set for ${JSON.stringify({ parent, weight })}`)
  }
})

test('tree dominating-set witnesses dominate every node', () => {
  for (const { parent, weight } of dominatingWitnessCases()) {
    const tree = buildRootedTree(parent, weight)
    const result = solveTreeDominatingSet(tree)
    for (let node = 0; node < tree.n; node++) {
      const dominated = result.guards.has(node)
        || (tree.parent[node] >= 0 && result.guards.has(tree.parent[node]))
        || tree.children[node].some((child) => result.guards.has(child))
      assert.equal(
        dominated,
        true,
        `node ${node} is not dominated for ${JSON.stringify({ parent, weight, guards: [...result.guards] })}`,
      )
    }
  }
})

test('score-tree public results match recursive root enumeration', () => {
  const cases = vectors([1, 2, 4], 6).filter((scores) => scores.length > 0)
  verifyCases({
    name: 'score-tree',
    cases,
    solve: solveScoreTree,
    oracle: bruteScoreTree,
    equivalent: (actual, expected) => actual.ans === expected,
    invariants: [(actual, scores) => {
      assert.equal(actual.dp.length, scores.length)
      assert.equal(actual.preorder.length, scores.length)
      assert.deepEqual([...actual.preorder].sort((a, b) => a - b), scores.map((_, index) => index + 1))
      const rebuild = (left, right) => {
        if (left > right) return { value: 1, preorder: [] }
        const node = actual.root[left][right]
        assert.ok(node >= left && node <= right)
        if (left === right) {
          assert.equal(node, left)
          return { value: scores[node], preorder: [node + 1] }
        }
        const lhs = rebuild(left, node - 1)
        const rhs = rebuild(node + 1, right)
        return {
          value: lhs.value * rhs.value + scores[node],
          preorder: [node + 1, ...lhs.preorder, ...rhs.preorder],
        }
      }
      const witness = rebuild(0, scores.length - 1)
      assert.equal(witness.value, actual.ans)
      assert.deepEqual(actual.preorder, witness.preorder)
    }],
  })
})

test('ring-interval public results match every rotated chain partition', () => {
  const cases = [...vectors([1, 2, 3], 5)].filter((values) => values.length > 0)
  for (const objective of ['min', 'max']) {
    verifyCases({
      name: `ring-interval-${objective}`,
      cases,
      solve: (values) => solveRingInterval(values, objective),
      oracle: (values) => {
        const windows = values.map((_, start) => bruteStone(
          [...values.slice(start), ...values.slice(0, start)],
          objective,
        ))
        return objective === 'min' ? Math.min(...windows) : Math.max(...windows)
      },
      equivalent: (actual, expected) => actual.cost === expected,
      invariants: [(actual, values) => {
        const expectedWindows = values.map((_, start) => bruteStone(
          [...values.slice(start), ...values.slice(0, start)],
          objective,
        ))
        assert.equal(actual.windows.length, values.length)
        assert.equal(actual.table.length, values.length * 2)
        assert.deepEqual(actual.windows, expectedWindows)
        assert.ok(actual.start >= 0 && actual.start < values.length)
        assert.equal(actual.windows[actual.start], actual.cost)
      }],
    })
  }
})

test('palindrome public results match exhaustive subsequences and insertion identity', () => {
  const cases = vectors(['a', 'b', 'c'], 7).filter((chars) => chars.length > 0)
  verifyCases({
    name: 'palindrome-lps',
    cases,
    solve: solvePalindromeLps,
    oracle: brutePalindromeLps,
    equivalent: (actual, expected) => actual.length === expected,
    invariants: [(actual, chars) => assert.equal(actual.table.length, chars.length)],
  })
  for (const raw of ['a', 'ab', 'abc', 'google', 'aebcbda']) {
    const result = solvePalindromeInsertion(raw)
    const isSubsequence = (source, target) => {
      let index = 0
      for (const char of target) if (char === source[index]) index++
      return index === source.length
    }
    assert.equal(result.insertCount, result.chars.length - brutePalindromeLps(result.chars))
    assert.equal(result.palindrome, [...result.palindrome].reverse().join(''))
    assert.equal(result.palindrome.length, result.chars.length + result.insertCount)
    assert.equal(isSubsequence(result.chars, result.palindrome), true)
    assert.equal(result.lps, result.chars.length - result.insertCount)
  }
})

test('interval-merge public results match recursive game and 248 references', () => {
  const cases = [...vectors([1, 2, 3], 6)].filter((values) => values.length > 0)
  verifyCases({
    name: 'take-ends',
    cases,
    solve: solveTakeEnds,
    oracle: bruteTakeEnds,
    equivalent: (actual, expected) => actual.difference === expected,
  })
  verifyCases({
    name: 'merge-248',
    cases,
    solve: solveMerge248,
    oracle: bruteMerge248,
    equivalent: (actual, expected) => actual.value === expected,
    invariants: [(actual, values) => {
      assert.ok(actual.bestStart >= 0 && actual.bestStart <= actual.bestEnd)
      assert.ok(actual.bestEnd < values.length)
      assert.equal(actual.table[actual.bestStart][actual.bestEnd], actual.value)
    }],
  })
})

test('bitmask-board public totals match exhaustive board placements', () => {
  for (let size = 1; size <= 3; size++) {
    for (let kings = 0; kings <= Math.min(4, size * size); kings++) {
      const result = solveKingsBoard(size, kings)
      assert.equal(result.total, bruteKingsBoard(size, kings), `${size}x${size}, K=${kings}`)
      assert.equal(result.layout === null, result.total === 0)
      if (result.layout !== null) {
        assert.equal(result.layout.length, size)
        const placed = result.layout.reduce((sum, row) => sum + row.toString(2).replaceAll('0', '').length, 0)
        assert.equal(placed, kings)
        for (let row = 0; row < size; row++) {
          const mask = result.layout[row]
          assert.equal(mask >>> size, 0)
          assert.equal((mask & (mask << 1)) === 0, true)
          if (row === 0) continue
          const previous = result.layout[row - 1]
          assert.equal((mask & previous) === 0, true)
          assert.equal((mask & (previous << 1)) === 0, true)
          assert.equal((mask & (previous >> 1)) === 0, true)
        }
      }
    }
  }
})

test('bitmask-cover public costs match exhaustive choice subsets', () => {
  const choices = [
    { cover: 0b0011, cost: 3 },
    { cover: 0b1100, cost: 4 },
    { cover: 0b0101, cost: 2 },
    { cover: 0b1010, cost: 5 },
  ]
  for (const subset of vectors(choices, choices.length)) {
    assert.equal(solveBitmaskCover(4, subset).cost, bruteBitmaskCover(4, subset))
  }
  assert.equal(solveBitmaskCover(1, [{ cover: 1, cost: 1_000_000_000 }]).cost, 1_000_000_000)
})

test('bitmask-subset public results enumerate every non-empty submask exactly once', () => {
  for (let source = 0; source < 1 << 8; source++) {
    const actual = solveBitmaskSubsets(source).subsets
    const expected = []
    for (let candidate = 1; candidate <= source; candidate++) {
      if ((candidate & source) === candidate) expected.push(candidate)
    }
    assert.deepEqual([...actual].sort((a, b) => a - b), expected)
    assert.equal(new Set(actual).size, actual.length)
  }
})

test('bitmask-TSP public results match exhaustive Hamilton paths', () => {
  const cases = [
    [[0]],
    [[0, 3], [3, 0]],
    [[0, 2, 5], [2, 0, 1], [5, 1, 0]],
    [[0, 4, 1, 7], [4, 0, 3, 2], [1, 3, 0, 6], [7, 2, 6, 0]],
  ]
  for (const distances of cases) {
    const result = solveBitmaskTsp(distances)
    assert.equal(result.distance, bruteBitmaskTsp(distances))
    assert.equal(result.table.length, 1 << distances.length)
    assert.ok(result.end >= 0 && result.end < distances.length)
    assert.equal(result.table[(1 << distances.length) - 1][result.end], result.distance)
    assert.equal(result.distance, Math.min(...result.table[(1 << distances.length) - 1]))
  }
})

test('Task 3 recorded runs share the exact public result implementations', () => {
  const scores = [5, 7, 1, 2, 10]
  assert.deepEqual(recordScoreTree(scores).result, solveScoreTree(scores))
  const ring = [3, 9, 3, 4]
  assert.deepEqual(recordRingInterval(ring).result, solveRingInterval(ring))
  const chars = [...'character']
  assert.deepEqual(recordPalindromeLps(chars).result, solvePalindromeLps(chars))
  assert.deepEqual(recordPalindromeInsertion('google').result, solvePalindromeInsertion('google'))
  const values = [1, 1, 2, 2]
  assert.deepEqual(recordTakeEnds(values).result, solveTakeEnds(values))
  assert.deepEqual(recordMerge248(values).result, solveMerge248(values))

  const rerootTree = buildRerootTree(5, [
    { u: 0, v: 1 }, { u: 0, v: 2 }, { u: 1, v: 3 }, { u: 1, v: 4 },
  ])
  assert.deepEqual(recordRerootDistance(rerootTree).result, solveRerootDistance(rerootTree))
  assert.deepEqual(recordRerootInOut(rerootTree).result, solveRerootInOut(rerootTree))
  assert.deepEqual(recordRerootEccentricity(rerootTree).result, solveRerootEccentricity(rerootTree))

  const tree = buildRootedTree([-1, 0, 0, 1, 1], [3, 6, 2, 5, 4])
  assert.deepEqual(recordTreeIndependentSet(tree).result, solveTreeIndependentSet(tree))
  assert.deepEqual(recordTreeDominatingSet(tree).result, solveTreeDominatingSet(tree))
  assert.deepEqual(recordTreeMaxSubtreeChain(tree).result, solveTreeMaxSubtreeChain(tree))
  assert.deepEqual(recordTreeKnapsack(tree, [0, 2, 3, 4, 5], 3).result, solveTreeKnapsack(tree, [0, 2, 3, 4, 5], 3))
  assert.deepEqual(recordTreeJointWeight(tree).result, solveTreeJointWeight(tree))
  assert.deepEqual(recordKingsBoard(4, 4).result, solveKingsBoard(4, 4))
  const choices = [{ cover: 0b011, cost: 2 }, { cover: 0b110, cost: 3 }]
  assert.deepEqual(recordBitmaskCover(3, choices).result, solveBitmaskCover(3, choices))
  assert.deepEqual(recordBitmaskSubsets(0b101101).result, solveBitmaskSubsets(0b101101))
  const distances = [[0, 2, 5], [2, 0, 1], [5, 1, 0]]
  assert.deepEqual(recordBitmaskTsp(distances).result, solveBitmaskTsp(distances))
})

test('Task 3 events remain immutable snapshots after later transitions', () => {
  assertEventSnapshots((emit) => executeScoreTree([5, 7, 1, 2], emit))
  assertEventSnapshots((emit) => executeRingInterval([3, 9, 3, 4], 'min', emit))
  assertEventSnapshots((emit) => executePalindromeLps([...'character'], emit))
  assertEventSnapshots((emit) => executePalindromeInsertion('google', emit))
  assertEventSnapshots((emit) => executeTakeEnds([4, 7, 2, 9], emit))
  assertEventSnapshots((emit) => executeMerge248([1, 1, 2, 2], emit))
  const rerootTree = buildRerootTree(5, [
    { u: 0, v: 1 }, { u: 0, v: 2 }, { u: 1, v: 3 }, { u: 1, v: 4 },
  ])
  assertEventSnapshots((emit) => executeRerootDistance(rerootTree, 'unweighted', emit))
  assertEventSnapshots((emit) => executeRerootInOut(rerootTree, emit))
  assertEventSnapshots((emit) => executeRerootEccentricity(rerootTree, emit))
  const tree = buildRootedTree([-1, 0, 0, 1, 1], [3, 6, 2, 5, 4])
  assertEventSnapshots((emit) => executeTreeIndependentSet(tree, emit))
  assertEventSnapshots((emit) => executeTreeDominatingSet(tree, emit))
  assertEventSnapshots((emit) => executeTreeMaxSubtreeChain(tree, emit))
  assertEventSnapshots((emit) => executeTreeKnapsack(tree, [0, 2, 3, 4, 5], 3, emit))
  assertEventSnapshots((emit) => executeTreeJointWeight(tree, emit))
  assertEventSnapshots((emit) => executeKingsBoard(4, 4, emit))
  assertEventSnapshots((emit) => executeBitmaskCover(3, [{ cover: 0b011, cost: 2 }, { cover: 0b110, cost: 3 }], emit))
  assertEventSnapshots((emit) => executeBitmaskSubsets(0b101101, emit))
  assertEventSnapshots((emit) => executeBitmaskTsp([[0, 2, 5], [2, 0, 1], [5, 1, 0]], emit))
})

test('Task 3 teaching Adapters preserve their public exports and result projections', () => {
  const scores = [5, 7, 1, 2, 10]
  assert.deepEqual(buildScoreTree(scores), solveScoreTree(scores))
  const scoreModel = scoreTree(scores)
  assertTeachingModel(scoreModel)
  assert.equal(scoreModel.frames.at(-1).values[0][scores.length - 1], solveScoreTree(scores).ans)

  const ring = [3, 9, 3, 4]
  const ringModel = ringMerge(ring)
  assertTeachingModel(ringModel)
  assert.equal(ringModel.frames.at(-1).values[solveRingInterval(ring).start][solveRingInterval(ring).start + ring.length - 1], solveRingInterval(ring).cost)

  const chars = [...'bcabb']
  const palindromeModel = palindromeLps(chars)
  assertTeachingModel(palindromeModel)
  assert.equal(palindromeModel.frames.at(-1).values[0][chars.length - 1], solvePalindromeLps(chars).length)
  const insertion = palindromeInsert('google')
  assert.equal(insertion.insertCount, solvePalindromeInsertion('google').insertCount)
  assert.equal(insertion.palindrome, solvePalindromeInsertion('google').palindrome)

  const values = [1, 1, 2, 2]
  const takeModel = takeEnds(values)
  const mergeModel = merge248(values)
  assertTeachingModel(takeModel)
  assertTeachingModel(mergeModel)
  assert.equal(takeModel.frames.at(-1).values[0][values.length - 1], solveTakeEnds(values).difference)
  const merged = solveMerge248(values)
  assert.equal(mergeModel.frames.at(-1).values[merged.bestStart][merged.bestEnd], merged.value)

  const rerootTree = buildRerootTree(4, [{ u: 0, v: 1 }, { u: 1, v: 2 }, { u: 1, v: 3 }])
  assert.deepEqual(rerootDistSum(rerootTree), solveRerootDistance(rerootTree))
  const tree = buildRootedTree([-1, 0, 0, 1], [3, 6, 2, 5])
  assert.equal(solveIndepSet(tree).ans, solveTreeIndependentSet(tree).ans)
  assert.equal(countKings(4, 4), solveKingsBoard(4, 4).total)
  assert.deepEqual(findOneLayout(4, 4), solveKingsBoard(4, 4).layout)
  const choices = [{ cover: 0b011, cost: 2 }, { cover: 0b110, cost: 3 }]
  assert.equal(solveCover(3, choices).ans, solveBitmaskCover(3, choices).cost)
  assert.deepEqual(enumerateSubsets(0b101101).map((step) => step.T), solveBitmaskSubsets(0b101101).subsets)
  const distances = [[0, 2, 5], [2, 0, 1], [5, 1, 0]]
  const tspModel = tspHamilton(3, distances)
  assertTeachingModel(tspModel)
  assert.equal(Math.min(...tspModel.frames.at(-1).values.at(-1).filter((value) => value !== null)), solveBitmaskTsp(distances).distance)
})
