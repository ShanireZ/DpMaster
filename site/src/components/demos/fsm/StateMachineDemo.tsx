import { useMemo, useState } from 'react'
import { Minus, Plus, X, Shuffle } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { fsmPickTable } from './fsmSolver'
import '../knapsack/knapsack-demo.css'

// 三组预设：默认打家劫舍经典样例 [1,2,3,1] → 最大不相邻和 4（选 a1+a3）；
// 「间隔明显」凸显跳选；「递增」看它权衡相邻大值。
const PRESETS: { label: string; a: number[] }[] = [
  { label: '经典样例', a: [1, 2, 3, 1] },
  { label: '大谷两侧', a: [2, 7, 9, 3, 1] },
  { label: '连号递增', a: [1, 2, 3, 4, 5] },
]

function NumStepper({
  value,
  min,
  max,
  onChange,
  onRemove,
  removable,
}: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  onRemove: () => void
  removable: boolean
}) {
  return (
    <div className="kd__item">
      {removable && (
        <button className="kd__remove" onClick={onRemove} aria-label="删除元素">
          <X size={12} />
        </button>
      )}
      <div>
        <div className="stepper__lab">a 值</div>
        <div className="stepper__row">
          <button onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="减">
            <Minus size={13} />
          </button>
          <span className="stepper__val">{value}</span>
          <button onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="加">
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * 主演示 · 选 / 不选两状态填表（打家劫舍 / 选不相邻式）。
 * 二维 dp[状态][位置]：行 0=不选、行 1=选，逐位置逐状态填，
 * 高亮每格在上一位置的两个来源。数组可编辑，实时重算并重播。
 */
export default function StateMachineDemo() {
  const [a, setA] = useState<number[]>(PRESETS[0].a)

  const model = useMemo(() => fsmPickTable(a), [a])
  const ans = useMemo(() => {
    const last = model.frames[model.frames.length - 1].values
    return Math.max(last[0][a.length] ?? 0, last[1][a.length] ?? 0)
  }, [model, a])

  const modelKey = `fsm-${a.join('_')}`

  const setAt = (i: number, v: number) => setA((arr) => arr.map((x, k) => (k === i ? v : x)))
  const removeAt = (i: number) => setA((arr) => arr.filter((_, k) => k !== i))
  const addOne = () => setA((arr) => [...arr, Math.max(1, arr[arr.length - 1] ?? 1)])

  return (
    <div>
      <div className="kd__modes">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className={`kd__mode${a.join(',') === p.a.join(',') ? ' on' : ''}`}
            onClick={() => setA(p.a)}
          >
            {p.label}
          </button>
        ))}
        <button className="kd__mode" onClick={() => setA(shuffle(a))} title="打乱当前数组">
          <Shuffle size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
          打乱
        </button>
      </div>

      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">数组 a[]（每个值可增减；目标：选一批「两两不相邻」的数，使和最大）</div>
          <div className="kd__items">
            {a.map((v, i) => (
              <NumStepper
                key={i}
                value={v}
                min={1}
                max={20}
                onChange={(nv) => setAt(i, nv)}
                onRemove={() => removeAt(i)}
                removable={a.length > 2}
              />
            ))}
            {a.length < 9 && (
              <button className="kd__add" onClick={addOne}>
                <Plus size={15} /> 加元素
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="fbug__readout">
        当前数组的最大不相邻和：<b className="ok">ans = {ans}</b>
        <span className="you"> （= 末列 max(不选, 选)，任意两个被选的数下标都不相邻）</span>
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}

// 简单洗牌（Fisher–Yates），保证与原数组不同（长度≥2 时）。
function shuffle(src: number[]): number[] {
  const a = src.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  if (a.length >= 2 && a.join(',') === src.join(',')) [a[0], a[1]] = [a[1], a[0]]
  return a
}
