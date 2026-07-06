import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

/** 物品的「件数属性」：01 = 恰一件、complete = 无限件、multiple = 有限 m 件。 */
export type MixKind = '01' | 'complete' | 'multiple'

export interface MixItem {
  kind: MixKind
  w: number
  v: number
  m?: number // 仅 multiple 用：件数上限
}

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/** 一次落到一维 f[j] 上的「转移单元」：01 逆推、完全正推、或多重拆出的一个打包件（也走逆推）。 */
interface Unit {
  itemIdx: number // 源自第几件原物品（0-based）
  kind: MixKind
  w: number // 本单元等效重量
  v: number // 本单元等效价值
  dir: 'reverse' | 'forward' // 循环方向：01 / 多重打包件 → reverse；完全 → forward
  tag: string // 标签，如 "01" "完全" "×2 包"
  cnt?: number // 多重打包件含几件原物
}

/** 把件数上限 m 二进制拆分：1,2,4,…,余数（与 multipleSolver.binarySplit 同法，此处独立实现避免跨文件耦合）。 */
function splitMultiple(itemIdx: number, w: number, v: number, m: number): Unit[] {
  const units: Unit[] = []
  let rest = m
  let k = 1
  while (k < rest) {
    units.push({ itemIdx, kind: 'multiple', w: k * w, v: k * v, dir: 'reverse', tag: `×${k} 包`, cnt: k })
    rest -= k
    k <<= 1
  }
  if (rest > 0) {
    units.push({ itemIdx, kind: 'multiple', w: rest * w, v: rest * v, dir: 'reverse', tag: `×余${rest} 包`, cnt: rest })
  }
  return units
}

/** 把每件混合物品按其 kind 展开成若干「转移单元」（保持物品输入顺序）。 */
function buildUnits(items: MixItem[]): Unit[] {
  const units: Unit[] = []
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    if (it.kind === '01') {
      units.push({ itemIdx: i, kind: '01', w: it.w, v: it.v, dir: 'reverse', tag: '01' })
    } else if (it.kind === 'complete') {
      units.push({ itemIdx: i, kind: 'complete', w: it.w, v: it.v, dir: 'forward', tag: '完全' })
    } else {
      units.push(...splitMultiple(i, it.w, it.v, Math.max(1, it.m ?? 1)))
    }
  }
  return units
}

const KIND_CN: Record<MixKind, string> = { '01': '01（恰一件）', complete: '完全（无限件）', multiple: '多重（有限件）' }
const DIR_CN = { reverse: '倒序', forward: '正序' } as const

/**
 * 混合背包 · 同一维 f[j] 上按件数属性分派。
 * 01 → 倒序一遍；complete → 正序一遍；multiple → 二进制拆包后每包倒序。
 * 三者共用同一套 f[j]=max(f[j], f[j-w]+v)，只有循环方向 / 是否拆包不同。
 * 网格为一维（1 行 W+1 列）。
 */
export function mixedKnapsack(items: MixItem[], W: number): VizModel {
  const units = buildUnits(items)
  const f: (number | null)[] = Array<number | null>(W + 1).fill(0)
  const snap = (): (number | null)[][] => [f.slice()]
  const frames: Frame[] = []

  const summary = items
    .map((it, i) => `物品 ${i + 1} 按 <b>${KIND_CN[it.kind]}</b>`)
    .join('、')
  frames.push({
    values: snap(),
    states: settled(snap()),
    caption: `初始：容量 0…${W} 下最大价值都是 <b>0</b>（空背包）。本例 ${summary}——三类物品即将落到<b>同一维 f[j]</b> 上，各按自己的方式转移。`,
    formula: 'f[j]=0',
  })

  for (let u = 0; u < units.length; u++) {
    const un = units[u]
    const forward = un.dir === 'forward'
    // 生成本单元的容量遍历顺序：完全→正序(w..W)，01/多重包→倒序(W..w)。
    const range: number[] = []
    if (forward) for (let j = un.w; j <= W; j++) range.push(j)
    else for (let j = W; j >= un.w; j--) range.push(j)

    for (const j of range) {
      const old = f[j] as number
      const from = f[j - un.w] as number
      const cand = from + un.v
      const better = cand > old
      if (better) f[j] = cand

      const states: Record<string, CellState> = settled(snap())
      states[key(0, j - un.w)] = 'source'
      const arrows: Arrow[] = [
        { from: { r: 0, c: j - un.w }, to: { r: 0, c: j }, kind: better ? 'chosen' : 'source' },
      ]
      if (better) states[key(0, j - un.w)] = 'chosen'
      states[key(0, j)] = 'current'

      const src = items[un.itemIdx]
      const unitDesc =
        un.kind === 'multiple'
          ? `的 <b>${un.tag}</b>（含 ${un.cnt} 件原物 · 等效 w'=${un.w}, v'=${un.v}）`
          : `（w=${src.w}, v=${src.v}）`
      const caption =
        `物品 <b>${un.itemIdx + 1}</b>${unitDesc} · 本件按【<b>${KIND_CN[un.kind]}</b>】处理 → <b>${DIR_CN[un.dir]}</b> j=${j}：` +
        `f[${j - un.w}]+${un.v} = <b>${cand}</b> ${better ? '&gt;' : '≤'} f[${j}]=<b>${old}</b> → ${better ? `更新为 <b>${cand}</b>` : '不变'}。`
      // ★ formula 只含数学，禁中文（KaTeX 无 CJK 字形）。
      const formula = `f[${j}]=\\max(f[${j}],\\ f[${j - un.w}]+${un.v})=${better ? cand : old}`
      frames.push({ values: snap(), states, active: { r: 0, c: j }, arrows, caption, formula })
    }
  }

  const fin = settled(snap())
  fin[key(0, W)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption: `答案 <b>f[${W}] = ${f[W]}</b>：${units.length} 个转移单元依次做完，容量 ${W} 下的最大价值。同一维 f[j] 里，01 件至多一次、完全件可反复、多重件不超上限，各自的约束都由“循环方向/拆包”天然保证。`,
    formula: `f[${W}]=${f[W]}`,
  })

  return {
    rows: 1,
    cols: W + 1,
    rowHeaderLabels: ['f'],
    colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
    frames,
  }
}

/** 供工具条展示：本组混合物品展开成多少个转移单元。 */
export function unitCount(items: MixItem[]): number {
  return buildUnits(items).length
}
