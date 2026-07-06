// 加分二叉树（区间 DP）讲解用插图（on-brand SVG，随部分强调色变色）。

// 引入图：中序序列 1..n 固定，选某个节点 k 作根，把序列劈成「左半 + 右半」。
export function InorderRootFigure() {
  const vals = [5, 7, 1, 2, 10]
  const x0 = 46
  const dx = 92
  const bw = 66
  const kRoot = 2 // 选第 3 个（下标 2）作根
  return (
    <svg viewBox="0 0 560 208" role="img" aria-label="中序序列固定，选一个节点作根，序列劈成左右两半">
      <defs>
        <marker id="ir-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>
      {vals.map((v, i) => {
        const isRoot = i === kRoot
        return (
          <g key={i} transform={`translate(${x0 + i * dx},34)`}>
            <rect
              width={bw}
              height="64"
              rx="12"
              fill={isRoot ? 'var(--grad-accent)' : 'var(--surface-3)'}
              stroke={isRoot ? 'var(--accent-2)' : 'var(--border-strong)'}
              strokeWidth={isRoot ? 2.5 : 1.5}
            />
            <text x={bw / 2} y="26" textAnchor="middle" fontSize="12" fill={isRoot ? 'var(--text-on-accent)' : 'var(--text-2)'}>
              节点 {i + 1}
            </text>
            <text x={bw / 2} y="50" textAnchor="middle" fontSize="17" className="mono" fill={isRoot ? 'var(--text-on-accent)' : 'var(--accent-1)'}>
              {v}
            </text>
          </g>
        )
      })}
      <text x={x0 + 2.5 * dx - dx / 2} y="20" textAnchor="middle" fontSize="12" fill="var(--text-3)">
        中序遍历固定为 1 … 5（左根右）
      </text>
      {/* 选中根 → 指出「根」 */}
      <path d={`M ${x0 + kRoot * dx + bw / 2} 104 V 122`} stroke="var(--accent-2)" strokeWidth="2" markerEnd="url(#ir-ar)" />
      <text x={x0 + kRoot * dx + bw / 2} y="140" textAnchor="middle" fontSize="12.5" fill="var(--accent-1)">
        选它作根
      </text>
      {/* 左半括号 */}
      <path
        d={`M ${x0} 158 Q ${x0} 168 ${x0 + 10} 168 L ${x0 + kRoot * dx - 14} 168 Q ${x0 + kRoot * dx - 4} 168 ${x0 + kRoot * dx - 4} 158`}
        fill="none"
        stroke="var(--viz-chosen)"
        strokeWidth="1.8"
      />
      <text x={x0 + (kRoot * dx) / 2} y="192" textAnchor="middle" fontSize="12" fill="var(--viz-chosen)">
        左半 → 左子树
      </text>
      {/* 右半括号 */}
      <path
        d={`M ${x0 + (kRoot + 1) * dx + 4} 158 Q ${x0 + (kRoot + 1) * dx + 4} 168 ${x0 + (kRoot + 1) * dx + 14} 168 L ${x0 + vals.length * dx - 26 - 10} 168 Q ${x0 + vals.length * dx - 26} 168 ${x0 + vals.length * dx - 26} 158`}
        fill="none"
        stroke="var(--viz-chosen)"
        strokeWidth="1.8"
      />
      <text x={x0 + (kRoot + 1.5) * dx + bw / 2 - 6} y="192" textAnchor="middle" fontSize="12" fill="var(--viz-chosen)">
        右半 → 右子树
      </text>
    </svg>
  )
}

