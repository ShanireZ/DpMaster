import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { maxSquare2D } from './maxSquareSolver'
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

// 默认 4 行 × 5 列，内含一个 3×3 全 1 块 → 最大正方形边长 3、面积 9。
const DEFAULT_GRID: number[][] = [
  [1, 0, 1, 1, 0],
  [1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
]

function resizeGrid(g: number[][], rows: number, cols: number): number[][] {
  const out: number[][] = []
  for (let i = 0; i < rows; i++) {
    const src = g[i] ?? []
    const row: number[] = []
    for (let j = 0; j < cols; j++) row.push(src[j] ?? 1) // 新格默认 1
    out.push(row)
  }
  return out
}

/** 最大正方形演示：可编辑 0/1 矩阵（点格子翻 0↔1），逐格填 dp[i][j]=以(i,j)为右下角的最大全 1 正方形边长。 */
export default function MaxSquareDemo() {
  const [rows, setRows] = useState(4)
  const [cols, setCols] = useState(5)
  const [grid, setGrid] = useState<number[][]>(DEFAULT_GRID)

  const shown = useMemo(() => resizeGrid(grid, rows, cols), [grid, rows, cols])
  const model = useMemo(() => maxSquare2D(shown), [shown])
  const modelKey = `sq-${rows}x${cols}-${shown.map((r) => r.join('')).join('_')}`

  const toggle = (i: number, j: number) =>
    setGrid(() => {
      const base = resizeGrid(shown, rows, cols)
      base[i] = base[i].slice()
      base[i][j] = base[i][j] === 1 ? 0 : 1
      return base
    })

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">0 / 1 矩阵（点格子翻转 · 1 = 可用，0 = 空洞 · 找最大全 1 正方形）</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
            {shown.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 6 }}>
                {row.map((val, j) => (
                  <button
                    key={j}
                    onClick={() => toggle(i, j)}
                    aria-label={`格 (${i},${j}) = ${val}，点击翻转`}
                    className="mono"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      fontSize: 16,
                      fontWeight: 700,
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                      border: val === 1 ? '1.5px solid var(--accent-2)' : '1.5px solid var(--border-strong)',
                      background:
                        val === 1 ? 'color-mix(in srgb, var(--accent-1) 22%, var(--surface-3))' : 'var(--surface-2)',
                      color: val === 1 ? 'var(--accent-1)' : 'var(--text-3)',
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
          <div>
            <div className="kd__group-label">行数</div>
            <Stepper label="行" value={rows} min={2} max={6} onChange={setRows} />
          </div>
          <div>
            <div className="kd__group-label">列数</div>
            <Stepper label="列" value={cols} min={2} max={6} onChange={setCols} />
          </div>
        </div>
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
