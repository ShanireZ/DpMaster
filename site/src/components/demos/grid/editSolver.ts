import type { Arrow, CellState, Frame, VizModel } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { recordEditDistance } from '../../../algorithms/edit-distance/internal.ts'

function settled(values: (number | null)[][]): Record<string, CellState> {
  const states: Record<string, CellState> = {}
  for (let row = 0; row < values.length; row++) {
    for (let column = 0; column < values[row].length; column++) {
      if (values[row][column] !== null) states[key(row, column)] = 'settled'
    }
  }
  return states
}

export function edit2D(source: string, target: string): VizModel {
  const run = recordEditDistance(source, target)
  const rows = source.length + 1
  const columns = target.length + 1
  const table: (number | null)[][] = Array.from({ length: rows }, () => Array<number | null>(columns).fill(null))
  for (let row = 0; row < rows; row++) table[row][0] = row
  for (let column = 0; column < columns; column++) table[0][column] = column
  const snap = (): (number | null)[][] => table.map((row) => row.slice())
  const initialStates = settled(table)
  for (let row = 0; row < rows; row++) initialStates[key(row, 0)] = 'source'
  for (let column = 0; column < columns; column++) initialStates[key(0, column)] = 'source'
  const frames: Frame[] = [{
    values: snap(),
    states: initialStates,
    caption: '<b>边界</b>：首列表示逐个删除，首行表示逐个插入。这是整张表的地基。',
    formula: 'dp[i][0]=i,\\quad dp[0][j]=j',
  }]

  for (const event of run.events) {
    const { row, column } = event
    table[row][column] = event.distance
    const states = settled(table)
    const arrows: Arrow[] = []
    const sources = [
      { row: row - 1, column, choice: 'delete' },
      { row, column: column - 1, choice: 'insert' },
      { row: row - 1, column: column - 1, choice: 'diagonal' },
    ] as const
    for (const sourceCell of sources) {
      const chosen = event.choice === sourceCell.choice
      states[key(sourceCell.row, sourceCell.column)] = chosen ? 'chosen' : 'source'
      arrows.push({
        from: { r: sourceCell.row, c: sourceCell.column },
        to: { r: row, c: column },
        kind: chosen ? 'chosen' : 'source',
      })
    }
    states[key(row, column)] = 'current'
    const sourceChar = source[row - 1]
    const targetChar = target[column - 1]
    const caption =
      `A[${row}]=<b>'${sourceChar}'</b> · B[${column}]=<b>'${targetChar}'</b>：` +
      `删=<b>${event.deleteCost}</b>，插=<b>${event.insertCost}</b>，` +
      `${event.same ? '匹配' : '替换'}=<b>${event.substituteCost}</b> → 取最小 <b>${event.distance}</b>。`
    const formula = `dp[${row}][${column}]=\\min(${event.deleteCost},\\ ${event.insertCost},\\ ${event.substituteCost})=${event.distance}`
    frames.push({ values: snap(), states, arrows, active: { r: row, c: column }, caption, formula })
  }

  const finalStates = settled(table)
  finalStates[key(source.length, target.length)] = 'chosen'
  frames.push({
    values: snap(),
    states: finalStates,
    caption: `答案在右下角 <b>dp[${source.length}][${target.length}] = ${run.result.distance}</b>。`,
    formula: `dp[${source.length}][${target.length}]=${run.result.distance}`,
  })
  return {
    rows,
    cols: columns,
    cell: 40,
    rowHeaderLabels: ['∅', ...source.split('')],
    colHeaderLabels: ['∅', ...target.split('')],
    frames,
  }
}
