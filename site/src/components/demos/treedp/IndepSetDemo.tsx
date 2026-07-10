import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useStepPlayer } from '../../dp-engine/playback/useStepPlayer'
import { buildTree, layoutTree, solveIndepSet } from './treedpSolver'
import { TreeCanvas, StepBar, Legend, Panel, type NodePaint } from './TreeCanvas'
import '../knapsack/knapsack-demo.css'
import './treedp-demo.css'

// 固定一棵 6 点公司树，用户只改点权（欢乐值）。父亲数组（根 = 0，-1 表示根）。
//        1(董事长)
//       / |        \
//     2   3         4
//    / \
//   5   6
const PARENT = [-1, 0, 0, 0, 1, 1]
const LABELS = ['董事长', '经理A', '经理B', '主管', '员工X', '员工Y']

function WStepper({ i, value, onChange }: { i: number; value: number; onChange: (v: number) => void }) {
  return (
    <div className="td__node-chip">
      <span className="td__node-dot">{i + 1}</span>
      <div>
        <div className="stepper__lab">{LABELS[i]} · 欢乐值</div>
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

export default function IndepSetDemo() {
  const [w, setW] = useState<number[]>([3, 6, 2, 5, 4, 7])

  const tree = useMemo(() => buildTree(PARENT, w), [w])
  const layout = useMemo(() => layoutTree(tree), [tree])
  const res = useMemo(() => solveIndepSet(tree), [tree])

  const inputsHash = w.join('_')
  const p = useStepPlayer(res.steps.length)
  const step = res.steps[Math.min(p.index, res.steps.length - 1)]
  const isLastFrame = p.index >= res.steps.length - 1

  // 已确定 dp 的节点（截至当前帧）
  const settledSet = useMemo(() => new Set(step.settled), [step])
  const justDone = step.u

  const paintNode = (id: number): NodePaint => {
    const settled = settledSet.has(id)
    const inChosen = isLastFrame && res.chosen.has(id)
    const isCurrent = id === justDone && !isLastFrame
    let fill = 'var(--surface-3)'
    let stroke = 'var(--border-strong)'
    let textColor = 'var(--text-1)'
    if (inChosen) {
      fill = 'color-mix(in srgb, var(--viz-chosen) 26%, var(--surface-3))'
      stroke = 'var(--viz-chosen)'
    } else if (isCurrent) {
      fill = 'var(--grad-accent)'
      stroke = 'var(--accent-2)'
      textColor = 'var(--text-on-accent)'
    } else if (settled) {
      fill = 'color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))'
      stroke = 'var(--accent-2)'
    }
    const sub = settled
      ? [`0:${res.dp0[id]}`, `1:${res.dp1[id]}`]
      : [`w=${w[id]}`]
    return { fill, stroke, strokeWidth: isCurrent ? 2.6 : settled ? 2 : 1.6, textColor, sub, dim: !settled && !isCurrent }
  }

  const setWeight = (i: number, v: number) => setW((arr) => arr.map((x, k) => (k === i ? v : x)))

  return (
    <div>
      <div className="td__toolbar">
        <div>
          <div className="td__group-label">改每个员工的欢乐值，看 dp 自底向上重算</div>
          <div className="td__nodes">
            {w.map((v, i) => (
              <WStepper key={i} i={i} value={v} onChange={(nv) => setWeight(i, nv)} />
            ))}
          </div>
        </div>
      </div>

      <div className="td__hint">
        后序遍历（孩子先于父亲）逐个点亮节点，节点下方两行是 <b>dp[u][0]</b>（不选 u）/ <b>dp[u][1]</b>（选 u）。
        走到根，答案 = max(dp[1][0], dp[1][1]) = <b className="ans">{res.ans}</b>。
      </div>

      <div className="td__stage">
        <TreeCanvas
          key={inputsHash}
          layout={layout}
          paintNode={paintNode}
          ariaLabel="公司树上的最大权独立集后序动画"
        />
      </div>

      <StepBar player={p} />

      <Legend
        items={[
          { color: 'var(--accent-2)', label: '当前处理' },
          { color: 'var(--accent-2)', label: 'dp 已确定', bg: false },
          { color: 'var(--viz-chosen)', label: '入选最优独立集' },
        ]}
      />

      <Panel html={step.caption} />

      {isLastFrame && (
        <div className="td__readout">
          最优独立集选中了{' '}
          <b>
            {[...res.chosen]
              .sort((a, b) => a - b)
              .map((i) => `${i + 1}号(${LABELS[i]})`)
              .join('、')}
          </b>
          ，欢乐值合计 <b className="ans">{res.ans}</b>。注意<strong>没有任何一对直接上下级同时入选</strong>——这正是独立集约束。
        </div>
      )}
    </div>
  )
}
