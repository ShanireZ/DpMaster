import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { recordLis } from '../../../algorithms/lis/internal.ts'

/**
 * O(n²) LIS 的教学 Adapter。算法 Module 产生长度、前驱与领域事件；
 * 本函数只把事件投影为逐格表格、箭头、公式和讲解文案。
 */
export function lisNaive(a: number[]): VizModel {
  const n = a.length
  const run = recordLis(a)
  const dp: (number | null)[] = Array<number | null>(n).fill(null)
  const snap = (): (number | null)[][] => [a.slice(), dp.slice()]

  const settled = (): Record<string, CellState> => {
    const states: Record<string, CellState> = {}
    for (let column = 0; column < n; column++) states[key(0, column)] = 'settled'
    for (let column = 0; column < n; column++) {
      if (dp[column] !== null) states[key(1, column)] = 'settled'
    }
    return states
  }

  const frames: Frame[] = [
    {
      values: snap(),
      states: settled(),
      caption:
        `上排是原数组 <b>a[]</b>（只读参照），下排 <b>dp[i]</b> 表示「以 a[i] 结尾的最长上升子序列长度」。` +
        `每个 dp[i] 至少是 <b>1</b>（数字自己就是长度 1 的串），再看左边有没有更矮的数能接在它前面。`,
      formula: 'dp[i]=1\\ \\ (\\text{init, each element alone})',
    },
  ]

  for (const event of run.events) {
    if (event.type === 'initialized') {
      const i = event.index
      dp[i] = 1
      const states = settled()
      states[key(0, i)] = 'current'
      states[key(1, i)] = 'current'
      frames.push({
        values: snap(),
        states,
        active: { r: 1, c: i },
        caption:
          `轮到 <b>i=${i}</b>（a[${i}]=<b>${a[i]}</b>）。先给它一个保底：<b>dp[${i}]=1</b>` +
          `（它自己单独成一个长度 1 的上升串）。接着往左扫 j&lt;${i}，找能接在它前面的更矮的数。`,
        formula: `dp[${i}]=1`,
      })
      continue
    }

    if (event.type === 'compared') {
      const { index: i, previousIndex: j, canExtend, candidate, before, after, chosen } = event
      dp[i] = after
      const states = settled()
      states[key(0, j)] = canExtend ? 'source' : 'invalid'
      states[key(1, j)] = canExtend ? 'source' : 'invalid'
      states[key(0, i)] = 'current'
      states[key(1, i)] = 'current'
      const arrows: Arrow[] = canExtend
        ? [{ from: { r: 1, c: j }, to: { r: 1, c: i }, kind: chosen ? 'chosen' : 'source' }]
        : []
      if (chosen) {
        states[key(1, j)] = 'chosen'
        states[key(0, j)] = 'chosen'
      }

      const caption = canExtend
        ? `看 <b>j=${j}</b>：a[${j}]=<b>${a[j]}</b> &lt; a[${i}]=<b>${a[i]}</b>，可以接。` +
          `候选长度 dp[${j}]+1 = ${dp[j]}+1 = <b>${candidate}</b>` +
          `${chosen ? `，比当前 dp[${i}] 更长 → 更新 dp[${i}]=<b>${after}</b>` : `，不超过当前 dp[${i}]=<b>${after}</b>，保持不变`}。`
        : `看 <b>j=${j}</b>：a[${j}]=<b>${a[j]}</b> ≥ a[${i}]=<b>${a[i]}</b>，接上去就不是「上升」了，<b>跳过</b>。`
      const formula = canExtend
        ? `dp[${i}]=\\max(${before},\\ dp[${j}]{+}1)=\\max(${before},\\ ${candidate})=${after}`
        : `a[${j}]\\ge a[${i}]\\ \\Rightarrow\\ \\text{skip}`
      frames.push({ values: snap(), states, active: { r: 1, c: i }, arrows, caption, formula })
      continue
    }

    const { index: i, predecessor } = event
    const best = dp[i] as number
    const states = settled()
    states[key(1, i)] = 'settled'
    if (predecessor >= 0) states[key(1, predecessor)] = 'source'
    const arrows: Arrow[] = predecessor >= 0
      ? [{ from: { r: 1, c: predecessor }, to: { r: 1, c: i }, kind: 'chosen' }]
      : []
    frames.push({
      values: snap(),
      states,
      arrows,
      caption:
        `<b>dp[${i}]=${best}</b> 定了` +
        `${predecessor >= 0 ? `——最优是接在 a[${predecessor}]=${a[predecessor]}（dp=${dp[predecessor]}）后面` : `——左边没有更矮的数，只能自成一串`}。`,
      formula: `dp[${i}]=${best}`,
    })
  }

  const finalStates = settled()
  const end = run.result.endIndex
  if (end !== null) finalStates[key(1, end)] = 'chosen'
  frames.push({
    values: snap(),
    states: finalStates,
    caption: end === null
      ? '空数组没有上升子序列，LIS 长度为 <b>0</b>。'
      : `扫完。答案是 dp[] 里的<b>最大值</b>：<b>${run.result.length}</b>（在 i=${end} 处取得，a[${end}]=${a[end]}）。` +
        `注意 LIS 可以在<b>任意位置</b>结尾，所以取整行最大，而不是 dp[n−1]。`,
    formula: `\\text{LIS}=\\max_i dp[i]=${run.result.length}`,
  })

  return {
    rows: 2,
    cols: n,
    cell: 46,
    rowHeaderLabels: ['a', 'dp'],
    colHeaderLabels: Array.from({ length: n }, (_, index) => `${index}`),
    frames,
  }
}
