// 背包综合变形（方案数 / 布尔可行 / 撤销）讲解用插图（on-brand SVG，随强调色变色）

// 引入图：容量骨架不变，只把中间的「聚合算子」换掉——max→最优、+→方案数、||→可行。
export function OperatorSwapFigure() {
  const ops = [
    { sym: 'max', out: '最优价值', tint: 'var(--accent-1)' },
    { sym: '+', out: '方案数', tint: 'var(--accent-2)' },
    { sym: '||', out: '可行 / 否', tint: 'var(--text-2)' },
  ]
  return (
    <svg viewBox="0 0 640 210" role="img" aria-label="容量骨架不变，替换聚合算子得到不同问题">
      <defs>
        <marker id="ov-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      {/* 左侧：不变的转移骨架 */}
      <g transform="translate(20,66)">
        <rect width="150" height="78" rx="14" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="75" y="26" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">容量骨架（不变）</text>
        <text x="75" y="52" textAnchor="middle" fontSize="13" className="mono" fill="var(--text-1)">f[j] ⊕ f[j−w]</text>
        <text x="75" y="69" textAnchor="middle" fontSize="11" fill="var(--text-3)">枚举物品 · 逐容量</text>
      </g>
      <path d="M170 105 H214" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#ov-ar)" />
      <text x="192" y="96" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">换 ⊕</text>
      {/* 右侧：三种算子分叉出三类问题 */}
      {ops.map((o, i) => (
        <g key={i} transform={`translate(230,${18 + i * 62})`}>
          <rect
            width="390"
            height="50"
            rx="12"
            fill={`color-mix(in srgb, ${o.tint} 10%, var(--surface-3))`}
            stroke={o.tint}
            strokeWidth="1.5"
          />
          <g transform="translate(14,10)">
            <rect width="52" height="30" rx="8" fill="color-mix(in srgb, var(--surface-1) 60%, var(--surface-3))" stroke={o.tint} strokeWidth="1.2" />
            <text x="26" y="20" textAnchor="middle" fontSize="15" className="mono" fill={o.tint}>{o.sym}</text>
          </g>
          <text x="86" y="30" fontSize="13" className="mono" fill="var(--text-2)">⊕ =</text>
          <text x="140" y="30" fontSize="14" fill="var(--text-1)">{o.out}</text>
        </g>
      ))}
    </svg>
  )
}

