// 矩阵快速幂讲解用的插图（on-brand SVG，随 D 部分强调色变色，勿用外部图片）。

// 引入图：线性递推 f[i]=f[i-1]+f[i-2]，n 极大时逐项递推 O(n) 爆炸。
export function RecurExplodeFigure() {
  const cells = [
    { i: 0, v: '1' },
    { i: 1, v: '1' },
    { i: 2, v: '2' },
    { i: 3, v: '3' },
    { i: 4, v: '5' },
    { i: 5, v: '8' },
  ]
  const x0 = 24
  const dx = 74
  const cw = 60
  return (
    <svg viewBox="0 0 640 172" role="img" aria-label="线性递推逐项计算，n 极大时超时">
      <defs>
        <marker id="mp-re" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>
      {cells.map((c, i) => (
        <g key={i} transform={`translate(${x0 + i * dx},46)`}>
          <text x={cw / 2} y="-8" textAnchor="middle" fontSize="11.5" className="mono" fill="var(--text-3)">
            f[{c.i}]
          </text>
          <rect width={cw} height="46" rx="10" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <text x={cw / 2} y="30" textAnchor="middle" fontSize="17" className="mono" fill="var(--text-1)">
            {c.v}
          </text>
        </g>
      ))}
      {/* 相邻两格相加的弧线 */}
      {[0, 1, 2, 3].map((i) => (
        <path
          key={`a${i}`}
          d={`M ${x0 + i * dx + cw / 2} 40 Q ${x0 + i * dx + dx} 14 ${x0 + (i + 2) * dx + cw / 2} 40`}
          fill="none"
          stroke="var(--accent-2)"
          strokeWidth="1.6"
          markerEnd="url(#mp-re)"
          opacity="0.85"
        />
      ))}
      {/* 省略号 + 远端天文数字项 */}
      <text x={x0 + 6 * dx - 8} y="76" fontSize="20" className="mono" fill="var(--text-3)">
        · · ·
      </text>
      <g transform={`translate(${x0 + 6 * dx + 40},46)`}>
        <rect width="120" height="46" rx="10" fill="color-mix(in srgb, var(--viz-invalid) 14%, var(--surface-3))" stroke="var(--viz-invalid)" strokeWidth="1.5" />
        <text x="60" y="20" textAnchor="middle" fontSize="12" className="mono" fill="var(--viz-invalid)">
          f[n]
        </text>
        <text x="60" y="36" textAnchor="middle" fontSize="11" fill="var(--viz-invalid)">
          n ≈ 2⁶³
        </text>
      </g>
      <text x="320" y="146" textAnchor="middle" fontSize="13" fill="var(--text-2)">
        逐项递推要走 <tspan className="mono" fill="var(--viz-invalid)">n</tspan> 步——n 达 2⁶³ 时 O(n) 必然超时
      </text>
    </svg>
  )
}

