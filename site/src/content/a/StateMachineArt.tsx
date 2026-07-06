// 线性状态机 DP 讲解用的插图（on-brand SVG，随强调色变色）。
// ★不用外部图片、不做 opacity:0 起步动画。节点+边风格仿 KnapsackArt / LISArt。

// 引入图：一排数，被选中的两两不相邻——相邻两数之间画「禁选」链，直观呈现约束。
export function SetupFigure() {
  const a = [1, 2, 3, 1]
  const pick = new Set([0, 2]) // 选 a1、a3（不相邻），和 = 4
  const x0 = 60
  const dx = 108
  const bw = 74
  const cx = (i: number) => x0 + i * dx + bw / 2
  return (
    <svg viewBox="0 0 560 176" role="img" aria-label="受限选取：选出的数两两不相邻">
      <defs>
        <marker id="sm-ban" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <circle cx="4" cy="4" r="3" fill="none" stroke="var(--viz-invalid)" strokeWidth="1.4" />
        </marker>
      </defs>
      <text x="30" y="20" fontSize="13" fill="var(--text-2)">
        选一批数使和最大，但<tspan fill="var(--viz-invalid)">相邻两个不能同时选</tspan>
      </text>
      {/* 相邻禁选链：每对相邻数之间一条红色虚线，示意互斥 */}
      {a.slice(0, -1).map((_, i) => (
        <line
          key={`ban${i}`}
          x1={cx(i) + bw / 2 - 6}
          y1="128"
          x2={cx(i + 1) - bw / 2 + 6}
          y2="128"
          stroke="var(--viz-invalid)"
          strokeWidth="1.6"
          strokeDasharray="4 4"
        />
      ))}
      {a.map((v, i) => {
        const on = pick.has(i)
        return (
          <g key={i} transform={`translate(${x0 + i * dx},44)`}>
            <rect
              width={bw}
              height={64}
              rx="12"
              fill={on ? 'color-mix(in srgb, var(--accent-1) 26%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={on ? 'var(--accent-2)' : 'var(--border-strong)'}
              strokeWidth={on ? '2.2' : '1.5'}
            />
            <text x={bw / 2} y="28" textAnchor="middle" fontSize="12" fill="var(--text-2)">
              a{i + 1}
            </text>
            <text x={bw / 2} y="50" textAnchor="middle" fontSize="18" className="mono" fill={on ? 'var(--accent-1)' : 'var(--text-1)'}>
              {v}
            </text>
            {on && (
              <text x={bw / 2} y="-8" textAnchor="middle" fontSize="11" fill="var(--accent-1)">
                ✓ 选
              </text>
            )}
          </g>
        )
      })}
      <text x="360" y="168" fontSize="12" fill="var(--accent-1)">
        选 a1+a3 = 1+3 = 4（最大）
      </text>
    </svg>
  )
}

// 状态转移图：每个位置引入「不选 / 选」两离散状态，dp[i][·] 从上一位置转来。
// 不选 ← 上一位置两状态取 max；选 ← 只能接上一位置的「不选」（相邻互斥）。
export function TransitionFigure() {
  // 三列：位置 i-1 的两状态、位置 i 的两状态。
  const colX = [70, 360]
  const rowY = [56, 150] // 行 0 = 不选，行 1 = 选
  const bw = 150
  const bh = 58
  const cx = (c: number) => colX[c] + bw / 2
  const cy = (r: number) => rowY[r] + bh / 2
  const node = (c: number, r: number, title: string, sub: string, cur = false) => (
    <g transform={`translate(${colX[c]},${rowY[r]})`}>
      <rect
        width={bw}
        height={bh}
        rx="12"
        fill={cur ? 'color-mix(in srgb, var(--viz-current) 15%, var(--surface-3))' : 'var(--surface-3)'}
        stroke={cur ? 'var(--viz-current)' : 'var(--border-strong)'}
        strokeWidth="1.6"
      />
      <text x={bw / 2} y="24" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
        {title}
      </text>
      <text x={bw / 2} y="44" textAnchor="middle" fontSize="13" className="mono" fill="var(--text-1)">
        {sub}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 580 224" role="img" aria-label="选与不选两状态之间的转移">
      <defs>
        <marker id="sm-src" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-source)" />
        </marker>
        <marker id="sm-cho" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-chosen)" />
        </marker>
      </defs>
      <text x={cx(0)} y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text-3)">
        位置 i−1
      </text>
      <text x={cx(1)} y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--accent-1)">
        位置 i（a[i]）
      </text>
      {/* 边：不选[i] ← 不选[i-1] 与 选[i-1] 各一条（取 max） */}
      <line x1={colX[0] + bw} y1={cy(0)} x2={colX[1]} y2={cy(0)} stroke="var(--viz-source)" strokeWidth="2" markerEnd="url(#sm-src)" />
      <path
        d={`M ${colX[0] + bw} ${cy(1)} C ${(colX[0] + bw + colX[1]) / 2} ${cy(1)}, ${(colX[0] + bw + colX[1]) / 2} ${cy(0)}, ${colX[1]} ${cy(0) + 8}`}
        fill="none"
        stroke="var(--viz-source)"
        strokeWidth="2"
        markerEnd="url(#sm-src)"
      />
      {/* 边：选[i] ← 只能来自 不选[i-1]（chosen 强调） */}
      <path
        d={`M ${colX[0] + bw} ${cy(0) + 10} C ${(colX[0] + bw + colX[1]) / 2} ${cy(0) + 10}, ${(colX[0] + bw + colX[1]) / 2} ${cy(1)}, ${colX[1]} ${cy(1)}`}
        fill="none"
        stroke="var(--viz-chosen)"
        strokeWidth="2.6"
        markerEnd="url(#sm-cho)"
      />
      {node(0, 0, '不选 · dp[i−1][0]', '继承的旧值')}
      {node(0, 1, '选 · dp[i−1][1]', '继承的旧值')}
      {node(1, 0, '不选 · dp[i][0]', '= max(上两态)', true)}
      {node(1, 1, '选 · dp[i][1]', '= dp[i−1][0]+a[i]', true)}
      <text x={colX[1] + bw / 2} y="212" textAnchor="middle" fontSize="11.5" fill="var(--viz-chosen)">
        「选」只接「上一位置不选」——这就锁死了相邻互斥
      </text>
    </svg>
  )
}

