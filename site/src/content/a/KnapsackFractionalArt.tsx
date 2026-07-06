// 分数背包（辨析课）讲解用插图（on-brand SVG，随强调色变色）。
// 不做 opacity:0 起步动画；强调色上的文字用 var(--text-on-accent)。

// 图一：可分割物品（金粉 / 牛奶）——一整袋可以只舀出一部分。
export function DivisibleFigure() {
  return (
    <svg viewBox="0 0 620 176" role="img" aria-label="可分割物品：一整袋金粉可以只取一部分">
      <defs>
        <marker id="kf-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
        <pattern id="kf-hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--accent-2)" strokeWidth="2.4" opacity="0.55" />
        </pattern>
      </defs>

      {/* 整件（01：只能整袋拿） */}
      <g transform="translate(20,26)">
        <rect width="150" height="118" rx="14" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="75" y="26" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">整件物品（01）</text>
        {/* 一块金条 */}
        <rect x="34" y="42" width="82" height="34" rx="7" fill="color-mix(in srgb, var(--accent-1) 55%, var(--surface-1))" stroke="var(--accent-2)" strokeWidth="1.5" />
        <text x="75" y="98" textAnchor="middle" fontSize="12" fill="var(--text-3)">要么整块拿，要么留下</text>
      </g>

      <text x="245" y="70" textAnchor="middle" fontSize="20" fill="var(--text-3)">vs</text>

      {/* 可分割（金粉 / 牛奶：可舀一部分） */}
      <g transform="translate(300,26)">
        <rect width="220" height="118" rx="14" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="110" y="26" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">可分割物品（金粉 / 牛奶）</text>
        {/* 一整袋 */}
        <g transform="translate(24,40)">
          <rect width="72" height="52" rx="8" fill="color-mix(in srgb, var(--accent-1) 34%, var(--surface-1))" stroke="var(--accent-2)" strokeWidth="1.5" />
          <text x="36" y="72" textAnchor="middle" fontSize="11.5" fill="var(--text-3)">一整袋</text>
        </g>
        <path d="M108 66 H140" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#kf-ar)" />
        {/* 舀出的一部分（斜纹＝只取一部分） */}
        <g transform="translate(150,40)">
          <rect width="46" height="52" rx="8" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.2" />
          <rect y="26" width="46" height="26" rx="0" fill="url(#kf-hatch)" />
          <rect width="46" height="52" rx="8" fill="none" stroke="var(--accent-2)" strokeWidth="1.5" />
          <text x="23" y="72" textAnchor="middle" fontSize="11.5" fill="var(--accent-1)">舀 0.5 袋</text>
        </g>
      </g>
    </svg>
  )
}

// 图二：贪心装填 —— 按单位价值 v/w 降序把整段填进容量条，最后一件按剩余比例切开（斜纹）。
// 对应正文小例子：items (2,3)(3,4)(4,5)、C=8 → 装满 (2,3)、(3,4)，再切 (4,5) 取 3/4。
export function GreedyFillFigure() {
  const C = 8
  const x0 = 34
  const barY = 58
  const barH = 46
  const barW = 520 // 8 单位 → 每单位 65px
  const u = barW / C
  // 已排序（v/w 降序）：满段 + 一个被切开的尾段
  const full = [
    { w: 2, v: 3, label: 'w=2 · v=3' },
    { w: 3, v: 4, label: 'w=3 · v=4' },
  ]
  const cut = { w: 4, v: 5, taken: 3, label: 'w=4 · 取 3/4' } // 剩余 3 格
  let acc = 0
  return (
    <svg viewBox="0 0 590 168" role="img" aria-label="贪心按单位价值降序装填容量条，最后一件切开填满">
      <defs>
        <pattern id="kf-hatch2" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="color-mix(in srgb, var(--accent-1) 22%, var(--surface-1))" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--accent-2)" strokeWidth="2.4" opacity="0.85" />
        </pattern>
      </defs>

      <text x={x0} y="30" fontSize="12.5" fill="var(--text-2)">
        容量条（C = 8）· 按 v/w 从高到低填
      </text>

      {/* 容量条外框 */}
      <rect x={x0} y={barY} width={barW} height={barH} rx="10" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />

      {/* 刻度 */}
      {Array.from({ length: C + 1 }, (_, k) => (
        <g key={`t${k}`}>
          <line x1={x0 + k * u} y1={barY + barH} x2={x0 + k * u} y2={barY + barH + 6} stroke="var(--border-strong)" strokeWidth="1" />
          <text x={x0 + k * u} y={barY + barH + 20} textAnchor="middle" fontSize="10.5" className="mono" fill="var(--text-3)">
            {k}
          </text>
        </g>
      ))}

      {/* 满段 */}
      {full.map((it, i) => {
        const segX = x0 + acc * u
        const segW = it.w * u
        acc += it.w
        return (
          <g key={`s${i}`}>
            <rect x={segX + 2} y={barY + 3} width={segW - 4} height={barH - 6} rx="6" fill="color-mix(in srgb, var(--accent-1) 42%, var(--surface-1))" stroke="var(--accent-2)" strokeWidth="1.3" />
            <text x={segX + segW / 2} y={barY + barH / 2 + 5} textAnchor="middle" fontSize="12" className="mono" fill="var(--text-on-accent)">
              {it.label}
            </text>
          </g>
        )
      })}

      {/* 被切开的尾段（斜纹＝只取一部分） */}
      {(() => {
        const segX = x0 + acc * u
        const segW = cut.taken * u
        return (
          <g>
            <rect x={segX + 2} y={barY + 3} width={segW - 4} height={barH - 6} rx="6" fill="url(#kf-hatch2)" stroke="var(--accent-2)" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x={segX + segW / 2} y={barY + barH / 2 + 5} textAnchor="middle" fontSize="11.5" className="mono" fill="var(--accent-1)">
              {cut.label}
            </text>
          </g>
        )
      })()}

      {/* 总价值 */}
      <text x={x0} y={barY + barH + 44} fontSize="13" fill="var(--text-2)">
        贪心总价值 = 3 + 4 + 5 ×
        <tspan className="mono" fill="var(--accent-1)"> 3/4 </tspan>
        =
        <tspan className="mono" fontWeight="700" fill="var(--accent-1)"> 10.75</tspan>
      </text>
    </svg>
  )
}

