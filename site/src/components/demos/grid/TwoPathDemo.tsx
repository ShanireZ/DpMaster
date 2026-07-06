import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { twoPath2D } from './twoPathSolver'
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

// 默认 3×3 权值网格，两条右/下路径的最大权值和 = 19（重叠格只算一次）。
const DEFAULT_GRID: number[][] = [
  [1, 2, 3],
  [2, 5, 1],
  [3, 1, 4],
]

function resizeGrid(g: number[][], rows: number, cols: number): number[][] {
  const out: number[][] = []
  for (let i = 0; i < rows; i++) {
    const src = g[i] ?? []
    const row: number[] = []
    for (let j = 0; j < cols; j++) row.push(src[j] ?? ((i + j) % 5) + 1)
    out.push(row)
  }
  return out
}

/** 双线程（传纸条）演示：两条路径同步从左上到右下，按步数压成 dp[k][x1][x2]，同格权值只算一次。可改每格权值与网格大小。 */
export default function TwoPathDemo() {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [grid, setGrid] = useState<number[][]>(DEFAULT_GRID)

  const shown = useMemo(() => resizeGrid(grid, rows, cols), [grid, rows, cols])
  const model = useMemo(() => twoPath2D(shown), [shown])
  const modelKey = `tp-${rows}x${cols}-${shown.map((r) => r.join('.')).join('_')}`

  const setCell = (i: number, j: number, val: number) =>
    setGrid(() => {
      const base = resizeGrid(shown, rows, cols)
      base[i] = base[i].slice()
      base[i][j] = val
      return base
    })

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">权值网格（点数字上的 ± 改值 · 两条路都从左上走到右下，只能右 / 下 · 同格只算一次）</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
            {shown.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 6 }}>
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
                      style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-1)', minWidth: 18, textAlign: 'center' }}
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
        <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
          <div>
            <div className="kd__group-label">行数</div>
            <Stepper label="行" value={rows} min={2} max={4} onChange={setRows} />
          </div>
          <div>
            <div className="kd__group-label">列数</div>
            <Stepper label="列" value={cols} min={2} max={4} onChange={setCols} />
          </div>
        </div>
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
