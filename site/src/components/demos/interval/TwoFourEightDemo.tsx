import { useMemo, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { merge248 } from './mergeSolver'
import { solveMerge248 } from '../../../algorithms/interval-merge/index.ts'
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

/** 248（P3146）合并可视化：相邻相等的数并成 +1，dp[l][r] 记该区间可合成的单一值（0=不可）。 */
export default function TwoFourEightDemo() {
  const [nums, setNums] = useState<number[]>([1, 1, 2, 2])

  const model = useMemo(() => merge248(nums), [nums])
  const modelKey = `m248-${nums.join('_')}`
  const best = useMemo(() => solveMerge248(nums).value, [nums])

  const setNum = (i: number, val: number) => setNums((arr) => arr.map((s, k) => (k === i ? val : s)))
  const addNum = () => setNums((arr) => (arr.length < 6 ? [...arr, 1] : arr))
  const removeNum = (i: number) =>
    setNums((arr) => (arr.length > 3 ? arr.filter((_, k) => k !== i) : arr))

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">一排数字（相邻两个相等可并成 +1 · 可改数值 · 3～6 个）</div>
          <div className="kd__items">
            {nums.map((s, i) => (
              <div className="kd__item" key={i}>
                <span className="kd__item-i">{i}</span>
                {nums.length > 3 && (
                  <button className="kd__remove" onClick={() => removeNum(i)} aria-label="删除该数">
                    <X size={12} />
                  </button>
                )}
                <Stepper label="数值 a" value={s} min={1} max={9} onChange={(v) => setNum(i, v)} />
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

      <div className="fbug__readout">
        整排能合成的<b className="ok">最大数字 = {best}</b> · 每格 dp[l][r] = 该区间能缩成的单一值（
        <b>0</b> 表示这段无法合成一个数）· 答案取三角表里<b>所有格的最大值</b>，未必在右上角。
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
