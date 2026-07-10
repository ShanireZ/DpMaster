import { useMemo, useState } from 'react'
import { PartyPopper, Sparkles, Shuffle, Trophy, Volume2, VolumeX } from 'lucide-react'
import {
  buildRootedTree,
  layoutRootedTree,
  solveTreeIndependentSet,
} from '../../algorithms/tree-dp/index.ts'
import { playGameTone } from './runtime/audio'
import { browserRandom, randomInt } from './runtime/random'
import { useRoundStats } from './runtime/useRoundStats'
import './game-treeparty.css'

type Difficulty = 'easy' | 'medium' | 'hard'

interface DiffSpec {
  label: string
  count: number
  maxChildren: number
  wMin: number
  wRange: number
}

const DIFFS: Record<Difficulty, DiffSpec> = {
  easy: { label: '小公司', count: 6, maxChildren: 2, wMin: 2, wRange: 8 },
  medium: { label: '中型公司', count: 9, maxChildren: 3, wMin: 2, wRange: 12 },
  hard: { label: '大集团', count: 12, maxChildren: 3, wMin: 3, wRange: 15 },
}
const DIFF_ORDER: Difficulty[] = ['easy', 'medium', 'hard']

interface GameState {
  parent: number[]
  weight: number[]
}

// 随机长一棵树：每个新节点挂到一个已存在的、孩子数未超上限的节点下。
function makeGame(d: DiffSpec): GameState {
  const parent: number[] = [-1]
  const childCount: number[] = [0]
  for (let i = 1; i < d.count; i++) {
    // 候选父亲：孩子数未满
    const cand: number[] = []
    for (let j = 0; j < i; j++) if (childCount[j] < d.maxChildren) cand.push(j)
    const fa = cand[randomInt(browserRandom, 0, cand.length - 1)]
    parent.push(fa)
    childCount[fa]++
    childCount.push(0)
  }
  const weight = Array.from({ length: d.count }, () => randomInt(browserRandom, d.wMin, d.wMin + d.wRange - 1))
  return { parent, weight }
}

