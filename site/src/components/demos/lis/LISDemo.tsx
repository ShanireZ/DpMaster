import { useMemo, useState } from 'react'
import { Minus, Plus, X, Shuffle } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { lisNaive } from './lisSolver'
import '../knapsack/knapsack-demo.css'

// 三组预设：默认题最优 LIS=5；「已排好序」全升 → LIS=n；「递减」→ LIS=1。
const PRESETS: { label: string; a: number[] }[] = [
  { label: '经典乱序', a: [2, 1, 5, 3, 6, 4, 8, 9, 7] },
  { label: '已升序', a: [1, 2, 3, 4, 5, 6] },
  { label: '严格递减', a: [7, 5, 4, 3, 1] },
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
 * O(n²) LIS 主演示：一维 dp[i]「以 a[i] 结尾的最长上升子序列长度」，逐格填表。
 * 数组可编辑（改每个值 / 加删元素 / 一键换预设），实时重算并重播动画。
 */
export default function LISDemo() {
  const [a, setA] = useState<number[]>(PRESETS[0].a)

  const model = useMemo(() => lisNaive(a), [a])
  const ans = useMemo(() => Math.max(...a.map((_, i) => model.frames[model.frames.length - 1].values[1][i] ?? 1)), [model, a])

  // key 变 → DPViz remount 重播。
  const modelKey = `lis-${a.join('_')}`

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
          <div className="kd__group-label">数组 a[]（每个值可增减；上升即可，重复值不算「上升」）</div>
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
            {a.length < 10 && (
              <button className="kd__add" onClick={addOne}>
                <Plus size={15} /> 加元素
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="fbug__readout">
        当前数组的最长上升子序列长度：<b className="ok">LIS = {ans}</b>
        <span className="you"> （= dp[] 全行最大值，可在任意位置结尾）</span>
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
