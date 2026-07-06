import { useMemo, useState } from 'react'
import { Minus, Plus, X, Sparkles, RefreshCw } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { kadane, kadaneAnswer, minSegViz, minSegAnswer } from './maxsegSolver'
import '../knapsack/knapsack-demo.css'

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
  { label: '跨首尾更优（默认）', a: [2, -1, 2, -1, 2] },
  { label: '首尾各一大块', a: [8, -4, -3, -4, 8] },
  { label: '不跨首尾（普通即最优）', a: [-1, 5, 6, -2, -3] },
]

/**
 * 环形最大子段：普通 Kadane vs 环形（总和 − 最小子段）并排对照。
 * 左：不跨首尾的最大子段和；右：把 max 换成 min 求最小子段，total − minSeg = 绕首尾的最大段。
 * 最终答案 = max(两者)。当最优段跨越首尾时，右边的补集技巧胜出。
 */
export default function MaxSegRingDemo() {
  const [a, setA] = useState<number[]>([2, -1, 2, -1, 2])

  const normalModel = useMemo(() => kadane(a), [a])
  const minModel = useMemo(() => minSegViz(a), [a])
  const normal = useMemo(() => kadaneAnswer(a), [a])
  const total = useMemo(() => a.reduce((s, x) => s + x, 0), [a])
  const minSeg = useMemo(() => minSegAnswer(a), [a])
  // 若全为正，最小子段 = 最小单元素，total−minSeg 会「绕整圈重复计入」；此时环形退化为普通。
  const allPos = a.every((x) => x > 0)
  const wrap = allPos ? -Infinity : total - minSeg
  const ans = Math.max(normal, wrap)
  const wrapWins = wrap > normal

  const k = a.join('_')
  const setAt = (i: number, v: number) => setA((arr) => arr.map((x, j) => (j === i ? v : x)))
  const removeAt = (i: number) => setA((arr) => arr.filter((_, j) => j !== i))

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">环形数组 a[]（首尾相接 · 可为负数）</div>
          <div className="kd__items">
            {a.map((v, i) => (
              <div className="kd__item" key={i}>
                <span className="kd__item-i">{i}</span>
                {a.length > 3 && (
                  <button className="kd__remove" onClick={() => removeAt(i)} aria-label="删除元素">
                    <X size={12} />
                  </button>
                )}
                <NumStepper value={v} min={-9} max={14} onChange={(nv) => setAt(i, nv)} />
              </div>
            ))}
            {a.length < 7 && (
              <button className="kd__add" onClick={() => setA((arr) => [...arr, 1])}>
                <Plus size={15} /> 加一位
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="kd__modes">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className={`kd__mode ${a.join(',') === p.a.join(',') ? 'on' : ''}`}
            onClick={() => setA(p.a)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="fbug__readout">
        普通 Kadane <b className="you">{normal}</b> · 环形（total − minSeg = {total} − ({minSeg})）
        {allPos ? <b className="you"> 不适用</b> : <b className="ok"> {wrap}</b>} · 取较大 → 答案{' '}
        <b className="ok">{ans}</b>
        {allPos ? (
          <>（全为正数：整段就是最优，环形补集会绕整圈重复，退化为普通）</>
        ) : wrapWins ? (
          <>
            （<b className="ok">最优段跨过首尾</b>，补集技巧胜出）
          </>
        ) : (
          <>（最优段不跨首尾，普通 Kadane 已够）</>
        )}
      </div>

      <div className="fbug__pair">
        <div>
          <div className="fbug__side-label you">
            <Sparkles size={15} /> 普通 Kadane · 不跨首尾的最大子段
          </div>
          <DPViz key={`n${k}`} model={normalModel} />
        </div>
        <div>
          <div className="fbug__side-label ok">
            <RefreshCw size={15} /> 环形补集 · 求最小子段，再 total − minSeg
          </div>
          <DPViz key={`m${k}`} model={minModel} />
        </div>
      </div>
    </div>
  )
}
