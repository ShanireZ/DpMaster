// LIS 讲解用的插图（on-brand SVG，随强调色变色）。★不用外部图片、不做 opacity:0 起步动画。

// 引入图：一条序列排成刻度条，高亮其中一条上升子序列（1→3→6→8→9）。
export function SetupFigure() {
  const a = [2, 1, 5, 3, 6, 4, 8, 9, 7]
  // 被选中的上升子序列下标（1,3,6,8,9 → 值在下标 1,3,4,6,7）
  const pick = new Set([1, 3, 4, 6, 7])
  const x0 = 26
  const dx = 64
  const bw = 46
  const cx = (i: number) => x0 + i * dx + bw / 2
  return (
    <svg viewBox="0 0 620 200" role="img" aria-label="一条序列与其中一条最长上升子序列">
      <defs>
        <marker id="lis-up" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>
      {/* 连接被选子序列的折线（上升） */}
      {[1, 3, 4, 6].map((i, k) => {
        const arr = [1, 3, 4, 6, 7]
        const j = arr[k + 1]
        return (
          <path
            key={`ln${i}`}
            d={`M ${cx(i)} ${150 - a[i] * 9} L ${cx(j)} ${150 - a[j] * 9}`}
            stroke="var(--accent-2)"
            strokeWidth="2.5"
            fill="none"
            markerEnd="url(#lis-up)"
          />
        )
      })}
      {a.map((v, i) => {
        const on = pick.has(i)
        const y = 150 - v * 9
        return (
          <g key={i} transform={`translate(${x0 + i * dx},0)`}>
            {/* 刻度柱：值越大越高，直观呈现「上升」 */}
            <rect
              x="0"
              y={y}
              width={bw}
              height={158 - y}
              rx="8"
              fill={on ? 'color-mix(in srgb, var(--accent-1) 30%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={on ? 'var(--accent-2)' : 'var(--border-strong)'}
              strokeWidth={on ? '2' : '1.5'}
            />
            <text x={bw / 2} y={y - 8} textAnchor="middle" fontSize="15" className="mono" fill={on ? 'var(--accent-1)' : 'var(--text-2)'}>
              {v}
            </text>
            <text x={bw / 2} y="176" textAnchor="middle" fontSize="10.5" className="mono" fill="var(--text-3)">
              {i}
            </text>
          </g>
        )
      })}
      <text x="26" y="194" fontSize="11.5" fill="var(--text-3)">
        下标 i →
      </text>
      <text x="470" y="194" fontSize="11.5" fill="var(--accent-1)">
        高亮：一条长度 5 的上升子序列
      </text>
    </svg>
  )
}

// O(n²) 转移图解：dp[i] = 1 + max over j<i, a[j]<a[i] of dp[j]。
export function DecisionFigure() {
  // 展示 a = ...,3,6,4,8,... 里算 dp(8) 的来源：左边所有更矮的 dp 取最大。
  const cells = [
    { lab: 'a=3', dp: 2, ok: true },
    { lab: 'a=6', dp: 3, ok: true },
    { lab: 'a=4', dp: 3, ok: true },
    { lab: 'a=9', dp: null as number | null, ok: false, cur: true },
  ]
  const x0 = 40
  const dx = 132
  const bw = 104
  const bh = 56
  const topY = 118
  const cx = (i: number) => x0 + i * dx + bw / 2
  return (
    <svg viewBox="0 0 620 220" role="img" aria-label="O(n²) 转移：dp[i] 取左侧可接的 dp 最大值加一">
      <defs>
        <marker id="lis-src" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-source)" />
        </marker>
        <marker id="lis-cho" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-chosen)" />
        </marker>
      </defs>
      <text x="310" y="22" textAnchor="middle" fontSize="13" fill="var(--text-2)">
        算 dp（a=9）：向左看每个更矮的数，取它们 dp 的最大值，再 +1
      </text>
      {/* 来源箭头：a=6 的 dp=3 是最大 → chosen；其余 source */}
      {cells.slice(0, 3).map((_, i) => {
        const chosen = i === 1 // a=6 dp=3 最大
        return (
          <path
            key={`ar${i}`}
            d={`M ${cx(i)} ${topY} Q ${(cx(i) + cx(3)) / 2} ${topY - 44} ${cx(3)} ${topY}`}
            stroke={chosen ? 'var(--viz-chosen)' : 'var(--viz-source)'}
            strokeWidth={chosen ? '2.6' : '1.8'}
            fill="none"
            markerEnd={`url(#${chosen ? 'lis-cho' : 'lis-src'})`}
            opacity={chosen ? 1 : 0.7}
          />
        )
      })}
      {cells.map((c, i) => {
        const chosen = i === 1
        return (
          <g key={i} transform={`translate(${x0 + i * dx},${topY})`}>
            <rect
              width={bw}
              height={bh}
              rx="12"
              fill={
                c.cur
                  ? 'color-mix(in srgb, var(--viz-current) 16%, var(--surface-3))'
                  : chosen
                    ? 'color-mix(in srgb, var(--viz-chosen) 15%, var(--surface-3))'
                    : 'var(--surface-3)'
              }
              stroke={c.cur ? 'var(--viz-current)' : chosen ? 'var(--viz-chosen)' : 'var(--border-strong)'}
              strokeWidth="1.6"
            />
            <text x={bw / 2} y="22" textAnchor="middle" fontSize="13" className="mono" fill="var(--text-2)">
              {c.lab}
            </text>
            <text x={bw / 2} y="43" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
              {c.dp === null ? 'dp = ?' : `dp = ${c.dp}`}
            </text>
          </g>
        )
      })}
      {/* 结论条 */}
      <g transform="translate(180,188)">
        <rect
          width="260"
          height="28"
          rx="10"
          fill="color-mix(in srgb, var(--accent-1) 14%, var(--surface-2))"
          stroke="var(--accent-2)"
          strokeWidth="1.4"
        />
        <text x="130" y="19" textAnchor="middle" fontSize="13" className="mono" fill="var(--text-1)">
          dp(9) = max(2,3,3) + 1 = 4
        </text>
      </g>
    </svg>
  )
}

