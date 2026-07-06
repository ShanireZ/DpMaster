import { useMemo, useState } from 'react'
import { Minus, Plus, X, Check } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { groupOrderCorrect, groupOrderWrong } from './groupOrderSolver'
import type { Group } from './groupSolver'
import type { GItem } from './groupSolver'
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

/**
 * 分组背包一维 · 循环顺序对错并排：
 * 左=容量倒序在「组内件」之外（每组至多一件，正确）；
 * 右=容量倒序沉到「组内件」里层（同组多件被叠加，答案偏大，错误）。
 * 默认单组 (2,3),(3,4) · W=5 → 正确 f[5]=4、错误 f[5]=7，正是本节手算的教学点。
 */
export default function GroupOrderContrastDemo() {
  const [groups, setGroups] = useState<Group[]>([
    [
      { w: 2, v: 3 },
      { w: 3, v: 4 },
    ],
  ])
  const [cap, setCap] = useState(5)

  const correct = useMemo(() => groupOrderCorrect(groups, cap), [groups, cap])
  const wrong = useMemo(() => groupOrderWrong(groups, cap), [groups, cap])
  const fOk = finalCap(correct, cap)
  const fBad = finalCap(wrong, cap)

  const modelKey = `go-${cap}-${groups.map((grp) => grp.map((it) => `${it.w}.${it.v}`).join('_')).join('|')}`

  const setItem = (gi: number, ii: number, patch: Partial<GItem>) =>
    setGroups((arr) => arr.map((grp, g) => (g === gi ? grp.map((it, i) => (i === ii ? { ...it, ...patch } : it)) : grp)))
  const addItem = (gi: number) =>
    setGroups((arr) => arr.map((grp, g) => (g === gi && grp.length < 3 ? [...grp, { w: 2, v: 3 }] : grp)))
  const removeItem = (gi: number, ii: number) =>
    setGroups((arr) => arr.map((grp, g) => (g === gi ? grp.filter((_, i) => i !== ii) : grp)))
  const addGroup = () => setGroups((arr) => (arr.length < 3 ? [...arr, [{ w: 2, v: 3 }]] : arr))
  const removeGroup = (gi: number) => setGroups((arr) => arr.filter((_, g) => g !== gi))

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">分组（组内至多一件 · 可改 w / v · 默认一组，可再加）</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
            {groups.map((grp, gi) => (
              <div
                key={gi}
                style={{
                  position: 'relative',
                  padding: '16px 12px 12px',
                  borderRadius: 'var(--r-2)',
                  border: '1px solid var(--border-strong)',
                  background: 'color-mix(in srgb, var(--accent-1) 5%, var(--surface-2))',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -11,
                    left: 12,
                    padding: '2px 10px',
                    borderRadius: 999,
                    background: 'var(--grad-accent)',
                    color: 'var(--text-on-accent)',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  组 {gi + 1}
                </div>
                {groups.length > 1 && (
                  <button
                    className="kd__remove"
                    style={{ top: -9, right: -9 }}
                    onClick={() => removeGroup(gi)}
                    aria-label="删除该组"
                  >
                    <X size={12} />
                  </button>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {grp.map((it, ii) => (
                    <div className="kd__item" key={ii}>
                      <span className="kd__item-i">{ii + 1}</span>
                      {grp.length > 1 && (
                        <button className="kd__remove" onClick={() => removeItem(gi, ii)} aria-label="删除物品">
                          <X size={12} />
                        </button>
                      )}
                      <Stepper label="重量 w" value={it.w} min={1} max={cap} onChange={(w) => setItem(gi, ii, { w })} />
                      <Stepper label="价值 v" value={it.v} min={1} max={30} onChange={(v) => setItem(gi, ii, { v })} />
                    </div>
                  ))}
                  {grp.length < 3 && (
                    <button className="kd__add" onClick={() => addItem(gi)}>
                      <Plus size={14} /> 加件
                    </button>
                  )}
                </div>
              </div>
            ))}
            {groups.length < 3 && (
              <button className="kd__add" style={{ alignSelf: 'center' }} onClick={addGroup}>
                <Plus size={15} /> 加一组
              </button>
            )}
          </div>
        </div>
        <div>
          <div className="kd__group-label">背包容量</div>
          <Stepper label="m" value={cap} min={2} max={10} onChange={setCap} />
        </div>
      </div>

      <div className="fbug__readout">
        正确顺序 <b className="ok">f[{cap}] = {fOk}</b>（每组至多一件） · 错误顺序 <b className="bad">f[{cap}] = {fBad}</b>
        {fBad > fOk ? (
          <>
            （错法把<b className="bad">同组多件</b>重复计入，答案被抬高了 <b className="bad">{fBad - fOk}</b>）
          </>
        ) : (
          <>（本组合下两种顺序恰好同值——试试让同组两件都装得下）</>
        )}
      </div>

      <div className="fbug__pair">
        <div>
          <div className="fbug__side-label ok">
            <Check size={15} /> 容量倒序在组内件之外 · 正确（每组至多一件）
          </div>
          <DPViz key={`ok${modelKey}`} model={correct} />
        </div>
        <div>
          <div className="fbug__side-label bad">
            <X size={15} /> 容量倒序沉进组内件里层 · 错误（同组多件被叠加）
          </div>
          <DPViz key={`bad${modelKey}`} model={wrong} />
        </div>
      </div>
    </div>
  )
}
