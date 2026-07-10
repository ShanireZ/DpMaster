import type { Arrow, CellState, Frame, VizModel } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { recordGridPathCount, recordTrianglePath } from '../../../algorithms/grid-path/internal.ts'

function settled(values: (number | null)[][]): Record<string, CellState> {
  const states: Record<string, CellState> = {}
  for (let row = 0; row < values.length; row++) {
    for (let column = 0; column < values[row].length; column++) {
      if (values[row][column] !== null) states[key(row, column)] = 'settled'
    }
  }
  return states
}

export function triangle2D(triangle: number[][]): VizModel {
  const run = recordTrianglePath(triangle)
  const size = triangle.length
  const table: (number | null)[][] = Array.from({ length: size }, () => Array<number | null>(size).fill(null))
  const snap = (): (number | null)[][] => table.map((row) => row.slice())
  const frames: Frame[] = [{
    values: snap(),
    states: {},
    caption: '<b>准备</b>：把三角形左对齐，从最底行开始，自底向上填写每格到底部的最大路径和。',
    formula: 'f[i][j] = a[i][j] + \\max(f[i+1][j],\\ f[i+1][j+1])',
  }]
  for (const event of run.events) {
    table[event.row][event.column] = event.value
    const states = settled(table)
    states[key(event.row, event.column)] = 'current'
    if (event.type === 'initialized') {
      frames.push({
        values: snap(),
        states,
        active: { r: event.row, c: event.column },
        caption: `<b>最底行</b>：f[${event.row}][${event.column}] = <b>${event.value}</b>。`,
        formula: `f[${event.row}][${event.column}]=${event.value}`,
      })
      continue
    }
    states[key(event.row + 1, event.column)] = event.rightWins ? 'source' : 'chosen'
    states[key(event.row + 1, event.column + 1)] = event.rightWins ? 'chosen' : 'source'
    const arrows: Arrow[] = [
      {
        from: { r: event.row + 1, c: event.column },
        to: { r: event.row, c: event.column },
        kind: event.rightWins ? 'source' : 'chosen',
      },
      {
        from: { r: event.row + 1, c: event.column + 1 },
        to: { r: event.row, c: event.column },
        kind: event.rightWins ? 'chosen' : 'source',
      },
    ]
    frames.push({
      values: snap(),
      states,
      active: { r: event.row, c: event.column },
      arrows,
      caption: `格 f[${event.row}][${event.column}]：本身 ${event.cell}，下方 ${event.down} 与右下 ${event.downRight} 取较大者，得到 <b>${event.value}</b>。`,
      formula: `f[${event.row}][${event.column}]=${event.cell}+\\max(${event.down},\\ ${event.downRight})=${event.value}`,
    })
  }
  const finalStates = settled(table)
  finalStates[key(0, 0)] = 'chosen'
  frames.push({
    values: snap(),
    states: finalStates,
    caption: `答案落在顶点 <b>f[0][0] = ${run.result.value}</b>。`,
    formula: `f[0][0]=${run.result.value}`,
  })
  return {
    rows: size,
    cols: size,
    cell: 46,
    rowHeaderLabels: Array.from({ length: size }, (_, row) => `第${row}行`),
    colHeaderLabels: Array.from({ length: size }, (_, column) => `${column}`),
    frames,
  }
}

export function gridCount2D(rows: number, columns: number, blocked: Set<string>): VizModel {
  const run = recordGridPathCount(rows, columns, blocked)
  const table: (number | null)[][] = Array.from({ length: rows }, () => Array<number | null>(columns).fill(null))
  const snap = (): (number | null)[][] => table.map((row) => row.slice())
  const frames: Frame[] = [{
    values: snap(),
    states: {},
    caption: '<b>准备</b>：从左上角出发，每步只向右或向下；红格是不能经过的障碍。',
    formula: 'f[i][j] = f[i-1][j] + f[i][j-1]',
  }]
  for (const event of run.events) {
    const renderRow = event.row - 1
    const renderColumn = event.column - 1
    table[renderRow][renderColumn] = event.count
    const states = settled(table)
    const arrows: Arrow[] = []
    if (event.blocked) {
      states[key(renderRow, renderColumn)] = 'invalid'
      frames.push({
        values: snap(),
        states,
        active: { r: renderRow, c: renderColumn },
        caption: `格 <b>(${event.row},${event.column})</b> 是障碍，方案数强制为 <b>0</b>。`,
        formula: `f[${event.row}][${event.column}]=0\\ (\\text{blocked})`,
      })
      continue
    }
    if (!event.start && event.row > 1) {
      states[key(renderRow - 1, renderColumn)] = 'source'
      arrows.push({ from: { r: renderRow - 1, c: renderColumn }, to: { r: renderRow, c: renderColumn }, kind: 'chosen' })
    }
    if (!event.start && event.column > 1) {
      states[key(renderRow, renderColumn - 1)] = 'source'
      arrows.push({ from: { r: renderRow, c: renderColumn - 1 }, to: { r: renderRow, c: renderColumn }, kind: 'chosen' })
    }
    states[key(renderRow, renderColumn)] = 'current'
    const caption = event.start
      ? '<b>起点 (1,1)</b>：原地站着本身算 1 条路。'
      : `格 <b>(${event.row},${event.column})</b>：上方 ${event.up} 条 + 左方 ${event.left} 条 = <b>${event.count}</b> 条。`
    const formula = event.start
      ? 'f[1][1]=1'
      : `f[${event.row}][${event.column}]=${event.up}+${event.left}=${event.count}`
    frames.push({ values: snap(), states, active: { r: renderRow, c: renderColumn }, arrows, caption, formula })
  }
  const finalStates = settled(table)
  for (const cell of blocked) {
    const [row, column] = cell.split(',').map(Number)
    if (row >= 1 && row <= rows && column >= 1 && column <= columns) finalStates[key(row - 1, column - 1)] = 'invalid'
  }
  finalStates[key(rows - 1, columns - 1)] = 'chosen'
  frames.push({
    values: snap(),
    states: finalStates,
    caption: `<b>终点 f[${rows}][${columns}] = ${run.result.count}</b>。`,
    formula: `f[${rows}][${columns}]=${run.result.count}`,
  })
  return {
    rows,
    cols: columns,
    cell: 44,
    rowHeaderLabels: Array.from({ length: rows }, (_, row) => `${row + 1}`),
    colHeaderLabels: Array.from({ length: columns }, (_, column) => `${column + 1}`),
    rowHeaderTitle: '行',
    colHeaderTitle: '列',
    frames,
  }
}
