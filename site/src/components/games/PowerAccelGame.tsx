import { useLayoutEffect, useMemo, useState } from 'react'
import { Zap, Shuffle, Trophy, Volume2, VolumeX, Undo2, RotateCcw, Sparkles } from 'lucide-react'
import { playGameTone } from './runtime/audio'
import { createSeededRandom, randomInt } from './runtime/random'
import type { RandomSource } from './runtime/random'
import { useRoundSeed } from './runtime/useRoundSeed'
import { useRoundStats } from './runtime/useRoundStats'
import './game.css'
import './game-power.css'

type Difficulty = 'easy' | 'medium' | 'hard'

interface DiffSpec {
  label: string
  nMin: number
  nMax: number
}

// 目标幂次范围：简单 ~n≤16、中等 ~n≤50、困难 ~n≤200
const DIFFS: Record<Difficulty, DiffSpec> = {
  easy: { label: '简单', nMin: 6, nMax: 16 },
  medium: { label: '中等', nMin: 18, nMax: 50 },
  hard: { label: '困难', nMin: 60, nMax: 200 },
}

const DIFF_ORDER: Difficulty[] = ['easy', 'medium', 'hard']

// 快速幂（二进制）步数：⌊log2 n⌋ + popcount(n) − 1
function fastPowSteps(n: number): number {
  if (n <= 1) return 0
  const log2 = Math.floor(Math.log2(n))
  let pc = 0
  let x = n
  while (x > 0) {
    pc += x & 1
    x >>= 1
  }
  return log2 + pc - 1
}

// 暴力（逐个乘）步数：n − 1
function bruteSteps(n: number): number {
  return Math.max(0, n - 1)
}

// 一条“加法链”步骤：由哪两个已有指数合成（翻倍时 a===b）
interface ChainStep {
  a: number // 参与合成的指数之一
  b: number // 另一个（翻倍时与 a 相同）
  r: number // 得到的新指数 = a + b
  kind: 'double' | 'add'
}

// oxlint-disable-next-line react/only-export-components -- executable tests import the pure round builder
export function buildExponentRound(difficulty: Difficulty, random: RandomSource): number {
  const d = DIFFS[difficulty]
  return randomInt(random, d.nMin, d.nMax)
}

