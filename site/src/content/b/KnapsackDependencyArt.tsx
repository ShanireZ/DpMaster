// 有依赖的背包讲解用插图（on-brand SVG，随强调色变色）。

// 引入图：1 个主件 + 2 个附件，附件用虚线「依赖」箭头挂在主件下——不选主件，附件就非法。
export function DepSetupFigure() {
  return (
    <svg viewBox="0 0 640 232" role="img" aria-label="一个主件与两个附件，附件依赖主件">
      <defs>
        <marker id="dep-dep" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>
      {/* 主件 */}
      <g transform="translate(258,14)">
        <rect
          width="124"
          height="76"
          rx="14"
          fill="color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))"
          stroke="var(--accent-2)"
          strokeWidth="2.5"
        />
        <text x="62" y="24" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--accent-1)">
          主件
        </text>
        <text x="62" y="48" textAnchor="middle" fontSize="14.5" className="mono" fill="var(--text-1)">
          w=2
        </text>
        <text x="62" y="67" textAnchor="middle" fontSize="14.5" className="mono" fill="var(--accent-1)">
          v=3
        </text>
      </g>
      {/* 依赖箭头：从附件指向主件 */}
      <path d="M150 150 Q150 108 300 96" fill="none" stroke="var(--accent-2)" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#dep-dep)" />
      <path d="M492 150 Q492 108 342 96" fill="none" stroke="var(--accent-2)" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#dep-dep)" />
      {/* 附件 1 / 2 */}
      {[
        { x: 92, name: '附件 1', w: 2, v: 4 },
        { x: 432, name: '附件 2', w: 3, v: 5 },
      ].map((it, i) => (
        <g key={i} transform={`translate(${it.x},150)`}>
          <rect width="116" height="70" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <text x="58" y="22" textAnchor="middle" fontSize="12" fill="var(--text-2)">
            {it.name}
          </text>
          <text x="58" y="45" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
            w={it.w}
          </text>
          <text x="58" y="62" textAnchor="middle" fontSize="14" className="mono" fill="var(--accent-1)">
            v={it.v}
          </text>
        </g>
      ))}
      <text x="320" y="120" textAnchor="middle" fontSize="11.5" fill="var(--text-3)">
        虚线 = 依赖：选附件，必先选它指向的主件
      </text>
    </svg>
  )
}

// 归约图：把「主 + 附件子集」枚举成 4 个组合，四者归为同一组（组内至多选一个）。
export function DepReduceFigure() {
  const combos = [
    { label: '仅主', w: 2, v: 3 },
    { label: '主+附1', w: 4, v: 7 },
    { label: '主+附2', w: 5, v: 8 },
    { label: '主+附1+2', w: 7, v: 12 },
  ]
  const cw = 138
  const gap = 12
  const x0 = 20
  return (
    <svg viewBox="0 0 640 176" role="img" aria-label="把主件与附件子集枚举成四个组合，归为同一组">
      {/* 外框：同一组 */}
      <rect
        x="8"
        y="30"
        width="624"
        height="118"
        rx="16"
        fill="color-mix(in srgb, var(--accent-1) 5%, var(--surface-2))"
        stroke="var(--border-strong)"
        strokeWidth="1.5"
      />
      <g transform="translate(20,19)">
        <rect width="188" height="22" rx="11" fill="var(--grad-accent)" />
        <text x="94" y="15" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text-on-accent)">
          同一组 · 至多选一个组合
        </text>
      </g>
      {combos.map((c, i) => (
        <g key={i} transform={`translate(${x0 + i * (cw + gap)},52)`}>
          <rect width={cw} height="84" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <text x={cw / 2} y="26" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--accent-1)">
            {c.label}
          </text>
          <text x={cw / 2} y="50" textAnchor="middle" fontSize="13.5" className="mono" fill="var(--text-1)">
            费用 {c.w}
          </text>
          <text x={cw / 2} y="70" textAnchor="middle" fontSize="13.5" className="mono" fill="var(--accent-1)">
            价值 {c.v}
          </text>
        </g>
      ))}
    </svg>
  )
}

// 转移图：落到分组背包——f[j] 两条路：不选本组(继承)，或选组内某个组合(枚举取 max)。
export function DepTransitionFigure() {
  return (
    <svg viewBox="0 0 640 300" role="img" aria-label="有依赖的背包落到分组背包的一格转移">
      <defs>
        <marker id="dep-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      <g transform="translate(248,8)">
        <rect width="144" height="48" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="72" y="21" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">这一组 · 容量 j</text>
        <text x="72" y="39" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">f[j] = ?</text>
      </g>
      <path d="M300 56 L150 96" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#dep-ar)" />
      <path d="M340 56 L494 96" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#dep-ar)" />
      <text x="184" y="82" fontSize="12.5" fill="var(--text-2)">不选本组</text>
      <text x="400" y="82" fontSize="12.5" fill="var(--text-2)">选组内某个组合</text>
      <g transform="translate(28,100)">
        <rect width="228" height="60" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="114" y="26" textAnchor="middle" fontSize="13" fill="var(--text-1)">这个主件一带都不要</text>
        <text x="114" y="47" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">= f_old[j]</text>
      </g>
      <g transform="translate(384,100)">
        <rect width="236" height="60" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="118" y="26" textAnchor="middle" fontSize="12" fill="var(--text-1)">枚举组合 c，取 max</text>
        <text x="118" y="47" textAnchor="middle" fontSize="13" className="mono" fill="var(--text-1)">= f_old[j−w_c] + v_c</text>
      </g>
      <path d="M150 160 L300 216" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#dep-ar)" />
      <path d="M500 160 L340 216" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#dep-ar)" />
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
        组内各组合都基于「本组未出手」的旧值 → 至多选一个组合 = 一个合法方案
      </text>
    </svg>
  )
}
