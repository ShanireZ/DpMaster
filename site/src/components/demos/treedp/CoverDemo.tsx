import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useStepPlayer } from '../../dp-engine/playback/useStepPlayer'
import { buildTree, layoutTree, solveDominatingSet } from './treedpSolver'
import { TreeCanvas, StepBar, Legend, Panel, type NodePaint } from './TreeCanvas'
import '../knapsack/knapsack-demo.css'
import './treedp-demo.css'

//        1
//      / |  \
//     2  3   4
//        |
//        5
const PARENT = [-1, 0, 0, 0, 2]

function CStepper({ i, value, onChange }: { i: number; value: number; onChange: (v: number) => void }) {
  return (
    <div className="td__node-chip">
      <span className="td__node-dot">{i + 1}</span>
      <div>
        <div className="stepper__lab">哨点 {i + 1} · 造价</div>
        <div className="stepper__row">
          <button onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="减">
            <Minus size={13} />
          </button>
          <span className="stepper__val">{value}</span>
          <button onClick={() => onChange(value + 1)} disabled={value >= 20} aria-label="加">
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

const INF = 1e9
const fmt = (x: number) => (x >= INF ? '∞' : String(x))

export default function CoverDemo() {
  const [w, setW] = useState<number[]>([5, 3, 4, 6, 2])

  const tree = useMemo(() => buildTree(PARENT, w), [w])
  const layout = useMemo(() => layoutTree(tree), [tree])
  const res = useMemo(() => solveDominatingSet(tree), [tree])

  const inputsHash = w.join('_')
  const p = useStepPlayer(res.steps.length)
  const step = res.steps[Math.min(p.index, res.steps.length - 1)]
  const isLastFrame = p.index >= res.steps.length - 1
  const settledSet = useMemo(() => new Set(step.settled), [step])
  const justDone = step.u

  const paintNode = (id: number): NodePaint => {
    const settled = settledSet.has(id)
    const isCurrent = id === justDone && !isLastFrame
    const isGuard = isLastFrame && res.guards.has(id)
    let fill = 'var(--surface-3)'
    let stroke = 'var(--border-strong)'
    let textColor = 'var(--text-1)'
    if (isGuard) {
      fill = 'color-mix(in srgb, var(--viz-chosen) 30%, var(--surface-3))'
      stroke = 'var(--viz-chosen)'
    } else if (isLastFrame) {
      // 非警卫点：被覆盖，淡青
      fill = 'color-mix(in srgb, var(--viz-source) 16%, var(--surface-3))'
      stroke = 'var(--viz-source)'
    } else if (isCurrent) {
      fill = 'var(--grad-accent)'
      stroke = 'var(--accent-2)'
      textColor = 'var(--text-on-accent)'
    } else if (settled) {
      fill = 'color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))'
      stroke = 'var(--accent-2)'
    }
    const sub = settled
      ? [`${fmt(res.d0[id])}/${fmt(res.d1[id])}/${fmt(res.d2[id])}`]
      : [`¥${w[id]}`]
    return { fill, stroke, strokeWidth: isCurrent ? 2.6 : settled ? 2 : 1.6, textColor, sub, dim: !settled && !isCurrent }
  }

  const setWeight = (i: number, v: number) => setW((arr) => arr.map((x, k) => (k === i ? v : x)))

  return (
    <div>
      <div className="td__toolbar">
        <div>
          <div className="td__group-label">改每个哨点的造价，看三状态 dp0/dp1/dp2 重算</div>
          <div className="td__nodes">
            {w.map((v, i) => (
              <CStepper key={i} i={i} value={v} onChange={(nv) => setWeight(i, nv)} />
            ))}
          </div>
        </div>
      </div>

      <div className="td__hint">
        节点下方 <b>dp0 / dp1 / dp2</b> 三值 = <b>放警卫</b> / <b>被孩子覆盖</b> / <b>空着等父亲</b> 三种局面的最小造价。
        根不许停在 dp2（没人能覆盖它），答案 = min(dp0[1], dp1[1]) = <b className="ans">{res.ans}</b>。
      </div>

      <div className="td__stage">
        <TreeCanvas
          key={inputsHash}
          layout={layout}
          paintNode={paintNode}
          ariaLabel="树上最小支配集三状态后序动画"
        />
      </div>

      <StepBar player={p} />

      <Legend
        items={[
          { color: 'var(--accent-2)', label: '当前处理' },
          { color: 'var(--viz-chosen)', label: '放了警卫' },
          { color: 'var(--viz-source)', label: '被覆盖(无警卫)' },
        ]}
      />

      <Panel html={step.caption} />

      {isLastFrame && (
        <div className="td__readout">
          最省方案在{' '}
          <b>{[...res.guards].sort((a, b) => a - b).map((i) => `${i + 1}号`).join('、') || '（空）'}</b>{' '}
          放警卫，总造价 <b className="ans">{res.ans}</b>。每个点要么自己是警卫，要么与某个警卫相邻——<strong>全被支配</strong>。
        </div>
      )}
    </div>
  )
}
