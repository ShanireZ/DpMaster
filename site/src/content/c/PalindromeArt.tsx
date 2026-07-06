// 回文 / 括号区间 DP 讲解用插图（on-brand SVG，随部分强调色变色）。

// 一个串里的「最长回文子序列」：对称的字符两两配对，弧线勾出（不必相邻，只需镜像对称）。
export function PalindromeSetupFigure() {
  const s = ['c', 'h', 'a', 'r', 'a', 'c', 't']
  // 最长回文子序列 "carac"（下标 0,2,3,4,5）——两端向内成对：0↔5(c)、2↔4(a)、中心 3(r)。
  const pairs = [
    { a: 0, b: 5 },
    { a: 2, b: 4 },
  ]
  const center = 3
  const x0 = 44
  const dx = 68
  const bw = 48
  const cx = (i: number) => x0 + i * dx + bw / 2
  const picked = new Set([0, 2, 3, 4, 5])
  return (
    <svg viewBox="0 0 520 176" role="img" aria-label="串中最长回文子序列的对称配对">
      {pairs.map((p, i) => {
        const xa = cx(p.a)
        const xb = cx(p.b)
        const mid = (xa + xb) / 2
        const lift = 40 + i * 22
        return (
          <path
            key={i}
            d={`M ${xa} 96 Q ${mid} ${96 - lift} ${xb} 96`}
            fill="none"
            stroke="var(--viz-chosen)"
            strokeWidth="2"
          />
        )
      })}
      {s.map((c, i) => {
        const on = picked.has(i)
        return (
          <g key={i} transform={`translate(${x0 + i * dx},98)`}>
            <rect
              width={bw}
              height="52"
              rx="10"
              fill={on ? 'color-mix(in srgb, var(--viz-chosen) 16%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={on ? 'var(--viz-chosen)' : 'var(--border-strong)'}
              strokeWidth={on ? 2.2 : 1.5}
            />
            <text x={bw / 2} y="33" textAnchor="middle" fontSize="22" className="mono" fill={on ? 'var(--accent-1)' : 'var(--text-3)'}>
              {c}
            </text>
            <text x={bw / 2} y="70" textAnchor="middle" fontSize="11" className="mono" fill="var(--text-3)">
              {i}
            </text>
          </g>
        )
      })}
      <circle cx={cx(center)} cy="124" r="4" fill="var(--accent-2)" />
      <text x={cx(center)} y="16" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
        最长回文子序列 <tspan className="mono" fill="var(--accent-1)">c a r a c</tspan>（长 5）
      </text>
    </svg>
  )
}

// dp[i][j] 的两条转移：两端相等 → 收缩到左下 dp[i+1][j-1] 再 +2；不等 → 取下 / 左的较大者。
export function CollapseFigure() {
  return (
    <svg viewBox="0 0 640 300" role="img" aria-label="回文区间 DP 的两条转移分叉">
      <defs>
        <marker id="pc-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      {/* 顶：区间 [i,j] */}
      <g transform="translate(244,8)">
        <rect width="152" height="48" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="76" y="21" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">子串 s[i..j]</text>
        <text x="76" y="39" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">dp[i][j] = ?</text>
      </g>
      <path d="M296 56 L150 100" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#pc-ar)" />
      <path d="M344 56 L494 100" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#pc-ar)" />
      <text x="150" y="82" textAnchor="middle" fontSize="12.5" fill="var(--viz-chosen)">s[i] = s[j]（相等）</text>
      <text x="496" y="82" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">s[i] ≠ s[j]（不等）</text>
      {/* 左：相等收缩 */}
      <g transform="translate(30,104)">
        <rect
          width="248"
          height="72"
          rx="12"
          fill="color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))"
          stroke="var(--viz-chosen)"
          strokeWidth="1.5"
        />
        <text x="124" y="26" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">把这对同字符裹到内层两端</text>
        <text x="124" y="52" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">dp[i+1][j−1] + 2</text>
      </g>
      {/* 右：不等取大 */}
      <g transform="translate(372,104)">
        <rect width="240" height="72" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="120" y="26" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">至少丢一端，取较大者</text>
        <text x="120" y="52" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">max(dp[i+1][j], dp[i][j−1])</text>
      </g>
      {/* 三角表方位小注：左下 / 下 / 左 */}
      <g transform="translate(150,192)">
        <text x="0" y="0" textAnchor="middle" fontSize="11.5" fill="var(--viz-chosen)">来源在【左下】(内缩一圈)</text>
      </g>
      <g transform="translate(492,192)">
        <text x="0" y="0" textAnchor="middle" fontSize="11.5" fill="var(--text-3)">来源在【下 dp[i+1][j]】/【左 dp[i][j−1]】</text>
      </g>
      <path d="M150 204 L300 244" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#pc-ar)" />
      <path d="M492 204 L340 244" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#pc-ar)" />
      {/* 底：合流 */}
      <g transform="translate(206,246)">
        <rect
          width="228"
          height="46"
          rx="14"
          fill="color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))"
          stroke="var(--accent-2)"
          strokeWidth="1.5"
        />
        <text x="114" y="28" textAnchor="middle" fontSize="13.5" className="mono" fill="var(--text-1)">写入 dp[i][j]</text>
      </g>
    </svg>
  )
}

// 最少插入构回文：插入次数 = 串长 − 最长回文子序列；把非回文补成对称。
export function InsertFigure() {
  const src = ['a', 'b', 'c', 'd', 'a'] // "abcda"：最长回文子序列 aba/ada 长 3，需插入 2 → "abcdcba"
  // 结果 "abcdcba"：标出哪几个是新插入的（'c'、'b' 各补一次到左半镜像）。
  const out = [
    { c: 'a', ins: false },
    { c: 'b', ins: false },
    { c: 'c', ins: false },
    { c: 'd', ins: false },
    { c: 'c', ins: true },
    { c: 'b', ins: true },
    { c: 'a', ins: false },
  ]
  const bw = 40
  const gap = 8
  const rowW = (n: number) => n * bw + (n - 1) * gap
  const srcX = (520 - rowW(src.length)) / 2
  const outX = (520 - rowW(out.length)) / 2
  return (
    <svg viewBox="0 0 520 216" role="img" aria-label="最少插入把串补成回文">
      <defs>
        <marker id="pi-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>
      <text x="260" y="18" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
        原串 <tspan className="mono" fill="var(--text-1)">abcda</tspan>（不是回文）
      </text>
      {src.map((c, i) => (
        <g key={i} transform={`translate(${srcX + i * (bw + gap)},28)`}>
          <rect width={bw} height="42" rx="9" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <text x={bw / 2} y="28" textAnchor="middle" fontSize="19" className="mono" fill="var(--text-1)">
            {c}
          </text>
        </g>
      ))}
      <path d={`M 260 74 V 122`} stroke="var(--accent-2)" strokeWidth="2" markerEnd="url(#pi-ar)" />
      <text x="290" y="102" textAnchor="start" fontSize="12" fill="var(--accent-1)">
        插入 2 个 = 5 − 3
      </text>
      <text x="260" y="140" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
        补齐为回文 <tspan className="mono" fill="var(--viz-chosen)">abcdcba</tspan>
      </text>
      {out.map((o, i) => (
        <g key={i} transform={`translate(${outX + i * (bw + gap)},150)`}>
          <rect
            width={bw}
            height="42"
            rx="9"
            fill={o.ins ? 'color-mix(in srgb, var(--viz-source) 18%, var(--surface-3))' : 'color-mix(in srgb, var(--viz-chosen) 14%, var(--surface-3))'}
            stroke={o.ins ? 'var(--viz-source)' : 'var(--viz-chosen)'}
            strokeWidth={o.ins ? 2.2 : 1.5}
            strokeDasharray={o.ins ? '4 3' : undefined}
          />
          <text x={bw / 2} y="28" textAnchor="middle" fontSize="19" className="mono" fill={o.ins ? '#fff' : 'var(--accent-1)'}>
            {o.c}
          </text>
        </g>
      ))}
      <text x={outX + 4 * (bw + gap) + bw / 2} y="208" textAnchor="middle" fontSize="10.5" fill="var(--viz-source)">
        ↑ 新插入
      </text>
    </svg>
  )
}
