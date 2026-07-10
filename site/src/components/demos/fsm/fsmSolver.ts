import type { Arrow, CellState, Frame, VizModel } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { solveStockFsm, type StockDay } from '../../../algorithms/linear-fsm/index.ts'
import { recordLinearFsm } from '../../../algorithms/linear-fsm/internal.ts'

export type { StockDay } from '../../../algorithms/linear-fsm/index.ts'

function settled(values: (number | null)[][]): Record<string, CellState> {
  const states: Record<string, CellState> = {}
  for (let row = 0; row < values.length; row++) {
    for (let column = 0; column < values[row].length; column++) {
      if (values[row][column] !== null) states[key(row, column)] = 'settled'
    }
  }
  return states
}

export function fsmPickTable(values: number[]): VizModel {
  const run = recordLinearFsm(values)
  const table: (number | null)[][] = Array.from({ length: 2 }, () => Array<number | null>(values.length + 1).fill(null))
  table[0][0] = 0
  table[1][0] = 0
  const snap = (): (number | null)[][] => table.map((row) => row.slice())
  const frames: Frame[] = [{
    values: snap(),
    states: settled(table),
    caption: '<b>哨兵起点</b>：尚未考虑元素时，「不选」与「选」两状态的最优值都是 0。',
    formula: 'dp[0][0]=dp[0][1]=0',
  }]
  for (const event of run.events) {
    const position = event.position
    table[0][position] = event.skip
    table[1][position] = event.pick
    {
      const states = settled(table)
      states[key(0, position - 1)] = event.skipFrom === 0 ? 'chosen' : 'source'
      states[key(1, position - 1)] = event.skipFrom === 1 ? 'chosen' : 'source'
      states[key(0, position)] = 'current'
      const arrows: Arrow[] = [
        { from: { r: 0, c: position - 1 }, to: { r: 0, c: position }, kind: event.skipFrom === 0 ? 'chosen' : 'source' },
        { from: { r: 1, c: position - 1 }, to: { r: 0, c: position }, kind: event.skipFrom === 1 ? 'chosen' : 'source' },
      ]
      frames.push({
        values: snap(),
        states,
        active: { r: 0, c: position },
        arrows,
        caption: `位置 <b>${position}</b> · 不选：上一列两状态 ${event.previousSkip} 与 ${event.previousPick} 取较大者 <b>${event.skip}</b>。`,
        formula: `dp[${position}][0]=\\max(${event.previousSkip},${event.previousPick})=${event.skip}`,
      })
    }
    {
      const states = settled(table)
      states[key(0, position - 1)] = 'chosen'
      states[key(1, position)] = 'current'
      const arrows: Arrow[] = [
        { from: { r: 0, c: position - 1 }, to: { r: 1, c: position }, kind: 'chosen' },
      ]
      frames.push({
        values: snap(),
        states,
        active: { r: 1, c: position },
        arrows,
        caption: `位置 <b>${position}</b> · 选：只能从前一位置的「不选」转来，加上 ${event.value} 得 <b>${event.pick}</b>。`,
        formula: `dp[${position}][1]=${event.previousSkip}+${event.value}=${event.pick}`,
      })
    }
  }
  const finalStates = settled(table)
  finalStates[key(run.result.finalState, values.length)] = 'chosen'
  finalStates[key(1 - run.result.finalState, values.length)] = 'source'
  frames.push({
    values: snap(),
    states: finalStates,
    caption: `末列两状态取较大者，答案是 <b>${run.result.value}</b>。`,
    formula: `\\text{ans}=\\max(dp[${values.length}][0],dp[${values.length}][1])=${run.result.value}`,
  })
  return {
    rows: 2,
    cols: values.length + 1,
    cell: 46,
    rowHeaderLabels: ['不选', '选'],
    colHeaderLabels: Array.from({ length: values.length + 1 }, (_, index) => index === 0 ? '起' : `a${index}`),
    frames,
  }
}

export function stockStates(prices: number[], cooldown: boolean): StockDay[] {
  return solveStockFsm(prices, cooldown).days
}

export function stockBestProfit(prices: number[]): number {
  return solveStockFsm(prices, false).profit
}
