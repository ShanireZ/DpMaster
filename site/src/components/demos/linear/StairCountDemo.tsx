import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import countHeroArt from '../../../assets/demo-art/linear-count-instrument-v1.avif'
import { DemoSculptureHero } from '../shared'
import { solveStairCount } from '../../../algorithms/linear-count/index.ts'
import { stairCount } from './countSolver'
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
 * 数楼梯计数演示：一维 f[i]「跳到第 i 级的走法数」，逐格由前两格累加（斐波那契）。
 * 每步可跨 1 级或 2 级，f[0]=f[1]=1。台阶数 n ≤ 12（避免大数，看清累加过程）。
 */
export default function StairCountDemo() {
  const [n, setN] = useState(5)

  const model = useMemo(() => stairCount(n), [n])
  const answer = useMemo(() => solveStairCount(n).count, [n])

  const modelKey = `stair-${n}`

  return (
    <div>
      <DemoSculptureHero family="b" lesson="count" src={countHeroArt} />
      <div className="demo-control__toolbar">
        <div>
          <div className="demo-control__group-label">台阶总数（每步跨 1 或 2 级）</div>
          <Stepper label="n" value={n} min={2} max={12} onChange={setN} />
        </div>
      </div>

      <div className="demo-contrast__readout">
        跳到第 <b className="you">n = {n}</b> 级的走法数：<b className="ok">f[{n}] = {answer}</b>
        <span style={{ color: 'var(--text-3)' }}>（f[i] = f[i−1] + f[i−2]，即斐波那契）</span>
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
