import { useMemo, useState } from 'react'
import { Minus, Plus, Check, X } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { knapsack1D } from './solvers'
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

/** 单件物品的逆推(正确) vs 顺推(错误)并排对照——直观揭示"01 背包为何不能正推"。 */
export default function ForwardBugDemo() {
  const [w, setW] = useState(2)
  const [v, setV] = useState(3)
  const [cap, setCap] = useState(6)

  const items = useMemo(() => [{ w, v }], [w, v])
  const reverse = useMemo(() => knapsack1D(items, cap, 'reverse'), [items, cap])
  const forward = useMemo(() => knapsack1D(items, cap, 'forward'), [items, cap])
  const fRev = finalCap(reverse, cap)
  const fFwd = finalCap(forward, cap)
  const times = v > 0 ? Math.round(fFwd / v) : 0
  const k = `${w}.${v}.${cap}`

  const setCapClamped = (c: number) => {
    setCap(c)
    if (w > c) setW(c)
  }

  return (
    <div>
      <div className="fbug__toolbar">
        <div>
          <div className="kd__group-label">一件物品（可改重量 / 价值）</div>
          <div className="fbug__steppers">
            <Stepper label="重量 w" value={w} min={1} max={cap} onChange={setW} />
            <Stepper label="价值 v" value={v} min={1} max={30} onChange={setV} />
          </div>
        </div>
        <div>
          <div className="kd__group-label">背包容量</div>
          <Stepper label="m" value={cap} min={2} max={12} onChange={setCapClamped} />
        </div>
      </div>

      <div className="fbug__readout">
        逆推 <b className="ok">f[{cap}] = {fRev}</b>（只装 1 件） · 正推 <b className="bad">f[{cap}] = {fFwd}</b>
        {times > 1 ? (
          <>
            （同一件被装了 <b className="bad">{times}</b> 次！）
          </>
        ) : (
          <>（容量不足以重复装）</>
        )}
      </div>

      <div className="fbug__pair">
        <div>
          <div className="fbug__side-label ok">
            <Check size={15} /> 逆推 · 正确（每件至多一次）
          </div>
          <DPViz key={`r${k}`} model={reverse} />
        </div>
        <div>
          <div className="fbug__side-label bad">
            <X size={15} /> 正推 · 错误（同一件被重复计入）
          </div>
          <DPViz key={`f${k}`} model={forward} />
        </div>
      </div>
    </div>
  )
}
