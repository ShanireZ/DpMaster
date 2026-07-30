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

const HERO_POINTS = [
  [82, 470],
  [164, 374],
  [246, 420],
  [328, 248],
  [410, 318],
  [492, 156],
  [574, 222],
] as const

export function LinearHeroArt({ className = '' }: LinearArtProps) {
  const instanceId = useId().replace(/:/g, '')
  const gradientId = `linear-hero-gradient-${instanceId}`
  const arrowId = `linear-hero-arrow-${instanceId}`

  return (
    <svg
      className={`linear-hero ${className}`.trim()}
      viewBox="0 0 720 620"
      aria-hidden="true"
      data-family-art="b"
      data-family-mode="hero"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--accent-1)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
        <marker id={arrowId} markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
          <path d="M0 0 9 4.5 0 9Z" className="linear-art__source-fill" />
        </marker>
      </defs>

      <g className="linear-art__construction">
        <circle cx="360" cy="302" r="254" />
        <circle cx="360" cy="302" r="182" />
        {[82, 164, 246, 328, 410, 492, 574].map((x) => (
          <path key={x} d={`M${x} 52V554`} />
        ))}
        {[116, 218, 320, 422, 524].map((y) => (
          <path key={y} d={`M52 ${y}H664`} />
        ))}
        <path d="M44 548 654 38" />
      </g>

      <path
        className="linear-hero__plane"
        d="M82 470 164 374 246 420 328 248 410 318 492 156 574 222V496H82Z"
        fill={`url(#${gradientId})`}
      />
      <path
        className="linear-hero__ridge"
        d="M82 470 164 374 246 420 328 248 410 318 492 156 574 222"
      />
      <path className="linear-hero__rail" d="M82 498H574" />

      <path
        className="linear-art__source linear-art__source--dash"
        d="M92 460C161 431 259 326 314 260"
        markerEnd={`url(#${arrowId})`}
      />
      <path
        className="linear-art__source"
        d="M174 366C234 344 272 285 314 254"
        markerEnd={`url(#${arrowId})`}
      />
      <path
        className="linear-art__chosen"
        d="M340 236C399 190 439 166 477 158"
        markerEnd={`url(#${arrowId})`}
      />

      <g className="linear-hero__nodes">
        {HERO_POINTS.map(([x, y], index) => (
          <g key={x}>
            <circle
              cx={x}
              cy={y}
              r={index === 3 || index === 5 ? 13 : 10}
              className={index === 3 ? 'is-current' : index === 5 ? 'is-chosen' : undefined}
            />
            <text x={x} y={y - 20}>{[2, 5, 3, 8, 6, 10, 9][index]}</text>
            <text x={x} y="522" className="linear-art__index">{index}</text>
          </g>
        ))}
      </g>
      <text x="92" y="568" className="linear-art__caption">INDEX RAIL / SEQUENCE SPINE</text>
    </svg>
  )
}

const JOURNEY_Y = [47, 141, 235, 329, 423, 517, 611] as const

export function LinearJourneyArt({ className = '' }: LinearArtProps) {
  const instanceId = useId().replace(/:/g, '')
  const arrowId = `linear-journey-arrow-${instanceId}`

  return (
    <svg
      className={`linear-journey ${className}`.trim()}
      viewBox="0 0 500 658"
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
        {[92, 186, 280, 374, 468, 562].map((y) => <path key={y} d={`M0 ${y}H500`} />)}
        {[80, 176, 272, 368, 464].map((x) => <path key={x} d={`M${x} 0V658`} />)}
        <path d="M26 638 474 16" />
      </g>

      <path className="linear-journey__spine" d="M74 47 136 141 110 235 228 329 198 423 334 517 414 611" />
      {JOURNEY_Y.map((y, index) => {
        const x = [74, 136, 110, 228, 198, 334, 414][index]
        return (
          <g key={y} className="linear-journey__node">
            <path d={`M0 ${y}H${x - 12}`} />
            <circle cx={x} cy={y} r={index === 2 || index === 4 ? 9 : 7} className={index === 2 ? 'is-chosen' : index === 4 ? 'is-current' : undefined} />
            <text x={x + 18} y={y + 4}>{['PATH', 'SEGMENT', 'LIS', 'LCS', 'EDIT', 'FSM', 'COUNT'][index]}</text>
          </g>
        )
      })}

      <g className="linear-journey__relations">
        <path d="M146 141C188 166 183 209 122 232" markerEnd={`url(#${arrowId})`} />
        <path d="M119 229C159 228 198 265 219 316" markerEnd={`url(#${arrowId})`} />
        <path d="M238 322C278 332 270 396 210 418" markerEnd={`url(#${arrowId})`} />
        <path d="M208 429C248 472 284 498 322 512" markerEnd={`url(#${arrowId})`} />
      </g>

      <g className="linear-journey__lanes">
        <path d="M294 35V623" />
        <path d="M314 235H466M314 329H466M314 423H466" />
        <text x="306" y="20">INDEX</text>
        <text x="326" y="220">DOUBLE SEQUENCE</text>
        <text x="326" y="408">STATE LANES</text>
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
  const cell = 42
  const ox = 208
  const oy = 74
  const rows = 6
  const cols = 8
  const current = { row: 4, col: 5 }
  const sourceCells = new Set(['3-4', '3-5', '4-4'])

  return (
    <>
      <g className="linear-plate__edit-labels">
        <text x="42" y="72" className="linear-plate__label">两个前缀</text>
        <text x="42" y="101" className="linear-plate__formula">s[1..i]</text>
        <text x="42" y="130" className="linear-plate__formula">t[1..j]</text>
        <path d="M42 154H160" className="linear-plate__brace" />
        <text x="42" y="191">删除：dp[i−1][j] + 1</text>
        <text x="42" y="222">插入：dp[i][j−1] + 1</text>
        <text x="42" y="253">替换：dp[i−1][j−1] + cost</text>
      </g>

      <g className="linear-plate__matrix">
        {'sitting'.split('').map((char, col) => (
          <text key={char + col} x={ox + (col + 1) * cell + cell / 2} y={oy - 13} textAnchor="middle">{char}</text>
        ))}
        {'kitte'.split('').map((char, row) => (
          <text key={char + row} x={ox - 15} y={oy + (row + 1) * cell + 27} textAnchor="middle">{char}</text>
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

      <text x="42" y="316" className="linear-plate__formula">dp[i][j] = min(删, 插, 改)</text>
      <text x="418" y="354" className="linear-plate__current-label">当前前缀对</text>
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
