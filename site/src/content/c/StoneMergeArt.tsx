// 石子合併（區間 DP）講解用插圖（on-brand SVG，隨部分強調色變色）。

// 一排 4 堆石子，相鄰兩堆合併，代價 = 兩堆之和。
export function MergeSetupFigure() {
  const piles = [7, 6, 5, 4]
  const x0 = 40
  const dx = 92
  const bw = 66
  return (
    <svg viewBox="0 0 560 176" role="img" aria-label="一排石子，相邻两堆合并">
      <defs>
        <marker id="sm-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>
      {piles.map((p, i) => (
        <g key={i} transform={`translate(${x0 + i * dx},30)`}>
          <rect
            width={bw}
            height="70"
            rx="12"
            fill={i === 1 || i === 2 ? 'color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))' : 'var(--surface-3)'}
            stroke={i === 1 || i === 2 ? 'var(--accent-2)' : 'var(--border-strong)'}
            strokeWidth={i === 1 || i === 2 ? 2.5 : 1.5}
          />
          <text x={bw / 2} y="30" textAnchor="middle" fontSize="12" fill="var(--text-2)">
            第 {i} 堆
          </text>
          <text x={bw / 2} y="54" textAnchor="middle" fontSize="18" className="mono" fill="var(--accent-1)">
            {p}
          </text>
        </g>
      ))}
      {/* 合併第 1、2 堆：花括號 + 代價標註 */}
      <path
        d={`M ${x0 + dx} 108 Q ${x0 + dx} 120 ${x0 + dx + 12} 120 L ${x0 + 2 * dx + bw - 12} 120 Q ${x0 + 2 * dx + bw} 120 ${x0 + 2 * dx + bw} 108`}
        fill="none"
        stroke="var(--accent-2)"
        strokeWidth="2"
      />
      <path d={`M ${x0 + dx + bw + 6} 138 V 150`} stroke="var(--accent-2)" strokeWidth="2" markerEnd="url(#sm-ar)" />
      <text x={x0 + dx + bw / 2 + 6} y="170" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">
        合并 6+5，代价 <tspan className="mono" fill="var(--accent-1)">11</tspan>
      </text>
    </svg>
  )
}

// dp[l][r] 的決策分叉：在分割點 k 處斷開成 [l,k] 與 [k+1,r] 兩個已解子區間，再加區間和。
export function IntervalSplitFigure() {
  return (
    <svg viewBox="0 0 620 262" role="img" aria-label="区间在分割点 k 处断成两个子区间">
      <defs>
        <marker id="is-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      {/* 頂：整個區間 [l,r] */}
      <g transform="translate(210,8)">
        <rect width="200" height="46" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="100" y="20" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
          合并区间 [l, r]
        </text>
        <text x="100" y="38" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
          dp[l][r] = ?
        </text>
      </g>
      <text x="310" y="74" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
        枚举分割点 k：先合出左半，再合出右半
      </text>
      <path d="M280 84 L180 118" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#is-ar)" />
      <path d="M340 84 L452 118" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#is-ar)" />
      {/* 左子區間 [l,k] */}
      <g transform="translate(52,120)">
        <rect
          width="224"
          height="58"
          rx="12"
          fill="color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))"
          stroke="var(--viz-chosen)"
          strokeWidth="1.5"
        />
        <text x="112" y="24" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">
          左半已合成一堆
        </text>
        <text x="112" y="45" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
          dp[l][k]
        </text>
      </g>
      {/* 右子區間 [k+1,r] */}
      <g transform="translate(344,120)">
        <rect
          width="224"
          height="58"
          rx="12"
          fill="color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))"
          stroke="var(--viz-chosen)"
          strokeWidth="1.5"
        />
        <text x="112" y="24" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">
          右半已合成一堆
        </text>
        <text x="112" y="45" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
          dp[k+1][r]
        </text>
      </g>
      <path d="M180 178 L300 214" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#is-ar)" />
      <path d="M456 178 L340 214" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#is-ar)" />
      {/* 底：合起來 + 區間和 */}
      <g transform="translate(150,216)">
        <rect
          width="320"
          height="44"
          rx="14"
          fill="color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))"
          stroke="var(--accent-2)"
          strokeWidth="1.5"
        />
        <text x="160" y="28" textAnchor="middle" fontSize="13.5" className="mono" fill="var(--text-1)">
          dp[l][k] + dp[k+1][r] + sum(l..r)
        </text>
      </g>
    </svg>
  )
}

