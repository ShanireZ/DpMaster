import { useMemo, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { stoneMerge } from './stoneSolver'
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

/** 石子合并区间 DP 三角表演示：dp[l][r] 按区间长度递推，高亮当前格与被选分割点的两个子区间来源。 */
export default function StoneMergeDemo() {
  const [stones, setStones] = useState<number[]>([7, 6, 5, 4])

  const model = useMemo(() => stoneMerge(stones, 'min'), [stones])
  const modelKey = `sm-${stones.join('_')}`

  const setStone = (i: number, val: number) =>
    setStones((arr) => arr.map((s, k) => (k === i ? val : s)))
  const addStone = () => setStones((arr) => (arr.length < 5 ? [...arr, 3] : arr))
  const removeStone = (i: number) =>
    setStones((arr) => (arr.length > 3 ? arr.filter((_, k) => k !== i) : arr))

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">一排石子（相邻可合并 · 可改每堆数值 · 3～5 堆）</div>
          <div className="kd__items">
            {stones.map((s, i) => (
              <div className="kd__item" key={i}>
                <span className="kd__item-i">{i}</span>
                {stones.length > 3 && (
                  <button className="kd__remove" onClick={() => removeStone(i)} aria-label="删除该堆">
                    <X size={12} />
                  </button>
                )}
                <Stepper label="石子数 a" value={s} min={1} max={30} onChange={(v) => setStone(i, v)} />
              </div>
            ))}
            {stones.length < 5 && (
              <button className="kd__add" onClick={addStone}>
                <Plus size={14} /> 加一堆
              </button>
            )}
          </div>
        </div>
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