// 推导图：状态向量 × 转移矩阵 = 位移后的向量。[F(n), F(n-1)] = [F(n-1), F(n-2)] · M。
export function VecMatFigure() {
  return (
    <svg viewBox="0 0 640 210" role="img" aria-label="状态向量乘以转移矩阵得到下一状态向量">
      <defs>
        <marker id="mp-vm" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-1)" />
        </marker>
      </defs>
      {/* 旧向量 */}
      <g transform="translate(24,58)">
        <text x="76" y="-14" textAnchor="middle" fontSize="11.5" fill="var(--text-3)">旧状态（行向量）</text>
        <rect width="152" height="42" rx="10" fill="var(--surface-3)" stroke="var(--viz-source)" strokeWidth="1.6" />
        <text x="76" y="27" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
          [ F(n−1)  F(n−2) ]
        </text>
      </g>
      <text x="192" y="86" fontSize="20" className="mono" fill="var(--text-3)">×</text>
      {/* 转移矩阵 */}
      <g transform="translate(214,40)">
        <text x="60" y="-4" textAnchor="middle" fontSize="11.5" fill="var(--text-3)">转移矩阵 M</text>
        <rect width="120" height="78" rx="10" fill="color-mix(in srgb, var(--accent-1) 10%, var(--surface-3))" stroke="var(--accent-2)" strokeWidth="1.8" />
        <text x="42" y="34" textAnchor="middle" fontSize="16" className="mono" fill="var(--text-1)">1</text>
        <text x="80" y="34" textAnchor="middle" fontSize="16" className="mono" fill="var(--text-1)">1</text>
        <text x="42" y="62" textAnchor="middle" fontSize="16" className="mono" fill="var(--text-1)">1</text>
        <text x="80" y="62" textAnchor="middle" fontSize="16" className="mono" fill="var(--text-1)">0</text>
      </g>
      <text x="352" y="86" fontSize="20" className="mono" fill="var(--text-3)">=</text>
      {/* 新向量 */}
      <g transform="translate(378,58)">
        <text x="76" y="-14" textAnchor="middle" fontSize="11.5" fill="var(--text-3)">新状态</text>
        <rect
          width="152"
          height="42"
          rx="10"
          fill="color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))"
          stroke="var(--accent-2)"
          strokeWidth="1.8"
        />
        <text x="76" y="27" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
          [ F(n)  F(n−1) ]
        </text>
      </g>
      {/* 说明两行 */}
      <path d="M100 130 Q 260 168 300 132" fill="none" stroke="var(--accent-1)" strokeWidth="1.5" markerEnd="url(#mp-vm)" opacity="0.8" />
      <text x="320" y="176" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">
        第一列做 <tspan className="mono">F(n−1)+F(n−2)=F(n)</tspan>；第二列把 F(n−1) 原样移下来
      </text>
      <text x="320" y="196" textAnchor="middle" fontSize="12" fill="var(--text-3)">
        一次乘法 = 递推走一步；乘 M 的 n 次方 = 一步跨过 n 项
      </text>
    </svg>
  )
}

// 快速幂图：Mⁿ 用二进制倍增。上排 M, M², M⁴, M⁸ 平方链；n 的二进制位选中若干相乘。
export function FastPowFigure() {
  const powers = ['M', 'M²', 'M⁴', 'M⁸']
  const bits = [1, 0, 1, 1] // 13 = 1101₂ 的低→高位（示意 n=13）
  const x0 = 40
  const dx = 130
  const bw = 96
  return (
    <svg viewBox="0 0 640 218" role="img" aria-label="矩阵快速幂：倍增平方序列按二进制位选取相乘">
      <defs>
        <marker id="mp-sq" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-source)" />
        </marker>
        <marker id="mp-pk" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-1)" />
        </marker>
      </defs>
      <text x="24" y="20" fontSize="12.5" fill="var(--text-2)">
        n = 13 = <tspan className="mono" fill="var(--accent-1)">1101</tspan>₂ → 平方倍增，再挑「位为 1」的幂相乘
      </text>
      {/* 平方链 */}
      {powers.map((p, i) => {
        const on = bits[i] === 1
        return (
          <g key={i} transform={`translate(${x0 + i * dx},44)`}>
            <rect
              width={bw}
              height="46"
              rx="11"
              fill={on ? 'color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={on ? 'var(--accent-2)' : 'var(--viz-source)'}
              strokeWidth="1.8"
            />
            <text x={bw / 2} y="29" textAnchor="middle" fontSize="17" className="mono" fill="var(--text-1)">
              {p}
            </text>
            {/* 该位标记 */}
            <g transform={`translate(${bw / 2 - 20},58)`}>
              <rect width="40" height="20" rx="10" fill={on ? 'color-mix(in srgb, var(--accent-1) 60%, var(--surface-1))' : 'var(--surface-2)'} stroke={on ? 'var(--accent-2)' : 'var(--border-strong)'} strokeWidth="1" />
              <text x="20" y="14" textAnchor="middle" fontSize="11" className="mono" fill={on ? 'var(--text-on-accent)' : 'var(--text-3)'}>
                位{i}={bits[i]}
              </text>
            </g>
          </g>
        )
      })}
      {/* 平方箭头（相邻幂之间 ²） */}
      {[0, 1, 2].map((i) => (
        <g key={`s${i}`}>
          <path d={`M ${x0 + i * dx + bw} 67 H ${x0 + (i + 1) * dx - 2}`} stroke="var(--viz-source)" strokeWidth="1.8" markerEnd="url(#mp-sq)" fill="none" />
          <text x={x0 + i * dx + bw + (dx - bw) / 2} y="60" textAnchor="middle" fontSize="12" className="mono" fill="var(--viz-source)">
            ²
          </text>
        </g>
      ))}
      {/* 选中的幂向下汇聚相乘 */}
      {powers.map((_, i) =>
        bits[i] === 1 ? (
          <path
            key={`p${i}`}
            d={`M ${x0 + i * dx + bw / 2} 102 L 320 158`}
            stroke="var(--accent-1)"
            strokeWidth="1.6"
            markerEnd="url(#mp-pk)"
            fill="none"
            opacity="0.8"
          />
        ) : null
      )}
      <g transform="translate(214,160)">
        <rect width="212" height="46" rx="12" fill="color-mix(in srgb, var(--accent-1) 18%, var(--surface-3))" stroke="var(--accent-2)" strokeWidth="1.8" />
        <text x="106" y="29" textAnchor="middle" fontSize="15" className="mono" fill="var(--text-1)">
          M⁸ · M⁴ · M¹ = M¹³
        </text>
      </g>
    </svg>
  )
}

