import { useMemo, useState } from 'react'
import { Layers, Shuffle, Trophy, Volume2, VolumeX, Undo2, RotateCcw } from 'lucide-react'
import { solveStoneMerge } from '../../algorithms/stone-merge/index.ts'
import { playGameTone } from './runtime/audio'
import { browserRandom, randomInt } from './runtime/random'
import { useRoundStats } from './runtime/useRoundStats'
import './game.css'
import './game-stone.css'

type Difficulty = 'easy' | 'medium' | 'hard'

interface DiffSpec {
  label: string
  count: number
  vMin: number
  vRange: number // 石子值随机上限（不含）：实际值 = vMin + floor(random * vRange)
}

const DIFFS: Record<Difficulty, DiffSpec> = {
  easy: { label: '简单', count: 4, vMin: 3, vRange: 8 },
  medium: { label: '中等', count: 5, vMin: 3, vRange: 12 },
  hard: { label: '困难', count: 6, vMin: 4, vRange: 16 },
}

const DIFF_ORDER: Difficulty[] = ['easy', 'medium', 'hard']

/**
 * 贪心基线（相邻版哈夫曼）：反复挑「相邻两堆之和最小」的一对合并，累加代价。
 * 只受相邻约束——它常常不是最优，正好和 DP 拉开差距。返回贪心总代价。
 */
function solveGreedy(a: number[]): number {
  let heaps = a.slice()
  let cost = 0
  while (heaps.length > 1) {
    let bi = 0
    let bv = Infinity
    for (let i = 0; i < heaps.length - 1; i++) {
      const s = heaps[i] + heaps[i + 1]
      if (s < bv) {
        bv = s
        bi = i
      }
    }
    cost += bv
    heaps = [...heaps.slice(0, bi), bv, ...heaps.slice(bi + 2)]
  }
  return cost
}

function makeStones(difficulty: Difficulty): number[] {
  const d = DIFFS[difficulty]
  return Array.from({ length: d.count }, () => randomInt(browserRandom, d.vMin, d.vMin + d.vRange - 1))
}

// 一堆石子：value=当前堆值；src=它由哪些原始下标合并而来（用于展示与「代价」溯源）
interface Heap {
  value: number
  src: number[]
}

// 一次合并操作的快照，用于「撤销上一步」逐步回退
interface Step {
  heaps: Heap[] // 合并「之前」的堆序列（撤销即恢复到此）
  cost: number // 合并「之前」的累计代价
  mergedValue: number // 这一步合并出的新堆值（=本步代价）
}

