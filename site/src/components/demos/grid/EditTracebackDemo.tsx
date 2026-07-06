import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { editTrace } from './editTrace'
import type { Op, Step } from './editTrace'
import '../knapsack/knapsack-demo.css'
import './edit-traceback.css'

function sanitize(s: string): string {
  return s
    .replace(/[^A-Za-z]/g, '')
    .toLowerCase()
    .slice(0, 6)
}

const OP_LABEL: Record<Op, string> = { keep: '保留', del: '删', ins: '插', sub: '改' }

/**
 * 编辑距离 · 回溯操作序列（自建轻量可视化，非 DPViz）。
 * 从 dp[m][n] 回溯出把 A 对齐到 B 的一串操作；A 在上、操作徽标在中、B 在下逐列排开，
 * 步进条控制「已揭示到第几步」。★不从 opacity:0 起步：未揭示的步用低不透明度静态弱化，
 * 起点即可见（无头 / 后台标签页不会把内容永久卡隐藏）。
 */
export default function EditTracebackDemo() {
  const [a, setA] = useState('horse')
  const [b, setB] = useState('ros')

  const { dist, steps } = useMemo(() => editTrace(a || '', b || ''), [a, b])
  // 步进：0 = 还没走任何一步；steps.length = 全部揭示。
  const [shown, setShown] = useState(steps.length)

  // 换串后把步进拉满，直接展示最终对齐。
  useEffect(() => {
    setShown(steps.length)
  }, [steps.length])

  // 落地结果：把 keep/sub 的目标字符、ins 的插入字符拼起来（del 不产出字符），
  // 只统计已揭示到的步。等于「A 应用前 shown 步操作后的样子」。
  const resultChars: string[] = []
  steps.slice(0, shown).forEach((s: Step) => {
    if (s.op === 'keep' || s.op === 'sub') resultChars.push(s.b!)
    else if (s.op === 'ins') resultChars.push(s.b!)
    // del：不产出
  })

  const counts = useMemo(() => {
    let edits = 0
    steps.forEach((s) => {
      if (s.op !== 'keep') edits++
    })
    return edits
  }, [steps])

  return (
    <div>
      <div className="etb__toolbar">
        <div>
          <div className="kd__group-label">源串 A（改成 B · 仅字母 · ≤6）</div>
          <input
            className="ed__input"
            value={a}
            maxLength={6}
            spellCheck={false}
            onChange={(e) => setA(sanitize(e.target.value))}
            aria-label="源串 A"
          />
        </div>
        <div>
          <div className="kd__group-label">目标串 B</div>
          <input
            className="ed__input"
            value={b}
            maxLength={6}
            spellCheck={false}
            onChange={(e) => setB(sanitize(e.target.value))}
            aria-label="目标串 B"
          />
        </div>
        <div>
          <div className="kd__group-label">试几组</div>
          <div className="ed__presets">
            {([
              ['horse', 'ros'],
              ['flaw', 'lawn'],
              ['abcde', 'ace'],
            ] as Array<[string, string]>).map(([pa, pb]) => (
              <button
                key={`${pa}-${pb}`}
                className={`kd__mode${a === pa && b === pb ? ' on' : ''}`}
                onClick={() => {
                  setA(pa)
                  setB(pb)
                }}
              >
                {pa} → {pb}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 操作序列条：每步一列，A 上 / 徽标中 / B 下 */}
      <div className="etb__stage">
        <div className="etb__track">
          {steps.map((s, idx) => {
            const revealed = idx < shown
            const cls =
              'etb__col' + (idx === shown - 1 ? ' active' : '') + (revealed ? '' : ' future')
            return (
              <div className={cls} key={idx}>
                <div className={`etb__slot${s.a ? '' : ' empty'}`}>{s.a ?? '·'}</div>
                <div className={`etb__badge ${s.op}`}>
                  {OP_LABEL[s.op]}
                  {s.op === 'sub' ? '→' : ''}
                </div>
                <div className={`etb__slot${s.b ? '' : ' empty'}`}>{s.b ?? '·'}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="etb__legend">
        <span>
          <i style={{ background: 'var(--surface-1)', border: '1px solid var(--border-strong)' }} /> 保留（字符相同，+0）
        </span>
        <span>
          <i style={{ background: 'var(--viz-current)' }} /> 改（替换一字，+1）
        </span>
        <span>
          <i style={{ background: 'var(--viz-invalid)' }} /> 删（去掉 A 的字，+1）
        </span>
        <span>
          <i style={{ background: 'var(--viz-chosen)' }} /> 插（补上 B 的字，+1）
        </span>
      </div>

      <div className="etb__result">
        <span className="lab">A 应用前 {shown} 步后</span>
        <span className="str">{resultChars.join('') || '∅'}</span>
        <span style={{ color: 'var(--text-3)' }}>
          目标 B = <b style={{ color: 'var(--accent-1)' }}>{b || '∅'}</b>
        </span>
      </div>

      <div className="etb__ctl">
        <div className="etb__ctl-btns">
          <button onClick={() => setShown(0)} aria-label="回到起点" title="回到起点">
            <RotateCcw size={16} />
          </button>
          <button onClick={() => setShown((s) => Math.max(0, s - 1))} disabled={shown === 0} aria-label="上一步">
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setShown((s) => Math.min(steps.length, s + 1))}
            disabled={shown >= steps.length}
            aria-label="下一步"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <input
          type="range"
          min={0}
          max={steps.length}
          value={shown}
          onChange={(e) => setShown(Number(e.target.value))}
          aria-label="揭示到第几步"
        />
        <span className="etb__ctl-count">
          {shown}/{steps.length}
        </span>
      </div>

      <div className="etb__delta">
        把 "<b>{a || '∅'}</b>" 变成 "<b>{b || '∅'}</b>" 的一条最优编辑序列共 <b>{steps.length}</b> 步，其中{' '}
        <b>{counts}</b> 步是真正花代价的删 / 插 / 改——正好等于编辑距离 <b>{dist}</b>；其余为不花钱的「保留」。
        逐步走一遍，看 A 如何被一次次操作对齐到 B。
      </div>
    </div>
  )
}
