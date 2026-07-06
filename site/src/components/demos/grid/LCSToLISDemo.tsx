import { useMemo, useState, useEffect, useRef } from 'react'
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import './lcs-lis.css'

// 两个都是 1..n 的排列。第一组取恒等排列 A，映射最直观（值即位置）；第二组 A 打乱，见一般映射。
const PRESETS: { label: string; a: number[]; b: number[] }[] = [
  { label: 'A 已排序 1 2 3 4 5', a: [1, 2, 3, 4, 5], b: [2, 4, 1, 5, 3] },
  { label: 'A 乱序 2 5 3 1 4', a: [2, 5, 3, 1, 4], b: [3, 5, 1, 4, 2] },
]

// 位置映射：值 → 它在 A 中的位置（1-based）。
function posMap(a: number[]): Map<number, number> {
  const m = new Map<number, number>()
  a.forEach((v, i) => m.set(v, i + 1))
  return m
}

// 求一条 LIS：返回被选中的下标集合（贪心 + 记录前驱重构，取字典序靠前的一条即可）。
function lisIndices(seq: number[]): Set<number> {
  const n = seq.length
  if (n === 0) return new Set()
  const tails: number[] = [] // tails[k] = 长度 k+1 的上升子序列的最小结尾（存下标）
  const prev = new Array<number>(n).fill(-1)
  for (let i = 0; i < n; i++) {
    // lower_bound：第一个结尾值 >= seq[i] 的位置
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (seq[tails[mid]] >= seq[i]) hi = mid
      else lo = mid + 1
    }
    prev[i] = lo > 0 ? tails[lo - 1] : -1
    if (lo === tails.length) tails.push(i)
    else tails[lo] = i
  }
  const pick = new Set<number>()
  let cur = tails[tails.length - 1]
  while (cur !== -1) {
    pick.add(cur)
    cur = prev[cur]
  }
  return pick
}

/**
 * 排列 LCS → LIS 转化（自建可视化，非 DPViz）。
 * 当 A、B 是同一集合的两个排列时：把 B 的每个值换成「它在 A 里的位置」，得一串位置序列；
 * 这串序列的 LIS 长度 = LCS(A,B) 长度——于是用 O(n log n) 的 LIS 二分即可解决 LCS。
 * 步进：先逐个把 B[i] 映射成位置，映完再点亮位置序列里的一条 LIS。
 */
