import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const siteDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (...parts) => readFileSync(join(siteDir, ...parts), 'utf8')

const algorithmFiles = [
  ['src', 'algorithms', 'knapsack', 'index.ts'],
  ['src', 'algorithms', 'knapsack', 'internal.ts'],
  ['src', 'algorithms', 'knapsack-group', 'index.ts'],
  ['src', 'algorithms', 'knapsack-group', 'internal.ts'],
  ['src', 'algorithms', 'knapsack-multiple', 'index.ts'],
  ['src', 'algorithms', 'knapsack-multiple', 'internal.ts'],
  ['src', 'algorithms', 'knapsack-mixed', 'index.ts'],
  ['src', 'algorithms', 'knapsack-mixed', 'internal.ts'],
  ['src', 'algorithms', 'knapsack-cost2d', 'index.ts'],
  ['src', 'algorithms', 'knapsack-cost2d', 'internal.ts'],
  ['src', 'algorithms', 'knapsack-dependency', 'index.ts'],
  ['src', 'algorithms', 'knapsack-dependency', 'internal.ts'],
  ['src', 'algorithms', 'knapsack-variant', 'index.ts'],
  ['src', 'algorithms', 'knapsack-variant', 'internal.ts'],
  ['src', 'algorithms', 'lis', 'index.ts'],
  ['src', 'algorithms', 'lis', 'internal.ts'],
  ['src', 'algorithms', 'stone-merge', 'index.ts'],
  ['src', 'algorithms', 'stone-merge', 'internal.ts'],
  ['src', 'algorithms', 'max-subarray', 'index.ts'],
  ['src', 'algorithms', 'max-subarray', 'internal.ts'],
  ['src', 'algorithms', 'linear-count', 'index.ts'],
  ['src', 'algorithms', 'linear-count', 'internal.ts'],
  ['src', 'algorithms', 'edit-distance', 'index.ts'],
  ['src', 'algorithms', 'edit-distance', 'internal.ts'],
  ['src', 'algorithms', 'lcs', 'index.ts'],
  ['src', 'algorithms', 'lcs', 'internal.ts'],
  ['src', 'algorithms', 'two-path', 'index.ts'],
  ['src', 'algorithms', 'two-path', 'internal.ts'],
  ['src', 'algorithms', 'grid-path', 'index.ts'],
  ['src', 'algorithms', 'grid-path', 'internal.ts'],
  ['src', 'algorithms', 'max-square', 'index.ts'],
  ['src', 'algorithms', 'max-square', 'internal.ts'],
  ['src', 'algorithms', 'linear-fsm', 'index.ts'],
  ['src', 'algorithms', 'linear-fsm', 'internal.ts'],
]

test('algorithm result Modules stay independent from teaching and React', () => {
  for (const parts of algorithmFiles) {
    const path = join(siteDir, ...parts)
    assert.equal(existsSync(path), true, `${parts.join('/')} must exist`)
    const source = read(...parts)
    assert.doesNotMatch(source, /dp-engine|react|VizModel|caption|formula|CellState/)
  }
})

test('games consume public result Interfaces instead of private solvers', () => {
  const contracts = [
    ['PackMasterGame.tsx', /algorithms\/knapsack\/index\.ts/, /function\s+solveOpt\b/],
    ['LISChainGame.tsx', /algorithms\/lis\/index\.ts/, /function\s+solveLIS\b/],
    ['StoneMergeGame.tsx', /algorithms\/stone-merge\/index\.ts/, /function\s+solveMin\b/],
  ]
  for (const [file, publicImport, privateSolver] of contracts) {
    const source = read('src', 'components', 'games', file)
    assert.match(source, publicImport)
    assert.doesNotMatch(source, privateSolver)
    assert.doesNotMatch(source, /algorithms\/.+\/internal\.ts/)
  }
})

