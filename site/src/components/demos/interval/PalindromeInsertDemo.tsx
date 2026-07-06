import { useMemo, useState, useEffect, useRef } from 'react'
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { palindromeInsert } from './palindromeSolver'
import '../knapsack/knapsack-demo.css'
import './palindrome-demo.css'

const PRESETS = ['google', 'abcda', 'raceca', 'aebcbda']

// 某一步之后，原串每个下标处于什么状态（用于给字符上色）。
type Role = 'idle' | 'matched' | 'active' | 'inserted-src'

/**
 * 最少插入构回文（自建可视化，非 DPViz）。
 * 双指针 i、j 从两端向内收缩：s[i]==s[j] 直接内缩（0 插入）；否则在较省一侧插入对端字符（+1）。
 * 插入总数 = len − 最长回文子序列——与主演示同源。逐步把非回文串补成回文。
 */
export default function PalindromeInsertDemo() {
  const [text, setText] = useState('google')

  const res = useMemo(() => palindromeInsert(text), [text])
  const s = res.chars
  const n = s.length

  // 步进：-1 = 初始；0..steps.length-1 逐步收缩/插入；steps.length = 完成（整串已回文）。
  const total = res.steps.length + 1
  const [idx, setIdx] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    setIdx(-1)
    setPlaying(false)
  }, [text])

  useEffect(() => {
    if (!playing) return
    if (idx >= total - 1) {
      setPlaying(false)
      return
    }
    timer.current = window.setTimeout(() => setIdx((k) => k + 1), 900)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [playing, idx, total])

  const done = idx >= res.steps.length
  const curStep = idx >= 0 && idx < res.steps.length ? res.steps[idx] : null

  // 已处理到第几对：done → 全部；否则处理了 0..idx。计算每个原串下标的角色。
  const roles: Role[] = new Array(n).fill('idle')
  const processedUpto = done ? res.steps.length : Math.max(0, idx + 1)
  for (let t = 0; t < processedUpto; t++) {
    const st = res.steps[t]
    if (st.matched) {
      roles[st.i] = 'matched'
      roles[st.j] = 'matched'
    } else {
      // 插入步：被「配对补齐」的那一端（对端字符来源）标记
      roles[st.i] = st.insertSide === 'right' ? 'inserted-src' : roles[st.i]
      roles[st.j] = st.insertSide === 'left' ? 'inserted-src' : roles[st.j]
    }
  }
  if (curStep) {
    roles[curStep.i] = 'active'
    roles[curStep.j] = 'active'
  }
  // 中心残留字符（奇数收尾）
  const centerIdx = done && n > 0 ? (() => {
    let i = 0
    let j = n - 1
    for (const st of res.steps) {
      if (st.matched) { i++; j-- }
      else if (st.insertSide === 'right') i++
      else j--
    }
    return i === j ? i : -1
  })() : -1

  // 已插入的字符个数（到当前步）
  const insertedSoFar = (() => {
    let c = 0
    for (let t = 0; t < processedUpto; t++) if (!res.steps[t].matched) c++
    return c
  })()

  const roleClass = (r: Role, i: number) =>
    `pal__ch ${r === 'active' ? 'is-active' : ''} ${r === 'matched' ? 'is-matched' : ''} ${
      r === 'inserted-src' ? 'is-insrc' : ''
    } ${i === centerIdx ? 'is-center' : ''}`

  return (
    <div>
      <div className="pal__toolbar">
        <div style={{ flex: 1 }}>
          <div className="kd__group-label">字符串（可编辑 · 取前 8 个字母/数字）</div>
          <div className="pal__inrow">
            <input
              className="pal__input"
              value={text}
              maxLength={16}
              spellCheck={false}
              onChange={(e) => setText(e.target.value)}
              aria-label="输入字符串"
            />
            <button className="pal__reset" onClick={() => setText('google')} aria-label="复位">
              <RotateCcw size={14} /> 复位
            </button>
          </div>
          <div className="pal__presets">
            {PRESETS.map((p) => (
              <button
                key={p}
                className={`pal__chip ${s.join('') === p ? 'on' : ''}`}
                onClick={() => setText(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fbug__readout">
        原串 <b className="you">"{s.join('')}"</b>（长度 {n}）· 最长回文子序列 <b>{res.lps}</b> · 最少插入{' '}
        <b className="ok">{res.insertCount}</b> 次 = 长度 {n} − 最长回文子序列 {res.lps} · 补齐后回文{' '}
        <b className="you">"{res.palindrome}"</b>。
      </div>

      {/* 原串：双指针从两端收缩，相等变绿、不等处插入对端字符 */}
      <div className="pal__stage">
        <div className="pal__stage-head">
          <span>
            双指针 <b className="pal__ptr-i">i →</b> 与 <b className="pal__ptr-j">← j</b> 从两端向内收缩
          </span>
          <span className="mono">已插入 {insertedSoFar}/{res.insertCount}</span>
        </div>
        <div className="pal__strip">
          {s.map((c, i) => (
            <div key={i} className={roleClass(roles[i], i)}>
              <span className="pal__ch-idx">{i}</span>
              <span className="pal__ch-c">{c}</span>
              {curStep && curStep.i === i && <span className="pal__ptr pal__ptr-i">i</span>}
              {curStep && curStep.j === i && curStep.i !== i && (
                <span className="pal__ptr pal__ptr-j">j</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 正在生长的回文外壳 */}
      <div className="pal__stage">
        <div className="pal__stage-head">
          <span>逐步锁定的<b>回文外壳</b>（从两端向内长；<span className="pal__mid">…</span> 为待定中段）</span>
          <span className="mono">{done ? '完成' : `第 ${Math.max(0, idx + 1)}/${res.steps.length} 步`}</span>
        </div>
        <div className="pal__shell">
          {done ? (
            <span className="pal__shell-final">{res.palindrome}</span>
          ) : (
            <span className="pal__shell-txt">{idx < 0 ? s.join('') : curStep?.built}</span>
          )}
        </div>
      </div>

      {/* 读数 */}
      <div className="pal__readout">
        {idx < 0 ? (
          <>
            点<b className="cur"> 播放 </b>或<b> 下一步 </b>开始：让 <b className="pal__ptr-i">i</b>、
            <b className="pal__ptr-j">j</b> 从两端逼近。相等则内缩（天然对称，0 插入）；不等则在<b>较省的一侧</b>补一个对端字符（+1），
            直到指针相遇——补齐的串即回文。
          </>
        ) : done ? (
          <>
            指针相遇，全串对称。共插入 <b className="ok">{res.insertCount}</b> 个字符，得回文{' '}
            <b className="you">"{res.palindrome}"</b>。次数正好 = 长度 − 最长回文子序列——与上方三角表<b>同一答案</b>。
          </>
        ) : curStep?.matched ? (
          <>
            s[{curStep.i}]=s[{curStep.j}]=<b>'{s[curStep.i]}'</b> <b className="ok">相等</b>：这对天然对称，
            <b>直接内缩</b>，不插入。
          </>
        ) : (
          <>
            s[{curStep!.i}]=<b>'{s[curStep!.i]}'</b>、s[{curStep!.j}]=<b>'{s[curStep!.j]}'</b> <b>不等</b>：
            在<b>{curStep!.insertSide === 'left' ? '左' : '右'}端</b>插入 <b className="cur">'{curStep!.insertChar}'</b> 与对端配对（
            <b>+1</b>），再内缩该侧。
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
