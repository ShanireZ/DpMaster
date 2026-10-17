// 計數 / 劃分型線性 DP 講解用插圖（on-brand SVG，隨強調色變色）。

// 引入圖：同一條轉移骨架，把中間的聚合算子從 max（求最優）換成 +（數方案），
// 地基也從「全 0」換成「f[0]=1」——問題就從「最大價值」翻面成「方案數」。
export function MaxToPlusFigure() {
  const rows = [
    { tag: '最优 DP', op: 'max', base: 'f[0]=0', out: '最大价值', tint: 'var(--text-2)' },
    { tag: '计数 DP', op: '+', base: 'f[0]=1', out: '方案数', tint: 'var(--accent-2)' },
  ]
  return (
    <svg viewBox="0 0 640 196" role="img" aria-label="把转移里的 max 换成加法、f[0] 从 0 换成 1，就从求最优变成数方案">
      <defs>
        <marker id="mp-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      <text x="20" y="24" fontSize="12.5" fill="var(--text-2)">同一条链式转移，只换「算子」与「地基」两处：</text>
      {rows.map((r, i) => (
        <g key={i} transform={`translate(20,${44 + i * 74})`}>
          {/* 類型標籤 */}
          <rect width="86" height="56" rx="12" fill={`color-mix(in srgb, ${r.tint} 12%, var(--surface-3))`} stroke={r.tint} strokeWidth="1.5" />
          <text x="43" y="33" textAnchor="middle" fontSize="13" fontWeight="700" fill={r.tint}>{r.tag}</text>
          <path d="M106 28 H150" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#mp-ar)" />
          {/* 轉移式：f[i] = 算子(前驅…) */}
          <g transform="translate(158,10)">
            <rect width="286" height="36" rx="10" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
            <text x="16" y="23" fontSize="13.5" className="mono" fill="var(--text-1)">f[i] = </text>
            <rect x="66" y="7" width="58" height="22" rx="7" fill="color-mix(in srgb, var(--surface-1) 55%, var(--surface-3))" stroke={r.tint} strokeWidth="1.3" />
            <text x="95" y="23" textAnchor="middle" fontSize="14" className="mono" fill={r.tint}>{r.op}</text>
            <text x="134" y="23" fontSize="13" className="mono" fill="var(--text-2)">( 前驱, 前驱 )</text>
          </g>
          {/* 地基 + 產出 */}
          <g transform="translate(158,50)">
            <text x="0" y="10" fontSize="11.5" fill="var(--text-3)">地基 </text>
            <text x="34" y="10" fontSize="12.5" className="mono" fill={r.tint}>{r.base}</text>
            <text x="150" y="10" fontSize="11.5" fill="var(--text-3)">→ 读出 </text>
            <text x="196" y="10" fontSize="12.5" fill="var(--text-1)">{r.out}</text>
          </g>
        </g>
      ))}
    </svg>
  )
}

// 數樓梯遞推圖：跳到第 i 級 = 從 i-1 跨 1 級 + 從 i-2 跨 2 級，兩路相加；
// 底部條帶展示 f[0..6]=1,1,2,3,5,8,13 —— 就是斐波那契數列。
export function StairCountFigure() {
  const seq = [1, 1, 2, 3, 5, 8, 13]
  const x0 = 34
  const dx = 84
  const cw = 60
  const ch = 40
  const cx = (i: number) => x0 + i * dx
  return (
    <svg viewBox="0 0 640 236" role="img" aria-label="数楼梯：f[i]=f[i-1]+f[i-2]，两条来路相加，得到斐波那契数列">
      <defs>
        <marker id="st-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-2)" />
        </marker>
      </defs>
      {/* 上半：兩條來路匯入第 i 級 */}
      <g transform="translate(58,14)">
        <rect width="150" height="44" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="75" y="19" textAnchor="middle" fontSize="12" fill="var(--text-2)">第 i−1 级</text>
        <text x="75" y="36" textAnchor="middle" fontSize="12.5" className="mono" fill="var(--text-1)">跨 1 级 →</text>
      </g>
      <g transform="translate(58,74)">
        <rect width="150" height="44" rx="12" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x="75" y="19" textAnchor="middle" fontSize="12" fill="var(--text-2)">第 i−2 级</text>
        <text x="75" y="36" textAnchor="middle" fontSize="12.5" className="mono" fill="var(--text-1)">跨 2 级 ⇒</text>
      </g>
      <path d="M208 36 L330 58" stroke="var(--accent-2)" strokeWidth="2" markerEnd="url(#st-ar)" fill="none" />
      <path d="M208 96 L330 74" stroke="var(--accent-2)" strokeWidth="2" markerEnd="url(#st-ar)" fill="none" />
      <g transform="translate(334,42)">
        <rect width="216" height="48" rx="14" fill="color-mix(in srgb, var(--accent-1) 15%, var(--surface-2))" stroke="var(--accent-2)" strokeWidth="1.6" />
        <text x="108" y="20" textAnchor="middle" fontSize="12" fill="var(--text-2)">第 i 级 · 两路相加</text>
        <text x="108" y="39" textAnchor="middle" fontSize="14" className="mono" fill="var(--text-1)">f[i] = f[i−1] + f[i−2]</text>
      </g>
      {/* 下半：斐波那契數列條帶 */}
      <text x="34" y="150" fontSize="12" fill="var(--text-2)">于是 f[0..6] 就长成斐波那契：</text>
      {seq.map((_, i) => (
        <text key={`h${i}`} x={cx(i) + cw / 2} y="172" textAnchor="middle" fontSize="11" className="mono" fill="var(--text-3)">
          f[{i}]
        </text>
      ))}
      {seq.map((v, i) => (
        <g key={`c${i}`} transform={`translate(${cx(i)},182)`}>
          <rect width={cw} height={ch} rx="10" fill="var(--surface-3)" stroke={i >= 5 ? 'var(--accent-2)' : 'var(--border-strong)'} strokeWidth="1.5" />
          <text x={cw / 2} y={ch / 2 + 6} textAnchor="middle" fontSize="16" className="mono" fill={i >= 5 ? 'var(--accent-1)' : 'var(--text-1)'}>
            {v}
          </text>
        </g>
      ))}
    </svg>
  )
}

