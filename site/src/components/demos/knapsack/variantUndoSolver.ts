import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { recordCountKnapsack } from '../../../algorithms/knapsack-variant/internal.ts'
import type { CountKnapsackItem } from '../../../algorithms/knapsack-variant/index.ts'

// 撤销演示只关心重量；对应洛谷 P4141「消失之物」。
export type UndoItem = CountKnapsackItem

// 把非 null 的单元全部标成 settled（从 variantSolver 复制的样板）。
function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/**
 * 撤销可视化 · 洛谷 P4141「消失之物」。
 * 分两幕：
 *   第一幕——先把全部物品都放进去，倒序 f[j] += f[j-w] 建好全集方案数 f[j]（多帧展示）。
 *   第二幕——从全集拷一份 g=f，对选定的第 k 件做逆操作 g[j] -= g[j-w]，
 *            方向与加时相反（正序 j:w→m），逐帧把这件「退」出去。
 * 末帧对比：全集 f[j]（含第 k 件）vs 缺第 k 件 g[j]。
 * 网格两行：第 0 行 f（全集，第二幕保持不动作参照），第 1 行 g（正在被退掉第 k 件）。
 */
export function undoKnapsack(items: UndoItem[], W: number, victim: number): VizModel {
  const n = items.length
  const run = recordCountKnapsack(items, W, victim)
  const k = run.result.victimIndex ?? 0
  const wk = n > 0 ? items[k].w : 0

  const f = run.result.counts

  // 两行网格：第 0 行 = 全集 f，第 1 行 = 撤销中的 g。
  // 第一幕里 g 行整行留空（null），只演 f 行的累加。
  const fRow: (number | null)[] = Array<number | null>(W + 1).fill(0)
  fRow[0] = 1
  let gRow: (number | null)[] = Array<number | null>(W + 1).fill(null)
  const snap = (): (number | null)[][] => [fRow.slice(), gRow.slice()]

  const frames: Frame[] = []

  // ---------- 第一幕：建全集 f[j]（倒序 += ）----------
  frames.push({
    values: snap(),
    states: settled(snap()),
    caption:
      `<b>第一幕 · 先把全部物品都放进去。</b>初值 <b>f[0]=1</b>（空方案），其余 f[j]=0。` +
      `下面按标准计数背包倒序累加，建出<strong>含全部 ${n} 件</strong>的全集方案数 f[j]。`,
    formula: 'f[0]=1,\\ f[j]=0\\ (j>0)',
  })

  for (const event of run.events) {
      if (event.type !== 'count-cell') continue
      const { itemIndex: i, weight: w, capacity: j, before: old, add, after: now } = event
      const grew = add > 0
      fRow[j] = now

      const states: Record<string, CellState> = settled(snap())
      const arrows: Arrow[] = [
        { from: { r: 0, c: j - w }, to: { r: 0, c: j }, kind: grew ? 'chosen' : 'source' },
      ]
      states[key(0, j - w)] = grew ? 'chosen' : 'source'
      states[key(0, j)] = 'current'

      const caption =
        `建全集 · 物品 <b>${i + 1}</b>（w=${w}）· <b>倒序</b> j=${j}：` +
        `f[${j}] <b>+=</b> f[${j - w}]=<b>${add}</b> → f[${j}] 从 <b>${old}</b> 变为 <b>${now}</b>` +
        `${grew ? '' : '（来源为 0，保持不变）'}。`
      // ★formula 内禁中文，纯符号
      const formula = `f[${j}]\\mathrel{+}=f[${j - w}]=${old}+${add}=${now}`
      frames.push({ values: snap(), states, active: { r: 0, c: j }, arrows, caption, formula })
  }

  // 全集建成，作一帧收束（f 行全高亮）。
  {
    const st = settled(snap())
    for (let j = 0; j <= W; j++) st[key(0, j)] = 'chosen'
    frames.push({
      values: snap(),
      states: st,
      caption:
        `<b>全集就绪：</b>f[0..${W}] 已含全部 ${n} 件物品。特别地 <b>f[${W}]=${f[W]}</b>。` +
        `接下来要让<strong>第 ${k + 1} 件（w=${wk}）消失</strong>——不是重算，而是把它对 f 的贡献「退」出去。`,
      formula: `f[${W}]=${f[W]}`,
    })
  }

  if (n === 0 || wk > W) {
    // 极端兜底：没有物品或该件比容量还大（退不动），直接给末帧。
    gRow = (run.result.withoutVictim ?? f).slice()
    const st = settled(snap())
    for (let j = 0; j <= W; j++) {
      st[key(0, j)] = 'settled'
      st[key(1, j)] = 'chosen'
    }
    frames.push({
      values: snap(),
      states: st,
      caption:
        `第 ${k + 1} 件（w=${wk}）容量放不进（w &gt; W），它本就没给任何 f[j] 贡献，` +
        `所以「缺它」的方案数 g[j] 与全集 f[j] 完全相同。`,
      formula: `g[j]=f[j]`,
    })
    return pack(frames, W, k)
  }

  // ---------- 第二幕：拷 g=f，逆操作 g[j] -= g[j-w] 退掉第 k 件（正序）----------
  gRow = fRow.slice() // 从全集出发：g ← f
  {
    const st = settled(snap())
    for (let j = 0; j <= W; j++) {
      st[key(1, j)] = 'current'
    }
    frames.push({
      values: snap(),
      states: st,
      caption:
        `<b>第二幕 · 从全集拷一份 g ← f</b>（别在原数组上减，否则会污染别的物品）。` +
        `下面对第 <b>${k + 1}</b> 件（w=${wk}）做<strong>逆操作</strong>：加它当初是 f[j] += f[j−w]，退它就是 g[j] −= g[j−w]。` +
        `<strong>方向与加时相反——正序 j:${wk}→${W}</strong>：撤销要用「已退干净」的 g[j−w]，故小下标必须先退。`,
      formula: `g[j]\\gets f[j]`,
    })
  }

  // 正序事件由领域 Implementation 产生，Adapter 只负责重放。
  for (const event of run.events) {
    if (event.type !== 'undo-cell') continue
    const { capacity: j, before: old, subtract: sub, after: now } = event
    const changed = sub > 0
    gRow[j] = now

    const states: Record<string, CellState> = settled(snap())
    const arrows: Arrow[] = [
      { from: { r: 1, c: j - wk }, to: { r: 1, c: j }, kind: changed ? 'chosen' : 'source' },
    ]
    states[key(1, j - wk)] = changed ? 'chosen' : 'source'
    states[key(1, j)] = 'current'
    // 顶上对照：同列全集 f 标为 source，直观看到「退掉后比全集少了多少」。
    states[key(0, j)] = 'source'

    const caption =
      `正在退第 <b>${k + 1}</b> 件：<b>g[j] −= g[j−w]</b> · <b>正序</b> j=${j}（w=${wk}）：` +
      `g[${j}] −= g[${j - wk}]=<b>${sub}</b> → g[${j}] 从 <b>${old}</b> 减为 <b>${now}</b>` +
      `${changed ? '' : '（要减的量为 0，保持不变）'}。对照上方全集 f[${j}]=<b>${f[j]}</b>。`
    // ★formula 内禁中文，纯符号；用 w_k 标明退的是第 k 件
    const formula = `g[${j}]\\mathrel{-}=g[${j - wk}]=${old}-${sub}=${now}`
    frames.push({ values: snap(), states, active: { r: 1, c: j }, arrows, caption, formula })
  }

  // ---------- 末帧：全集 f[j] vs 缺第 k 件 g[j] 逐格对比 ----------
  {
    const st = settled(snap())
    for (let j = 0; j <= W; j++) {
      st[key(0, j)] = 'source' // 全集作参照
      st[key(1, j)] = 'chosen' // 缺件结果高亮
    }
    // 找一处「方案数被退掉」的容量，点名教学点。
    let demoJ = W
    for (let j = W; j >= 1; j--) {
      if ((gRow[j] as number) !== f[j]) {
        demoJ = j
        break
      }
    }
    const drop =
      f[demoJ] !== (gRow[demoJ] as number)
        ? `例如容量 ${demoJ}：全集 f[${demoJ}]=<b>${f[demoJ]}</b>，缺第 ${k + 1} 件后 g[${demoJ}]=<b>${gRow[demoJ]}</b>——` +
          `少掉的正是<strong>用到第 ${k + 1} 件</strong>的那些方案。`
        : `第 ${k + 1} 件（w=${wk}）在 1..${W} 内没改变任何方案数，说明当前物品下它可有可无。`
    frames.push({
      values: snap(),
      states: st,
      caption:
        `<b>退完了。</b>上行是<strong>全集 f[j]</strong>（含第 ${k + 1} 件），下行是<strong>缺第 ${k + 1} 件的 g[j]</strong>。` +
        `${drop} 全程 <b>O(nm)</b>：一次全集 + 一次逆操作，无需为每件重算整张表。`,
      formula: `g[${demoJ}]=${gRow[demoJ]}\\ (\\text{vs }f[${demoJ}]=${f[demoJ]})`,
    })
  }

  return pack(frames, W, k)
}

// 组装 VizModel：两行 f / g，列头为容量 0..W。
function pack(frames: Frame[], W: number, k: number): VizModel {
  return {
    rows: 2,
    cols: W + 1,
    rowHeaderLabels: ['f 全集', `g 缺#${k + 1}`],
    colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
    frames,
  }
}
