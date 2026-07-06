import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { buildTree, layoutTree, solveTreeKnapsack } from './treedpSolver'
import type { NodePaint } from './TreeCanvas'
import '../knapsack/knapsack-demo.css'
import './treedp-demo.css'

// 一棵二叉苹果树：5 个节点、4 条边。父亲数组 + 每条「连父亲」的边权。
//         1
//       /   \
//     (e2)  (e3)     ← 边权画在边中点
//     /       \
//    2         3
//   / \
// (e4)(e5)
//  4    5
const PARENT = [-1, 0, 0, 1, 1]
const EDGE0 = [0, 2, 5, 3, 4] // parentEdge[i]，根 = 0

export default function TreeKnapsackDemo() {
  const [edge, setEdge] = useState<number[]>(EDGE0)
  const [K, setK] = useState(3)
  const [focus, setFocus] = useState<number>(0) // 高亮某节点的 dp 表（默认根）

  const tree = useMemo(() => buildTree(PARENT, Array(PARENT.length).fill(0)), [])
  const layout = useMemo(() => layoutTree(tree), [tree])
  const res = useMemo(() => solveTreeKnapsack(tree, edge, K), [tree, edge, K])

  const paintNode = (id: number): NodePaint => {
    const isFocus = id === focus
    const isRoot = id === tree.root
    let fill = 'var(--surface-3)'
    let stroke = 'var(--border-strong)'
    let textColor = 'var(--text-1)'
    if (isFocus) {
      fill = 'var(--grad-accent)'
      stroke = 'var(--accent-2)'
      textColor = 'var(--text-on-accent)'
    } else if (isRoot) {
      fill = 'color-mix(in srgb, var(--accent-1) 14%, var(--surface-3))'
      stroke = 'var(--accent-2)'
    }
    return { fill, stroke, strokeWidth: isFocus ? 2.6 : 1.8, textColor }
  }

  // 布局像素
  const width = 540
  const padX = 46
  const topY = 36
  const rowH = 94
  const radius = 22
  const H = topY + layout.maxDepth * rowH + 40
  const px = (x: number) => padX + x * (width - 2 * padX)
  const py = (d: number) => topY + d * rowH

  const setEdgeW = (i: number, v: number) => setEdge((arr) => arr.map((x, k) => (k === i ? v : x)))

  return (
    <div>
      <div className="td__toolbar">
        <div>
          <div className="td__group-label">改每条边的苹果数（边权）</div>
          <div className="td__nodes">
            {edge.map((v, i) =>
              i === tree.root ? null : (
                <div className="td__node-chip" key={i}>
                  <span className="td__node-dot">{i + 1}</span>
                  <div>
                    <div className="stepper__lab">
                      连 {tree.parent[i] + 1}–{i + 1} 的边
                    </div>
                    <div className="stepper__row">
                      <button onClick={() => setEdgeW(i, v - 1)} disabled={v <= 1} aria-label="减">
                        <Minus size={13} />
                      </button>
                      <span className="stepper__val">{v}</span>
                      <button onClick={() => setEdgeW(i, v + 1)} disabled={v >= 20} aria-label="加">
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
        <div>
          <div className="td__group-label">保留边数 K</div>
          <div className="stepper__row">
            <button onClick={() => setK(K - 1)} disabled={K <= 1} aria-label="减">
              <Minus size={13} />
            </button>
            <span className="stepper__val">{K}</span>
            <button onClick={() => setK(K + 1)} disabled={K >= 4} aria-label="加">
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>

      <div className="td__hint">
        点节点看它的小背包表 <b>dp[u][j]</b> = u 子树保留 j 条边的最大苹果数。答案在根 dp[1][{K}] ={' '}
        <b className="ans">{res.ans}</b>。
      </div>

      <div className="td__stage">
        <svg viewBox={`0 0 ${width} ${H}`} role="img" aria-label="二叉苹果树，可点节点看其背包表">
          {layout.edges.map((e, i) => {
            const a = layout.byId.get(e.a)!
            const b = layout.byId.get(e.b)!
            const mx = (px(a.x) + px(b.x)) / 2
            const my = (py(a.depth) + py(b.depth)) / 2
            return (
              <g key={i}>
                <line
                  x1={px(a.x)}
                  y1={py(a.depth) + radius}
                  x2={px(b.x)}
                  y2={py(b.depth) - radius}
                  stroke="var(--border-strong)"
                  strokeWidth={2}
                />
                <rect x={mx - 14} y={my - 11} width={28} height={20} rx={6} fill="var(--surface-1)" stroke="var(--border)" />
                <text x={mx} y={my + 4} textAnchor="middle" fontSize="11" className="mono" fill="var(--accent-1)" fontWeight={700}>
                  {edge[e.b]}
                </text>
              </g>
            )
          })}
          {layout.nodes.map((nd) => {
            const pnt = paintNode(nd.id)
            return (
              <g
                key={nd.id}
                className="node"
                transform={`translate(${px(nd.x)},${py(nd.depth)})`}
                style={{ cursor: 'pointer' }}
                onClick={() => setFocus(nd.id)}
              >
                <circle r={radius} fill={pnt.fill} stroke={pnt.stroke} strokeWidth={pnt.strokeWidth ?? 1.6} />
                <text y={5} textAnchor="middle" fontSize="15" fontWeight="700" fill={pnt.textColor ?? 'var(--text-1)'}>
                  {nd.id + 1}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="tk__tables">
        {tree.postorder.map((u) => {
          const cols = Math.min(res.sizeEdges[u], K)
          return (
            <div
              key={u}
              className={`tk__table${u === focus ? ' active' : ''}`}
              onClick={() => setFocus(u)}
              style={{ cursor: 'pointer' }}
            >
              <div className="tk__table-cap">
                节点 {u + 1}
                {u === tree.root ? '（根）' : ''} · 子树 {res.sizeEdges[u]} 条边
              </div>
              <div className="tk__row">
                <div className="tk__cell head">j</div>
                {Array.from({ length: cols + 1 }, (_, j) => (
                  <div className="tk__cell head" key={j}>
                    {j}
                  </div>
                ))}
              </div>
              <div className="tk__row">
                <div className="tk__cell head">dp</div>
                {Array.from({ length: cols + 1 }, (_, j) => (
                  <div className={`tk__cell${u === tree.root && j === K ? ' best' : ''}`} key={j}>
                    {res.dp[u][j]}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="td__readout">
        每个孩子当作<strong>一组物品</strong>：给它分 t 条边就得到 <span className="mono">边权 + dp[孩子][t−1]</span> 的苹果，
        在父亲的背包里做分组背包合并。<strong>选子必先选连它的那条边</strong>——这正是「有依赖背包」的树上形态。
      </div>
    </div>
  )
}
