import type { CellState, Frame, VizModel } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { recordTwoPath } from '../../../algorithms/two-path/internal.ts'

export function twoPath2D(grid: number[][]): VizModel {
  const run = recordTwoPath(grid)
  const rows = grid.length
  const columns = grid[0].length
  const render: (number | null)[][] = Array.from({ length: rows }, () => Array<number | null>(rows).fill(null))
  const snap = (): (number | null)[][] => render.map((row) => row.slice())
  const frames: Frame[] = [{
    values: snap(),
    states: {},
    caption: '<b>准备</b>：两条路同步从左上出发，同一步数时都在反对角线 x+y=k 上；表格记录两条路当前行号组成的状态。',
    formula: 'dp[k][x_1][x_2]=\\max_{4\\text{ prev}}dp[k-1]+a[x_1][y_1]+a[x_2][y_2]',
  }]
  let shownStep = -1
  for (const event of run.events) {
    if (event.step !== shownStep) {
      for (const row of render) row.fill(null)
      shownStep = event.step
    }
    render[event.rowOne][event.rowTwo] = event.value
    const states: Record<string, CellState> = {}
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < rows; column++) {
        if (render[row][column] !== null) states[key(row, column)] = 'settled'
      }
    }
    states[key(event.rowOne, event.rowTwo)] = 'current'
    const cellDescription = `路1→(${event.rowOne},${event.columnOne})，路2→(${event.rowTwo},${event.columnTwo})`
    const additionDescription = event.sameCell
      ? `两路同格，权值 ${event.addition} 只算一次`
      : `两格权值合计 ${event.addition}`
    frames.push({
      values: snap(),
      states,
      active: { r: event.rowOne, c: event.rowTwo },
      caption: `<b>k = ${event.step}</b>：${cellDescription}。上一步最优值 <b>${event.previousValue}</b>，${additionDescription} → <b>${event.value}</b>。`,
      formula: `dp[${event.step}][${event.rowOne}][${event.rowTwo}]=${event.previousValue}+${event.addition}=${event.value}`,
    })
  }
  const finalStates: Record<string, CellState> = {}
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < rows; column++) {
      if (render[row][column] !== null) finalStates[key(row, column)] = 'settled'
    }
  }
  finalStates[key(rows - 1, rows - 1)] = 'chosen'
  const lastStep = rows + columns - 2
  frames.push({
    values: snap(),
    states: finalStates,
    caption: `<b>终点</b>：两条路都到达 (${rows - 1},${columns - 1})，最大权值和为 <b>${run.result.value}</b>。`,
    formula: `dp[${lastStep}][${rows - 1}][${rows - 1}]=${run.result.value}`,
  })
  return {
    rows,
    cols: rows,
    cell: 46,
    rowHeaderLabels: Array.from({ length: rows }, (_, row) => `x1=${row}`),
    colHeaderLabels: Array.from({ length: rows }, (_, row) => `x2=${row}`),
    rowHeaderTitle: '路1行',
    colHeaderTitle: '路2行',
    frames,
  }
}
