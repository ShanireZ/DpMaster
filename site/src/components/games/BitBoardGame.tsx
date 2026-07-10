import { useMemo, useState } from 'react'
import { Grid3x3, Sigma, RotateCcw, Trophy, Volume2, VolumeX } from 'lucide-react'
import { countKings } from '../demos/bitmask/boardSolver'
import { playGameTone } from './runtime/audio'
import './game-bitboard.css'

type Difficulty = 'easy' | 'medium' | 'hard'

interface DiffSpec {
  label: string
  N: number
  K: number
}

// 王两两不相邻，N×N 最多能放约 ceil(N/2)^2 个；K 取一个有挑战但可完成的值。
const DIFFS: Record<Difficulty, DiffSpec> = {
  easy: { label: '简单', N: 4, K: 4 },
  medium: { label: '中等', N: 5, K: 5 },
  hard: { label: '困难', N: 5, K: 6 },
}
const DIFF_ORDER: Difficulty[] = ['easy', 'medium', 'hard']

// 王 (r,c) 是否与 (r2,c2) 相邻（含斜角）——即两格在 8 邻域内。
function adjacent(r: number, c: number, r2: number, c2: number): boolean {
  return Math.max(Math.abs(r - r2), Math.abs(c - c2)) === 1
}

export default function BitBoardGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const { N, K } = DIFFS[difficulty]

  // 每行用一个 mask 表示玩家在该行放的王；rows[r] 的第 c 位=1 表示 (r,c) 放了王。
  const [rows, setRows] = useState<number[]>(() => Array<number>(DIFFS['easy'].N).fill(0))
  const [muted, setMuted] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [solved, setSolved] = useState(0)

  // 所有已放王的坐标
  const kings = useMemo(() => {
    const list: { r: number; c: number }[] = []
    for (let r = 0; r < rows.length; r++)
      for (let c = 0; c < N; c++) if ((rows[r] >> c) & 1) list.push({ r, c })
    return list
  }, [rows, N])

  // 每个王是否与别的王冲突（8 邻域内还有王）——用于高亮非法。
  const conflictSet = useMemo(() => {
    const bad = new Set<string>()
    for (let i = 0; i < kings.length; i++)
      for (let j = i + 1; j < kings.length; j++) {
        const a = kings[i]
        const b = kings[j]
        if (adjacent(a.r, a.c, b.r, b.c)) {
          bad.add(`${a.r},${a.c}`)
          bad.add(`${b.r},${b.c}`)
        }
      }
    return bad
  }, [kings])

  const placed = kings.length
  const hasConflict = conflictSet.size > 0
  const win = placed === K && !hasConflict

  // DP 方案总数（点击才算，避免困难档每次渲染都跑）
  const [totalShown, setTotalShown] = useState<number | null>(null)
  // 上一次是否处于达成态——用于「刚达成」的一次性庆祝音，避免在渲染期改 state
  const [wasWin, setWasWin] = useState(false)

  const resetBoard = (spec: DiffSpec) => {
    setRows(Array<number>(spec.N).fill(0))
    setRevealed(false)
    setTotalShown(null)
    setWasWin(false)
  }

  // 计算「若在 (r,c) 落子后」是否恰好达成，用于即时反馈音与计数。
  const wouldWinAfter = (nextRows: number[]): boolean => {
    const list: { r: number; c: number }[] = []
    for (let r = 0; r < nextRows.length; r++)
      for (let c = 0; c < N; c++) if ((nextRows[r] >> c) & 1) list.push({ r, c })
    if (list.length !== K) return false
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++)
        if (adjacent(list[i].r, list[i].c, list[j].r, list[j].c)) return false
    return true
  }

  const toggle = (r: number, c: number) => {
    const placing = ((rows[r] >> c) & 1) === 0
    const nx = rows.slice()
    nx[r] = nx[r] ^ (1 << c)
    setRows(nx)
    setRevealed(false)

    const nowWin = wouldWinAfter(nx)
    if (nowWin && !wasWin) {
      setSolved((n) => n + 1)
      playGameTone({ frequency: 659, duration: 0.1 }, muted)
      setTimeout(() => playGameTone({ frequency: 988, duration: 0.16 }, muted), 90)
    } else {
      playGameTone({ frequency: placing ? 480 + r * 40 : 300, duration: 0.07 }, muted)
    }
    setWasWin(nowWin)
  }

  const pickDiff = (d: Difficulty) => {
    if (d === difficulty) return
    setDifficulty(d)
    resetBoard(DIFFS[d])
    playGameTone({ frequency: 420, duration: 0.06 }, muted)
  }

  const clear = () => {
    resetBoard(DIFFS[difficulty])
    playGameTone({ frequency: 360, duration: 0.06 }, muted)
  }

  const reveal = () => {
    const total = countKings(N, K)
    setTotalShown(total)
    setRevealed(true)
    playGameTone({ frequency: 523, duration: 0.12 }, muted)
    setTimeout(() => playGameTone({ frequency: 784, duration: 0.16 }, muted), 110)
  }

  let feedback = `在 ${N}×${N} 棋盘上放 ${K} 个王，两两不能相邻（含斜角）。点格子放 / 取。`
  let fbClass = ''
  if (hasConflict) {
    feedback = `有王互相攻击了（红色高亮）——王之间至少要隔一格。挪开冲突的王。`
    fbClass = 'bad'
  } else if (win) {
    feedback = `完成！${K} 个王互不攻击。这只是其中一种布局，点「看方案总数」看看一共有多少种。`
    fbClass = 'win'
  } else if (placed < K) {
    feedback = `已放 ${placed} / ${K} 个，继续——保持两两不相邻。`
  } else if (placed > K) {
    feedback = `放多了：当前 ${placed} 个，目标是正好 ${K} 个。`
    fbClass = 'bad'
  }

  const CELL = 52
  const boardPx = N * CELL

  return (
    <div className="gbb">
      <div className="gbb__head">
        <span className="gbb__title">
          <Grid3x3 size={18} /> 棋盘布阵
        </span>
        <span className="gbb__sub">放满 K 个互不攻击的王</span>
        <div className="gbb__diff" role="group" aria-label="难度">
          {DIFF_ORDER.map((d) => (
            <button
              key={d}
              className={`gbb__diff-pill${d === difficulty ? ' on' : ''}`}
              onClick={() => pickDiff(d)}
              aria-pressed={d === difficulty}
            >
              {DIFFS[d].label}
            </button>
          ))}
        </div>
        <button className="gbb__icon-btn" onClick={() => setMuted((m) => !m)} aria-label="静音">
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      <div className="gbb__body">
        <div className="gbb__board-col">
          <div className="gbb__board" style={{ width: boardPx, height: boardPx }}>
            <svg viewBox={`0 0 ${boardPx} ${boardPx}`} width={boardPx} height={boardPx} role="img" aria-label="棋盘布阵游戏棋盘">
              {Array.from({ length: N }, (_, r) =>
                Array.from({ length: N }, (_, c) => {
                  const hasKing = ((rows[r] >> c) & 1) === 1
                  const bad = conflictSet.has(`${r},${c}`)
                  const dark = (r + c) % 2 === 1
                  return (
                    <g key={`${r}-${c}`} transform={`translate(${c * CELL},${r * CELL})`} onClick={() => toggle(r, c)} style={{ cursor: 'pointer' }}>
                      <rect
                        width={CELL}
                        height={CELL}
                        fill={dark ? 'var(--surface-2)' : 'var(--surface-3)'}
                        stroke="var(--border)"
                        strokeWidth="1"
                      />
                      {hasKing && (
                        <g transform={`translate(${CELL / 2},${CELL / 2})`}>
                          <circle
                            r={CELL * 0.32}
                            fill={bad ? 'color-mix(in srgb, var(--viz-invalid) 82%, #000)' : 'var(--grad-accent)'}
                            stroke={bad ? 'var(--viz-invalid)' : 'var(--accent-2)'}
                            strokeWidth={bad ? 2.5 : 1.5}
                          />
                          <text y="5" textAnchor="middle" fontSize="18" fontWeight="700" fill={bad ? '#fff' : 'var(--text-on-accent)'}>
                            ♔
                          </text>
                        </g>
                      )}
                    </g>
                  )
                }),
              )}
            </svg>
          </div>
          <div className="gbb__masks">
            <span className="gbb__masks-lab">各行 mask（二进制）</span>
            <div className="gbb__mask-list">
              {rows.map((m, r) => (
                <span key={r} className={`gbb__mask${!(m & (m << 1)) ? '' : ' bad'}`}>
                  行{r + 1}:{' '}
                  <b>
                    {Array.from({ length: N }, (_, k) => (m >> (N - 1 - k)) & 1).join('')}
                  </b>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="gbb__panel">
          <div className="gbb__count">
            <b className={win ? 'gbb__grad' : hasConflict ? 'gbb__bad' : ''}>{placed}</b>
            <span>已放王 / 目标 {K}</span>
          </div>
          <div className={`gbb__feedback ${fbClass}`}>{feedback}</div>

          <div className="gbb__hint">
            <span className="gbb__hint-k">判定原理</span>
            同一行用 <code>x&amp;(x&lt;&lt;1)</code> 查横向相邻；相邻两行用 <code>x&amp;y</code>、<code>x&amp;(y&lt;&lt;1)</code>、<code>x&amp;(y&gt;&gt;1)</code> 查上下 / 斜角冲突——红色王就是这些位运算查出的攻击对。
          </div>

          <div className="gbb__actions">
            <button className="gbb__btn" onClick={clear}>
              <RotateCcw size={16} /> 清空
            </button>
            <button className="gbb__btn gbb__btn--primary" onClick={reveal}>
              <Sigma size={16} /> 看方案总数
            </button>
          </div>

          {revealed && totalShown != null && (
            <div className="gbb__reveal">
              <div className="gbb__reveal-row">
                <Trophy size={15} />
                <span>
                  {N}×{N} 放 {K} 个互不攻击的王，合法布局共{' '}
                  <b>{totalShown}</b> 种。
                </span>
              </div>
              <div className="gbb__reveal-tip">
                你找到的是其中 <b>1</b> 种；状压 DP 一次数清了全部 {totalShown} 种——这正是「找一个解」和「数所有解」的差别。
              </div>
            </div>
          )}

          <div className="gbb__stats">已完成布局 {solved} 次</div>
        </div>
      </div>
    </div>
  )
}
