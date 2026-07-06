// 网格 / 矩阵 DP 讲解用插图（on-brand SVG，随部分强调色变色；不做 opacity:0 起步动画）

// 引入图：一张 0/1 矩阵，高亮其中最大的全 1 正方形（3×3）。
export function GridSetupFigure() {
  const g = [
    [1, 0, 1, 1, 0],
    [1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
  ]
  const S = 34
  const gap = 6
  const x0 = 150
  const y0 = 14
  // 最大正方形：行 1..3、列 1..3
  const sqR0 = 1
  const sqC0 = 1
  const side = 3
  return (
    <svg viewBox="0 0 640 190" role="img" aria-label="0/1 矩阵中最大的全 1 正方形">
      {g.map((row, i) =>
        row.map((v, j) => {
          const x = x0 + j * (S + gap)
          const y = y0 + i * (S + gap)
          const one = v === 1
          return (
            <g key={`${i}-${j}`}>
              <rect
                x={x}
                y={y}
                width={S}
                height={S}
                rx="7"
                fill={one ? 'color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))' : 'var(--surface-2)'}
                stroke={one ? 'var(--border-strong)' : 'var(--border)'}
                strokeWidth="1.5"
              />
              <text
                x={x + S / 2}
                y={y + S / 2 + 5}
                textAnchor="middle"
                fontSize="15"
                className="mono"
                fill={one ? 'var(--accent-1)' : 'var(--text-3)'}
              >
                {v}
              </text>
            </g>
          )
        }),
      )}
      {/* 高亮最大正方形边框 */}
      <rect
        x={x0 + sqC0 * (S + gap) - 3}
        y={y0 + sqR0 * (S + gap) - 3}
        width={side * S + (side - 1) * gap + 6}
        height={side * S + (side - 1) * gap + 6}
        rx="9"
        fill="none"
        stroke="var(--accent-2)"
        strokeWidth="3"
      />
      <text x="20" y="96" fontSize="13" fill="var(--text-2)">
        全 1 的
      </text>
      <text x="20" y="116" fontSize="13" fill="var(--text-2)">
        最大正方形
      </text>
      <text x="20" y="140" fontSize="15" className="mono" fill="var(--accent-2)">
        边长 3
      </text>
      <text x="20" y="160" fontSize="13" className="mono" fill="var(--text-3)">
        面积 9
      </text>
    </svg>
  )
}

// 转移图：dp[i][j] 由上 / 左 / 左上三格取 min 再 +1；短板决定能扩多大。
export function SquareTransitionFigure() {
  const CW = 92
  const CH = 52
  const gx = (c: number) => 210 + c * (CW + 18)
  const gy = (r: number) => 24 + r * (CH + 26)
  const cxp = (c: number) => gx(c) + CW / 2
  const cyp = (r: number) => gy(r) + CH / 2
  const cells = [
    { r: 0, c: 0, t: 'dp[i−1][j−1]', tag: '左上' },
    { r: 0, c: 1, t: 'dp[i−1][j]', tag: '上' },
    { r: 1, c: 0, t: 'dp[i][j−1]', tag: '左' },
    { r: 1, c: 1, t: 'dp[i][j]', tag: '当前' },
  ]
  return (
    <svg viewBox="0 0 640 210" role="img" aria-label="以 (i,j) 为右下角的正方形由上左左上三格取 min 加一">
      <defs>
        <marker id="sq-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-source)" />
        </marker>
      </defs>
      {cells.map((cell, i) => {
        const cur = cell.r === 1 && cell.c === 1
        return (
          <g key={i} transform={`translate(${gx(cell.c)},${gy(cell.r)})`}>
            <rect
              width={CW}
              height={CH}
              rx="10"
              fill={
                cur
                  ? 'color-mix(in srgb, var(--viz-current) 16%, var(--surface-3))'
                  : 'color-mix(in srgb, var(--accent-1) 10%, var(--surface-3))'
              }
              stroke={cur ? 'var(--viz-current)' : 'var(--accent-2)'}
              strokeWidth="1.6"
            />
            <text x={CW / 2} y="22" textAnchor="middle" fontSize="11" fill="var(--text-3)">
              {cell.tag}
            </text>
            <text x={CW / 2} y="40" textAnchor="middle" fontSize="12.5" className="mono" fill="var(--text-1)">
              {cell.t}
            </text>
          </g>
        )
      })}
      {/* 三来源箭头指向当前格 */}
      <line x1={cxp(0)} y1={gy(0) + CH} x2={cxp(1) - 24} y2={gy(1) + 6} stroke="var(--viz-source)" strokeWidth="2" markerEnd="url(#sq-ar)" />
      <line x1={cxp(1)} y1={gy(0) + CH} x2={cxp(1)} y2={gy(1)} stroke="var(--viz-source)" strokeWidth="2" markerEnd="url(#sq-ar)" />
      <line x1={gx(0) + CW} y1={cyp(1)} x2={gx(1)} y2={cyp(1)} stroke="var(--viz-source)" strokeWidth="2" markerEnd="url(#sq-ar)" />
      <g transform="translate(470,78)">
        <rect
          width="150"
          height="54"
          rx="12"
          fill="color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))"
          stroke="var(--accent-2)"
          strokeWidth="1.5"
        />
        <text x="75" y="23" textAnchor="middle" fontSize="12" fill="var(--text-2)">
          取三者最短板
        </text>
        <text x="75" y="42" textAnchor="middle" fontSize="13.5" className="mono" fill="var(--text-1)">
          min(·) + 1
        </text>
      </g>
      <text x="20" y="100" fontSize="12.5" fill="var(--text-2)">
        任一方向
      </text>
      <text x="20" y="118" fontSize="12.5" fill="var(--text-2)">
        缺一格，
      </text>
      <text x="20" y="136" fontSize="12.5" fill="var(--text-2)">
        正方形就
      </text>
      <text x="20" y="154" fontSize="12.5" fill="var(--text-2)">
        撑不起来
      </text>
    </svg>
  )
}

// 双线程图：两条路径同步右/下推进，走了 k 步一定落在反对角线 x+y=k 上。
export function TwoPathFigure() {
  const N = 4
  const S = 30
  const gap = 5
  const x0 = 40
  const y0 = 22
  const cx = (c: number) => x0 + c * (S + gap) + S / 2
  const cy = (r: number) => y0 + r * (S + gap) + S / 2
  // 两条路径（右/下），示意用：路1 偏下，路2 偏上
  const path1 = [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [3, 1],
    [3, 2],
    [3, 3],
  ]
  const path2 = [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 3],
    [2, 3],
    [3, 3],
  ]
  const line = (pts: number[][]) => pts.map(([r, c]) => `${cx(c)},${cy(r)}`).join(' ')
  return (
    <svg viewBox="0 0 560 200" role="img" aria-label="两条路径同步推进，走 k 步都落在反对角线上">
      {/* 网格 */}
      {Array.from({ length: N }).map((_, i) =>
        Array.from({ length: N }).map((_, j) => (
          <rect
            key={`${i}-${j}`}
            x={x0 + j * (S + gap)}
            y={y0 + i * (S + gap)}
            width={S}
            height={S}
            rx="6"
            fill="var(--surface-3)"
            stroke="var(--border)"
            strokeWidth="1.2"
          />
        )),
      )}
      {/* 反对角线 x+y=3 的示意（连接落在同一条线上的格子中心） */}
      <line x1={cx(3)} y1={cy(0)} x2={cx(0)} y2={cy(3)} stroke="var(--text-3)" strokeWidth="1.4" strokeDasharray="4 4" />
      <text x={cx(0) - 4} y={cy(3) + 22} textAnchor="middle" fontSize="11" className="mono" fill="var(--text-3)">
        x+y=3
      </text>
      {/* 两条路径 */}
      <polyline points={line(path1)} fill="none" stroke="var(--accent-1)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
      <polyline points={line(path2)} fill="none" stroke="var(--accent-2)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
      {/* 起点 / 终点 */}
      <circle cx={cx(0)} cy={cy(0)} r="7" fill="var(--viz-current)" />
      <circle cx={cx(3)} cy={cy(3)} r="7" fill="var(--viz-chosen)" />
      {/* 图右侧说明 */}
      <g transform="translate(360,30)">
        <rect width="14" height="14" rx="4" fill="var(--accent-1)" />
        <text x="22" y="12" fontSize="12.5" fill="var(--text-2)">
          路径 1
        </text>
        <rect y="28" width="14" height="14" rx="4" fill="var(--accent-2)" />
        <text x="22" y="40" fontSize="12.5" fill="var(--text-2)">
          路径 2
        </text>
        <text y="74" fontSize="12.5" fill="var(--text-1)">
          两条路同步走，
        </text>
        <text y="94" fontSize="12.5" fill="var(--text-1)">
          走了 k 步都停在
        </text>
        <text y="114" fontSize="12.5" fill="var(--text-1)">
          反对角线 x+y=k 上
        </text>
        <text y="140" fontSize="12" fill="var(--text-3)">
          状态压成 dp[k][x1][x2]
        </text>
      </g>
    </svg>
  )
}
