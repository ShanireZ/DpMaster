// C5 合并 / 删除类区间 DP 讲解用插图（on-brand SVG，随强调色变色）。

// 图 1：一排数字，两个玩家只能从「最左」或「最右」端拿走一个数。
export function TakeEndsSetupFigure() {
  const a = [3, 9, 1, 2]
  const bw = 70
  const gap = 12
  const x0 = 128
  const bx = (i: number) => x0 + i * (bw + gap)
  const lx = x0 + bw / 2
  const rx = bx(a.length - 1) + bw / 2
  return (
    <svg viewBox="0 0 640 176" role="img" aria-label="一排数字，只能从两端取走">
      <defs>
        <marker id="mi-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>
      {a.map((v, i) => {
        const end = i === 0 || i === a.length - 1
        return (
          <g key={i} transform={`translate(${bx(i)},58)`}>
            <rect
              width={bw}
              height={62}
              rx="12"
              fill={end ? 'color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={end ? 'var(--accent-2)' : 'var(--border-strong)'}
              strokeWidth={end ? 2 : 1.5}
            />
            <text x={bw / 2} y="26" textAnchor="middle" fontSize="11" className="mono" fill="var(--text-3)">
              a[{i}]
            </text>
            <text x={bw / 2} y="49" textAnchor="middle" fontSize="20" className="mono" fill={end ? 'var(--accent-1)' : 'var(--text-1)'}>
              {v}
            </text>
          </g>
        )
      })}
      {/* 左端箭头 */}
      <path d={`M ${lx} 44 C ${x0 - 30} 8, ${x0 - 60} 40, ${x0 - 60} 90`} fill="none" stroke="var(--accent-2)" strokeWidth="2" markerEnd="url(#mi-ar)" />
      <text x={x0 - 66} y="112" textAnchor="middle" fontSize="12" fill="var(--text-2)">取左端</text>
      {/* 右端箭头 */}
      <path d={`M ${rx} 44 C ${rx + 30} 8, ${rx + 60} 40, ${rx + 60} 90`} fill="none" stroke="var(--accent-2)" strokeWidth="2" markerEnd="url(#mi-ar)" />
      <text x={rx + 60} y="112" textAnchor="middle" fontSize="12" fill="var(--text-2)">取右端</text>
      <text x="320" y="150" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
        两人轮流拿，每回合只能从<tspan fill="var(--accent-1)"> 一端 </tspan>取走一个数——区间从两端「收缩」。
      </text>
    </svg>
  )
}

// 图 2：dp[l][r] 的两端收缩转移——取左端接子问题 [l+1,r]，取右端接 [l,r-1]，对手净胜差取反。
export function ShrinkTransitionFigure() {
  return (
    <svg viewBox="0 0 640 274" role="img" aria-label="两端取数的转移：取左或取右，子区间收缩一格">
      <defs>
        <marker id="mi-ar2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      <g transform="translate(232,8)">
        <rect width="176" height="50" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="88" y="22" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">面对区间 [l, r]</text>
        <text x="88" y="41" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">dp[l][r] = ?</text>
      </g>
      <path d="M300 58 L168 100" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#mi-ar2)" />
      <path d="M340 58 L474 100" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#mi-ar2)" />
      <text x="206" y="86" fontSize="12.5" fill="var(--accent-1)">拿走左端 a[l]</text>
      <text x="404" y="86" fontSize="12.5" fill="var(--accent-1)">拿走右端 a[r]</text>
      <g transform="translate(24,104)">
        <rect width="288" height="70" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="144" y="28" textAnchor="middle" fontSize="13" fill="var(--text-1)">对手接手子区间 [l+1, r]</text>
        <text x="144" y="52" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">a[l] − dp[l+1][r]</text>
      </g>
      <g transform="translate(328,104)">
        <rect width="288" height="70" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="144" y="28" textAnchor="middle" fontSize="13" fill="var(--text-1)">对手接手子区间 [l, r−1]</text>
        <text x="144" y="52" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">a[r] − dp[l][r−1]</text>
      </g>
      <path d="M168 174 L300 214" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#mi-ar2)" />
      <path d="M472 174 L340 214" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#mi-ar2)" />
      <g transform="translate(196,216)">
        <rect
          width="248"
          height="52"
          rx="14"
          fill="color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))"
          stroke="var(--accent-2)"
          strokeWidth="1.5"
        />
        <text x="124" y="31" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">取较大者 = max(两者)</text>
      </g>
    </svg>
  )
}

// 图 3：248 的相邻相等合并——两个 2 并成一个 3；两段先各自缩成同一数，才能再并一级。
export function Merge248Figure() {
  const bw = 58
  const bh = 54
  const cell = (x: number, y: number, v: number, hot: boolean) => (
    <g transform={`translate(${x},${y})`}>
      <rect
        width={bw}
        height={bh}
        rx="11"
        fill={hot ? 'color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))' : 'var(--surface-3)'}
        stroke={hot ? 'var(--accent-2)' : 'var(--border-strong)'}
        strokeWidth={hot ? 2 : 1.5}
      />
      <text x={bw / 2} y={bh / 2 + 7} textAnchor="middle" fontSize="21" className="mono" fill={hot ? 'var(--accent-1)' : 'var(--text-1)'}>
        {v}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 600 210" role="img" aria-label="248 玩法：相邻相等的两数并成加一">
      <defs>
        <marker id="mi-ar3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>
      {/* 第一步：… 2 2 → 3 */}
      <text x="20" y="52" fontSize="12.5" fill="var(--text-3)">第 1 步</text>
      {cell(96, 26, 1, false)}
      {cell(96 + 70, 26, 2, true)}
      {cell(96 + 140, 26, 2, true)}
      <path d="M300 53 H352" stroke="var(--accent-2)" strokeWidth="2" markerEnd="url(#mi-ar3)" />
      <text x="326" y="42" textAnchor="middle" fontSize="11" fill="var(--accent-1)">并</text>
      {cell(372, 26, 1, false)}
      {cell(372 + 70, 26, 3, true)}
      {/* 第二步：1 3 无法合并（不相等） */}
      <text x="20" y="150" fontSize="12.5" fill="var(--text-3)">第 2 步</text>
      {cell(96, 124, 1, false)}
      {cell(96 + 70, 124, 3, false)}
      <text x="300" y="156" fontSize="13" fill="var(--viz-invalid)">1 ≠ 3，无法再并</text>
      <text x="300" y="196" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
        只有<tspan fill="var(--accent-1)"> 相邻且相等 </tspan>才能并成 +1；两段要先各自缩成<tspan fill="var(--accent-1)"> 同一个数 </tspan>，才谈得上再并一级。
      </text>
    </svg>
  )
}
