import { useCallback, useMemo, useState } from 'react'
import { browserRandom, createRandomSeed } from './random'

interface RoundSeed {
  seed: number
  revision: number
}

function normalizeSeed(seed: number): number {
  return Number.isFinite(seed) ? Math.trunc(seed) >>> 0 : 0
}

export function useRoundSeed(): {
  seed: number
  next(): void
  replay(seed: number): void
} {
  const [round, setRound] = useState<RoundSeed>(() => ({
    seed: createRandomSeed(browserRandom),
    revision: 0,
  }))
  const next = useCallback(() => {
    setRound((current) => ({
      seed: createRandomSeed(browserRandom),
      revision: current.revision + 1,
    }))
  }, [])
  const replay = useCallback((seed: number) => {
    setRound((current) => ({
      seed: normalizeSeed(seed),
      revision: current.revision + 1,
    }))
  }, [])
  return useMemo(() => ({ seed: round.seed, next, replay }), [next, replay, round])
}
