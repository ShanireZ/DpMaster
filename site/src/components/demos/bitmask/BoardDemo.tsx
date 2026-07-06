import { useMemo, useState } from 'react'
import { Minus, Plus, Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Sigma } from 'lucide-react'
import { useStepPlayer } from '../../dp-engine/useStepPlayer'
import { findOneLayout, layoutFrames, countKings } from './boardSolver'
import '../knapsack/knapsack-demo.css'
import './bitmask-demo.css'

export default function BoardDemo() {
  const [N, setN] = useState(4)
  const [K, setK] = useState(4)
  const [showCount, setShowCount] = useState(false)

  const layout = useMemo(() => findOneLayout(N, K), [N, K])
  const frames = useMemo(
    () => (layout ? layoutFrames(N, K, layout) : []),
    [N, K, layout],
  )
  const total = useMemo(() => (showCount ? countKings(N, K) : null), [showCount, N, K])

  const p = useStepPlayer(Math.max(1, frames.length))
  const frame = frames.length ? frames[Math.min(p.index, frames.length - 1)] : null

  // 改 N/K 时重置播放与计数
  const resetAll = (nextN = N, nextK = K) => {
    setShowCount(false)
    p.reset()
    setN(nextN)
    setK(nextK)
  }
  const changeN = (v: number) => {
    const nn = Math.max(3, Math.min(6, v))
    resetAll(nn, Math.min(K, nn * nn))
  }
  const changeK = (v: number) => {
    const kk = Math.max(1, Math.min(N * N, v))
    resetAll(N, kk)
  }

  const CELL = 44
  const boardPx = N * CELL

  // 当前应显示的各行 mask（已确定的行）
  const rows = frame?.rows ?? []

  return (
    <div>
      <div className="bm__toolbar bm__toolbar--board">
        <div className="bm__steppers">
          <div>
            <div className="stepper__lab">棋盘边长 N</div>
            <div className="stepper__row">
              <button onClick={() => changeN(N - 1)} disabled={N <= 3} aria-label="N 减">
                <Minus size={13} />
              </button>
              <span className="stepper__val">{N}</span>
              <button onClick={() => changeN(N + 1)} disabled={N >= 6} aria-label="N 加">
                <Plus size={13} />
              </button>
            </div>
          </div>
          <div>
            <div className="stepper__lab">放置王数 K</div>
            <div className="stepper__row">
              <button onClick={() => changeK(K - 1)} disabled={K <= 1} aria-label="K 减">
                <Minus size={13} />
              </button>
              <span className="stepper__val">{K}</span>
              <button onClick={() => changeK(K + 1)} disabled={K >= N * N} aria-label="K 加">
                <Plus size={13} />
              </button>
            </div>
          </div>
        </div>
        <div className="bm__legend-mini">
          <span><i className="bm__sw bm__sw--king" /> 王</span>
          <span><i className="bm__sw bm__sw--active" /> 当前行</span>
        </div>
      </div>

      {!layout ? (
        <div className="bm__note bm__note--warn">
          在 {N}×{N} 的棋盘上放不下 <b>{K}</b> 个互不攻击的王（K 太大）——减小 K 或增大 N 再试。
        </div>
      ) : (
        <>
          <div className="bm__board-stage">
            <svg viewBox={`0 0 ${boardPx} ${boardPx}`} width={boardPx} height={boardPx} role="img" aria-label="互不侵犯棋盘逐行放置">
              {Array.from({ length: N }, (_, r) =>
                Array.from({ length: N }, (_, c) => {
                  const isActive = frame?.activeRow === r
                  const settledRow = r < rows.length
                  const hasKing = settledRow && ((rows[r] >> c) & 1) === 1
                  const dark = (r + c) % 2 === 1
                  return (
                    <g key={`${r}-${c}`} transform={`translate(${c * CELL},${r * CELL})`}>
                      <rect
                        width={CELL}
                        height={CELL}
                        fill={
                          isActive
                            ? 'color-mix(in srgb, var(--viz-current) 16%, var(--surface-3))'
                            : dark
                              ? 'var(--surface-2)'
                              : 'var(--surface-3)'
                        }
                        stroke="var(--border)"
                        strokeWidth="1"
                      />
                      {hasKing && (
                        <g transform={`translate(${CELL / 2},${CELL / 2})`}>
                          <circle r={CELL * 0.3} fill="var(--grad-accent)" stroke="var(--accent-2)" strokeWidth="1.5" />
                          <text y="4" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-on-accent)">
                            ♔
                          </text>
                        </g>
                      )}
                    </g>
                  )
                }),
              )}
              {frame?.activeRow != null && frame.activeRow >= 0 && (
                <rect
                  x="0"
                  y={frame.activeRow * CELL}
                  width={boardPx}
                  height={CELL}
                  fill="none"
                  stroke="var(--viz-current)"
                  strokeWidth="2.5"
                  rx="3"
                />
              )}
            </svg>
          </div>

          <div className="bm__caption" dangerouslySetInnerHTML={{ __html: frame?.caption ?? '' }} />

          <div className="dpctl">
            <div className="dpctl__btns">
              <button onClick={p.reset} aria-label="重置" title="重置">
                <RotateCcw size={18} />
              </button>
              <button onClick={p.prev} disabled={p.index === 0} aria-label="上一步">
                <ChevronLeft size={20} />
              </button>
              <button className="primary" onClick={p.toggle} aria-label={p.playing ? '暂停' : '播放'}>
                {p.playing ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button onClick={p.next} disabled={p.index >= p.count - 1} aria-label="下一步">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="dpctl__scrub">
              <input
                type="range"
                min={0}
                max={Math.max(0, p.count - 1)}
                value={p.index}
                onChange={(e) => {
                  p.pause()
                  p.setIndex(Number(e.target.value))
                }}
                aria-label="进度"
              />
              <span className="dpctl__count">
                {p.index + 1}/{p.count}
              </span>
            </div>
          </div>

          <div className="bm__count-row">
            <button className="bm__count-btn" onClick={() => setShowCount((s) => !s)}>
              <Sigma size={15} /> {showCount ? '收起方案总数' : '看方案总数（状压 DP）'}
            </button>
            {showCount && total != null && (
              <span className="bm__count-out">
                {N}×{N} 放 {K} 个互不攻击的王，合法布局共 <b>{total}</b> 种（演示只展示了其中一种）。
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
