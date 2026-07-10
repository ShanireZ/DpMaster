import type { EventSink, RecordedRun } from '../contracts.ts'
import type { BitmaskTspResult } from './index.ts'

export interface BitmaskTspEvent {
  type: 'transition'
  mask: number
  from: number
  to: number
  nextMask: number
  base: number
  edge: number
  candidate: number
  before: number
  updated: boolean
  value: number
}

export function executeBitmaskTsp(
  distances: readonly (readonly number[])[],
  emit: EventSink<BitmaskTspEvent>,
): BitmaskTspResult {
  const n = distances.length
  if (n < 1 || n > 20) throw new RangeError('TSP requires between 1 and 20 points')
  for (const row of distances) {
    if (row.length !== n) throw new RangeError('TSP distance matrix must be square')
    for (const value of row) if (!Number.isFinite(value)) throw new RangeError('TSP distances must be finite')
  }
  const states = 1 << n
  const table = Array.from({ length: states }, () => Array<number>(n).fill(Number.POSITIVE_INFINITY))
  table[1][0] = 0
  for (let mask = 1; mask < states; mask++) {
    if ((mask & 1) === 0) continue
    for (let from = 0; from < n; from++) {
      if ((mask & (1 << from)) === 0 || !Number.isFinite(table[mask][from])) continue
      const base = table[mask][from]
      for (let to = 0; to < n; to++) {
        if ((mask & (1 << to)) !== 0) continue
        const nextMask = mask | (1 << to)
        const candidate = base + distances[from][to]
        const before = table[nextMask][to]
        const updated = candidate < before
        if (updated) table[nextMask][to] = candidate
        emit({
          type: 'transition',
          mask,
          from,
          to,
          nextMask,
          base,
          edge: distances[from][to],
          candidate,
          before,
          updated,
          value: table[nextMask][to],
        })
      }
    }
  }
  const final = table[states - 1]
  let distance = Number.POSITIVE_INFINITY
  let end = 0
  for (let node = 0; node < n; node++) {
    if (final[node] < distance) {
      distance = final[node]
      end = node
    }
  }
  return { distance, end, table }
}

export function recordBitmaskTsp(
  distances: readonly (readonly number[])[],
): RecordedRun<BitmaskTspResult, BitmaskTspEvent> {
  const events: BitmaskTspEvent[] = []
  const result = executeBitmaskTsp(distances, (event) => events.push(event))
  return { result, events }
}
