import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { knapsack1D } from './solvers'
import type { Item } from './solvers'
import type { VizModel } from '../../dp-engine/types'
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

const finalCap = (m: VizModel, cap: number): number => {
  const x = m.frames[m.frames.length - 1].values[0][cap]
  return x == null ? 0 : x
}

/** 同一组物品：01(逆推，每种至多 1 件) vs 完全(正推，每种可多件)并排，直观看出完全 ≥ 01。 */
export default function CompleteContrastDemo() {
  const [items, setItems] = useState<Item[]>([
    { w: 2, v: 3 },
    { w: 3, v: 5 },
  ])
  const [cap, setCap] = useState(9)

  const setItem = (i: number, patch: Partial<Item>) =>
    setItems((a) => a.map((it, k) => (k === i ? { ...it, ...patch } : it)))

  const only01 = useMemo(() => knapsack1D(items, cap, 'reverse'), [items, cap])
  const full = useMemo(() => knapsack1D(items, cap, 'complete'), [items, cap])
  const v01 = finalCap(only01, cap)
  const vFull = finalCap(full, cap)
  const k = `${cap}-${items.map((it) => `${it.w}.${it.v}`).join('_')}`

  return (
    <div>
      <div className="fbug__toolbar">
        <div>
          <div className="kd__group-label">物品（可改重量 / 价值）</div>
          <div className="fbug__steppers">
            {items.map((it, i) => (
              <div className="kd__item" key={i}>
                <span className="kd__item-i">{i + 1}</span>
                <Stepper label="重量 w" value={it.w} min={1} max={cap} onChange={(w) => setItem(i, { w })} />
                <Stepper label="价值 v" value={it.v} min={1} max={30} onChange={(v) => setItem(i, { v })} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="kd__group-label">背包容量</div>
          <Stepper
            label="m"
            value={cap}
            min={3}
            max={12}
            onChange={(c) => {
              setCap(c)
              setItems((a) => a.map((it) => (it.w > c ? { ...it, w: c } : it)))
            }}
          />
        </div>
      </div>

      <div className="fbug__readout">
        01 最优 <b className="you">f[{cap}] = {v01}</b>（每种至多 1 件） · 完全最优 <b className="ok">f[{cap}] = {vFull}</b>
        {vFull > v01 ? (
          <>
            （多拿 <b className="ok">{vFull - v01}</b>——靠反复取用同一种）
          </>
        ) : (
          <>（本例容量下两者相同）</>
        )}
      </div>

      <div className="fbug__pair">
        <div>
          <div className="fbug__side-label you">01 背包 · 逆推（每种一件）</div>
          <DPViz key={`o${k}`} model={only01} />
        </div>
        <div>
          <div className="fbug__side-label ok">完全背包 · 正推（每种无限件）</div>
          <DPViz key={`c${k}`} model={full} />
        </div>
      </div>
    </div>
  )
}
