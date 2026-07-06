// 环形区间 DP（断环为链）讲解用插图（on-brand SVG，随部分强调色变色）。

// 环形石子：n 堆首尾相接，第 n-1 堆与第 0 堆也相邻——断点不定。
export function RingSetupFigure() {
  const piles = [3, 9, 3, 4]
  const n = piles.length
  const cx = 155
  const cy = 118
  const R = 78
  // 从正上方开始顺时针摆放
  const pos = (i: number) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }
  }
  return (
    <svg viewBox="0 0 520 236" role="img" aria-label="n 堆石子摆成一个环，首尾相邻">
      {/* 环形连线 */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="4 5" />
      {piles.map((p, i) => {
        const { x, y } = pos(i)
        // 第 n-1 堆与第 0 堆用强调色，凸显“环上首尾也相邻”
        const wrap = i === 0 || i === n - 1
        return (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r="24"
              fill={wrap ? 'color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={wrap ? 'var(--accent-2)' : 'var(--border-strong)'}
              strokeWidth={wrap ? 2.5 : 1.5}
            />
            <text x={x} y={y - 3} textAnchor="middle" fontSize="10.5" fill="var(--text-3)">
              第 {i} 堆
            </text>
            <text x={x} y={y + 13} textAnchor="middle" fontSize="15" className="mono" fill="var(--accent-1)">
              {p}
            </text>
          </g>
        )
      })}
      {/* 标注：首尾相邻这条边 */}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="12" fill="var(--text-2)">
        环
      </text>
      <g transform="translate(300,40)">
        <rect width="196" height="156" rx="12" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="1.5" />
        <text x="98" y="30" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">和链形唯一的差别</text>
        <text x="20" y="64" fontSize="12.5" fill="var(--text-2)">· 第 0 堆与第 {n - 1} 堆</text>
        <text x="34" y="84" fontSize="12.5" fill="var(--accent-1)">也相邻，可以合并</text>
        <text x="20" y="116" fontSize="12.5" fill="var(--text-2)">· 最后剩的那一堆，</text>
        <text x="34" y="136" fontSize="12.5" fill="var(--text-2)">起点断在哪里不定</text>
      </g>
    </svg>
  )
}

// 断环为链：把环从某处剪开、复制一倍接成长度 2n 的链，环上任一段连续区间都在链里出现。
export function BreakRingFigure() {
  const a = [3, 9, 3, 4]
  const n = a.length
  const cx = 92
  const cy = 96
  const R = 56
  const pos = (i: number) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }
  }
  const a2 = [...a, ...a]
  const bx0 = 250
  const bw = 40
  const gap = 6
  return (
    <svg viewBox="0 0 640 214" role="img" aria-label="把环剪开复制一倍拼成长度 2n 的链">
      <defs>
        <marker id="br-ar" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>
      {/* 左：环 + 剪开处 */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="4 5" />
      {a.map((p, i) => {
        const { x, y } = pos(i)
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="17" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
            <text x={x} y={y + 5} textAnchor="middle" fontSize="13" className="mono" fill="var(--accent-1)">
              {p}
            </text>
          </g>
        )
      })}
      {/* 剪刀记号：在第 n-1 堆与第 0 堆之间（顶部略偏右） */}
      <text x={cx + 2} y={cy - R - 10} textAnchor="middle" fontSize="15" fill="var(--accent-2)">
        ✂
      </text>
      <text x={cx} y={cy + R + 26} textAnchor="middle" fontSize="11.5" fill="var(--text-2)">
        任选一处剪开
      </text>
      {/* 展开箭头 */}
      <path d={`M 168 96 H 236`} stroke="var(--accent-2)" strokeWidth="2" markerEnd="url(#br-ar)" fill="none" />
      <text x="202" y="86" textAnchor="middle" fontSize="11.5" fill="var(--accent-1)">
        复制一倍
      </text>
      {/* 右：长度 2n 的链 */}
      {a2.map((p, i) => {
        const x = bx0 + i * (bw + gap)
        const isCopy = i >= n
        return (
          <g key={i} transform={`translate(${x},76)`}>
            <rect
              width={bw}
              height="40"
              rx="9"
              fill={isCopy ? 'color-mix(in srgb, var(--accent-1) 9%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={isCopy ? 'var(--accent-2)' : 'var(--border-strong)'}
              strokeWidth="1.5"
              strokeDasharray={isCopy ? '4 3' : undefined}
            />
            <text x={bw / 2} y="25" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
              {p}
            </text>
            <text x={bw / 2} y="-6" textAnchor="middle" fontSize="9.5" className="mono" fill="var(--text-3)">
              {i}
            </text>
          </g>
        )
      })}
      <text x={bx0 + (bw + gap) * (n / 2) - gap / 2} y="140" textAnchor="middle" fontSize="10.5" fill="var(--text-3)">
        原始 n 堆
      </text>
      <text x={bx0 + (bw + gap) * (n + n / 2) - gap / 2} y="140" textAnchor="middle" fontSize="10.5" fill="var(--accent-1)">
        复制的 n 堆
      </text>
      {/* 底：任一长度 n 的窗口都在链里 */}
      <path
        d={`M ${bx0 + (bw + gap) * 1 - 2} 160 H ${bx0 + (bw + gap) * 5 - gap - 2}`}
        stroke="var(--viz-chosen)"
        strokeWidth="2.5"
        markerStart="url(#br-ar)"
        markerEnd="url(#br-ar)"
        fill="none"
      />
      <text x={bx0 + (bw + gap) * 3 - gap / 2} y="180" textAnchor="middle" fontSize="11" fill="var(--viz-chosen)">
        窗口 [1, 4]：从第 1 堆起、绕过尾首的一整圈
      </text>
    </svg>
  )
}

