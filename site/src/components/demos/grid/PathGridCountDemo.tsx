import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { solveGridPathCount } from '../../../algorithms/grid-path/index.ts'
import { gridCount2D } from './pathSolver'
import '../shared/demo-workbench.css'

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
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`${label} 减`}>
          <Minus size={13} />
        </button>
        <span className="stepper__val">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`${label} 加`}>
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}

/**
 * 過河卒網格路徑計數演示：點小網格裡的格子切換障礙（紅），即時重算方案數。
 * 預設 4×4，起點(1,1)、終點(4,4)不可設障礙。無障礙 20 條；點中間一格看它如何被截斷。
 */
export default function PathGridCountDemo() {
  const [rows, setRows] = useState(4)
  const [cols, setCols] = useState(4)
  const [blocked, setBlocked] = useState<Set<string>>(() => new Set(['2,2']))

  const model = useMemo(() => gridCount2D(rows, cols, blocked), [rows, cols, blocked])
  const blockedKey = [...blocked].sort().join('|')
  const modelKey = `grid-${rows}x${cols}-${blockedKey}`

  const openTotal = useMemo(() => solveGridPathCount(rows, cols, new Set<string>()).count, [rows, cols])
  const curTotal = useMemo(() => solveGridPathCount(rows, cols, blocked).count, [rows, cols, blocked])

  const isStartOrEnd = (i: number, j: number) => (i === 1 && j === 1) || (i === rows && j === cols)
  const toggle = (i: number, j: number) => {
    if (isStartOrEnd(i, j)) return
    setBlocked((prev) => {
      const next = new Set(prev)
      const k = `${i},${j}`
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  // 改尺寸時，剔除越界或落在新起終點的障礙
  const clampBlocked = (r: number, c: number, prev: Set<string>): Set<string> => {
    const next = new Set<string>()
    for (const b of prev) {
      const [bi, bj] = b.split(',').map(Number)
      if (bi >= 1 && bi <= r && bj >= 1 && bj <= c && !((bi === 1 && bj === 1) || (bi === r && bj === c))) next.add(b)
    }
    return next
  }
  const setRowsClamped = (r: number) => {
    setRows(r)
    setBlocked((prev) => clampBlocked(r, cols, prev))
  }
  const setColsClamped = (c: number) => {
    setCols(c)
    setBlocked((prev) => clampBlocked(rows, c, prev))
  }

  return (
    <div>
      <div className="demo-contrast__toolbar">
        <div>
          <div className="demo-control__group-label">点格子设 / 撤障碍（起点终点锁定）</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {Array.from({ length: rows }, (_, ri) => (
              <div key={ri} style={{ display: 'flex', gap: 5 }}>
                {Array.from({ length: cols }, (_, ci) => {
                  const i = ri + 1
                  const j = ci + 1
                  const k = `${i},${j}`
                  const blk = blocked.has(k)
                  const se = isStartOrEnd(i, j)
                  return (
                    <button type="button"
                      key={ci}
                      onClick={() => toggle(i, j)}
                      disabled={se}
                      aria-label={`格 ${i},${j}`}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        cursor: se ? 'default' : 'pointer',
                        border: blk
                          ? '1.5px solid var(--viz-invalid)'
                          : se
                            ? '1.5px solid var(--accent-2)'
                            : '1px solid var(--border-strong)',
                        background: blk
                          ? 'color-mix(in srgb, var(--viz-invalid) 22%, var(--surface-3))'
                          : se
                            ? 'color-mix(in srgb, var(--accent-1) 18%, var(--surface-3))'
                            : 'var(--surface-3)',
                        color: blk ? 'var(--viz-invalid)' : se ? 'var(--accent-1)' : 'var(--text-3)',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      {i === 1 && j === 1 ? '起' : i === rows && j === cols ? '终' : blk ? '×' : ''}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-5)' }}>
          <div>
            <div className="demo-control__group-label">行数</div>
            <Stepper label="行" value={rows} min={2} max={5} onChange={setRowsClamped} />
          </div>
          <div>
            <div className="demo-control__group-label">列数</div>
            <Stepper label="列" value={cols} min={2} max={6} onChange={setColsClamped} />
          </div>
        </div>
      </div>

      <div className="demo-contrast__readout">
        无障碍共 <b className="ok">{openTotal}</b> 条路 · 当前避开 {blocked.size} 个障碍后剩{' '}
        <b className={blocked.size > 0 ? 'bad' : 'ok'}>{curTotal}</b> 条
        {blocked.size > 0 && curTotal < openTotal ? (
          <>（障碍截断了 <b className="bad">{openTotal - curTotal}</b> 条）</>
        ) : null}
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
