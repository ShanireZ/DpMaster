import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import './matrix-power.css'

/**
 * 一個線性遞推預設：a[x] = Σ coef[t] · a[x-1-t]（t 從 0 起，對應 a[x-1], a[x-2], …）。
 * order = 階數 = 狀態向量維度。
 */
interface Recur {
  key: string
  label: string // 人類可讀的遞推式
  coef: number[] // 頂行係數，長度 = order，coef[t] 是 a[x-1-t] 的係數
}

const PRESETS: Recur[] = [
  { key: 'f13', label: 'a[x] = a[x-1] + a[x-3]', coef: [1, 0, 1] }, // 3 階（P1939 模型）
  { key: 'fib', label: 'a[x] = a[x-1] + a[x-2]', coef: [1, 1] }, // 2 階（斐波那契，熱身）
]

// 狀態向量下標標籤：[a[x-1], a[x-2], …, a[x-order]]
const prevLabels = (order: number) => Array.from({ length: order }, (_, i) => `a[x-${i + 1}]`)
// 輸出向量標籤：[a[x], a[x-1], …, a[x-order+1]]
const nextLabels = (order: number) =>
  Array.from({ length: order }, (_, i) => (i === 0 ? 'a[x]' : `a[x-${i}]`))

/**
 * 由遞推建構轉移矩陣：第 0 行是遞推係數；其餘每行是「位移」——
 * 新狀態裡的 a[x-i]（i≥1）恰好等於舊狀態裡的 a[x-i]，即單位位移。
 * 對 a[x]=a[x-1]+a[x-3]：矩陣 = [[1,0,1],[1,0,0],[0,1,0]]，核對無誤。
 */
function buildMatrix(coef: number[]): number[][] {
  const order = coef.length
  const M: number[][] = []
  M.push([...coef]) // 第 0 行：遞推係數
  for (let r = 1; r < order; r++) {
    const row = new Array(order).fill(0)
    row[r - 1] = 1 // 位移：新 a[x-r] = 舊 a[x-(r-1)-... ] 對應列 r-1
    M.push(row)
  }
  return M
}

// 每行的中文解釋（這一行係數從哪來）。
function rowExplain(order: number, r: number, coef: number[]): string {
  const nl = nextLabels(order)
  const pl = prevLabels(order)
  if (r === 0) {
    const terms = coef
      .map((c, t) => (c === 0 ? null : c === 1 ? pl[t] : `${c}·${pl[t]}`))
      .filter(Boolean)
      .join(' + ')
    return `${nl[0]} 由递推给出 = ${terms}，故本行系数就是递推系数。`
  }
  return `${nl[r]} 其实就是旧向量里现成的 ${pl[r - 1]}，原样搬过来 → 只在第 ${r} 列放一个 1（位移行）。`
}

/**
 * 遞推 → 建構轉移矩陣（自建輕量視覺化，非 DPViz）。
 * 切換 1~2 個遞推預設；把狀態向量 [a[x-1],a[x-2],…] 與輸出向量 [a[x],a[x-1],…] 並排，
 * 逐行點亮矩陣：hover / 選中某一行時，高亮它對應的輸出分量，並解釋係數來源。
 */
export default function MatrixBuildDemo() {
  const [key, setKey] = useState(PRESETS[0].key)
  const [activeRow, setActiveRow] = useState(0)

  const recur = useMemo(() => PRESETS.find((p) => p.key === key)!, [key])
  const order = recur.coef.length
  const M = useMemo(() => buildMatrix(recur.coef), [recur])
  const pl = prevLabels(order)
  const nl = nextLabels(order)

  // 選中行落在合法範圍內。
  const row = Math.min(activeRow, order - 1)

  return (
    <div>
      <div className="mbd__toolbar">
        <div>
          <div className="mpw__group-label">选一个线性递推</div>
          <div className="mbd__preset-row">
            {PRESETS.map((p) => (
              <button type="button"
                key={p.key}
                className={`mbd__preset${p.key === key ? ' on' : ''}`}
                onClick={() => {
                  setKey(p.key)
                  setActiveRow(0)
                }}
              >
                <span className="mono">{p.label}</span>
                <span className="mbd__preset-ord">{p.coef.length} 阶</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mbd__hint">
          状态向量 <b>{order}</b> 维 → 转移矩阵 <b>{order}×{order}</b>。
          点矩阵任意一行，看这行系数从哪来。
        </div>
      </div>

      <div className="mbd__convention">
        此处按<b>列向量左乘</b> <span className="mono">M · 旧状态 = 新状态</span> 摆放（矩阵在左、状态是列），
        矩阵<b>第 r 行</b>正好算出新状态的第 r 个分量——与正文的<b>行向量右乘</b>{' '}
        <span className="mono">[…]·M</span> 只是转置写法，结果等价。
      </div>

      {/* M × 舊狀態(列) = 新狀態(列) 的視覺化：矩陣在左、列向量，字面順序與 M·old 一致 */}
      <div className="mbd__equation">
        {/* 轉移矩陣 */}
        <div className="mbd__mat">
          <div className="mbd__vec-cap">转移矩阵 M</div>
          <div
            className="mbd__mat-grid"
            style={{ gridTemplateColumns: `repeat(${order}, 1fr)` }}
          >
            {M.map((r, ri) =>
              r.map((v, ci) => {
                const active = ri === row
                const contributing = active && v !== 0
                return (
                  <button type="button"
                    key={`${ri}-${ci}`}
                    className={`mbd__mcell${active ? ' row' : ''}${contributing ? ' src' : ''}${
                      v === 0 ? ' zero' : ''
                    }`}
                    onClick={() => setActiveRow(ri)}
                    title={`第 ${ri} 行 第 ${ci} 列 = ${v}`}
                  >
                    {v}
                  </button>
                )
              })
            )}
          </div>
        </div>

        <span className="mbd__times">×</span>

        {/* 舊狀態向量（列向量） */}
        <div className="mbd__vec">
          <div className="mbd__vec-cap">旧状态</div>
          <div className="mbd__vec-body">
            {pl.map((lab, i) => (
              <span
                key={i}
                className={`mbd__vcell${i === (row === 0 ? -1 : row - 1) ? ' hot' : ''}`}
                title={lab}
              >
                {lab}
              </span>
            ))}
          </div>
        </div>

        <span className="mbd__eq">=</span>

        {/* 新狀態向量（列向量） */}
        <div className="mbd__vec">
          <div className="mbd__vec-cap">新状态</div>
          <div className="mbd__vec-body">
            {nl.map((lab, i) => (
              <span
                key={i}
                className={`mbd__vcell out${i === row ? ' hot' : ''}`}
                title={lab}
              >
                {lab}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 當前行解釋 */}
      <div className="mbd__explain">
        <div className="mbd__explain-head">
          <span className="mbd__explain-tag mono">第 {row} 行</span>
          <span className="mono">
            {nl[row]} = {M[row].map((v, t) => `${v}·${pl[t]}`).join(' + ')}
          </span>
        </div>
        <p>{rowExplain(order, row, recur.coef)}</p>
      </div>

      <div className="mbd__legend">
        <span>
          <i className="mbd__sw src" /> 递推系数行（本步真正做加法）
        </span>
        <span>
          <i className="mbd__sw shift" /> 位移行（把旧分量原样下移，只一个 1）
        </span>
        <ArrowRight size={13} className="mbd__legend-arrow" />
        <span>
          有了 M，求第 x 项就是算 <span className="mono">Mˣ</span> 乘初始向量——用矩阵快速幂 O(k³log x)。
        </span>
      </div>
    </div>
  )
}
