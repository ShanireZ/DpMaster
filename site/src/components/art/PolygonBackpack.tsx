import { useId } from 'react'
import './polygon-backpack.css'

type BackpackMode = 'solid' | 'wireframe'

interface BackpackGeometryProps {
  mode?: BackpackMode
}

interface PolygonBackpackProps extends BackpackGeometryProps {
  className?: string
  decorative?: boolean
}

interface KnapsackLessonPlateProps {
  slug: string
  className?: string
}

const lessonTitles: Record<string, string> = {
  '01': '01 背包状态图',
  complete: '完全背包正序状态图',
  multiple: '多重背包二进制拆分图',
  group: '分组背包互斥选择图',
  mixed: '混合背包调度图',
  cost2d: '二维费用背包状态图',
  dep: '有依赖背包组合图',
  variant: '背包综合变形聚合图',
  fractional: '分数背包比例排序图',
}

function BackpackGeometry({ mode = 'solid' }: BackpackGeometryProps) {
  const wire = mode === 'wireframe'
  return (
    <g className={`poly-backpack__geometry poly-backpack__geometry--${mode}`}>
      <g className="poly-backpack__handle">
        <polygon points="292,156 322,116 404,116 431,156 411,205 311,205" className="poly-backpack__face poly-backpack__face--2" />
        <polygon points="292,156 311,205 335,181 333,149 322,116" className="poly-backpack__face poly-backpack__face--4" />
        <polygon points="333,149 393,149 411,205 335,181" className="poly-backpack__face poly-backpack__face--1" />
        <polygon points="393,149 404,116 431,156 411,205" className="poly-backpack__face poly-backpack__face--5" />
      </g>

      <g className="poly-backpack__body">
        <polygon points="194,221 497,221 535,275 491,366 232,366" className="poly-backpack__face poly-backpack__face--1" />
        <polygon points="194,221 232,366 166,468 116,560 139,308" className="poly-backpack__face poly-backpack__face--5" />
        <polygon points="497,221 535,275 574,407 557,565 491,366" className="poly-backpack__face poly-backpack__face--6" />
        <polygon points="232,366 343,405 319,595 116,560 166,468" className="poly-backpack__face poly-backpack__face--3" />
        <polygon points="232,366 491,366 557,565 319,595 343,405" className="poly-backpack__face poly-backpack__face--4" />
        <polygon points="232,366 343,405 491,366 369,292" className="poly-backpack__face poly-backpack__face--2" />
        <polygon points="194,221 369,292 232,366" className="poly-backpack__face poly-backpack__face--2" />
        <polygon points="194,221 497,221 369,292" className="poly-backpack__face poly-backpack__face--1" />
        <polygon points="497,221 491,366 369,292" className="poly-backpack__face poly-backpack__face--5" />
        <polygon points="116,560 319,595 240,500" className="poly-backpack__face poly-backpack__face--6" />
        <polygon points="319,595 557,565 425,478" className="poly-backpack__face poly-backpack__face--5" />
        <polygon points="343,405 319,595 425,478" className="poly-backpack__face poly-backpack__face--3" />
        <polygon points="343,405 491,366 425,478" className="poly-backpack__face poly-backpack__face--2" />
        <polygon points="491,366 557,565 425,478" className="poly-backpack__face poly-backpack__face--4" />
      </g>

      <g className="poly-backpack__buckle">
        <polygon points="167,432 215,444 205,481 158,467" className="poly-backpack__face poly-backpack__face--1" />
        <polygon points="158,467 205,481 198,534 151,518" className="poly-backpack__face poly-backpack__face--3" />
        <polygon points="169,480 193,487 189,512 164,505" className="poly-backpack__face poly-backpack__face--6" />
      </g>

      <g className="poly-backpack__strap">
        <polygon points="506,230 551,237 585,264 566,292 525,274" className="poly-backpack__face poly-backpack__face--2" />
        <polygon points="566,292 585,264 619,313 604,350" className="poly-backpack__face poly-backpack__face--1" />
        <polygon points="604,350 619,313 645,412 630,452" className="poly-backpack__face poly-backpack__face--4" />
        <polygon points="630,452 645,412 649,505 632,540" className="poly-backpack__face poly-backpack__face--5" />
        <polygon points="632,540 649,505 618,579 585,591" className="poly-backpack__face poly-backpack__face--3" />
        <polygon points="585,591 618,579 557,565 530,557" className="poly-backpack__face poly-backpack__face--6" />
      </g>

      <path
        className="poly-backpack__outline"
        d="M194 221 292 156 322 116h82l27 40 66 65 38 54 16-38 34 27 34 49 26 99 4 93-31 74-61-14-238 30-203-35 23-252 55-87Z"
      />
      {!wire && (
        <g className="poly-backpack__facets">
          <path d="M194 221 491 366M497 221 232 366M116 560 491 366M319 595 194 221M557 565 232 366M139 308 425 478" />
          <path d="M343 405 557 565M166 468 497 221M240 500 369 292M425 478 535 275" />
        </g>
      )}
    </g>
  )
}

