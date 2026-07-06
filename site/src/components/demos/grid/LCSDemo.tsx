import { useMemo, useState } from 'react'
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { lcs2D } from './lcsSolver'
import '../knapsack/knapsack-demo.css'

// 字符池：够演示又不至于让表太大。改字符只在池内循环。
const POOL = ['A', 'B', 'C', 'D']
const MAXLEN = 7

const PRESETS: { label: string; a: string; b: string }[] = [
  { label: '经典 ABCBDAB / BDCAB', a: 'ABCBDAB', b: 'BDCAB' },
  { label: '无公共', a: 'AAA', b: 'BBB' },
  { label: '完全一致', a: 'ABCD', b: 'ABCD' },
]

/** 一个字符位：上下箭头在字符池里循环，可删除。 */
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
    <div className="kd__item" style={{ paddingTop: 14 }}>
      <span className="kd__item-i">{idx + 1}</span>
      {removable && (
        <button className="kd__remove" onClick={onRemove} aria-label="删除字符">
          <X size={12} />
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => onCycle(-1)}
          aria-label="上一个字符"
          style={{
            width: 24,
            height: 28,
            borderRadius: 6,
            color: 'var(--text-1)',
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <ChevronLeft size={14} />
        </button>
        <span
          className="mono"
          style={{ fontSize: 20, fontWeight: 700, minWidth: 22, textAlign: 'center', color: 'var(--accent-1)' }}
        >
          {ch}
        </span>
        <button
          onClick={() => onCycle(1)}
          aria-label="下一个字符"
          style={{
            width: 24,
            height: 28,
            borderRadius: 6,
            color: 'var(--text-1)',
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            display: 'grid',
            placeItems: 'center',
          }}
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
    <div>
      <div className="kd__group-label">{title}（点箭头换字符 · 可增删 · 长度 ≤ {MAXLEN}）</div>
      <div className="kd__items">
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
          <button className="kd__add" onClick={addOne}>
            <Plus size={15} /> 加字符
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * LCS 主演示：两串可编辑（短，长度 ≤ 7），二维 dp 填表 + 回溯路径。
 * 匹配则来自左上 +1、否则来自上 / 左取 max，逐格高亮来源；填完从 dp[m][n] 回溯重构一条 LCS。
 */
export default function LCSDemo() {
  const [a, setA] = useState('ABCBDAB')
  const [b, setB] = useState('BDCAB')

  const { model, len, lcs } = useMemo(() => lcs2D(a, b), [a, b])
  const modelKey = `lcs-${a}-${b}`

  return (
    <div>
      <div className="kd__modes">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className={`kd__mode${a === p.a && b === p.b ? ' on' : ''}`}
            onClick={() => {
              setA(p.a)
              setB(p.b)
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="kd__toolbar" style={{ gap: 'var(--sp-5)' }}>
        <StringRow title="串 A（作行）" s={a} setS={setA} />
        <StringRow title="串 B（作列）" s={b} setS={setB} />
      </div>

      <div className="fbug__readout">
        当前两串的最长公共子序列：<b className="ok">长度 {len}</b>
        <span className="you">{lcs ? `（一条 LCS = ${lcs}）` : '（没有公共字符）'}</span>
        <span style={{ color: 'var(--text-3)' }}>——绿色斜格是回溯时摘下字符的地方。</span>
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