// 整數劃分二維圖：dp[i][j] = dp[i][j-1]（不用 j） + dp[i-j][j]（至少用一個 j）。
// 畫一小片網格，標出當前格 (i,j) 與它的兩個來源格：左鄰、上方 j 行處。
export function PartitionFigure() {
  const CW = 58
  const CH = 40
  const cols = 5 // j = 1..5
  const rowsShown = 5 // i = 1..5（外加兩個來源的位置標註）
  const gx = (c: number) => 116 + c * (CW + 8)
  const gy = (r: number) => 30 + r * (CH + 8)
  // 目標格 (i=5, j=3)；來源：左鄰 (5,2) 與 (i-j=2, j=3)
  const cur = { r: 4, c: 2 } // 繪製下標(0-based)：i=5→行4, j=3→列2
  const left = { r: 4, c: 1 } // (5,2)
  const up = { r: 1, c: 2 } // (2,3)
  const cells: { r: number; c: number }[] = []
  for (let r = 0; r < rowsShown; r++) for (let c = 0; c < cols; c++) cells.push({ r, c })
  const kind = (r: number, c: number): 'cur' | 'left' | 'up' | 'idle' => {
    if (r === cur.r && c === cur.c) return 'cur'
    if (r === left.r && c === left.c) return 'left'
    if (r === up.r && c === up.c) return 'up'
    return 'idle'
  }
  const fill = (k: string) =>
    k === 'cur'
      ? 'color-mix(in srgb, var(--viz-current) 16%, var(--surface-3))'
      : k === 'left' || k === 'up'
        ? 'color-mix(in srgb, var(--viz-chosen) 15%, var(--surface-3))'
        : 'var(--surface-3)'
  const stroke = (k: string) =>
    k === 'cur' ? 'var(--viz-current)' : k === 'left' || k === 'up' ? 'var(--viz-chosen)' : 'var(--border-strong)'
  return (
    <svg viewBox="0 0 640 320" role="img" aria-label="整数划分二维转移：当前格由左邻与上方 i-j 行两个来源相加">
      <defs>
        <marker id="pt-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-chosen)" />
        </marker>
      </defs>
      {/* 列頭（允許的最大零件 j） */}
      <text x="60" y="24" fontSize="11" fill="var(--text-3)">拆 i ＼ ≤ j</text>
      {Array.from({ length: cols }, (_, c) => (
        <text key={`ch${c}`} x={gx(c) + CW / 2} y="24" textAnchor="middle" fontSize="11" className="mono" fill="var(--text-3)">
          {c + 1}
        </text>
      ))}
      {/* 行頭（被拆的數 i） */}
      {Array.from({ length: rowsShown }, (_, r) => (
        <text key={`rh${r}`} x="96" y={gy(r) + CH / 2 + 4} textAnchor="end" fontSize="11" className="mono" fill="var(--text-3)">
          {r + 1}
        </text>
      ))}
      {cells.map(({ r, c }, i) => {
        const k = kind(r, c)
        return (
          <g key={i} transform={`translate(${gx(c)},${gy(r)})`}>
            <rect width={CW} height={CH} rx="9" fill={fill(k)} stroke={stroke(k)} strokeWidth="1.5" />
            {k === 'cur' && (
              <text x={CW / 2} y={CH / 2 + 5} textAnchor="middle" fontSize="12.5" className="mono" fill="var(--viz-current)">
                dp[5][3]
              </text>
            )}
            {k === 'left' && (
              <text x={CW / 2} y={CH / 2 + 5} textAnchor="middle" fontSize="11" className="mono" fill="var(--viz-chosen)">
                不用 3
              </text>
            )}
            {k === 'up' && (
              <text x={CW / 2} y={CH / 2 + 5} textAnchor="middle" fontSize="11" className="mono" fill="var(--viz-chosen)">
                用一个 3
              </text>
            )}
          </g>
        )
      })}
      {/* 箭頭：左鄰 → 當前 */}
      <path d={`M ${gx(left.c) + CW} ${gy(left.r) + CH / 2} H ${gx(cur.c) - 2}`} stroke="var(--viz-chosen)" strokeWidth="2" markerEnd="url(#pt-ar)" fill="none" />
      {/* 箭頭：上方 (i-j) → 當前 */}
      <path
        d={`M ${gx(up.c) + CW / 2} ${gy(up.r) + CH} V ${gy(cur.r) - 2}`}
        stroke="var(--viz-chosen)"
        strokeWidth="2"
        markerEnd="url(#pt-ar)"
        fill="none"
      />
      {/* 底部公式說明 */}
      <g transform="translate(80,286)">
        <text x="0" y="0" fontSize="13" className="mono" fill="var(--text-1)">
          dp[i][j] = dp[i][j−1] + dp[i−j][j]
        </text>
        <text x="0" y="20" fontSize="11.5" fill="var(--text-3)">
          左邻 = 完全不用 j 的方案；上方 i−j 行 = 至少用一个 j 的方案。两类不重不漏。
        </text>
      </g>
    </svg>
  )
}