export default function PolygonBackpack({
  mode = 'solid',
  className = '',
  decorative = true,
}: PolygonBackpackProps) {
  const titleId = useId()
  return (
    <svg
      className={`poly-backpack poly-backpack--${mode} ${className}`.trim()}
      viewBox="0 0 720 680"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-labelledby={decorative ? undefined : titleId}
    >
      {!decorative && <title id={titleId}>多面体背包结构图</title>}
      <g className="poly-backpack__construction">
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`v-${i}`} x1={i * 80} y1="0" x2={i * 80} y2="680" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`h-${i}`} x1="0" y1={i * 80} x2="720" y2={i * 80} />
        ))}
        <circle cx="360" cy="360" r="282" />
        <circle cx="360" cy="360" r="218" />
        <circle cx="360" cy="360" r="144" />
        <path d="M34 680 686 18M0 572 720 263M360 0V680M0 360H720" />
      </g>
      <BackpackGeometry mode={mode} />
    </svg>
  )
}

function CapacityRail({
  y,
  direction = 'reverse',
  values = ['0', '1', '2', '3', '4', '5', '6', 'm'],
}: {
  y: number
  direction?: 'forward' | 'reverse'
  values?: string[]
}) {
  const startX = 72
  const cellW = 44
  return (
    <g className="knapsack-plate__rail">
      {values.map((value, index) => (
        <g key={`${value}-${index}`} transform={`translate(${startX + index * cellW},${y})`}>
          <rect width={cellW} height="42" />
          <text x={cellW / 2} y="26" textAnchor="middle">{value}</text>
        </g>
      ))}
      <path
        className="knapsack-plate__accent-line"
        d={direction === 'forward'
          ? `M${startX} ${y + 55}H${startX + values.length * cellW - 3}`
          : `M${startX + values.length * cellW} ${y + 55}H${startX + 3}`}
        markerEnd="url(#kp-arrow)"
      />
    </g>
  )
}

function ItemParcel({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <g transform={`translate(${x},${y})`} className="knapsack-plate__parcel">
      <polygon points="0,12 28,0 56,12 28,25" />
      <polygon points="0,12 28,25 28,57 0,43" />
      <polygon points="28,25 56,12 56,43 28,57" />
      <path d="M14 6 42 19M28 0v25" />
      {label && <text x="28" y="78" textAnchor="middle">{label}</text>}
    </g>
  )
}

function Plate01() {
  const path = new Set(['0-3', '1-3', '2-3', '2-2', '3-2', '3-1'])
  return (
    <g>
      <text x="55" y="58" className="knapsack-plate__label">物品 i</text>
      <text x="374" y="343" className="knapsack-plate__label">容量 j</text>
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => {
          const active = path.has(`${row}-${col}`)
          return (
            <g key={`${row}-${col}`} transform={`translate(${88 + col * 60},${78 + row * 60})`}>
              <circle r={active ? 6 : 4} className={active ? 'is-active' : ''} />
              {col < 4 && <line x1="6" x2="54" />}
              {row < 3 && <line y1="6" y2="54" />}
            </g>
          )
        }),
      )}
      <path className="knapsack-plate__accent-line" d="M268 78v60H208v60H148v60" markerEnd="url(#kp-arrow)" />
      <rect x="302" y="232" width="78" height="34" className="knapsack-plate__result" />
      <text x="341" y="254" textAnchor="middle" className="knapsack-plate__formula">f[i][j]</text>
    </g>
  )
}

function PlateComplete() {
  return (
    <g>
      <ItemParcel x={82} y={72} label="×∞" />
      <ItemParcel x={172} y={72} label="×∞" />
      <ItemParcel x={262} y={72} label="×∞" />
      <path className="knapsack-plate__brace" d="M78 55v-8h244v8" />
      <text x="200" y="33" textAnchor="middle" className="knapsack-plate__label">同一种物品可重复取用</text>
      <CapacityRail y={224} direction="forward" />
      <text x="245" y="337" textAnchor="middle" className="knapsack-plate__label">正序 j = w → m</text>
    </g>
  )
}

