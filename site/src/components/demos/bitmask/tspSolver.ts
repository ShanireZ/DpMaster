import type { Arrow, CellState, Frame, VizModel } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { formatBitmask } from '../../../algorithms/bitmask-tsp/index.ts'
import { recordBitmaskTsp } from '../../../algorithms/bitmask-tsp/internal.ts'

export function maskBits(mask: number, width: number): string {
  return formatBitmask(mask, width)
}

export function tspHamilton(n: number, distances: number[][]): VizModel {
  if (n !== distances.length) throw new RangeError('TSP point count must match the distance matrix')
  const run = recordBitmaskTsp(distances)
  const states = 1 << n
  const table = Array.from({ length: states }, () => Array<number>(n).fill(Number.POSITIVE_INFINITY))
  table[1][0] = 0
  const values = (): (number | null)[][] => table.map((row) => row.map((value) => Number.isFinite(value) ? value : null))
  const settled = (): Record<string, CellState> => {
    const cellStates: Record<string, CellState> = {}
    for (let mask = 0; mask < states; mask++) {
      for (let node = 0; node < n; node++) if (Number.isFinite(table[mask][node])) cellStates[key(mask, node)] = 'settled'
    }
    return cellStates
  }
  const initialStates = settled()
  initialStates[key(1, 0)] = 'chosen'
  const frames: Frame[] = [{
    values: values(),
    states: initialStates,
    caption: '<b>起点</b>：dp[0001][0]=0，只访问点 0 并停在点 0。',
    formula: 'dp[\\{0\\}][0]=0',
  }]
  for (const event of run.events) {
    if (event.updated) table[event.nextMask][event.to] = event.value
    const cellStates = settled()
    cellStates[key(event.mask, event.from)] = 'source'
    cellStates[key(event.nextMask, event.to)] = 'current'
    const arrows: Arrow[] = [{
      from: { r: event.mask, c: event.from },
      to: { r: event.nextMask, c: event.to },
      kind: event.updated ? 'chosen' : 'source',
    }]
    frames.push({
      values: values(),
      states: cellStates,
      active: { r: event.nextMask, c: event.to },
      arrows,
      caption: `从 dp[${maskBits(event.mask, n)}][${event.from}]=<b>${event.base}</b> 走向点 <b>${event.to}</b>：候选 ${event.base}+${event.edge}=<b>${event.candidate}</b>，${event.updated ? '更新' : `不优于 ${event.value}`}。`,
      formula: `dp[S\\cup\\{${event.to}\\}][${event.to}]=\\min(\\cdot,${event.candidate})`,
    })
  }
  const finalStates = settled()
  finalStates[key(states - 1, run.result.end)] = 'chosen'
  frames.push({
    values: values(),
    states: finalStates,
    caption: `访问全部 ${n} 个点后，最短 Hamilton 路径长度为 <b>${run.result.distance}</b>（停在点 ${run.result.end}）。`,
    formula: `\\min_i dp[2^${n}-1][i]=${run.result.distance}`,
  })
  return {
    rows: states,
    cols: n,
    cell: 44,
    rowHeaderLabels: Array.from({ length: states }, (_, mask) => maskBits(mask, n)),
    colHeaderLabels: Array.from({ length: n }, (_, node) => `${node}`),
    frames,
  }
}
