import type { Arrow, CellState, Frame, VizModel } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { recordMaxSquare } from '../../../algorithms/max-square/internal.ts'

function settled(values: (number | null)[][]): Record<string, CellState> {
  const states: Record<string, CellState> = {}
  for (let row = 0; row < values.length; row++) {
    for (let column = 0; column < values[row].length; column++) {
      if (values[row][column] !== null) states[key(row, column)] = 'settled'
    }
  }
  return states
}

export function maxSquare2D(grid: number[][]): VizModel {
  const run = recordMaxSquare(grid)
  const rows = grid.length
  const columns = grid[0].length
  const table: (number | null)[][] = Array.from({ length: rows }, () => Array<number | null>(columns).fill(null))
  const snap = (): (number | null)[][] => table.map((row) => row.slice())
  const frames: Frame[] = [{
    values: snap(),
    states: {},
    caption: '为每一格计算以它为右下角的全 1 最大正方形边长；上、左、左上三处的短板决定能扩多大。',
    formula: 'dp[i][j]=\\min(dp[i-1][j],\\ dp[i][j-1],\\ dp[i-1][j-1])+1',
  }]
  for (const event of run.events) {
    table[event.row][event.column] = event.side
    const states = settled(table)
    const arrows: Arrow[] = []
    if (event.bit === 0) {
      states[key(event.row, event.column)] = 'invalid'
    } else if (event.row > 0 && event.column > 0) {
      const sources = [
        { row: event.row - 1, column: event.column, name: 'up' },
        { row: event.row, column: event.column - 1, name: 'left' },
        { row: event.row - 1, column: event.column - 1, name: 'diagonal' },
      ] as const
      for (const source of sources) {
        const chosen = source.name === event.bottleneck
        states[key(source.row, source.column)] = chosen ? 'chosen' : 'source'
        arrows.push({
          from: { r: source.row, c: source.column },
          to: { r: event.row, c: event.column },
          kind: chosen ? 'chosen' : 'source',
        })
      }
      states[key(event.row, event.column)] = 'current'
    } else {
      states[key(event.row, event.column)] = 'current'
    }
    const caption = event.bit === 0
      ? `格 <b>(${event.row},${event.column})</b> 是 0，不能作为全 1 正方形右下角。`
      : event.row === 0 || event.column === 0
        ? `格 <b>(${event.row},${event.column})</b> 在首行或首列，边长为 <b>1</b>。`
        : `格 <b>(${event.row},${event.column})</b>：上 ${event.up}、左 ${event.left}、左上 ${event.diagonal} 的最小值加 1，得到 <b>${event.side}</b>。`
    const formula = event.bit === 0
      ? `dp[${event.row}][${event.column}]=0`
      : event.row === 0 || event.column === 0
        ? `dp[${event.row}][${event.column}]=1`
        : `dp[${event.row}][${event.column}]=\\min(${event.up},${event.left},${event.diagonal})+1=${event.side}`
    frames.push({
      values: snap(),
      states,
      active: { r: event.row, c: event.column },
      arrows,
      caption,
      formula,
    })
  }
  const finalStates = settled(table)
  if (run.result.bottomRight !== null) {
    const { row: bottom, column: right } = run.result.bottomRight
    for (let row = bottom - run.result.side + 1; row <= bottom; row++) {
      for (let column = right - run.result.side + 1; column <= right; column++) {
        finalStates[key(row, column)] = 'chosen'
      }
    }
    finalStates[key(bottom, right)] = 'current'
  }
  frames.push({
    values: snap(),
    states: finalStates,
    caption: `全表最大边长是 <b>${run.result.side}</b>，面积为 <b>${run.result.area}</b>。`,
    formula: `\\text{area}=${run.result.side}^2=${run.result.area}`,
  })
  return {
    rows,
    cols: columns,
    cell: 42,
    rowHeaderLabels: Array.from({ length: rows }, (_, row) => `${row}`),
    colHeaderLabels: Array.from({ length: columns }, (_, column) => `${column}`),
    rowHeaderTitle: '行',
    colHeaderTitle: '列',
    frames,
  }
}
