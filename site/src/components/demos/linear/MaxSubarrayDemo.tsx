import { useMemo, useState } from 'react'
import { Minus, Plus, X, RotateCcw } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { kadane, kadaneAnswer } from './maxsegSolver'
import '../shared/demo-workbench.css'

/** 单个数值的增减控件（允许负数）。 */
function NumStepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="stepper__row">
      <button onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="减">
        <Minus size={13} />
      </button>
      <span className="stepper__val">{value}</span>
      <button onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="加">
        <Plus size={13} />
      </button>
    </div>
  )
}

const PRESETS: { label: string; a: number[] }[] = [
  { label: '含负数（默认）', a: [-2, 11, -4, 13, -5, -2] },
  { label: '经典混合', a: [4, -1, 2, 1, -5, 4] },
  { label: '全负（答案取最大的单个）', a: [-3, -1, -4, -1, -5] },
]

/**
 * Kadane 主演示：一维 dp[i]=max(dp[i-1]+a[i], a[i])，逐帧高亮「接续 vs 另起」并追踪全局最大。
 * 上行 a[]（可编辑，含负数），下行 dp[]。数组长度 3–8，元素范围 −9..14。
 */
export default function MaxSubarrayDemo() {
  const [a, setA] = useState<number[]>([-2, 11, -4, 13, -5, -2])

  const model = useMemo(() => kadane(a), [a])
  const answer = useMemo(() => kadaneAnswer(a), [a])
  const modelKey = `kad-${a.join('_')}`

  const setAt = (i: number, v: number) => setA((arr) => arr.map((x, k) => (k === i ? v : x)))
  const removeAt = (i: number) => setA((arr) => arr.filter((_, k) => k !== i))
  const addOne = () => setA((arr) => [...arr, 1])

  return (
    <div>
      <div className="demo-control__toolbar">
        <div>
          <div className="demo-control__group-label">数组 a[]（可增删 · 可为负数）</div>
          <div className="demo-control__items">
            {a.map((v, i) => (
              <div className="demo-control__item" key={i}>
                <span className="demo-control__item-i">{i}</span>
                {a.length > 2 && (
                  <button className="demo-control__remove" onClick={() => removeAt(i)} aria-label="删除元素">
                    <X size={12} />
                  </button>
                )}
                <NumStepper value={v} min={-9} max={14} onChange={(nv) => setAt(i, nv)} />
              </div>
            ))}
            {a.length < 8 && (
              <button className="demo-control__add" onClick={addOne}>
                <Plus size={15} /> 加一位
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="demo-control__modes">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className={`demo-control__mode ${a.join(',') === p.a.join(',') ? 'on' : ''}`}
            onClick={() => setA(p.a)}
          >
            {p.label}
          </button>
        ))}
        <button className="demo-control__mode" onClick={() => setA(PRESETS[0].a)} title="回到默认">
          <RotateCcw size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
          复位
        </button>
      </div>

      <div className="demo-contrast__readout">
        最大子段和 = dp[] 的全局最大值：<b className="ok">{answer}</b>
        {a.every((x) => x < 0) && <>（全为负数时，答案就是其中最大的那个单个元素）</>}
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
