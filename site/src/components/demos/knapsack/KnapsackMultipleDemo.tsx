import { useMemo, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { multipleKnapsack, packCounts } from './multipleSolver'
import type { MultiItem } from './multipleSolver'
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

/** 多重背包演示：物品含件数上限 m，二进制拆包后在一维 f[j] 上倒序做 01 转移。 */
export default function KnapsackMultipleDemo() {
  const [items, setItems] = useState<MultiItem[]>([
    { w: 2, v: 3, m: 3 },
    { w: 3, v: 5, m: 2 },
  ])
  const [cap, setCap] = useState(10)

  const model = useMemo(() => multipleKnapsack(items, cap), [items, cap])
  const counts = useMemo(() => packCounts(items), [items])

  const modelKey = `mul-${cap}-${items.map((it) => `${it.w}.${it.v}.${it.m}`).join('_')}`

  const setItem = (i: number, patch: Partial<MultiItem>) =>
    setItems((arr) => arr.map((it, k) => (k === i ? { ...it, ...patch } : it)))

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">物品（可改重量 / 价值 / 件数）</div>
          <div className="kd__items">
            {items.map((it, i) => (
              <div className="kd__item" key={i}>
                <span className="kd__item-i">{i + 1}</span>
                {items.length > 1 && (
                  <button className="kd__remove" onClick={() => setItems((a) => a.filter((_, k) => k !== i))} aria-label="删除物品">
                    <X size={12} />
                  </button>
                )}
                <Stepper label="重量 w" value={it.w} min={1} max={cap} onChange={(w) => setItem(i, { w })} />
                <Stepper label="价值 v" value={it.v} min={1} max={30} onChange={(v) => setItem(i, { v })} />
                <Stepper label="件数 m" value={it.m} min={1} max={6} onChange={(m) => setItem(i, { m })} />
              </div>
            ))}
            {items.length < 4 && (
              <button className="kd__add" onClick={() => setItems((a) => [...a, { w: 2, v: 3, m: 2 }])}>
                <Plus size={15} /> 加物品
              </button>
            )}
          </div>
        </div>
        <div>
          <div className="kd__group-label">背包容量</div>
          <Stepper label="m" value={cap} min={2} max={12} onChange={setCap} />
        </div>
      </div>

      <div className="fbug__readout">
        朴素枚举需 <b className="bad">Σmᵢ = {counts.naive}</b> 个打包件 · 二进制拆分仅需{' '}
        <b className="ok">Σ⌈log⌉ = {counts.binary}</b> 个
        {counts.naive > counts.binary ? (
          <>
            （省下 <b className="you">{counts.naive - counts.binary}</b> 次转移）
          </>
        ) : (
          <>（件数太少，二者持平）</>
        )}
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