// 深化图：非标准递推 a[x]=a[x-1]+a[x-3] 如何构造转移矩阵（首行系数行 + 其余位移行）。
export function BuildRowsFigure() {
  const rows = [
    { cells: [1, 0, 1], kind: 'coef', out: 'a[x]', note: '递推系数：1·a[x-1] + 0·a[x-2] + 1·a[x-3]' },
    { cells: [1, 0, 0], kind: 'shift', out: 'a[x-1]', note: '位移：搬来旧的 a[x-1]' },
    { cells: [0, 1, 0], kind: 'shift', out: 'a[x-2]', note: '位移：搬来旧的 a[x-2]' },
  ]
  const gy = (r: number) => 30 + r * 44
  const gx0 = 214
  const cw = 40
  return (
    <svg viewBox="0 0 640 200" role="img" aria-label="从 a[x]=a[x-1]+a[x-3] 构造 3x3 转移矩阵">
      <text x="24" y="20" fontSize="12.5" fill="var(--text-2)">
        <tspan className="mono" fill="var(--accent-1)">a[x] = a[x-1] + a[x-3]</tspan> → 状态 3 维 → 3×3 矩阵，逐行填
      </text>
      {/* 旧向量（左，列向量示意） */}
      <g transform="translate(28,30)">
        <text x="52" y="-2" textAnchor="middle" fontSize="10.5" fill="var(--text-3)">旧状态</text>
        {['a[x-1]', 'a[x-2]', 'a[x-3]'].map((l, i) => (
          <g key={i} transform={`translate(0,${i * 44})`}>
            <rect width="104" height="34" rx="8" fill="var(--surface-3)" stroke="var(--viz-source)" strokeWidth="1.3" />
            <text x="52" y="22" textAnchor="middle" fontSize="12.5" className="mono" fill="var(--text-2)">{l}</text>
          </g>
        ))}
      </g>
      {/* 矩阵行 */}
      {rows.map((row, ri) => {
        const isCoef = row.kind === 'coef'
        return (
          <g key={ri}>
            {row.cells.map((v, ci) => {
              const src = v !== 0
              return (
                <g key={ci} transform={`translate(${gx0 + ci * (cw + 4)},${gy(ri)})`}>
                  <rect
                    width={cw}
                    height="34"
                    rx="7"
                    fill={
                      src && isCoef
                        ? 'color-mix(in srgb, var(--accent-1) 70%, var(--surface-1))'
                        : src
                          ? 'color-mix(in srgb, var(--accent-1) 16%, var(--viz-cell))'
                          : 'var(--viz-cell)'
                    }
                    stroke={isCoef && src ? 'var(--accent-2)' : 'var(--border-strong)'}
                    strokeWidth="1.2"
                  />
                  <text
                    x={cw / 2}
                    y="22"
                    textAnchor="middle"
                    fontSize="15"
                    className="mono"
                    fill={src && isCoef ? 'var(--text-on-accent)' : src ? 'var(--text-1)' : 'var(--text-3)'}
                  >
                    {v}
                  </text>
                </g>
              )
            })}
            {/* 输出分量 + 注解 */}
            <text x={gx0 + 3 * (cw + 4) + 14} y={gy(ri) + 15} fontSize="12.5" className="mono" fill={isCoef ? 'var(--accent-1)' : 'var(--text-2)'}>
              → {row.out}
            </text>
            <text x={gx0 + 3 * (cw + 4) + 14} y={gy(ri) + 30} fontSize="10.5" fill="var(--text-3)">
              {row.note}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
