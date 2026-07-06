import { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import { edit2D } from './editSolver'
import '../knapsack/knapsack-demo.css'
import './edit-traceback.css'

// 只保留字母，转小写，并截到 6 个字符以内——网格 (m+1)×(n+1) 才不至于过大。
function sanitize(s: string): string {
  return s
    .replace(/[^A-Za-z]/g, '')
    .toLowerCase()
    .slice(0, 6)
}

const PRESETS: Array<[string, string]> = [
  ['horse', 'ros'], // 距离 3
  ['kitten', 'sitten'], // 距离 1（sitting↔kitten 的核心一步：k→s）
  ['abc', 'abc'], // 距离 0，全走对角线
  ['flaw', 'lawn'], // 距离 2
]

/** 编辑距离主演示：两串可编辑（≤6），二维填表 + 三向转移逐格取 min。 */
export default function EditDistanceDemo() {
  const [a, setA] = useState('horse')
  const [b, setB] = useState('ros')

  const model = useMemo(() => edit2D(a || '', b || ''), [a, b])
  const modelKey = `ed-${a}-${b}`

  return (
    <div>
      <div className="kd__toolbar">
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
            {PRESETS.map(([pa, pb]) => (
              <button
                key={`${pa}-${pb}`}
                className={`kd__mode${a === pa && b === pb ? ' on' : ''}`}
                onClick={() => {
                  setA(pa)
                  setB(pb)
                }}
              >
                {pa || '∅'} → {pb || '∅'}
              </button>
            ))}
            <button
              className="kd__mode"
              onClick={() => {
                setA('horse')
                setB('ros')
              }}
              aria-label="复位"
            >
              <RefreshCw size={13} style={{ verticalAlign: '-2px' }} /> 复位
            </button>
          </div>
        </div>
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
