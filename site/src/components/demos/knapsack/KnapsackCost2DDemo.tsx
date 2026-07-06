import { useMemo, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { cost2D } from './cost2dSolver'
import type { C2Item, C2Mode } from './cost2dSolver'
import './knapsack-demo.css'

const MODES: { id: C2Mode; label: string }[] = [
  { id: 'value', label: '求价值 v' },
  { id: 'count', label: '价值恒 1 · 数个数' },
]

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

/** 二维费用背包演示：dp[费用2][费用1]，逐件更新，高亮 dp[x][y] ← dp[x−a][y−b]+v 的来源。 */
export default function KnapsackCost2DDemo() {
  const [items, setItems] = useState<C2Item[]>([
    { a: 1, b: 2, v: 3 },
    { a: 2, b: 1, v: 4 },
  ])
  const [capA, setCapA] = useState(4)
  const [capB, setCapB] = useState(4)
  const [mode, setMode] = useState<C2Mode>('value')
  const count = mode === 'count'

  const model = useMemo(() => cost2D(items, capA, capB, mode), [items, capA, capB, mode])
  const modelKey = `c2-${mode}-${capA}-${capB}-${items.map((it) => `${it.a}.${it.b}.${it.v}`).join('|')}`

  const setItem = (idx: number, patch: Partial<C2Item>) =>
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  const addItem = () => setItems((arr) => (arr.length < 3 ? [...arr, { a: 1, b: 1, v: 2 }] : arr))
  const removeItem = (idx: number) => setItems((arr) => (arr.length > 1 ? arr.filter((_, i) => i !== idx) : arr))

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">
            {count
              ? '物品（每件两种费用 a / b · 价值恒 1 只数个数 · 可改可增删）'
              : '物品（每件两种费用 a / b 与价值 v · 可改可增删）'}
          </div>
          <div className="kd__items">
            {items.map((it, idx) => (
              <div className="kd__item" key={idx}>
                <span className="kd__item-i">{idx + 1}</span>
                {items.length > 1 && (
                  <button className="kd__remove" onClick={() => removeItem(idx)} aria-label="删除物品">
                    <X size={12} />
                  </button>
                )}
                <Stepper label="费用1 a" value={it.a} min={1} max={capA} onChange={(a) => setItem(idx, { a })} />
                <Stepper label="费用2 b" value={it.b} min={1} max={capB} onChange={(b) => setItem(idx, { b })} />
                {count ? (
                  <div>
                    <div className="stepper__lab">价值</div>
                    <div className="stepper__row" style={{ justifyContent: 'center' }}>
                      <span className="stepper__val" title="数个数模式下每件价值恒为 1">恒 1</span>
                    </div>
                  </div>
                ) : (
                  <Stepper label="价值 v" value={it.v} min={1} max={30} onChange={(v) => setItem(idx, { v })} />
                )}
              </div>
            ))}
            {items.length < 3 && (
              <button className="kd__add" onClick={addItem}>
                <Plus size={15} /> 加件
              </button>
            )}
          </div>
        </div>
        <div>
          <div className="kd__group-label">费用1 上限 A</div>
          <Stepper label="A" value={capA} min={2} max={6} onChange={setCapA} />
        </div>
        <div>
          <div className="kd__group-label">费用2 上限 B</div>
          <Stepper label="B" value={capB} min={2} max={6} onChange={setCapB} />
        </div>
      </div>

      <div className="kd__modes">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`kd__mode${mode === m.id ? ' on' : ''}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