function PlateMultiple() {
  return (
    <g>
      <ItemParcel x={48} y={136} label="m 件" />
      <path className="knapsack-plate__accent-line" d="M126 165H176" markerEnd="url(#kp-arrow)" />
      <ItemParcel x={196} y={72} label="1" />
      <ItemParcel x={276} y={112} label="2" />
      <ItemParcel x={356} y={152} label="4" />
      <ItemParcel x={436} y={192} label="余量" />
      <path className="knapsack-plate__brace" d="M191 54v-9h301v9" />
      <text x="341" y="30" textAnchor="middle" className="knapsack-plate__label">二进制拆分</text>
      <text x="341" y="309" textAnchor="middle" className="knapsack-plate__formula">1 + 2 + 4 + 余量 = m</text>
    </g>
  )
}

function PlateGroup() {
  return (
    <g>
      {[0, 1, 2].map((group) => (
        <g key={group} transform={`translate(${58 + group * 156},78)`}>
          <path className="knapsack-plate__bracket" d="M0 0h122M0 0v132M0 132h122M122 0v132" />
          <text x="61" y="-18" textAnchor="middle" className="knapsack-plate__label">第 {group + 1} 组</text>
          <ItemParcel x={10} y={24} />
          <circle cx="92" cy="61" r="25" />
          <path d="M81 61h22M92 50v22" />
        </g>
      ))}
      <path className="knapsack-plate__brace" d="M58 250v10h434v-10" />
      <text x="275" y="292" textAnchor="middle" className="knapsack-plate__label">每组至多选择一件</text>
    </g>
  )
}

function PlateMixed() {
  const items = [
    { label: '×1', y: 60, route: '倒序' },
    { label: '×∞', y: 155, route: '正序' },
    { label: '×m', y: 250, route: '二进制拆分' },
  ]
  return (
    <g>
      {items.map((item, index) => (
        <g key={item.label}>
          <ItemParcel x={44} y={item.y} label={item.label} />
          <path className="knapsack-plate__accent-line" d={`M118 ${item.y + 28}H202`} markerEnd="url(#kp-arrow)" />
          <rect x="218" y={item.y + 4} width="118" height="48" className="knapsack-plate__result" />
          <text x="277" y={item.y + 34} textAnchor="middle" className="knapsack-plate__label">{item.route}</text>
          <path className="knapsack-plate__line" d={`M336 ${item.y + 28}H390V184H446`} />
          {index === 1 && <circle cx="446" cy="184" r="7" className="is-active" />}
        </g>
      ))}
      <text x="475" y="173" textAnchor="middle" className="knapsack-plate__label">统一容量</text>
      <text x="475" y="197" textAnchor="middle" className="knapsack-plate__label">状态</text>
      <path className="knapsack-plate__brace" d="M438 144h74v80h-74" />
    </g>
  )
}

function PlateCost2D() {
  return (
    <g>
      <text x="60" y="49" className="knapsack-plate__label">费用 B</text>
      <text x="372" y="354" className="knapsack-plate__label">费用 A</text>
      {Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: 7 }, (_, col) => (
          <rect
            key={`${row}-${col}`}
            x={88 + col * 48}
            y={64 + row * 48}
            width="48"
            height="48"
            className={row === 4 && col === 5 ? 'knapsack-plate__cell is-active' : 'knapsack-plate__cell'}
          />
        )),
      )}
      <path className="knapsack-plate__accent-line" d="M328 280H136M328 280V88" markerEnd="url(#kp-arrow)" />
      <text x="346" y="303" className="knapsack-plate__formula">f[a][b]</text>
    </g>
  )
}

function PlateDependency() {
  return (
    <g>
      <g transform="translate(72,66)" className="knapsack-plate__node">
        <circle cx="94" cy="44" r="36" />
        <text x="94" y="49" textAnchor="middle">主件</text>
        <circle cx="24" cy="154" r="31" />
        <text x="24" y="159" textAnchor="middle">附件</text>
        <circle cx="164" cy="154" r="31" />
        <text x="164" y="159" textAnchor="middle">附件</text>
        <path d="M74 74 38 125M114 74l36 51" />
      </g>
      <path className="knapsack-plate__accent-line" d="M288 176H342" markerEnd="url(#kp-arrow)" />
      {[
        { y: 58, label: '主件' },
        { y: 138, label: '主件 + 附件' },
        { y: 218, label: '主件 + 两附件' },
      ].map((row) => (
        <g key={row.y}>
          <rect x="366" y={row.y} width="176" height="54" className="knapsack-plate__result" />
          <text x="454" y={row.y + 34} textAnchor="middle" className="knapsack-plate__label">{row.label}</text>
        </g>
      ))}
      <text x="454" y="316" textAnchor="middle" className="knapsack-plate__label">先组合，再进入背包</text>
    </g>
  )
}

