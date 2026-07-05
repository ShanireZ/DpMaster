import { useMemo, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { knapsack2D, knapsack1D } from './solvers'
import type { Item, Mode1D } from './solvers'
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

type Mode = '2D' | Mode1D

const MODES_01: { id: Mode; label: string; danger?: boolean }[] = [
  { id: '2D', label: '二维原型' },
  { id: 'reverse', label: '一维 · 逆推 ✓' },
  { id: 'forward', label: '一维 · 顺推 ✗', danger: true },
]

export default function KnapsackDemo({ variant = '01' }: { variant?: '01' | 'complete' }) {
  const [items, setItems] = useState<Item[]>(
    variant === 'complete'
      ? [
          { w: 2, v: 3 },
          { w: 3, v: 5 },
        ]
      : [
          { w: 2, v: 3 },
          { w: 3, v: 4 },
          { w: 4, v: 5 },
        ],
  )
  const [cap, setCap] = useState(variant === 'complete' ? 9 : 8)
  const [mode, setMode] = useState<Mode>(variant === 'complete' ? 'complete' : '2D')

  const model = useMemo(() => {
    if (mode === '2D') return knapsack2D(items, cap)
    return knapsack1D(items, cap, mode)
  }, [items, cap, mode])

  const modelKey = `${variant}-${mode}-${cap}-${items.map((it) => `${it.w}.${it.v}`).join('_')}`

  const setItem = (i: number, patch: Partial<Item>) =>
    setItems((arr) => arr.map((it, k) => (k === i ? { ...it, ...patch } : it)))

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">物品（可改重量 / 价值）</div>
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
              </div>
            ))}
            {items.length < 5 && (
              <button className="kd__add" onClick={() => setItems((a) => [...a, { w: 2, v: 3 }])}>
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

      {variant === '01' && (
        <div className="kd__modes">
          {MODES_01.map((m) => (
            <button
              key={m.id}
              className={`kd__mode${m.danger ? ' danger' : ''}${mode === m.id ? ' on' : ''}`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
