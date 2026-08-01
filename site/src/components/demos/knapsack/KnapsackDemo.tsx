import { useEffect, useMemo, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import type { DPVizPlaybackState } from '../../dp-engine/DPViz'
import { knapsack2D, knapsack1D } from './solvers'
import type { Item, Mode1D } from './solvers'
import { KnapsackInstrumentCore } from './KnapsackInstrumentCore.tsx'
import type { KnapsackInstrumentPlayback } from './KnapsackInstrumentCore.tsx'
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
  const [draft, setDraft] = useState(String(value))

  useEffect(() => setDraft(String(value)), [value])

  const commit = () => {
    const parsed = Number(draft)
    if (!Number.isFinite(parsed)) {
      setDraft(String(value))
      return
    }
    const next = Math.min(max, Math.max(min, Math.trunc(parsed)))
    setDraft(String(next))
    onChange(next)
  }

  return (
    <div>
      <div className="stepper__lab">{label}</div>
      <div className="stepper__row">
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`${label} 减`}>
          <Minus size={13} />
        </button>
        <input
          className="stepper__val"
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={draft}
          aria-label={`${label} 数值`}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur()
          }}
        />
        <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`${label} 加`}>
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

function getPlaybackFocus(
  items: readonly Item[],
  capacity: number,
  mode: Mode,
  model: ReturnType<typeof knapsack2D>,
  playback: DPVizPlaybackState,
): KnapsackInstrumentPlayback {
  const frame = model.frames[Math.min(playback.index, model.frames.length - 1)]
  if (playback.index === 0 || !frame.active) {
    return {
      step: playback.index,
      count: playback.count,
      itemIndex: null,
      capacity: playback.index >= model.frames.length - 1 ? capacity : null,
      decision: playback.index >= model.frames.length - 1 ? 'complete' : 'idle',
      playing: playback.playing,
    }
  }

  let itemIndex: number | null = mode === '2D' ? frame.active.r : null
  if (mode !== '2D') {
    let offset = playback.index - 1
    for (let index = 0; index < items.length; index += 1) {
      const itemSteps = Math.max(0, capacity - items[index].w + 1)
      if (offset < itemSteps) {
        itemIndex = index + 1
        break
      }
      offset -= itemSteps
    }
  }

  const invalid = Object.values(frame.states).includes('invalid')
  const takesItem = frame.arrows?.some((arrow) => arrow.kind === 'chosen' && arrow.from.c < arrow.to.c) ?? false

  return {
    step: playback.index,
    count: playback.count,
    itemIndex,
    capacity: frame.active.c,
    decision: invalid ? 'invalid' : takesItem ? 'take' : 'skip',
    playing: playback.playing,
  }
}

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
  const [playback, setPlayback] = useState<DPVizPlaybackState>({
    index: 0,
    count: model.frames.length,
    playing: false,
  })

  useEffect(() => {
    setPlayback({ index: 0, count: model.frames.length, playing: false })
  }, [model.frames.length, modelKey])

  const instrumentPlayback = useMemo(
    () => getPlaybackFocus(items, cap, mode, model, playback),
    [cap, items, mode, model, playback],
  )

  const setItem = (i: number, patch: Partial<Item>) =>
    setItems((arr) => arr.map((it, k) => (k === i ? { ...it, ...patch } : it)))

  return (
    <div className="kd demo-editor">
      <KnapsackInstrumentCore
        items={items}
        capacity={cap}
        mode={mode}
        variant={variant}
        playback={instrumentPlayback}
      />

      <details className="knapsack-settings" open>
        <summary>自主设计物品、容量与计算模式</summary>
        <div className="knapsack-settings__body">
          <div className="demo-control__toolbar">
            <div>
              <div className="demo-control__group-label">物品（直接输入重量 / 价值，最多 8 件）</div>
              <div className="demo-control__items">
                {items.map((it, i) => (
                  <div className="demo-control__item" key={i}>
                    <span className="demo-control__item-i">{i + 1}</span>
                    {items.length > 1 && (
                      <button className="demo-control__remove" onClick={() => setItems((a) => a.filter((_, k) => k !== i))} aria-label="删除物品">
                        <X size={12} />
                      </button>
                    )}
                    <Stepper label="重量 w" value={it.w} min={1} max={60} onChange={(w) => setItem(i, { w })} />
                    <Stepper label="价值 v" value={it.v} min={1} max={999} onChange={(v) => setItem(i, { v })} />
                  </div>
                ))}
                {items.length < 8 && (
                  <button className="demo-control__add" onClick={() => setItems((a) => [...a, { w: 2, v: 3 }])}>
                    <Plus size={15} /> 加物品
                  </button>
                )}
              </div>
            </div>
            <div>
              <div className="demo-control__group-label">背包容量（直接输入 1–60）</div>
              <Stepper label="m" value={cap} min={1} max={60} onChange={setCap} />
            </div>
          </div>

          {variant === '01' && (
            <div className="demo-control__modes">
              {MODES_01.map((m) => (
                <button
                  key={m.id}
                  className={`demo-control__mode${m.danger ? ' danger' : ''}${mode === m.id ? ' on' : ''}`}
                  onClick={() => setMode(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </details>

      <DPViz key={modelKey} model={model} onPlaybackChange={setPlayback} />
    </div>
  )
}
