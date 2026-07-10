import type { Arrow, CellState, Frame, VizModel } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import type { RingObjective } from '../../../algorithms/ring-interval/index.ts'
import { recordRingInterval } from '../../../algorithms/ring-interval/internal.ts'

export type Opt = RingObjective

function settled(table: (number | null)[][]): Record<string, CellState> {
  const states: Record<string, CellState> = {}
  for (let row = 0; row < table.length; row++) {
    for (let column = 0; column < table[row].length; column++) {
      if (table[row][column] !== null) states[key(row, column)] = 'settled'
    }
  }
  return states
}

export function ringMerge(values: number[], objective: Opt = 'min'): VizModel {
  const run = recordRingInterval(values, objective)
  const n = values.length
  const size = n * 2
  const table = Array.from({ length: size }, () => Array<number | null>(size).fill(null))
  for (let index = 0; index < size; index++) table[index][index] = 0
  const snapshot = () => table.map((row) => row.slice())
  const optimum = objective === 'min' ? '最小' : '最大'
  const operator = objective === 'min' ? '\\min' : '\\max'
  const frames: Frame[] = [{
    values: snapshot(),
    states: settled(table),
    caption: `<b>断环为链</b>：把 ${n} 堆复制一倍成长度 2n=${size} 的链；对角线 dp[l][l]=0。`,
    formula: 'a2[i]=a[i\\bmod n],\\quad dp[l][l]=0',
  }]
  for (const event of run.events) {
    table[event.left][event.right] = event.value
    const states = settled(table)
    states[key(event.left, event.split)] = 'chosen'
    states[key(event.split + 1, event.right)] = 'chosen'
    states[key(event.left, event.right)] = 'current'
    const arrows: Arrow[] = [
      { from: { r: event.left, c: event.split }, to: { r: event.left, c: event.right }, kind: 'chosen' },
      { from: { r: event.split + 1, c: event.right }, to: { r: event.left, c: event.right }, kind: 'chosen' },
    ]
    frames.push({
      values: snapshot(),
      states,
      arrows,
      active: { r: event.left, c: event.right },
      caption: `区间 <b>[${event.left},${event.right}]</b>：分割代价取${optimum} ${event.splitValue}，加区间和 ${event.sum} → <b>${event.value}</b>（k=${event.split}）。${event.isWindow ? '这是一个完整环形窗口。' : ''}`,
      formula: `dp[${event.left}][${event.right}]=${operator}_k(dp[l][k]+dp[k+1][r])+${event.sum}=${event.value}`,
    })
  }
  const finalStates = settled(table)
  for (let start = 0; start < n; start++) finalStates[key(start, start + n - 1)] = 'source'
  finalStates[key(run.result.start, run.result.start + n - 1)] = 'chosen'
  frames.push({
    values: snapshot(),
    states: finalStates,
    caption: `扫描 ${n} 个整圈窗口，取${optimum} → <b>环形答案 = ${run.result.cost}</b>（起点 ${run.result.start}）。`,
    formula: `\\mathrm{ans}=${operator}_{0\\le i<${n}}dp[i][i+${n}-1]=${run.result.cost}`,
  })
  return {
    rows: size,
    cols: size,
    cell: 38,
    rowHeaderLabels: Array.from({ length: size }, (_, index) => `l=${index}`),
    colHeaderLabels: Array.from({ length: size }, (_, index) => `r=${index}`),
    frames,
  }
}
