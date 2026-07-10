import type { Arrow, CellState, Frame, VizModel } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { recordMerge248, recordTakeEnds } from '../../../algorithms/interval-merge/internal.ts'

function settled(table: (number | null)[][]): Record<string, CellState> {
  const states: Record<string, CellState> = {}
  for (let row = 0; row < table.length; row++) {
    for (let column = row; column < table.length; column++) {
      if (table[row][column] !== null) states[key(row, column)] = 'settled'
    }
  }
  return states
}

export function takeEnds(values: number[]): VizModel {
  const run = recordTakeEnds(values)
  const n = values.length
  const table = Array.from({ length: n }, () => Array<number | null>(n).fill(null))
  for (let index = 0; index < n; index++) table[index][index] = values[index]
  const snapshot = () => table.map((row) => row.slice())
  const frames: Frame[] = [{
    values: snapshot(),
    states: settled(table),
    caption: '<b>对角线</b>：只剩一个数时只能拿走它，净胜差 dp[l][l]=a[l]。',
    formula: 'dp[l][l]=a[l]',
  }]
  for (const event of run.events) {
    table[event.left][event.right] = event.value
    const source = event.pickedLeft
      ? { r: event.left + 1, c: event.right }
      : { r: event.left, c: event.right - 1 }
    const states = settled(table)
    states[key(source.r, source.c)] = 'chosen'
    states[key(event.left, event.right)] = 'current'
    const arrows: Arrow[] = [{ from: source, to: { r: event.left, c: event.right }, kind: 'chosen' }]
    frames.push({
      values: snapshot(),
      states,
      arrows,
      active: { r: event.left, c: event.right },
      caption: `区间 <b>[${event.left},${event.right}]</b>：取左净胜 ${event.takeLeft}，取右净胜 ${event.takeRight}，选择${event.pickedLeft ? '左' : '右'}端 → <b>${event.value}</b>。`,
      formula: `dp[${event.left}][${event.right}]=\\max(${event.takeLeft},${event.takeRight})=${event.value}`,
    })
  }
  const finalStates = settled(table)
  finalStates[key(0, n - 1)] = 'chosen'
  frames.push({
    values: snapshot(),
    states: finalStates,
    caption: `整排最大净胜差为 <b>${run.result.difference}</b>；总和 ${run.result.total}，先手最多得 <b>${run.result.first}</b>。`,
    formula: `dp[0][${n - 1}]=${run.result.difference}`,
  })
  return {
    rows: n,
    cols: n,
    cell: 40,
    rowHeaderLabels: Array.from({ length: n }, (_, index) => `l=${index}`),
    colHeaderLabels: Array.from({ length: n }, (_, index) => `r=${index}`),
    frames,
  }
}

export function merge248(values: number[]): VizModel {
  const run = recordMerge248(values)
  const n = values.length
  const table = Array.from({ length: n }, () => Array<number | null>(n).fill(null))
  for (let index = 0; index < n; index++) table[index][index] = values[index]
  const snapshot = () => table.map((row) => row.slice())
  const frames: Frame[] = [{
    values: snapshot(),
    states: settled(table),
    caption: '<b>对角线</b>：单个数字已是一块，dp[l][l]=a[l]；0 表示区间无法缩成单值。',
    formula: 'dp[l][l]=a[l]',
  }]
  for (const event of run.events) {
    table[event.left][event.right] = event.value
    const states = settled(table)
    const arrows: Arrow[] = []
    if (event.split >= 0) {
      states[key(event.left, event.split)] = 'chosen'
      states[key(event.split + 1, event.right)] = 'chosen'
      arrows.push({ from: { r: event.left, c: event.split }, to: { r: event.left, c: event.right }, kind: 'chosen' })
      arrows.push({ from: { r: event.split + 1, c: event.right }, to: { r: event.left, c: event.right }, kind: 'chosen' })
    }
    states[key(event.left, event.right)] = 'current'
    const tried = event.attempts.map((attempt) =>
      `k=${attempt.split}:${attempt.leftValue}|${attempt.rightValue}${attempt.matched ? '✓' : '✗'}`)
    frames.push({
      values: snapshot(),
      states,
      arrows,
      active: { r: event.left, c: event.right },
      caption: event.value > 0
        ? `区间 <b>[${event.left},${event.right}]</b> 在 k=${event.split} 两侧都合成 ${event.value - 1}，再并一级 → <b>${event.value}</b>。`
        : `区间 <b>[${event.left},${event.right}]</b> 没有相等的左右块（${tried.join(' ')}），记 <b>0</b>。`,
      formula: event.value > 0 ? `dp[${event.left}][${event.right}]=${event.value - 1}+1=${event.value}` : `dp[${event.left}][${event.right}]=0`,
    })
  }
  const finalStates = settled(table)
  finalStates[key(run.result.bestStart, run.result.bestEnd)] = 'chosen'
  frames.push({
    values: snapshot(),
    states: finalStates,
    caption: `三角表所有区间中能得到的<b>最大数字 = ${run.result.value}</b>。`,
    formula: `\\text{ans}=\\max_{l\\le r}dp[l][r]=${run.result.value}`,
  })
  return {
    rows: n,
    cols: n,
    cell: 40,
    rowHeaderLabels: Array.from({ length: n }, (_, index) => `l=${index}`),
    colHeaderLabels: Array.from({ length: n }, (_, index) => `r=${index}`),
    frames,
  }
}
