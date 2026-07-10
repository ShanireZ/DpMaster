export interface RoundStats {
  played: number
  matched: number
  counted: boolean
}

export const INITIAL_ROUND_STATS: Readonly<RoundStats> = {
  played: 0,
  matched: 0,
  counted: false,
}

export function recordRound(state: RoundStats, matched: boolean): RoundStats {
  if (state.counted) return state
  return {
    played: state.played + 1,
    matched: state.matched + (matched ? 1 : 0),
    counted: true,
  }
}

export function startRound(state: RoundStats): RoundStats {
  if (!state.counted) return state
  return { ...state, counted: false }
}
