import { useMemo, useState } from 'react'
import { Waypoints, Shuffle, Trophy, Volume2, VolumeX } from 'lucide-react'
import {
  buildRerootTree,
  layoutRerootTree,
  solveRerootDistance,
  type RerootEdge as Edge,
} from '../../algorithms/reroot/index.ts'
import { playGameTone } from './runtime/audio'
import { browserRandom, randomInt } from './runtime/random'
import { useRoundStats } from './runtime/useRoundStats'
import './game.css'
import './game-reroot.css'

type Difficulty = 'easy' | 'medium' | 'hard'

interface DiffSpec {
  label: string
  n: number
}

const DIFFS: Record<Difficulty, DiffSpec> = {
  easy: { label: '简单', n: 6 },
  medium: { label: '中等', n: 8 },
  hard: { label: '困难', n: 11 },
}
const DIFF_ORDER: Difficulty[] = ['easy', 'medium', 'hard']

// 随机生成一棵 n 点树（每个新点挂到一个已有点上），0-based 边
function makeTree(n: number): Edge[] {
  const edges: Edge[] = []
  for (let v = 1; v < n; v++) {
    const p = randomInt(browserRandom, 0, v - 1) // 0..v-1 里随机父
    edges.push({ u: p, v })
  }
  return edges
}

