// E 换根 DP 讲解用插图（on-brand SVG，随 [data-part='e'] 的灰紫强调色变色）。
// 画法仿 KnapsackArt：节点=circle、边=line，颜色只用设计令牌。

// —— 小工具：一个树节点圆 ——
function Node({
  x,
  y,
  label,
  sub,
  variant = 'plain',
  r = 19,
}: {
  x: number
  y: number
  label: string
  sub?: string
  variant?: 'plain' | 'root' | 'in' | 'out' | 'best'
  r?: number
}) {
  const style = {
    plain: { fill: 'var(--surface-3)', stroke: 'var(--border-strong)', sw: 1.5, tx: 'var(--text-1)' },
    root: { fill: 'var(--grad-accent)', stroke: 'var(--accent-1)', sw: 2.5, tx: 'var(--text-on-accent)' },
    in: {
      fill: 'color-mix(in srgb, var(--viz-source) 16%, var(--surface-3))',
      stroke: 'var(--viz-source)',
      sw: 2,
      tx: 'var(--text-1)',
    },
    out: {
      fill: 'color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))',
      stroke: 'color-mix(in srgb, var(--accent-1) 55%, var(--border-strong))',
      sw: 1.8,
      tx: 'var(--text-1)',
    },
    best: {
      fill: 'color-mix(in srgb, var(--viz-chosen) 18%, var(--surface-3))',
      stroke: 'var(--viz-chosen)',
      sw: 2.4,
      tx: 'var(--text-1)',
    },
  }[variant]
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={r} fill={style.fill} stroke={style.stroke} strokeWidth={style.sw} />
      <text y={sub ? -3 : 5} textAnchor="middle" fontSize="13.5" fontWeight="700" fill={style.tx}>
        {label}
      </text>
      {sub && (
        <text y="13" textAnchor="middle" fontSize="9" className="mono" fill={style.tx}>
          {sub}
        </text>
      )}
    </g>
  )
}

function Edge({ x1, y1, x2, y2, on = false }: { x1: number; y1: number; x2: number; y2: number; on?: boolean }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={on ? 'var(--accent-1)' : 'var(--border-strong)'}
      strokeWidth={on ? 3 : 1.8}
      strokeLinecap="round"
    />
  )
}

// ============ 图 1：为什么暴力 O(n²)——每个点各跑一遍 BFS ============
export function BruteFigure() {
  // 三份「同一棵小树、不同根」的缩略图，示意「每个点都从头算一遍」
  const mini = (ox: number, rootIdx: number, label: string) => {
    const pos = [
      { x: 40, y: 16 },
      { x: 16, y: 54 },
      { x: 64, y: 54 },
    ]
    const edges = [
      [0, 1],
      [0, 2],
    ]
    return (
      <g transform={`translate(${ox},0)`}>
        {edges.map(([a, b], i) => (
          <Edge key={i} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} />
        ))}
        {pos.map((p, i) => (
          <Node key={i} x={p.x} y={p.y} label={`${i + 1}`} variant={i === rootIdx ? 'root' : 'plain'} r={13} />
        ))}
        <text x="40" y="92" textAnchor="middle" fontSize="11" fill="var(--text-2)">
          {label}
        </text>
      </g>
    )
  }
  return (
    <svg viewBox="0 0 560 130" role="img" aria-label="暴力：每个点各自从头跑一遍，共 n 遍">
      {mini(30, 0, '以 1 为根：BFS')}
      {mini(190, 1, '以 2 为根：再 BFS')}
      {mini(350, 2, '以 3 为根：又 BFS')}
      <g transform="translate(470,50)">
        <text x="0" y="0" fontSize="13" fill="var(--text-2)">
          …共 n 遍
        </text>
        <text x="0" y="22" fontSize="15" className="mono" fill="var(--viz-invalid)">
          O(n²)
        </text>
      </g>
    </svg>
  )
}

