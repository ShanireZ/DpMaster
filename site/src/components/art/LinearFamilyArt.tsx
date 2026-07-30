import { useId, type CSSProperties, type ReactElement } from 'react'
import linearHeroImage from '../../assets/family-art/linear-hero.webp'
import PartGlyph from '../PartGlyph.tsx'
import './linear-family-art.css'

interface LinearArtProps {
  className?: string
}

interface LinearLessonPlateProps extends LinearArtProps {
  slug: string
  title: string
}

type HeroPoint = readonly [number, number]

interface HeroFace {
  points: string
  tone: number
}

const heroSpineStates = [
  { x: 120, y: 302, width: 43, height: 72, railY: 404 },
  { x: 236, y: 292, width: 45, height: 74, railY: 401 },
  { x: 351, y: 288, width: 44, height: 72, railY: 410 },
  { x: 466, y: 294, width: 42, height: 67, railY: 427 },
  { x: 594, y: 316, width: 55, height: 87, railY: 456, current: true },
  { x: 718, y: 347, width: 42, height: 67, railY: 486, future: true },
  { x: 830, y: 380, width: 37, height: 59, railY: 516, future: true },
] as const

const heroRailTop: HeroPoint[] = [
  [58, 390], [170, 386], [282, 392], [397, 405],
  [514, 426], [635, 451], [758, 480], [886, 516],
]

const heroRailBottom: HeroPoint[] = [
  [66, 428], [176, 423], [287, 430], [401, 444],
  [516, 466], [632, 491], [751, 521], [874, 558],
]

const heroUnderRibbonTop: HeroPoint[] = [
  [75, 430], [166, 462], [264, 476], [366, 480],
  [467, 469], [566, 484], [668, 513], [772, 536], [868, 557],
]

const heroUnderRibbonBottom: HeroPoint[] = [
  [70, 458], [158, 496], [258, 516], [365, 520],
  [468, 504], [570, 520], [674, 548], [778, 566], [853, 583],
]

const heroArchFaces: HeroFace[][] = [
  [
    { points: '111,233 123,234 139,184 128,180', tone: 1 },
    { points: '128,180 139,184 166,139 155,132', tone: 2 },
    { points: '155,132 166,139 211,103 201,94', tone: 3 },
    { points: '201,94 211,103 277,72 271,61', tone: 1 },
    { points: '271,61 277,72 351,57 351,46', tone: 2 },
    { points: '351,46 351,57 426,64 430,53', tone: 3 },
    { points: '430,53 426,64 491,91 500,82', tone: 1 },
    { points: '500,82 491,91 542,132 552,126', tone: 2 },
    { points: '552,126 542,132 575,179 585,176', tone: 3 },
    { points: '585,176 575,179 592,224 603,220', tone: 1 },
  ],
  [
    { points: '228,220 240,222 250,163 239,159', tone: 2 },
    { points: '239,159 250,163 287,117 279,108', tone: 3 },
    { points: '279,108 287,117 343,86 339,75', tone: 1 },
    { points: '339,75 343,86 407,83 410,72', tone: 2 },
    { points: '410,72 407,83 468,104 475,95', tone: 3 },
    { points: '475,95 468,104 521,141 530,134', tone: 1 },
    { points: '530,134 521,141 559,180 569,175', tone: 2 },
    { points: '569,175 559,180 592,225 602,220', tone: 3 },
  ],
  [
    { points: '344,218 356,220 367,167 356,163', tone: 3 },
    { points: '356,163 367,167 403,130 396,121', tone: 1 },
    { points: '396,121 403,130 451,112 451,101', tone: 2 },
    { points: '451,101 451,112 499,121 504,111', tone: 3 },
    { points: '504,111 499,121 541,151 550,144', tone: 1 },
    { points: '550,144 541,151 570,185 580,181', tone: 2 },
    { points: '580,181 570,185 593,225 603,221', tone: 3 },
  ],
  [
    { points: '460,229 471,231 482,190 472,187', tone: 1 },
    { points: '472,187 482,190 511,170 506,161', tone: 2 },
    { points: '506,161 511,170 541,171 546,162', tone: 3 },
    { points: '546,162 541,171 570,190 577,183', tone: 1 },
    { points: '577,183 570,190 594,225 603,221', tone: 2 },
  ],
]

