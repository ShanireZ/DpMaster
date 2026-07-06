// A 线性 DP · 路径型讲解用插图（on-brand 内联 SVG，随部分强调色变色）

// 引入图：数字三角形塔 + 高亮一条自顶向下的最优路径（每步只能去正下方或右下方）。
// 数据用文中手算的 3 行小三角 [[3],[6,5],[3,8,2]]，最优路径 3→6→8 = 17。
export function TrianglePathFigure() {
  const tri = [[3], [6, 5], [3, 8, 2]]
  const r = 26 // 圆半径
  const gapX = 74 // 同行相邻圆心横距
  const gapY = 70 // 行间纵距
  const cx0 = 300 // 顶点横坐标
  const y0 = 40
  const pos = (i: number, j: number) => ({
    x: cx0 - (i * gapX) / 2 + j * gapX,
    y: y0 + i * gapY,
  })
  // 最优路径经过的格：(0,0)->(1,0)->(2,1)
  const onPath = (i: number, j: number) => (i === 0 && j === 0) || (i === 1 && j === 0) || (i === 2 && j === 1)
  return (
    <svg viewBox="0 0 600 240" role="img" aria-label="数字三角形与一条最优下行路径">
      <defs>
        <marker id="tp-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>
      {/* 先画路径连线（在圆下层） */}
      {[
        [pos(0, 0), pos(1, 0)],
        [pos(1, 0), pos(2, 1)],
      ].map(([a, b], i) => (
        <line key={`p${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--accent-2)" strokeWidth="3.5" markerEnd="url(#tp-ar)" opacity="0.85" />
      ))}
      {/* 灰色的「另一条岔路」示意：顶点也可以去右下 */}
      <line x1={pos(0, 0).x} y1={pos(0, 0).y} x2={pos(1, 1).x} y2={pos(1, 1).y} stroke="var(--text-3)" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
      {tri.map((row, i) =>
        row.map((v, j) => {
          const p = pos(i, j)
          const hot = onPath(i, j)
          return (
            <g key={`${i}-${j}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={hot ? 'color-mix(in srgb, var(--accent-1) 20%, var(--surface-3))' : 'var(--surface-3)'}
                stroke={hot ? 'var(--accent-2)' : 'var(--border-strong)'}
                strokeWidth={hot ? 2.5 : 1.5}
              />
              <text x={p.x} y={p.y + 6} textAnchor="middle" fontSize="18" className="mono" fill={hot ? 'var(--accent-1)' : 'var(--text-1)'}>
                {v}
              </text>
            </g>
          )
        }),
      )}
      <text x="500" y="150" fontSize="12.5" fill="var(--text-2)">
        每步只能走向
      </text>
      <text x="500" y="170" fontSize="12.5" fill="var(--text-2)">
        正下方或右下方
      </text>
      <text x="60" y="210" fontSize="13" fill="var(--accent-1)" fontWeight="600">
        高亮路 3→6→8 = 17（最大）
      </text>
    </svg>
  )
}

// 转移决策图：一格 f[i][j] 的两条来源——正下方 f[i+1][j] 与右下方 f[i+1][j+1]，取 max 再加自己。
export function TriangleDecisionFigure() {
  return (
    <svg viewBox="0 0 600 250" role="img" aria-label="数字三角形单格的自底向上转移">
      <defs>
        <marker id="td-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      {/* 当前格 */}
      <g transform="translate(228,8)">
        <rect width="150" height="52" rx="12" fill="color-mix(in srgb, var(--viz-current) 14%, var(--surface-2))" stroke="var(--viz-current)" strokeWidth="1.5" />
        <text x="75" y="22" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">当前 · 第 i 行第 j 列</text>
        <text x="75" y="42" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">f[i][j] = ?</text>
      </g>
      {/* 两条下行来源箭头（注意方向：来源在下，写入在上——自底向上） */}
      <path d="M264 130 L288 62" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#td-ar)" />
      <path d="M430 130 L318 62" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#td-ar)" />
      <text x="150" y="108" fontSize="12.5" fill="var(--text-2)">正下方</text>
      <text x="430" y="108" fontSize="12.5" fill="var(--text-2)">右下方</text>
      {/* 正下方来源 */}
      <g transform="translate(70,132)">
        <rect width="200" height="60" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="100" y="26" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">同列往下走一步</text>
        <text x="100" y="47" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">f[i+1][j]</text>
      </g>
      {/* 右下方来源 */}
      <g transform="translate(330,132)">
        <rect width="212" height="60" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="106" y="26" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">斜着往右下走一步</text>
        <text x="106" y="47" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">f[i+1][j+1]</text>
      </g>
      {/* 汇总条 */}
      <g transform="translate(170,204)">
        <rect width="260" height="42" rx="14" fill="color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))" stroke="var(--accent-2)" strokeWidth="1.5" />
        <text x="130" y="27" textAnchor="middle" fontSize="13.5" className="mono" fill="var(--text-1)">a[i][j] + max(两个下方)</text>
      </g>
    </svg>
  )
}

