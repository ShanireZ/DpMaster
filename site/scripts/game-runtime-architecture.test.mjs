import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const components = new URL('../src/components/', import.meta.url)

async function source(path) {
  return readFile(new URL(path, components), 'utf8')
}

test('game audio creates one compatible context only inside an unmuted play call', async () => {
  const audio = await source('games/runtime/audio.ts')
  const playStart = audio.indexOf('export function playGameTone')
  const constructor = audio.indexOf('new AudioContextConstructor')

  assert.ok(playStart >= 0)
  assert.ok(constructor > playStart, 'AudioContext must not be constructed at module evaluation')
  assert.match(audio, /let sharedContext: AudioContext \| null = null/)
  assert.match(audio, /if \(muted \|\| typeof window === ['"]undefined['"]\) return/)
  assert.match(audio, /webkitAudioContext/)
  assert.match(audio, /sharedContext \?\?=/)
  assert.match(audio, /\.resume\(\)/)
})

test('DeferredGame becomes ready once near the viewport without a manual fallback', async () => {
  const deferred = await source('games/runtime/DeferredGame.tsx')

  assert.match(deferred, /useState\(false\)/)
  assert.match(deferred, /rootMargin:\s*['"]400px 0px['"]/)
  assert.match(deferred, /['"]IntersectionObserver['"] in window/)
  assert.match(deferred, /entry\.isIntersecting/)
  assert.match(deferred, /observer\.disconnect\(\)/)
  assert.match(deferred, /aria-busy=\{!ready\}/)
  assert.doesNotMatch(deferred, /<button/)
})

test('PartPage gates its catalog-owned lazy game behind DeferredGame', async () => {
  const page = await source('../pages/PartPage.tsx')
  assert.match(page, /import \{ DeferredGame \}/)
  assert.match(page, /<DeferredGame[^>]*label=/)
  assert.match(page, /<Suspense[\s\S]*<Game \/>[\s\S]*<\/Suspense>/)
})

test('useRoundSeed exposes only the current seed, next, and replay controls', async () => {
  const hook = await source('games/runtime/useRoundSeed.ts')
  assert.match(hook, /export function useRoundSeed\(\):\s*\{/)
  assert.match(hook, /seed: number/)
  assert.match(hook, /next\(\): void/)
  assert.match(hook, /replay\(seed: number\): void/)
  assert.match(hook, /createRandomSeed\(browserRandom\)/)
  assert.match(hook, /return useMemo\(/)
  assert.match(hook, /seed: round\.seed/)
})

test('all seven games use shared audio and avoid direct random globals', async () => {
  const paths = [
    'games/PackMasterGame.tsx',
    'games/LISChainGame.tsx',
    'games/StoneMergeGame.tsx',
    'games/PowerAccelGame.tsx',
    'games/RerootGame.tsx',
    'games/TreePartyGame.tsx',
    'games/BitBoardGame.tsx',
  ]
  for (const path of paths) {
    const game = await source(path)
    assert.match(game, /playGameTone/, `${path} must use shared audio`)
    assert.doesNotMatch(game, /AudioContext|function blip|\bblip\(/)
    assert.doesNotMatch(game, /Math\.random/)
    assert.doesNotMatch(game, /countedThisRound/)
  }
})

test('random game round builders accept RandomSource and components seed every round', async () => {
  const games = [
    ['games/PackMasterGame.tsx', 'buildPackRound'],
    ['games/LISChainGame.tsx', 'buildSequenceRound'],
    ['games/StoneMergeGame.tsx', 'buildStoneRound'],
    ['games/PowerAccelGame.tsx', 'buildExponentRound'],
    ['games/RerootGame.tsx', 'buildTreeRound'],
    ['games/TreePartyGame.tsx', 'buildPartyRound'],
  ]
  for (const [path, builder] of games) {
    const game = await source(path)
    assert.match(game, new RegExp(`export function ${builder}\\([^)]*random: RandomSource`))
    assert.doesNotMatch(game, /browserRandom/)
    assert.match(game, /useRoundSeed/)
    assert.match(game, /createSeededRandom\(/)
    assert.match(game, /roundSeed\.next\(\)/)
    assert.match(game, /roundSeed\.replay\(roundSeed\.seed\)/)
    assert.match(game, /种子 \{roundSeed\.seed\}/)
  }
})

test('all seven games with round totals share the duplicate-safe statistics hook', async () => {
  const paths = [
    'games/PackMasterGame.tsx',
    'games/LISChainGame.tsx',
    'games/StoneMergeGame.tsx',
    'games/PowerAccelGame.tsx',
    'games/RerootGame.tsx',
    'games/TreePartyGame.tsx',
    'games/BitBoardGame.tsx',
  ]
  for (const path of paths) {
    const game = await source(path)
    assert.match(game, /useRoundStats/)
    assert.doesNotMatch(game, /\[played, setPlayed\]/)
    assert.doesNotMatch(game, /\[matched, setMatched\]/)
    assert.match(game, /round\.record\(/)
    assert.match(game, /(?:round\.start|startRound)\(\)/)
  }
})
