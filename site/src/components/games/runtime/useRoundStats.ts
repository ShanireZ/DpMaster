import { useCallback, useMemo, useState } from 'react'
import { INITIAL_ROUND_STATS, recordRound, startRound } from './round'
import type { RoundStats } from './round'

export function useRoundStats(): {
  stats: RoundStats
  record(matched: boolean): void
  start(): void
} {
  const [stats, setStats] = useState<RoundStats>({ ...INITIAL_ROUND_STATS })
  const record = useCallback((matched: boolean) => {
    setStats((current) => recordRound(current, matched))
  }, [])
  const start = useCallback(() => {
    setStats((current) => startRound(current))
  }, [])

  return useMemo(() => ({ stats, record, start }), [record, start, stats])
}
