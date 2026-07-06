import { useMemo, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { mixedKnapsack, unitCount } from './mixedSolver'
import type { MixItem, MixKind } from './mixedSolver'
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

const KINDS: { k: MixKind; label: string }[] = [
  { k: '01', label: '01' },
  { k: 'complete', label: '完全' },
  { k: 'multiple', label: '多重' },
]

/** 混合背包演示：每件可切「件数属性」，三类物品落在同一维 f[j] 上，各按 01 倒序 / 完全正序 / 多重拆包处理。 */
export default function KnapsackMixedDemo() {
  const [items, setItems] = useState<MixItem[]>([
    { kind: '01', w: 2, v: 3 },
    { kind: 'complete', w: 3, v: 4 },
  ])
  const [cap, setCap] = useState(9)

  const model = useMemo(() => mixedKnapsack(items, cap), [items, cap])
  const units = useMemo(() => unitCount(items), [items])

  const modelKey = `mix-${cap}-${items.map((it) => `${it.kind}.${it.w}.${it.v}.${it.m ?? 0}`).join('_')}`

  const setItem = (i: number, patch: Partial<MixItem>) =>
    setItems((arr) => arr.map((it, k) => (k === i ? { ...it, ...patch } : it)))

  const setKind = (i: number, kind: MixKind) =>
    setItem(i, kind === 'multiple' ? { kind, m: items[i].m ?? 3 } : { kind })

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">物品（切类型 · 改重量 / 价值 / 件数）</div>
          <div className="kd__items">
            {items.map((it, i) => (
              <div className="kd__item" key={i} style={{ flexDirection: 'column', gap: 10 }}>
                <span className="kd__item-i">{i + 1}</span>
                {items.length > 1 && (
                  <button className="kd__remove" onClick={() => setItems((a) => a.filter((_, k) => k !== i))} aria-label="删除物品">
                    <X size={12} />
                  </button>
                )}
                <div className="kd__modes" style={{ margin: 0 }}>
                  {KINDS.map(({ k, label }) => (
                    <button key={k} className={`kd__mode${it.kind === k ? ' on' : ''}`} onClick={() => setKind(i, k)}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  <Stepper label="重量 w" value={it.w} min={1} max={cap} onChange={(w) => setItem(i, { w })} />
                  <Stepper label="价值 v" value={it.v} min={1} max={30} onChange={(v) => setItem(i, { v })} />
                  {it.kind === 'multiple' && (
                    <Stepper label="件数 m" value={it.m ?? 3} min={1} max={6} onChange={(m) => setItem(i, { m })} />
                  )}
                </div>
              </div>
            ))}
            {items.length < 4 && (
              <button className="kd__add" onClick={() => setItems((a) => [...a, { kind: '01', w: 2, v: 3 }])}>
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
        三类物品共用<b className="you"> 同一维 f[j] </b>：01 件<b className="you">倒序</b>、完全件<b className="ok">正序</b>、多重件<b className="you">拆包后倒序</b>。当前共展开{' '}
        <b className="you">{units}</b> 个转移单元（多重件按二进制拆分计）。
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
