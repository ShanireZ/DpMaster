import { useId } from 'react'
import './polygon-backpack.css'

type BackpackMode = 'solid' | 'wireframe'

interface BackpackGeometryProps {
  mode?: BackpackMode
  textureId?: string
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

function BackpackGeometry({ mode = 'solid', textureId }: BackpackGeometryProps) {
  const wire = mode === 'wireframe'
  return (
    <g className={`poly-backpack__geometry poly-backpack__geometry--${mode}`}>
      <g
        className="poly-backpack__material"
        style={!wire && textureId ? { filter: `url(#${textureId})` } : undefined}
      >
        <g className="poly-backpack__handle">
          <polygon points="318,126 337,82 423,82 446,126 424,145 335,145" className="poly-backpack__face poly-backpack__face--1" />
          <polygon points="318,126 337,82 337,111 332,167 302,177 302,139" className="poly-backpack__face poly-backpack__face--5" />
          <polygon points="423,82 446,126 449,169 420,157 420,111" className="poly-backpack__face poly-backpack__face--3" />
          <polygon points="337,82 423,82 420,111 337,111" className="poly-backpack__face poly-backpack__face--2" />
          <polygon points="337,111 420,111 420,157 399,146 354,146 332,167" className="poly-backpack__face poly-backpack__face--6" />
          <polygon points="302,139 332,167 354,146 337,111 318,126" className="poly-backpack__face poly-backpack__face--4" />
          <polygon points="420,111 446,126 449,169 420,157" className="poly-backpack__face poly-backpack__face--5" />
        </g>

        <g className="poly-backpack__shell">
          <polygon points="230,176 302,177 251,237 185,260" className="poly-backpack__face poly-backpack__face--4" />
          <polygon points="449,169 481,174 532,234 492,233" className="poly-backpack__face poly-backpack__face--3" />
          <polygon points="185,260 251,237 270,340 223,431 193,376" className="poly-backpack__face poly-backpack__face--5" />
          <polygon points="193,376 223,431 273,438 356,595 205,565" className="poly-backpack__face poly-backpack__face--6" />
          <polygon points="251,237 270,340 370,318" className="poly-backpack__face poly-backpack__face--3" />
          <polygon points="430,250 492,233 509,365 392,359 370,318" className="poly-backpack__face poly-backpack__face--5" />
          <polygon points="492,233 532,234 548,374 509,365" className="poly-backpack__face poly-backpack__face--6" />
          <polygon points="509,365 548,374 555,542 438,513 415,466" className="poly-backpack__face poly-backpack__face--5" />
          <polygon points="415,466 438,513 555,542 356,595" className="poly-backpack__face poly-backpack__face--4" />
          <polygon points="273,438 415,466 356,595" className="poly-backpack__face poly-backpack__face--3" />
          <polygon points="205,565 356,595 273,438" className="poly-backpack__face poly-backpack__face--5" />
        </g>

        <g className="poly-backpack__front">
          <polygon points="230,176 481,174 492,233 430,250 251,237" className="poly-backpack__face poly-backpack__face--1" />
          <polygon points="230,176 251,237 185,260" className="poly-backpack__face poly-backpack__face--2" />
          <polygon points="481,174 532,234 492,233" className="poly-backpack__face poly-backpack__face--4" />
          <polygon points="251,237 430,250 370,318" className="poly-backpack__face poly-backpack__face--1" />
          <polygon points="251,237 370,318 270,340" className="poly-backpack__face poly-backpack__face--2" />
          <polygon points="370,318 430,250 392,359" className="poly-backpack__face poly-backpack__face--3" />
          <polygon points="270,340 370,318 415,466 273,438" className="poly-backpack__face poly-backpack__face--1" />
          <polygon points="370,318 392,359 415,466" className="poly-backpack__face poly-backpack__face--2" />
        </g>

        <g className="poly-backpack__buckle">
          <polygon points="221,406 272,418 263,454 214,442" className="poly-backpack__face poly-backpack__face--1" />
          <polygon points="214,442 263,454 255,513 206,499" className="poly-backpack__face poly-backpack__face--3" />
          <polygon points="226,454 251,461 247,489 221,482" className="poly-backpack__face poly-backpack__face--6" />
          <polygon points="206,499 255,513 242,534 200,518" className="poly-backpack__face poly-backpack__face--4" />
        </g>

        <g className="poly-backpack__strap">
          <polygon points="476,181 526,184 558,207 532,236 492,220" className="poly-backpack__face poly-backpack__face--2" />
          <polygon points="532,236 558,207 590,248 562,278" className="poly-backpack__face poly-backpack__face--1" />
          <polygon points="562,278 590,248 619,330 587,356" className="poly-backpack__face poly-backpack__face--3" />
          <polygon points="587,356 619,330 638,423 603,451" className="poly-backpack__face poly-backpack__face--4" />
          <polygon points="603,451 638,423 638,504 600,529" className="poly-backpack__face poly-backpack__face--5" />
          <polygon points="600,529 638,504 613,556 574,573" className="poly-backpack__face poly-backpack__face--3" />
          <polygon points="574,573 613,556 570,590 534,578" className="poly-backpack__face poly-backpack__face--2" />
          <polygon points="534,578 574,573 555,542 519,542" className="poly-backpack__face poly-backpack__face--6" />
        </g>
      </g>

      <path className="poly-backpack__outline" d="M230 176 302 139 318 126 337 82h86l23 44 3 43 32 5 51 60 16 140 7 168-199 53-151-30-20-189-8-116Z" />
      <path className="poly-backpack__strap-outline" d="M476 181 526 184 558 207 590 248 619 330 638 423v81l-25 52-39 17-19-31-36 36" />
      <path className="poly-backpack__handle-cutout" d="M337 111h83v46l-21-11h-45l-22 21Z" />
      <g className="poly-backpack__seams">
        <path d="M251 237 430 250 392 359 415 466 273 438 270 340Z" />
        <path d="M185 260 270 340 193 376M492 233 509 365 548 374M205 565 273 438M356 595 415 466M438 513 555 542" />
      </g>
    </g>
  )
}

export default function PolygonBackpack({
  mode = 'solid',
  className = '',
  decorative = true,
}: PolygonBackpackProps) {
  const instanceId = useId().replace(/:/g, '')
  const titleId = `poly-backpack-title-${instanceId}`
  const textureId = `poly-backpack-texture-${instanceId}`
  return (
    <svg
      className={`poly-backpack poly-backpack--${mode} ${className}`.trim()}
      viewBox="0 0 720 680"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-labelledby={decorative ? undefined : titleId}
    >
      {!decorative && <title id={titleId}>多面体背包结构图</title>}
      <defs>
        <filter id={textureId} x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency=".42" numOctaves="2" seed="17" stitchTiles="stitch" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" result="grain-base" />
          <feComponentTransfer in="grain-base" result="grain">
            <feFuncA type="table" tableValues="0 .2" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="grain" mode="soft-light" />
        </filter>
      </defs>
      <g className="poly-backpack__construction">
        <circle cx="378" cy="344" r="286" />
        <circle cx="378" cy="344" r="218" />
        <path d="M42 680 692 22M0 602 720 250M378 0V680M0 344H720" />
      </g>
      <BackpackGeometry mode={mode} textureId={textureId} />
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
      <LessonFocus slug={slug} />
    </svg>
  )
}
