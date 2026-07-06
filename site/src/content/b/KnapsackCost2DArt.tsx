// 二维费用背包讲解用的插图（on-brand SVG，随强调色变色）

// 每件物品挂两个费用标签 (a=费用1, b=费用2) 与价值 v；背包有两条独立的容量约束。
export function Cost2DSetupFigure() {
  const items = [
    { a: 1, b: 2, v: 3 },
    { a: 2, b: 1, v: 4 },
  ]
  return (
    <svg viewBox="0 0 640 178" role="img" aria-label="两件带双重费用的物品与一个双约束背包">
      <defs>
        <marker id="c2-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      {items.map((it, i) => (
        <g key={i} transform={`translate(${20 + i * 116},26)`}>
          <rect width="98" height="118" rx="14" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <text x="49" y="24" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">物品 {i + 1}</text>
          <text x="49" y="50" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">a={it.a}</text>
          <text x="49" y="72" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-2)">b={it.b}</text>
          <text x="49" y="98" textAnchor="middle" fontSize="15" className="mono" fill="var(--accent-1)">v={it.v}</text>
        </g>
      ))}
      <path d="M276 84 H344" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#c2-ar)" />
      <g transform="translate(374,24)">
        <path
          d="M28 34 Q28 14 50 14 H150 Q172 14 172 34 L188 118 Q188 128 176 128 H24 Q12 128 12 118 Z"
          fill="color-mix(in srgb, var(--accent-1) 8%, var(--surface-3))"
          stroke="var(--accent-2)"
          strokeWidth="2.5"
        />
        <path d="M72 14 Q72 -4 100 -4 Q128 -4 128 14" fill="none" stroke="var(--accent-2)" strokeWidth="2.5" />
        <text x="100" y="58" textAnchor="middle" fontSize="13.5" fill="var(--text-1)">双约束背包</text>
        <text x="100" y="82" textAnchor="middle" fontSize="14" className="mono" fill="var(--accent-1)">费用1 ≤ A=4</text>
        <text x="100" y="104" textAnchor="middle" fontSize="14" className="mono" fill="var(--accent-1)">费用2 ≤ B=4</text>
      </g>
    </svg>
  )
}

// 从「一个费用标签」到「两个费用标签」：约束从一条线变成一片平面，DP 维度随之 +1。
export function Cost2DDimensionFigure() {
  return (
    <svg viewBox="0 0 640 226" role="img" aria-label="从一维费用到二维费用，DP 维度加一">
      <defs>
        <marker id="c2d-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>

      {/* 左：一维费用，dp[j] 是一条数轴 */}
      <text x="118" y="22" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--text-2)">一维费用 · dp[j]</text>
      {Array.from({ length: 5 }, (_, j) => (
        <g key={`o${j}`} transform={`translate(${34 + j * 42},44)`}>
          <rect width="36" height="36" rx="8" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.4" />
          <text x="18" y="23" textAnchor="middle" fontSize="12" className="mono" fill="var(--text-3)">{j}</text>
        </g>
      ))}
      <text x="118" y="108" textAnchor="middle" fontSize="11.5" fill="var(--text-3)">一条约束：一个下标 j</text>

      <path d="M258 66 H322" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#c2d-ar)" />
      <text x="290" y="56" textAnchor="middle" fontSize="11.5" fill="var(--accent-1)">+1 维</text>

      {/* 右：二维费用，dp[x][y] 是一张平面 */}
      <text x="470" y="22" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--accent-1)">二维费用 · dp[x][y]</text>
      {Array.from({ length: 4 }, (_, y) =>
        Array.from({ length: 4 }, (_, x) => (
          <g key={`t${x}-${y}`} transform={`translate(${356 + x * 42},${40 + y * 42})`}>
            <rect
              width="36"
              height="36"
              rx="8"
              fill={x === 2 && y === 2 ? 'color-mix(in srgb, var(--viz-current) 16%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={x === 2 && y === 2 ? 'var(--viz-current)' : 'var(--border-strong)'}
              strokeWidth="1.4"
            />
          </g>
        )),
      )}
      <text x="470" y="228" textAnchor="middle" fontSize="11.5" fill="var(--text-3)">两条约束：一对下标 (x, y)</text>
    </svg>
  )
}

// 转移分叉：dp[x][y] 不取继承原值，取则同时扣两种费用 (x−a, y−b) 再补 v。
export function Cost2DDecisionFigure() {
  return (
    <svg viewBox="0 0 640 292" role="img" aria-label="二维费用下第 i 件取或不取的决策分叉">
      <defs>
        <marker id="c2t-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      <g transform="translate(238,8)">
        <rect width="164" height="50" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="82" y="21" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">第 i 件 · 费用1 x · 费用2 y</text>
        <text x="82" y="40" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">dp[x][y] = ?</text>
      </g>
      <path d="M300 58 L146 100" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#c2t-ar)" />
      <path d="M340 58 L500 100" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#c2t-ar)" />
      <text x="188" y="86" fontSize="12.5" fill="var(--text-2)">不取</text>
      <text x="404" y="86" fontSize="12.5" fill="var(--text-2)">取（需 x ≥ a 且 y ≥ b）</text>
      <g transform="translate(28,104)">
        <rect width="230" height="66" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="115" y="27" textAnchor="middle" fontSize="13" fill="var(--text-1)">第 i 件没参与</text>
        <text x="115" y="49" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">= dp[x][y]（旧值）</text>
      </g>
      <g transform="translate(376,104)">
        <rect width="248" height="66" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="124" y="27" textAnchor="middle" fontSize="13" fill="var(--text-1)">两种费用一起扣，补价值 v</text>
        <text x="124" y="49" textAnchor="middle" fontSize="13.5" className="mono" fill="var(--text-1)">= dp[x−a][y−b] + v</text>
      </g>
      <path d="M143 170 L300 226" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#c2t-ar)" />
      <path d="M500 170 L340 226" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#c2t-ar)" />
      <g transform="translate(206,228)">
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
