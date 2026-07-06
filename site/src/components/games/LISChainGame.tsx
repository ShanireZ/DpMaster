import { useMemo, useState } from 'react'
import { TrendingUp, Sparkles, Shuffle, Trophy, Volume2, VolumeX, RotateCcw } from 'lucide-react'
import './game.css'
import './game-lis.css'

type Difficulty = 'easy' | 'medium' | 'hard'

interface DiffSpec {
  label: string
  count: number
  vMin: number
  vRange: number // 值随机上限（不含）：实际值 = vMin + floor(random * vRange)
}

const DIFFS: Record<Difficulty, DiffSpec> = {
  easy: { label: '简单', count: 8, vMin: 1, vRange: 20 },
  medium: { label: '中等', count: 11, vMin: 1, vRange: 30 },
  hard: { label: '困难', count: 14, vMin: 1, vRange: 40 },
}

const DIFF_ORDER: Difficulty[] = ['easy', 'medium', 'hard']

// 自写 O(n²) LIS：求最长严格上升子序列的长度，并回溯出一种最优取法（下标集合）。
function solveLIS(a: number[]): { len: number; pick: boolean[] } {
  const n = a.length
  if (n === 0) return { len: 0, pick: [] }
  const dp = Array<number>(n).fill(1) // dp[i]：以 a[i] 结尾的最长上升子序列长度
  const prev = Array<number>(n).fill(-1) // 回溯指针：a[i] 接在谁后面
  for (let i = 0; i < n; i++)
    for (let j = 0; j < i; j++)
      if (a[j] < a[i] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1
        prev[i] = j
      }
  // 找全行最大值所在下标——LIS 可在任意位置结尾
  let end = 0
  for (let i = 1; i < n; i++) if (dp[i] > dp[end]) end = i
  const pick = Array<boolean>(n).fill(false)
  for (let k = end; k !== -1; k = prev[k]) pick[k] = true
  return { len: dp[end], pick }
}

// 玩家手动挑出的严格上升子序列长度（按原下标序、后选值 > 前一已选值）。
// 因为下方交互只允许合法追加，selOrder 天然满足条件，这里直接返回其长度。
function chainLen(selOrder: number[]): number {
  return selOrder.length
}

function makeSeq(difficulty: Difficulty): number[] {
  const d = DIFFS[difficulty]
  const seq = Array.from({ length: d.count }, () => d.vMin + Math.floor(Math.random() * d.vRange))
  // 保证至少存在一条长度≥3 的上升子序列，避免生成近乎单调下降的枯燥串（重开即可）。
  if (solveLIS(seq).len < 3) return makeSeq(difficulty)
  return seq
}

let ac: AudioContext | null = null
function blip(freq: number, dur = 0.09, type: OscillatorType = 'triangle') {
  try {
    ac =
      ac ||
      new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.setValueAtTime(0.0001, ac.currentTime)
    g.gain.exponentialRampToValueAtTime(0.1, ac.currentTime + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur)
    o.connect(g)
    g.connect(ac.destination)
    o.start()
    o.stop(ac.currentTime + dur)
  } catch {
    /* ignore */
  }
}

