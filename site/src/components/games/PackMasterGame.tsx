import { useMemo, useState } from 'react'
import { Package, Sparkles, Shuffle, Trophy, Volume2, VolumeX } from 'lucide-react'
import { solveZeroOneKnapsack } from '../../algorithms/knapsack/index.ts'
import { playGameTone } from './runtime/audio'
import { browserRandom, randomInt } from './runtime/random'
import { useRoundStats } from './runtime/useRoundStats'
import './game.css'

interface GItem {
  w: number
  v: number
}

type Difficulty = 'easy' | 'medium' | 'hard'

interface DiffSpec {
  label: string
  count: number
  wMin: number
  wRange: number // 重量随机上限（不含），实际重量 = wMin + floor(random * wRange)
  vMin: number
  vRange: number
  capRatio: number
}

const DIFFS: Record<Difficulty, DiffSpec> = {
  easy: { label: '简单', count: 4, wMin: 2, wRange: 4, vMin: 3, vRange: 7, capRatio: 0.5 },
  medium: { label: '中等', count: 5, wMin: 2, wRange: 6, vMin: 3, vRange: 10, capRatio: 0.5 },
  hard: { label: '困难', count: 6, wMin: 3, wRange: 7, vMin: 4, vRange: 15, capRatio: 0.45 },
}

const DIFF_ORDER: Difficulty[] = ['easy', 'medium', 'hard']

// 贪心基线：按性价比 v/w 降序依次尝试装入（装得下就装）
function solveGreedy(items: GItem[], cap: number): { value: number; pick: boolean[] } {
  const order = items.map((_, i) => i).sort((a, b) => items[b].v / items[b].w - items[a].v / items[a].w)
  const pick = Array<boolean>(items.length).fill(false)
  let load = 0
  let value = 0
  for (const i of order) {
    if (load + items[i].w <= cap) {
      pick[i] = true
      load += items[i].w
      value += items[i].v
    }
  }
  return { value, pick }
}

function makeGame(difficulty: Difficulty): { items: GItem[]; cap: number } {
  const d = DIFFS[difficulty]
  const items = Array.from({ length: d.count }, () => ({
    w: randomInt(browserRandom, d.wMin, d.wMin + d.wRange - 1),
    v: randomInt(browserRandom, d.vMin, d.vMin + d.vRange - 1),
  }))
  const totalW = items.reduce((s, it) => s + it.w, 0)
  const cap = Math.max(6, Math.round(totalW * d.capRatio))
  return { items, cap }
}