// 深化/对照图：网格路径计数——每格 = 上方 + 左方；一个障碍格清零，路径绕行。
// 3×3 网格：无障碍右下角 6；把 (2,2) 设障碍后右下角降到 2。这里展示「有障碍」的那张表。
export function GridCountFigure() {
  // 有障碍(2,2)的计数表（1-based 值）：
  // 1 1 1 / 1 0 1 / 1 1 2
  const grid = [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 2],
  ]
  const CW = 58
  const gap = 12
  const x0 = 150
  const y0 = 30
  const gx = (c: number) => x0 + c * (CW + gap)
  const gy = (r: number) => y0 + r * (CW + gap)
  return (
    <svg viewBox="0 0 560 258" role="img" aria-label="带障碍的网格路径计数表">
      <defs>
        <marker id="gc-ar" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-source)" />
        </marker>
      </defs>
      {/* 列头 / 行头 */}
      {[0, 1, 2].map((c) => (
        <text key={`ch${c}`} x={gx(c) + CW / 2} y={y0 - 10} textAnchor="middle" fontSize="11" className="mono" fill="var(--text-3)">
          列{c + 1}
        </text>
      ))}
      {[0, 1, 2].map((r) => (
        <text key={`rh${r}`} x={x0 - 16} y={gy(r) + CW / 2 + 4} textAnchor="middle" fontSize="11" className="mono" fill="var(--text-3)">
          行{r + 1}
        </text>
      ))}
      {/* 到右下角(3,3)的两条累加来源箭头 */}
      <line x1={gx(2) + CW / 2} y1={gy(1) + CW} x2={gx(2) + CW / 2} y2={gy(2)} stroke="var(--viz-source)" strokeWidth="2" markerEnd="url(#gc-ar)" />
      <line x1={gx(1) + CW} y1={gy(2) + CW / 2} x2={gx(2)} y2={gy(2) + CW / 2} stroke="var(--viz-source)" strokeWidth="2" markerEnd="url(#gc-ar)" />
      {grid.map((row, r) =>
        row.map((v, c) => {
          const blocked = r === 1 && c === 1
          const start = r === 0 && c === 0
          const end = r === 2 && c === 2
          return (
            <g key={`${r}-${c}`} transform={`translate(${gx(c)},${gy(r)})`}>
              <rect
                width={CW}
                height={CW}
                rx="10"
                fill={
                  blocked
                    ? 'color-mix(in srgb, var(--viz-invalid) 22%, var(--surface-3))'
                    : end
                      ? 'color-mix(in srgb, var(--accent-1) 18%, var(--surface-3))'
                      : start
                        ? 'color-mix(in srgb, var(--accent-1) 10%, var(--surface-3))'
                        : 'var(--surface-3)'
                }
                stroke={blocked ? 'var(--viz-invalid)' : end ? 'var(--accent-2)' : 'var(--border-strong)'}
                strokeWidth={blocked || end ? 2.2 : 1.5}
              />
              <text
                x={CW / 2}
                y={CW / 2 + 7}
                textAnchor="middle"
                fontSize="19"
                className="mono"
                fill={blocked ? 'var(--viz-invalid)' : end ? 'var(--accent-1)' : 'var(--text-1)'}
              >
                {blocked ? '×' : v}
              </text>
            </g>
          )
        }),
      )}
      <text x="420" y="150" fontSize="12.5" fill="var(--text-2)">
        每格 =
      </text>
      <text x="420" y="170" fontSize="12.5" fill="var(--text-2)">
        上方 + 左方
      </text>
      <text x="420" y="200" fontSize="12.5" fill="var(--viz-invalid)">
        障碍格清零
      </text>
    </svg>
  )
}
