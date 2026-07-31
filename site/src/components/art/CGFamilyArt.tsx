import type { ReactNode } from 'react'
import type { PartId } from '../../data/catalog.ts'
import './cg-family-art.css'

type UpgradedPartId = Extract<PartId, 'c' | 'd' | 'e' | 'f' | 'g'>

function JourneyShell({
  family,
  className = '',
  children,
}: {
  family: UpgradedPartId
  className?: string
  children: ReactNode
}) {
  return (
    <svg
      className={`cg-journey cg-journey--${family} ${className}`.trim()}
      viewBox="0 0 1080 680"
      aria-hidden="true"
      focusable="false"
      data-family-art={family}
      data-family-mode="journey"
    >
      {children}
    </svg>
  )
}

export function IntervalJourneyArt({ className = '' }: { className?: string }) {
  const shells = [
    { y: 102, height: 86, inset: 54 },
    { y: 210, height: 72, inset: 138 },
    { y: 316, height: 60, inset: 222 },
    { y: 420, height: 48, inset: 306 },
    { y: 524, height: 38, inset: 388 },
  ]

  return (
    <JourneyShell family="c" className={className}>
      <g className="cg-journey__construction">
        <circle cx="540" cy="336" r="290" />
        <circle cx="540" cy="336" r="210" />
        <path d="M84 610H996" />
      </g>
      <g className="interval-journey__shells">
        {shells.map(({ y, height, inset }, index) => (
          <g key={y}>
            <path d={`M${inset} ${y + height} Q540 ${y - height} ${1080 - inset} ${y + height}`} />
            <path d={`M${inset} ${y + height}V${y + height + 34}M${1080 - inset} ${y + height}V${y + height + 34}`} />
            <circle cx={inset} cy={y + height} r={index === 0 ? 9 : 6} />
            <circle cx={1080 - inset} cy={y + height} r={index === 0 ? 9 : 6} />
          </g>
        ))}
        <path className="cg-journey__accent" d="M540 130V610" />
        <polygon className="cg-journey__accent-fill" points="540,596 530,576 550,576" />
      </g>
    </JourneyShell>
  )
}

export function MatrixJourneyArt({ className = '' }: { className?: string }) {
  return (
    <JourneyShell family="d" className={className}>
      <g className="cg-journey__construction">
        <circle cx="540" cy="340" r="286" />
        <path d="M120 590L540 92 960 590Z" />
      </g>
      <g className="matrix-journey__planes">
        <path d="M116 176L450 104 450 472 116 544Z" />
        <path d="M630 104L964 176 964 544 630 472Z" />
        {Array.from({ length: 4 }, (_, index) => (
          <path key={`left-row-${index}`} d={`M116 ${176 + index * 92}L450 ${104 + index * 92}`} />
        ))}
        {Array.from({ length: 4 }, (_, index) => (
          <path key={`right-row-${index}`} d={`M630 ${104 + index * 92}L964 ${176 + index * 92}`} />
        ))}
        {Array.from({ length: 5 }, (_, index) => (
          <path key={`left-col-${index}`} d={`M${116 + index * 83.5} 176L${116 + index * 83.5} 544`} />
        ))}
        {Array.from({ length: 5 }, (_, index) => (
          <path key={`right-col-${index}`} d={`M${630 + index * 83.5} 104L${630 + index * 83.5} 472`} />
        ))}
        <path className="cg-journey__accent" d="M468 324H612" />
        <polygon className="cg-journey__accent-fill" points="608,324 584,310 584,338" />
      </g>
    </JourneyShell>
  )
}

