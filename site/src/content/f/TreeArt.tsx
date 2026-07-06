// F 部分 · 树形 DP 讲解插图（on-brand SVG，随部分强调色变色）
// 约定：节点圆 var(--surface-3) 描边 var(--border-strong)；强调走 var(--accent-1/2)；
// 被选/最优走 var(--viz-chosen)，来源走 var(--viz-source)，越界走 var(--viz-invalid)。

// —— 通用：一个树节点圆 ——
function Node({
  x,
  y,
  label,
  accent = false,
  r = 20,
}: {
  x: number
  y: number
  label: string
  accent?: boolean
  r?: number
}) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle
        r={r}
        fill={accent ? 'color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))' : 'var(--surface-3)'}
        stroke={accent ? 'var(--accent-2)' : 'var(--border-strong)'}
        strokeWidth={accent ? 2.2 : 1.5}
      />
      <text textAnchor="middle" y="5" fontSize="14" fontWeight="700" fill="var(--text-1)">
        {label}
      </text>
    </g>
  )
}

// ① 后序遍历：自底向上处理次序（叶子先亮，根最后）
export function PostorderFigure() {
  // 树： 1 -> {2,3}; 2 -> {4,5}
  const P: Record<string, [number, number]> = {
    '1': [300, 40],
    '2': [170, 130],
    '3': [430, 130],
    '4': [110, 220],
    '5': [230, 220],
  }
  const edges: [string, string][] = [
    ['1', '2'],
    ['1', '3'],
    ['2', '4'],
    ['2', '5'],
  ]
  // 后序编号：4,5,2,3,1
  const orderNo: Record<string, number> = { '4': 1, '5': 2, '2': 3, '3': 4, '1': 5 }
  return (
    <svg viewBox="0 0 560 268" role="img" aria-label="后序遍历：孩子先于父亲被处理">
      {edges.map(([a, b], i) => (
        <line key={i} x1={P[a][0]} y1={P[a][1] + 20} x2={P[b][0]} y2={P[b][1] - 20} stroke="var(--border-strong)" strokeWidth="1.6" />
      ))}
      {Object.entries(P).map(([k, [x, y]]) => (
        <g key={k}>
          <Node x={x} y={y} label={k} accent={k === '1'} />
          <g transform={`translate(${x + 22},${y - 20})`}>
            <circle r="11" fill="var(--grad-accent)" />
            <text textAnchor="middle" y="4" fontSize="11" fontWeight="700" fill="var(--text-on-accent)">
              {orderNo[k]}
            </text>
          </g>
        </g>
      ))}
      <text x="300" y="258" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
        金色序号 = 处理次序：叶子 4、5 先算好，父亲 2 才能合并；根 1 最后收口。
      </text>
    </svg>
  )
}

// ② 独立集决策：dp[u][0] / dp[u][1] 两条路
export function IndepDecisionFigure() {
  return (
    <svg viewBox="0 0 600 300" role="img" aria-label="选点 u 时 dp[u][0] 与 dp[u][1] 的分叉">
      <defs>
        <marker id="fa-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      <g transform="translate(232,8)">
        <rect width="136" height="46" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="68" y="20" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">节点 u（权 w）</text>
        <text x="68" y="38" textAnchor="middle" fontSize="13" className="mono" fill="var(--text-1)">选它？</text>
      </g>
      <path d="M280 54 L150 96" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#fa-ar)" />
      <path d="M320 54 L470 96" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#fa-ar)" />
      <text x="182" y="82" fontSize="12.5" fill="var(--text-2)">不选 u</text>
      <text x="404" y="82" fontSize="12.5" fill="var(--text-2)">选 u</text>

      <g transform="translate(30,100)">
        <rect width="240" height="80" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="120" y="26" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">孩子自由：各取较大</text>
        <text x="120" y="52" textAnchor="middle" fontSize="13" className="mono" fill="var(--text-1)">dp[u][0] =</text>
        <text x="120" y="70" textAnchor="middle" fontSize="12.5" className="mono" fill="var(--accent-1)">Σ max(dp[c][0], dp[c][1])</text>
      </g>
      <g transform="translate(330,100)">
        <rect width="240" height="80" rx="12" fill="color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))" stroke="var(--viz-chosen)" strokeWidth="1.5" />
        <text x="120" y="26" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">孩子必须全不选</text>
        <text x="120" y="52" textAnchor="middle" fontSize="13" className="mono" fill="var(--text-1)">dp[u][1] = w +</text>
        <text x="120" y="70" textAnchor="middle" fontSize="12.5" className="mono" fill="var(--viz-chosen)">Σ dp[c][0]</text>
      </g>
      <path d="M150 180 L280 232" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#fa-ar)" />
      <path d="M450 180 L320 232" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#fa-ar)" />
      <g transform="translate(196,234)">
        <rect width="208" height="50" rx="13" fill="color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))" stroke="var(--accent-2)" strokeWidth="1.5" />
        <text x="104" y="30" textAnchor="middle" fontSize="13" className="mono" fill="var(--text-1)">答案 = max(dp[root][0], dp[root][1])</text>
      </g>
    </svg>
  )
}

