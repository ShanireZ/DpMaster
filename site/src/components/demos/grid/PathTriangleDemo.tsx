import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { triangle2D } from './pathSolver'
import '../knapsack/knapsack-demo.css'

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="stepper__lab">{label}</div>
      <div className="stepper__row">
        <button onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`${label} 减`}>
          <Minus size={13} />
        </button>
        <span className="stepper__val">{value}</span>
        <button onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`${label} 加`}>
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}

// 默认 4 行三角（答案 24，最优路径 3→6→8→7）。改行数时按此模板裁剪 / 补行。
const DEFAULT_TRI: number[][] = [[3], [6, 5], [3, 8, 2], [2, 7, 4, 5]]

function resizeTri(tri: number[][], rows: number): number[][] {
  const out: number[][] = []
  for (let i = 0; i < rows; i++) {
    const src = tri[i] ?? []
    const row: number[] = []
    for (let j = 0; j <= i; j++) row.push(src[j] ?? ((i + j) % 9) + 1) // 缺格补个 1..9 的值
    out.push(row)
  }
  return out
}

/** 数字三角形二维演示：自底向上填表，每格从「正下方 / 右下方」取 max。可改每格数字与行数。 */
export default function PathTriangleDemo() {
  const [rows, setRows] = useState(4)
  const [tri, setTri] = useState<number[][]>(DEFAULT_TRI)

  const shown = useMemo(() => resizeTri(tri, rows), [tri, rows])
  const model = useMemo(() => triangle2D(shown), [shown])
  const modelKey = `tri-${shown.map((r) => r.join('.')).join('_')}`

  const setCell = (i: number, j: number, val: number) =>
    setTri((prev) => {
      const base = resizeTri(prev, Math.max(rows, prev.length))
      base[i] = base[i].slice()
      base[i][j] = val
      return base
    })

  const setRowsClamped = (r: number) => {
    setRows(r)
    setTri((prev) => resizeTri(prev, r))
  }

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">数字三角形（点数字上的 ± 改值 · 每步只能去正下方或右下方）</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', alignItems: 'center' }}>
            {shown.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                {row.map((val, j) => (
                  <div
                    key={j}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      padding: '6px 8px',
                      borderRadius: 'var(--r-2)',
                      background: 'color-mix(in srgb, var(--accent-1) 6%, var(--surface-3))',
                      border: '1px solid var(--border-strong)',
                    }}
                  >
                    <button
                      onClick={() => setCell(i, j, val + 1)}
                      disabled={val >= 20}
                      aria-label="加"
                      style={{
                        width: 22,
                        height: 20,
                        borderRadius: 5,
                        border: '1px solid var(--border)',
                        background: 'var(--surface-2)',
                        color: 'var(--text-1)',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Plus size={12} />
                    </button>
                    <span
                      className="mono"
                      style={{ fontSize: 17, fontWeight: 700, color: 'var(--accent-1)', minWidth: 20, textAlign: 'center' }}
                    >
                      {val}
                    </span>
                    <button
                      onClick={() => setCell(i, j, val - 1)}
                      disabled={val <= 0}
                      aria-label="减"
                      style={{
                        width: 22,
                        height: 20,
                        borderRadius: 5,
                        border: '1px solid var(--border)',
                        background: 'var(--surface-2)',
                        color: 'var(--text-1)',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Minus size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="kd__group-label">层数</div>
          <Stepper label="行" value={rows} min={2} max={5} onChange={setRowsClamped} />
        </div>
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
