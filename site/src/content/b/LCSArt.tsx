// LCS 讲解用的插图（on-brand SVG，随强调色变色）。★不用外部图片、不做 opacity:0 起步动画。

// 引入图：两串字符上下排开，把它们的一条公共子序列（保持各自次序）用连线勾出。
// A = A B C B D A B，B = B D C A B；公共子序列 B C A B（长度 4）。
export function SetupFigure() {
  const top = ['A', 'B', 'C', 'B', 'D', 'A', 'B'] // 串 A
  const bot = ['B', 'D', 'C', 'A', 'B'] // 串 B
  // 一条公共子序列 B C A B 在两串中的下标（各自保持递增）：
  // A: B@1 C@2 A@5 B@6 ；B: B@0 C@2 A@3 B@4
  const pairs = [
    [1, 0],
    [2, 2],
    [5, 3],
    [6, 4],
  ]
  const x0t = 40
  const x0b = 96
  const dx = 74
  const bw = 46
  const topY = 34
  const botY = 150
  const cxT = (i: number) => x0t + i * dx + bw / 2
  const cxB = (i: number) => x0b + i * dx + bw / 2
  const pickT = new Set(pairs.map((p) => p[0]))
  const pickB = new Set(pairs.map((p) => p[1]))
  return (
    <svg viewBox="0 0 620 210" role="img" aria-label="两串字符与它们的一条最长公共子序列">
      {/* 连线：公共子序列的匹配对（不交叉，天然保持两串各自的先后次序） */}
      {pairs.map(([i, j]) => (
        <line
          key={`ln${i}-${j}`}
          x1={cxT(i)}
          y1={topY + 44}
          x2={cxB(j)}
          y2={botY}
          stroke="var(--accent-2)"
          strokeWidth="2.4"
          opacity="0.85"
        />
      ))}
      {/* 串 A */}
      {top.map((ch, i) => {
        const on = pickT.has(i)
        return (
          <g key={`t${i}`} transform={`translate(${x0t + i * dx},${topY})`}>
            <rect
              width={bw}
              height="44"
              rx="10"
              fill={on ? 'color-mix(in srgb, var(--accent-1) 26%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={on ? 'var(--accent-2)' : 'var(--border-strong)'}
              strokeWidth={on ? '2' : '1.4'}
            />
            <text x={bw / 2} y="29" textAnchor="middle" fontSize="19" className="mono" fill={on ? 'var(--accent-1)' : 'var(--text-2)'}>
              {ch}
            </text>
          </g>
        )
      })}
      {/* 串 B */}
      {bot.map((ch, j) => {
        const on = pickB.has(j)
        return (
          <g key={`b${j}`} transform={`translate(${x0b + j * dx},${botY})`}>
            <rect
              width={bw}
              height="44"
              rx="10"
              fill={on ? 'color-mix(in srgb, var(--accent-1) 26%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={on ? 'var(--accent-2)' : 'var(--border-strong)'}
              strokeWidth={on ? '2' : '1.4'}
            />
            <text x={bw / 2} y="29" textAnchor="middle" fontSize="19" className="mono" fill={on ? 'var(--accent-1)' : 'var(--text-2)'}>
              {ch}
            </text>
          </g>
        )
      })}
      <text x="16" y="60" fontSize="13" fontWeight="600" fill="var(--text-3)">A</text>
      <text x="16" y="176" fontSize="13" fontWeight="600" fill="var(--text-3)">B</text>
      <text x="360" y="204" fontSize="11.5" fill="var(--accent-1)">
        连线勾出的 B C A B 是一条长度 4 的公共子序列
      </text>
    </svg>
  )
}

// 转移决策图：算 dp[i][j] 看两串「当前末位」是否相等，分两条路。
export function DecisionFigure() {
  return (
    <svg viewBox="0 0 620 250" role="img" aria-label="LCS 转移：末位相等取左上加一，否则取上、左的较大者">
      <defs>
        <marker id="lcs-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      {/* 顶部：当前子问题 */}
      <g transform="translate(232,8)">
        <rect width="156" height="48" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="78" y="20" textAnchor="middle" fontSize="12" fill="var(--text-2)">看 A 的前 i 位、B 的前 j 位</text>
        <text x="78" y="39" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">dp[i][j] = ?</text>
      </g>
      <path d="M280 56 L150 96" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#lcs-ar)" />
      <path d="M340 56 L490 96" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#lcs-ar)" />
      <text x="150" y="82" textAnchor="middle" fontSize="12.5" fill="var(--viz-chosen)">末位相等 A[i]=B[j]</text>
      <text x="492" y="82" textAnchor="middle" fontSize="12.5" fill="var(--text-2)">末位不等</text>
      {/* 左：相等 */}
      <g transform="translate(30,100)">
        <rect
          width="240"
          height="74"
          rx="12"
          fill="color-mix(in srgb, var(--viz-chosen) 12%, var(--surface-2))"
          stroke="var(--viz-chosen)"
          strokeWidth="1.6"
        />
        <text x="120" y="26" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">这两个字符配成一对</text>
        <text x="120" y="50" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">= dp[i−1][j−1] + 1</text>
        <text x="120" y="67" textAnchor="middle" fontSize="11" fill="var(--text-3)">各退一格，公共长度 +1</text>
      </g>
      {/* 右：不等 */}
      <g transform="translate(360,100)">
        <rect width="240" height="74" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="120" y="24" textAnchor="middle" fontSize="12.5" fill="var(--text-1)">末位至少有一个用不上</text>
        <text x="120" y="48" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">= max(dp[i−1][j], dp[i][j−1])</text>
        <text x="120" y="66" textAnchor="middle" fontSize="11" fill="var(--text-3)">要么丢 A 末位，要么丢 B 末位</text>
      </g>
      {/* 汇合 */}
      <path d="M150 174 L296 222" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#lcs-ar)" />
      <path d="M480 174 L344 222" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#lcs-ar)" />
      <g transform="translate(212,224)">
        <rect
          width="216"
          height="26"
          rx="10"
          fill="color-mix(in srgb, var(--accent-1) 14%, var(--surface-2))"
          stroke="var(--accent-2)"
          strokeWidth="1.4"
        />
        <text x="108" y="18" textAnchor="middle" fontSize="12.5" className="mono" fill="var(--text-1)">按是否相等，二选一填入</text>
      </g>
    </svg>
  )
}

// 回溯图：填完的表里，从右下角沿转移来路走回左上，斜向那一步就摘一个公共字符。
export function BacktrackFigure() {
  // 用 A="ABCB", B="BDCB" 的一张 5×5 小表意示（值只作示意，重在路径形状）。
  const A = ['A', 'B', 'C', 'B']
  const B = ['B', 'D', 'C', 'B']
  const dp = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1],
    [0, 1, 1, 2, 2],
    [0, 1, 1, 2, 3],
  ]
  // 回溯路径经过的格 (r,c)：(4,4)→(3,3)→(2,2)→(2,1)→(1,1)→(0,0)，与真实转移来路一致。
  const path = new Set(['4,4', '3,3', '2,2', '2,1', '1,1', '0,0'])
  const diag = new Set(['4,4', '3,3', '2,1']) // 相等时斜向、摘字符（摘下 B / C / B）
  const CW = 40
  const gx = (c: number) => 96 + c * CW
  const gy = (r: number) => 34 + r * CW
  return (
    <svg viewBox="0 0 400 270" role="img" aria-label="沿转移来路从右下角回溯，斜向一步摘一个公共字符">
      {/* 列头 = 串 B */}
      {['∅', ...B].map((ch, c) => (
        <text key={`ch${c}`} x={gx(c) + CW / 2} y="26" textAnchor="middle" fontSize="13" className="mono" fill="var(--text-3)">
          {ch}
        </text>
      ))}
      {/* 行头 = 串 A */}
      {['∅', ...A].map((ch, r) => (
        <text key={`rh${r}`} x="80" y={gy(r) + CW / 2 + 5} textAnchor="end" fontSize="13" className="mono" fill="var(--text-3)">
          {ch}
        </text>
      ))}
      {dp.map((row, r) =>
        row.map((v, c) => {
          const onPath = path.has(`${r},${c}`)
          const isDiag = diag.has(`${r},${c}`)
          return (
            <g key={`${r}-${c}`} transform={`translate(${gx(c)},${gy(r)})`}>
              <rect
                width={CW - 4}
                height={CW - 4}
                rx="7"
                fill={
                  isDiag
                    ? 'color-mix(in srgb, var(--viz-chosen) 22%, var(--surface-3))'
                    : onPath
                      ? 'color-mix(in srgb, var(--accent-1) 16%, var(--surface-3))'
                      : 'var(--surface-3)'
                }
                stroke={isDiag ? 'var(--viz-chosen)' : onPath ? 'var(--accent-2)' : 'var(--border-strong)'}
                strokeWidth={onPath ? '1.8' : '1.2'}
              />
              <text x={(CW - 4) / 2} y={(CW - 4) / 2 + 5} textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">
                {v}
              </text>
            </g>
          )
        }),
      )}
      {/* 回溯箭头串（右下 → 左上）：(4,4)→(3,3)→(2,2)→(2,1)→(1,1)→(0,0)。点 = (gx(c), gy(r))。 */}
      <path
        d={`M ${gx(4) + CW / 2 - 2} ${gy(4) + CW / 2 - 2}
            L ${gx(3) + CW / 2 - 2} ${gy(3) + CW / 2 - 2}
            L ${gx(2) + CW / 2 - 2} ${gy(2) + CW / 2 - 2}
            L ${gx(1) + CW / 2 - 2} ${gy(2) + CW / 2 - 2}
            L ${gx(1) + CW / 2 - 2} ${gy(1) + CW / 2 - 2}
            L ${gx(0) + CW / 2 - 2} ${gy(0) + CW / 2 - 2}`}
        fill="none"
        stroke="var(--accent-1)"
        strokeWidth="2.2"
        strokeDasharray="5 4"
        opacity="0.8"
      />
      <text x="96" y="262" fontSize="11.5" fill="var(--viz-chosen)">
        绿格＝相等时斜向一步，摘下 B / C / B → 得 LCS「BCB」
      </text>
    </svg>
  )
}