// 图三：交换论证 —— 若某一格容量给了低 v/w 的物品、而高 v/w 的还没装满，
// 把这一格换成高 v/w 的，总价值只增不减（换前 vs 换后两条背包条 + 「交换 ⇒ 更优」箭头）。
export function ExchangeFigure() {
  // 两条容量条各 6 格。低 v/w=1.0（每格价值 1），高 v/w=2.0（每格价值 2）。
  const C = 6
  const x0 = 150
  const barH = 40
  const barW = 396 // 6 格 → 每格 66px
  const u = barW / C
  const yBefore = 40
  const yAfter = 118
  // 换前：前 4 格高 v/w（已装但未满），第 5 格错给了低 v/w，第 6 格空
  const before = [
    { from: 0, len: 4, kind: 'hi' as const },
    { from: 4, len: 1, kind: 'lo' as const },
  ]
  // 换后：把那 1 格也换成高 v/w，高 v/w 装满到 5 格
  const after = [{ from: 0, len: 5, kind: 'hi' as const }]
  const fillFor = (k: 'hi' | 'lo') =>
    k === 'hi'
      ? 'color-mix(in srgb, var(--accent-1) 46%, var(--surface-1))'
      : 'color-mix(in srgb, var(--surface-3) 70%, var(--accent-2))'
  const seg = (
    row: { from: number; len: number; kind: 'hi' | 'lo' },
    y: number,
    key: string,
  ) => (
    <g key={key}>
      <rect
        x={x0 + row.from * u + 2}
        y={y + 3}
        width={row.len * u - 4}
        height={barH - 6}
        rx="6"
        fill={fillFor(row.kind)}
        stroke="var(--accent-2)"
        strokeWidth="1.3"
        strokeDasharray={row.kind === 'lo' ? '4 3' : undefined}
      />
      <text
        x={x0 + row.from * u + (row.len * u) / 2}
        y={y + barH / 2 + 5}
        textAnchor="middle"
        fontSize="11.5"
        className="mono"
        fill={row.kind === 'hi' ? 'var(--text-on-accent)' : 'var(--accent-1)'}
      >
        {row.kind === 'hi' ? 'v/w=2' : 'v/w=1'}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 590 196" role="img" aria-label="交换论证：把低性价比那一格换成高性价比，总价值只增不减">
      <defs>
        <marker id="kf-ex-ar" markerWidth="9" markerHeight="9" refX="6.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>

      {/* 换前 */}
      <text x="20" y={yBefore + barH / 2 - 6} fontSize="12.5" fontWeight="600" fill="var(--text-2)">
        换前
      </text>
      <text x="20" y={yBefore + barH / 2 + 12} fontSize="11" fill="var(--text-3)">
        价值 9
      </text>
      <rect x={x0} y={yBefore} width={barW} height={barH} rx="8" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
      {before.map((r, i) => seg(r, yBefore, `b${i}`))}
      <text x={x0 + 5.5 * u} y={yBefore + barH / 2 + 5} textAnchor="middle" fontSize="11" fill="var(--text-3)">
        空
      </text>

      {/* 交换箭头 + 说明 */}
      <path d={`M ${x0 + barW / 2} ${yBefore + barH + 4} V ${yAfter - 4}`} stroke="var(--accent-2)" strokeWidth="2" markerEnd="url(#kf-ex-ar)" fill="none" />
      <text x={x0 + barW / 2 + 12} y={(yBefore + barH + yAfter) / 2 + 4} fontSize="12" fill="var(--accent-1)" fontWeight="600">
        这一格换成 v/w=2 ⇒ 更优
      </text>

      {/* 换后 */}
      <text x="20" y={yAfter + barH / 2 - 6} fontSize="12.5" fontWeight="600" fill="var(--text-2)">
        换后
      </text>
      <text x="20" y={yAfter + barH / 2 + 12} fontSize="11" fill="var(--accent-1)">
        价值 10
      </text>
      <rect x={x0} y={yAfter} width={barW} height={barH} rx="8" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
      {after.map((r, i) => seg(r, yAfter, `a${i}`))}
      <text x={x0 + 5.5 * u} y={yAfter + barH / 2 + 5} textAnchor="middle" fontSize="11" fill="var(--text-3)">
        空
      </text>
    </svg>
  )
}
