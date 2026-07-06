import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useStepPlayer } from '../../dp-engine/useStepPlayer'
import { buildTree, layoutTree, solveMaxSubtreeChain } from './treedpSolver'
import { TreeCanvas, StepBar, Legend, Panel, type NodePaint } from './TreeCanvas'
import '../knapsack/knapsack-demo.css'
import './treedp-demo.css'

//          1
//        /   \
//       2     3
//      / \     \
//     4   5     6
const PARENT = [-1, 0, 0, 1, 1, 2]

function DStepper({ i, value, onChange }: { i: number; value: number; onChange: (v: number) => void }) {
  return (
    <div className="td__node-chip">
      <span className="td__node-dot">{i + 1}</span>
      <div>
        <div className="stepper__lab">点 {i + 1} · 点权</div>
        <div className="stepper__row">
          <button onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="减">
            <Minus size={13} />
          </button>
          <span className="stepper__val">{value}</span>
          <button onClick={() => onChange(value + 1)} disabled={value >= 15} aria-label="加">
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DiameterDemo() {
  const [w, setW] = useState<number[]>([2, 3, 4, 5, 1, 6])

  const tree = useMemo(() => buildTree(PARENT, w), [w])
  const layout = useMemo(() => layoutTree(tree), [tree])
  const res = useMemo(() => solveMaxSubtreeChain(tree), [tree])

  const inputsHash = w.join('_')
  const p = useStepPlayer(res.steps.length)
  const step = res.steps[Math.min(p.index, res.steps.length - 1)]
  const isLastFrame = p.index >= res.steps.length - 1
  const settledSet = useMemo(() => new Set(step.settled), [step])
  const justDone = step.u

  // 计算「过 argThrough 的那条链」用哪些边，末帧高亮
  const throughEdges = useMemo(() => {
    if (!isLastFrame) return new Set<string>()
    const u = res.argThrough
    const s = new Set<string>()
    // 从 u 出发，沿 down 值最大的孩子走两条最深链
    const kids = tree.children[u]
      .map((c) => ({ c, g: Math.max(0, res.down[c]) }))
      .filter((x) => x.g > 0)
      .sort((a, b) => b.g - a.g)
    const walk = (from: number) => {
      let cur = from
      let parent = u
      while (true) {
        s.add(`${parent}-${cur}`)
        const nx = tree.children[cur]
          .map((c) => ({ c, g: Math.max(0, res.down[c]) }))
          .filter((x) => x.g > 0)
          .sort((a, b) => b.g - a.g)[0]
        if (!nx) break
        parent = cur
        cur = nx.c
      }
    }
    if (kids[0]) walk(kids[0].c)
    if (kids[1]) walk(kids[1].c)
    return s
  }, [isLastFrame, res, tree])

  const paintNode = (id: number): NodePaint => {
    const settled = settledSet.has(id)
    const isCurrent = id === justDone && !isLastFrame
    const isPeak = isLastFrame && id === res.argThrough
    let fill = 'var(--surface-3)'
    let stroke = 'var(--border-strong)'
    let textColor = 'var(--text-1)'
    if (isPeak) {
      fill = 'color-mix(in srgb, var(--viz-chosen) 28%, var(--surface-3))'
      stroke = 'var(--viz-chosen)'
    } else if (isCurrent) {
      fill = 'var(--grad-accent)'
      stroke = 'var(--accent-2)'
      textColor = 'var(--text-on-accent)'
    } else if (settled) {
      fill = 'color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))'
      stroke = 'var(--accent-2)'
    }
    const sub = settled ? [`↓${res.down[id]}`] : [`w=${w[id]}`]
    return { fill, stroke, strokeWidth: isCurrent ? 2.6 : settled ? 2 : 1.6, textColor, sub, dim: !settled && !isCurrent }
  }

  const edgeActive = (a: number, b: number) => throughEdges.has(`${a}-${b}`)
  const setWeight = (i: number, v: number) => setW((arr) => arr.map((x, k) => (k === i ? v : x)))

  return (
    <div>
      <div className="td__toolbar">
        <div>
          <div className="td__group-label">改点权，看每个点的向下最长链 down 与「过点」最长链</div>
          <div className="td__nodes">
            {w.map((v, i) => (
              <DStepper key={i} i={i} value={v} onChange={(nv) => setWeight(i, nv)} />
            ))}
          </div>
        </div>
      </div>

      <div className="td__hint">
        节点下方 <b>↓down</b> = 从该点向下、必含它的最长链权和。过某点的最长链 = 它<strong>两条最深孩子链</strong>拼起来 + 自身权。
        全局最长（带权直径）= <b className="ans">{res.diameter}</b>，峰顶在 <b>{res.argThrough + 1}</b> 号。
      </div>

      <div className="td__stage">
        <TreeCanvas
          key={inputsHash}
          layout={layout}
          paintNode={paintNode}
          edgeActive={edgeActive}
          ariaLabel="树的带权直径：向下链与过点链后序动画"
        />
      </div>

      <StepBar
        index={p.index}
        count={p.count}
        playing={p.playing}
        onToggle={p.toggle}
        onPrev={p.prev}
        onNext={p.next}
        onReset={p.reset}
        onScrub={(i) => {
          p.pause()
          p.setIndex(i)
        }}
        speed={p.speed}
        onSpeed={p.setSpeed}
      />

      <Legend
        items={[
          { color: 'var(--accent-2)', label: '当前处理' },
          { color: 'var(--viz-chosen)', label: '直径峰顶 + 链' },
        ]}
      />

      <Panel html={step.caption} />

      {isLastFrame && (
        <div className="td__readout">
          绿色高亮的两条链在 <b>{res.argThrough + 1}</b> 号<strong>拐弯拼接</strong>，就是全树带权最长路径 <b className="ans">{res.diameter}</b>。
          每个点只在自己这里当一次「拐点」，一遍后序即可求出——无需两遍 DFS。
        </div>
      )}
    </div>
  )
}