export default function StoneMergeGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  // 首帧只随机一次，stones（原始条/DP 求解）与 heaps（可玩堆）同源，避免两者数字不一致
  const [init] = useState(() => makeStones('medium'))
  const [stones, setStones] = useState<number[]>(init)
  // 当前堆序列（初始为每颗石子各自一堆）
  const [heaps, setHeaps] = useState<Heap[]>(() => init.map((v, i) => ({ value: v, src: [i] })))
  const [cost, setCost] = useState(0)
  const [history, setHistory] = useState<Step[]>([])
  // 选中的第一堆（等待点相邻堆完成合并）；null 表示未选
  const [firstSel, setFirstSel] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [muted, setMuted] = useState(false)
  const round = useRoundStats()

  const dpMin = useMemo(() => solveStoneMerge(stones, 'min').cost, [stones])
  const greedy = useMemo(() => solveGreedy(stones), [stones])
  const done = heaps.length === 1
  const win = revealed && done && cost === dpMin
  const greedyWorse = greedy > dpMin

  // 用一副新石子重置整局状态
  const resetWith = (arr: number[]) => {
    setStones(arr)
    setHeaps(arr.map((v, i) => ({ value: v, src: [i] })))
    setCost(0)
    setHistory([])
    setFirstSel(null)
    setRevealed(false)
  }

  // 点一堆：首点选中；再点相邻堆则合并；点非相邻堆则改选它；点自己则取消
  const clickHeap = (i: number) => {
    if (revealed || done) return
    if (firstSel === null) {
      setFirstSel(i)
      playGameTone({ frequency: 430 + i * 40 }, muted)
      return
    }
    if (i === firstSel) {
      setFirstSel(null)
      playGameTone({ frequency: 300, duration: 0.06, type: 'sine' }, muted)
      return
    }
    if (Math.abs(i - firstSel) === 1) {
      // 相邻——执行合并
      const lo = Math.min(i, firstSel)
      const a = heaps[lo]
      const b = heaps[lo + 1]
      const mergedValue = a.value + b.value
      const merged: Heap = { value: mergedValue, src: [...a.src, ...b.src] }
      setHistory((h) => [...h, { heaps: heaps.slice(), cost, mergedValue }])
      setHeaps((hs) => [...hs.slice(0, lo), merged, ...hs.slice(lo + 2)])
      setCost((c) => c + mergedValue)
      setFirstSel(null)
      playGameTone({ frequency: 360 + Math.min(mergedValue * 4, 520), duration: 0.11 }, muted)
    } else {
      // 不相邻——改选为新的第一堆
      setFirstSel(i)
      playGameTone({ frequency: 220, duration: 0.07, type: 'sine' }, muted)
    }
  }

  const undo = () => {
    if (history.length === 0 || revealed) return
    const last = history[history.length - 1]
    setHeaps(last.heaps)
    setCost(last.cost)
    setHistory((h) => h.slice(0, -1))
    setFirstSel(null)
    playGameTone({ frequency: 300, duration: 0.07, type: 'sine' }, muted)
  }

  const restart = () => {
    // 重来：同一副石子回到未合并起点
    resetWith(stones)
    round.start()
    playGameTone({ frequency: 320, duration: 0.06, type: 'sine' }, muted)
  }

  const reveal = () => {
    setRevealed(true)
    const w = done && cost === dpMin
    round.record(w)
    if (w) {
      playGameTone({ frequency: 523, duration: 0.12 }, muted)
      setTimeout(() => playGameTone({ frequency: 784, duration: 0.16 }, muted), 110)
    } else {
      playGameTone({ frequency: 300, duration: 0.1, type: 'sine' }, muted)
    }
  }

  const shuffle = () => {
    resetWith(makeStones(difficulty))
    round.start()
    playGameTone({ frequency: 360, duration: 0.06 }, muted)
  }

  const pickDiff = (d: Difficulty) => {
    if (d === difficulty) return
    setDifficulty(d)
    resetWith(makeStones(d))
    round.start()
    playGameTone({ frequency: 420, duration: 0.06 }, muted)
  }

  let feedback =
    '点两堆相邻石子把它们并成一堆，代价 = 两堆之和，累加到总代价。并到只剩一堆，看能否追平 DP 的最小总代价。'
  let fbClass = ''
  if (firstSel !== null && !done) {
    feedback = `已选中第 ${firstSel + 1} 堆（值 ${heaps[firstSel].value}）——再点它左边或右边相邻的一堆完成合并。`
  }
  if (win) {
    feedback = `🎉 完美！你的总代价 ${cost}，正好追平 DP 求得的最小合并代价。`
    fbClass = 'win'
  } else if (revealed) {
    feedback = done
      ? `DP 最小是 ${dpMin}，你的总代价 ${cost}，还差 ${cost - dpMin}。合并顺序不同，总代价就不同——这正是区间 DP 要解决的。`
      : `还没并完（剩 ${heaps.length} 堆）。DP 最小合并代价是 ${dpMin}，把石子并到只剩一堆再来对照吧。`
  } else if (done) {
    feedback = `并完了！你的总代价 ${cost}。点「看 DP 最优」对照，看是不是最小。`
  }

  return (
    <div className="game">
      <div className="game__head">
        <span className="game__title">
          <Layers size={18} /> 合并石子
        </span>
        <span className="game__sub">手选合并顺序——总代价能压到 DP 最小吗？</span>
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
      <div className="game__body gsm__body">
        <div>
          <div className="game__shelf-label">
            石子（点相邻两堆合并 · {done ? '已并成一堆' : `剩 ${heaps.length} 堆`}）
          </div>
          <div className="gsm__row">
            {heaps.map((h, i) => {
              const selected = firstSel === i
              const adjacent = firstSel !== null && !selected && Math.abs(i - firstSel) === 1
              const cls = [
                'gsm__stone',
                selected ? 'sel' : '',
                adjacent ? 'adj' : '',
                h.src.length > 1 ? 'merged' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => clickHeap(i)}
                  aria-pressed={selected}
                  disabled={revealed || done}
                >
                  <span className="gsm__val">{h.value}</span>
                  <span className="gsm__src">
                    {h.src.length > 1 ? `${h.src.length} 颗` : `第 ${h.src[0] + 1} 颗`}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="gsm__origin" aria-label="原始石子">
            <span className="gsm__origin-label">原始</span>
            {stones.map((v, i) => (
              <span key={i} className="gsm__origin-chip">
                {v}
              </span>
            ))}
          </div>
        </div>
        <div className="game__panel">
          <div className="game__value">
            <b className={win ? 'grad-text' : ''}>{cost}</b>
            <span>已累计代价</span>
          </div>
          <div className={`game__feedback ${fbClass}`}>{feedback}</div>
          {revealed && (
            <div className="game__compare">
              <div className="game__compare-row">
                <span className="game__cmp game__cmp--greedy">
                  贪心<span className="game__cmp-note">（每次并最小相邻两堆）</span>
                  <b>{greedy}</b>
                </span>
                <span className="game__cmp game__cmp--you">
                  你 <b>{cost}</b>
                </span>
                <span className="game__cmp game__cmp--dp">
                  DP 最小 <b>{dpMin}</b>
                </span>
              </div>
              <div className="game__compare-tip">
                本题越小越好。
                {greedyWorse
                  ? '注意贪心（总挑最小相邻两堆）在这组也没压到最小——因为只能并相邻堆，此刻并哪对取决于全局，这正是要用区间 DP 的原因。'
                  : '这组贪心恰好也达到了最小，但它未必总是最优——只能并相邻堆时，最优要靠区间 DP 枚举所有断点。'}
              </div>
            </div>
          )}
          <div className="game__actions">
            <button className="gbtn" onClick={undo} disabled={history.length === 0 || revealed}>
              <Undo2 size={16} /> 撤销一步
            </button>
            <button className="gbtn" onClick={restart} disabled={history.length === 0 || revealed}>
              <RotateCcw size={16} /> 重来
            </button>
          </div>
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
