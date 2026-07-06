// G 部分（状压 DP）讲解用插图：on-brand SVG，随强调色变色。
// 核心是可复用的「比特点阵」BitLattice——多页共用：n 个方块，亮=1 / 灭=0，附二进制标注。

/** 可复用比特点阵：把一个集合画成 n 个方块（亮=在集合内 / 灭=不在），下方标出二进制串。
 *  bits[0] 是最低位（右起第 1 个格），与代码里 `mask & (1<<i)` 的 i 对应；渲染时最高位在左，符合书写习惯。 */
export function BitLattice({
  bits,
  labels,
  cell = 34,
  gap = 7,
  showBinary = true,
  highlight,
}: {
  bits: number[] // 每位 0/1，bits[i] 对应第 i 位（i=0 最低位）
  labels?: string[] // 每格顶端可选标注（如元素名 / 城市号），按位 i 给
  cell?: number
  gap?: number
  showBinary?: boolean
  highlight?: number[] // 要描边强调的位下标
}) {
  const n = bits.length
  const hl = new Set(highlight ?? [])
  const totalW = n * cell + (n - 1) * gap
  const topPad = labels ? 20 : 6
  const botPad = showBinary ? 26 : 6
  const H = topPad + cell + botPad
  // 视觉最高位在左：位 i 画在第 (n-1-i) 列
  const colX = (i: number) => (n - 1 - i) * (cell + gap)
  return (
    <svg viewBox={`0 0 ${Math.max(totalW, 40)} ${H}`} width={totalW} height={H} role="img" aria-label="比特点阵">
      {bits.map((b, i) => {
        const on = b === 1
        const emph = hl.has(i)
        return (
          <g key={i} transform={`translate(${colX(i)},${topPad})`}>
            {labels && labels[i] != null && (
              <text x={cell / 2} y={-7} textAnchor="middle" fontSize="10.5" className="mono" fill="var(--text-3)">
                {labels[i]}
              </text>
            )}
            <rect
              width={cell}
              height={cell}
              rx="7"
              fill={on ? 'color-mix(in srgb, var(--accent-1) 30%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={emph ? 'var(--viz-current)' : on ? 'var(--accent-2)' : 'var(--border-strong)'}
              strokeWidth={emph ? 2.6 : 1.6}
            />
            <text
              x={cell / 2}
              y={cell / 2 + 6}
              textAnchor="middle"
              fontSize="16"
              fontWeight="700"
              className="mono"
              fill={on ? 'var(--accent-1)' : 'var(--text-3)'}
            >
              {b}
            </text>
            {showBinary && (
              <text x={cell / 2} y={cell + 18} textAnchor="middle" fontSize="10" className="mono" fill="var(--text-3)">
                {`2^${i}`}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ============ board 页：棋盘 / 轮廓状压 ============

// 一行棋盘 → 二进制串：把「哪些列放了棋子」压成一个整数。
export function RowToMaskFigure() {
  const row = [1, 0, 1, 0, 0] // 列 1、3 放王（从左到右展示）
  const cell = 46
  const gap = 8
  const x0 = 40
  const y0 = 26
  const bx = 40
  const by = 128
  return (
    <svg viewBox="0 0 520 210" role="img" aria-label="一行棋盘压成二进制 mask">
      <defs>
        <marker id="b-r2m" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      <text x={x0} y={16} fontSize="12" fill="var(--text-2)">
        棋盘的一行（放 / 不放）
      </text>
      {row.map((v, c) => (
        <g key={c} transform={`translate(${x0 + c * (cell + gap)},${y0})`}>
          <rect
            width={cell}
            height={cell}
            rx="9"
            fill={v ? 'color-mix(in srgb, var(--accent-1) 26%, var(--surface-3))' : 'var(--surface-3)'}
            stroke={v ? 'var(--accent-2)' : 'var(--border-strong)'}
            strokeWidth="1.6"
          />
          {v === 1 && <circle cx={cell / 2} cy={cell / 2} r="12" fill="var(--accent-1)" />}
        </g>
      ))}
      <path d={`M ${x0 + 130} 96 L ${x0 + 130} ${by - 8}`} stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#b-r2m)" />
      <text x={x0 + 150} y={112} fontSize="12" fill="var(--text-2)">
        压成一个整数 mask
      </text>
      {/* 二进制串：最高位在左 → 列 5..1；这里列 1、3 有子 */}
      {[0, 0, 1, 0, 1].map((b, k) => (
        <g key={k} transform={`translate(${bx + k * (cell + gap)},${by})`}>
          <rect width={cell} height={cell} rx="9" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.4" />
          <text x={cell / 2} y={cell / 2 + 7} textAnchor="middle" fontSize="19" fontWeight="700" className="mono" fill={b ? 'var(--accent-1)' : 'var(--text-3)'}>
            {b}
          </text>
        </g>
      ))}
      <text x={bx + 270} y={by + 30} fontSize="14" className="mono" fill="var(--text-1)">
        = 00101
      </text>
    </svg>
  )
}

// 行内 / 行间合法性判定：x&(x<<1) 查同行相邻、x&y 查上下相邻。
export function BoardCheckFigure() {
  const cell = 40
  const gap = 7
  const rowY = 44
  const nextY = 44 + cell + 30
  const x0 = 250
  const draw = (bits: number[], y: number, lit: string, dark: string) =>
    bits.map((b, c) => (
      <g key={`${y}-${c}`} transform={`translate(${x0 + c * (cell + gap)},${y})`}>
        <rect
          width={cell}
          height={cell}
          rx="8"
          fill={b ? lit : dark}
          stroke={b ? 'var(--accent-2)' : 'var(--border-strong)'}
          strokeWidth="1.5"
        />
        {b === 1 && <circle cx={cell / 2} cy={cell / 2} r="10" fill="var(--accent-1)" />}
      </g>
    ))
  return (
    <svg viewBox="0 0 560 168" role="img" aria-label="行内相邻与行间相邻的位运算判定">
      {/* 行内合法：x=01010 无相邻 */}
      <text x="20" y={rowY + 18} fontSize="13" fontWeight="600" fill="var(--viz-chosen)">
        行内 ✓
      </text>
      <text x="20" y={rowY + 36} fontSize="11" className="mono" fill="var(--text-3)">
        x&amp;(x&lt;&lt;1)=0
      </text>
      {draw([0, 1, 0, 1, 0], rowY, 'color-mix(in srgb, var(--accent-1) 26%, var(--surface-3))', 'var(--surface-3)')}
      {/* 行间冲突：本行与上一行同列都放 → x&y≠0 */}
      <text x="20" y={nextY + 18} fontSize="13" fontWeight="600" fill="var(--viz-invalid)">
        行间 ✗
      </text>
      <text x="20" y={nextY + 36} fontSize="11" className="mono" fill="var(--viz-invalid)">
        x&amp;y≠0
      </text>
      {draw([0, 1, 0, 0, 1], nextY, 'color-mix(in srgb, var(--viz-invalid) 22%, var(--surface-3))', 'var(--surface-3)')}
      {/* 冲突列高亮竖线：列 2、列 5 上下都亮 */}
      {[1, 4].map((c) => (
        <line
          key={c}
          x1={x0 + c * (cell + gap) + cell / 2}
          y1={rowY + cell}
          x2={x0 + c * (cell + gap) + cell / 2}
          y2={nextY}
          stroke="var(--viz-invalid)"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
      ))}
      <text x={x0} y={rowY - 6} fontSize="11" fill="var(--text-3)">
        当前行 x
      </text>
      <text x={x0} y={nextY - 6} fontSize="11" fill="var(--text-3)">
        上一行 y（同列相邻即冲突）
      </text>
    </svg>
  )
}

// 炮兵：攻击隔两格 → 状态必须同时记住「前两行」。
export function CannonTwoRowFigure() {
  const cell = 30
  const gap = 5
  const x0 = 60
  const rows = [
    { y: 22, label: 'i−2 行', bits: [1, 0, 0, 0, 1, 0], dim: false },
    { y: 74, label: 'i−1 行', bits: [0, 0, 1, 0, 0, 0], dim: false },
    { y: 126, label: 'i 行 (?)', bits: [0, 1, 0, 0, 0, 1], dim: true },
  ]
  return (
    <svg viewBox="0 0 470 176" role="img" aria-label="炮兵阵地需要记住前两行状态">
      {rows.map((r, ri) => (
        <g key={ri}>
          <text x="10" y={r.y + cell / 2 + 5} fontSize="11" className="mono" fill={r.dim ? 'var(--accent-1)' : 'var(--text-3)'}>
            {r.label}
          </text>
          {r.bits.map((b, c) => (
            <g key={c} transform={`translate(${x0 + c * (cell + gap)},${r.y})`}>
              <rect
                width={cell}
                height={cell}
                rx="6"
                fill={b ? 'color-mix(in srgb, var(--accent-1) 26%, var(--surface-3))' : 'var(--surface-3)'}
                stroke={r.dim ? 'var(--viz-current)' : b ? 'var(--accent-2)' : 'var(--border-strong)'}
                strokeWidth={r.dim ? 2 : 1.4}
                strokeDasharray={r.dim ? '4 3' : undefined}
              />
              {b === 1 && <circle cx={cell / 2} cy={cell / 2} r="8" fill="var(--accent-1)" />}
            </g>
          ))}
        </g>
      ))}
      <text x={x0 + 210} y={48} fontSize="11.5" fill="var(--text-2)">
        新行要同时避开
      </text>
      <text x={x0 + 210} y={90} fontSize="11.5" fill="var(--text-2)">
        i−1 与 i−2 两行
      </text>
      <text x={x0 + 210} y={140} fontSize="11" className="mono" fill="var(--text-3)">
        状态 = (前两行 mask)
      </text>
    </svg>
  )
}

// ============ tsp 页：集合状压 / TSP ============

// TSP 状态 dp[S][i]：已访问集合 S（点阵）+ 当前停在点 i（旗标）。
export function TspStateFigure() {
  return (
    <svg viewBox="0 0 560 150" role="img" aria-label="TSP 状态 dp[S][i] 的两个维度">
      <g transform="translate(20,20)">
        <text x="0" y="0" fontSize="12.5" fill="var(--text-2)">
          维度一：已访问集合 S（用点阵表示）
        </text>
        {/* 显示顺序：最高位在左 → 点 3、2、1、0；S=0110 故点 1、2 亮 */}
        {[0, 1, 1, 0].map((bit, k) => (
          <g key={k} transform={`translate(${k * 44},14)`}>
            <rect
              width="38"
              height="38"
              rx="8"
              fill={bit ? 'color-mix(in srgb, var(--accent-1) 28%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={bit ? 'var(--accent-2)' : 'var(--border-strong)'}
              strokeWidth="1.5"
            />
            <text x="19" y="25" textAnchor="middle" fontSize="16" fontWeight="700" className="mono" fill={bit ? 'var(--accent-1)' : 'var(--text-3)'}>
              {bit}
            </text>
            <text x="19" y="52" textAnchor="middle" fontSize="9.5" className="mono" fill="var(--text-3)">
              {3 - k}
            </text>
          </g>
        ))}
        <text x="0" y="82" fontSize="12" className="mono" fill="var(--text-1)">
          S = 0110 → 已到过点 1、2
        </text>
      </g>
      <line x1="290" y1="24" x2="290" y2="118" stroke="var(--border)" strokeWidth="1.5" />
      <g transform="translate(320,20)">
        <text x="0" y="0" fontSize="12.5" fill="var(--text-2)">
          维度二：当前停在点 i
        </text>
        <g transform="translate(60,20)">
          <circle cx="0" cy="20" r="18" fill="var(--grad-accent)" stroke="var(--accent-2)" strokeWidth="1.5" />
          <text x="0" y="25" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--text-on-accent)">
            i=2
          </text>
        </g>
        <text x="0" y="82" fontSize="12" className="mono" fill="var(--text-1)">
          dp[0110][2] = 到此最短路
        </text>
      </g>
    </svg>
  )
}

// TSP 转移：从 dp[S][i] 走向未访问点 j，S 里点亮第 j 位。
export function TspTransFigure() {
  const dot = (x: number, y: number, id: number, on: boolean, cur = false) => (
    <g transform={`translate(${x},${y})`}>
      <circle
        r="19"
        fill={cur ? 'var(--grad-accent)' : on ? 'color-mix(in srgb, var(--accent-1) 22%, var(--surface-3))' : 'var(--surface-3)'}
        stroke={cur ? 'var(--accent-2)' : on ? 'var(--accent-2)' : 'var(--border-strong)'}
        strokeWidth={cur ? 2.2 : 1.5}
      />
      <text y="5" textAnchor="middle" fontSize="14" fontWeight="700" fill={cur ? 'var(--text-on-accent)' : on ? 'var(--accent-1)' : 'var(--text-3)'}>
        {id}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 560 190" role="img" aria-label="TSP 从当前点走向未访问点的转移">
      <defs>
        <marker id="tsp-ar" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-chosen)" />
        </marker>
      </defs>
      <text x="20" y="20" fontSize="12.5" fill="var(--text-2)">
        已在集合 S={'{0,1}'}、当前停在点 1，下一步去未访问的点 2 或 3
      </text>
      {/* 已访问 0,1（点亮），当前 1 */}
      {dot(70, 90, 0, true)}
      {dot(160, 60, 1, false, true)}
      {/* 候选 2,3 */}
      {dot(320, 60, 2, false)}
      {dot(360, 140, 3, false)}
      <line x1="178" y1="66" x2="300" y2="62" stroke="var(--viz-chosen)" strokeWidth="2.4" markerEnd="url(#tsp-ar)" />
      <line x1="176" y1="76" x2="342" y2="132" stroke="var(--viz-source)" strokeWidth="1.8" strokeDasharray="4 3" markerEnd="url(#tsp-ar)" />
      <text x="230" y="48" fontSize="11" className="mono" fill="var(--viz-chosen)">
        +dist(1,2)
      </text>
      <g transform="translate(400,54)">
        <rect width="150" height="80" rx="10" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.4" />
        <text x="12" y="24" fontSize="11.5" className="mono" fill="var(--text-1)">
          新状态：
        </text>
        <text x="12" y="46" fontSize="11.5" className="mono" fill="var(--text-1)">
          S ∪ {'{2}'} = 0111
        </text>
        <text x="12" y="66" fontSize="11.5" className="mono" fill="var(--accent-1)">
          dp[0111][2]
        </text>
      </g>
    </svg>
  )
}

// 开环 vs 闭环 TSP：Hamilton 路径不回起点；售货员必须回到起点。
export function OpenClosedFigure() {
  const ring = (cx: number, cy: number, close: boolean) => {
    const pts = [
      [cx, cy - 34],
      [cx + 32, cy - 10],
      [cx + 20, cy + 30],
      [cx - 20, cy + 30],
      [cx - 32, cy - 10],
    ]
    const lines = []
    const last = close ? pts.length : pts.length - 1
    for (let k = 0; k < last; k++) {
      const a = pts[k]
      const b = pts[(k + 1) % pts.length]
      lines.push(
        <line
          key={k}
          x1={a[0]}
          y1={a[1]}
          x2={b[0]}
          y2={b[1]}
          stroke={close && k === pts.length - 1 ? 'var(--viz-chosen)' : 'var(--accent-2)'}
          strokeWidth={close && k === pts.length - 1 ? 2.8 : 2}
          strokeDasharray={close && k === pts.length - 1 ? '5 3' : undefined}
        />,
      )
    }
    return (
      <g>
        {lines}
        {pts.map((p, k) => (
          <g key={k} transform={`translate(${p[0]},${p[1]})`}>
            <circle r="13" fill={k === 0 ? 'var(--grad-accent)' : 'var(--surface-3)'} stroke="var(--accent-2)" strokeWidth="1.6" />
            <text y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill={k === 0 ? 'var(--text-on-accent)' : 'var(--text-1)'}>
              {k}
            </text>
          </g>
        ))}
      </g>
    )
  }
  return (
    <svg viewBox="0 0 460 190" role="img" aria-label="开环 Hamilton 路径与闭环售货员回路的区别">
      <text x="70" y="20" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--text-2)">
        开环：Hamilton 路径
      </text>
      <g transform="translate(0,20)">{ring(90, 90, false)}</g>
      <text x="90" y="185" textAnchor="middle" fontSize="11" fill="var(--text-3)">
        终态 dp[(1&lt;&lt;n)−1][i]
      </text>
      <line x1="230" y1="30" x2="230" y2="160" stroke="var(--border)" strokeWidth="1.5" />
      <text x="350" y="20" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--text-2)">
        闭环：售货员回路
      </text>
      <g transform="translate(270,20)">{ring(90, 90, true)}</g>
      <text x="360" y="185" textAnchor="middle" fontSize="11" fill="var(--viz-chosen)">
        末尾必须 +dist(i,0)
      </text>
    </svg>
  )
}

// ============ cover 页：状压 + 覆盖 ============

// 每个「选择」覆盖一批元素 → 压成一个 mask；若干 mask 并起来填满全集。
export function CoverMaskFigure() {
  const universe = 5
  const choices = [
    { name: '选择 A', bits: [1, 1, 0, 0, 0] }, // 覆盖元素 0,1
    { name: '选择 B', bits: [0, 0, 1, 1, 0] }, // 覆盖元素 2,3
    { name: '选择 C', bits: [0, 0, 0, 0, 1] }, // 覆盖元素 4
  ]
  const cell = 30
  const gap = 6
  const x0 = 96
  // 展示时元素 0..4 从左到右（低位在左，便于按「元素编号」阅读覆盖情况）
  const draw = (bits: number[], y: number, strong: boolean) =>
    bits.map((b, k) => (
      <g key={k} transform={`translate(${x0 + k * (cell + gap)},${y})`}>
        <rect
          width={cell}
          height={cell}
          rx="6"
          fill={b ? 'color-mix(in srgb, var(--accent-1) 26%, var(--surface-3))' : 'var(--surface-3)'}
          stroke={b ? (strong ? 'var(--viz-chosen)' : 'var(--accent-2)') : 'var(--border-strong)'}
          strokeWidth="1.5"
        />
        <text x={cell / 2} y={cell / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="700" className="mono" fill={b ? 'var(--accent-1)' : 'var(--text-3)'}>
          {b}
        </text>
      </g>
    ))
  return (
    <svg viewBox="0 0 400 226" role="img" aria-label="每个选择覆盖的元素压成 mask，并集填满全集">
      {choices.map((c, ci) => (
        <g key={ci}>
          <text x="16" y={22 + ci * 44 + cell / 2 + 5} fontSize="12" fill="var(--text-2)">
            {c.name}
          </text>
          {draw(c.bits, 22 + ci * 44, false)}
        </g>
      ))}
      <line x1={x0 - 6} y1={22 + 3 * 44 - 4} x2={x0 + universe * (cell + gap) - gap + 2} y2={22 + 3 * 44 - 4} stroke="var(--border-strong)" strokeWidth="1.4" />
      <text x="16" y={22 + 3 * 44 + cell / 2 + 8} fontSize="12" className="mono" fill="var(--viz-chosen)">
        并集
      </text>
      {draw([1, 1, 1, 1, 1], 22 + 3 * 44 + 4, true)}
      <text x={x0} y={22 + 4 * 44 + 24} fontSize="11.5" className="mono" fill="var(--text-1)">
        = 11111 = 全集 (1&lt;&lt;5)−1 → 覆盖完成
      </text>
    </svg>
  )
}

// ============ subset 页：枚举子集 / 计数变形 ============

// 子集枚举：for(T=S;T;T=(T-1)&S) 依次跳过 S 的所有非空子集。
export function SubsetEnumFigure() {
  // S = 1011（元素 0,1,3）。它的非空子集按枚举顺序：
  const S = [1, 1, 0, 1]
  const subs = [
    [1, 1, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 0, 1],
    [0, 0, 0, 1],
    [1, 1, 0, 0],
    [1, 0, 0, 0],
    [0, 1, 0, 0],
  ]
  const cell = 22
  const gap = 4
  const rowH = 30
  const bx = 130
  const drawMini = (bits: number[], x: number, y: number, dimZero: boolean) =>
    // 渲染列 k 从左到右显示高位→低位；列 k 对应位下标 i = n-1-k
    Array.from({ length: bits.length }, (_, k) => {
      const i = bits.length - 1 - k
      const bit = bits[i]
      return (
        <g key={k} transform={`translate(${x + k * (cell + gap)},${y})`}>
          <rect
            width={cell}
            height={cell}
            rx="5"
            fill={bit ? 'color-mix(in srgb, var(--accent-1) 28%, var(--surface-3))' : 'var(--surface-3)'}
            stroke={bit ? 'var(--accent-2)' : 'var(--border-strong)'}
            strokeWidth="1.2"
            opacity={dimZero && S[i] === 0 ? 0.35 : 1}
          />
          <text x={cell / 2} y={cell / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="700" className="mono" fill={bit ? 'var(--accent-1)' : 'var(--text-3)'}>
            {bit}
          </text>
        </g>
      )
    })
  return (
    <svg viewBox="0 0 400 290" role="img" aria-label="枚举集合 S 的所有非空子集">
      <text x="16" y="20" fontSize="12.5" fill="var(--text-2)">
        母集 S = 1011（元素 0、1、3）
      </text>
      <g transform="translate(0,6)">
        <text x="16" y={38} fontSize="12" className="mono" fill="var(--text-1)">
          S
        </text>
        {drawMini(S, bx, 26, false)}
      </g>
      <line x1="16" y1="60" x2="384" y2="60" stroke="var(--border)" strokeWidth="1" />
      {subs.map((sub, si) => (
        <g key={si}>
          <text x="16" y={78 + si * rowH + cell / 2} fontSize="11" className="mono" fill="var(--text-3)">
            {si + 1}
          </text>
          {drawMini(sub, bx, 76 + si * rowH, true)}
        </g>
      ))}
      <text x="16" y={78 + subs.length * rowH + 4} fontSize="11" className="mono" fill="var(--text-2)">
        T = (T−1) &amp; S 只在 S 的 1 位上取值，7 个非空子集全枚举，O(3ⁿ)
      </text>
    </svg>
  )
}

// 计数变形：dp[mask][余数] —— 位掩码之外再挂一维（如模 d 的余数）。
export function CountVariantFigure() {
  return (
    <svg viewBox="0 0 440 168" role="img" aria-label="位掩码加附加维的计数状态">
      <g transform="translate(30,30)">
        <text x="0" y="0" fontSize="12.5" fill="var(--text-2)">
          主维：已用数字集合 mask
        </text>
        {/* 显示列 k：最高位在左（位3..0）；mask=0101 → 位0、位2 亮 */}
        {[0, 1, 0, 1].map((bit, k) => (
          <g key={k} transform={`translate(${k * 40},14)`}>
            <rect width="34" height="34" rx="7" fill={bit ? 'color-mix(in srgb, var(--accent-1) 28%, var(--surface-3))' : 'var(--surface-3)'} stroke={bit ? 'var(--accent-2)' : 'var(--border-strong)'} strokeWidth="1.5" />
            <text x="17" y="23" textAnchor="middle" fontSize="15" fontWeight="700" className="mono" fill={bit ? 'var(--accent-1)' : 'var(--text-3)'}>
              {bit}
            </text>
          </g>
        ))}
      </g>
      <text x="40" y="118" fontSize="12" className="mono" fill="var(--text-1)">
        mask = 0101
      </text>
      <line x1="240" y1="24" x2="240" y2="140" stroke="var(--border)" strokeWidth="1.5" />
      <g transform="translate(270,30)">
        <text x="0" y="0" fontSize="12.5" fill="var(--text-2)">
          附加维：当前数 mod d
        </text>
        <g transform="translate(20,16)">
          <rect width="120" height="40" rx="9" fill="color-mix(in srgb, var(--accent-1) 14%, var(--surface-2))" stroke="var(--accent-2)" strokeWidth="1.5" />
          <text x="60" y="26" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
            余数 r
          </text>
        </g>
        <text x="0" y="100" fontSize="12" className="mono" fill="var(--accent-1)">
          dp[mask][r] = 方案数
        </text>
      </g>
    </svg>
  )
}

// ============ plug 页：插头 DP / 轮廓线 ============

// 轮廓线：处理到某格时，已决区与未决区之间的一条折线，线上每格挂「插头」连通信息。
export function ContourFigure() {
  const cols = 5
  const rows = 4
  const cell = 34
  const x0 = 40
  const y0 = 30
  // 处理到第 2 行第 2 列（r=1,c=2）：其上方与左侧为已决
  const cutR = 1
  const cutC = 2
  const decided = (r: number, c: number) => r < cutR || (r === cutR && c <= cutC)
  return (
    <svg viewBox="0 0 300 200" role="img" aria-label="轮廓线把网格分成已决与未决两区">
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const dec = decided(r, c)
          const isCur = r === cutR && c === cutC
          return (
            <g key={`${r}-${c}`} transform={`translate(${x0 + c * cell},${y0 + r * cell})`}>
              <rect
                width={cell - 3}
                height={cell - 3}
                rx="5"
                fill={isCur ? 'color-mix(in srgb, var(--viz-current) 24%, var(--surface-3))' : dec ? 'color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))' : 'var(--surface-3)'}
                stroke={isCur ? 'var(--viz-current)' : dec ? 'var(--accent-2)' : 'var(--border-strong)'}
                strokeWidth={isCur ? 2.2 : 1.3}
              />
            </g>
          )
        }),
      )}
      {/* 轮廓折线 */}
      <polyline
        points={`${x0},${y0 + (cutR + 1) * cell - 1.5} ${x0 + (cutC + 1) * cell - 1.5},${y0 + (cutR + 1) * cell - 1.5} ${x0 + (cutC + 1) * cell - 1.5},${y0 + cutR * cell - 1.5} ${x0 + cols * cell - 1.5},${y0 + cutR * cell - 1.5}`}
        fill="none"
        stroke="var(--viz-source)"
        strokeWidth="3"
      />
      <text x={x0} y={y0 - 10} fontSize="11" fill="var(--accent-1)">
        已决区
      </text>
      <text x={x0 + cols * cell - 70} y={y0 + rows * cell + 16} fontSize="11" fill="var(--text-3)">
        未决区
      </text>
      <text x={x0 + cols * cell - 4} y={y0 + cutR * cell - 8} textAnchor="end" fontSize="10.5" className="mono" fill="var(--viz-source)">
        轮廓线
      </text>
    </svg>
  )
}
