import { useId, type CSSProperties } from 'react'
import './polygon-backpack.css'

type BackpackMode = 'solid' | 'wireframe'

interface BackpackGeometryProps {
  mode?: BackpackMode
  textureId?: string
}

interface PolygonBackpackProps extends BackpackGeometryProps {
  className?: string
  dataFamilyArt?: string
  dataFamilyMode?: string
  decorative?: boolean
}

interface KnapsackLessonPlateProps {
  slug: string
  title?: string
  className?: string
}

interface BackpackFace {
  points: string
  tone: number
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

const handleFaces: BackpackFace[] = [
  { points: '278,180 291,120 318,88 332,110 316,178', tone: 3 },
  { points: '291,120 318,88 332,110 314,137', tone: 2 },
  { points: '318,88 395,76 425,96 332,110', tone: 1 },
  { points: '332,110 425,96 407,124 350,132', tone: 4 },
  { points: '395,76 425,96 448,157 420,170', tone: 3 },
  { points: '425,96 448,157 420,170 407,124', tone: 5 },
  { points: '278,180 314,137 350,132 316,178', tone: 4 },
  { points: '350,132 407,124 420,170 382,151', tone: 6 },
  { points: '316,178 350,132 382,151 352,185', tone: 2 },
  { points: '382,151 420,170 407,193 352,185', tone: 3 },
]

const shoulderFaces: BackpackFace[] = [
  { points: '474,174 526,180 570,216 532,244 496,224', tone: 2 },
  { points: '526,180 570,216 596,270 558,292 532,244', tone: 1 },
  { points: '532,244 558,292 542,340 514,298', tone: 7 },
  { points: '558,292 596,270 620,344 584,373', tone: 4 },
  { points: '542,340 584,373 566,424 530,392', tone: 8 },
  { points: '584,373 620,344 634,432 599,458', tone: 3 },
  { points: '566,424 599,458 584,510 548,480', tone: 8 },
  { points: '599,458 634,432 631,515 594,544', tone: 4 },
  { points: '584,510 594,544 567,578 550,546', tone: 7 },
  { points: '594,544 631,515 613,574 581,606 567,578', tone: 3 },
  { points: '567,578 581,606 553,626 526,607', tone: 5 },
  { points: '526,607 553,626 526,636 494,620', tone: 7 },
  { points: '494,620 526,607 508,566 482,580', tone: 4 },
  { points: '482,580 508,566 492,516 468,536', tone: 6 },
]

const sideFaces: BackpackFace[] = [
  { points: '455,184 500,191 535,231 486,247', tone: 1 },
  { points: '500,191 535,231 550,309 511,286', tone: 2 },
  { points: '486,247 511,286 491,351 459,317', tone: 4 },
  { points: '511,286 550,309 549,390 512,370', tone: 3 },
  { points: '459,317 491,351 470,425 442,382', tone: 5 },
  { points: '491,351 512,370 507,455 470,425', tone: 2 },
  { points: '512,370 549,390 545,474 507,455', tone: 4 },
  { points: '470,425 507,455 486,522 454,489', tone: 5 },
  { points: '507,455 545,474 532,547 486,522', tone: 3 },
  { points: '454,489 486,522 455,582 420,544', tone: 6 },
  { points: '486,522 532,547 495,594 455,582', tone: 4 },
  { points: '455,582 495,594 438,620 420,544', tone: 5 },
  { points: '486,247 535,231 511,286', tone: 2 },
  { points: '459,317 486,247 491,351', tone: 3 },
  { points: '442,382 459,317 470,425', tone: 5 },
  { points: '420,544 454,489 455,582', tone: 6 },
]

const bodyFaces: BackpackFace[] = [
  { points: '166,306 230,292 214,372 151,395', tone: 6 },
  { points: '230,292 302,316 265,384 214,372', tone: 5 },
  { points: '302,316 376,300 350,382 265,384', tone: 4 },
  { points: '376,300 448,288 421,364 350,382', tone: 5 },
  { points: '448,288 486,247 459,317 421,364', tone: 4 },
  { points: '151,395 214,372 201,454 145,480', tone: 6 },
  { points: '214,372 265,384 244,452 201,454', tone: 5 },
  { points: '265,384 350,382 317,459 244,452', tone: 4 },
  { points: '350,382 421,364 399,447 317,459', tone: 5 },
  { points: '421,364 459,317 442,382 399,447', tone: 4 },
  { points: '145,480 201,454 210,534 169,559', tone: 5 },
  { points: '201,454 244,452 263,522 210,534', tone: 4 },
  { points: '244,452 317,459 304,536 263,522', tone: 5 },
  { points: '317,459 399,447 383,530 304,536', tone: 4 },
  { points: '399,447 442,382 454,489 383,530', tone: 5 },
  { points: '169,559 210,534 272,590 205,603', tone: 6 },
  { points: '210,534 263,522 304,536 272,590', tone: 5 },
  { points: '304,536 383,530 355,605 272,590', tone: 4 },
  { points: '383,530 454,489 420,544 355,605', tone: 5 },
  { points: '355,605 420,544 438,620 380,632', tone: 4 },
  { points: '205,603 272,590 355,605 300,632', tone: 5 },
  { points: '300,632 355,605 380,632', tone: 4 },
]

const flapFaces: BackpackFace[] = [
  { points: '170,207 251,183 235,252 151,276', tone: 6 },
  { points: '251,183 333,170 310,242 235,252', tone: 5 },
  { points: '333,170 399,164 385,235 310,242', tone: 6 },
  { points: '399,164 455,184 430,250 385,235', tone: 5 },
  { points: '455,184 500,191 486,247 430,250', tone: 4 },
  { points: '151,276 235,252 206,321 143,304', tone: 5 },
  { points: '235,252 310,242 286,314 206,321', tone: 6 },
  { points: '310,242 385,235 361,305 286,314', tone: 5 },
  { points: '385,235 430,250 421,304 361,305', tone: 6 },
  { points: '430,250 486,247 448,288 421,304', tone: 4 },
  { points: '143,304 206,321 191,344 158,330', tone: 5 },
  { points: '206,321 286,314 265,350 191,344', tone: 4 },
  { points: '286,314 361,305 350,344 265,350', tone: 5 },
  { points: '361,305 421,304 402,337 350,344', tone: 4 },
  { points: '421,304 448,288 433,321 402,337', tone: 5 },
  { points: '251,183 333,170 310,242', tone: 6 },
  { points: '399,164 455,184 385,235', tone: 5 },
]

const frontStrapFaces: BackpackFace[] = [
  { points: '204,249 235,244 232,309 198,317', tone: 2 },
  { points: '198,317 232,309 226,383 190,394', tone: 3 },
  { points: '190,394 226,383 218,455 181,468', tone: 2 },
  { points: '181,468 218,455 211,511 175,525', tone: 4 },
  { points: '364,235 396,238 402,304 368,304', tone: 1 },
  { points: '368,304 402,304 413,378 377,381', tone: 3 },
  { points: '377,381 413,378 423,451 386,458', tone: 2 },
  { points: '386,458 423,451 430,510 394,519', tone: 4 },
]

const pocketFaces: BackpackFace[] = [
  { points: '211,447 280,427 350,435 277,463', tone: 6 },
  { points: '280,427 350,435 403,453 329,470', tone: 5 },
  { points: '211,447 277,463 244,500 192,482', tone: 4 },
  { points: '277,463 329,470 304,510 244,500', tone: 3 },
  { points: '329,470 403,453 398,505 304,510', tone: 2 },
  { points: '192,482 244,500 236,558 183,536', tone: 3 },
  { points: '244,500 304,510 284,566 236,558', tone: 2 },
  { points: '304,510 398,505 382,559 284,566', tone: 1 },
  { points: '183,536 236,558 284,566 225,579', tone: 4 },
  { points: '284,566 382,559 349,581 225,579', tone: 3 },
  { points: '350,435 403,453 398,505 329,470', tone: 2 },
]

function FaceMesh({ faces, className = '' }: { faces: BackpackFace[]; className?: string }) {
  return (
    <g className={className}>
      {faces.map((face, index) => (
        <polygon
          key={`${face.points}-${index}`}
          points={face.points}
          className={`poly-backpack__face poly-backpack__face--${face.tone}`}
        />
      ))}
    </g>
  )
}

function BackpackGeometry({ mode = 'solid', textureId }: BackpackGeometryProps) {
  const wire = mode === 'wireframe'
  return (
    <g className={`poly-backpack__geometry poly-backpack__geometry--${mode}`}>
      <ellipse className="poly-backpack__ground" cx="367" cy="623" rx="280" ry="30" />
      <g className="poly-backpack__ground-hatching">
        <path d="M72 612 489 666M104 596 548 654M150 582 605 638M208 568 650 622" />
        <path d="M112 654 560 572M170 664 610 585M232 670 652 601" />
      </g>
      <g
        className="poly-backpack__material"
        style={!wire && textureId ? { filter: `url(#${textureId})` } : undefined}
      >
        <FaceMesh faces={shoulderFaces} className="poly-backpack__shoulder is-dark" />
        <FaceMesh faces={handleFaces} className="poly-backpack__handle is-gold" />
        <FaceMesh faces={bodyFaces} className="poly-backpack__shell" />
        <FaceMesh faces={sideFaces} className="poly-backpack__side is-gold" />
        <FaceMesh faces={flapFaces} className="poly-backpack__flap is-light" />
        <FaceMesh faces={frontStrapFaces} className="poly-backpack__front-straps is-gold" />
        <FaceMesh faces={pocketFaces} className="poly-backpack__pocket is-gold" />

        <g className="poly-backpack__buckles is-metal">
          <polygon points="184,320 239,309 242,354 187,366" className="poly-backpack__face poly-backpack__face--1" />
          <polygon points="192,329 231,321 233,344 194,353" className="poly-backpack__face poly-backpack__face--7" />
          <polygon points="361,302 414,300 419,344 365,348" className="poly-backpack__face poly-backpack__face--1" />
          <polygon points="370,311 405,310 409,335 373,338" className="poly-backpack__face poly-backpack__face--7" />
          <polygon points="184,320 192,329 194,353 187,366" className="poly-backpack__face poly-backpack__face--3" />
          <polygon points="239,309 231,321 233,344 242,354" className="poly-backpack__face poly-backpack__face--2" />
          <polygon points="361,302 370,311 373,338 365,348" className="poly-backpack__face poly-backpack__face--3" />
          <polygon points="414,300 405,310 409,335 419,344" className="poly-backpack__face poly-backpack__face--2" />
        </g>
      </g>

      <path className="poly-backpack__outline" d="M170 207 278 180 291 120 318 88 395 76 425 96 448 157 500 191 535 231 550 309 549 390 545 474 532 547 495 594 438 620 380 632 300 632 205 603 169 559 145 480 151 395 143 304Z" />
      <path className="poly-backpack__strap-outline" d="M474 174 526 180 570 216 596 270 620 344 634 432 631 515 613 574 581 606 553 626 526 636 494 620 468 536" />
      <path className="poly-backpack__handle-cutout" d="M316 178 332 110 425 96 407 124 350 132 352 185Z" />
      <path className="poly-backpack__flap-outline" d="M170 207 251 183 333 170 399 164 455 184 500 191 486 247 448 288 433 321 402 337 350 344 265 350 191 344 158 330 143 304 151 276Z" />
      <path className="poly-backpack__pocket-outline" d="M211 447 280 427 350 435 403 453 398 505 382 559 349 581 225 579 183 536 192 482Z" />
      <g className="poly-backpack__buckle-frames">
        <path d="M184 320 239 309 242 354 187 366ZM192 329 231 321 233 344 194 353Z" />
        <path d="M361 302 414 300 419 344 365 348ZM370 311 405 310 409 335 373 338Z" />
      </g>
      <g className="poly-backpack__seams">
        <path d="M151 395 214 372 265 384 350 382 421 364M145 480 201 454 244 452 317 459 399 447M169 559 210 534 263 522 304 536 383 530" />
        <path d="M486 247 459 317 442 382 454 489 420 544M535 231 511 286 512 370 507 455 486 522 455 582" />
      </g>
    </g>
  )
}

export default function PolygonBackpack({
  mode = 'solid',
  className = '',
  dataFamilyArt,
  dataFamilyMode,
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
      data-family-art={dataFamilyArt}
      data-family-mode={dataFamilyMode}
    >
      {!decorative && <title id={titleId}>多面体背包结构图</title>}
      <defs>
        <filter id={textureId} x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency=".42" numOctaves="2" seed="17" stitchTiles="stitch" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" result="grain-base" />
          <feComponentTransfer in="grain-base" result="grain">
            <feFuncA type="table" tableValues="0 .2" />
          </feComponentTransfer>
          <feComposite in="grain" in2="SourceAlpha" operator="in" result="clipped-grain" />
          <feBlend in="SourceGraphic" in2="clipped-grain" mode="soft-light" />
        </filter>
      </defs>
      <g className="poly-backpack__construction">
        <circle cx="376" cy="350" r="292" />
        <circle cx="376" cy="350" r="224" />
        <path d="M30 672 700 24M0 608 720 252M376 0V680M0 350H720" />
        <path d="M70 126 665 572M42 534 642 86M52 640 690 640M92 596 620 596" />
        <circle cx="94" cy="596" r="5" />
        <circle cx="642" cy="86" r="5" />
        <circle cx="665" cy="572" r="5" />
      </g>
      <g className="poly-backpack__silhouette">
        <BackpackGeometry mode={mode} textureId={textureId} />
      </g>
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
        markerEnd="var(--knapsack-arrow-id)"
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
  return (
    <g>
      <text x="64" y="38" className="knapsack-plate__label">一件物品 · 一次决策</text>
      <ItemParcel x={76} y={116} label="第 i 件" />

      <circle cx="184" cy="144" r="7" className="is-active" />
      <path className="knapsack-plate__line" d="M140 144H177M191 144Q214 144 228 98H244M191 144Q214 144 228 216H244" />

      <g className="knapsack-plate__choice">
        <rect x="244" y="62" width="168" height="72" className="knapsack-plate__result" />
        <text x="264" y="88" className="knapsack-plate__label">0 · 不取</text>
        <text x="264" y="115" className="knapsack-plate__formula">f[j]</text>
      </g>

      <g className="knapsack-plate__choice">
        <rect x="244" y="180" width="168" height="72" className="knapsack-plate__result is-active" />
        <text x="264" y="206" className="knapsack-plate__label">1 · 装入</text>
        <text x="264" y="233" className="knapsack-plate__formula">f[j−w] + v</text>
      </g>

      <path className="knapsack-plate__line" d="M412 98H448Q464 98 464 116V139M412 216H448Q464 216 464 198V169" />
      <rect x="464" y="128" width="116" height="52" className="knapsack-plate__result" />
      <text x="522" y="150" textAnchor="middle" className="knapsack-plate__label">保留较优</text>
      <text x="522" y="169" textAnchor="middle" className="knapsack-plate__formula">f[j]</text>

      <CapacityRail y={286} direction="reverse" />
      <text x="500" y="316" textAnchor="middle" className="knapsack-plate__label">容量倒序</text>
      <text x="500" y="339" textAnchor="middle" className="knapsack-plate__formula">m → w</text>
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
      <path className="knapsack-plate__accent-line" d="M126 165H176" markerEnd="var(--knapsack-arrow-id)" />
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
          <path className="knapsack-plate__accent-line" d={`M118 ${item.y + 28}H202`} markerEnd="var(--knapsack-arrow-id)" />
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
      <text x="52" y="38" className="knapsack-plate__label">一件物品 · 同时扣除两种费用</text>
      <ItemParcel x={72} y={102} label="第 i 件" />

      <rect x="48" y="218" width="92" height="42" className="knapsack-plate__result" />
      <text x="94" y="244" textAnchor="middle" className="knapsack-plate__formula">费用 aᵢ</text>
      <rect x="148" y="218" width="92" height="42" className="knapsack-plate__result" />
      <text x="194" y="244" textAnchor="middle" className="knapsack-plate__formula">费用 bᵢ</text>
      <rect x="98" y="270" width="92" height="42" className="knapsack-plate__result is-active" />
      <text x="144" y="296" textAnchor="middle" className="knapsack-plate__formula">价值 vᵢ</text>

      <path className="knapsack-plate__accent-line" d="M198 132H270" markerEnd="var(--knapsack-arrow-id)" />

      <g className="knapsack-plate__axis">
        <path d="M294 320V58M294 320H566" />
      </g>
      <text
        x="274"
        y="112"
        textAnchor="middle"
        transform="rotate(-90 274 112)"
        className="knapsack-plate__label"
      >
        费用 B
      </text>
      <text x="566" y="344" textAnchor="end" className="knapsack-plate__label">费用 A</text>

      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => (
          <rect
            key={`${row}-${col}`}
            x={306 + col * 50}
            y={70 + row * 50}
            width="50"
            height="50"
            className={
              row === 1 && col === 3
                ? 'knapsack-plate__cell is-active'
                : row === 3 && col === 1
                  ? 'knapsack-plate__cell knapsack-plate__source'
                  : 'knapsack-plate__cell'
            }
          />
        )),
      )}
      <path className="knapsack-plate__accent-line" d="M381 245 481 145" markerEnd="var(--knapsack-arrow-id)" />
      <text x="328" y="278" className="knapsack-plate__formula">(x−a, y−b)</text>
      <text x="492" y="132" className="knapsack-plate__formula">(x, y)</text>
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
      <path className="knapsack-plate__accent-line" d="M288 176H342" markerEnd="var(--knapsack-arrow-id)" />
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
          <path className="knapsack-plate__accent-line" d={`M130 184Q160 184 178 ${row.y + 24}H212`} markerEnd="var(--knapsack-arrow-id)" />
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
      <path className="knapsack-plate__accent-line" d="M62 75H520" markerEnd="var(--knapsack-arrow-id)" />
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

export function KnapsackLessonPlate({
  slug,
  title: lessonTitle,
  className = '',
}: KnapsackLessonPlateProps) {
  const instanceId = useId().replace(/:/g, '')
  const titleId = `knapsack-plate-title-${instanceId}`
  const descriptionId = `knapsack-plate-description-${instanceId}`
  const arrowId = `knapsack-plate-arrow-${instanceId}`
  const title = lessonTitles[slug] ?? lessonTitle ?? lessonTitles['01']
  return (
    <svg
      className={`knapsack-plate ${className}`.trim()}
      viewBox="0 0 640 390"
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
      data-family-art="a"
      data-family-mode="lesson"
      data-lesson-plate={slug}
      style={{ '--knapsack-arrow-id': `url(#${arrowId})` } as CSSProperties}
    >
      <title id={titleId}>{title}</title>
      <desc id={descriptionId}>{lessonTitle ?? title}的核心状态与转移示意图</desc>
      <defs>
        <marker id={arrowId} markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">
          <path d="M0 0 8 4 0 8Z" />
        </marker>
      </defs>
      <LessonFocus slug={slug} />
    </svg>
  )
}
