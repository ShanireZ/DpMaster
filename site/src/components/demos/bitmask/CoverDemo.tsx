import { useMemo, useState } from 'react'
import { RotateCcw, Minus, Plus } from 'lucide-react'
import { PlaybackControls } from '../../dp-engine/playback/PlaybackControls'
import { useStepPlayer } from '../../dp-engine/playback/useStepPlayer'
import { solveCover, toBits } from './coverSolver'
import type { Choice } from './coverSolver'
import '../knapsack/knapsack-demo.css'
import './bitmask-demo.css'

const N = 4 // 全集：元素 0..3

// 初始选择：三个选择恰好能拼出全集，也有更省的组合。
const INIT: Choice[] = [
  { cover: 0b0011, cost: 2 }, // 覆盖 0,1
  { cover: 0b1100, cost: 2 }, // 覆盖 2,3
  { cover: 0b1111, cost: 5 }, // 一口气覆盖全部（更贵）
]

// 把 mask 画成一小排点阵（元素 0..n-1 从左到右）
function MiniBits({ mask, n, tone }: { mask: number; n: number; tone: 'on' | 'off' | 'full' }) {
  const bits = toBits(mask, n)
  const cell = 18
  const gap = 3
  const w = n * cell + (n - 1) * gap
  return (
    <svg viewBox={`0 0 ${w} ${cell}`} width={w} height={cell} className="bm__minibits">
      {bits.map((b, i) => (
        <rect
          key={i}
          x={i * (cell + gap)}
          y={0}
          width={cell}
          height={cell}
          rx="4"
          fill={b ? (tone === 'full' ? 'color-mix(in srgb, var(--viz-chosen) 34%, var(--surface-3))' : 'color-mix(in srgb, var(--accent-1) 30%, var(--surface-3))') : 'var(--surface-3)'}
          stroke={b ? (tone === 'full' ? 'var(--viz-chosen)' : 'var(--accent-2)') : 'var(--border-strong)'}
          strokeWidth="1.3"
        />
      ))}
    </svg>
  )
}

export default function CoverDemo() {
  const [choices, setChoices] = useState<Choice[]>(INIT)

  const res = useMemo(() => solveCover(N, choices), [choices])
  const p = useStepPlayer(res.steps.length)
  const step = res.steps.length ? res.steps[Math.min(p.index, res.steps.length - 1)] : null

  const reset = () => {
    setChoices(INIT)
    p.reset()
  }
  const toggleCover = (ci: number, el: number) => {
    setChoices((arr) => arr.map((c, k) => (k === ci ? { ...c, cover: c.cover ^ (1 << el) } : c)))
    p.reset()
  }
  const bumpCost = (ci: number, d: number) => {
    setChoices((arr) => arr.map((c, k) => (k === ci ? { ...c, cost: Math.max(1, Math.min(15, c.cost + d)) } : c)))
    p.reset()
  }

  const full = res.full
  // 当前帧的 dp 快照；无帧（如全集已被单个选择覆盖）时退化为初始态 dp[0]=0
  const dpNow = step ? step.dp : Array.from({ length: full + 1 }, (_, i) => (i === 0 ? 0 : -1))

  return (
    <div>
      <div className="bm__toolbar bm__toolbar--cover">
        <div className="kd__group-label" style={{ width: '100%' }}>
          选择（点元素格切换是否覆盖 · 调代价）· 全集 = {'{0,1,2,3}'}
        </div>
        <div className="bm__choices">
          {choices.map((c, ci) => (
            <div className="bm__choice" key={ci}>
              <span className="bm__choice-name">选择 {String.fromCharCode(65 + ci)}</span>
              <div className="bm__choice-cells">
                {Array.from({ length: N }, (_, el) => {
                  const on = ((c.cover >> el) & 1) === 1
                  return (
                    <button
                      key={el}
                      className={`bm__cover-cell${on ? ' on' : ''}`}
                      onClick={() => toggleCover(ci, el)}
                      aria-label={`选择${ci}覆盖元素${el}`}
                    >
                      {el}
                    </button>
                  )
                })}
              </div>
              <div className="bm__choice-cost">
                <span>代价</span>
                <button onClick={() => bumpCost(ci, -1)} disabled={c.cost <= 1} aria-label="代价减">
                  <Minus size={11} />
                </button>
                <b>{c.cost}</b>
                <button onClick={() => bumpCost(ci, 1)} disabled={c.cost >= 15} aria-label="代价加">
                  <Plus size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button className="bm__reset" onClick={reset} aria-label="重置">
          <RotateCcw size={13} /> 复位
        </button>
      </div>

      {/* dp 数组：dp[S] 覆盖集合 S 的最小代价 */}
      <div className="bm__dp-strip">
        {Array.from({ length: full + 1 }, (_, S) => {
          const v = dpNow[S]
          const isFull = S === full
          const isSrc = step && step.S === S
          const isDst = step && step.nextS === S
          return (
            <div
              key={S}
              className={`bm__dp-cell${isFull ? ' full' : ''}${isSrc ? ' src' : ''}${isDst ? ' dst' : ''}`}
            >
              <MiniBits mask={S} n={N} tone={isFull ? 'full' : 'on'} />
              <span className="bm__dp-val">{v < 0 ? '∞' : v}</span>
            </div>
          )
        })}
      </div>

      {step && (
        <div className="bm__caption">
          用<b>选择 {String.fromCharCode(65 + step.choice)}</b>：从已覆盖 <span className="mono">{toBits(step.S, N).slice().reverse().join('')}</span>（代价 {dpNow[step.S] < 0 ? '∞' : dpNow[step.S]}）并入它覆盖的元素 → 变成 <span className="mono">{toBits(step.nextS, N).slice().reverse().join('')}</span>。
          新代价 = {step.cand}，原 dp[{toBits(step.nextS, N).slice().reverse().join('')}] = {step.before < 0 ? '∞' : step.before} →{' '}
          {step.took ? <b style={{ color: 'var(--viz-chosen)' }}>更新为 {step.cand}</b> : '不更新'}。
        </div>
      )}

      <PlaybackControls player={p} variant="compact" label="集合覆盖逐帧播放" />

      <div className="bm__note">
        终态 <b className="mono">{toBits(full, N).slice().reverse().join('')}</b>（全集）的最小代价 ={' '}
        <b style={{ color: 'var(--viz-chosen)' }}>{res.ans < 0 ? '无法覆盖' : res.ans}</b>。
      </div>
    </div>
  )
}