function PlateVariant() {
  const rows = [
    { op: 'max', label: '最优值', y: 72 },
    { op: '+', label: '方案数', y: 160 },
    { op: 'OR', label: '可行性', y: 248 },
  ]
  return (
    <g>
      <path className="knapsack-plate__brace" d="M62 142v84M62 184H130" />
      <text x="62" y="119" textAnchor="middle" className="knapsack-plate__label">容量骨架</text>
      {rows.map((row) => (
        <g key={row.op}>
          <path className="knapsack-plate__accent-line" d={`M130 184Q160 184 178 ${row.y + 24}H212`} markerEnd="url(#kp-arrow)" />
          <rect x="226" y={row.y} width="76" height="48" className="knapsack-plate__result" />
          <text x="264" y={row.y + 31} textAnchor="middle" className="knapsack-plate__formula">{row.op}</text>
          <text x="342" y={row.y + 30} className="knapsack-plate__label">{row.label}</text>
          <path className="knapsack-plate__line" d={`M412 ${row.y + 24}H520`} />
          {[0, 1, 2, 3].map((cell) => (
            <rect key={cell} x={412 + cell * 27} y={row.y + 8} width="27" height="32" />
          ))}
        </g>
      ))}
    </g>
  )
}

function PlateFractional() {
  return (
    <g>
      <text x="60" y="48" className="knapsack-plate__label">按 v/w 从高到低</text>
      <path className="knapsack-plate__accent-line" d="M62 75H520" markerEnd="url(#kp-arrow)" />
      {[0, 1, 2, 3].map((index) => (
        <g key={index} transform={`translate(${78 + index * 108},102)`}>
          <ItemParcel x={0} y={0} />
          <text x="28" y="92" textAnchor="middle" className="knapsack-plate__formula">
            {['1.50', '1.33', '1.25', '0.90'][index]}
          </text>
        </g>
      ))}
      <path className="knapsack-plate__vessel" d="M72 254v75h434v-75" />
      <rect x="88" y="278" width="118" height="51" className="knapsack-plate__fill" />
      <rect x="206" y="278" width="118" height="51" className="knapsack-plate__fill" />
      <rect x="324" y="278" width="78" height="51" className="knapsack-plate__fill is-fraction" />
      <text x="363" y="309" textAnchor="middle" className="knapsack-plate__formula">3/5</text>
      <text x="454" y="310" textAnchor="middle" className="knapsack-plate__label">可分割</text>
    </g>
  )
}

function LessonFocus({ slug }: { slug: string }) {
  switch (slug) {
    case 'complete': return <PlateComplete />
    case 'multiple': return <PlateMultiple />
    case 'group': return <PlateGroup />
    case 'mixed': return <PlateMixed />
    case 'cost2d': return <PlateCost2D />
    case 'dep': return <PlateDependency />
    case 'variant': return <PlateVariant />
    case 'fractional': return <PlateFractional />
    default: return <Plate01 />
  }
}

export function KnapsackLessonPlate({ slug, className = '' }: KnapsackLessonPlateProps) {
  const titleId = useId()
  const title = lessonTitles[slug] ?? lessonTitles['01']
  return (
    <svg
      className={`knapsack-plate ${className}`.trim()}
      viewBox="0 0 640 390"
      role="img"
      aria-labelledby={titleId}
      data-lesson-plate={slug}
    >
      <title id={titleId}>{title}</title>
      <defs>
        <marker id="kp-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">
          <path d="M0 0 8 4 0 8Z" />
        </marker>
      </defs>
      <g className="knapsack-plate__grid">
        {Array.from({ length: 10 }, (_, i) => <line key={`v-${i}`} x1={i * 64} y1="0" x2={i * 64} y2="390" />)}
        {Array.from({ length: 7 }, (_, i) => <line key={`h-${i}`} x1="0" y1={i * 64} x2="640" y2={i * 64} />)}
      </g>
      <LessonFocus slug={slug} />
      <g transform="translate(492,190) scale(.22)" className="knapsack-plate__watermark">
        <BackpackGeometry mode="wireframe" />
      </g>
    </svg>
  )
}
