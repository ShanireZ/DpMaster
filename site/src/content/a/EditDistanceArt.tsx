// 编辑距离讲解用的插图（on-brand SVG，随强调色变色；A 线性 DP 部分自动着蓝紫宝石调）。
// 不引外部图片；不做 opacity:0 起步动画。

// ① 引入图：三种基本操作把 "cat" 一步步改写——删 / 插 / 改各一例。
export function SetupFigure() {
  const rows = [
    { op: '删', from: 'cart', mark: 2, to: 'cat', note: '去掉一个字符 r' },
    { op: '插', from: 'cat', mark: -1, to: 'cats', note: '补上一个字符 s' },
    { op: '改', from: 'cat', mark: 2, to: 'cot', note: '替换一个字符 a→o' },
  ]
  const colr = (op: string) =>
    op === '删' ? 'var(--viz-invalid)' : op === '插' ? 'var(--viz-chosen)' : 'var(--viz-current)'
  return (
    <svg viewBox="0 0 640 210" role="img" aria-label="删、插、改三种基本编辑操作各一例">
      <defs>
        <marker id="ed-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      {rows.map((r, i) => {
        const y = 18 + i * 62
        return (
          <g key={i} transform={`translate(0,${y})`}>
            <g transform="translate(16,0)">
              <rect width="52" height="42" rx="11" fill={colr(r.op)} opacity="0.16" stroke={colr(r.op)} strokeWidth="1.5" />
              <text x="26" y="27" textAnchor="middle" fontSize="16" fontWeight="700" fill={colr(r.op)}>
                {r.op}
              </text>
            </g>
            {/* from 串 */}
            <g transform="translate(88,0)">
              {r.from.split('').map((ch, k) => (
                <g key={k} transform={`translate(${k * 34},0)`}>
                  <rect
                    width="30"
                    height="42"
                    rx="8"
                    fill={k === r.mark ? `color-mix(in srgb, ${colr(r.op)} 22%, var(--surface-3))` : 'var(--surface-3)'}
                    stroke={k === r.mark ? colr(r.op) : 'var(--border-strong)'}
                    strokeWidth="1.5"
                  />
                  <text x="15" y="27" textAnchor="middle" fontSize="17" className="mono" fill="var(--text-1)">
                    {ch}
                  </text>
                </g>
              ))}
            </g>
            <path d={`M ${100 + r.from.length * 34} 21 H ${142 + r.from.length * 34}`} stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#ed-ar)" />
            {/* to 串 */}
            <g transform={`translate(${158 + r.from.length * 34},0)`}>
              {r.to.split('').map((ch, k) => (
                <g key={k} transform={`translate(${k * 34},0)`}>
                  <rect width="30" height="42" rx="8" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
                  <text x="15" y="27" textAnchor="middle" fontSize="17" className="mono" fill="var(--text-1)">
                    {ch}
                  </text>
                </g>
              ))}
            </g>
            <text x={188 + r.from.length * 34 + r.to.length * 34} y="26" fontSize="12" fill="var(--text-3)">
              {r.note}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ② 转移决策图：dp[i][j] 从上（删）、左（插）、左上（改/匹配）三个邻格取 min。
export function TransitionFigure() {
  const CW = 96
  const CH = 46
  const gx = (c: number) => 70 + c * 150
  const gy = (r: number) => 40 + r * 92
  const cxp = (c: number) => gx(c) + CW / 2
  const cyp = (r: number) => gy(r) + CH / 2
  const cells = [
    { c: 0, r: 0, t: 'dp[i−1][j−1]', kind: 'sub' as const, tag: '改/匹配' },
    { c: 1, r: 0, t: 'dp[i−1][j]', kind: 'del' as const, tag: '删' },
    { c: 0, r: 1, t: 'dp[i][j−1]', kind: 'ins' as const, tag: '插' },
    { c: 1, r: 1, t: 'dp[i][j]', kind: 'cur' as const, tag: '' },
  ]
  const col = (k: string) =>
    k === 'del' ? 'var(--viz-invalid)' : k === 'ins' ? 'var(--viz-chosen)' : k === 'sub' ? 'var(--viz-current)' : 'var(--accent-2)'
  return (
    <svg viewBox="0 0 380 224" role="img" aria-label="dp[i][j] 从上邻、左邻、左上邻三个来源取最小">
      <defs>
        <marker id="edt-del" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-invalid)" />
        </marker>
        <marker id="edt-ins" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-chosen)" />
        </marker>
        <marker id="edt-sub" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-current)" />
        </marker>
      </defs>
      {/* 三条来源箭头（指向右下当前格） */}
      <line x1={cxp(0)} y1={gy(0) + CH} x2={cxp(1) - 46} y2={gy(1)} stroke={col('sub')} strokeWidth="2.5" markerEnd="url(#edt-sub)" />
      <line x1={cxp(1)} y1={gy(0) + CH} x2={cxp(1)} y2={gy(1)} stroke={col('del')} strokeWidth="2.5" markerEnd="url(#edt-del)" />
      <line x1={gx(0) + CW} y1={cyp(1)} x2={gx(1)} y2={cyp(1)} stroke={col('ins')} strokeWidth="2.5" markerEnd="url(#edt-ins)" />
      {cells.map((cell, i) => {
        const cur = cell.kind === 'cur'
        return (
          <g key={i} transform={`translate(${gx(cell.c)},${gy(cell.r)})`}>
            {cell.tag && (
              <text x={CW / 2} y="-8" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={col(cell.kind)}>
                {cell.tag}{cell.kind === 'sub' ? ' +0/1' : ' +1'}
              </text>
            )}
            <rect
              width={CW}
              height={CH}
              rx="10"
              fill={cur ? 'color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))' : `color-mix(in srgb, ${col(cell.kind)} 12%, var(--surface-3))`}
              stroke={cur ? 'var(--accent-2)' : col(cell.kind)}
              strokeWidth="1.5"
            />
            <text x={CW / 2} y={CH / 2 + 5} textAnchor="middle" fontSize="13" className="mono" fill="var(--text-1)">
              {cell.t}
            </text>
          </g>
        )
      })}
      <text x={cxp(1)} y={gy(1) + CH + 20} textAnchor="middle" fontSize="12" fill="var(--text-2)">
        取三者最小
      </text>
    </svg>
  )
}