export default function TreePartyGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [game, setGame] = useState<GameState>(() => makeGame(DIFFS.easy))
  const [sel, setSel] = useState<boolean[]>(() => game.weight.map(() => false))
  const [revealed, setRevealed] = useState(false)
  const [muted, setMuted] = useState(false)
  const round = useRoundStats()

  const tree = useMemo(() => buildRootedTree(game.parent, game.weight), [game])
  const layout = useMemo(() => layoutRootedTree(tree), [tree])
  const opt = useMemo(() => solveTreeIndependentSet(tree), [tree])

  // 玩家当前是否违规：存在一对被选中的直接上下级
  const conflictPairs = useMemo(() => {
    const bad: [number, number][] = []
    for (let u = 0; u < tree.n; u++) {
      if (game.parent[u] >= 0 && sel[u] && sel[game.parent[u]]) bad.push([game.parent[u], u])
    }
    return bad
  }, [sel, tree, game])
  const conflictSet = useMemo(() => {
    const s = new Set<number>()
    conflictPairs.forEach(([a, b]) => {
      s.add(a)
      s.add(b)
    })
    return s
  }, [conflictPairs])

  const curJoy = game.weight.reduce((s, w, i) => s + (sel[i] ? w : 0), 0)
  const valid = conflictPairs.length === 0
  const win = valid && revealed && curJoy === opt.ans

  const toggle = (i: number) => {
    playGameTone({ frequency: 430 + i * 40 }, muted)
    setSel((s) => s.map((x, k) => (k === i ? !x : x)))
    setRevealed(false)
  }
  const reveal = () => {
    setRevealed(true)
    const w = valid && curJoy === opt.ans
    round.record(w)
    if (w) {
      playGameTone({ frequency: 523, duration: 0.12 }, muted)
      setTimeout(() => playGameTone({ frequency: 784, duration: 0.16 }, muted), 110)
    } else {
      playGameTone({ frequency: 300, duration: 0.1, type: 'sine' }, muted)
    }
  }
  const newGame = (d: Difficulty) => {
    const g = makeGame(DIFFS[d])
    setGame(g)
    setSel(g.weight.map(() => false))
    setRevealed(false)
    round.start()
    playGameTone({ frequency: 360, duration: 0.06 }, muted)
  }
  const shuffle = () => newGame(difficulty)
  const pickDiff = (d: Difficulty) => {
    if (d === difficulty) return
    setDifficulty(d)
    newGame(d)
  }

  let feedback = '点员工把他请来舞会，凑最大欢乐值——但不能同时请一对直接上下级。再点「看 DP 最优」对照。'
  let fbClass = ''
  if (!valid) {
    feedback = `冲突！有直接上下级同时被选中（高亮成红色），先取消其中一个。`
    fbClass = 'over'
  } else if (win) {
    feedback = `🎉 完美！你和树形 DP 一样，找到了最大欢乐独立集 ${opt.ans}。`
    fbClass = 'win'
  } else if (revealed) {
    feedback = `DP 最优是 ${opt.ans}，你现在 ${curJoy}，还差 ${opt.ans - curJoy}。带 ★ 的是一种最优请法。`
  }

  // SVG 布局
  const width = 640
  const padX = 40
  const topY = 36
  const rowH = 84
  const radius = 24
  const H = topY + layout.maxDepth * rowH + 44
  const px = (x: number) => padX + x * (width - 2 * padX)
  const py = (dep: number) => topY + dep * rowH

  return (
    <div className="tpg">
      <div className="tpg__head">
        <span className="tpg__title">
          <PartyPopper size={18} /> 舞会邀请
        </span>
        <span className="tpg__sub">点员工组队，别请一对直接上下级——能追平 DP 吗？</span>
        <div className="tpg__diff" role="group" aria-label="难度">
          {DIFF_ORDER.map((d) => (
            <button
              key={d}
              className={`tpg__diff-pill${d === difficulty ? ' on' : ''}`}
              onClick={() => pickDiff(d)}
              aria-pressed={d === difficulty}
            >
              {DIFFS[d].label}
            </button>
          ))}
        </div>
        <button
          className="tpg__icon-btn"
          onClick={() => setMuted((m) => !m)}
          aria-label="静音"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      <div className="tpg__body">
        <div className="tpg__stage">
          <svg viewBox={`0 0 ${width} ${H}`} role="img" aria-label="公司树，点员工加入舞会独立集">
            {layout.edges.map((e, i) => {
              const a = layout.byId.get(e.a)!
              const b = layout.byId.get(e.b)!
              const bad = conflictSet.has(e.a) && conflictSet.has(e.b) && sel[e.a] && sel[e.b]
              return (
                <line
                  key={i}
                  x1={px(a.x)}
                  y1={py(a.depth) + radius}
                  x2={px(b.x)}
                  y2={py(b.depth) - radius}
                  stroke={bad ? 'var(--viz-invalid)' : 'var(--border-strong)'}
                  strokeWidth={bad ? 3.4 : 1.6}
                />
              )
            })}
            {layout.nodes.map((nd) => {
              const id = nd.id
              const on = sel[id]
              const bad = conflictSet.has(id)
              const star = revealed && opt.chosen.has(id)
              let fill = 'var(--surface-3)'
              let stroke = 'var(--border-strong)'
              let textColor = 'var(--text-1)'
              if (bad) {
                fill = 'color-mix(in srgb, var(--viz-invalid) 26%, var(--surface-3))'
                stroke = 'var(--viz-invalid)'
              } else if (on) {
                fill = 'var(--grad-accent)'
                stroke = 'var(--accent-2)'
                textColor = 'var(--text-on-accent)'
              }
              return (
                <g
                  key={id}
                  className="tpg__node"
                  transform={`translate(${px(nd.x)},${py(nd.depth)})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggle(id)}
                >
                  {star && (
                    <circle r={radius + 5} fill="none" stroke="var(--viz-chosen)" strokeWidth="2.4" strokeDasharray="4 3" />
                  )}
                  <circle r={radius} fill={fill} stroke={stroke} strokeWidth={on || bad ? 2.6 : 1.6} />
                  <text y={-2} textAnchor="middle" fontSize="13" fontWeight="700" fill={textColor}>
                    {id + 1}
                  </text>
                  <text y={13} textAnchor="middle" fontSize="11" className="tpg__mono" fill={textColor}>
                    {game.weight[id]}
                  </text>
                  {star && (
                    <g transform={`translate(${radius - 4},${-radius + 2})`}>
                      <Sparkles size={14} color="var(--viz-chosen)" />
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
          <div className="tpg__legend">
            <span>
              <i style={{ background: 'var(--accent-1)' }} /> 已邀请
            </span>
            <span>
              <i style={{ borderColor: 'var(--viz-invalid)', background: 'transparent' }} /> 上下级冲突
            </span>
            <span>
              <i style={{ borderColor: 'var(--viz-chosen)', background: 'transparent' }} /> DP 最优请法
            </span>
          </div>
        </div>

        <div className="tpg__panel">
          <div className="tpg__value">
            <b className={win ? 'grad-text' : ''}>{curJoy}</b>
            <span>当前欢乐值{valid ? '' : '（有冲突）'}</span>
          </div>
          <div className={`tpg__feedback ${fbClass}`}>{feedback}</div>
          {revealed && valid && (
            <div className="tpg__compare">
              <div className="tpg__compare-row">
                <span className="tpg__cmp tpg__cmp--you">
                  你 <b>{curJoy}</b>
                </span>
                <span className="tpg__cmp tpg__cmp--dp">
                  DP 最优 <b>{opt.ans}</b>
                </span>
              </div>
              {curJoy < opt.ans && (
                <div className="tpg__compare-tip">
                  贪心地「先请欢乐值最高的」往往不是最优——放弃一个高薪上司，可能腾出两个下属的名额。
                </div>
              )}
            </div>
          )}
          <div className="tpg__actions">
            <button className="tpg__btn" onClick={shuffle}>
              <Shuffle size={16} /> 换公司
            </button>
            <button className="tpg__btn tpg__btn--primary" onClick={reveal}>
              <Trophy size={16} /> 看 DP 最优
            </button>
          </div>
          <div className="tpg__stats">
            已玩 {round.stats.played} 局 · 追平 DP {round.stats.matched} 次
          </div>
        </div>
      </div>
    </div>
  )
}
