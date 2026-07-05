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

// 逆推 vs 正推：同一件物品 (w=2,v=3)、容量 6 的两行结果对比。
// 逆推每格恒 3（只装 1 件）；正推 f[0]→f[2]→f[4]→f[6] 链式 +3 滚到 9（同一件被装 3 次）。
export function ForwardBugFigure() {
  const cols = [
    { j: 0, rev: 0, fwd: 0 },
    { j: 2, rev: 3, fwd: 3 },
    { j: 4, rev: 3, fwd: 6 },
    { j: 6, rev: 3, fwd: 9 },
  ]
  const x0 = 150
  const dx = 112
  const cw = 64
  const ch = 42
  const cx = (i: number) => x0 + i * dx
  return (
    <svg viewBox="0 0 605 185" role="img" aria-label="同一件物品在逆推与正推下的结果对比">
      <defs>
        <marker id="fb-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-invalid)" />
        </marker>
      </defs>
      {cols.map((c, i) => (
        <text key={`h${i}`} x={cx(i) + cw / 2} y="16" textAnchor="middle" fontSize="12" className="mono" fill="var(--text-3)">
          j={c.j}
        </text>
      ))}
      <text x="20" y="60" fontSize="13" fontWeight="600" fill="var(--viz-chosen)">逆推 ✓</text>
      <text x="20" y="147" fontSize="13" fontWeight="600" fill="var(--viz-invalid)">正推 ✗</text>
      {cols.map((c, i) => (
        <g key={`r${i}`} transform={`translate(${cx(i)},34)`}>
          <rect width={cw} height={ch} rx="10" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <text x={cw / 2} y={ch / 2 + 6} textAnchor="middle" fontSize="17" className="mono" fill="var(--text-1)">
            {c.rev}
          </text>
        </g>
      ))}
      {cols.map((c, i) => {
        const bad = i > 1
        return (
          <g key={`f${i}`} transform={`translate(${cx(i)},121)`}>
            <rect
              width={cw}
              height={ch}
              rx="10"
              fill={bad ? 'color-mix(in srgb, var(--viz-invalid) 15%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={bad ? 'var(--viz-invalid)' : 'var(--border-strong)'}
              strokeWidth="1.5"
            />
            <text x={cw / 2} y={ch / 2 + 6} textAnchor="middle" fontSize="17" className="mono" fill={bad ? 'var(--viz-invalid)' : 'var(--text-1)'}>
              {c.fwd}
            </text>
          </g>
        )
      })}
      {[0, 1, 2].map((i) => (
        <g key={`a${i}`}>
          <path d={`M ${cx(i) + cw} 142 H ${cx(i + 1) - 2}`} stroke="var(--viz-invalid)" strokeWidth="2" markerEnd="url(#fb-ar)" fill="none" />
          <text x={(cx(i) + cw + cx(i + 1)) / 2} y="134" textAnchor="middle" fontSize="11" fill="var(--viz-invalid)">
            +3
          </text>
        </g>
      ))}
    </svg>
  )
}

// 完全背包场景：每种物品带 ×∞ 徽标，可无限次取用。
export function CompleteSetupFigure() {
  const items = [
    { w: 2, v: 3 },
    { w: 3, v: 5 },
  ]
  return (
    <svg viewBox="0 0 600 168" role="img" aria-label="每种物品可无限次取用的完全背包场景">
      <defs>
        <marker id="kc-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      {items.map((it, i) => (
        <g key={i} transform={`translate(${24 + i * 118},30)`}>
          <rect width="98" height="104" rx="14" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <g transform="translate(60,-10)">
            <rect width="46" height="22" rx="11" fill="color-mix(in srgb, var(--accent-1) 20%, var(--surface-2))" stroke="var(--accent-2)" strokeWidth="1.2" />
            <text x="23" y="15" textAnchor="middle" fontSize="12" className="mono" fill="var(--accent-1)">×∞</text>
          </g>
          <text x="49" y="30" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">物品 {i + 1}</text>
          <text x="49" y="60" textAnchor="middle" fontSize="15" className="mono" fill="var(--text-1)">w={it.w}</text>
          <text x="49" y="84" textAnchor="middle" fontSize="15" className="mono" fill="var(--accent-1)">v={it.v}</text>
        </g>
      ))}
      <path d="M280 82 H344" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#kc-ar)" />
      <g transform="translate(372,28)">
        <path
          d="M28 30 Q28 10 50 10 H150 Q172 10 172 30 L188 114 Q188 124 176 124 H24 Q12 124 12 114 Z"
          fill="color-mix(in srgb, var(--accent-1) 8%, var(--surface-3))"
          stroke="var(--accent-2)"
          strokeWidth="2.5"
        />
        <path d="M72 10 Q72 -8 100 -8 Q128 -8 128 10" fill="none" stroke="var(--accent-2)" strokeWidth="2.5" />
        <text x="100" y="60" textAnchor="middle" fontSize="14" fill="var(--text-1)">背包</text>
        <text x="100" y="86" textAnchor="middle" fontSize="15" className="mono" fill="var(--accent-1)">容量 m=9</text>
      </g>
    </svg>
  )
}
