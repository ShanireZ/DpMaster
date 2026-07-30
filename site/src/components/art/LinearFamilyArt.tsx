import { useId, type CSSProperties } from 'react'
import PartGlyph from '../PartGlyph.tsx'
import './linear-family-art.css'

interface LinearArtProps {
  className?: string
}

interface LinearLessonPlateProps extends LinearArtProps {
  slug: string
  title: string
}

export function LinearHeroArt({ className = '' }: LinearArtProps) {
  const instanceId = useId().replace(/:/g, '')
  const gradientId = `linear-hero-gradient-${instanceId}`
  const arrowId = `linear-hero-arrow-${instanceId}`
  const cells: Array<{ x: number; label: string; value: string; current?: boolean }> = [
    { x: 62, label: 'i−3', value: 'sᵢ₋₃' },
    { x: 146, label: 'i−2', value: 'sᵢ₋₂' },
    { x: 230, label: 'i−1', value: 'sᵢ₋₁' },
    { x: 314, label: 'i', value: 'sᵢ', current: true },
    { x: 398, label: 'i+1', value: 'sᵢ₊₁' },
    { x: 482, label: 'i+2', value: 'sᵢ₊₂' },
    { x: 566, label: 'i+3', value: 'sᵢ₊₃' },
  ]

  return (
    <svg
      className={`linear-hero ${className}`.trim()}
      viewBox="0 0 720 620"
      aria-hidden="true"
      data-family-art="b"
      data-family-mode="hero"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="var(--accent-1)" />
          <stop offset="1" stopColor="var(--surface-2)" />
        </linearGradient>
        <marker id={arrowId} markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
          <path d="M0 0 9 4.5 0 9Z" className="linear-art__source-fill" />
        </marker>
      </defs>

      <g className="linear-art__construction">
        <circle cx="360" cy="302" r="254" />
        <circle cx="360" cy="302" r="182" />
        {[104, 188, 272, 356, 440, 524, 608].map((x) => (
          <path key={x} d={`M${x} 72V538`} />
        ))}
        {[126, 210, 294, 378, 462].map((y) => (
          <path key={y} d={`M38 ${y}H682`} />
        ))}
        <path d="M44 548 654 38" />
      </g>

      <g className="linear-hero__tape">
        <path d="M34 250H686M34 350H686" />
        {cells.map(({ x, label, value, current }) => (
          <g key={x} className={current ? 'is-current' : undefined}>
            <rect x={x} y="250" width="84" height="100" fill={current ? `url(#${gradientId})` : undefined} />
            <text x={x + 42} y="225" className="linear-art__index">{label}</text>
            <text x={x + 42} y="309">{value}</text>
            <circle cx={x + 42} cy="350" r={current ? 9 : 5} />
          </g>
        ))}
      </g>

      <g className="linear-hero__predecessors">
        <path d="M104 350C120 464 310 474 356 360" markerEnd={`url(#${arrowId})`} />
        <path d="M188 350C208 426 316 432 356 360" markerEnd={`url(#${arrowId})`} />
        <path d="M272 350C290 392 330 398 356 360" markerEnd={`url(#${arrowId})`} />
        <path d="M608 350C582 470 406 472 364 360" className="linear-art__source--dash" markerEnd={`url(#${arrowId})`} />
      </g>

      <text x="46" y="178" className="linear-art__caption">INDEX TAPE / PREDECESSOR FIELD</text>
      <text x="360" y="516" textAnchor="middle" className="linear-hero__formula">
        f[i] = best(f[j] + g(j, i))
      </text>
    </svg>
  )
}

