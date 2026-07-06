import { useMemo, useState } from 'react'
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useStepPlayer } from '../../dp-engine/useStepPlayer'
import { enumerateSubsets, toBits, popcount } from './subsetSolver'
import '../knapsack/knapsack-demo.css'
import './bitmask-demo.css'

const N = 4 // 元素 0..3

export default function SubsetEnumDemo() {
  // 母集 S：默认 {0,1,3} = 1011
  const [S, setS] = useState(0b1011)

  const steps = useMemo(() => enumerateSubsets(S), [S])
  const p = useStepPlayer(Math.max(1, steps.length))
  const cur = steps.length ? steps[Math.min(p.index, steps.length - 1)] : null

  const toggle = (i: number) => {
    setS((s) => s ^ (1 << i))
    p.reset()
  }

  const Sbits = toBits(S, N)
  const Tbits = cur ? toBits(cur.T, N) : Array<number>(N).fill(0)

  // 比特点阵渲染参数
  const cell = 46
  const gap = 10
  const totalW = N * cell + (N - 1) * gap
  const colX = (i: number) => (N - 1 - i) * (cell + gap) // 最高位在左

  const setStr = (mask: number) => {
    const els: number[] = []
    for (let i = 0; i < N; i++) if ((mask >> i) & 1) els.push(i)
    return els.length ? `{${els.join(',')}}` : '∅'
  }

  return (
    <div>
      <div className="bm__toolbar bm__toolbar--subset">
        <div>
          <div className="kd__group-label">母集 S（点方块把元素放入 / 移出）</div>
          <div className="bm__toggle-row">
            {Array.from({ length: N }, (_, i) => {
              const on = ((S >> i) & 1) === 1
              return (
                <button
                  key={i}
                  className={`bm__toggle${on ? ' on' : ''}`}
                  onClick={() => toggle(i)}
                  aria-pressed={on}
                  aria-label={`元素 ${i}`}
                >
                  <span className="bm__toggle-el">元素 {i}</span>
                  <span className="bm__toggle-bit">{on ? 1 : 0}</span>
                </button>
              )
            })}
          </div>
          <div className="bm__subset-meta">
            S = <b className="mono">{Sbits.slice().reverse().join('')}</b> = {setStr(S)}，共有 <b>{popcount(S) === 0 ? 0 : (1 << popcount(S)) - 1}</b> 个非空子集。
          </div>
        </div>
      </div>

      {steps.length === 0 ? (
        <div className="bm__note bm__note--warn">母集为空 ∅，没有非空子集可枚举。给 S 至少放入一个元素。</div>
      ) : (
        <>
          <div className="bm__subset-stage">
            <svg viewBox={`0 0 ${totalW} 118`} width={totalW} height={118} role="img" aria-label="当前枚举到的子集">
              {Array.from({ length: N }, (_, i) => {
                const inS = Sbits[i] === 1
                const inT = Tbits[i] === 1
                return (
                  <g key={i} transform={`translate(${colX(i)},18)`}>
                    <rect
                      width={cell}
                      height={cell}
                      rx="9"
                      fill={inT ? 'color-mix(in srgb, var(--accent-1) 30%, var(--surface-3))' : 'var(--surface-3)'}
                      stroke={inT ? 'var(--viz-current)' : inS ? 'var(--accent-2)' : 'var(--border-strong)'}
                      strokeWidth={inT ? 2.6 : 1.6}
                      opacity={inS ? 1 : 0.4}
                      strokeDasharray={!inS ? '4 3' : undefined}
                    />
                    <text x={cell / 2} y={cell / 2 + 7} textAnchor="middle" fontSize="19" fontWeight="700" className="mono" fill={inT ? 'var(--accent-1)' : 'var(--text-3)'}>
                      {inT ? 1 : 0}
                    </text>
                    <text x={cell / 2} y={cell + 16} textAnchor="middle" fontSize="10" className="mono" fill="var(--text-3)">
                      2^{i}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {cur && (
            <div className="bm__caption">
              第 <b>{cur.step}</b> 个子集：T = <b className="mono">{Tbits.slice().reverse().join('')}</b> = {setStr(cur.T)}。{' '}
              {cur.isFirst ? (
                <>枚举从 T = S 开始。</>
              ) : (
                <>
                  由上一个 <span className="mono">{toBits(cur.prevT, N).slice().reverse().join('')}</span> 做 <code>(T−1)&amp;S</code> 得到——只在 S 的 1 位里跳，自动跳过所有含 S 之外元素的值。
                </>
              )}
            </div>
          )}

          <div className="dpctl">
            <div className="dpctl__btns">
              <button onClick={p.reset} aria-label="重置" title="重置">
                <RotateCcw size={18} />
              </button>
              <button onClick={p.prev} disabled={p.index === 0} aria-label="上一步">
                <ChevronLeft size={20} />
              </button>
              <button className="primary" onClick={p.toggle} aria-label={p.playing ? '暂停' : '播放'}>
                {p.playing ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button onClick={p.next} disabled={p.index >= p.count - 1} aria-label="下一步">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="dpctl__scrub">
              <input
                type="range"
                min={0}
                max={Math.max(0, p.count - 1)}
                value={p.index}
                onChange={(e) => {
                  p.pause()
                  p.setIndex(Number(e.target.value))
                }}
                aria-label="进度"
              />
              <span className="dpctl__count">
                {p.index + 1}/{p.count}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