function ribbonSegmentPoints(from: HeroPoint, to: HeroPoint, width: number) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const length = Math.hypot(dx, dy) || 1
  const nx = (-dy / length) * width / 2
  const ny = (dx / length) * width / 2
  return `${from[0] + nx},${from[1] + ny} ${to[0] + nx},${to[1] + ny} ${to[0] - nx},${to[1] - ny} ${from[0] - nx},${from[1] - ny}`
}

function AxisRod({ from, to }: { from: HeroPoint; to: HeroPoint }) {
  const points = ribbonSegmentPoints(from, to, 11)
  return (
    <g className="linear-hero__rod-segment">
      <polygon points={points} />
      <line x1={from[0]} y1={from[1] - 3} x2={to[0]} y2={to[1] - 3} />
      <line x1={from[0]} y1={from[1] + 3} x2={to[0]} y2={to[1] + 3} />
    </g>
  )
}

function LinearPolyState({
  x,
  y,
  width,
  height,
  railY,
  current = false,
  future = false,
}: {
  x: number
  y: number
  width: number
  height: number
  railY: number
  current?: boolean
  future?: boolean
}) {
  const shoulderY = -height * 0.05
  const waistY = height * 0.16
  const baseY = railY - y
  const className = [
    'linear-hero__state',
    current ? 'is-current' : '',
    future ? 'is-future' : '',
  ].filter(Boolean).join(' ')

  return (
    <g transform={`translate(${x} ${y})`} className={className}>
      <polygon points={`0,${-height} ${-width},${shoulderY} ${-width * 0.26},${-height * 0.4}`} className="linear-hero__facet linear-hero__facet--1" />
      <polygon points={`0,${-height} ${-width * 0.26},${-height * 0.4} 0,-4`} className="linear-hero__facet linear-hero__facet--2" />
      <polygon points={`0,${-height} 0,-4 ${width * 0.28},${-height * 0.38}`} className="linear-hero__facet linear-hero__facet--3" />
      <polygon points={`0,${-height} ${width * 0.28},${-height * 0.38} ${width},${shoulderY}`} className="linear-hero__facet linear-hero__facet--4" />
      <polygon points={`${-width},${shoulderY} ${-width * 0.72},${waistY} 0,-4 ${-width * 0.26},${-height * 0.4}`} className="linear-hero__facet linear-hero__facet--5" />
      <polygon points={`${width},${shoulderY} ${width * 0.28},${-height * 0.38} 0,-4 ${width * 0.72},${waistY}`} className="linear-hero__facet linear-hero__facet--6" />
      <polygon points={`${-width * 0.72},${waistY} 0,-4 ${-width * 0.18},${height * 0.5}`} className="linear-hero__facet linear-hero__facet--7" />
      <polygon points={`${-width * 0.72},${waistY} ${-width * 0.18},${height * 0.5} 0,${height}`} className="linear-hero__facet linear-hero__facet--8" />
      <polygon points={`0,-4 ${width * 0.72},${waistY} ${width * 0.2},${height * 0.48}`} className="linear-hero__facet linear-hero__facet--9" />
      <polygon points={`${width * 0.72},${waistY} 0,${height} ${width * 0.2},${height * 0.48}`} className="linear-hero__facet linear-hero__facet--10" />
      <polygon points={`${-width * 0.72},${waistY} 0,${height} ${-width * 0.3},${baseY}`} className="linear-hero__foot linear-hero__foot--1" />
      <polygon points={`${width * 0.72},${waistY} ${width * 0.3},${baseY} 0,${height}`} className="linear-hero__foot linear-hero__foot--2" />
      <polygon points={`${-width * 0.3},${baseY} 0,${height} 0,${baseY + 10}`} className="linear-hero__foot linear-hero__foot--3" />
      <polygon points={`0,${height} ${width * 0.3},${baseY} 0,${baseY + 10}`} className="linear-hero__foot linear-hero__foot--4" />
      <ellipse cx={-width} cy={shoulderY} rx="6" ry="10" className="linear-hero__collar" />
      <ellipse cx={width} cy={shoulderY} rx="6" ry="10" className="linear-hero__collar" />
      <path d={`M0 ${-height} ${width} ${shoulderY} ${width * 0.74} ${waistY} 0 ${height} ${-width * 0.74} ${waistY} ${-width} ${shoulderY}Z`} className="linear-hero__state-outline" />
      <path d={`M${-width} ${shoulderY} 0 -4 ${width} ${shoulderY}M0 ${-height}V${height}M${-width * 0.72} ${waistY}H${width * 0.72}`} className="linear-hero__state-seam" />
    </g>
  )
}