export function LinearJourneyArt({ className = '' }: LinearArtProps) {
  const instanceId = useId().replace(/:/g, '')
  const arrowId = `linear-journey-arrow-${instanceId}`

  return (
    <svg
      className={`linear-journey ${className}`.trim()}
      viewBox="0 0 1180 560"
      preserveAspectRatio="none"
      aria-hidden="true"
      data-family-art="b"
      data-family-mode="journey"
      style={{ '--linear-journey-arrow': `url(#${arrowId})` } as CSSProperties}
    >
      <defs>
        <marker id={arrowId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0 8 4 0 8Z" className="linear-art__source-fill" />
        </marker>
      </defs>
      <g className="linear-art__construction">
        {[140, 420].map((y) => <path key={y} d={`M30 ${y}H1150`} />)}
        {[160, 420, 680, 940].map((x) => <path key={x} d={`M${x} 30V530`} />)}
        <path d="M46 520 1130 30" />
      </g>

      <g className="linear-journey__spine">
        <path d="M72 140H1033C1100 140 1138 196 1138 254S1098 350 1034 350H1018C997 350 983 371 983 420H197" />
      </g>

      <g className="linear-journey__relations">
        <path d="M148 140C210 32 378 34 443 140" markerEnd={`url(#${arrowId})`} />
        <path d="M443 140C506 52 674 52 738 140" markerEnd={`url(#${arrowId})`} />
        <path d="M738 140C802 38 972 38 1033 140" markerEnd={`url(#${arrowId})`} />
        <path d="M1033 140C1100 210 1050 348 983 420" markerEnd={`url(#${arrowId})`} />
        <path d="M983 420C910 322 672 322 590 420" markerEnd={`url(#${arrowId})`} />
        <path d="M590 420C518 328 278 328 197 420" markerEnd={`url(#${arrowId})`} />
      </g>
    </svg>
  )
}

function LisPlate() {
  const points = [
    [56, 190],
    [126, 128],
    [196, 166],
    [266, 82],
    [336, 118],
    [406, 46],
  ] as const

  return (
    <>
      <g className="linear-plate__construction">
        <path d="M36 218H430" />
        {points.map(([x]) => <path key={x} d={`M${x} 34V226`} />)}
      </g>
      <path className="linear-plate__source" d="M56 190 126 128 266 82 406 46" />
      <path className="linear-plate__source is-secondary" d="M126 128 196 166 336 118" />
      <g className="linear-plate__nodes">
        {points.map(([x, y], index) => (
          <g key={x}>
            <circle cx={x} cy={y} r={index === 3 || index === 5 ? 10 : 8} className={index === 3 ? 'is-current' : index === 5 ? 'is-chosen' : undefined} />
            <text x={x} y={y - 17}>{[2, 5, 3, 8, 6, 10][index]}</text>
            <text x={x} y="244" className="linear-art__index">{index}</text>
          </g>
        ))}
      </g>

      <g transform="translate(466 54)" className="linear-plate__tails">
        <text x="0" y="-18" className="linear-plate__label">各长度的最小结尾</text>
        {[0, 1, 2, 3].map((index) => (
          <g key={index} transform={`translate(0 ${index * 54})`}>
            <text x="0" y="22" className="linear-art__index">L={index + 1}</text>
            <rect x="42" width={66 + index * 24} height="32" />
            <text x={75 + index * 12} y="22" textAnchor="middle">{[2, 3, 6, 10][index]}</text>
          </g>
        ))}
        <path d="M42 236H146" className="linear-plate__brace" />
        <text x="94" y="258" textAnchor="middle" className="linear-plate__formula">tails[len]</text>
      </g>
      <text x="42" y="306" className="linear-plate__formula">f[i] = 1 + max f[j]</text>
      <text x="42" y="333" className="linear-plate__label">j &lt; i 且 a[j] &lt; a[i]</text>
      <text x="434" y="333" className="linear-plate__chosen-label">上升前驱链</text>
    </>
  )
}

function EditPlate() {
  const cell = 36
  const ox = 288
  const oy = 62
  const rows = 6
  const cols = 8
  const current = { row: 4, col: 5 }
  const sourceCells = new Set(['3-4', '3-5', '4-4'])

  return (
    <>
      <g className="linear-plate__edit-labels">
        <text x="34" y="58" className="linear-plate__label">比较两个前缀</text>
        <text x="34" y="88" className="linear-plate__formula">s[1..i]</text>
        <text x="126" y="88" className="linear-plate__formula">t[1..j]</text>
        <path d="M34 110H222" className="linear-plate__brace" />
        <text x="34" y="153" className="linear-plate__operation">删</text>
        <text x="70" y="153">dp[i−1][j] + 1</text>
        <text x="34" y="203" className="linear-plate__operation">插</text>
        <text x="70" y="203">dp[i][j−1] + 1</text>
        <text x="34" y="253" className="linear-plate__operation">改</text>
        <text x="70" y="253">dp[i−1][j−1] + δ</text>
        <text x="70" y="275" className="linear-plate__cost-note">δ = [sᵢ ≠ tⱼ]</text>
        <path d="M250 38V282" className="linear-plate__separator" />
      </g>

      <g className="linear-plate__matrix">
        {'sitting'.split('').map((char, col) => (
          <text key={char + col} x={ox + (col + 1) * cell + cell / 2} y={oy - 12} textAnchor="middle">{char}</text>
        ))}
        {'kitte'.split('').map((char, row) => (
          <text key={char + row} x={ox - 15} y={oy + (row + 1) * cell + 24} textAnchor="middle">{char}</text>
        ))}
        {Array.from({ length: rows * cols }, (_, index) => {
          const row = Math.floor(index / cols)
          const col = index % cols
          const key = `${row}-${col}`
          const isCurrent = row === current.row && col === current.col
          return (
            <rect
              key={key}
              x={ox + col * cell}
              y={oy + row * cell}
              width={cell}
              height={cell}
              className={isCurrent ? 'is-current' : sourceCells.has(key) ? 'is-source' : undefined}
            />
          )
        })}
        <path
          d={`M${ox + 4.5 * cell} ${oy + 3.5 * cell}  ${ox + 5.5 * cell} ${oy + 4.5 * cell}`}
          className="linear-plate__source-arrow"
        />
        <path
          d={`M${ox + 5.5 * cell} ${oy + 3.5 * cell}V${oy + 4.32 * cell}`}
          className="linear-plate__source-arrow"
        />
        <path
          d={`M${ox + 4.5 * cell} ${oy + 4.5 * cell}H${ox + 5.32 * cell}`}
          className="linear-plate__source-arrow"
        />
      </g>

      <path d="M288 306H576" className="linear-plate__brace" />
      <text x="432" y="342" textAnchor="middle" className="linear-plate__formula">dp[i][j] = min(删除, 插入, 替换)</text>
    </>
  )
}

const plateDescriptions: Record<'lis' | 'edit', string> = {
  lis: '序列点通过更早且更小的元素形成上升前驱链，右侧 tails 层记录各长度的最小结尾。',
  edit: '双序列前缀矩阵中的当前状态由删除、插入和替换三条带代价的来源边取最小值。',
}

export function LinearLessonPlate({ slug, title, className = '' }: LinearLessonPlateProps) {
  const instanceId = useId().replace(/:/g, '')

  if (slug !== 'lis' && slug !== 'edit') {
    return (
      <span
        className={`linear-plate-fallback ${className}`.trim()}
        aria-hidden="true"
        data-family-art="b"
        data-family-mode="fallback"
        data-lesson-plate={slug}
      >
        <PartGlyph id="b" size={320} />
      </span>
    )
  }

  const titleId = `linear-plate-title-${instanceId}`
  const descriptionId = `linear-plate-description-${instanceId}`
  const arrowId = `linear-plate-arrow-${instanceId}`

  return (
    <svg
      className={`linear-plate linear-plate--${slug} ${className}`.trim()}
      viewBox="0 0 640 390"
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
      data-family-art="b"
      data-family-mode="lesson"
      data-lesson-plate={slug}
      style={{ '--linear-plate-arrow': `url(#${arrowId})` } as CSSProperties}
    >
      <title id={titleId}>{`${title}状态图`}</title>
      <desc id={descriptionId}>{plateDescriptions[slug]}</desc>
      <defs>
        <marker id={arrowId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0 8 4 0 8Z" className="linear-art__source-fill" />
        </marker>
      </defs>
      {slug === 'lis' ? <LisPlate /> : <EditPlate />}
    </svg>
  )
}
