import type { Arrow, CellState, Frame, VizModel } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { recordLcs } from '../../../algorithms/lcs/internal.ts'

function settled(values: (number | null)[][]): Record<string, CellState> {
  const states: Record<string, CellState> = {}
  for (let row = 0; row < values.length; row++) {
    for (let column = 0; column < values[row].length; column++) {
      if (values[row][column] !== null) states[key(row, column)] = 'settled'
    }
  }
  return states
}

export interface LcsResult {
  model: VizModel
  len: number
  lcs: string
}

export function lcs2D(first: string, second: string): LcsResult {
  const run = recordLcs(first, second)
  const rows = first.length + 1
  const columns = second.length + 1
  const table: (number | null)[][] = Array.from({ length: rows }, () => Array<number | null>(columns).fill(null))
  for (let row = 0; row < rows; row++) table[row][0] = 0
  for (let column = 0; column < columns; column++) table[0][column] = 0
  const snap = (): (number | null)[][] => table.map((row) => row.slice())
  const frames: Frame[] = [{
    values: snap(),
    states: settled(table),
    caption: '<b>第 0 行、第 0 列</b>是空串地基：任何字符串与空串的公共子序列长度都是 <b>0</b>。',
    formula: 'dp[i][0]=dp[0][j]=0',
  }]

  for (const event of run.events) {
    const { row, column } = event
    table[row][column] = event.length
    const states = settled(table)
    const arrows: Arrow[] = []
    if (event.equal) {
      states[key(row - 1, column - 1)] = 'chosen'
      arrows.push({ from: { r: row - 1, c: column - 1 }, to: { r: row, c: column }, kind: 'chosen' })
    } else {
      const upWins = event.choice === 'up'
      states[key(row - 1, column)] = upWins ? 'chosen' : 'source'
      states[key(row, column - 1)] = upWins ? 'source' : 'chosen'
      arrows.push({ from: { r: row - 1, c: column }, to: { r: row, c: column }, kind: upWins ? 'chosen' : 'source' })
      arrows.push({ from: { r: row, c: column - 1 }, to: { r: row, c: column }, kind: upWins ? 'source' : 'chosen' })
    }
    states[key(row, column)] = 'current'
    const caption = event.equal
      ? `A 的第 ${row} 位 <b>${first[row - 1]}</b> 与 B 的第 ${column} 位 <b>${second[column - 1]}</b> 相等，接在左上答案后，长度变为 <b>${event.length}</b>。`
      : `A 末位 <b>${first[row - 1]}</b> ≠ B 末位 <b>${second[column - 1]}</b>：上方 ${event.up} 与左方 ${event.left} 取较大者 <b>${event.length}</b>。`
    const formula = event.equal
      ? `dp[${row}][${column}]=${event.diagonal}+1=${event.length}`
      : `dp[${row}][${column}]=\\max(${event.up},\\ ${event.left})=${event.length}`
    frames.push({ values: snap(), states, active: { r: row, c: column }, arrows, caption, formula })
  }

  const finalStates = settled(table)
  for (const cell of run.result.path) finalStates[key(cell.row, cell.column)] = cell.matched ? 'chosen' : 'source'
  finalStates[key(first.length, second.length)] = 'chosen'
  const backArrows: Arrow[] = []
  for (let index = 0; index + 1 < run.result.path.length; index++) {
    const current = run.result.path[index]
    const next = run.result.path[index + 1]
    backArrows.push({
      from: { r: next.row, c: next.column },
      to: { r: current.row, c: current.column },
      kind: 'chosen',
    })
  }
  frames.push({
    values: snap(),
    states: finalStates,
    arrows: backArrows,
    caption: `右下角给出 LCS 长度 <b>${run.result.length}</b>；沿来路回溯得到一条 LCS：<b>${run.result.subsequence || '（空）'}</b>。`,
    formula: `\\text{LCS}=dp[${first.length}][${second.length}]=${run.result.length}`,
  })
  return {
    model: {
      rows,
      cols: columns,
      cell: 42,
      rowHeaderLabels: ['∅', ...first.split('')],
      colHeaderLabels: ['∅', ...second.split('')],
      frames,
    },
    len: run.result.length,
    lcs: run.result.subsequence,
  }
}