// ③ 带权对照图：普通编辑距离每步恒 +1；带权版把「改」的代价换成两字符的差异度。
export function WeightedFigure() {
  const rows = [
    { label: '普通', c1: '删 = 1', c2: '插 = 1', c3: '改 = 1', accent: false },
    { label: '带权', c1: '删 = k(空位)', c2: '插 = k(空位)', c3: "改 = |A[i]−B[j]|", accent: true },
  ]
  return (
    <svg viewBox="0 0 560 170" role="img" aria-label="普通编辑距离与带权编辑距离的单步代价对比">
      {rows.map((r, i) => {
        const y = 18 + i * 76
        const stroke = r.accent ? 'var(--accent-2)' : 'var(--border-strong)'
        const fillHead = r.accent ? 'var(--grad-accent)' : 'var(--surface-3)'
        const headTxt = r.accent ? 'var(--text-on-accent)' : 'var(--text-2)'
        const cells = [r.c1, r.c2, r.c3]
        return (
          <g key={i} transform={`translate(0,${y})`}>
            <g transform="translate(16,0)">
              <rect width="72" height="54" rx="12" fill={fillHead} stroke={stroke} strokeWidth="1.5" />
              <text x="36" y="32" textAnchor="middle" fontSize="14" fontWeight="700" fill={headTxt}>
                {r.label}
              </text>
            </g>
            {cells.map((c, k) => (
              <g key={k} transform={`translate(${104 + k * 150},0)`}>
                <rect
                  width="138"
                  height="54"
                  rx="12"
                  fill={r.accent ? 'color-mix(in srgb, var(--accent-1) 10%, var(--surface-3))' : 'var(--surface-3)'}
                  stroke={stroke}
                  strokeWidth="1.5"
                />
                <text x="69" y="32" textAnchor="middle" fontSize="14" className="mono" fill={r.accent ? 'var(--accent-1)' : 'var(--text-1)'}>
                  {c}
                </text>
              </g>
            ))}
          </g>
        )
      })}
      <text x="280" y="166" textAnchor="middle" fontSize="12" fill="var(--text-3)">
        代价从「恒 1」推广到「按字符差异」——编辑距离即最小代价的带权序列对齐
      </text>
    </svg>
  )
}
