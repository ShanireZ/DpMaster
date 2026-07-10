import { useMemo, useState } from 'react'
import { Minus, Plus, ArrowDownWideNarrow, ArrowUpWideNarrow, X } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { stoneMerge } from './stoneSolver'
import { solveStoneMerge } from '../../../algorithms/stone-merge/index.ts'
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

/** 同一排石子：左求最小合并代价、右求最大，并排两张三角表——点明「一题双问」。 */
export default function StoneMinMaxDemo() {
  const [stones, setStones] = useState<number[]>([7, 6, 5, 4])

  const minModel = useMemo(() => stoneMerge(stones, 'min'), [stones])
  const maxModel = useMemo(() => stoneMerge(stones, 'max'), [stones])
  const aMin = useMemo(() => solveStoneMerge(stones, 'min').cost, [stones])
  const aMax = useMemo(() => solveStoneMerge(stones, 'max').cost, [stones])
  const k = stones.join('_')

  const setStone = (i: number, val: number) =>
    setStones((arr) => arr.map((s, j) => (j === i ? val : s)))
  const addStone = () => setStones((arr) => (arr.length < 5 ? [...arr, 3] : arr))
  const removeStone = (i: number) =>
    setStones((arr) => (arr.length > 3 ? arr.filter((_, j) => j !== i) : arr))

  return (
    <div>
      <div className="fbug__toolbar">
        <div>
          <div className="kd__group-label">同一排石子（两侧共用 · 可改数值 / 增删堆）</div>
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

      <div className="fbug__readout">
        最小合并代价 <b className="ok">dp[0][{stones.length - 1}] = {aMin}</b> · 最大合并代价{' '}
        <b className="you">dp[0][{stones.length - 1}] = {aMax}</b> · 同一组石子、同一套转移，只把{' '}
        <b>opt</b> 从 <b>min</b> 换成 <b>max</b>，两问差 <b>{aMax - aMin}</b>。
      </div>

      <div className="fbug__pair">
        <div>
          <div className="fbug__side-label ok">
            <ArrowDownWideNarrow size={15} /> 最小合并代价（opt = min）
          </div>
          <DPViz key={`min${k}`} model={minModel} />
        </div>
        <div>
          <div className="fbug__side-label you">
            <ArrowUpWideNarrow size={15} /> 最大合并代价（opt = max）
          </div>
          <DPViz key={`max${k}`} model={maxModel} />
        </div>
      </div>
    </div>
  )
}
