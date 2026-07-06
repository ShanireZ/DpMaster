import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { integerPartition } from './countSolver'
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

/**
 * 整数划分二维计数演示：dp[i][j] =「把 i 拆成每个数不超过 j 的方案数」，
 * 逐格由 dp[i][j-1]（不用 j）+ dp[i-j][j]（至少用一个 j）累加而来。
 * 被拆的数 N ≤ 8（网格 (N+1)×(N+1)，避免过大）。答案在右下角 dp[N][N]。
 */
export default function PartitionDemo() {
  const [n, setN] = useState(5)

  const model = useMemo(() => integerPartition(n), [n])
  const last = model.frames[model.frames.length - 1].values
  const answer = last[n][n] ?? 0

  const modelKey = `part-${n}`

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">要拆分的自然数</div>
          <Stepper label="N" value={n} min={2} max={8} onChange={setN} />
        </div>
      </div>

      <div className="fbug__readout">
        把 <b className="you">N = {n}</b> 拆成若干正整数（无序）的方案数：<b className="ok">dp[{n}][{n}] = {answer}</b>
        <span style={{ color: 'var(--text-3)' }}>（行 = 拆的数 i，列 = 允许的最大零件 j）</span>
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
