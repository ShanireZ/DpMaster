import { useMemo, useState } from 'react'
import { useStepPlayer } from '../../dp-engine/playback/useStepPlayer'
import { InstrumentRail, VizStateKey } from '../shared'
import './lcs-lis.css'

// 兩個都是 1..n 的排列。第一組取恆等排列 A，映射最直觀（值即位置）；第二組 A 打亂，見一般映射。
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

// 求一條 LIS：回傳被選中的下標集合（貪心 + 記錄前驅重構，取字典序靠前的一條即可）。
function lisIndices(seq: number[]): Set<number> {
  const n = seq.length
  if (n === 0) return new Set()
  const tails: number[] = [] // tails[k] = 長度 k+1 的上升子序列的最小結尾（存下標）
  const prev = new Array<number>(n).fill(-1)
  for (let i = 0; i < n; i++) {
    // lower_bound：第一個結尾值 >= seq[i] 的位置
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
 * 排列 LCS → LIS 轉化（自建視覺化，非 DPViz）。
 * 當 A、B 是同一集合的兩個排列時：把 B 的每個值換成「它在 A 裡的位置」，得一串位置序列；
 * 這串序列的 LIS 長度 = LCS(A,B) 長度——於是用 O(n log n) 的 LIS 二分即可解決 LCS。
 * 步進：先逐個把 B[i] 映射成位置，映完再點亮位置序列裡的一條 LIS。
 */
export default function LCSToLISDemo() {
  const [a, setA] = useState<number[]>(PRESETS[0].a)
  const [b, setB] = useState<number[]>(PRESETS[0].b)

  const map = useMemo(() => posMap(a), [a])
  const mapped = useMemo(() => b.map((v) => map.get(v)!), [b, map])
  const lisPick = useMemo(() => lisIndices(mapped), [mapped])
  const lisLen = lisPick.size

  // 演算法影格 0..b.length-1 是逐項映射；b.length 是映射完成、點亮 LIS。
  const total = b.length + 1 // 映射 n 步 + 收尾 1 步
  const player = useStepPlayer(total + 1)
  const idx = player.index - 1 // player 0 是顯式初始影格。
  const mappedCount = Math.min(idx + 1, b.length) // 已映射的個數
  const done = idx >= b.length // 是否進入「點亮 LIS」階段
  const curCol = idx >= 0 && idx < b.length ? idx : -1 // 正在映射的列

  const setPreset = (p: { a: number[]; b: number[] }) => {
    player.reset()
    setA(p.a)
    setB(p.b)
  }

  return (
    <div>
      <div className="ll__toolbar">
        <div className="ll__modes">
          {PRESETS.map((p) => (
            <button type="button"
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

      {/* 映射後的位置序列，逐列出現；完成後點亮 LIS */}
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

      {/* 讀數 */}
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

      <InstrumentRail
        player={player}
        label="排列 LCS 转 LIS 逐帧播放"
        className="ll__ctl"
        secondary={<VizStateKey />}
      />
    </div>
  )
}