// 股票买卖状态机图：持有 / 未持有 两状态节点 + 买入 / 卖出 / 不动（+冷却）转移边。
export function StockFigure() {
  const hold = { x: 96, y: 88, r: 52 }
  const cash = { x: 384, y: 88, r: 52 }
  return (
    <svg viewBox="0 0 540 200" role="img" aria-label="股票买卖的持有与未持有状态机">
      <defs>
        <marker id="sm-buy" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-chosen)" />
        </marker>
        <marker id="sm-sell" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-current)" />
        </marker>
        <marker id="sm-loop" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      {/* 买入：未持有 → 持有（上弧） */}
      <path
        d={`M ${cash.x - cash.r} ${cash.y - 16} C 300 8, 180 8, ${hold.x + hold.r} ${hold.y - 16}`}
        fill="none"
        stroke="var(--viz-chosen)"
        strokeWidth="2.6"
        markerEnd="url(#sm-buy)"
      />
      <text x="240" y="20" textAnchor="middle" fontSize="12.5" fill="var(--viz-chosen)">
        买入（现金 − price）
      </text>
      {/* 卖出：持有 → 未持有（下弧） */}
      <path
        d={`M ${hold.x + hold.r} ${hold.y + 16} C 180 172, 300 172, ${cash.x - cash.r} ${cash.y + 16}`}
        fill="none"
        stroke="var(--viz-current)"
        strokeWidth="2.6"
        markerEnd="url(#sm-sell)"
      />
      <text x="240" y="168" textAnchor="middle" fontSize="12.5" fill="var(--viz-current)">
        卖出（现金 + price）
      </text>
      {/* 自环：不动 */}
      <path d={`M ${hold.x - 20} ${hold.y - hold.r} A 22 22 0 1 1 ${hold.x + 20} ${hold.y - hold.r}`} fill="none" stroke="var(--text-3)" strokeWidth="1.8" markerEnd="url(#sm-loop)" />
      <path d={`M ${cash.x - 20} ${cash.y - cash.r} A 22 22 0 1 1 ${cash.x + 20} ${cash.y - cash.r}`} fill="none" stroke="var(--text-3)" strokeWidth="1.8" markerEnd="url(#sm-loop)" />
      <text x={hold.x} y={hold.y - hold.r - 20} textAnchor="middle" fontSize="11" fill="var(--text-3)">继续持有</text>
      <text x={cash.x} y={cash.y - cash.r - 20} textAnchor="middle" fontSize="11" fill="var(--text-3)">继续空仓（冷却停这）</text>
      {/* 两状态节点 */}
      <circle cx={hold.x} cy={hold.y} r={hold.r} fill="color-mix(in srgb, var(--accent-1) 14%, var(--surface-3))" stroke="var(--accent-2)" strokeWidth="2.2" />
      <text x={hold.x} y={hold.y - 6} textAnchor="middle" fontSize="14" fill="var(--text-1)">持有</text>
      <text x={hold.x} y={hold.y + 14} textAnchor="middle" fontSize="11.5" className="mono" fill="var(--text-2)">hold</text>
      <circle cx={cash.x} cy={cash.y} r={cash.r} fill="color-mix(in srgb, var(--viz-source) 16%, var(--surface-3))" stroke="var(--border-strong)" strokeWidth="2" />
      <text x={cash.x} y={cash.y - 6} textAnchor="middle" fontSize="14" fill="var(--text-1)">未持有</text>
      <text x={cash.x} y={cash.y + 14} textAnchor="middle" fontSize="11.5" className="mono" fill="var(--text-2)">cash</text>
    </svg>
  )
}