export default function RerootGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [n, setN] = useState(DIFFS.medium.n)
  const [edges, setEdges] = useState<Edge[]>(() => makeTree(DIFFS.medium.n))
  const [rootSel, setRootSel] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [muted, setMuted] = useState(false)
  const round = useRoundStats()

  // 换根一次算好每点距离和（O(n)），并布局
  const { nodes, maxDepth, dist, best, bestNode } = useMemo(() => {
    const t = buildRerootTree(n, edges, 0)
    const { nodes, maxDepth } = layoutRerootTree(t)
    const res = solveRerootDistance(t, 'unweighted')
    return { nodes, maxDepth, dist: res.dist, best: res.best, bestNode: res.bestNode }
  }, [n, edges])

  const distOfSel = dist[rootSel]
  const win = revealed && distOfSel === best

  const reset = (nn: number) => {
    setN(nn)
    setEdges(makeTree(nn))
    setRootSel(0)
    setRevealed(false)
    round.start()
  }
  const pickNode = (id: number) => {
    if (revealed) return
    setRootSel(id)
    playGameTone({ frequency: 430 + id * 30 }, muted)
  }
  const reveal = () => {
    setRevealed(true)
    const w = distOfSel === best
    round.record(w)
    if (w) {
      playGameTone({ frequency: 523, duration: 0.12 }, muted)
      setTimeout(() => playGameTone({ frequency: 784, duration: 0.16 }, muted), 110)
    } else {
      playGameTone({ frequency: 300, duration: 0.1, type: 'sine' }, muted)
    }
  }
  const shuffle = () => {
    reset(n)
    playGameTone({ frequency: 360, duration: 0.06 }, muted)
  }
  const pickDiff = (d: Difficulty) => {
    if (d === difficulty) return
    setDifficulty(d)
    reset(DIFFS[d].n)
    playGameTone({ frequency: 420, duration: 0.06 }, muted)
  }

  let feedback = '点一个节点把它当「集合点」，实时看它到所有其它点的距离和。挑战：找到距离和最小的点（树的重心方向）。'
  let fbClass = ''
  if (win) {
    feedback = `🎉 命中重心！你选的节点 ${rootSel + 1} 距离和 ${distOfSel}，正是全树最小。换根一次就能同时算出所有点。`
    fbClass = 'win'
  } else if (revealed) {
    feedback = `最小距离和是 ${best}（在节点 ${bestNode + 1}），你选的节点 ${rootSel + 1} 是 ${distOfSel}，还差 ${distOfSel - best}。绿圈才是重心。`
  }

  // SVG 布局
  const W = 560
  const padX = 40
  const topY = 38
  const rowH = 78
  const H = topY + maxDepth * rowH + 44
  const px = (x: number) => padX + x * (W - 2 * padX)
  const py = (d: number) => topY + d * rowH
  const byId = new Map(nodes.map((nd) => [nd.id, nd]))
  const treeEdges = nodes
    .filter((nd) => nd.parent >= 0)
    .map((nd) => ({ c: nd, p: byId.get(nd.parent)! }))

  return (
    <div className="game">
      <div className="game__head">
        <span className="game__title">
          <Waypoints size={18} /> 换根巡礼
        </span>
        <span className="game__sub">点节点当集合点——凭直觉找到距离和最小的重心？</span>
        <div className="game__diff" role="group" aria-label="难度">
          {DIFF_ORDER.map((d) => (
            <button
              key={d}
              className={`game__diff-pill${d === difficulty ? ' on' : ''}`}
              onClick={() => pickDiff(d)}
              aria-pressed={d === difficulty}
            >
              {DIFFS[d].label}
            </button>
          ))}
        </div>
        <button
          className="icon-btn"
          style={{ width: 34, height: 34 }}
          onClick={() => setMuted((m) => !m)}
          aria-label="静音"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      <div className="game__body grr__body">
        <div>
          <div className="game__shelf-label">
            树（点节点设为根 · 当前根 = 节点 {rootSel + 1}）
          </div>
          <div className="grr__stage">
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="点节点把它当集合点，看它到所有其它点的距离和">
              {treeEdges.map((e, i) => (
                <line
                  key={`e${i}`}
                  x1={px(e.c.x)}
                  y1={py(e.c.depth)}
                  x2={px(e.p.x)}
                  y2={py(e.p.depth)}
                  stroke="var(--border-strong)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ))}
              {nodes.map((nd) => {
                const isSel = nd.id === rootSel
                const isBest = revealed && nd.id === bestNode
                const fill = isSel
                  ? 'var(--grad-accent)'
                  : isBest
                    ? 'color-mix(in srgb, var(--viz-chosen) 22%, var(--surface-3))'
                    : 'var(--surface-3)'
                const stroke = isSel ? 'var(--accent-1)' : isBest ? 'var(--viz-chosen)' : 'var(--border-strong)'
                const tx = isSel ? 'var(--text-on-accent)' : 'var(--text-1)'
                return (
                  <g
                    key={nd.id}
                    transform={`translate(${px(nd.x)},${py(nd.depth)})`}
                    onClick={() => pickNode(nd.id)}
                    style={{ cursor: revealed ? 'default' : 'pointer' }}
                  >
                    <circle r={isSel ? 21 : 18} fill={fill} stroke={stroke} strokeWidth={isSel ? 3 : 1.8} />
                    <text y={revealed ? -2 : 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={tx}>
                      {nd.id + 1}
                    </text>
                    {revealed && (
                      <text y="12" textAnchor="middle" fontSize="9" className="mono" fill={tx}>
                        d{dist[nd.id]}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        <div className="game__panel">
          <div className="game__value">
            <b className={win ? 'grad-text' : ''}>{distOfSel}</b>
            <span>节点 {rootSel + 1} 的距离和</span>
          </div>
          <div className={`game__feedback ${fbClass}`}>{feedback}</div>
          {revealed && (
            <div className="game__compare">
              <div className="game__compare-row">
                <span className="game__cmp game__cmp--you">
                  你选 <b>{distOfSel}</b>
                </span>
                <span className="game__cmp game__cmp--dp">
                  DP 最小 <b>{best}</b>
                </span>
              </div>
              <div className="game__compare-tip">
                「看 DP 最优」用换根<strong>一次两遍 DFS</strong> 就同时算出全部 {n} 个点的距离和（图上每点已标 d 值），
                {win ? '你正好命中了最小点。' : `其中最小在节点 ${bestNode + 1}。`}
                若逐点暴力则要 {n}×{n} 级别的工作量。
              </div>
            </div>
          )}
          <div className="game__actions">
            <button className="gbtn" onClick={shuffle}>
              <Shuffle size={16} /> 换一棵树
            </button>
            <button className="gbtn gbtn--primary" onClick={reveal}>
              <Trophy size={16} /> 看 DP 最优
            </button>
          </div>
          <div className="game__stats">
            已玩 {round.stats.played} 局 · 命中重心 {round.stats.matched} 次
          </div>
        </div>
      </div>
    </div>
  )
}
