import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/**
 * 二维编辑距离（Levenshtein）：
 *   dp[i][j] = 把 A 的前 i 个字符改成 B 的前 j 个字符的最小操作数。
 * 三个来源各对应一种操作：
 *   删（dp[i-1][j]+1）· 插（dp[i][j-1]+1）· 改/匹配（dp[i-1][j-1]+(A[i]==B[j]?0:1)）。
 * 边界：dp[i][0]=i（把 i 个字符全删掉）、dp[0][j]=j（从空串插 j 个字符）。
 * 逐格从三来源取 min；命中的那条标 chosen，其余标 source。
 */
export function edit2D(a: string, b: string): VizModel {
  const m = a.length
  const n = b.length
  const f: (number | null)[][] = Array.from({ length: m + 1 }, () => Array<number | null>(n + 1).fill(null))
  const snap = () => f.map((row) => row.slice())
  const frames: Frame[] = []

  // 边界：首列 dp[i][0]=i，首行 dp[0][j]=j。一次性铺好，作为整张表的地基。
  for (let i = 0; i <= m; i++) f[i][0] = i
  for (let j = 0; j <= n; j++) f[0][j] = j

  {
    const states = settled(f)
    for (let i = 0; i <= m; i++) states[key(i, 0)] = 'source'
    for (let j = 0; j <= n; j++) states[key(0, j)] = 'source'
    frames.push({
      values: snap(),
      states,
      caption:
        '<b>边界</b>：首列 dp[i][0]=i（把 A 前 i 个字符逐个删空）、首行 dp[0][j]=j（从空串逐个插出 B 前 j 个字符）。这是整张表的地基。',
      formula: 'dp[i][0]=i,\\quad dp[0][j]=j',
    })
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const same = a[i - 1] === b[j - 1]
      const del = (f[i - 1][j] as number) + 1 // 删 A[i]：从 dp[i-1][j] 来
      const ins = (f[i][j - 1] as number) + 1 // 插 B[j]：从 dp[i][j-1] 来
      const sub = (f[i - 1][j - 1] as number) + (same ? 0 : 1) // 改/匹配：从 dp[i-1][j-1] 来
      const best = Math.min(del, ins, sub)
      f[i][j] = best

      const states = settled(f)
      const arrows: Arrow[] = []
      // 三个来源全部画箭头；命中最小值的那条标 chosen，其余标 source。
      // 优先级：匹配(0代价) > 改 > 删 > 插——让「不花钱的对角线」在并列时优先显示为选中。
      const diagWins = sub === best
      const delWins = !diagWins && del === best
      const insWins = !diagWins && !delWins && ins === best

      // 上（删）
      states[key(i - 1, j)] = delWins ? 'chosen' : 'source'
      arrows.push({ from: { r: i - 1, c: j }, to: { r: i, c: j }, kind: delWins ? 'chosen' : 'source' })
      // 左（插）
      states[key(i, j - 1)] = insWins ? 'chosen' : 'source'
      arrows.push({ from: { r: i, c: j - 1 }, to: { r: i, c: j }, kind: insWins ? 'chosen' : 'source' })
      // 左上（改 / 匹配）
      states[key(i - 1, j - 1)] = diagWins ? 'chosen' : 'source'
      arrows.push({ from: { r: i - 1, c: j - 1 }, to: { r: i, c: j }, kind: diagWins ? 'chosen' : 'source' })

      states[key(i, j)] = 'current'

      const ca = a[i - 1]
      const cb = b[j - 1]
      const subLabel = same ? `匹配 '${ca}'='${cb}'（+0）` : `改 '${ca}'→'${cb}'（+1）`
      const caption =
        `A[${i}]=<b>'${ca}'</b> · B[${j}]=<b>'${cb}'</b>：` +
        `删 = dp[${i - 1}][${j}]+1 = <b>${del}</b>；` +
        `插 = dp[${i}][${j - 1}]+1 = <b>${ins}</b>；` +
        `${subLabel} = dp[${i - 1}][${j - 1}]+${same ? 0 : 1} = <b>${sub}</b> → 取最小 <b>${best}</b>。`
      const formula = `dp[${i}][${j}]=\\min(${del},\\ ${ins},\\ ${sub})=${best}`
      frames.push({ values: snap(), states, arrows, active: { r: i, c: j }, caption, formula })
    }
  }

  const fin = settled(f)
  fin[key(m, n)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption: `答案在右下角 <b>dp[${m}][${n}] = ${f[m][n]}</b>——把 "<b>${a}</b>" 变成 "<b>${b}</b>" 所需的最少删 / 插 / 改次数。`,
    formula: `dp[${m}][${n}]=${f[m][n]}`,
  })

  return {
    rows: m + 1,
    cols: n + 1,
    cell: 40,
    rowHeaderLabels: ['∅', ...a.split('')], // 行头 = A 的字符（∅ 为空前缀）
    colHeaderLabels: ['∅', ...b.split('')], // 列头 = B 的字符
    frames,
  }
}
