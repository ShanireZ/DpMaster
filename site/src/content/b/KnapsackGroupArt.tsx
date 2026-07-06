// 分组背包讲解用的插图（on-brand SVG，随强调色变色）

// 引入图：物品被划成若干组，每组内至多挑一件（组内互斥）。
export function GroupSetupFigure() {
  const groups = [
    { name: '组 1', items: [{ w: 2, v: 3 }, { w: 3, v: 4 }] },
    { name: '组 2', items: [{ w: 2, v: 2 }, { w: 4, v: 5 }] },
  ]
  const gw = 200
  return (
    <svg viewBox="0 0 640 196" role="img" aria-label="物品被分成若干组，每组至多选一件">
      {groups.map((grp, gi) => (
        <g key={gi} transform={`translate(${20 + gi * (gw + 24)},22)`}>
          <rect
            width={gw}
            height="152"
            rx="16"
            fill="color-mix(in srgb, var(--accent-1) 5%, var(--surface-2))"
            stroke="var(--border-strong)"
            strokeWidth="1.5"
          />
          <g transform="translate(14,-11)">
            <rect width="56" height="22" rx="11" fill="var(--grad-accent)" />
            <text x="28" y="15" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text-on-accent)">
              {grp.name}
            </text>
          </g>
          {grp.items.map((it, ii) => (
            <g key={ii} transform={`translate(${18 + ii * 92},26)`}>
              <rect width="76" height="94" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
              <text x="38" y="26" textAnchor="middle" fontSize="12" fill="var(--text-2)">
                第 {ii + 1} 件
              </text>
              <text x="38" y="52" textAnchor="middle" fontSize="14.5" className="mono" fill="var(--text-1)">
                w={it.w}
              </text>
              <text x="38" y="76" textAnchor="middle" fontSize="14.5" className="mono" fill="var(--accent-1)">
                v={it.v}
              </text>
            </g>
          ))}
          <text x={gw / 2} y="146" textAnchor="middle" fontSize="11.5" fill="var(--text-3)">
            组内至多挑 1 件
          </text>
        </g>
      ))}
    </svg>
  )
}

// 转移决策图：f[g][j] 两条路——跳过本组(继承上一行)，或选组内某一件(枚举取 max)。
export function GroupTransitionFigure() {
  return (
    <svg viewBox="0 0 640 300" role="img" aria-label="分组背包一格 f[g][j] 的两条转移路径">
      <defs>
        <marker id="kg-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      <g transform="translate(250,8)">
        <rect width="140" height="48" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="70" y="21" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">第 g 组 · 容量 j</text>
        <text x="70" y="39" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">f[g][j] = ?</text>
      </g>
      <path d="M300 56 L150 96" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#kg-ar)" />
      <path d="M340 56 L494 96" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#kg-ar)" />
      <text x="188" y="82" fontSize="12.5" fill="var(--text-2)">不选本组</text>
      <text x="408" y="82" fontSize="12.5" fill="var(--text-2)">选组内某一件</text>
      <g transform="translate(30,100)">
        <rect width="226" height="60" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="113" y="26" textAnchor="middle" fontSize="13" fill="var(--text-1)">本组一件都不拿</text>
        <text x="113" y="47" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">= f[g−1][j]</text>
      </g>
      <g transform="translate(384,100)">
        <rect width="234" height="60" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="117" y="26" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">枚举组内第 k 件，取 max</text>
        <text x="117" y="47" textAnchor="middle" fontSize="13.5" className="mono" fill="var(--text-1)">= f[g−1][j−wₖ] + vₖ</text>
      </g>
      <path d="M150 160 L300 216" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#kg-ar)" />
      <path d="M500 160 L340 216" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#kg-ar)" />
      <g transform="translate(200,218)">
        <rect
          width="240"
          height="54"
          rx="14"
          fill="color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))"
          stroke="var(--accent-2)"
          strokeWidth="1.5"
        />
        <text x="120" y="32" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">取较大者 = max(两者)</text>
      </g>
      <text x="320" y="292" textAnchor="middle" fontSize="11.5" fill="var(--text-3)">
        两条路都只回看上一行 f[g−1][·]——所以本组至多贡献一件
      </text>
    </svg>
  )
}

// 循环顺序图：容量 j 在外(✓ 每组至多一件) vs 组内物品在外(✗ 一组可多选，退化)。
export function GroupLoopOrderFigure() {
  const panel = (
    dx: number,
    ok: boolean,
    title: string,
    outer: string,
    inner: string,
    note: string,
  ) => {
    const col = ok ? 'var(--viz-chosen)' : 'var(--viz-invalid)'
    return (
      <g transform={`translate(${dx},0)`}>
        <text x="0" y="16" fontSize="13" fontWeight="700" fill={col}>
          {ok ? '✓ ' : '✗ '}
          {title}
        </text>
        <g transform="translate(0,26)">
          <rect
            width="270"
            height="128"
            rx="12"
            fill={ok ? 'color-mix(in srgb, var(--viz-chosen) 8%, var(--surface-2))' : 'color-mix(in srgb, var(--viz-invalid) 8%, var(--surface-2))'}
            stroke={col}
            strokeWidth="1.5"
          />
          <text x="18" y="30" fontSize="12.5" className="mono" fill="var(--text-2)">
            for 组 g:
          </text>
          <text x="34" y="54" fontSize="12.5" className="mono" fill={ok ? 'var(--accent-1)' : 'var(--text-2)'}>
            {outer}
          </text>
          <text x="50" y="78" fontSize="12.5" className="mono" fill={ok ? 'var(--text-2)' : 'var(--accent-1)'}>
            {inner}
          </text>
          <text x="66" y="102" fontSize="12" className="mono" fill="var(--text-1)">
            f[j]=max(f[j],f[j−w]+v)
          </text>
        </g>
        <text x="135" y="176" textAnchor="middle" fontSize="11.5" fill={col}>
          {note}
        </text>
      </g>
    )
  }
  return (
    <svg viewBox="0 0 600 192" role="img" aria-label="分组背包容量循环放外层与放内层的对照">
      {panel(6, true, '容量在组内物品之外', 'for j = m…w:  (倒序)', 'for 组内每件 (w,v):', '一组内各件都基于旧值 → 至多选 1 件')}
      {panel(316, false, '容量在组内物品之内', 'for 组内每件 (w,v):', 'for j = m…w:  (倒序)', '前一件已更新 f → 同组可再选 → 退化')}
    </svg>
  )
}