// ============ 图 2：两遍扫描骨架（Pass1 后序求 sz、Pass2 前序换根） ============
export function TwoPassFigure() {
  // 一棵 7 点树的坐标（根在上）
  const pos = [
    { x: 210, y: 30 }, // 1 (root)
    { x: 120, y: 96 }, // 2
    { x: 300, y: 96 }, // 3
    { x: 70, y: 162 }, // 4
    { x: 168, y: 162 }, // 5
    { x: 252, y: 162 }, // 6
    { x: 348, y: 162 }, // 7
  ]
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
  ]
  return (
    <svg viewBox="0 0 640 214" role="img" aria-label="换根两遍 DFS：第一遍后序求子树大小，第二遍前序换根">
      <defs>
        <marker id="rr-up" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-source)" />
        </marker>
        <marker id="rr-dn" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-1)" />
        </marker>
      </defs>
      {edges.map(([a, b], i) => (
        <Edge key={i} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} />
      ))}
      {pos.map((p, i) => (
        <Node key={i} x={p.x} y={p.y} label={`${i + 1}`} variant={i === 0 ? 'root' : 'plain'} />
      ))}
      {/* Pass1 上行箭头（叶→根） */}
      <path d="M92 150 Q60 124 108 104" fill="none" stroke="var(--viz-source)" strokeWidth="2" markerEnd="url(#rr-up)" />
      <text x="44" y="128" fontSize="11" fill="var(--viz-source)">
        第一遍
      </text>
      <text x="44" y="142" fontSize="10" fill="var(--viz-source)">
        后序求 sz
      </text>
      {/* Pass2 下行箭头（根→子换根） */}
      <path d="M300 116 Q340 138 322 150" fill="none" stroke="var(--accent-1)" strokeWidth="2" markerEnd="url(#rr-dn)" />
      <text x="470" y="80" fontSize="11" fill="var(--accent-1)">
        第二遍
      </text>
      <text x="470" y="94" fontSize="10" fill="var(--accent-1)">
        前序换根
      </text>
      <text x="470" y="120" fontSize="10.5" className="mono" fill="var(--viz-chosen)">
        合计 O(n)
      </text>
    </svg>
  )
}

// ============ 图 3：换根系数 = n − 2·sz（子树内近 1、子树外远 1） ============
export function CoefFigure() {
  return (
    <svg viewBox="0 0 620 220" role="img" aria-label="根从 u 挪到子 v：子树内每点近 1，子树外每点远 1">
      <defs>
        <marker id="rr-mv" markerWidth="9" markerHeight="9" refX="7" refY="3.2" orient="auto">
          <path d="M0,0 L7,3.2 L0,6.4 Z" fill="var(--accent-1)" />
        </marker>
      </defs>
      {/* u 与 v 两点 + 边 */}
      <Edge x1={200} y1={60} x2={200} y2={140} on />
      <Node x={200} y={60} label="u" variant="plain" r={22} />
      <Node x={200} y={140} label="v" variant="root" r={22} />
      <path d="M240 100 L286 100" stroke="var(--accent-1)" strokeWidth="2.4" markerEnd="url(#rr-mv)" />
      <text x="263" y="90" textAnchor="middle" fontSize="11" fill="var(--accent-1)">
        根 u→v
      </text>

      {/* 子树内（v 一侧）气泡：近 1 */}
      <g transform="translate(120,150)">
        <ellipse
          cx="80"
          cy="34"
          rx="96"
          ry="44"
          fill="color-mix(in srgb, var(--viz-source) 10%, transparent)"
          stroke="var(--viz-source)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <text x="80" y="30" textAnchor="middle" fontSize="12.5" fill="var(--viz-source)">
          v 的子树 · sz 个点
        </text>
        <text x="80" y="50" textAnchor="middle" fontSize="12" className="mono" fill="var(--viz-source)">
          每点 −1（更近）
        </text>
      </g>

      {/* 子树外（u 一侧）气泡：远 1 */}
      <g transform="translate(330,20)">
        <ellipse
          cx="120"
          cy="40"
          rx="128"
          ry="46"
          fill="color-mix(in srgb, var(--accent-1) 8%, transparent)"
          stroke="color-mix(in srgb, var(--accent-1) 55%, var(--border-strong))"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <text x="120" y="34" textAnchor="middle" fontSize="12.5" fill="var(--accent-1)">
          其余 n − sz 个点
        </text>
        <text x="120" y="54" textAnchor="middle" fontSize="12" className="mono" fill="var(--accent-1)">
          每点 +1（更远）
        </text>
      </g>

      {/* 结论条 */}
      <g transform="translate(96,196)">
        <rect
          width="428"
          height="20"
          rx="10"
          fill="color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))"
          stroke="color-mix(in srgb, var(--viz-chosen) 40%, transparent)"
          strokeWidth="1"
        />
        <text x="214" y="14" textAnchor="middle" fontSize="12" className="mono" fill="var(--text-1)">
          Δ = +(n−sz) − sz = n − 2·sz　⇒　f[v] = f[u] + (n − 2·sz[v])
        </text>
      </g>
    </svg>
  )
}

// ============ 图 4：距离和场景（带权，会议/奶牛聚会） ============
export function DistSetupFigure() {
  const pos = [
    { x: 100, y: 40, w: 2 },
    { x: 250, y: 40, w: 5 },
    { x: 400, y: 40, w: 1 },
    { x: 175, y: 130, w: 3 },
    { x: 325, y: 130, w: 4 },
  ]
  const edges = [
    [0, 3],
    [1, 3],
    [1, 4],
    [2, 4],
  ]
  return (
    <svg viewBox="0 0 520 180" role="img" aria-label="带点权的树：每个村庄有人数，求集合点使总距离最小">
      {edges.map(([a, b], i) => (
        <Edge key={i} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} />
      ))}
      {pos.map((p, i) => (
        <Node key={i} x={p.x} y={p.y} label={`${i + 1}`} sub={`×${p.w}`} variant={i === 3 ? 'best' : 'plain'} r={21} />
      ))}
      <text x="175" y="172" textAnchor="middle" fontSize="11.5" fill="var(--viz-chosen)">
        绿圈=当前最优集合点（带权距离和最小）
      </text>
      <text x="440" y="40" fontSize="11" fill="var(--text-3)">
        ×w = 该点
      </text>
      <text x="440" y="55" fontSize="11" fill="var(--text-3)">
        人数/牛数
      </text>
    </svg>
  )
}