export default function PowerAccelGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const roundSeed = useRoundSeed()
  const [target, setTarget] = useState(() =>
    buildExponentRound('medium', createSeededRandom(roundSeed.seed)),
  )
  // 已合成的步骤链（初始集合恒为 {1}，不计入步骤）
  const [steps, setSteps] = useState<ChainStep[]>([])
  // 当前选中的两个待合成指数（栈式：最多 2 个）
  const [picks, setPicks] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const [muted, setMuted] = useState(false)
  const round = useRoundStats()
  const startRound = round.start

  useLayoutEffect(() => {
    setTarget(buildExponentRound(difficulty, createSeededRandom(roundSeed.seed)))
    setSteps([])
    setPicks([])
    setRevealed(false)
    startRound()
  }, [difficulty, roundSeed, startRound])

  // 当前已达指数集合：{1} ∪ 每步的结果
  const reachedList = useMemo(() => {
    const seen = new Set<number>([1])
    const out: number[] = [1]
    for (const s of steps) {
      if (!seen.has(s.r)) {
        seen.add(s.r)
        out.push(s.r)
      }
    }
    return out
  }, [steps])
  const reachedSet = useMemo(() => new Set(reachedList), [reachedList])

  const fast = fastPowSteps(target)
  const brute = bruteSteps(target)
  const used = steps.length
  const done = reachedSet.has(target)
  const atOrBeatFast = done && used <= fast // 过关：追平或超越快速幂都算
  const beatFast = done && used < fast // 严格少于基线 = 超越
  const tieFast = done && used === fast // 恰好等于基线 = 追平

  // 选中一个指数（用于合成）；已选满 2 个则忽略；点已选的取消
  const pick = (e: number) => {
    if (done) return
    setRevealed(false)
    setPicks((p) => {
      const idx = p.indexOf(e)
      if (idx >= 0) {
        playGameTone({ frequency: 300, duration: 0.05, type: 'sine' }, muted)
        return p.filter((_, k) => k !== idx)
      }
      if (p.length >= 2) return p
      playGameTone({ frequency: 440 + e * 3 }, muted)
      return [...p, e]
    })
  }

  // 翻倍：把选中的单个指数 ×2（对应“平方”）
  const doDouble = () => {
    if (done || picks.length !== 1) return
    const a = picks[0]
    const r = a + a
    playGameTone({ frequency: 620, duration: 0.1 }, muted)
    setSteps((s) => [...s, { a, b: a, r, kind: 'double' }])
    setPicks([])
    setRevealed(false)
  }

  // 相乘：把选中的两个指数相加（对应“两个已算幂相乘”）
  const doAdd = () => {
    if (done || picks.length !== 2) return
    const [a, b] = picks
    const r = a + b
    playGameTone({ frequency: 560, duration: 0.1 }, muted)
    setSteps((s) => [...s, { a, b, r, kind: 'add' }])
    setPicks([])
    setRevealed(false)
  }

  const undo = () => {
    if (steps.length === 0) return
    playGameTone({ frequency: 340, duration: 0.06, type: 'sine' }, muted)
    setSteps((s) => s.slice(0, -1))
    setPicks([])
    setRevealed(false)
  }
  const resetChain = () => {
    playGameTone({ frequency: 330, duration: 0.06, type: 'sine' }, muted)
    setSteps([])
    setPicks([])
    setRevealed(false)
    round.start()
  }

  const reveal = () => {
    setRevealed(true)
    const beat = done && used <= fast
    round.record(beat)
    if (beat) {
      playGameTone({ frequency: 523, duration: 0.12 }, muted)
      setTimeout(() => playGameTone({ frequency: 784, duration: 0.16 }, muted), 110)
    } else {
      playGameTone({ frequency: 300, duration: 0.1, type: 'sine' }, muted)
    }
  }

  const shuffle = () => {
    roundSeed.next()
    playGameTone({ frequency: 360, duration: 0.06 }, muted)
  }
  const pickDiff = (d: Difficulty) => {
    if (d === difficulty) return
    setDifficulty(d)
    playGameTone({ frequency: 420, duration: 0.06 }, muted)
  }

  let feedback = `从指数 1 出发，把已有指数「翻倍」或「相乘（相加）」，用最少步数拼出 x^${target}。`
  let fbClass = ''
  if (done) {
    if (used < fast) {
      feedback = `🎉 超越快速幂！你只用 ${used} 步得到 x^${target}，比快速幂基线（${fast} 步）还少。`
      fbClass = 'win'
    } else if (used === fast) {
      feedback = `🎉 追平快速幂！你用 ${used} 步得到 x^${target}（正好等于快速幂基线 ${fast} 步）。`
      fbClass = 'win'
    } else {
      feedback = `到达 x^${target}，用了 ${used} 步。快速幂只要 ${fast} 步——试试更少的路线（可撤销）。`
    }
  } else if (revealed) {
    feedback = `还没拼到 x^${target}。快速幂基线 ${fast} 步、暴力 ${brute} 步——继续合成。`
  }

  const youMore = done && used > fast

  return (
    <div className="game">
      <div className="game__head">
        <span className="game__title">
          <Zap size={18} /> 幂次加速器
        </span>
        <span className="game__sub">用最少乘法算出 x^n——你能追平快速幂吗？</span>
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
          <div className="gpw__target-card">
            <div className="gpw__target-lab">目标幂次</div>
            <div className="gpw__target-n">
              x<sup>{target}</sup>
            </div>
            <div className="gpw__target-hint">选两个指数点「相乘」，或选一个点「翻倍」</div>
          </div>

          <div className="game__shelf-label">已得指数（点击选中来合成）</div>
          <div className="gpw__chips">
            {reachedList.map((e) => {
              const on = picks.includes(e)
              const isTarget = e === target
              return (
                <button
                  key={e}
                  className={`gpw__chip${on ? ' on' : ''}${isTarget ? ' target' : ''}`}
                  onClick={() => pick(e)}
                  disabled={done}
                  aria-pressed={on}
                >
                  {isTarget && (
                    <span className="gpw__chip-star">
                      <Sparkles size={13} />
                    </span>
                  )}
                  <span className="gpw__chip-x">x</span>
                  <sup>{e}</sup>
                </button>
              )
            })}
          </div>

          {steps.length > 0 && (
            <>
              <div className="game__shelf-label gpw__log-label">合成过程</div>
              <ol className="gpw__log">
                {steps.map((s, i) => (
                  <li key={i} className="gpw__log-row">
                    <span className="gpw__log-idx">{i + 1}</span>
                    {s.kind === 'double' ? (
                      <span>
                        翻倍：x<sup>{s.a}</sup> 平方 → x<sup>{s.r}</sup>
                      </span>
                    ) : (
                      <span>
                        相乘：x<sup>{s.a}</sup> × x<sup>{s.b}</sup> → x<sup>{s.r}</sup>
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>

        <div className="game__panel">
          <div className="game__value">
            <b className={atOrBeatFast ? 'grad-text' : ''}>{used}</b>
            <span>你的步数</span>
          </div>

          <div className="gpw__ops">
            <button
              className="gbtn"
              onClick={doDouble}
              disabled={done || picks.length !== 1}
              title="选中 1 个指数：平方（指数 ×2）"
            >
              翻倍 (平方)
            </button>
            <button
              className="gbtn"
              onClick={doAdd}
              disabled={done || picks.length !== 2}
              title="选中 2 个指数：相乘（指数相加）"
            >
              相乘 (×)
            </button>
          </div>
          <div className="gpw__picks">
            {picks.length === 0
              ? '未选中指数'
              : picks.length === 1
                ? `已选 x^${picks[0]}——再选一个可相乘，或直接翻倍`
                : `已选 x^${picks[0]} 与 x^${picks[1]}——点相乘`}
          </div>

          <div className={`game__feedback ${fbClass}`}>{feedback}</div>

          {revealed && (
            <div className="game__compare">
              <div className="game__compare-row">
                <span className="game__cmp game__cmp--greedy">
                  暴力<span className="game__cmp-note">（逐个乘）</span>
                  <b>{brute}</b>
                </span>
                <span className="game__cmp game__cmp--you">
                  你 <b>{done ? used : '—'}</b>
                </span>
                <span className="game__cmp game__cmp--dp">
                  快速幂 <b>{fast}</b>
                </span>
              </div>
              <div className="game__compare-tip">
                快速幂（二进制）是易得的高效基线：约 ⌊log₂n⌋+popcount(n)−1 步。
                {youMore ? '你比它多几步，还能再压。' : ''}
                {beatFast ? '你比这条基线还少——漂亮！' : ''}
                {tieFast ? '你已追平这条基线——漂亮！' : ''}
                {' '}真正的最少乘法（最短加法链）是难题，用快速幂当可达上界即可。
              </div>
            </div>
          )}

          <div className="gpw__manage">
            <button className="gbtn" onClick={undo} disabled={steps.length === 0}>
              <Undo2 size={16} /> 撤销
            </button>
            <button className="gbtn" onClick={resetChain} disabled={steps.length === 0}>
              <RotateCcw size={16} /> 重来
            </button>
          </div>

          <div className="game__actions">
            <button className="gbtn" onClick={shuffle}>
              <Shuffle size={16} /> 换一批
            </button>
            <button className="gbtn gbtn--primary" onClick={reveal}>
              <Trophy size={16} /> 看最优
            </button>
          </div>

          <div className="game__stats">
            <span>
              已玩 {round.stats.played} 局 · 达到 / 超越快速幂 {round.stats.matched} 次 · 种子 {roundSeed.seed}
            </span>
            <button type="button" className="gbtn" onClick={() => roundSeed.replay(roundSeed.seed)}>
              重放此种子
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
