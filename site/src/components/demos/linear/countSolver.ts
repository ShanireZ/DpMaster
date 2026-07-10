import type { Arrow, CellState, Frame, VizModel } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { recordIntegerPartition, recordStairCount } from '../../../algorithms/linear-count/internal.ts'

function settled(values: (number | null)[][]): Record<string, CellState> {
  const states: Record<string, CellState> = {}
  for (let row = 0; row < values.length; row++) {
    for (let column = 0; column < values[row].length; column++) {
      if (values[row][column] !== null) states[key(row, column)] = 'settled'
    }
  }
  return states
}

export function stairCount(step: number): VizModel {
  const run = recordStairCount(step)
  const counts: (number | null)[] = Array<number | null>(step + 1).fill(null)
  counts[0] = 1
  if (step >= 1) counts[1] = 1
  const snap = (): (number | null)[][] => [counts.slice()]
  const frames: Frame[] = [{
    values: snap(),
    states: settled(snap()),
    caption: '<b>地基</b>：<b>f[0]=1</b>（原地站着算一种走法），当 n≥1 时 <b>f[1]=1</b>。',
    formula: step >= 1 ? 'f[0]=1,\\ f[1]=1' : 'f[0]=1',
  }]

  for (const event of run.events) {
    if (event.type === 'initialized') continue
    counts[event.step] = event.count
    const states = settled(snap())
    states[key(0, event.step - 1)] = 'source'
    states[key(0, event.step - 2)] = 'source'
    states[key(0, event.step)] = 'current'
    const arrows: Arrow[] = [
      { from: { r: 0, c: event.step - 1 }, to: { r: 0, c: event.step }, kind: 'chosen' },
      { from: { r: 0, c: event.step - 2 }, to: { r: 0, c: event.step }, kind: 'chosen' },
    ]
    frames.push({
      values: snap(),
      states,
      active: { r: 0, c: event.step },
      arrows,
      caption: `第 <b>${event.step}</b> 级：从前一级的 <b>${event.fromOne}</b> 种加上前两级的 <b>${event.fromTwo}</b> 种，得到 <b>${event.count}</b>。`,
      formula: `f[${event.step}]=${event.fromOne}+${event.fromTwo}=${event.count}`,
    })
  }

  const finalStates = settled(snap())
  finalStates[key(0, step)] = 'chosen'
  frames.push({
    values: snap(),
    states: finalStates,
    caption: `答案 <b>f[${step}] = ${run.result.count}</b>。`,
    formula: `f[${step}]=${run.result.count}`,
  })
  return {
    rows: 1,
    cols: step + 1,
    rowHeaderLabels: ['f'],
    colHeaderLabels: Array.from({ length: step + 1 }, (_, index) => `${index}`),
    frames,
  }
}

export function integerPartition(total: number): VizModel {
  const run = recordIntegerPartition(total)
  const size = total + 1
  const table: (number | null)[][] = Array.from({ length: size }, () => Array<number | null>(size).fill(null))
  for (let maximum = 0; maximum < size; maximum++) table[0][maximum] = 1
  for (let value = 1; value < size; value++) table[value][0] = 0
  const snap = (): (number | null)[][] => table.map((row) => row.slice())
  const frames: Frame[] = [{
    values: snap(),
    states: settled(table),
    caption: '<b>地基</b>：第 0 行都是 1；第 0 列除原点外都是 0。其余位置逐格填写。',
    formula: 'dp[0][j]=1,\\ dp[i][0]=0\\ (i>0)',
  }]

  for (const event of run.events) {
    const { total: value, maximum } = event
    table[value][maximum] = event.count
    const states = settled(table)
    const arrows: Arrow[] = [
      { from: { r: value, c: maximum - 1 }, to: { r: value, c: maximum }, kind: 'chosen' },
    ]
    states[key(value, maximum - 1)] = 'source'
    if (event.canUseMaximum) {
      states[key(value - maximum, maximum)] = event.withMaximum > 0 ? 'chosen' : 'source'
      arrows.push({ from: { r: value - maximum, c: maximum }, to: { r: value, c: maximum }, kind: 'chosen' })
    }
    states[key(value, maximum)] = 'current'
    const caption = event.canUseMaximum
      ? `拆 <b>${value}</b> · 最大零件 ≤ <b>${maximum}</b>：不用它有 <b>${event.withoutMaximum}</b> 种，至少用一个有 <b>${event.withMaximum}</b> 种，共 <b>${event.count}</b> 种。`
      : `拆 <b>${value}</b> 时零件 ${maximum} 太大，只能沿用左边的 <b>${event.count}</b> 种。`
    const formula = event.canUseMaximum
      ? `dp[${value}][${maximum}]=${event.withoutMaximum}+${event.withMaximum}=${event.count}`
      : `dp[${value}][${maximum}]=dp[${value}][${maximum - 1}]=${event.count}`
    frames.push({ values: snap(), states, active: { r: value, c: maximum }, arrows, caption, formula })
  }

  const finalStates = settled(table)
  finalStates[key(total, total)] = 'chosen'
  frames.push({
    values: snap(),
    states: finalStates,
    caption: `答案在右下角 <b>dp[${total}][${total}] = ${run.result.count}</b>。`,
    formula: `dp[${total}][${total}]=${run.result.count}`,
  })
  return {
    rows: size,
    cols: size,
    cell: 40,
    rowHeaderLabels: Array.from({ length: size }, (_, index) => `拆${index}`),
    colHeaderLabels: Array.from({ length: size }, (_, index) => `${index}`),
    rowHeaderTitle: '拆 i',
    colHeaderTitle: '≤ j',
    frames,
  }
}
