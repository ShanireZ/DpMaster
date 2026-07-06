// 混合背包讲解用的插图（on-brand SVG，随强调色变色）。
// 三张：MixedSetupFigure（三类物品同场）、DispatchFigure（件数属性→循环方向分派表）、MixedTraceFigure（同一维 f[j] 分段处理）。

/** 三件物品各带件数徽标（×1 / ×∞ / ×m），一起进同一个背包——件数属性各不相同。 */
export function MixedSetupFigure() {
  const items = [
    { w: 2, v: 3, badge: '×1', tip: '恰一件' },
    { w: 3, v: 4, badge: '×∞', tip: '无限件' },
    { w: 4, v: 5, badge: '×m', tip: '有限件' },
  ]
  return (
    <svg viewBox="0 0 660 178" role="img" aria-label="三件物品分别可取一件、无限件、有限件，进入同一个背包">
      <defs>
        <marker id="kx-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      {items.map((it, i) => (
        <g key={i} transform={`translate(${16 + i * 96},36)`}>
          <rect width="84" height="104" rx="14" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <g transform="translate(50,-11)">
            <rect width="48" height="22" rx="11" fill="color-mix(in srgb, var(--accent-1) 20%, var(--surface-2))" stroke="var(--accent-2)" strokeWidth="1.2" />
            <text x="24" y="15" textAnchor="middle" fontSize="12" className="mono" fill="var(--accent-1)">{it.badge}</text>
          </g>
          <text x="42" y="28" textAnchor="middle" fontSize="12" fill="var(--text-2)">物品 {i + 1}</text>
          <text x="42" y="55" textAnchor="middle" fontSize="15" className="mono" fill="var(--text-1)">w={it.w}</text>
          <text x="42" y="78" textAnchor="middle" fontSize="15" className="mono" fill="var(--accent-1)">v={it.v}</text>
          <text x="42" y="97" textAnchor="middle" fontSize="10.5" fill="var(--text-3)">{it.tip}</text>
        </g>
      ))}
      <path d="M306 86 H372" stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#kx-ar)" />
      <g transform="translate(404,32)">
        <path
          d="M28 30 Q28 10 50 10 H150 Q172 10 172 30 L188 114 Q188 124 176 124 H24 Q12 124 12 114 Z"
          fill="color-mix(in srgb, var(--accent-1) 8%, var(--surface-3))"
          stroke="var(--accent-2)"
          strokeWidth="2.5"
        />
        <path d="M72 10 Q72 -8 100 -8 Q128 -8 128 10" fill="none" stroke="var(--accent-2)" strokeWidth="2.5" />
        <text x="100" y="60" textAnchor="middle" fontSize="14" fill="var(--text-1)">同一个背包</text>
        <text x="100" y="86" textAnchor="middle" fontSize="15" className="mono" fill="var(--accent-1)">容量 m=9</text>
      </g>
    </svg>
  )
}

