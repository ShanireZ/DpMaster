import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { buildTree, layoutTree, solveJointWeight } from './treedpSolver'
import type { NodePaint } from './TreeCanvas'
import '../knapsack/knapsack-demo.css'
import './treedp-demo.css'

//          1
//        / | \
//       2  3  4
//      /|
//     5 6
const PARENT = [-1, 0, 0, 0, 1, 1]

export default function JointWeightDemo() {
  const [w, setW] = useState<number[]>([5, 3, 2, 4, 6, 1])
  const [mid, setMid] = useState<number>(0) // 选中的中间点

  const tree = useMemo(() => buildTree(PARENT, w), [w])
  const layout = useMemo(() => layoutTree(tree), [tree])
  const res = useMemo(() => solveJointWeight(tree), [tree])

  const nbSet = useMemo(() => new Set(res.neighbors[mid]), [res, mid])

  const paintNode = (id: number): NodePaint => {
    const isMid = id === mid
    const isNb = nbSet.has(id)
    let fill = 'var(--surface-3)'
    let stroke = 'var(--border-strong)'
    let textColor = 'var(--text-1)'
    if (isMid) {
      fill = 'var(--grad-accent)'
      stroke = 'var(--accent-2)'
      textColor = 'var(--text-on-accent)'
    } else if (isNb) {
      fill = 'color-mix(in srgb, var(--viz-source) 22%, var(--surface-3))'
      stroke = 'var(--viz-source)'
    }
    return { fill, stroke, strokeWidth: isMid ? 2.8 : isNb ? 2.2 : 1.6, textColor, sub: [`w=${w[id]}`] }
  }

  const edgeActive = (a: number, b: number) =>
    (a === mid && nbSet.has(b)) || (b === mid && nbSet.has(a))

  // 布局像素
  const width = 540
  const padX = 46
  const topY = 36
  const rowH = 92
  const radius = 22
  const H = topY + layout.maxDepth * rowH + 44
  const px = (x: number) => padX + x * (width - 2 * padX)
  const py = (d: number) => topY + d * rowH

  const nbList = res.neighbors[mid]
  const pairs: [number, number][] = []
  for (let i = 0; i < nbList.length; i++)
    for (let j = i + 1; j < nbList.length; j++) pairs.push([nbList[i], nbList[j]])

  const setWeight = (i: number, v: number) => setW((arr) => arr.map((x, k) => (k === i ? v : x)))

  return (
    <div>
      <div className="td__toolbar">
        <div>
          <div className="td__group-label">改点权，点任意节点当「中间点」</div>
          <div className="td__nodes">
            {w.map((v, i) => (
              <div className="td__node-chip" key={i}>
                <span className="td__node-dot">{i + 1}</span>
                <div>
                  <div className="stepper__lab">点 {i + 1} · 权</div>
                  <div className="stepper__row">
                    <button onClick={() => setWeight(i, v - 1)} disabled={v <= 1} aria-label="减">
                      <Minus size={13} />
                    </button>
                    <span className="stepper__val">{v}</span>
                    <button onClick={() => setWeight(i, v + 1)} disabled={v >= 15} aria-label="加">
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="td__hint">
        距离恰为 2 的点对 ⇔ 有<strong>公共中间点</strong>。点选中间点 <b>{mid + 1}</b>，它的邻居两两配对就是所有以它为中点的距离 2 点对。
        全树联合权值总和 = <b className="ans">{res.totalSum}</b>，最大 = <b className="ans">{res.globalMax}</b>。
      </div>

      <div className="td__stage">
        <svg viewBox={`0 0 ${width} ${H}`} role="img" aria-label="联合权值：以选中点为中间点的距离 2 点对">
          {layout.edges.map((e, i) => {
            const a = layout.byId.get(e.a)!
            const b = layout.byId.get(e.b)!
            const on = edgeActive(e.a, e.b)
            return (
              <line
                key={i}
                x1={px(a.x)}
                y1={py(a.depth) + radius}
                x2={px(b.x)}
                y2={py(b.depth) - radius}
                stroke={on ? 'var(--viz-source)' : 'var(--border-strong)'}
                strokeWidth={on ? 3.2 : 1.6}
              />
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
                onClick={() => setMid(nd.id)}
              >
                <circle r={radius} fill={pnt.fill} stroke={pnt.stroke} strokeWidth={pnt.strokeWidth ?? 1.6} />
                <text y={-3} textAnchor="middle" fontSize="14" fontWeight="700" fill={pnt.textColor ?? 'var(--text-1)'}>
                  {nd.id + 1}
                </text>
                {pnt.sub?.map((s, k) => (
                  <text key={k} y={11} textAnchor="middle" fontSize="9" className="mono" fill={pnt.textColor ?? 'var(--text-3)'}>
                    {s}
                  </text>
                ))}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="td__readout">
        {pairs.length === 0 ? (
          <>
            中间点 <b>{mid + 1}</b> 只有 &lt;2 个邻居，凑不出距离 2 的点对。换一个度更高的点试试。
          </>
        ) : (
          <>
            以 <b>{mid + 1}</b> 为中点的点对：
            <b>
              {' '}
              {pairs.map(([a, b]) => `(${a + 1},${b + 1})`).join('、')}
            </b>
            。乘积之和 = {pairs.map(([a, b]) => `${w[a]}×${w[b]}`).join(' + ')} ={' '}
            <b className="ans">{res.midSum[mid]}</b>（有序对，正反各算一次）。 O(度) 一次算完，无需两两枚举。
          </>
        )}
      </div>
    </div>
  )
}