// 窗口枚举：2n 链上，每个长度为 n 的区间 [i, i+n-1] 对应“从第 i 堆开始的一种断法”，取其中最优。
export function WindowScanFigure() {
  const n = 4
  const total = 2 * n
  const bw = 40
  const gap = 6
  const x0 = 40
  const rowY = (r: number) => 62 + r * 40
  // 四个窗口起点 i = 0..n-1
  return (
    <svg viewBox="0 0 480 254" role="img" aria-label="在 2n 链上枚举所有长度为 n 的窗口">
      {/* 链的下标刻度 */}
      {Array.from({ length: total }, (_, i) => (
        <g key={i} transform={`translate(${x0 + i * (bw + gap)},28)`}>
          <rect width={bw} height="26" rx="7" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.2" />
          <text x={bw / 2} y="18" textAnchor="middle" fontSize="12" className="mono" fill="var(--text-3)">
            {i}
          </text>
        </g>
      ))}
      {/* 每个窗口一行高亮 */}
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + i * (bw + gap)
        const w = n * (bw + gap) - gap
        return (
          <g key={i}>
            <rect
              x={x}
              y={rowY(i)}
              width={w}
              height="26"
              rx="7"
              fill="color-mix(in srgb, var(--accent-1) 14%, var(--surface-2))"
              stroke="var(--accent-2)"
              strokeWidth="1.5"
            />
            <text x={x + w / 2} y={rowY(i) + 17} textAnchor="middle" fontSize="11.5" className="mono" fill="var(--text-1)">
              dp[{i}][{i + n - 1}]
            </text>
            <text x={x0 - 14} y={rowY(i) + 17} textAnchor="end" fontSize="10.5" fill="var(--text-3)">
              起点 {i}
            </text>
          </g>
        )
      })}
      <text x={x0} y={rowY(n) + 20} fontSize="12" fill="var(--text-2)">
        环形答案 = min / max 这 <tspan className="mono" fill="var(--accent-1)">n</tspan> 个窗口值
      </text>
      <text x={x0} y={rowY(n) + 40} fontSize="11" fill="var(--text-3)">
        （长度超过 n 的窗口会让某堆被合并两次，非法，不枚举）
      </text>
    </svg>
  )
}
