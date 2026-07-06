import { useMemo, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { buildScoreTree, layoutScoreTree } from './scoreTreeSolver'
import type { TreeNode } from './scoreTreeSolver'
import '../knapsack/knapsack-demo.css'
import './score-tree-build.css'

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

// 收集以 node 为根的子树里所有节点 id（含自身）。
function subtreeIds(node: TreeNode | null, acc: Set<number>) {
  if (!node) return
  acc.add(node.id)
  subtreeIds(node.left, acc)
  subtreeIds(node.right, acc)
}

/**
 * 第二演示：用主演示记下的 root[i][j] 前序回溯，把最优二叉树画出来。
 * 点任一节点 → 高亮「它这棵子树」，同时在下方中序刻度条上点亮它覆盖的连续区间 [lo,hi]，
 * 把「一段连续区间 ⇔ 一棵子树」这层对应关系摊在眼前。
 */
export default function ScoreTreeBuildDemo() {
  const [scores, setScores] = useState<number[]>([5, 7, 1, 2, 10])
  const [sel, setSel] = useState<number | null>(null) // 选中的节点 id

  const res = useMemo(() => buildScoreTree(scores), [scores])
  const { nodes, maxDepth } = useMemo(() => layoutScoreTree(res), [res])

  // 节点 id → 节点对象，便于取选中子树
  const byId = useMemo(() => {
    const m = new Map<number, TreeNode>()
    nodes.forEach((nd) => m.set(nd.id, nd))
    return m
  }, [nodes])

  const selNode = sel != null ? byId.get(sel) ?? null : null
  const selSet = useMemo(() => {
    const s = new Set<number>()
    subtreeIds(selNode, s)
    return s
  }, [selNode])

  const n = scores.length
  const setScore = (i: number, val: number) =>
    setScores((arr) => arr.map((s, k) => (k === i ? val : s)))
  const addNode = () =>
    setScores((arr) => (arr.length < 5 ? [...arr, 3] : arr))
  const removeNode = (i: number) => {
    setSel(null)
    setScores((arr) => (arr.length > 3 ? arr.filter((_, k) => k !== i) : arr))
  }

  // —— SVG 布局：x 用中序位置铺开、y 用深度分层
  const W = 560
  const padX = 40
  const topY = 40
  const rowH = 92
  const H = topY + maxDepth * rowH + 56
  const px = (x: number) => padX + x * (W - 2 * padX)
  const py = (d: number) => topY + d * rowH

  // 边（父 → 子）
  const edges: { a: TreeNode; b: TreeNode; side: 'L' | 'R' }[] = []
  nodes.forEach((nd) => {
    if (nd.left) edges.push({ a: nd, b: nd.left, side: 'L' })
    if (nd.right) edges.push({ a: nd, b: nd.right, side: 'R' })
  })

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">节点按中序排开（与上一个演示同一组分数 · 3～5 个）</div>
          <div className="kd__items">
            {scores.map((s, i) => (
              <div className="kd__item" key={i}>
                <span className="kd__item-i">{i + 1}</span>
                {scores.length > 3 && (
                  <button className="kd__remove" onClick={() => removeNode(i)} aria-label="删除该节点">
                    <X size={12} />
                  </button>
                )}
                <Stepper label="分数 score" value={s} min={1} max={30} onChange={(v) => setScore(i, v)} />
              </div>
            ))}
            {scores.length < 5 && (
              <button className="kd__add" onClick={addNode}>
                <Plus size={14} /> 加一个节点
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="stb__hint">
        点任意节点 → 高亮<strong>它这棵子树</strong>，并在下方中序刻度条上点亮它对应的<strong>连续区间</strong>。
        整棵树最大加分 <b className="stb__ans">{res.ans}</b>，前序遍历 <b className="stb__pre">{res.preorder.join(' ')}</b>。
      </div>

      <div className="stb__stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="最优加分二叉树，可点节点看它对应的中序区间">
          <defs>
            <marker id="stb-tick" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
              <circle cx="3.5" cy="3.5" r="2.4" fill="var(--accent-2)" />
            </marker>
          </defs>

          {/* 连边 */}
          {edges.map((e, i) => {
            const on = selSet.has(e.a.id) && selSet.has(e.b.id)
            return (
              <line
                key={i}
                x1={px(e.a.x)}
                y1={py(e.a.depth) + 20}
                x2={px(e.b.x)}
                y2={py(e.b.depth) - 20}
                stroke={on ? 'var(--accent-2)' : 'var(--border-strong)'}
                strokeWidth={on ? 3 : 1.6}
              />
            )
          })}
          {/* L/R 标记 */}
          {edges.map((e, i) => (
            <text
              key={`lab${i}`}
              x={(px(e.a.x) + px(e.b.x)) / 2 + (e.side === 'L' ? -10 : 10)}
              y={(py(e.a.depth) + py(e.b.depth)) / 2}
              textAnchor="middle"
              fontSize="11"
              className="mono"
              fill="var(--text-3)"
            >
              {e.side === 'L' ? '左' : '右'}
            </text>
          ))}

          {/* 节点 */}
          {nodes.map((nd) => {
            const on = selSet.has(nd.id)
            const isRoot = sel === nd.id
            return (
              <g
                key={nd.id}
                transform={`translate(${px(nd.x)},${py(nd.depth)})`}
                onClick={() => setSel(sel === nd.id ? null : nd.id)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  r="20"
                  fill={
                    isRoot
                      ? 'var(--grad-accent)'
                      : on
                        ? 'color-mix(in srgb, var(--accent-1) 20%, var(--surface-3))'
                        : 'var(--surface-3)'
                  }
                  stroke={on ? 'var(--accent-2)' : 'var(--border-strong)'}
                  strokeWidth={on ? 2.5 : 1.5}
                />
                <text
                  y="-1"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="700"
                  fill={isRoot ? 'var(--text-on-accent)' : 'var(--text-1)'}
                >
                  {nd.id}
                </text>
                <text
                  y="13"
                  textAnchor="middle"
                  fontSize="9.5"
                  className="mono"
                  fill={isRoot ? 'var(--text-on-accent)' : 'var(--text-3)'}
                >
                  {nd.score}
                </text>
              </g>
            )
          })}

          {/* 中序刻度条：n 个格子，1..n */}
          {Array.from({ length: n }, (_, k) => {
            const cw = (W - 2 * padX) / n
            const x = padX + k * cw
            const y = H - 40
            const inSel = selNode ? k + 1 >= selNode.lo && k + 1 <= selNode.hi : false
            return (
              <g key={`t${k}`}>
                <rect
                  x={x + 3}
                  y={y}
                  width={cw - 6}
                  height="30"
                  rx="7"
                  fill={
                    inSel
                      ? 'color-mix(in srgb, var(--accent-1) 22%, var(--surface-3))'
                      : 'var(--surface-2)'
                  }
                  stroke={inSel ? 'var(--accent-2)' : 'var(--border)'}
                  strokeWidth={inSel ? 2 : 1}
                />
                <text
                  x={x + cw / 2}
                  y={y + 20}
                  textAnchor="middle"
                  fontSize="13"
                  className="mono"
                  fill={inSel ? 'var(--accent-1)' : 'var(--text-3)'}
                >
                  {k + 1}
                </text>
              </g>
            )
          })}
          <text x={padX} y={H - 46} fontSize="11" fill="var(--text-3)">
            中序序列（固定 1…{n}）
          </text>
        </svg>
      </div>

      <div className="stb__readout">
        {selNode ? (
          <>
            选中<b>节点 {selNode.id}</b>：它这棵子树覆盖中序区间{' '}
            <b className="stb__pre">
              [{selNode.lo}, {selNode.hi}]
            </b>
            ，子树加分 dp[{selNode.lo}][{selNode.hi}] = <b className="stb__ans">{selNode.subScore}</b>。
            {selNode.lo === selNode.hi
              ? '（叶子：区间只含它自己）'
              : `左子树 = 区间左半、右子树 = 区间右半——${selNode.id} 号把区间劈成两段。`}
          </>
        ) : (
          <>点一个节点看它对应的连续区间。整棵树 = 区间 [1, {n}]，其根 = 节点 {res.preorder[0]}（前序第一个）。</>
        )}
      </div>
    </div>
  )
}
