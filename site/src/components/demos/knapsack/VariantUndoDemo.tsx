import { useMemo, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { undoKnapsack } from './variantUndoSolver'
import type { UndoItem } from './variantUndoSolver'
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
 * 撤销可视化演示（洛谷 P4141「消失之物」）：
 * 先算含全部物品的全集方案数 f[j]，再选定「让第几件消失」，
 * 对它做逆操作 g[j] -= g[j-w] 正序退掉，看「缺这件」的方案数长出来。
 * 物品重量可编辑；目标容量 W ≤ 12；用按钮组挑选要消失的物品。
 */
export default function VariantUndoDemo() {
  const [items, setItems] = useState<UndoItem[]>([{ w: 2 }, { w: 3 }, { w: 5 }])
  const [cap, setCap] = useState(5)
  const [victim, setVictim] = useState(2) // 默认让第 3 件（w=5）消失 → g[5] 应从 2 降到 1

  // victim 落在合法范围内（物品增删后夹回）。
  const k = Math.min(victim, items.length - 1)

  const model = useMemo(() => undoKnapsack(items, cap, k), [items, cap, k])

  // 末帧读数：全集 f[W] 与缺第 k 件 g[W]。
  const last = model.frames[model.frames.length - 1].values
  const fAns = (last[0]?.[cap] as number) ?? 0
  const gAns = (last[1]?.[cap] as number) ?? 0

  const modelKey = `undo-${cap}-${k}-${items.map((it) => it.w).join('_')}`

  const setItem = (i: number, patch: Partial<UndoItem>) =>
    setItems((arr) => arr.map((it, kk) => (kk === i ? { ...it, ...patch } : it)))

  const removeItem = (i: number) =>
    setItems((arr) => {
      const next = arr.filter((_, kk) => kk !== i)
      if (victim >= next.length) setVictim(Math.max(next.length - 1, 0))
      else if (i < victim) setVictim((v) => v - 1)
      return next
    })

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
                  <button className="kd__remove" onClick={() => removeItem(i)} aria-label="删除物品">
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

      <div>
        <div className="kd__group-label">让第几件「消失」（对它做逆操作退掉）</div>
        <div className="kd__modes">
          {items.map((it, i) => (
            <button
              key={i}
              className={`kd__mode danger${i === k ? ' on' : ''}`}
              onClick={() => setVictim(i)}
            >
              第 {i + 1} 件 · w={it.w}
            </button>
          ))}
        </div>
      </div>

      <div className="fbug__readout">
        全集 <b className="you">f[{cap}] = {fAns}</b> ，让<b className="you">第 {k + 1} 件（w={items[k]?.w}）</b>消失后 ，
        缺它的方案数 <b className="ok">g[{cap}] = {gAns}</b>
        {fAns !== gAns && (
          <>——退掉了 <b className="bad">{fAns - gAns}</b> 种「用到第 {k + 1} 件」的方案。</>
        )}
        {fAns === gAns && <>——该件在容量 {cap} 上没参与任何方案，退掉前后不变。</>}
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
