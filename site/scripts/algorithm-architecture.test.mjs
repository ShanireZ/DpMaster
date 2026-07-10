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
  ['src', 'algorithms', 'lis', 'index.ts'],
  ['src', 'algorithms', 'lis', 'internal.ts'],
  ['src', 'algorithms', 'stone-merge', 'index.ts'],
  ['src', 'algorithms', 'stone-merge', 'internal.ts'],
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
    ['lis', 'lisSolver.ts', /algorithms\/lis\/internal\.ts/],
    ['interval', 'stoneSolver.ts', /algorithms\/stone-merge\/internal\.ts/],
  ]
  for (const [family, file, internalImport] of adapters) {
    assert.match(read('src', 'components', 'demos', family, file), internalImport)
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