export function RerootJourneyArt({ className = '' }: { className?: string }) {
  const edges = [
    [540, 126, 350, 262],
    [540, 126, 730, 262],
    [350, 262, 230, 430],
    [350, 262, 440, 450],
    [730, 262, 640, 450],
    [730, 262, 850, 430],
  ]
  const nodes = [
    [540, 126],
    [350, 262],
    [730, 262],
    [230, 430],
    [440, 450],
    [640, 450],
    [850, 430],
  ]

  return (
    <JourneyShell family="e" className={className}>
      <g className="cg-journey__construction">
        <circle cx="540" cy="338" r="290" />
        <circle cx="540" cy="338" r="214" />
      </g>
      <g className="reroot-journey__tree">
        {edges.map(([x1, y1, x2, y2]) => (
          <path key={`${x1}-${y1}-${x2}-${y2}`} d={`M${x1} ${y1}L${x2} ${y2}`} />
        ))}
        {nodes.map(([x, y], index) => (
          <g key={`${x}-${y}`}>
            <circle className={index === 0 || index === 3 || index === 6 ? 'is-root-stop' : ''} cx={x} cy={y} r={index === 0 ? 24 : 18} />
          </g>
        ))}
        <path className="reroot-journey__orbit" d="M224 420C244 96 822 42 862 414C884 610 620 632 458 566C292 498 280 302 416 226" />
        <polygon className="cg-journey__accent-fill" points="420,224 394,222 407,246" />
        <path className="reroot-journey__return" d="M540 150C530 250 470 336 440 425M540 150C558 244 626 330 640 425" />
      </g>
    </JourneyShell>
  )
}

export function TreeJourneyArt({ className = '' }: { className?: string }) {
  const edges = [
    [540, 100, 350, 250],
    [540, 100, 730, 250],
    [350, 250, 240, 446],
    [350, 250, 460, 446],
    [730, 250, 620, 446],
    [730, 250, 840, 446],
  ]
  return (
    <JourneyShell family="f" className={className}>
      <g className="cg-journey__construction">
        <path d="M120 590H960" />
        <circle cx="540" cy="330" r="286" />
      </g>
      <g className="tree-journey__canopy">
        {edges.map(([x1, y1, x2, y2]) => (
          <path key={`${x1}-${y1}-${x2}-${y2}`} d={`M${x1} ${y1}L${x2} ${y2}`} />
        ))}
        <path className="tree-journey__container" d="M176 510Q350 592 504 510" />
        <path className="tree-journey__container" d="M576 510Q730 592 904 510" />
        <path className="tree-journey__container" d="M282 292Q540 650 798 292" />
        {[
          [540, 100, 25],
          [350, 250, 21],
          [730, 250, 21],
          [240, 446, 17],
          [460, 446, 17],
          [620, 446, 17],
          [840, 446, 17],
        ].map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />)}
        <path className="cg-journey__accent" d="M240 430L344 270M460 430L356 270M350 228L520 112M620 430L724 270M840 430L736 270M730 228L560 112" />
      </g>
    </JourneyShell>
  )
}

export function BitmaskJourneyArt({ className = '' }: { className?: string }) {
  const nodes = [
    [170, 194],
    [400, 112],
    [650, 174],
    [892, 112],
    [950, 370],
    [720, 522],
    [430, 500],
    [182, 438],
  ]
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 0],
    [0, 2],
    [2, 4],
    [4, 6],
    [6, 0],
  ]
  return (
    <JourneyShell family="g" className={className}>
      <g className="cg-journey__construction">
        <circle cx="540" cy="330" r="286" />
        <path d="M96 600H984" />
      </g>
      <g className="bitmask-journey__space">
        {edges.map(([from, to]) => {
          const [x1, y1] = nodes[from]
          const [x2, y2] = nodes[to]
          return <path key={`${from}-${to}`} d={`M${x1} ${y1}L${x2} ${y2}`} />
        })}
        {nodes.map(([x, y], index) => (
          <g key={`${x}-${y}`} className={index === 2 ? 'is-current' : ''}>
            <polygon points={`${x},${y - 25} ${x + 23},${y} ${x},${y + 25} ${x - 23},${y}`} />
            <circle cx={x} cy={y} r="4" />
          </g>
        ))}
        <path className="bitmask-journey__contour" d="M92 348C262 262 356 384 516 302C670 222 804 332 1000 244" />
        <polygon className="cg-journey__accent-fill" points="990,244 964,232 970,258" />
      </g>
    </JourneyShell>
  )
}
