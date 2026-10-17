import { useMemo, useState } from 'react'
import { Minus, Plus, X, Shuffle } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import fsmHeroArt from '../../../assets/demo-art/fsm-instrument-v1.avif'
import { DemoSculptureHero } from '../shared'
import { solveLinearFsm } from '../../../algorithms/linear-fsm/index.ts'
import { fsmPickTable } from './fsmSolver'
import '../shared/demo-workbench.css'

// 三組預設：預設打家劫舍經典樣例 [1,2,3,1] → 最大不相鄰和 4（選 a1+a3）；
// 「間隔明顯」凸顯跳選；「遞增」看它權衡相鄰大值。
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
    <div className="demo-control__item">
      {removable && (
        <button type="button" className="demo-control__remove" onClick={onRemove} aria-label="删除元素">
          <X size={12} />
        </button>
      )}
      <div>
        <div className="stepper__lab">a 值</div>
        <div className="stepper__row">
          <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="减">
            <Minus size={13} />
          </button>
          <span className="stepper__val">{value}</span>
          <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="加">
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * 主演示 · 選 / 不選兩狀態填表（打家劫舍 / 選不相鄰式）。
 * 二維 dp[狀態][位置]：行 0=不選、行 1=選，逐位置逐狀態填，
 * 高亮每格在上一位置的兩個來源。陣列可編輯，即時重算並重播。
 */
export default function StateMachineDemo() {
  const [a, setA] = useState<number[]>(PRESETS[0].a)

  const model = useMemo(() => fsmPickTable(a), [a])
  const ans = useMemo(() => solveLinearFsm(a).value, [a])

  const modelKey = `fsm-${a.join('_')}`

  const setAt = (i: number, v: number) => setA((arr) => arr.map((x, k) => (k === i ? v : x)))
  const removeAt = (i: number) => setA((arr) => arr.filter((_, k) => k !== i))
  const addOne = () => setA((arr) => [...arr, Math.max(1, arr[arr.length - 1] ?? 1)])

  return (
    <div>
      <DemoSculptureHero family="b" lesson="fsm" src={fsmHeroArt} />
      <div className="demo-control__modes">
        {PRESETS.map((p) => (
          <button type="button"
            key={p.label}
            className={`demo-control__mode${a.join(',') === p.a.join(',') ? ' on' : ''}`}
            onClick={() => setA(p.a)}
          >
            {p.label}
          </button>
        ))}
        <button type="button" className="demo-control__mode" onClick={() => setA(shuffle(a))} title="打乱当前数组">
          <Shuffle size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
          打乱
        </button>
      </div>

      <div className="demo-control__toolbar">
        <div>
          <div className="demo-control__group-label">数组 a[]（每个值可增减；目标：选一批「两两不相邻」的数，使和最大）</div>
          <div className="demo-control__items">
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
              <button type="button" className="demo-control__add" onClick={addOne}>
                <Plus size={15} /> 加元素
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="demo-contrast__readout">
        当前数组的最大不相邻和：<b className="ok">ans = {ans}</b>
        <span className="you"> （= 末列 max(不选, 选)，任意两个被选的数下标都不相邻）</span>
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}

// 簡單洗牌（Fisher–Yates），保證與原陣列不同（長度≥2 時）。
function shuffle(src: number[]): number[] {
  const a = src.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  if (a.length >= 2 && a.join(',') === src.join(',')) [a[0], a[1]] = [a[1], a[0]]
  return a
}
