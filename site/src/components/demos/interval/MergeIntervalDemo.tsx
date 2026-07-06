import { useMemo, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { takeEnds } from './mergeSolver'
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

/** 两端取数博弈区间 DP 三角表演示：dp[l][r] 按长度递推，高亮取左 / 取右选中的那个收缩后子区间。 */
export default function MergeIntervalDemo() {
  const [nums, setNums] = useState<number[]>([3, 9, 1, 2])

  const model = useMemo(() => takeEnds(nums), [nums])
  const modelKey = `te-${nums.join('_')}`

  const setNum = (i: number, val: number) => setNums((arr) => arr.map((s, k) => (k === i ? val : s)))
  const addNum = () => setNums((arr) => (arr.length < 6 ? [...arr, 4] : arr))
  const removeNum = (i: number) =>
    setNums((arr) => (arr.length > 3 ? arr.filter((_, k) => k !== i) : arr))

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">一排数字（两人轮流从两端取 · 可改每个数值 · 3～6 个）</div>
          <div className="kd__items">
            {nums.map((s, i) => (
              <div className="kd__item" key={i}>
                <span className="kd__item-i">{i}</span>
                {nums.length > 3 && (
                  <button className="kd__remove" onClick={() => removeNum(i)} aria-label="删除该数">
                    <X size={12} />
                  </button>
                )}
                <Stepper label="数值 a" value={s} min={1} max={30} onChange={(v) => setNum(i, v)} />
              </div>
            ))}
            {nums.length < 6 && (
              <button className="kd__add" onClick={addNum}>
                <Plus size={14} /> 加一个
              </button>
            )}
          </div>
        </div>
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
