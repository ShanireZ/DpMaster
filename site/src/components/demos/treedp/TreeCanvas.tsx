import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import type { TreeLayout } from './treedpSolver'

// —— 一个节点的视觉描述（由各演示按当前帧算出） ——
export interface NodePaint {
  fill: string
  stroke: string
  strokeWidth?: number
  textColor?: string
  /** 节点圆下方最多两行小标签（如 dp0/dp1 值） */
  sub?: string[]
  /** 节点圆内主标签，缺省用编号 */
  label?: string
  dim?: boolean // 尚未处理：淡出
}

interface TreeCanvasProps {
  layout: TreeLayout
  paintNode: (id: number) => NodePaint
  /** 需要加粗高亮的边（如直径链、被选子树）：返回 true 则强调 */
  edgeActive?: (a: number, b: number) => boolean
  width?: number
  rowH?: number
  radius?: number
  ariaLabel?: string
}

/** 纯展示：把一棵有根树画成 SVG。x 用布局归一坐标铺开、y 按深度分层。 */
export function TreeCanvas({
  layout,
  paintNode,
  edgeActive,
  width = 600,
  rowH = 96,
  radius = 22,
  ariaLabel = '有根树',
}: TreeCanvasProps) {
  const padX = 44
  const topY = 38
  const H = topY + layout.maxDepth * rowH + 56
  const px = (x: number) => padX + x * (width - 2 * padX)
  const py = (d: number) => topY + d * rowH

  return (
    <svg viewBox={`0 0 ${width} ${H}`} role="img" aria-label={ariaLabel}>
      {/* 连边 */}
      {layout.edges.map((e, i) => {
        const a = layout.byId.get(e.a)!
        const b = layout.byId.get(e.b)!
        const on = edgeActive ? edgeActive(e.a, e.b) : false
        return (
          <line
            key={i}
            x1={px(a.x)}
            y1={py(a.depth) + radius}
            x2={px(b.x)}
            y2={py(b.depth) - radius}
            stroke={on ? 'var(--viz-chosen)' : 'var(--border-strong)'}
            strokeWidth={on ? 3.4 : 1.6}
          />
        )
      })}
      {/* 节点 */}
      {layout.nodes.map((nd) => {
        const p = paintNode(nd.id)
        return (
          <g
            key={nd.id}
            className="node"
            transform={`translate(${px(nd.x)},${py(nd.depth)})`}
            opacity={p.dim ? 0.32 : 1}
          >
            <circle
              r={radius}
              fill={p.fill}
              stroke={p.stroke}
              strokeWidth={p.strokeWidth ?? 1.6}
            />
            <text
              y={p.sub && p.sub.length ? -3 : 5}
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill={p.textColor ?? 'var(--text-1)'}
            >
              {p.label ?? nd.id + 1}
            </text>
            {p.sub?.map((s, k) => (
              <text
                key={k}
                y={9 + k * 11}
                textAnchor="middle"
                fontSize="9"
                className="mono"
                fill={p.textColor ?? 'var(--text-3)'}
              >
                {s}
              </text>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

// —— 逐帧播放控制条（后序动画共用） ——
interface StepBarProps {
  index: number
  count: number
  playing: boolean
  onToggle: () => void
  onPrev: () => void
  onNext: () => void
  onReset: () => void
  onScrub: (i: number) => void
  speed: number
  onSpeed: (s: number) => void
}
export function StepBar({
  index,
  count,
  playing,
  onToggle,
  onPrev,
  onNext,
  onReset,
  onScrub,
  speed,
  onSpeed,
}: StepBarProps) {
  return (
    <div className="td__ctl">
      <div className="td__ctl-btns">
        <button onClick={onReset} aria-label="重置" title="重置">
          <RotateCcw size={17} />
        </button>
        <button onClick={onPrev} disabled={index === 0} aria-label="上一步">
          <ChevronLeft size={19} />
        </button>
        <button className="primary" onClick={onToggle} aria-label={playing ? '暂停' : '播放'}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button onClick={onNext} disabled={index >= count - 1} aria-label="下一步">
          <ChevronRight size={19} />
        </button>
      </div>
      <div className="td__ctl-scrub">
        <input
          type="range"
          min={0}
          max={Math.max(0, count - 1)}
          value={index}
          onChange={(e) => onScrub(Number(e.target.value))}
          aria-label="进度"
        />
        <span className="td__ctl-count">
          {index + 1}/{count}
        </span>
      </div>
      <div className="td__ctl-speed">
        {[0.5, 1, 2].map((s) => (
          <button key={s} className={speed === s ? 'on' : ''} onClick={() => onSpeed(s)}>
            {s}×
          </button>
        ))}
      </div>
    </div>
  )
}

export function Legend({ items }: { items: { color: string; label: string; bg?: boolean }[] }) {
  return (
    <div className="td__legend">
      {items.map((it, i) => (
        <span key={i}>
          <i
            style={{
              borderColor: it.color,
              background: it.bg ? it.color : 'transparent',
            }}
          />{' '}
          {it.label}
        </span>
      ))}
    </div>
  )
}

export function Panel({ html }: { html: string }) {
  return <div className="td__panel" dangerouslySetInnerHTML={{ __html: html }} />
}