// 计数累加图：物品 w=[2,3,5]、目标容量 5，f[5] 由 {2,3} 与 {5} 两条路各贡献 1 → 方案数 2。
export function CountBuildFigure() {
  const cells = [0, 1, 2, 3, 4, 5]
  const vals = [1, 0, 1, 1, 0, 2] // 三件全部做完后 f[0..5]
  const x0 = 40
  const dx = 96
  const cw = 66
  const ch = 44
  const cx = (i: number) => x0 + i * dx
  return (
    <svg viewBox="0 0 640 190" role="img" aria-label="方案数如何由两条组合各累加 1 得到">
      <defs>
        <marker id="cb-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>
      {cells.map((j, i) => (
        <text key={`h${i}`} x={cx(i) + cw / 2} y="18" textAnchor="middle" fontSize="12" className="mono" fill="var(--text-3)">
          j={j}
        </text>
      ))}
      {cells.map((j, i) => {
        const hi = j === 5
        const zero = vals[i] === 0
        return (
          <g key={`c${i}`} transform={`translate(${cx(i)},30)`}>
            <rect
              width={cw}
              height={ch}
              rx="10"
              fill={hi ? 'color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={hi ? 'var(--accent-2)' : 'var(--border-strong)'}
              strokeWidth="1.5"
            />
            <text
              x={cw / 2}
              y={ch / 2 + 6}
              textAnchor="middle"
              fontSize="18"
              className="mono"
              fill={hi ? 'var(--accent-1)' : zero ? 'var(--text-3)' : 'var(--text-1)'}
            >
              {vals[i]}
            </text>
          </g>
        )
      })}
      {/* 两条贡献路径汇入 f[5] */}
      <text x={cx(5) + cw / 2} y="98" textAnchor="middle" fontSize="12" fill="var(--text-2)">f[5] = 2</text>
      <g fontSize="12.5" fill="var(--text-1)">
        <rect x="150" y="120" width="150" height="50" rx="10" fill="var(--surface-2)" stroke="var(--accent-2)" strokeWidth="1.3" />
        <text x="225" y="141" textAnchor="middle" className="mono">{'{2, 3}'}</text>
        <text x="225" y="160" textAnchor="middle" fontSize="11" fill="var(--text-3)">贡献 1 种</text>
        <rect x="330" y="120" width="150" height="50" rx="10" fill="var(--surface-2)" stroke="var(--accent-2)" strokeWidth="1.3" />
        <text x="405" y="141" textAnchor="middle" className="mono">{'{5}'}</text>
        <text x="405" y="160" textAnchor="middle" fontSize="11" fill="var(--text-3)">贡献 1 种</text>
      </g>
      <path d="M240 120 L520 88" stroke="var(--accent-2)" strokeWidth="1.8" markerEnd="url(#cb-ar)" fill="none" opacity="0.75" />
      <path d="M400 120 L540 88" stroke="var(--accent-2)" strokeWidth="1.8" markerEnd="url(#cb-ar)" fill="none" opacity="0.75" />
    </svg>
  )
}

// 撤销图（P4141 消失之物）：先算含全部物品的方案数 g[j]，再对某件做逆操作
// g[j] -= g[j-w]（正序）退掉它的贡献，得到「缺这件」的方案数。方向与加时相反。
export function UndoFigure() {
  return (
    <svg viewBox="0 0 640 214" role="img" aria-label="从全集方案数撤销某一物品的贡献">
      <defs>
        <marker id="un-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
        <marker id="un-back" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-invalid)" />
        </marker>
      </defs>
      {/* 上：含全部物品的方案数 g */}
      <g transform="translate(200,10)">
        <rect width="240" height="56" rx="14" fill="color-mix(in srgb, var(--accent-1) 12%, var(--surface-3))" stroke="var(--accent-2)" strokeWidth="1.8" />
        <text x="120" y="24" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">先算「含全部物品」</text>
        <text x="120" y="45" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">g[j] = 全集方案数</text>
      </g>
      <path d="M320 66 L320 96" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#un-ar)" />
      <text x="336" y="86" fontSize="12" fill="var(--viz-invalid)">退掉第 k 件</text>
      {/* 中：逆操作 */}
      <g transform="translate(150,100)">
        <rect width="340" height="52" rx="12" fill="var(--surface-2)" stroke="var(--viz-invalid)" strokeWidth="1.6" />
        <text x="170" y="22" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">逆操作（正序 j: w → W）</text>
        <text x="170" y="43" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">g[j] −= g[j − w]</text>
      </g>
      <path d="M320 152 L320 180" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#un-ar)" />
      {/* 下：结果 */}
      <g transform="translate(190,182)">
        <rect width="260" height="30" rx="10" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="130" y="20" textAnchor="middle" fontSize="13" className="mono" fill="var(--accent-1)">缺第 k 件时的方案数</text>
      </g>
      {/* 侧注：加是倒序、退是正序 */}
      <g transform="translate(20,104)">
        <text x="0" y="0" fontSize="11.5" fill="var(--text-3)">加它：</text>
        <path d="M52 -4 L4 -4" stroke="var(--accent-2)" strokeWidth="1.6" markerEnd="url(#un-ar)" />
        <text x="0" y="18" fontSize="11" className="mono" fill="var(--text-3)">倒序 W→w</text>
        <text x="0" y="42" fontSize="11.5" fill="var(--viz-invalid)">退它：</text>
        <path d="M8 38 L56 38" stroke="var(--viz-invalid)" strokeWidth="1.6" markerEnd="url(#un-back)" />
        <text x="0" y="60" fontSize="11" className="mono" fill="var(--viz-invalid)">正序 w→W</text>
      </g>
    </svg>
  )
}
