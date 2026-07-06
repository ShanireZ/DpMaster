import { useMemo, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { countKnapsack } from './variantSolver'
import type { CountItem } from './variantSolver'
import './knapsack-demo.css'

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
 * 计数型 01 背包演示：一维 f[j]「恰好装满容量 j 的方案数」，逐格累加。
 * 方案数只与重量有关，故物品只留重量 w 可编辑；容量 W ≤ 12。
 */
export default function KnapsackVariantDemo() {
  const [items, setItems] = useState<CountItem[]>([{ w: 2 }, { w: 3 }, { w: 5 }])
  const [cap, setCap] = useState(5)

  const model = useMemo(() => countKnapsack(items, cap), [items, cap])
  const answer = model.frames[model.frames.length - 1].values[0][cap] ?? 0

  const modelKey = `cnt-${cap}-${items.map((it) => it.w).join('_')}`

  const setItem = (i: number, patch: Partial<CountItem>) =>
    setItems((arr) => arr.map((it, k) => (k === i ? { ...it, ...patch } : it)))

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">物品（只需重量——方案数与价值无关）</div>
          <div className="kd__items">
            {items.map((it, i) => (
              <div className="kd__item" key={i}>
                <span className="kd__item-i">{i + 1}</span>
                {items.length > 1 && (
                  <button
                    className="kd__remove"
                    onClick={() => setItems((a) => a.filter((_, k) => k !== i))}
                    aria-label="删除物品"
                  >
                    <X size={12} />
                  </button>
                )}
                <Stepper label="重量 w" value={it.w} min={1} max={cap} onChange={(w) => setItem(i, { w })} />
              </div>
            ))}
            {items.length < 5 && (
              <button className="kd__add" onClick={() => setItems((a) => [...a, { w: 2 }])}>
                <Plus size={15} /> 加物品
              </button>
            )}
          </div>
        </div>
        <div>
          <div className="kd__group-label">目标容量</div>
          <Stepper label="W" value={cap} min={2} max={12} onChange={setCap} />
        </div>
      </div>

      <div className="fbug__readout">
        恰好装满容量 <b className="you">W = {cap}</b> 的方案数：<b className="ok">f[{cap}] = {answer}</b>
        {answer === 0 && <>（当前物品凑不出 {cap}——没有任何子集和恰好等于它）</>}
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