// O(n log n) tails 维护图解：追加（比末尾大）vs 替换（二分命中位）两种动作对比。
export function PatienceFigure() {
  const panel = (
    dx: number,
    title: string,
    tone: 'append' | 'replace',
    tails: number[],
    x: number,
    hitIdx: number,
  ) => {
    const bw = 42
    const gap = 8
    const accent = tone === 'append' ? 'var(--viz-chosen)' : 'var(--viz-current)'
    return (
      <g key={tone} transform={`translate(${dx},0)`}>
        <text x="0" y="16" fontSize="12.5" fontWeight="600" fill={accent}>
          {title}
        </text>
        {/* 当前元素 */}
        <g transform="translate(0,30)">
          <rect width="46" height="34" rx="9" fill="var(--grad-accent)" />
          <text x="23" y="23" textAnchor="middle" fontSize="15" className="mono" fill="var(--text-on-accent)">
            {x}
          </text>
        </g>
        <text x="60" y="52" fontSize="11.5" fill="var(--text-3)">
          当前数
        </text>
        {/* tails 行 */}
        <g transform="translate(0,84)">
          {tails.map((t, k) => {
            const hit = k === hitIdx
            return (
              <g key={k} transform={`translate(${k * (bw + gap)},0)`}>
                <rect
                  width={bw}
                  height={bw}
                  rx="9"
                  fill={hit ? `color-mix(in srgb, ${accent} 24%, var(--surface-3))` : 'color-mix(in srgb, var(--accent-1) 20%, var(--surface-3))'}
                  stroke={hit ? accent : 'var(--border-strong)'}
                  strokeWidth={hit ? '2' : '1.4'}
                />
                <text x={bw / 2} y={bw / 2 + 6} textAnchor="middle" fontSize="16" className="mono" fill="var(--text-1)">
                  {t}
                </text>
              </g>
            )
          })}
          {tone === 'append' && (
            <g transform={`translate(${tails.length * (bw + gap)},0)`}>
              <rect width={bw} height={bw} rx="9" fill="var(--surface-2)" stroke={accent} strokeWidth="2" strokeDasharray="4 3" />
              <text x={bw / 2} y={bw / 2 + 6} textAnchor="middle" fontSize="16" className="mono" fill={accent}>
                {x}
              </text>
            </g>
          )}
        </g>
        <text x="0" y="152" fontSize="11.5" fill="var(--text-2)">
          {tone === 'append' ? '比末尾大 → 追加，长度 +1' : '二分命中 → 替换，长度不变'}
        </text>
      </g>
    )
  }
  return (
    <svg viewBox="0 0 620 172" role="img" aria-label="tails 维护的两种动作：追加与替换">
      {panel(10, '① 追加（x 比 tails 末尾大）', 'append', [1, 3, 4], 8, -1)}
      {panel(330, '② 替换（二分找第一个 ≥ x）', 'replace', [1, 3, 6], 4, 2)}
    </svg>
  )
}