// 深化图：排列 LCS → LIS。把 B 的每个值换成它在 A 里的位置，得一串位置序列，其 LIS 即 LCS。
export function PermToLisFigure() {
  // A = 1 2 3 4 5（这里取恒等排列，位置即数值本身，映射最直观）
  // B = 2 4 1 5 3 → 映射后位置序列 = 2 4 1 5 3，其一条 LIS = 2 4 5（长度 3）
  const A = [1, 2, 3, 4, 5]
  const B = [2, 4, 1, 5, 3]
  const posInA = new Map(A.map((v, i) => [v, i + 1])) // 值 → 在 A 中的位置(1-based)
  const mapped = B.map((v) => posInA.get(v)!)
  const lisPick = new Set([0, 1, 3]) // 位置序列里一条 LIS：2,4,5（下标 0,1,3）
  const x0 = 96
  const dx = 84
  const bw = 52
  const cx = (i: number) => x0 + i * dx + bw / 2
  return (
    <svg viewBox="0 0 620 220" role="img" aria-label="把 B 的每个值映射成它在 A 中的位置，位置序列的最长上升子序列即为 LCS">
      <defs>
        <marker id="p2l-dn" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
        <marker id="p2l-up" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-chosen)" />
        </marker>
      </defs>
      {/* 第一行：B 的值 */}
      {B.map((v, i) => (
        <g key={`b${i}`} transform={`translate(${x0 + i * dx},18)`}>
          <rect width={bw} height="40" rx="10" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.4" />
          <text x={bw / 2} y="26" textAnchor="middle" fontSize="17" className="mono" fill="var(--text-2)">
            {v}
          </text>
        </g>
      ))}
      <text x="16" y="44" fontSize="12.5" fontWeight="600" fill="var(--text-3)">B 的值</text>
      {/* 向下映射箭头 */}
      {B.map((_, i) => (
        <path key={`ar${i}`} d={`M ${cx(i)} 60 L ${cx(i)} 96`} stroke="var(--text-3)" strokeWidth="1.6" markerEnd="url(#p2l-dn)" />
      ))}
      <text x="16" y="122" fontSize="12" fill="var(--text-3)">换成</text>
      <text x="16" y="138" fontSize="12" fill="var(--text-3)">它在 A</text>
      <text x="16" y="154" fontSize="12" fill="var(--text-3)">的位置</text>
      {/* 第二行：映射后的位置序列，高亮一条 LIS */}
      {mapped.map((p, i) => {
        const on = lisPick.has(i)
        return (
          <g key={`m${i}`} transform={`translate(${x0 + i * dx},100)`}>
            <rect
              width={bw}
              height="46"
              rx="10"
              fill={on ? 'color-mix(in srgb, var(--viz-chosen) 20%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={on ? 'var(--viz-chosen)' : 'var(--border-strong)'}
              strokeWidth={on ? '2' : '1.4'}
            />
            <text x={bw / 2} y="29" textAnchor="middle" fontSize="18" className="mono" fill={on ? 'var(--text-1)' : 'var(--text-2)'}>
              {p}
            </text>
          </g>
        )
      })}
      {/* LIS 连线（上升） */}
      {[0, 1].map((k) => {
        const arr = [0, 1, 3]
        const i = arr[k]
        const j = arr[k + 1]
        return (
          <path
            key={`lis${k}`}
            d={`M ${cx(i)} 108 Q ${(cx(i) + cx(j)) / 2} 92 ${cx(j)} 108`}
            stroke="var(--viz-chosen)"
            strokeWidth="2.4"
            fill="none"
            markerEnd="url(#p2l-up)"
          />
        )
      })}
      <text x="16" y="184" fontSize="12.5" fontWeight="600" fill="var(--viz-chosen)">位置序列</text>
      <g transform="translate(150,192)">
        <rect
          width="330"
          height="24"
          rx="10"
          fill="color-mix(in srgb, var(--accent-1) 12%, var(--surface-2))"
          stroke="var(--accent-2)"
          strokeWidth="1.3"
        />
        <text x="165" y="16" textAnchor="middle" fontSize="12" className="mono" fill="var(--text-1)">
          LIS(2,4,1,5,3) = 2,4,5 → 长度 3 = LCS 长度
        </text>
      </g>
    </svg>
  )
}
