// 最大子段和讲解用的插图（on-brand SVG，随强调色变色）。★不用外部图片、不做 opacity:0 起步动画。

// 引入图：一排带正负的数（柱高=数值，正上负下），高亮一段「连续」的子段并标注其和。
// 例子 a = [-2, 11, -4, 13, -5, -2]，最优子段 = 11,-4,13（下标 1..3），和 = 20。
export function SetupFigure() {
  const a = [-2, 11, -4, 13, -5, -2]
  const pick = new Set([1, 2, 3]) // 连续子段的下标区间
  const x0 = 40
  const dx = 92
  const bw = 60
  const mid = 96 // 零线的 y
  const scale = 3.6 // 每单位数值的像素高度
  const cx = (i: number) => x0 + i * dx + bw / 2
  return (
    <svg viewBox="0 0 620 210" role="img" aria-label="一排正负数与其中一段连续子段">
      <defs>
        <marker id="ms-br" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>
      {/* 零线 */}
      <line x1="20" y1={mid} x2="600" y2={mid} stroke="var(--border-strong)" strokeWidth="1.2" strokeDasharray="4 4" />
      <text x="24" y={mid - 6} fontSize="10.5" className="mono" fill="var(--text-3)">
        0
      </text>
      {/* 高亮子段的底框 + 括注 */}
      <rect
        x={x0 - 8}
        y="20"
        width={3 * dx + 16}
        height="150"
        rx="12"
        fill="color-mix(in srgb, var(--accent-1) 8%, transparent)"
        stroke="var(--accent-2)"
        strokeWidth="1.4"
        strokeDasharray="6 4"
      />
      {a.map((v, i) => {
        const on = pick.has(i)
        const h = Math.abs(v) * scale
        const y = v >= 0 ? mid - h : mid
        return (
          <g key={i} transform={`translate(${x0 + i * dx},0)`}>
            <rect
              x="0"
              y={y}
              width={bw}
              height={h}
              rx="7"
              fill={on ? 'color-mix(in srgb, var(--accent-1) 32%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={on ? 'var(--accent-2)' : 'var(--border-strong)'}
              strokeWidth={on ? '2' : '1.5'}
            />
            <text
              x={bw / 2}
              y={v >= 0 ? y - 8 : y + h + 16}
              textAnchor="middle"
              fontSize="15"
              className="mono"
              fill={on ? 'var(--accent-1)' : 'var(--text-2)'}
            >
              {v}
            </text>
            <text x={bw / 2} y="200" textAnchor="middle" fontSize="10.5" className="mono" fill="var(--text-3)">
              {i}
            </text>
          </g>
        )
      })}
      {/* 结论括注 */}
      <path d={`M ${cx(0)} 30 H ${cx(3)}`} stroke="var(--accent-2)" strokeWidth="2" markerEnd="url(#ms-br)" fill="none" />
      <text x={(cx(0) + cx(3)) / 2} y="16" textAnchor="middle" fontSize="12.5" fill="var(--accent-1)">
        连续一段：11 + (−4) + 13 = 20（最大）
      </text>
    </svg>
  )
}

// 转移决策图：dp[i] 的两条路——接续（dp[i-1]+a[i]）vs 另起（a[i]），取较大者。
export function DecisionFigure() {
  return (
    <svg viewBox="0 0 620 292" role="img" aria-label="dp[i] 接续前一段或另起一段的决策分叉">
      <defs>
        <marker id="ms-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      <g transform="translate(240,8)">
        <rect width="140" height="48" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="70" y="21" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
          以 a[i] 结尾
        </text>
        <text x="70" y="39" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
          dp[i] = ?
        </text>
      </g>
      <path d="M290 56 L150 100" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#ms-ar)" />
      <path d="M330 56 L474 100" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#ms-ar)" />
      <text x="188" y="86" fontSize="12.5" fill="var(--text-2)">
        接续
      </text>
      <text x="404" y="86" fontSize="12.5" fill="var(--text-2)">
        另起
      </text>
      <g transform="translate(28,104)">
        <rect width="238" height="68" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="119" y="27" textAnchor="middle" fontSize="13" fill="var(--text-1)">
          接在前一段后面
        </text>
        <text x="119" y="50" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
          = dp[i−1] + a[i]
        </text>
      </g>
      <g transform="translate(360,104)">
        <rect width="234" height="68" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="117" y="27" textAnchor="middle" fontSize="13" fill="var(--text-1)">
          扔掉前面，重开一段
        </text>
        <text x="117" y="50" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
          = a[i]
        </text>
      </g>
      <path d="M147 172 L300 226" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#ms-ar)" />
      <path d="M477 172 L340 226" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#ms-ar)" />
      <g transform="translate(196,228)">
        <rect
          width="248"
          height="54"
          rx="14"
          fill="color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))"
          stroke="var(--accent-2)"
          strokeWidth="1.5"
        />
        <text x="124" y="32" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
          取较大者 = max(两者)
        </text>
      </g>
    </svg>
  )
}

// 环形补集图：一圈数首尾相接；最优段跨过首尾时，等于「总和 − 中间最小子段」。
// 例子 a = [2,-1,2,-1,2]（环形）：总和 4，中间挖掉最小子段 −1，绕首尾的和 = 4 − (−1) = 5。
export function RingFigure() {
  const a = [2, -1, 2, -1, 2]
  const n = a.length
  const cx0 = 168
  const cy0 = 130
  const R = 96
  // 被「挖掉」的最小子段（这里取下标 3 的 −1，仅示意其一）；其余组成绕首尾的最优段。
  const holeIdx = 3
  const angle = (i: number) => (-90 + (360 / n) * i) * (Math.PI / 180)
  const px = (i: number) => cx0 + R * Math.cos(angle(i))
  const py = (i: number) => cy0 + R * Math.sin(angle(i))
  return (
    <svg viewBox="0 0 560 264" role="img" aria-label="环形数列：绕首尾的最优段等于总和减去最小子段">
      {/* 圆环连线 */}
      <circle cx={cx0} cy={cy0} r={R} fill="none" stroke="var(--border-strong)" strokeWidth="1.4" strokeDasharray="3 4" />
      {a.map((v, i) => {
        const hole = i === holeIdx
        return (
          <g key={i} transform={`translate(${px(i) - 22},${py(i) - 18})`}>
            <rect
              width="44"
              height="36"
              rx="10"
              fill={
                hole
                  ? 'color-mix(in srgb, var(--viz-invalid) 16%, var(--surface-3))'
                  : 'color-mix(in srgb, var(--accent-1) 22%, var(--surface-3))'
              }
              stroke={hole ? 'var(--viz-invalid)' : 'var(--accent-2)'}
              strokeWidth={hole ? '2' : '1.6'}
            />
            <text x="22" y="24" textAnchor="middle" fontSize="15" className="mono" fill={hole ? 'var(--viz-invalid)' : 'var(--text-1)'}>
              {v}
            </text>
          </g>
        )
      })}
      {/* 中心说明 */}
      <text x={cx0} y={cy0 - 4} textAnchor="middle" fontSize="12" fill="var(--text-2)">
        绕首尾取
      </text>
      <text x={cx0} y={cy0 + 15} textAnchor="middle" fontSize="11.5" fill="var(--text-3)">
        挖掉最小段
      </text>
      {/* 右侧公式推导 */}
      <g transform="translate(320,52)">
        <rect width="222" height="160" rx="14" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="20" y="34" fontSize="12.5" fill="var(--text-2)">
          总和 total = 4
        </text>
        <text x="20" y="62" fontSize="12.5" fill="var(--viz-invalid)">
          最小子段 = −1（挖掉）
        </text>
        <line x1="20" y1="78" x2="202" y2="78" stroke="var(--border-strong)" strokeWidth="1" />
        <text x="20" y="104" fontSize="12.5" className="mono" fill="var(--text-1)">
          绕首尾 = total − minSeg
        </text>
        <text x="20" y="128" fontSize="12.5" className="mono" fill="var(--text-1)">
          = 4 − (−1)
        </text>
        <text x="20" y="150" fontSize="13.5" className="mono" fill="var(--accent-1)">
          = 5（&gt; 普通 Kadane 的 4）
        </text>
      </g>
    </svg>
  )
}