// ③ 独立集 ↔ 点覆盖：同一棵树，选中集合互补
export function CoverContrastFigure() {
  const P: Record<string, [number, number]> = {
    '1': [130, 40],
    '2': [70, 130],
    '3': [190, 130],
    '4': [190, 218],
  }
  const edges: [string, string][] = [
    ['1', '2'],
    ['1', '3'],
    ['3', '4'],
  ]
  const panel = (dx: number, title: string, picked: string[], color: string) => (
    <g transform={`translate(${dx},0)`}>
      <text x="130" y="18" textAnchor="middle" fontSize="13" fontWeight="600" fill={color}>
        {title}
      </text>
      {edges.map(([a, b], i) => (
        <line key={i} x1={P[a][0]} y1={P[a][1] + 20} x2={P[b][0]} y2={P[b][1] - 20} stroke="var(--border-strong)" strokeWidth="1.6" />
      ))}
      {Object.entries(P).map(([k, [x, y]]) => {
        const on = picked.includes(k)
        return (
          <g key={k} transform={`translate(${x},${y})`}>
            <circle
              r="19"
              fill={on ? `color-mix(in srgb, ${color} 26%, var(--surface-3))` : 'var(--surface-3)'}
              stroke={on ? color : 'var(--border-strong)'}
              strokeWidth={on ? 2.4 : 1.5}
            />
            <text textAnchor="middle" y="5" fontSize="13" fontWeight="700" fill="var(--text-1)">
              {k}
            </text>
          </g>
        )
      })}
    </g>
  )
  return (
    <svg viewBox="0 0 560 268" role="img" aria-label="同一棵树上的最大独立集与最小点覆盖互补">
      {panel(10, '最大独立集：选 {2,4}', ['2', '4'], 'var(--viz-chosen)')}
      {panel(290, '最小点覆盖：选 {1,3}', ['1', '3'], 'var(--viz-source)')}
      <text x="280" y="258" textAnchor="middle" fontSize="12" fill="var(--text-2)">
        选中集互为补集：独立集要「谁都不挨着」，点覆盖要「每条边至少一端被选」。
      </text>
    </svg>
  )
}

// ④ 三状态支配集：放警卫 / 被孩子覆盖 / 等父亲
export function ThreeStateFigure() {
  const cell = (x: number, color: string, tag: string, desc: string) => (
    <g transform={`translate(${x},20)`}>
      <circle cx="40" cy="34" r="24" fill={`color-mix(in srgb, ${color} 22%, var(--surface-3))`} stroke={color} strokeWidth="2.2" />
      <text x="40" y="40" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--text-1)">
        u
      </text>
      <text x="40" y="82" textAnchor="middle" fontSize="12.5" fontWeight="600" fill={color}>
        {tag}
      </text>
      <text x="40" y="102" textAnchor="middle" fontSize="11.5" fill="var(--text-2)">
        {desc}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 560 150" role="img" aria-label="支配集的三种状态">
      {cell(30, 'var(--viz-chosen)', 'dp0 · 放警卫', '自己 + 全部孩子被覆盖')}
      {cell(220, 'var(--viz-source)', 'dp1 · 被孩子覆盖', '至少一个孩子放了警卫')}
      {cell(410, 'var(--viz-invalid)', 'dp2 · 等父亲', '暂时没人覆盖它')}
    </svg>
  )
}