// 三角表按區間長度（對角線）填：長度 1 在主對角線，長度越大越靠右上。
export function LengthOrderFigure() {
  const n = 4
  const CELL = 46
  const ox = 60
  const oy = 30
  // 每格所屬「長度層」= r - l + 1；用不同底色區分層，箭頭示意由短到長。
  const lenColor = (len: number) => {
    if (len === 1) return { fill: 'var(--surface-3)', stroke: 'var(--border-strong)' }
    const pct = [0, 10, 16, 24][len - 1]
    return {
      fill: `color-mix(in srgb, var(--accent-1) ${pct}%, var(--surface-3))`,
      stroke: 'var(--accent-2)',
    }
  }
  return (
    <svg viewBox="0 0 470 250" role="img" aria-label="三角表按区间长度由对角线向右上填充">
      <defs>
        <marker id="lo-ar" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>
      {/* 列頭 r、行頭 l */}
      {Array.from({ length: n }, (_, c) => (
        <text key={`c${c}`} x={ox + c * CELL + CELL / 2} y={oy - 8} textAnchor="middle" fontSize="12" className="mono" fill="var(--accent-2)">
          r={c}
        </text>
      ))}
      {Array.from({ length: n }, (_, r) => (
        <text key={`r${r}`} x={ox - 12} y={oy + r * CELL + CELL / 2 + 4} textAnchor="middle" fontSize="12" className="mono" fill="var(--accent-2)">
          l={r}
        </text>
      ))}
      {Array.from({ length: n }, (_, l) =>
        Array.from({ length: n }, (_, r) => {
          const x = ox + r * CELL
          const y = oy + l * CELL
          if (r < l) {
            // 下三角：非法區間，空白
            return (
              <rect
                key={`${l}-${r}`}
                x={x + 3}
                y={y + 3}
                width={CELL - 6}
                height={CELL - 6}
                rx="8"
                fill="var(--surface-2)"
                opacity="0.4"
              />
            )
          }
          const len = r - l + 1
          const col = lenColor(len)
          return (
            <g key={`${l}-${r}`}>
              <rect x={x + 3} y={y + 3} width={CELL - 6} height={CELL - 6} rx="8" fill={col.fill} stroke={col.stroke} strokeWidth="1.5" />
              <text x={x + CELL / 2} y={y + CELL / 2 - 3} textAnchor="middle" fontSize="10.5" className="mono" fill="var(--text-3)">
                len{len}
              </text>
              <text x={x + CELL / 2} y={y + CELL / 2 + 12} textAnchor="middle" fontSize="10" className="mono" fill="var(--text-2)">
                [{l},{r}]
              </text>
            </g>
          )
        }),
      )}
      {/* 填充順序箭頭：對角線 → 右上 */}
      <path
        d={`M ${ox + CELL / 2} ${oy + (n - 1) * CELL + CELL / 2} L ${ox + (n - 1) * CELL + CELL / 2} ${oy + CELL / 2}`}
        fill="none"
        stroke="var(--accent-2)"
        strokeWidth="2"
        strokeDasharray="5 4"
        markerEnd="url(#lo-ar)"
      />
      <text x={ox + (n - 1) * CELL + 4} y={oy + (n - 1) * CELL - 4} fontSize="11.5" fill="var(--accent-1)">
        长度递增
      </text>
    </svg>
  )
}