// ============ 图 5：子树内 down + 子树外 up ============
export function InOutFigure() {
  return (
    <svg viewBox="0 0 560 210" role="img" aria-label="每点距离和 = 子树内 down 加子树外 up">
      {/* 中心点 u */}
      <Node x={280} y={104} label="u" variant="root" r={24} />
      {/* 向下（子树内）三叉 */}
      <Edge x1={280} y1={104} x2={210} y2={170} on />
      <Edge x1={280} y1={104} x2={280} y2={178} on />
      <Edge x1={280} y1={104} x2={350} y2={170} on />
      <Node x={210} y={176} label="" variant="in" r={12} />
      <Node x={280} y={184} label="" variant="in" r={12} />
      <Node x={350} y={176} label="" variant="in" r={12} />
      {/* 向上（子树外）父方向 */}
      <Edge x1={280} y1={104} x2={280} y2={40} />
      <Node x={280} y={32} label="p" variant="out" r={16} />
      {/* down 气泡 */}
      <g transform="translate(150,150)">
        <ellipse
          cx="130"
          cy="30"
          rx="140"
          ry="42"
          fill="color-mix(in srgb, var(--viz-source) 8%, transparent)"
          stroke="var(--viz-source)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <text x="130" y="66" textAnchor="middle" fontSize="12" fill="var(--viz-source)">
          子树内 down[u]：第一遍后序备好
        </text>
      </g>
      {/* up 标注 */}
      <g transform="translate(300,20)">
        <text x="0" y="10" fontSize="12" fill="var(--accent-1)">
          子树外 up[u]（父方向）
        </text>
        <text x="0" y="27" fontSize="11" fill="var(--text-2)">
          = 父的全部 − 朝自己子树那部分
        </text>
        <text x="0" y="44" fontSize="11" fill="var(--text-2)">
          第二遍前序由父传子
        </text>
      </g>
      {/* 合并条 */}
      <g transform="translate(70,2)">
        <rect
          width="200"
          height="20"
          rx="10"
          fill="color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))"
          stroke="color-mix(in srgb, var(--viz-chosen) 40%, transparent)"
          strokeWidth="1"
        />
        <text x="100" y="14" textAnchor="middle" fontSize="11.5" className="mono" fill="var(--text-1)">
          dist[u] = down[u] + up[u]
        </text>
      </g>
    </svg>
  )
}

// ============ 图 6：偏心距 / 树的中心（每点到最远点） ============
export function EccentricityFigure() {
  // 一条主链 + 一个分支，标出每点「到最远点距离」= 偏心距
  const pos = [
    { x: 60, y: 100 },
    { x: 160, y: 100 },
    { x: 260, y: 100 },
    { x: 360, y: 100 },
    { x: 460, y: 100 },
    { x: 260, y: 40 }, // 分支
  ]
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [2, 5],
  ]
  const ecc = [4, 3, 2, 3, 4, 3] // 每点偏心距（到最远点边数）
  return (
    <svg viewBox="0 0 540 170" role="img" aria-label="每个点的偏心距=它到最远点的距离，最小者是树的中心">
      {edges.map(([a, b], i) => (
        <Edge key={i} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} />
      ))}
      {pos.map((p, i) => (
        <Node
          key={i}
          x={p.x}
          y={p.y}
          label={`${i + 1}`}
          sub={`e${ecc[i]}`}
          variant={ecc[i] === 2 ? 'best' : 'plain'}
          r={20}
        />
      ))}
      <text x="260" y="150" textAnchor="middle" fontSize="11.5" fill="var(--viz-chosen)">
        绿圈=偏心距最小(2)=树的中心
      </text>
      <text x="470" y="150" fontSize="10.5" className="mono" fill="var(--text-3)">
        e = 偏心距
      </text>
      {/* 直径标注：1↔5 长度 4 */}
      <path
        d="M60 128 Q260 152 460 128"
        fill="none"
        stroke="var(--accent-1)"
        strokeWidth="1.5"
        strokeDasharray="5 4"
      />
      <text x="150" y="146" fontSize="10.5" fill="var(--accent-1)">
        直径 = 最长链(1↔5，长 4)
      </text>
    </svg>
  )
}