// ★区间↔子树：一段连续中序区间 [i,j] 恰好是二叉树的一棵子树。
export function IntervalSubtreeFigure() {
  const x0 = 32
  const dx = 60
  const bw = 44
  const n = 5
  // 左：中序刻度条，高亮 [2,4]；右：对应子树（节点 4 为根，覆盖 2..5 里的 [2,4] 演示为 [2,4]）
  const lo = 2
  const hi = 4
  return (
    <svg viewBox="0 0 600 224" role="img" aria-label="一段连续的中序区间恰好对应二叉树的一棵子树">
      <defs>
        <marker id="ist-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>
      <text x="150" y="20" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
        中序序列上一段连续区间
      </text>
      {/* 中序刻度条 1..5，高亮 [2,4] */}
      {Array.from({ length: n }, (_, k) => {
        const inSel = k + 1 >= lo && k + 1 <= hi
        return (
          <g key={k} transform={`translate(${x0 + k * dx},36)`}>
            <rect
              width={bw}
              height="40"
              rx="9"
              fill={inSel ? 'color-mix(in srgb, var(--accent-1) 20%, var(--surface-3))' : 'var(--surface-2)'}
              stroke={inSel ? 'var(--accent-2)' : 'var(--border)'}
              strokeWidth={inSel ? 2 : 1}
            />
            <text x={bw / 2} y="26" textAnchor="middle" fontSize="15" className="mono" fill={inSel ? 'var(--accent-1)' : 'var(--text-3)'}>
              {k + 1}
            </text>
          </g>
        )
      })}
      <path
        d={`M ${x0 + (lo - 1) * dx} 84 Q ${x0 + (lo - 1) * dx} 94 ${x0 + (lo - 1) * dx + 10} 94 L ${x0 + (hi - 1) * dx + bw - 10} 94 Q ${x0 + (hi - 1) * dx + bw} 94 ${x0 + (hi - 1) * dx + bw} 84`}
        fill="none"
        stroke="var(--accent-2)"
        strokeWidth="1.8"
      />
      <text x={x0 + ((lo - 1 + hi - 1) * dx + bw) / 2} y="112" textAnchor="middle" fontSize="13" className="mono" fill="var(--accent-1)">
        区间 [2, 4]
      </text>

      {/* 中间：等价箭头 */}
      <text x="150" y="168" textAnchor="middle" fontSize="26" fill="var(--accent-2)">
        ⇕
      </text>
      <text x="150" y="200" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
        就是这一棵子树
      </text>

      {/* 右：对应子树（节点 3 为根，2 左、4 右——纯示意结构） */}
      <g transform="translate(360,0)">
        <text x="110" y="20" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
          [2,4] 的一种二叉子树
        </text>
        {/* 边 */}
        <line x1="110" y1="58" x2="60" y2="112" stroke="var(--accent-2)" strokeWidth="2" />
        <line x1="110" y1="58" x2="160" y2="112" stroke="var(--accent-2)" strokeWidth="2" />
        <line x1="160" y1="130" x2="200" y2="176" stroke="var(--accent-2)" strokeWidth="2" />
        {/* 根 3 */}
        <g transform="translate(110,42)">
          <circle r="18" fill="var(--grad-accent)" stroke="var(--accent-2)" strokeWidth="2" />
          <text y="5" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-on-accent)">3</text>
        </g>
        {/* 左子 2 */}
        <g transform="translate(60,130)">
          <circle r="18" fill="color-mix(in srgb, var(--accent-1) 18%, var(--surface-3))" stroke="var(--accent-2)" strokeWidth="1.8" />
          <text y="5" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-1)">2</text>
        </g>
        {/* 右子 4 */}
        <g transform="translate(160,130)">
          <circle r="18" fill="color-mix(in srgb, var(--accent-1) 18%, var(--surface-3))" stroke="var(--accent-2)" strokeWidth="1.8" />
          <text y="5" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-1)">4</text>
        </g>
        <text x="60" y="170" textAnchor="middle" fontSize="10.5" fill="var(--text-3)">左</text>
        <text x="176" y="150" textAnchor="middle" fontSize="10.5" fill="var(--text-3)">右</text>
      </g>
    </svg>
  )
}

// 转移图：dp[i][j] 枚举根 k → 左子树 dp[i][k-1] × 右子树 dp[k+1][j] + score[k]；空子树 = 1。
export function ScoreTransFigure() {
  return (
    <svg viewBox="0 0 620 260" role="img" aria-label="枚举根的转移：左子树乘右子树加根分数，空子树记 1">
      <defs>
        <marker id="sc-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      {/* 顶：区间 [i,j] */}
      <g transform="translate(210,8)">
        <rect width="200" height="46" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="100" y="20" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
          区间 [i, j] 建成一棵子树
        </text>
        <text x="100" y="38" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
          dp[i][j] = ?
        </text>
      </g>
      <text x="310" y="74" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
        枚举根 k：左半 [i,k−1] 作左子树，右半 [k+1,j] 作右子树
      </text>
      <path d="M280 84 L180 118" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#sc-ar)" />
      <path d="M340 84 L452 118" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#sc-ar)" />
      {/* 左子树 */}
      <g transform="translate(52,120)">
        <rect width="224" height="58" rx="12" fill="color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))" stroke="var(--viz-chosen)" strokeWidth="1.5" />
        <text x="112" y="24" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">
          左子树 [i, k−1] 的最大加分
        </text>
        <text x="112" y="45" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
          dp[i][k−1]（空则记 1）
        </text>
      </g>
      {/* 右子树 */}
      <g transform="translate(344,120)">
        <rect width="224" height="58" rx="12" fill="color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))" stroke="var(--viz-chosen)" strokeWidth="1.5" />
        <text x="112" y="24" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">
          右子树 [k+1, j] 的最大加分
        </text>
        <text x="112" y="45" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
          dp[k+1][j]（空则记 1）
        </text>
      </g>
      <path d="M180 178 L300 214" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#sc-ar)" />
      <path d="M456 178 L340 214" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#sc-ar)" />
      {/* 底：加分公式 */}
      <g transform="translate(146,216)">
        <rect width="328" height="44" rx="14" fill="color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))" stroke="var(--accent-2)" strokeWidth="1.5" />
        <text x="164" y="28" textAnchor="middle" fontSize="13.5" className="mono" fill="var(--text-1)">
          dp[i][k−1] × dp[k+1][j] + score[k]
        </text>
      </g>
    </svg>
  )
}