// ⑤ 直径：两条最深孩子链在某点拼接
export function DiameterFigure() {
  // 峰顶 u 在中间，两侧各一条向下链
  const P: Record<string, [number, number]> = {
    u: [280, 46],
    a: [160, 130],
    a2: [120, 214],
    b: [400, 130],
    b2: [440, 214],
    c: [280, 130],
  }
  const chain: [string, string][] = [
    ['u', 'a'],
    ['a', 'a2'],
    ['u', 'b'],
    ['b', 'b2'],
  ]
  return (
    <svg viewBox="0 0 560 268" role="img" aria-label="过某点的最长链由两条最深孩子链拼成">
      {/* 非链边 */}
      <line x1={P.u[0]} y1={P.u[1] + 20} x2={P.c[0]} y2={P.c[1] - 20} stroke="var(--border-strong)" strokeWidth="1.6" />
      {/* 链边加粗 */}
      {chain.map(([a, b], i) => (
        <line key={i} x1={P[a][0]} y1={P[a][1] + 20} x2={P[b][0]} y2={P[b][1] - 20} stroke="var(--viz-chosen)" strokeWidth="3.4" />
      ))}
      {Object.entries(P).map(([k, [x, y]]) => {
        const onChain = k !== 'c'
        const peak = k === 'u'
        return (
          <g key={k} transform={`translate(${x},${y})`}>
            <circle
              r="20"
              fill={peak ? 'var(--grad-accent)' : onChain ? 'color-mix(in srgb, var(--viz-chosen) 20%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={peak ? 'var(--accent-2)' : onChain ? 'var(--viz-chosen)' : 'var(--border-strong)'}
              strokeWidth={peak ? 2.6 : onChain ? 2.2 : 1.5}
            />
            <text textAnchor="middle" y="5" fontSize="13" fontWeight="700" fill={peak ? 'var(--text-on-accent)' : 'var(--text-1)'}>
              {k === 'a2' || k === 'b2' ? '' : k === 'u' ? 'u' : ''}
            </text>
          </g>
        )
      })}
      <text x={P.u[0]} y={P.u[1] - 28} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--accent-1)">
        拐点 u
      </text>
      <text x="150" y="150" fontSize="11.5" fill="var(--viz-chosen)">最深链</text>
      <text x="360" y="150" fontSize="11.5" fill="var(--viz-chosen)">次深链</text>
      <text x="280" y="258" textAnchor="middle" fontSize="12" fill="var(--text-2)">
        每个点当一次「拐点」，取它两条最深的向下链拼起来——全局最大即直径。
      </text>
    </svg>
  )
}

// ⑥ 树上背包依赖：选子必先选连它的边
export function TreeKnapDepFigure() {
  return (
    <svg viewBox="0 0 560 200" role="img" aria-label="树上背包：选子树先花掉连父亲的边">
      <Node x={160} y={44} label="u" accent />
      <Node x={160} y={150} label="c" />
      <line x1="160" y1="64" x2="160" y2="130" stroke="var(--viz-chosen)" strokeWidth="3" />
      <g transform="translate(178,84)">
        <rect width="120" height="34" rx="9" fill="color-mix(in srgb, var(--viz-chosen) 14%, var(--surface-2))" stroke="var(--viz-chosen)" strokeWidth="1.4" />
        <text x="60" y="15" textAnchor="middle" fontSize="11" fill="var(--text-1)">连 c 的边</text>
        <text x="60" y="28" textAnchor="middle" fontSize="11" className="mono" fill="var(--viz-chosen)">先花 1 条容量</text>
      </g>
      <g transform="translate(330,54)">
        <rect width="210" height="110" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="105" y="26" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">给孩子 c 这一组分 t 条边</text>
        <text x="105" y="54" textAnchor="middle" fontSize="13" className="mono" fill="var(--text-1)">收益 = 边权(c)</text>
        <text x="105" y="76" textAnchor="middle" fontSize="13" className="mono" fill="var(--accent-1)">+ dp[c][t−1]</text>
        <text x="105" y="98" textAnchor="middle" fontSize="11.5" fill="var(--text-2)">（1 条连边 + t−1 条子树内）</text>
      </g>
      <text x="280" y="190" textAnchor="middle" fontSize="12" fill="var(--text-2)">
        每个孩子是一「组」物品，父亲对孩子们做分组背包——这就是有依赖背包的树上形态。
      </text>
    </svg>
  )
}

// ⑦ 联合权值：距离 2 = 有公共中间点
export function JointWeightFigure() {
  return (
    <svg viewBox="0 0 560 200" role="img" aria-label="距离为 2 的点对有一个公共中间点">
      <Node x={280} y={44} label="m" accent />
      <Node x={150} y={150} label="a" />
      <Node x={410} y={150} label="b" />
      <line x1="280" y1="64" x2="150" y2="130" stroke="var(--viz-source)" strokeWidth="2.6" />
      <line x1="280" y1="64" x2="410" y2="130" stroke="var(--viz-source)" strokeWidth="2.6" />
      <path d="M150 168 Q280 226 410 168" fill="none" stroke="var(--accent-2)" strokeWidth="2" strokeDasharray="5 4" />
      <text x="280" y="212" textAnchor="middle" fontSize="12" fill="var(--accent-1)">
        dist(a,b) = 2
      </text>
      <text x="210" y="105" fontSize="11.5" fill="var(--viz-source)">1 步</text>
      <text x="340" y="105" fontSize="11.5" fill="var(--viz-source)">1 步</text>
      <text x="490" y="52" fontSize="12" fill="var(--text-2)">中间点 m</text>
      <text x="280" y="26" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
        枚举中间点 m，它的邻居两两配对即所有距离 2 点对
      </text>
    </svg>
  )
}
