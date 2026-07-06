import { useState } from 'react'
import { Scissors } from 'lucide-react'
import '../knapsack/knapsack-demo.css'

// 环上固定一组数值；演示“断环为链”的几何直觉：选一个断点，环展开成 2n 直链，
// 从断点起长度 n 的窗口 = 该断法下要合并的“一整圈”。纯 SVG，不走 DPViz。
const RING = [3, 9, 3, 4]

export default function RingChainDemo() {
  const n = RING.length
  const [cut, setCut] = useState(1) // 断点：在第 (cut-1) 堆与第 cut 堆之间剪开，窗口起点 = cut
  const a2 = [...RING, ...RING]

  // 环布局
  const cx = 130
  const cy = 130
  const R = 84
  const pos = (i: number) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }
  }
  // 剪开处在第 (cut-1) 堆与第 cut 堆的中间角度
  const cutAng = -Math.PI / 2 + ((cut - 0.5) * 2 * Math.PI) / n
  const cutPt = { x: cx + (R + 4) * Math.cos(cutAng), y: cy + (R + 4) * Math.sin(cutAng) }

  // 链布局
  const bw = 42
  const gap = 6
  const lx0 = 300
  const lY = 96
  // 窗口 = 链下标 [cut, cut+n-1]
  const winStart = cut
  const winW = n * (bw + gap) - gap

  return (
    <div>
      <div className="kd__toolbar">
        <div>
          <div className="kd__group-label">选一个断点，看环怎样展开成 2n 直链</div>
          <div className="kd__modes">
            {Array.from({ length: n }, (_, i) => (
              <button
                key={i}
                className={`kd__mode ${cut === i ? 'on' : ''}`}
                onClick={() => setCut(i)}
              >
                <Scissors size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                第 {i === 0 ? n - 1 : i - 1}｜{i} 堆之间
              </button>
            ))}
          </div>
        </div>
      </div>

      <svg viewBox="0 0 620 260" role="img" aria-label="环从选定断点展开成 2n 长的链">
        <defs>
          <marker id="rc-ar" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
          </marker>
        </defs>

        {/* 左：环 */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="4 5" />
        {RING.map((p, i) => {
          const { x, y } = pos(i)
          const isStart = i === cut // 该断法下的窗口起点堆
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="20"
                fill={isStart ? 'color-mix(in srgb, var(--viz-chosen) 16%, var(--surface-3))' : 'var(--surface-3)'}
                stroke={isStart ? 'var(--viz-chosen)' : 'var(--border-strong)'}
                strokeWidth={isStart ? 2.5 : 1.5}
              />
              <text x={x} y={y - 2} textAnchor="middle" fontSize="9.5" fill="var(--text-3)">
                {i}
              </text>
              <text x={x} y={y + 12} textAnchor="middle" fontSize="13" className="mono" fill="var(--accent-1)">
                {p}
              </text>
            </g>
          )
        })}
        {/* 剪刀记号 */}
        <text x={cutPt.x} y={cutPt.y + 5} textAnchor="middle" fontSize="16" fill="var(--viz-chosen)">
          ✂
        </text>
        <text x={cx} y={cy + 3} textAnchor="middle" fontSize="11.5" fill="var(--text-2)">
          起点 {cut}
        </text>

        {/* 展开箭头 */}
        <path d="M 232 130 H 288" stroke="var(--accent-2)" strokeWidth="2" markerEnd="url(#rc-ar)" fill="none" />
        <text x="260" y="120" textAnchor="middle" fontSize="11" fill="var(--accent-1)">
          展开
        </text>

        {/* 右：2n 直链，从断点 cut 处“接缝”对齐到窗口起点 */}
        {a2.map((p, i) => {
          const x = lx0 + i * (bw + gap)
          const isCopy = i >= n
          return (
            <g key={i} transform={`translate(${x},${lY})`}>
              <rect
                width={bw}
                height="40"
                rx="9"
                fill={isCopy ? 'color-mix(in srgb, var(--accent-1) 8%, var(--surface-3))' : 'var(--surface-3)'}
                stroke={isCopy ? 'var(--accent-2)' : 'var(--border-strong)'}
                strokeWidth="1.5"
                strokeDasharray={isCopy ? '4 3' : undefined}
              />
              <text x={bw / 2} y="25" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
                {p}
              </text>
              <text x={bw / 2} y="-6" textAnchor="middle" fontSize="9" className="mono" fill="var(--text-3)">
                {i}
              </text>
            </g>
          )
        })}

        {/* 窗口高亮框：链下标 [cut, cut+n-1] */}
        <rect
          x={lx0 + winStart * (bw + gap) - 4}
          y={lY - 12}
          width={winW + 8}
          height="64"
          rx="11"
          fill="none"
          stroke="var(--viz-chosen)"
          strokeWidth="2.5"
        />
        <text
          x={lx0 + winStart * (bw + gap) + winW / 2}
          y={lY + 66}
          textAnchor="middle"
          fontSize="11.5"
          fill="var(--viz-chosen)"
        >
          窗口 dp[{winStart}][{winStart + n - 1}]：从起点 {cut} 起的一整圈（{n} 堆）
        </text>
      </svg>

      <div className="fbug__readout">
        换个断点，窗口就在 2n 链上<b>整体平移</b>一格，覆盖的仍是环上的<b>同一圈 {n} 堆</b>、只是起止不同。
        <b>因此环形答案不能只看一个 dp[0][{n - 1}]</b>——要把这 {n} 个平移窗口都试一遍，取最优。链一旦复制成 2n，
        <b className="ok">任何一种“从哪儿断”都变成链上一个现成的连续区间</b>，环形问题就此化归为已会的链形区间 DP。
      </div>
    </div>
  )
}
