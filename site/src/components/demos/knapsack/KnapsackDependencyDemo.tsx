import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { dependencyKnapsack, enumCombos } from './dependencySolver'
import type { Master, Accessory } from './dependencySolver'
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
 * 有依赖的背包演示：1 个主件 + 2 个附件，可改 w / v。
 * 先把「主 + 附件子集」枚举成 4 个组合，再把这 4 个组合当作同一组做分组背包。
 */
export default function KnapsackDependencyDemo() {
  const [master, setMaster] = useState<Master>({ w: 2, v: 3 })
  const [acc, setAcc] = useState<Accessory[]>([
    { w: 2, v: 4 },
    { w: 3, v: 5 },
  ])
  const [cap, setCap] = useState(7)

  const combos = useMemo(() => enumCombos(master, acc), [master, acc])
  const model = useMemo(() => dependencyKnapsack(master, acc, cap), [master, acc, cap])
  const modelKey = `dep-${cap}-${master.w}.${master.v}-${acc.map((a) => `${a.w}.${a.v}`).join('_')}`

  const setAccItem = (i: number, patch: Partial<Accessory>) =>
    setAcc((arr) => arr.map((a, k) => (k === i ? { ...a, ...patch } : a)))

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">主件（必选前提）· 可改 w / v</div>
          <div
            style={{
              display: 'inline-flex',
              gap: 14,
              padding: '10px 12px',
              borderRadius: 'var(--r-2)',
              border: '1px solid var(--accent-2)',
              background: 'color-mix(in srgb, var(--accent-1) 8%, var(--surface-3))',
            }}
          >
            <Stepper label="主件 w" value={master.w} min={1} max={cap} onChange={(w) => setMaster((m) => ({ ...m, w }))} />
            <Stepper label="主件 v" value={master.v} min={1} max={30} onChange={(v) => setMaster((m) => ({ ...m, v }))} />
          </div>
        </div>
        <div>
          <div className="kd__group-label">附件（依主件而选）· 可改 w / v</div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            {acc.map((a, i) => (
              <div className="kd__item" key={i}>
                <span className="kd__item-i">附{i + 1}</span>
                <Stepper label="w" value={a.w} min={1} max={cap} onChange={(w) => setAccItem(i, { w })} />
                <Stepper label="v" value={a.v} min={1} max={30} onChange={(v) => setAccItem(i, { v })} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="kd__group-label">背包容量</div>
          <Stepper label="W" value={cap} min={2} max={12} onChange={setCap} />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--sp-3)',
          marginBottom: 'var(--sp-4)',
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--text-3)', alignSelf: 'center', letterSpacing: '0.04em' }}>
          枚举出的 {combos.length} 个组合（同一组，至多选一个）：
        </span>
        {combos.map((c, i) => (
          <span
            key={i}
            className="mono"
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 12.5,
              background: c.w <= cap ? 'color-mix(in srgb, var(--accent-1) 12%, var(--surface-2))' : 'var(--surface-2)',
              border: `1px solid ${c.w <= cap ? 'var(--accent-2)' : 'var(--border)'}`,
              color: c.w <= cap ? 'var(--text-1)' : 'var(--text-3)',
            }}
          >
            {c.label}: (w={c.w}, v={c.v})
          </span>
        ))}
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
