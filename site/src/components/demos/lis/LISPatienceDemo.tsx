import { useMemo, useState } from 'react'
import { Shuffle } from 'lucide-react'
import { useStepPlayer } from '../../dp-engine/playback/useStepPlayer'
import { InstrumentRail, VizStateKey } from '../shared'
import './lis-patience.css'

// 與主演示同源的預設，方便兩處對照（經典亂序最終 LIS=5）。
const PRESETS: { label: string; a: number[] }[] = [
  { label: '经典乱序', a: [2, 1, 5, 3, 6, 4, 8, 9, 7] },
  { label: '已升序', a: [1, 2, 3, 4, 5, 6] },
  { label: '严格递减', a: [7, 5, 4, 3, 1] },
]

interface Step {
  i: number // 正在處理的元素下標
  x: number // 元素值
  pos: number // 二分命中位（lower_bound：第一個 ≥ x 的位置）
  append: boolean // true=追加(pos==len)，false=替換 tails[pos]
  before: number[] // 處理前的 tails
  after: number[] // 處理後的 tails
}

/** 用 lower_bound 維護 tails，逐元素記錄一步（供動畫步進）。 */
function buildSteps(a: number[]): Step[] {
  const tails: number[] = []
  const steps: Step[] = []
  for (let i = 0; i < a.length; i++) {
    const x = a[i]
    // lower_bound：第一個 >= x 的位置（嚴格上升 → 相等也要替換，保證「最小結尾」）。
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (tails[mid] >= x) hi = mid
      else lo = mid + 1
    }
    const pos = lo
    const before = tails.slice()
    const append = pos === tails.length
    if (append) tails.push(x)
    else tails[pos] = x
    steps.push({ i, x, pos, append, before, after: tails.slice() })
  }
  return steps
}

/**
 * O(n log n) LIS · 耐心排序動畫（自建視覺化，非 DPViz）。
 * 維護 tails[k]=「長度為 k+1 的上升子序列裡最小的結尾」。逐元素二分：
 * 比末尾大 → 追加（LIS 長度 +1）；否則替換第一個 ≥ 它的位置（把該長度的結尾壓得更小）。
 * 最終 tails 的長度就是 LIS。tails 本身不一定是某條真實子序列，但長度恆正確。
 */
export default function LISPatienceDemo() {
  const [a, setA] = useState<number[]>(PRESETS[0].a)
  const steps = useMemo(() => buildSteps(a), [a])

  // player 0 是顯式初始影格；演算法第 k 步位於 player k+1。
  const player = useStepPlayer(steps.length + 1)
  const idx = player.index - 1
  const started = idx >= 0
  const cur = started ? steps[idx] : null
  const tails = cur ? cur.after : []
  const lisLen = tails.length

  const setPreset = (arr: number[]) => {
    player.reset()
    setA(arr)
  }

  return (
    <div>
      <div className="lp__toolbar">
        <div className="lp__modes">
          {PRESETS.map((p) => (
            <button type="button"
              key={p.label}
              className={`lp__mode${a.join(',') === p.a.join(',') ? ' on' : ''}`}
              onClick={() => setPreset(p.a)}
            >
              {p.label}
            </button>
          ))}
          <button type="button"
            className="lp__mode"
            onClick={() => {
              player.reset()
              setA(shuffle(a))
            }}
            title="打乱当前数组"
          >
            <Shuffle size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
            打乱
          </button>
        </div>
      </div>

      {/* 輸入序列一行：已處理弱化、當前高亮 */}
      <div className="lp__seq">
        <div className="lp__seq-label">
          <span>逐个扫描输入序列 a[]，每个数用二分决定它在 tails 里的落点</span>
          <span className="mono">已扫 {idx + 1}/{steps.length}</span>
        </div>
        <div className="lp__seq-row">
          {a.map((v, i) => (
            <span
              key={i}
              className={`lp__num${cur && i === cur.i ? ' cur' : started && i <= idx ? ' done' : ''}`}
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* tails 舞臺 */}
      <div className="lp__stage">
        <div className="lp__stage-head">
          <span>
            <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>tails</b> ——
            tails[k] 记「长度 k+1 的上升子序列的最小结尾」
          </span>
          <span className="mono">长度 = LIS = {lisLen}</span>
        </div>
        <div className="lp__tails">
          {tails.length === 0 && (
            <div className="lp__tail ghost">
              <span className="lp__tail-idx">0</span>
              <div className="lp__tail-box">·</div>
            </div>
          )}
          {tails.map((t, k) => {
            const isHit = cur ? k === cur.pos : false
            return (
              <div key={k} className={`lp__tail${isHit ? ' just' : ''}`}>
                <span className="lp__tail-idx">{k}</span>
                <div className="lp__tail-box">{t}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 讀數：這一步做了什麼 */}
      <div className="lp__readout">
        {!started ? (
          <>
            点<b className="cur"> 播放 </b>或<b> 下一步 </b>开始。tails 从空开始，逐个把 a[] 里的数二分安放进去；
            <b>它的长度</b>随追加而增长，最终就是 <b className="ok">LIS 长度</b>。
          </>
        ) : cur!.append ? (
          <>
            第 <b className="cur">{cur!.i + 1}</b> 个数 <b>{cur!.x}</b>：比 tails 末尾还大，
            <b> 追加</b>到位置 <b>{cur!.pos}</b> → LIS 长度增长到 <b className="ok">{lisLen}</b>。
          </>
        ) : (
          <>
            第 <b className="cur">{cur!.i + 1}</b> 个数 <b>{cur!.x}</b>：二分找到第一个 ≥ 它的位置 <b>{cur!.pos}</b>
            （原值 <b>{cur!.before[cur!.pos]}</b>），<b>替换</b>成 <b>{cur!.x}</b>——把「长度 {cur!.pos + 1} 的结尾」压得更小，
            长度不变（仍 <b className="ok">{lisLen}</b>），却给后面留了更多接续空间。
          </>
        )}
      </div>

      <InstrumentRail
        player={player}
        label="耐心排序逐帧播放"
        className="lp__ctl"
        secondary={<VizStateKey />}
      />
    </div>
  )
}

// 簡單洗牌（Fisher–Yates），保證與原陣列不同（長度≥2 時）。
function shuffle(src: number[]): number[] {
  const a = src.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  if (a.length >= 2 && a.join(',') === src.join(',')) [a[0], a[1]] = [a[1], a[0]]
  return a
}
