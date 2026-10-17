import { useMemo, useState } from 'react'
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { LCSHero } from './LCSHero.tsx'
import { lcs2D } from './lcsSolver'
import '../shared/demo-workbench.css'
import './lcs-demo.css'

// 字元池：夠演示又不至於讓表太大。改字元只在池內循環。
const POOL = ['A', 'B', 'C', 'D']
const MAXLEN = 7

const PRESETS: { label: string; a: string; b: string }[] = [
  { label: '经典 ABCBDAB / BDCAB', a: 'ABCBDAB', b: 'BDCAB' },
  { label: '无公共', a: 'AAA', b: 'BBB' },
  { label: '完全一致', a: 'ABCD', b: 'ABCD' },
]

/** 一個字元位：上下箭頭在字元池裡循環，可刪除。 */
function CharCell({
  ch,
  onCycle,
  onRemove,
  removable,
  idx,
}: {
  ch: string
  onCycle: (dir: number) => void
  onRemove: () => void
  removable: boolean
  idx: number
}) {
  return (
    <div className="demo-control__item lcs-char">
      <span className="demo-control__item-i">{idx + 1}</span>
      {removable && (
        <button type="button" className="demo-control__remove" onClick={onRemove} aria-label="删除字符">
          <X size={12} />
        </button>
      )}
      <div className="lcs-char__picker">
        <button type="button"
          className="lcs-char__cycle"
          onClick={() => onCycle(-1)}
          aria-label="上一个字符"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="mono lcs-char__value">
          {ch}
        </span>
        <button type="button"
          className="lcs-char__cycle"
          onClick={() => onCycle(1)}
          aria-label="下一个字符"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

function StringRow({
  title,
  s,
  setS,
}: {
  title: string
  s: string
  setS: (updater: (prev: string) => string) => void
}) {
  const cycle = (i: number, dir: number) =>
    setS((prev) => {
      const arr = prev.split('')
      const cur = POOL.indexOf(arr[i])
      const next = (cur + dir + POOL.length) % POOL.length
      arr[i] = POOL[next]
      return arr.join('')
    })
  const removeAt = (i: number) => setS((prev) => prev.slice(0, i) + prev.slice(i + 1))
  const addOne = () => setS((prev) => (prev.length < MAXLEN ? prev + POOL[0] : prev))

  return (
    <div className="lcs-string-editor">
      <div className="demo-control__group-label">{title}（点箭头换字符 · 可增删 · 长度 ≤ {MAXLEN}）</div>
      <div className="demo-control__items lcs-string-editor__items">
        {s.split('').map((ch, i) => (
          <CharCell
            key={i}
            ch={ch}
            idx={i}
            onCycle={(dir) => cycle(i, dir)}
            onRemove={() => removeAt(i)}
            removable={s.length > 1}
          />
        ))}
        {s.length < MAXLEN && (
          <button type="button" className="demo-control__add" onClick={addOne}>
            <Plus size={15} /> 加字符
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * LCS 主演示：兩串可編輯（短，長度 ≤ 7），二維 dp 填表 + 回溯路徑。
 * 匹配則來自左上 +1、否則來自上 / 左取 max，逐格高亮來源；填完從 dp[m][n] 回溯重構一條 LCS。
 */
export default function LCSDemo() {
  const [a, setA] = useState('ABCBDAB')
  const [b, setB] = useState('BDCAB')

  const { model, len, lcs } = useMemo(() => lcs2D(a, b), [a, b])
  const modelKey = `lcs-${a}-${b}`

  return (
    <div className="lcs-demo">
      <LCSHero />

      <div className="demo-control__modes">
        {PRESETS.map((p) => (
          <button type="button"
            key={p.label}
            className={`demo-control__mode${a === p.a && b === p.b ? ' on' : ''}`}
            onClick={() => {
              setA(p.a)
              setB(p.b)
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="demo-control__toolbar lcs-demo__strings">
        <StringRow title="串 A（作行）" s={a} setS={setA} />
        <StringRow title="串 B（作列）" s={b} setS={setB} />
      </div>

      <div className="demo-contrast__readout">
        当前两串的最长公共子序列：<b className="ok">长度 {len}</b>
        <span className="you">{lcs ? `（一条 LCS = ${lcs}）` : '（没有公共字符）'}</span>
        <span style={{ color: 'var(--text-3)' }}>——绿色斜格是回溯时摘下字符的地方。</span>
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
