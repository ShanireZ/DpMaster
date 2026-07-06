import type { ReactNode } from 'react'
import type { TreeNodeLayout } from './rerootSolver'

// 自定义 SVG 画树的共享外壳：节点=圆（可点）、边=线，布局用 layoutTree 的 x/y。
// 各演示传入「每个节点/每条边如何着色」的回调，以及节点上要显示的副标签。

export interface NodeStyle {
  fill: string
  stroke: string
  strokeWidth: number
  textFill: string
  r?: number
}

export interface EdgeStyle {
  stroke: string
  strokeWidth: number
}

export function TreeCanvas({
  nodes,
  maxDepth,
  nodeStyle,
  edgeStyle,
  subLabel,
  edgeLabel,
  onNodeClick,
  ariaLabel,
  height,
}: {
  nodes: TreeNodeLayout[]
  maxDepth: number
  nodeStyle: (id: number) => NodeStyle
  edgeStyle: (child: number, parent: number) => EdgeStyle
  subLabel?: (id: number) => string | null
  edgeLabel?: (child: number, parent: number) => string | null
  onNodeClick?: (id: number) => void
  ariaLabel: string
  height?: number
}): ReactNode {
  const W = 620
  const padX = 44
  const topY = 42
  const rowH = 88
  const H = height ?? topY + maxDepth * rowH + 54
  const px = (x: number) => padX + x * (W - 2 * padX)
  const py = (d: number) => topY + d * rowH

  const byId = new Map<number, TreeNodeLayout>()
  nodes.forEach((nd) => byId.set(nd.id, nd))

  // 边：child → parent
  const edges: { c: number; p: number; cx: number; cy: number; px2: number; py2: number }[] = []
  nodes.forEach((nd) => {
    if (nd.parent >= 0) {
      const p = byId.get(nd.parent)
      if (p)
        edges.push({
          c: nd.id,
          p: nd.parent,
          cx: px(nd.x),
          cy: py(nd.depth),
          px2: px(p.x),
          py2: py(p.depth),
        })
    }
  })

  const R = 21

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
      {/* 连边 */}
      {edges.map((e, i) => {
        const st = edgeStyle(e.c, e.p)
        return (
          <line
            key={`e${i}`}
            x1={e.cx}
            y1={e.cy}
            x2={e.px2}
            y2={e.py2}
            stroke={st.stroke}
            strokeWidth={st.strokeWidth}
            strokeLinecap="round"
          />
        )
      })}
      {/* 边标签（如边权 w） */}
      {edgeLabel &&
        edges.map((e, i) => {
          const lab = edgeLabel(e.c, e.p)
          if (!lab) return null
          return (
            <text
              key={`el${i}`}
              x={(e.cx + e.px2) / 2 + 11}
              y={(e.cy + e.py2) / 2 + 4}
              fontSize="11"
              className="mono"
              fill="var(--text-3)"
            >
              {lab}
            </text>
          )
        })}
      {/* 节点 */}
      {nodes.map((nd) => {
        const st = nodeStyle(nd.id)
        const sub = subLabel ? subLabel(nd.id) : null
        return (
          <g
            key={nd.id}
            transform={`translate(${px(nd.x)},${py(nd.depth)})`}
            className={onNodeClick ? 'rr__node-hit' : undefined}
            onClick={onNodeClick ? () => onNodeClick(nd.id) : undefined}
          >
            <circle
              r={st.r ?? R}
              fill={st.fill}
              stroke={st.stroke}
              strokeWidth={st.strokeWidth}
            />
            <text
              y={sub ? -3 : 5}
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill={st.textFill}
            >
              {nd.id + 1}
            </text>
            {sub && (
              <text y="13" textAnchor="middle" fontSize="9.5" className="mono" fill={st.textFill}>
                {sub}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
