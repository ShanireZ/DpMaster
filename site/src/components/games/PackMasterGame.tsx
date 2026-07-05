import { useMemo, useState } from 'react'
import { Package, Sparkles, Shuffle, Trophy, Volume2, VolumeX } from 'lucide-react'
import './game.css'

interface GItem {
  w: number
  v: number
}

function solveOpt(items: GItem[], cap: number): { value: number; pick: boolean[] } {
  const n = items.length
  const f = Array.from({ length: n + 1 }, () => Array<number>(cap + 1).fill(0))
  for (let i = 1; i <= n; i++)
    for (let j = 0; j <= cap; j++) {
      f[i][j] = f[i - 1][j]
      if (j >= items[i - 1].w) f[i][j] = Math.max(f[i][j], f[i - 1][j - items[i - 1].w] + items[i - 1].v)
    }
  const pick = Array<boolean>(n).fill(false)
  let j = cap
  for (let i = n; i >= 1; i--) {
    if (f[i][j] !== f[i - 1][j]) {
      pick[i - 1] = true
      j -= items[i - 1].w
    }
  }
  return { value: f[n][cap], pick }
}

function makeGame(): { items: GItem[]; cap: number } {
  const items = Array.from({ length: 5 }, () => ({
    w: 2 + Math.floor(Math.random() * 5),
    v: 3 + Math.floor(Math.random() * 10),
  }))
  const totalW = items.reduce((s, it) => s + it.w, 0)
  const cap = Math.max(6, Math.round(totalW * 0.5))
  return { items, cap }
}

let ac: AudioContext | null = null
function blip(freq: number, dur = 0.09, type: OscillatorType = 'triangle') {
  try {
    ac = ac || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
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

export default function PackMasterGame() {
  const [game, setGame] = useState(makeGame)
  const [sel, setSel] = useState<boolean[]>(() => game.items.map(() => false))
  const [revealed, setRevealed] = useState(false)
  const [muted, setMuted] = useState(false)

  const opt = useMemo(() => solveOpt(game.items, game.cap), [game])
  const curW = game.items.reduce((s, it, i) => s + (sel[i] ? it.w : 0), 0)
  const curV = game.items.reduce((s, it, i) => s + (sel[i] ? it.v : 0), 0)
  const over = curW > game.cap
  const win = !over && revealed && curV === opt.value

  const toggle = (i: number) => {
    if (!muted) blip(440 + i * 55)
    setSel((s) => s.map((x, k) => (k === i ? !x : x)))
    setRevealed(false)
  }
  const reveal = () => {
    setRevealed(true)
    const w = !over && curV === opt.value
    if (!muted) {
      if (w) {
        blip(523, 0.12)
        setTimeout(() => blip(784, 0.16), 110)
      } else blip(300, 0.1, 'sine')
    }
  }
  const shuffle = () => {
    const g = makeGame()
    setGame(g)
    setSel(g.items.map(() => false))
    setRevealed(false)
    if (!muted) blip(360, 0.06)
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
        <button
          className="icon-btn"
          style={{ marginLeft: 'auto', width: 34, height: 34 }}
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
          <div className="game__actions">
            <button className="gbtn" onClick={shuffle}>
              <Shuffle size={16} /> 换一批
            </button>
            <button className="gbtn gbtn--primary" onClick={reveal}>
              <Trophy size={16} /> 看 DP 最优
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
