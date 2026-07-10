import type { Arrow, CellState, Frame, VizModel } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { solveMaxSubarray, solveMinSubarray } from '../../../algorithms/max-subarray/index.ts'
import { recordSubarray, type SubarrayObjective } from '../../../algorithms/max-subarray/internal.ts'

function subarrayModel(values: number[], objective: SubarrayObjective): VizModel {
  const run = recordSubarray(values, objective)
  const row: (number | null)[] = Array<number | null>(values.length).fill(null)
  const snap = (): (number | null)[][] => [values.slice(), row.slice()]
  const settled = (): Record<string, CellState> => {
    const states: Record<string, CellState> = {}
    for (let column = 0; column < values.length; column++) states[key(0, column)] = 'settled'
    for (let column = 0; column < values.length; column++) {
      if (row[column] !== null) states[key(1, column)] = 'settled'
    }
    return states
  }
  const maximum = objective === 'max'
  const name = maximum ? 'dp' : 'mn'
  const frames: Frame[] = [{
    values: snap(),
    states: settled(),
    caption: maximum
      ? '上排是原数组 <b>a[]</b>（只读参照），下排 <b>dp[i]</b> 表示「<b>以 a[i] 结尾</b>的最大子段和」。每一步在接续与另起之间取较大者。'
      : '同一套 Kadane，只把 <b>max 换成 min</b>：mn[i] 是「以 a[i] 结尾的<b>最小</b>子段和」。',
    formula: maximum
      ? 'dp[i]=\\max(dp[i-1]+a_i,\\ a_i)'
      : 'mn[i]=\\min(mn[i-1]+a_i,\\ a_i)',
  }]

  for (const event of run.events) {
    const index = event.index
    row[index] = event.sum
    const states = settled()
    states[key(0, index)] = 'current'
    states[key(1, index)] = 'current'
    const arrows: Arrow[] = []
    if (index > 0) {
      states[key(1, index - 1)] = event.continued ? 'chosen' : 'source'
      arrows.push({
        from: { r: 1, c: index - 1 },
        to: { r: 1, c: index },
        kind: event.continued ? 'chosen' : 'source',
      })
    }
    const caption = index === 0
      ? `起点 <b>i=0</b>：${name}[0] = a[0] = <b>${event.fresh}</b>。`
      : `i=${index}：接续 ${name}[${index - 1}]+a[${index}] = <b>${event.continuation}</b>，` +
        `另起 a[${index}] = <b>${event.fresh}</b>，取<b>${maximum ? '较大' : '较小'}</b> → ${name}[${index}]=<b>${event.sum}</b>。`
    const operation = maximum ? '\\max' : '\\min'
    const formula = index === 0
      ? `${name}[0]=${event.fresh}`
      : `${name}[${index}]=${operation}(${event.continuation},\\ ${event.fresh})=${event.sum}`
    frames.push({ values: snap(), states, active: { r: 1, c: index }, arrows, caption, formula })
  }

  const finalStates = settled()
  if (run.result.end !== null) finalStates[key(1, run.result.end)] = maximum ? 'chosen' : 'invalid'
  const total = values.reduce((sum, value) => sum + value, 0)
  frames.push({
    values: snap(),
    states: finalStates,
    caption: maximum
      ? `扫完。答案是 dp[] 里的<b>最大值</b>：<b>${run.result.sum}</b>${run.result.end === null ? '' : `（在 i=${run.result.end} 处结尾）`}。`
      : `最小子段和 = <b>${run.result.sum}</b>${run.result.end === null ? '' : `（i=${run.result.end} 处结尾）`}。` +
        `总和 = ${total}，绕首尾的候选值 = <b>${total - run.result.sum}</b>。`,
    formula: maximum
      ? `\\text{ans}=\\max_i dp[i]=${run.result.sum}`
      : `\\text{total}-\\min_i mn[i]=${total}-(${run.result.sum})=${total - run.result.sum}`,
  })

  return {
    rows: 2,
    cols: values.length,
    cell: 46,
    rowHeaderLabels: ['a', name],
    colHeaderLabels: Array.from({ length: values.length }, (_, index) => `${index}`),
    frames,
  }
}

export function kadane(values: number[]): VizModel {
  return subarrayModel(values, 'max')
}

export function kadaneAnswer(values: number[]): number {
  return solveMaxSubarray(values).sum
}

export function minSegAnswer(values: number[]): number {
  return solveMinSubarray(values).sum
}

export function minSegViz(values: number[]): VizModel {
  return subarrayModel(values, 'min')
}
