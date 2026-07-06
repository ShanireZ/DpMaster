import { useMemo, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { ringMerge } from './ringSolver'
import type { VizModel } from '../../dp-engine/types'
import '../knapsack/knapsack-demo.css'

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

// 末帧里被标为 chosen 的那格值 = 环形最优答案（收尾帧把最优窗口涂成 chosen）。
const ringAnswer = (m: VizModel): number => {
  const last = m.frames[m.frames.length - 1].values
  let best: number | null = null
  const n = last.length / 2
  for (let i = 0; i < n; i++) {
    const v = last[i][i + n - 1]
    if (v != null && (best == null || v < best)) best = v
  }
  return best ?? 0
}

/** 环形石子合并（断环为链）演示：环上 n 堆复制成 2n 链，在链上跑区间三角表，取长度 n 窗口最优。可改环上数值。 */
export default function RingIntervalDemo() {
  const [stones, setStones] = useState<number[]>([3, 9, 3, 4])

  const model = useMemo(() => ringMerge(stones, 'min'), [stones])
  const ans = ringAnswer(model)
  const modelKey = `ring-${stones.join('_')}`

  const setStone = (i: number, val: number) =>
    setStones((arr) => arr.map((s, k) => (k === i ? val : s)))
  const addStone = () => setStones((arr) => (arr.length < 4 ? [...arr, 3] : arr))
  const removeStone = (i: number) =>
    setStones((arr) => (arr.length > 3 ? arr.filter((_, k) => k !== i) : arr))

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">环上石子（首尾相邻 · 可改每堆数值 · 3～4 堆）</div>
          <div className="kd__items">
            {stones.map((s, i) => (
              <div className="kd__item" key={i}>
                <span className="kd__item-i">{i}</span>
                {stones.length > 3 && (
                  <button className="kd__remove" onClick={() => removeStone(i)} aria-label="删除该堆">
                    <X size={12} />
                  </button>
                )}
                <Stepper label="石子数 a" value={s} min={1} max={20} onChange={(v) => setStone(i, v)} />
              </div>
            ))}
            {stones.length < 4 && (
              <button className="kd__add" onClick={addStone}>
                <Plus size={14} /> 加一堆
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="fbug__readout">
        断环为链后在 <b>2n = {stones.length * 2}</b> 长的链上填三角表，扫 {stones.length} 个长度{' '}
        {stones.length} 的窗口 → 环形<b className="ok">最小合并代价 = {ans}</b>。默认{' '}
        <b>a=[3,9,3,4]</b> 时答案 <b className="ok">36</b>，落在起点 <b>1</b> 的窗口（即环上从第 1 堆断开、绕过尾首那一整圈），
        比朴素当成直链的 dp[0][3]=38 更省——这正是「环」多出来的那条边带来的收益。
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
