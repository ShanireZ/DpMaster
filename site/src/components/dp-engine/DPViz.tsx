import type { CSSProperties } from 'react'
import { MB } from '../ui/Math'
import type { VizModel, CellState } from './types'
import { key } from './types'
import { SafeCaption } from './SafeCaption'
import { PlaybackControls } from './playback/PlaybackControls'
import { useStepPlayer } from './playback/useStepPlayer'
import './dp-viz.css'

const stateClass: Record<CellState, string> = {
  idle: '',
  settled: 'is-settled',
  current: 'is-current',
  source: 'is-source',
  chosen: 'is-chosen',
  invalid: 'is-invalid',
}

function fmt(v: number | null): string {
  if (v === null) return '·'
  if (v <= -1e8) return '−∞'
  return String(v)
}

export default function DPViz({ model }: { model: VizModel }) {
  const p = useStepPlayer(model.frames.length)
  const frame = model.frames[Math.min(p.index, model.frames.length - 1)]
  const cell = model.cell ?? 48
  const hasRowH = !!model.rowHeaderLabels
  const hasColH = !!model.colHeaderLabels
  const rh = hasRowH ? 46 : 0
  const ch = hasColH ? 30 : 0
  const colOffset = hasRowH ? 2 : 1
  const rowOffset = hasColH ? 2 : 1

  const gridStyle: CSSProperties = {
    gridTemplateColumns: `${hasRowH ? `${rh}px ` : ''}repeat(${model.cols}, ${cell}px)`,
    gridTemplateRows: `${hasColH ? `${ch}px ` : ''}repeat(${model.rows}, ${cell}px)`,
  }

  const center = (r: number, c: number) => ({ x: c * cell + cell / 2, y: r * cell + cell / 2 })

  return (
    <div className="dpviz">
      <div className="dpviz__scroll">
        <div className="dpviz__grid" style={gridStyle}>
          {hasRowH && hasColH && (
            <div className="dp-corner" style={{ gridRow: 1, gridColumn: 1 }} />
          )}
          {hasColH &&
            model.colHeaderLabels!.map((lab, c) => (
              <div
                key={`ch${c}`}
                className="dp-colh axis"
                style={{ gridRow: 1, gridColumn: colOffset + c }}
              >
                {lab}
              </div>
            ))}
          {hasRowH &&
            model.rowHeaderLabels!.map((lab, r) => (
              <div
                key={`rh${r}`}
                className="dp-rowh axis"
                style={{ gridRow: rowOffset + r, gridColumn: 1 }}
              >
                {lab}
              </div>
            ))}

          {frame.values.map((row, r) =>
            row.map((v, c) => {
              const st = frame.states[key(r, c)] ?? 'idle'
              return (
                <div
                  key={key(r, c)}
                  className={`dp-cell ${v === null ? 'blank' : ''} ${stateClass[st]}`}
                  style={{ gridRow: rowOffset + r, gridColumn: colOffset + c }}
                >
                  {fmt(v)}
                </div>
              )
            }),
          )}

          <svg
            className="dpviz__arrows"
            style={{ left: rh, top: ch }}
            width={model.cols * cell}
            height={model.rows * cell}
            viewBox={`0 0 ${model.cols * cell} ${model.rows * cell}`}
          >
            <defs>
              <marker id="ah-src" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-source)" />
              </marker>
              <marker id="ah-cho" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-chosen)" />
              </marker>
            </defs>
            {(frame.arrows ?? []).map((a, i) => {
              const s = center(a.from.r, a.from.c)
              const e = center(a.to.r, a.to.c)
              const dx = e.x - s.x
              const dy = e.y - s.y
              const len = Math.hypot(dx, dy) || 1
              const back = cell * 0.36
              const ex = e.x - (dx / len) * back
              const ey = e.y - (dy / len) * back
              const sx = s.x + (dx / len) * (cell * 0.28)
              const sy = s.y + (dy / len) * (cell * 0.28)
              const chosen = a.kind === 'chosen'
              return (
                <line
                  key={i}
                  x1={sx}
                  y1={sy}
                  x2={ex}
                  y2={ey}
                  stroke={chosen ? 'var(--viz-chosen)' : 'var(--viz-source)'}
                  strokeWidth={chosen ? 3 : 2}
                  strokeLinecap="round"
                  markerEnd={`url(#${chosen ? 'ah-cho' : 'ah-src'})`}
                  opacity={0.9}
                />
              )
            })}
          </svg>
        </div>
      </div>

      <div className="dpviz__legend">
        <span><i style={{ borderColor: 'var(--viz-current)' }} /> 当前计算</span>
        <span><i style={{ borderColor: 'var(--viz-source)' }} /> 依赖来源</span>
        <span><i style={{ borderColor: 'var(--viz-chosen)' }} /> 被选转移</span>
        <span><i style={{ borderColor: 'var(--border-strong)', background: 'var(--viz-cell-2)' }} /> 已确定</span>
      </div>

      <div className="dpviz__panel">
        {frame.formula && (
          <div className="dpviz__formula">
            <MB>{frame.formula}</MB>
          </div>
        )}
        {frame.caption && (
          <SafeCaption html={frame.caption} className="dpviz__caption" />
        )}
      </div>

      <PlaybackControls player={p} variant="full" label="DP 表格逐帧播放" />
    </div>
  )
}