test('teaching solvers are event Adapters over the shared Implementation', () => {
  const adapters = [
    ['knapsack', 'solvers.ts', /algorithms\/knapsack\/internal\.ts/],
    ['knapsack', 'groupSolver.ts', /algorithms\/knapsack-group\/internal\.ts/],
    ['knapsack', 'groupOrderSolver.ts', /algorithms\/knapsack-group\/internal\.ts/],
    ['knapsack', 'multipleSolver.ts', /algorithms\/knapsack-multiple\/internal\.ts/],
    ['knapsack', 'mixedSolver.ts', /algorithms\/knapsack-mixed\/internal\.ts/],
    ['knapsack', 'cost2dSolver.ts', /algorithms\/knapsack-cost2d\/internal\.ts/],
    ['knapsack', 'dependencySolver.ts', /algorithms\/knapsack-dependency\/internal\.ts/],
    ['knapsack', 'variantSolver.ts', /algorithms\/knapsack-variant\/internal\.ts/],
    ['knapsack', 'variantUndoSolver.ts', /algorithms\/knapsack-variant\/internal\.ts/],
    ['lis', 'lisSolver.ts', /algorithms\/lis\/internal\.ts/],
    ['interval', 'stoneSolver.ts', /algorithms\/stone-merge\/internal\.ts/],
    ['linear', 'maxsegSolver.ts', /algorithms\/max-subarray\/internal\.ts/],
    ['linear', 'countSolver.ts', /algorithms\/linear-count\/internal\.ts/],
    ['grid', 'editSolver.ts', /algorithms\/edit-distance\/internal\.ts/],
    ['grid', 'lcsSolver.ts', /algorithms\/lcs\/internal\.ts/],
    ['grid', 'twoPathSolver.ts', /algorithms\/two-path\/internal\.ts/],
    ['grid', 'pathSolver.ts', /algorithms\/grid-path\/internal\.ts/],
    ['grid', 'maxSquareSolver.ts', /algorithms\/max-square\/internal\.ts/],
    ['fsm', 'fsmSolver.ts', /algorithms\/linear-fsm\/(?:index|internal)\.ts/],
  ]
  for (const [family, file, internalImport] of adapters) {
    assert.match(read('src', 'components', 'demos', family, file), internalImport)
  }
})

test('linear, grid, and FSM teaching Adapters do not retain private transition loops', () => {
  const contracts = [
    ['linear', 'maxsegSolver.ts', /for\s*\(let\s+i\s*=\s*0;\s*i\s*<\s*n/],
    ['linear', 'countSolver.ts', /for\s*\(let\s+i\s*=\s*2;\s*i\s*<=\s*n/],
    ['grid', 'editSolver.ts', /for\s*\(let\s+i\s*=\s*1;\s*i\s*<=\s*m/],
    ['grid', 'lcsSolver.ts', /for\s*\(let\s+i\s*=\s*1;\s*i\s*<=\s*m/],
    ['grid', 'twoPathSolver.ts', /for\s*\(let\s+k\s*=\s*1;\s*k\s*<=\s*steps/],
    ['grid', 'pathSolver.ts', /for\s*\(let\s+i\s*=\s*n\s*-\s*2/],
    ['grid', 'maxSquareSolver.ts', /for\s*\(let\s+i\s*=\s*0;\s*i\s*<\s*R/],
    ['fsm', 'fsmSolver.ts', /for\s*\(let\s+i\s*=\s*1;\s*i\s*<=\s*n/],
  ]
  for (const [family, file, privateLoop] of contracts) {
    assert.doesNotMatch(read('src', 'components', 'demos', family, file), privateLoop)
  }
})

test('knapsack teaching Adapters do not retain private transition loops', () => {
  const contracts = [
    ['groupSolver.ts', /for\s*\(let\s+g\s*=\s*1/],
    ['groupOrderSolver.ts', /for\s*\(let\s+g\s*=\s*1/],
    ['multipleSolver.ts', /for\s*\(let\s+p\s*=\s*0/],
    ['mixedSolver.ts', /for\s*\(let\s+u\s*=\s*0/],
    ['cost2dSolver.ts', /for\s*\(let\s+i\s*=\s*0;\s*i\s*<\s*items\.length/],
    ['dependencySolver.ts', /for\s*\(let\s+j\s*=\s*0;\s*j\s*<=\s*W/],
    ['variantSolver.ts', /for\s*\(let\s+i\s*=\s*0;\s*i\s*<\s*items\.length/],
    ['variantUndoSolver.ts', /for\s*\(let\s+i\s*=\s*0;\s*i\s*<\s*n/],
  ]
  for (const [file, privateLoop] of contracts) {
    assert.doesNotMatch(read('src', 'components', 'demos', 'knapsack', file), privateLoop)
  }
})

test('migrated readouts no longer reverse-engineer answers from teaching frames', () => {
  for (const parts of [
    ['src', 'components', 'demos', 'lis', 'LISDemo.tsx'],
    ['src', 'components', 'demos', 'interval', 'StoneMinMaxDemo.tsx'],
  ]) {
    assert.doesNotMatch(read(...parts), /frames\s*\[|\.frames\s*\[/)
  }
})
