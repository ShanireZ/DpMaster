import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { recordStoneMerge } from '../../../algorithms/stone-merge/internal.ts'
import type { StoneMergeObjective } from '../../../algorithms/stone-merge/index.ts'

export type Opt = StoneMergeObjective

function settled(values: (number | null)[][]): Record<string, CellState> {
  const states: Record<string, CellState> = {}
  for (let row = 0; row < values.length; row++) {
    for (let column = 0; column < values[row].length; column++) {
      if (values[row][column] !== null) states[key(row, column)] = 'settled'
    }
  }
  return states
}
/** 区间合并结果的教学 Adapter：重放领域事件，生成三角表轨迹。 */
export function stoneMerge(a: number[], opt: Opt = 'min'): VizModel {
  const n = a.length
  const run = recordStoneMerge(a, opt)
  const dp: (number | null)[][] = Array.from({ length: n }, () => Array<number | null>(n).fill(null))
  for (let index = 0; index < n; index++) dp[index][index] = 0
  const snap = () => dp.map((row) => row.slice())
  const frames: Frame[] = [
    {
      values: snap(),
      states: settled(dp),
      caption:
        '<b>对角线（区间长度 1）</b>：单独一堆石子无需合并，代价为 <b>0</b>——dp[l][l]=0。' +
        '下三角（l&gt;r）不是合法区间，留作空白。这是整张三角表的地基。',
      formula: 'dp[l][l] = 0',
    },
  ]
  const optWord = opt === 'min' ? '最小' : '最大'
  const optFn = opt === 'min' ? '\\min' : '\\max'

  for (const event of run.events) {
    const { left: l, right: r, bestSplit, cost, sum, bestBase, length, candidates } = event
    dp[l][r] = cost
    const states = settled(dp)
    const arrows: Arrow[] = []
    states[key(l, bestSplit)] = 'chosen'
    states[key(bestSplit + 1, r)] = 'chosen'
    arrows.push({ from: { r: l, c: bestSplit }, to: { r: l, c: r }, kind: 'chosen' })
    arrows.push({ from: { r: bestSplit + 1, c: r }, to: { r: l, c: r }, kind: 'chosen' })
    states[key(l, r)] = 'current'

    const splitText = candidates.map((candidate, index) => `${l + index === bestSplit ? '★' : ''}${candidate}`)
    const caption =
      `区间 <b>[${l},${r}]</b>（长度 ${length}，区间和=${sum}）：枚举分割点 k，` +
      `候选 dp[l][k]+dp[k+1][r] = {${splitText.join(', ')}}，取${optWord} <b>${bestBase}</b>，` +
      `再加区间和 ${sum} → dp[${l}][${r}] = <b>${cost}</b>（在 k=${bestSplit} 处断开）。`
    const formula =
      `dp[${l}][${r}]=${optFn}_{k}(dp[${l}][k]+dp[k{+}1][${r}])+${sum}` +
      `=${bestBase}+${sum}=${cost}`
    frames.push({ values: snap(), states, arrows, active: { r: l, c: r }, caption, formula })
  }

  const finalStates = settled(dp)
  if (n > 0) finalStates[key(0, n - 1)] = 'chosen'
  frames.push({
    values: snap(),
    states: finalStates,
    caption: n === 0
      ? '空序列无需合并，总代价为 <b>0</b>。'
      : `答案在<b>右上角 dp[0][${n - 1}] = ${run.result.cost}</b>——把全部 ${n} 堆石子合并成一堆的${optWord}总代价。` +
        `三角表沿对角线一层层向右上填满。`,
    formula: n === 0 ? '0' : `dp[0][${n - 1}]=${run.result.cost}`,
  })

  return {
    rows: n,
    cols: n,
    cell: 40,
    rowHeaderLabels: Array.from({ length: n }, (_, left) => `l=${left}`),
    colHeaderLabels: Array.from({ length: n }, (_, right) => `r=${right}`),
    frames,
  }
}