/** 分派表：三种件数属性各自映射到「循环方向 / 是否拆包」，但落点都是同一套 f[j]=max(f[j],f[j-w]+v)。 */
export function DispatchFigure() {
  const rows = [
    { kind: '01（恰一件）', how: '倒序一遍', note: 'j: W → w', color: 'var(--viz-chosen)' },
    { kind: '完全（无限件）', how: '正序一遍', note: 'j: w → W', color: 'var(--viz-current)' },
    { kind: '多重（有限件）', how: '二进制拆包后各包倒序', note: '拆成 log 个包', color: 'var(--viz-source)' },
  ]
  const y0 = 54
  const rh = 40
  return (
    <svg viewBox="0 0 620 250" role="img" aria-label="件数属性到循环方向的分派表，三者落在同一套转移上">
      <defs>
        <marker id="dp-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-3)" />
        </marker>
      </defs>
      <text x="24" y="24" fontSize="12.5" fontWeight="600" fill="var(--text-2)">看这件的「件数属性」</text>
      <text x="356" y="24" fontSize="12.5" fontWeight="600" fill="var(--text-2)">就用这种转移方式</text>
      {rows.map((r, i) => {
        const y = y0 + i * (rh + 12)
        return (
          <g key={i}>
            <rect x="24" y={y} width="196" height={rh} rx="10" fill="var(--surface-3)" stroke={r.color} strokeWidth="1.6" />
            <text x="122" y={y + rh / 2 + 5} textAnchor="middle" fontSize="13" fill="var(--text-1)">{r.kind}</text>
            <path d={`M228 ${y + rh / 2} H304`} stroke="var(--text-3)" strokeWidth="2" markerEnd="url(#dp-ar)" />
            <rect x="312" y={y} width="240" height={rh} rx="10" fill="color-mix(in srgb, var(--accent-1) 8%, var(--surface-3))" stroke="var(--border-strong)" strokeWidth="1.5" />
            <text x="330" y={y + rh / 2 - 3} fontSize="12.5" fill="var(--text-1)">{r.how}</text>
            <text x="330" y={y + rh / 2 + 14} fontSize="11" className="mono" fill="var(--text-3)">{r.note}</text>
          </g>
        )
      })}
      <g transform="translate(24,224)">
        <rect x="0" y="-4" width="528" height="30" rx="9" fill="color-mix(in srgb, var(--accent-1) 14%, var(--surface-2))" stroke="var(--accent-2)" strokeWidth="1.4" />
        <text x="14" y="15" fontSize="12.5" fill="var(--text-1)">
          三条路最终都写同一格：
        </text>
        <text x="196" y="15" fontSize="13" className="mono" fill="var(--accent-1)">f[j] = max(f[j], f[j−w] + v)</text>
      </g>
    </svg>
  )
}

/** 同一维 f[j] 被三段处理：先 01 件倒序、再完全件正序、再多重件拆包倒序，值就地累积。 */
export function MixedTraceFigure() {
  // 例：01(2,3) 倒序 → 完全(3,4) 正序，容量 8 的两段快照（示意值，与讲解手算一致）。
  const cols = [0, 1, 2, 3, 4, 5, 6, 7, 8]
  const rowA = [0, 0, 3, 3, 3, 3, 3, 3, 3] // 处理完 01 件 (2,3)
  const rowB = [0, 0, 3, 4, 4, 7, 8, 8, 11] // 再处理完 完全件 (3,4)
  const x0 = 96
  const cw = 52
  const gap = 4
  const cx = (j: number) => x0 + j * (cw + gap)
  const rowY = (r: number) => 44 + r * 68
  const ch = 38
  return (
    <svg viewBox="0 0 616 172" role="img" aria-label="同一维 f 数组先被 01 件倒序处理，再被完全件正序处理">
      {cols.map((j) => (
        <text key={`h${j}`} x={cx(j) + cw / 2} y="26" textAnchor="middle" fontSize="11.5" className="mono" fill="var(--text-3)">
          j={j}
        </text>
      ))}
      {/* A 行：01 件处理后 */}
      <text x="20" y={rowY(0) + ch / 2 + 5} fontSize="11.5" fill="var(--viz-chosen)">01 后</text>
      {cols.map((j) => (
        <g key={`a${j}`} transform={`translate(${cx(j)},${rowY(0)})`}>
          <rect width={cw} height={ch} rx="9" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="1.4" />
          <text x={cw / 2} y={ch / 2 + 6} textAnchor="middle" fontSize="15" className="mono" fill="var(--text-1)">{rowA[j]}</text>
        </g>
      ))}
      {/* B 行：完全件处理后，变化的格高亮 */}
      <text x="20" y={rowY(1) + ch / 2 + 5} fontSize="11.5" fill="var(--viz-current)">完全后</text>
      {cols.map((j) => {
        const changed = rowB[j] !== rowA[j]
        return (
          <g key={`b${j}`} transform={`translate(${cx(j)},${rowY(1)})`}>
            <rect
              width={cw}
              height={ch}
              rx="9"
              fill={changed ? 'color-mix(in srgb, var(--viz-current) 16%, var(--surface-3))' : 'var(--surface-3)'}
              stroke={changed ? 'var(--viz-current)' : 'var(--border-strong)'}
              strokeWidth="1.4"
            />
            <text x={cw / 2} y={ch / 2 + 6} textAnchor="middle" fontSize="15" className="mono" fill={changed ? 'var(--viz-current)' : 'var(--text-1)'}>
              {rowB[j]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
