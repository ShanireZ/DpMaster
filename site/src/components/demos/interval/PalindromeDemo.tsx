import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import DPViz from '../../dp-engine/DPViz'
import palindromeHeroArt from '../../../assets/demo-art/interval-palindrome-instrument-v1.avif'
import { DemoSculptureHero } from '../shared'
import { palindromeLps, normalize } from './palindromeSolver'
import { solvePalindromeLps } from '../../../algorithms/palindrome/index.ts'
import '../shared/demo-workbench.css'
import './palindrome-demo.css'

const PRESETS = ['bcabb', 'google', 'character', 'aebcbda']

/** 最长回文子序列区间 DP 三角表演示：dp[i][j] 按区间长度递推，相等收缩（左下）/不等取大（下·左）。 */
export default function PalindromeDemo() {
  const [text, setText] = useState('bcabb')

  const chars = useMemo(() => normalize(text), [text])
  const model = useMemo(() => palindromeLps(chars), [chars])
  const modelKey = `plps-${chars.join('')}`
  const lps = useMemo(() => solvePalindromeLps(chars).length, [chars])

  return (
    <div>
      <DemoSculptureHero family="c" lesson="palindrome" src={palindromeHeroArt} />
      <div className="pal__toolbar">
        <div style={{ flex: 1 }}>
          <div className="demo-control__group-label">字符串（可编辑 · 取前 8 个字母/数字 · 大小写不敏感）</div>
          <div className="pal__inrow">
            <input
              className="pal__input"
              value={text}
              maxLength={16}
              spellCheck={false}
              onChange={(e) => setText(e.target.value)}
              aria-label="输入字符串"
            />
            <button className="pal__reset" onClick={() => setText('bcabb')} aria-label="复位">
              <RotateCcw size={14} /> 复位
            </button>
          </div>
          <div className="pal__presets">
            {PRESETS.map((p) => (
              <button
                key={p}
                className={`pal__chip ${chars.join('') === p ? 'on' : ''}`}
                onClick={() => setText(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="demo-contrast__readout">
        当前串 <b className="you">"{chars.join('')}"</b>（长度 {chars.length}）· 最长回文子序列长度{' '}
        <b className="ok">dp[0][{chars.length - 1}] = {lps}</b> · 表内每格 dp[i][j] = 子串 s[i..j] 的最长回文子序列长。
      </div>

      <DPViz key={modelKey} model={model} />
    </div>
  )
}