function HeroFaceSet({ faces, className }: { faces: HeroFace[]; className: string }) {
  return (
    <g className={className}>
      {faces.map((face, index) => (
        <polygon
          key={`${face.points}-${index}`}
          points={face.points}
          className={`linear-hero__arc-facet linear-hero__arc-facet--${face.tone}`}
        />
      ))}
    </g>
  )
}

function LegacyLinearHeroArt({ className = '' }: LinearArtProps) {
  return (
    <svg
      className={`linear-hero ${className}`.trim()}
      viewBox="0 0 960 600"
      aria-hidden="true"
      data-family-art="b"
      data-family-mode="hero"
    >
      <g className="linear-art__construction">
        <circle cx="482" cy="302" r="278" />
        <circle cx="482" cy="302" r="208" />
        {[120, 236, 351, 466, 594, 718, 830].map((x) => (
          <path key={x} d={`M${x} 36V570`} />
        ))}
        {[96, 196, 296, 396, 496].map((y) => (
          <path key={y} d={`M36 ${y}H926`} />
        ))}
        <path d="M34 566 914 48M30 548 930 548M32 578 930 578M48 512 900 106" />
      </g>

      <ellipse className="linear-hero__ground" cx="488" cy="526" rx="432" ry="37" />
      <g className="linear-hero__ground-hatching">
        <path d="M42 500 750 584M92 480 838 574M158 466 912 556" />
        <path d="M72 572 710 460M164 586 810 482M266 592 900 508" />
      </g>

      <g className="linear-hero__rolling-ribbon">
        {heroUnderRibbonTop.slice(0, -1).map(([topX, topY], index) => {
          const [nextTopX, nextTopY] = heroUnderRibbonTop[index + 1]
          const [bottomX, bottomY] = heroUnderRibbonBottom[index]
          const [nextBottomX, nextBottomY] = heroUnderRibbonBottom[index + 1]
          return (
            <polygon
              key={topX}
              points={`${topX},${topY} ${nextTopX},${nextTopY} ${nextBottomX},${nextBottomY} ${bottomX},${bottomY}`}
              className={`linear-hero__ribbon-facet linear-hero__ribbon-facet--${index % 3 + 1}`}
            />
          )
        })}
        <path d="M75 430 166 462 264 476 366 480 467 469 566 484 668 513 772 536 868 557" />
        <path d="M70 458 158 496 258 516 365 520 468 504 570 520 674 548 778 566 853 583" />
      </g>

      <g className="linear-hero__support-rail">
        {heroRailTop.slice(0, -1).map(([topX, topY], index) => {
          const [nextTopX, nextTopY] = heroRailTop[index + 1]
          const [bottomX, bottomY] = heroRailBottom[index]
          const [nextBottomX, nextBottomY] = heroRailBottom[index + 1]
          return (
            <polygon
              key={topX}
              points={`${topX},${topY} ${nextTopX},${nextTopY} ${nextBottomX},${nextBottomY} ${bottomX},${bottomY}`}
              className={`linear-hero__rail-facet linear-hero__rail-facet--${index % 4 + 1}`}
            />
          )
        })}
        <path d="M58 390 170 386 282 392 397 405 514 426 635 451 758 480 886 516" />
        <path d="M66 428 176 423 287 430 401 444 516 466 632 491 751 521 874 558" />
      </g>

      <g className="linear-hero__axis">
        <AxisRod from={[43, 302]} to={[120, 302]} />
        {heroSpineStates.slice(0, -1).map((state, index) => (
          <AxisRod
            key={state.x}
            from={[state.x, state.y]}
            to={[heroSpineStates[index + 1].x, heroSpineStates[index + 1].y]}
          />
        ))}
        <AxisRod from={[830, 380]} to={[900, 405]} />
        <circle cx="43" cy="302" r="14" />
        <circle cx="43" cy="302" r="7" />
        <polygon className="linear-hero__axis-arrow" points="900,390 936,420 891,423" />
      </g>

      <g className="linear-hero__predecessor-ribbons">
        {heroArchFaces.map((faces, index) => (
          <HeroFaceSet key={index} faces={faces} className={`linear-hero__arc linear-hero__arc--${index + 1}`} />
        ))}
        <polygon className="linear-hero__arc-arrow" points="590,218 606,228 592,242" />
        <polygon className="linear-hero__arc-arrow" points="580,216 595,228 580,239" />
      </g>

      <g className="linear-hero__states">
        {heroSpineStates.map((state) => (
          <LinearPolyState key={state.x} {...state} />
        ))}
      </g>
    </svg>
  )
}

