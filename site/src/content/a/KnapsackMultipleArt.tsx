// 多重背包讲解用的插图（on-brand SVG，随强调色变色）

// 引入场景：每种物品带 ×m 徽标——不是 01 的「至多一件」，也不是完全的「无限件」，而是恰好 m 件。
export function MultipleSetupFigure() {
  const items = [
    { w: 2, v: 3, m: 3 },
    { w: 3, v: 5, m: 2 },
  ]
  return (
    <svg viewBox="0 0 600 172" role="img" aria-label="每种物品有限 m 件的多重背包场景">
      <defs>
        <marker id="km-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      {items.map((it, i) => (
        <g key={i} transform={`translate(${24 + i * 118},32)`}>
          <rect width="98" height="104" rx="14" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <g transform="translate(58,-10)">
            <rect width="50" height="22" rx="11" fill="color-mix(in srgb, var(--accent-1) 20%, var(--surface-2))" stroke="var(--accent-2)" strokeWidth="1.2" />
            <text x="25" y="15" textAnchor="middle" fontSize="12" className="mono" fill="var(--accent-1)">×{it.m}</text>
          </g>
          <text x="49" y="30" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">物品 {i + 1}</text>
          <text x="49" y="60" textAnchor="middle" fontSize="15" className="mono" fill="var(--text-1)">w={it.w}</text>
          <text x="49" y="84" textAnchor="middle" fontSize="15" className="mono" fill="var(--accent-1)">v={it.v}</text>
        </g>
      ))}
      <path d="M280 84 H344" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#km-ar)" />
      <g transform="translate(372,30)">
        <path
          d="M28 30 Q28 10 50 10 H150 Q172 10 172 30 L188 114 Q188 124 176 124 H24 Q12 124 12 114 Z"
          fill="color-mix(in srgb, var(--accent-1) 8%, var(--surface-3))"
          stroke="var(--accent-2)"
          strokeWidth="2.5"
        />
        <path d="M72 10 Q72 -8 100 -8 Q128 -8 128 10" fill="none" stroke="var(--accent-2)" strokeWidth="2.5" />
        <text x="100" y="60" textAnchor="middle" fontSize="14" fill="var(--text-1)">背包</text>
        <text x="100" y="86" textAnchor="middle" fontSize="15" className="mono" fill="var(--accent-1)">容量 m=10</text>
      </g>
    </svg>
  )
}

// 二进制拆分核心图：把 m=13 件拆成 1,2,4 三个 2 的幂 + 余数 6，共 4 个打包件。
// 下方标注：这 4 个包能凑出 0…13 的任意件数（1,2,4 凑 0…7，再加 6 平移覆盖到 13）。
export function BinarySplitFigure() {
  // 每个包：cnt 件、对应宽度按件数比例。1+2+4+6 = 13。
  const packs = [
    { label: '×1', cnt: 1 },
    { label: '×2', cnt: 2 },
    { label: '×4', cnt: 4 },
    { label: '×余6', cnt: 6, rest: true },
  ]
  const x0 = 24
  const unit = 40 // 每件原物的像素宽
  const gap = 10
  const y = 44
  const h = 46
  let cursor = x0
  const laid = packs.map((p) => {
    const width = p.cnt * unit
    const g = { ...p, x: cursor, width }
    cursor += width + gap
    return g
  })
  return (
    <svg viewBox="0 0 600 176" role="img" aria-label="件数上限 13 的二进制拆分">
      <text x="24" y="24" fontSize="13" fill="var(--text-2)">
        一种物品，件数上限 <tspan className="mono" fill="var(--text-1)">m=13</tspan> → 拆成 4 个「打包件」
      </text>
      {laid.map((p, i) => (
        <g key={i} transform={`translate(${p.x},${y})`}>
          <rect
            width={p.width}
            height={h}
            rx="10"
            fill={p.rest ? 'color-mix(in srgb, var(--accent-2) 14%, var(--surface-3))' : 'color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))'}
            stroke={p.rest ? 'var(--accent-2)' : 'var(--accent-1)'}
            strokeWidth="1.8"
          />
          <text x={p.width / 2} y={h / 2 - 2} textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
            {p.label}
          </text>
          <text x={p.width / 2} y={h / 2 + 15} textAnchor="middle" fontSize="10.5" fill="var(--text-3)">
            {p.cnt} 件
          </text>
        </g>
      ))}
      <text x="24" y="132" fontSize="12" fill="var(--text-2)">
        任选若干包相加，恰好能凑出
      </text>
      <g transform="translate(215,120)">
        <rect width="150" height="20" rx="10" fill="color-mix(in srgb, var(--viz-chosen) 15%, var(--surface-3))" stroke="var(--viz-chosen)" strokeWidth="1.4" />
        <text x="75" y="14" textAnchor="middle" fontSize="12" className="mono" fill="var(--text-1)">0, 1, 2, …, 13</text>
      </g>
      <text x="380" y="132" fontSize="12" fill="var(--text-2)">中任意件数</text>
      <text x="24" y="162" fontSize="11" fill="var(--text-3)">
        1+2+4 覆盖 0…7；再叠加余数 6，平移补齐 8…13。用 <tspan className="mono" fill="var(--accent-1)">⌈log⌉≈4</tspan> 个包代替 13 次枚举。
      </text>
    </svg>
  )
}

// 复杂度对比图：朴素枚举每件一根「格子」(Σm 根) vs 二进制打包 (Σlog 根)，直观看差距。
export function NaiveVsBinaryFigure() {
  // 两种物品 m=7、m=15：朴素 7+15=22 根；二进制 3+4=7 根。
  const naive = 22
  const binary = 7
  const bx = 150
  const bw = 12
  const gap = 4
  const rowY = (r: number) => 40 + r * 62
  const barH = 30
  const bar = (n: number, y: number, color: string) =>
    Array.from({ length: n }, (_, i) => (
      <rect key={i} x={bx + i * (bw + gap)} y={y} width={bw} height={barH} rx="3" fill={color} opacity={0.85} />
    ))
  return (
    <svg viewBox="0 0 600 150" role="img" aria-label="朴素枚举与二进制拆分的转移次数对比">
      <text x="20" y="24" fontSize="12" fill="var(--text-3)">
        两种物品：件数上限 <tspan className="mono" fill="var(--text-1)">7</tspan> 与 <tspan className="mono" fill="var(--text-1)">15</tspan>
      </text>
      <text x="20" y={rowY(0) + 20} fontSize="12.5" fontWeight="600" fill="var(--viz-invalid)">
        朴素
      </text>
      <text x="20" y={rowY(0) + 36} fontSize="11" className="mono" fill="var(--text-3)">
        Σm=22
      </text>
      {bar(naive, rowY(0), 'var(--viz-invalid)')}
      <text x="20" y={rowY(1) + 20} fontSize="12.5" fontWeight="600" fill="var(--viz-chosen)">
        二进制
      </text>
      <text x="20" y={rowY(1) + 36} fontSize="11" className="mono" fill="var(--text-3)">
        Σlog=7
      </text>
      {bar(binary, rowY(1), 'var(--viz-chosen)')}
      <text x={bx + naive * (bw + gap) + 8} y={rowY(0) + 20} fontSize="12" className="mono" fill="var(--viz-invalid)">
        22 次
      </text>
      <text x={bx + binary * (bw + gap) + 8} y={rowY(1) + 20} fontSize="12" className="mono" fill="var(--viz-chosen)">
        7 次
      </text>
    </svg>
  )
}