export default function PackMasterGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [game, setGame] = useState(() => makeGame('medium'))
  const [sel, setSel] = useState<boolean[]>(() => game.items.map(() => false))
  const [revealed, setRevealed] = useState(false)
  const [muted, setMuted] = useState(false)
  const round = useRoundStats()

  const opt = useMemo(() => solveZeroOneKnapsack(game.items, game.cap), [game])
  const greedy = useMemo(() => solveGreedy(game.items, game.cap), [game])
  const curW = game.items.reduce((s, it, i) => s + (sel[i] ? it.w : 0), 0)
  const curV = game.items.reduce((s, it, i) => s + (sel[i] ? it.v : 0), 0)
  const over = curW > game.cap
  const win = !over && revealed && curV === opt.value
  const greedyBeaten = greedy.value < opt.value

  const toggle = (i: number) => {
    playGameTone({ frequency: 440 + i * 55 }, muted)
    setSel((s) => s.map((x, k) => (k === i ? !x : x)))
    setRevealed(false)
  }
  const reveal = () => {
    setRevealed(true)
    const w = !over && curV === opt.value
    round.record(w)
    if (w) {
      playGameTone({ frequency: 523, duration: 0.12 }, muted)
      setTimeout(() => playGameTone({ frequency: 784, duration: 0.16 }, muted), 110)
    } else {
      playGameTone({ frequency: 300, duration: 0.1, type: 'sine' }, muted)
    }
  }
  const shuffle = () => {
    const g = makeGame(difficulty)
    setGame(g)
    setSel(g.items.map(() => false))
    setRevealed(false)
    round.start()
    playGameTone({ frequency: 360, duration: 0.06 }, muted)
  }
  const pickDiff = (d: Difficulty) => {
    if (d === difficulty) return
    setDifficulty(d)
    const g = makeGame(d)
    setGame(g)
    setSel(g.items.map(() => false))
    setRevealed(false)
    round.start()
    playGameTone({ frequency: 420, duration: 0.06 }, muted)
  }

  let feedback = '点物品放进背包，凑出你认为最大的总价值，再点「看 DP 最优」对照。'
  let fbClass = ''
  if (over) {
    feedback = `超重了！当前 ${curW} > 容量 ${game.cap}，先卸下点东西。`
    fbClass = 'over'
  } else if (win) {
    feedback = `🎉 完美！你和 DP 一样，找到了最优解 ${opt.value}。`
    fbClass = 'win'
  } else if (revealed) {
    feedback = `DP 最优是 ${opt.value}，你现在 ${curV}，还差 ${opt.value - curV}。带 ★ 的是一种最优取法。`
  }

  return (
    <div className="game">
      <div className="game__head">
        <span className="game__title">
          <Package size={18} /> 装包大师
        </span>
        <span className="game__sub">容量 {game.cap}——凭直觉挑，能追平 DP 吗？</span>
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
      <div className="game__body">
        <div>
          <div className="game__shelf-label">货架（点击放入 / 取出）</div>
          <div className="game__items">
            {game.items.map((it, i) => (
              <button key={i} className={`gitem${sel[i] ? ' in' : ''}`} onClick={() => toggle(i)}>
                {revealed && opt.pick[i] && (
                  <span className="gitem__star">
                    <Sparkles size={16} />
                  </span>
                )}
                <div className="gitem__v">{it.v}</div>
                <div className="gitem__vlab">价值</div>
                <div className="gitem__w">重 {it.w}</div>
                <div className="gitem__ratio">性价比 {(it.v / it.w).toFixed(1)}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="game__panel">
          <div>
            <div className="gauge__row">
              <span>
                背包 {curW}/{game.cap}
              </span>
              <span>{over ? '超重' : ''}</span>
            </div>
            <div className="gauge">
              <div
                className={`gauge__fill${over ? ' over' : ''}`}
                style={{ width: `${Math.min(100, (curW / game.cap) * 100)}%` }}
              />
            </div>
          </div>
          <div className="game__value">
            <b className={win ? 'grad-text' : ''}>{curV}</b>
            <span>当前总价值</span>
          </div>
          <div className={`game__feedback ${fbClass}`}>{feedback}</div>
          {revealed && (
            <div className="game__compare">
              <div className="game__compare-row">
                <span className="game__cmp game__cmp--greedy">
                  贪心<span className="game__cmp-note">（按性价比）</span>
                  <b>{greedy.value}</b>
                </span>
                <span className="game__cmp game__cmp--you">
                  你 <b>{curV}</b>
                </span>
                <span className="game__cmp game__cmp--dp">
                  DP 最优 <b>{opt.value}</b>
                </span>
              </div>
              {greedyBeaten && (
                <div className="game__compare-tip">贪心不是最优——这正是要用 DP 的原因。</div>
              )}
            </div>
          )}
          <div className="game__actions">
            <button className="gbtn" onClick={shuffle}>
              <Shuffle size={16} /> 换一批
            </button>
            <button className="gbtn gbtn--primary" onClick={reveal}>
              <Trophy size={16} /> 看 DP 最优
            </button>
          </div>
          <div className="game__stats">
            已玩 {round.stats.played} 局 · 追平 DP {round.stats.matched} 次
          </div>
        </div>
      </div>
    </div>
  )
}