void LegacyLinearHeroArt

export function LinearHeroArt({ className = '' }: LinearArtProps) {
  return (
    <img
      className={`linear-hero linear-hero--image ${className}`.trim()}
      src={linearHeroImage}
      alt=""
      aria-hidden="true"
      data-family-art="b"
      data-family-mode="hero"
      draggable={false}
    />
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
        <path d="M72 140H1033C1098 140 1138 194 1138 264S1080 420 983 420H197" />
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

function PathPlate() {
  const triangle = [
    { x: 150, y: 52, value: 3 },
    { x: 108, y: 112, value: 6 },
    { x: 192, y: 112, value: 5 },
    { x: 66, y: 172, value: 3 },
    { x: 150, y: 172, value: 8 },
    { x: 234, y: 172, value: 2 },
    { x: 24, y: 232, value: 4 },
    { x: 108, y: 232, value: 1 },
    { x: 192, y: 232, value: 9 },
    { x: 276, y: 232, value: 2 },
  ] as const
  const edges = [
    [0, 1], [0, 2],
    [1, 3], [1, 4], [2, 4], [2, 5],
    [3, 6], [3, 7], [4, 7], [4, 8], [5, 8], [5, 9],
  ] as const
  const chosenEdges = new Set(['0-1', '1-4', '4-8'])
  const chosenNodes = new Set([0, 1, 4, 8])

  return (
    <>
      <text x="34" y="30" className="linear-art__caption">LEGAL PATH / BOTTOM-UP SOURCE</text>
      <g className="linear-plate__path-graph">
        {edges.map(([from, to]) => (
          <path
            key={`${from}-${to}`}
            d={`M${triangle[from].x} ${triangle[from].y}L${triangle[to].x} ${triangle[to].y}`}
            className={chosenEdges.has(`${from}-${to}`) ? 'is-chosen' : undefined}
          />
        ))}
        {triangle.map(({ x, y, value }, index) => (
          <g key={`${x}-${y}`} className={`linear-plate__cell${chosenNodes.has(index) ? ' is-chosen' : ''}`}>
            <circle cx={x} cy={y} r="14" />
            <text x={x} y={y + 4} textAnchor="middle">{value}</text>
          </g>
        ))}
      </g>
      <text x="150" y="274" textAnchor="middle" className="linear-plate__chosen-label">3 → 6 → 8 → 9</text>

      <path d="M316 34V330" className="linear-plate__separator" />
      <text x="348" y="62" className="linear-plate__label">当前状态</text>
      <g className="linear-plate__state-node is-current" transform="translate(430 78)">
        <rect width="136" height="54" />
        <text x="68" y="22" textAnchor="middle">f[i][j]</text>
        <text x="68" y="42" textAnchor="middle" className="linear-art__index">从下方回推</text>
      </g>
      <g className="linear-plate__state-node is-source" transform="translate(350 214)">
        <rect width="112" height="48" />
        <text x="56" y="20" textAnchor="middle">f[i+1][j]</text>
        <text x="56" y="38" textAnchor="middle" className="linear-art__index">正下方</text>
      </g>
      <g className="linear-plate__state-node is-source" transform="translate(494 214)">
        <rect width="112" height="48" />
        <text x="56" y="20" textAnchor="middle">f[i+1][j+1]</text>
        <text x="56" y="38" textAnchor="middle" className="linear-art__index">右下方</text>
      </g>
      <path d="M406 214C410 170 450 156 476 132" className="linear-plate__source-arrow" />
      <path d="M550 214C544 170 520 154 518 132" className="linear-plate__source-arrow" />
      <path d="M348 300H606" className="linear-plate__brace" />
      <text x="477" y="326" textAnchor="middle" className="linear-plate__formula">
        f[i][j] = a[i][j] + max(两个后继)
      </text>
    </>
  )
}

function MaxsegPlate() {
  const values = [-2, 11, -4, 13, -5, -2]
  const x0 = 54
  const step = 88
  const baseline = 156
  const selected = new Set([1, 2, 3])

  return (
    <>
      <text x="34" y="30" className="linear-art__caption">CONTIGUOUS SEGMENT / RESTART GATE</text>
      <path d="M34 156H606" className="linear-plate__rail" />
      <rect x="124" y="42" width="264" height="174" className="linear-plate__segment-band" />
      <g className="linear-plate__bars">
        {values.map((value, index) => {
          const height = Math.abs(value) * 7
          const x = x0 + index * step
          const y = value >= 0 ? baseline - height : baseline
          return (
            <g key={`${value}-${index}`} className={selected.has(index) ? 'is-chosen' : undefined}>
              <rect x={x} y={y} width="46" height={height} />
              <text x={x + 23} y={value >= 0 ? y - 10 : y + height + 17} textAnchor="middle">{value}</text>
              <text x={x + 23} y="208" textAnchor="middle" className="linear-art__index">i={index}</text>
            </g>
          )
        })}
      </g>
      <text x="256" y="58" textAnchor="middle" className="linear-plate__chosen-label">连续段 11 − 4 + 13 = 20</text>

      <g className="linear-plate__state-node is-source" transform="translate(52 260)">
        <rect width="154" height="50" />
        <text x="77" y="20" textAnchor="middle">接续前一段</text>
        <text x="77" y="39" textAnchor="middle" className="linear-art__index">dp[i−1] + a[i]</text>
      </g>
      <g className="linear-plate__state-node" transform="translate(244 260)">
        <rect width="126" height="50" />
        <text x="63" y="20" textAnchor="middle">从 i 重开</text>
        <text x="63" y="39" textAnchor="middle" className="linear-art__index">a[i]</text>
      </g>
      <g className="linear-plate__state-node is-current" transform="translate(448 260)">
        <rect width="142" height="50" />
        <text x="71" y="20" textAnchor="middle">以 i 结尾</text>
        <text x="71" y="39" textAnchor="middle" className="linear-art__index">dp[i]</text>
      </g>
      <path d="M206 285H438" className="linear-plate__source-arrow" />
      <path d="M370 285H438" className="linear-plate__source-arrow" />
      <text x="320" y="352" textAnchor="middle" className="linear-plate__formula">
        dp[i] = max(dp[i−1] + a[i], a[i])
      </text>
    </>
  )
}

function LcsPlate() {
  const top = ['A', 'B', 'C', 'B', 'D', 'A', 'B']
  const bottom = ['B', 'D', 'C', 'A', 'B']
  const topX = [64, 142, 220, 298, 376, 454, 532]
  const bottomX = [112, 216, 320, 424, 528]
  const matches = [[1, 0], [2, 2], [5, 3], [6, 4]] as const
  const selectedTop = new Set<number>(matches.map(([index]) => index))
  const selectedBottom = new Set<number>(matches.map(([, index]) => index))

  return (
    <>
      <text x="34" y="30" className="linear-art__caption">TWO SEQUENCES / MONOTONE MATCHING</text>
      <text x="34" y="108" className="linear-plate__label">序列 A</text>
      <text x="34" y="266" className="linear-plate__label">序列 B</text>
      <path d="M54 96H586M54 254H586" className="linear-plate__rail" />
      <g className="linear-plate__matching">
        {matches.map(([topIndex, bottomIndex]) => (
          <path
            key={`${topIndex}-${bottomIndex}`}
            d={`M${topX[topIndex]} 116C${topX[topIndex]} 166 ${bottomX[bottomIndex]} 186 ${bottomX[bottomIndex]} 234`}
          />
        ))}
      </g>
      <g className="linear-plate__sequence">
        {top.map((char, index) => (
          <g key={`${char}-top-${index}`} className={selectedTop.has(index) ? 'is-chosen' : undefined}>
            <rect x={topX[index] - 20} y="76" width="40" height="40" />
            <text x={topX[index]} y="101" textAnchor="middle">{char}</text>
            <text x={topX[index]} y="62" textAnchor="middle" className="linear-art__index">{index + 1}</text>
          </g>
        ))}
        {bottom.map((char, index) => (
          <g key={`${char}-bottom-${index}`} className={selectedBottom.has(index) ? 'is-chosen' : undefined}>
            <rect x={bottomX[index] - 20} y="234" width="40" height="40" />
            <text x={bottomX[index]} y="259" textAnchor="middle">{char}</text>
            <text x={bottomX[index]} y="294" textAnchor="middle" className="linear-art__index">{index + 1}</text>
          </g>
        ))}
      </g>
      <path d="M180 324H460" className="linear-plate__brace" />
      <text x="320" y="320" textAnchor="middle" className="linear-plate__chosen-label">B · C · A · B</text>
      <text x="320" y="350" textAnchor="middle" className="linear-plate__formula">
        匹配边不交叉，公共子序列长度 = 4
      </text>
    </>
  )
}

function FsmPlate() {
  const columns = [
    { x: 72, label: 'i−1' },
    { x: 270, label: 'i' },
    { x: 468, label: 'i+1' },
  ] as const

  return (
    <>
      <text x="34" y="30" className="linear-art__caption">STATE RAILS / ALLOWED TRANSITIONS</text>
      <g className="linear-plate__fsm-rails">
        <path d="M34 122H606M34 266H606" />
      </g>
      {columns.map(({ x, label }, index) => (
        <g key={label}>
          <text x={x + 50} y="62" textAnchor="middle" className="linear-art__index">{label}</text>
          <g className={`linear-plate__state-node${index === 1 ? ' is-current' : ''}`} transform={`translate(${x} 88)`}>
            <rect width="100" height="52" />
            <text x="50" y="22" textAnchor="middle">不选</text>
            <text x="50" y="41" textAnchor="middle" className="linear-art__index">state 0</text>
          </g>
          <g className={`linear-plate__state-node${index === 1 ? ' is-chosen' : ''}`} transform={`translate(${x} 232)`}>
            <rect width="100" height="52" />
            <text x="50" y="22" textAnchor="middle">选择</text>
            <text x="50" y="41" textAnchor="middle" className="linear-art__index">state 1</text>
          </g>
        </g>
      ))}
      <g className="linear-plate__fsm-edges">
        <path d="M172 114H260" />
        <path d="M172 258C214 258 218 130 260 130" />
        <path d="M172 130C218 130 218 258 260 258" className="is-chosen" />
        <path d="M370 114H458" />
        <path d="M370 258C414 258 416 130 458 130" className="is-chosen" />
        <path d="M370 130C414 130 416 258 458 258" />
      </g>
      <path d="M187 298H255" className="linear-plate__invalid-edge" />
      <text x="221" y="316" textAnchor="middle" className="linear-plate__invalid-label">不能连续选择</text>
      <text x="320" y="354" textAnchor="middle" className="linear-plate__formula">
        dp[i][state] = best(所有允许的前一状态)
      </text>
    </>
  )
}

function CountPlate() {
  const sequence = [1, 1, 2, 3, 5, 8, 13]
  return (
    <>
      <text x="34" y="30" className="linear-art__caption">DISJOINT SOURCES / ADDITIVE MERGE</text>
      <g className="linear-plate__state-node is-source" transform="translate(48 72)">
        <rect width="134" height="52" />
        <text x="67" y="22" textAnchor="middle">f[i−2]</text>
        <text x="67" y="41" textAnchor="middle" className="linear-art__index">跨两级到达</text>
      </g>
      <g className="linear-plate__state-node is-source" transform="translate(48 166)">
        <rect width="134" height="52" />
        <text x="67" y="22" textAnchor="middle">f[i−1]</text>
        <text x="67" y="41" textAnchor="middle" className="linear-art__index">跨一级到达</text>
      </g>
      <g className="linear-plate__operator" transform="translate(300 145)">
        <circle r="31" />
        <text y="8" textAnchor="middle">+</text>
      </g>
      <g className="linear-plate__state-node is-current" transform="translate(436 120)">
        <rect width="154" height="52" />
        <text x="77" y="22" textAnchor="middle">f[i]</text>
        <text x="77" y="41" textAnchor="middle" className="linear-art__index">全部到达方案</text>
      </g>
      <path d="M182 98C238 98 248 126 270 137" className="linear-plate__source-arrow" />
      <path d="M182 192C238 192 248 164 270 153" className="linear-plate__source-arrow" />
      <path d="M331 145H426" className="linear-plate__source-arrow" />
      <text x="300" y="210" textAnchor="middle" className="linear-plate__label">两类来路互不重叠，所以直接相加</text>

      <path d="M38 270H602" className="linear-plate__rail" />
      <g className="linear-plate__count-tape">
        {sequence.map((value, index) => (
          <g key={index} className={index === 0 ? 'is-chosen' : index === sequence.length - 1 ? 'is-current' : undefined}>
            <rect x={42 + index * 80} y="250" width="62" height="54" />
            <text x={73 + index * 80} y="272" textAnchor="middle" className="linear-art__index">f[{index}]</text>
            <text x={73 + index * 80} y="294" textAnchor="middle">{value}</text>
          </g>
        ))}
      </g>
      <text x="42" y="334" className="linear-plate__chosen-label">地基 f[0] = 1</text>
      <text x="598" y="334" textAnchor="end" className="linear-plate__formula">f[i] = f[i−1] + f[i−2]</text>
    </>
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

      <g transform="translate(454 54)" className="linear-plate__tails">
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

const plateDescriptions = {
  path: '数字三角形中的合法边组成状态路径，当前状态从正下方和右下方两个后继中取优并加上本格权值。',
  maxseg: '每个位置的最大连续子段只在接续前一段和从当前位置重新开始之间取较大值。',
  lis: '序列点通过更早且更小的元素形成上升前驱链，右侧 tails 层记录各长度的最小结尾。',
  lcs: '两条字符轨道上的匹配边保持单调且互不交叉，从而选出一条公共子序列。',
  edit: '双序列前缀矩阵中的当前状态由删除、插入和替换三条带代价的来源边取最小值。',
  fsm: '每个索引具有选择与不选两种离散状态，只有允许的前一状态才能沿边转移到下一列。',
  count: '互不重叠的两类前驱方案通过加法汇入当前状态，并由方案计数的地基 f[0] 等于 1 启动。',
} as const

type LinearLessonSlug = keyof typeof plateDescriptions

const lessonPlates: Record<LinearLessonSlug, () => ReactElement> = {
  path: PathPlate,
  maxseg: MaxsegPlate,
  lis: LisPlate,
  lcs: LcsPlate,
  edit: EditPlate,
  fsm: FsmPlate,
  count: CountPlate,
}

export function LinearLessonPlate({ slug, title, className = '' }: LinearLessonPlateProps) {
  const instanceId = useId().replace(/:/g, '')
  const plateSlug = slug as LinearLessonSlug
  const Plate = lessonPlates[plateSlug]

  if (!Plate) {
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
      <desc id={descriptionId}>{plateDescriptions[plateSlug]}</desc>
      <defs>
        <marker id={arrowId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0 8 4 0 8Z" className="linear-art__source-fill" />
        </marker>
      </defs>
      <Plate />
    </svg>
  )
}
