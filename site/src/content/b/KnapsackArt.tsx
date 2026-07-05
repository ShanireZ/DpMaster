// 01 背包讲解用的插图（on-brand SVG，随强调色变色）
export function SetupFigure() {
  const items = [
    { w: 2, v: 3 },
    { w: 3, v: 4 },
    { w: 4, v: 5 },
  ]
  return (
    <svg viewBox="0 0 640 170" role="img" aria-label="三件物品与一个背包">
      <defs>
        <marker id="ka-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      {items.map((it, i) => (
        <g key={i} transform={`translate(${16 + i * 92},34)`}>
          <rect width="80" height="100" rx="14" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <text x="40" y="28" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">物品 {i + 1}</text>
          <text x="40" y="57" textAnchor="middle" fontSize="15" className="mono" fill="var(--text-1)">w={it.w}</text>
          <text x="40" y="81" textAnchor="middle" fontSize="15" className="mono" fill="var(--accent-1)">v={it.v}</text>
        </g>
      ))}
      <path d="M300 84 H366" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#ka-ar)" />
      <g transform="translate(398,30)">
        <path
          d="M28 30 Q28 10 50 10 H150 Q172 10 172 30 L188 114 Q188 124 176 124 H24 Q12 124 12 114 Z"
          fill="color-mix(in srgb, var(--accent-1) 8%, var(--surface-3))"
          stroke="var(--accent-2)"
          strokeWidth="2.5"
        />
        <path d="M72 10 Q72 -8 100 -8 Q128 -8 128 10" fill="none" stroke="var(--accent-2)" strokeWidth="2.5" />
        <text x="100" y="62" textAnchor="middle" fontSize="14" fill="var(--text-1)">背包</text>
        <text x="100" y="88" textAnchor="middle" fontSize="15" className="mono" fill="var(--accent-1)">容量 m=8</text>
      </g>
    </svg>
  )
}

export function DecisionFigure() {
  return (
    <svg viewBox="0 0 640 288" role="img" aria-label="第 i 件取或不取的决策分叉">
      <defs>
        <marker id="ka-ar2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      <g transform="translate(250,8)">
        <rect width="140" height="48" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="70" y="21" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">第 i 件 · 容量 j</text>
        <text x="70" y="39" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">f[i][j] = ?</text>
      </g>
      <path d="M300 56 L150 98" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#ka-ar2)" />
      <path d="M340 56 L492 98" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#ka-ar2)" />
      <text x="196" y="84" fontSize="12.5" fill="var(--text-2)">不取</text>
      <text x="404" y="84" fontSize="12.5" fill="var(--text-2)">取（需 j ≥ w）</text>
      <g transform="translate(36,102)">
        <rect width="224" height="66" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="112" y="27" textAnchor="middle" fontSize="13" fill="var(--text-1)">第 i 件没参与</text>
        <text x="112" y="49" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">= f[i−1][j]</text>
      </g>
      <g transform="translate(380,102)">
        <rect width="244" height="66" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="122" y="27" textAnchor="middle" fontSize="13" fill="var(--text-1)">腾出 w，补上价值 v</text>
        <text x="122" y="49" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">= f[i−1][j−w] + v</text>
      </g>
      <path d="M150 168 L300 222" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#ka-ar2)" />
      <path d="M502 168 L340 222" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#ka-ar2)" />
      <g transform="translate(206,224)">
        <rect
          width="228"
          height="54"
          rx="14"
          fill="color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))"
          stroke="var(--accent-2)"
          strokeWidth="1.5"
        />
        <text x="114" y="32" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">取较大者 = max(两者)</text>
      </g>
    </svg>
  )
}