export default function LISChainGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [seq, setSeq] = useState<number[]>(() => makeSeq('medium'))
  // 玩家已选下标，按点击（=原序）先后记录，构成一条链
  const [selOrder, setSelOrder] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const [muted, setMuted] = useState(false)
  const [played, setPlayed] = useState(0)
  const [matched, setMatched] = useState(0)
  // 本局是否已计入战绩（同一局重复点「看 DP 最优」不重复计数）
  const [countedThisRound, setCountedThisRound] = useState(false)

  const dp = useMemo(() => solveLIS(seq), [seq])
  const you = chainLen(selOrder)
  const win = revealed && you === dp.len && you > 0

  // 每个下标的选中序号（1-based）；未选为 0。用于卡片上标「链序」。
  const rank = useMemo(() => {
    const r = Array<number>(seq.length).fill(0)
    selOrder.forEach((idx, k) => (r[idx] = k + 1))
    return r
  }, [selOrder, seq.length])

  // 当前链的末值——决定下一个可合法追加的门槛（严格大于它）。
  const lastVal = selOrder.length ? seq[selOrder[selOrder.length - 1]] : -Infinity
  const lastIdx = selOrder.length ? selOrder[selOrder.length - 1] : -1

  // 某下标此刻能否被点选（未选状态下：下标必须在链尾之后、值必须严格更大）。
  const canPick = (i: number) => !revealed && i > lastIdx && seq[i] > lastVal

  const clickCard = (i: number) => {
    if (revealed) return
    const pos = selOrder.indexOf(i)
    if (pos !== -1) {
      // 已选：允许「回退到此」——砍掉这一格及其后的所有选择（保持链的前缀合法）。
      if (!muted) blip(320, 0.07, 'sine')
      setSelOrder((s) => s.slice(0, pos))
      return
    }
    if (!canPick(i)) {
      // 非法点击：给一个低沉的轻提示，不改动链。
      if (!muted) blip(180, 0.08, 'sine')
      return
    }
    if (!muted) blip(460 + selOrder.length * 60)
    setSelOrder((s) => [...s, i])
  }

  const resetChain = () => {
    setSelOrder([])
    if (!muted) blip(300, 0.06, 'sine')
  }

  const reveal = () => {
    setRevealed(true)
    const w = you === dp.len && you > 0
    if (!countedThisRound) {
      setCountedThisRound(true)
      setPlayed((n) => n + 1)
      if (w) setMatched((n) => n + 1)
    }
    if (!muted) {
      if (w) {
        blip(523, 0.12)
        setTimeout(() => blip(784, 0.16), 110)
      } else blip(300, 0.1, 'sine')
    }
  }

  const shuffle = () => {
    setSeq(makeSeq(difficulty))
    setSelOrder([])
    setRevealed(false)
    setCountedThisRound(false)
    if (!muted) blip(360, 0.06)
  }

  const pickDiff = (d: Difficulty) => {
    if (d === difficulty) return
    setDifficulty(d)
    setSeq(makeSeq(d))
    setSelOrder([])
    setRevealed(false)
    setCountedThisRound(false)
    if (!muted) blip(420, 0.06)
  }

  let feedback =
    '从左到右依次点数字，接出一条尽量长的严格上升子序列（后一个要比前一个大），再点「看 DP 最优」对照。'
  let fbClass = ''
  if (win) {
    feedback = `🎉 完美！你接出的长度 ${you}，和 DP 求得的最长上升子序列一样长。`
    fbClass = 'win'
  } else if (revealed) {
    feedback =
      you < dp.len
        ? `DP 最长是 ${dp.len}，你接出了 ${you}，还差 ${dp.len - you}。带 ★ 的是一种最优接法。`
        : `DP 最长是 ${dp.len}。带 ★ 的是一种最优接法。`
  } else if (selOrder.length) {
    feedback = `已接 ${you} 个：${selOrder.map((i) => seq[i]).join(' → ')}。还能往后接更大的数吗？`
  }

  return (
    <div className="game">
      <div className="game__head">
        <span className="game__title">
          <TrendingUp size={18} /> LIS 接龙
        </span>
        <span className="game__sub">手挑一条最长上升子序列——能追平 DP 吗？</span>
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
      <div className="game__body glis__body">
        <div>
          <div className="game__shelf-label">数列（按原序点击接龙 · 点已选的可回退到该处）</div>
          <div className="glis__row">
            {seq.map((v, i) => {
              const picked = rank[i] > 0
              const star = revealed && dp.pick[i]
              const selectable = canPick(i)
              const cls = [
                'glis__cell',
                picked ? 'picked' : '',
                star ? 'opt' : '',
                !picked && !selectable && !revealed ? 'blocked' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button key={i} className={cls} onClick={() => clickCard(i)} aria-pressed={picked}>
                  {star && (
                    <span className="glis__star">
                      <Sparkles size={14} />
                    </span>
                  )}
                  {picked && <span className="glis__rank">{rank[i]}</span>}
                  <span className="glis__val">{v}</span>
                  <span className="glis__pos">#{i + 1}</span>
                </button>
              )
            })}
          </div>
          {selOrder.length > 0 && (
            <div className="glis__chain" aria-label="你的链">
              <span className="glis__chain-label">你的链</span>
              {selOrder.map((idx, k) => (
                <span key={idx} className="glis__chip">
                  {k > 0 && <span className="glis__arrow">→</span>}
                  {seq[idx]}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="game__panel">
          <div className="game__value">
            <b className={win ? 'grad-text' : ''}>{you}</b>
            <span>当前链长度</span>
          </div>
          <div className={`game__feedback ${fbClass}`}>{feedback}</div>
          {revealed && (
            <div className="game__compare">
              <div className="game__compare-row">
                <span className="game__cmp game__cmp--you">
                  你 <b>{you}</b>
                </span>
                <span className="game__cmp game__cmp--dp">
                  DP 最长 <b>{dp.len}</b>
                </span>
              </div>
              {you < dp.len && (
                <div className="game__compare-tip">
                  贪心「能接就接」常常不是最长——此刻接哪个，取决于后面还剩什么，这正是要用 DP 的原因。
                </div>
              )}
            </div>
          )}
          <div className="game__actions">
            <button className="gbtn" onClick={resetChain} disabled={selOrder.length === 0 || revealed}>
              <RotateCcw size={16} /> 重接
            </button>
            <button className="gbtn gbtn--primary" onClick={reveal}>
              <Trophy size={16} /> 看 DP 最优
            </button>
          </div>
          <div className="game__actions">
            <button className="gbtn" onClick={shuffle}>
              <Shuffle size={16} /> 换一批
            </button>
          </div>
          <div className="game__stats">
            已玩 {played} 局 · 追平 DP {matched} 次
          </div>
        </div>
      </div>
    </div>
  )
}