export default function LCSToLISDemo() {
  const [a, setA] = useState<number[]>(PRESETS[0].a)
  const [b, setB] = useState<number[]>(PRESETS[0].b)

  const map = useMemo(() => posMap(a), [a])
  const mapped = useMemo(() => b.map((v) => map.get(v)!), [b, map])
  const lisPick = useMemo(() => lisIndices(mapped), [mapped])
  const lisLen = lisPick.size

  // 步进游标：0..b.length-1 是「正在映射第 idx 个」；== b.length 表示映射完成、点亮 LIS。
  const total = b.length + 1 // 映射 n 步 + 收尾 1 步
  const [idx, setIdx] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    setIdx(-1)
    setPlaying(false)
  }, [a, b])

  useEffect(() => {
    if (!playing) return
    if (idx >= total - 1) {
      setPlaying(false)
      return
    }
    timer.current = window.setTimeout(() => setIdx((k) => k + 1), 850)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [playing, idx, total])

  const mappedCount = Math.min(idx + 1, b.length) // 已映射的个数
  const done = idx >= b.length // 是否进入「点亮 LIS」阶段
  const curCol = idx >= 0 && idx < b.length ? idx : -1 // 正在映射的列

  const setPreset = (p: { a: number[]; b: number[] }) => {
    setA(p.a)
    setB(p.b)
  }

  return (
    <div>
      <div className="ll__toolbar">
        <div className="ll__modes">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              className={`ll__mode${a.join(',') === p.a.join(',') && b.join(',') === p.b.join(',') ? ' on' : ''}`}
              onClick={() => setPreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 映射表：值 → 在 A 中的位置 */}
      <div className="ll__block">
        <div className="ll__block-head">
          <span>
            映射规则：把 <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>A</b> 里每个值记下它的<b>位置</b>（第几个）
          </span>
          <span className="mono">A = [{a.join(', ')}]</span>
        </div>
        <div className="ll__maptable">
          {a.map((v, i) => {
            const highlight = curCol >= 0 && b[curCol] === v
            return (
              <div key={i} className={`ll__mapcol${highlight ? ' cur' : ''}`}>
                <div className="ll__map-k">{v}</div>
                <div className="ll__map-v">{i + 1}</div>
              </div>
            )
          })}
        </div>
        <div className="ll__map-cap">上排＝值，下排＝它在 A 中的位置（1-based）。第一组 A 已排序，值恰好等于位置。</div>
      </div>

      {/* B 原值 */}
      <div className="ll__block">
        <div className="ll__block-head">
          <span>
            串 <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>B</b> 的原始值
          </span>
          <span className="mono">已映射 {mappedCount}/{b.length}</span>
        </div>
        <div className="ll__row">
          {b.map((v, i) => (
            <div key={i} className={`ll__cell${curCol === i ? ' cur' : ''}`}>
              <span className="ll__cell-idx">{i + 1}</span>
              <div className="ll__box">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 映射后的位置序列，逐列出现；完成后点亮 LIS */}
      <div className="ll__block">
        <div className="ll__block-head">
          <span>换成位置后的<b>位置序列</b>——对它求最长上升子序列</span>
          <span className="mono">{done ? `LIS = LCS = ${lisLen}` : `…`}</span>
        </div>
        <div className="ll__row">
          {mapped.map((p, i) => {
            const shown = i < mappedCount
            const picked = done && lisPick.has(i)
            return (
              <div key={i} className={`ll__cell${curCol === i ? ' cur' : ''}${picked ? ' pick' : ''}`}>
                <span className="ll__cell-idx">{i + 1}</span>
                <div className="ll__box">{shown ? p : '·'}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 读数 */}
      <div className="ll__readout">
        {idx < 0 ? (
          <>
            点<b className="cur"> 播放 </b>或<b> 下一步 </b>开始：逐个把 B 的值换成它在 A 里的<b>位置</b>，
            得到一串<b>位置序列</b>；这串序列的 <b className="ok">LIS 长度</b>就等于 <b>LCS(A, B)</b> 长度。
          </>
        ) : !done ? (
          <>
            第 <b className="cur">{curCol + 1}</b> 个：B 的值 <b>{b[curCol]}</b> 在 A 里排第
            <b> {map.get(b[curCol])} </b>位 → 位置序列第 {curCol + 1} 格填 <b>{mapped[curCol]}</b>。
          </>
        ) : (
          <>
            位置序列 [<b>{mapped.join(', ')}</b>] 的一条最长上升子序列已点绿，长度 <b className="ok">{lisLen}</b>。
            这恰好等于两排列的 <b>LCS 长度</b>——所以排列 LCS 可以丢给 <b className="ll__link">O(n log n) 的 LIS 二分</b>去做。
          </>
        )}
      </div>

      {/* 步进控制 */}
      <div className="ll__ctl">
        <div className="ll__ctl-btns">
          <button onClick={() => { setPlaying(false); setIdx(-1) }} aria-label="重置" title="重置">
            <RotateCcw size={18} />
          </button>
          <button onClick={() => { setPlaying(false); setIdx((k) => Math.max(-1, k - 1)) }} disabled={idx < 0} aria-label="上一步">
            <ChevronLeft size={20} />
          </button>
          <button
            className="primary"
            onClick={() => {
              if (idx >= total - 1) setIdx(-1)
              setPlaying((p) => !p)
            }}
            aria-label={playing ? '暂停' : '播放'}
          >
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={() => { setPlaying(false); setIdx((k) => Math.min(total - 1, k + 1)) }} disabled={idx >= total - 1} aria-label="下一步">
            <ChevronRight size={20} />
          </button>
        </div>
        <span className="ll__ctl-count">
          {idx + 1}/{total}
        </span>
      </div>
    </div>
  )
}
