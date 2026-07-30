import type { CSSProperties } from 'react'
import './poly-lesson-plate.css'

type FamilyId = 'a' | 'b'

type PlateSpec = {
  column: number
  row: number
  description: string
  frame?: readonly [x: number, y: number, width: number, height: number]
}

const lessonPlates: Record<FamilyId, Record<string, PlateSpec>> = {
  a: {
    '01': {
      column: 0,
      row: 0,
      description: '物品在取与不取之间分叉，较优状态进入容量轨道',
      frame: [38, 40, 456, 282],
    },
    complete: {
      column: 1,
      row: 0,
      description: '同一物品沿正向容量轨道重复参与转移',
      frame: [565, 76, 455, 246],
    },
    multiple: {
      column: 2,
      row: 0,
      description: '有限件物品按一、二、四件拆成二进制组合',
      frame: [1090, 66, 398, 258],
    },
    group: {
      column: 0,
      row: 1,
      description: '每个物品组只允许一条选择路径进入背包',
      frame: [65, 350, 410, 270],
    },
    mixed: {
      column: 1,
      row: 1,
      description: '单次、无限次和有限次三类物品汇入同一容量轨道',
      frame: [548, 354, 470, 270],
    },
    cost2d: {
      column: 2,
      row: 1,
      description: '状态在费用与体积两条坐标轴约束下由来源格转移到目标格',
      frame: [1048, 340, 410, 284],
    },
    dep: {
      column: 0,
      row: 2,
      description: '附件先依附主件形成选择树，再作为合法组合进入背包',
      frame: [100, 640, 340, 344],
    },
    variant: {
      column: 1,
      row: 2,
      description: '容量、分组与依赖结构汇聚成综合背包状态',
      frame: [520, 664, 440, 320],
    },
    fractional: {
      column: 2,
      row: 2,
      description: '物品按价值密度排列，最后一件允许只取一部分',
      frame: [1034, 650, 446, 326],
    },
  },
  b: {
    path: {
      column: 0,
      row: 0,
      description: '格点路径的两个前驱状态汇聚到当前状态',
      frame: [15, 168, 369, 272],
    },
    maxseg: {
      column: 1,
      row: 0,
      description: '序列轨道在延续当前子段与重新开始之间选择',
      frame: [384, 231, 384, 227],
    },
    lis: {
      column: 2,
      row: 0,
      description: '上升链跨越序列节点，并由分层的 tails 状态压缩记录',
      frame: [768, 175, 362, 268],
    },
    lcs: {
      column: 3,
      row: 0,
      description: '两条序列轨道用保持相对次序的匹配桥连接',
      frame: [1152, 192, 384, 249],
    },
    edit: {
      column: 0,
      row: 1,
      description: '删除、插入与替换三种转移沿矩阵边缘汇入当前前缀状态',
      frame: [31, 535, 338, 307],
    },
    fsm: {
      column: 1,
      row: 1,
      description: '选择与跳过两条状态轨道通过受限转移互相切换',
      frame: [384, 583, 384, 242],
    },
    count: {
      column: 2,
      row: 1,
      description: '多个合法前驱的方案流汇总为当前计数状态',
      frame: [768, 560, 384, 296],
    },
  },
}

type PolyLessonPlateProps = {
  family: FamilyId
  slug: string
  title: string
  atlas: string
  className?: string
}

type AtlasStyle = CSSProperties & {
  '--atlas-width'?: string
  '--atlas-left'?: string
  '--atlas-top'?: string
  '--atlas-clip-top'?: string
  '--atlas-clip-right'?: string
  '--atlas-clip-bottom'?: string
  '--atlas-clip-left'?: string
}

const ATLAS_WIDTH = 1536
const PLATE_ASPECT_RATIO = 3 / 2
const PLATE_INLINE_INSET = 0.06
const PLATE_BLOCK_INSET = 0.06

function getContainedAtlasStyle(
  [x, y, width, height]: NonNullable<PlateSpec['frame']>,
): AtlasStyle {
  const viewportHeight = 1 / PLATE_ASPECT_RATIO
  const availableWidth = 1 - PLATE_INLINE_INSET * 2
  const availableHeight = viewportHeight * (1 - PLATE_BLOCK_INSET * 2)
  const scale = Math.min(availableWidth / width, availableHeight / height)

  return {
    '--atlas-width': `${ATLAS_WIDTH * scale * 100}%`,
    '--atlas-left': `${(0.5 - (x + width / 2) * scale) * 100}%`,
    '--atlas-top': `${(
      (viewportHeight / 2 - (y + height / 2) * scale)
      / viewportHeight
    ) * 100}%`,
  }
}

export function PolyLessonPlate({
  family,
  slug,
  title,
  atlas,
  className = '',
}: PolyLessonPlateProps) {
  const spec = lessonPlates[family][slug]

  if (!spec) {
    return null
  }

  const familyClass = family === 'a' ? 'knapsack-plate' : 'linear-plate'
  const columns = family === 'a' ? 3 : 4
  const rows = family === 'a' ? 3 : 2
  const style: AtlasStyle = {
    ...getContainedAtlasStyle(spec.frame!),
    '--atlas-clip-top': `${spec.row * (100 / rows)}%`,
    '--atlas-clip-right': `${(columns - spec.column - 1) * (100 / columns)}%`,
    '--atlas-clip-bottom': `${(rows - spec.row - 1) * (100 / rows)}%`,
    '--atlas-clip-left': `${spec.column * (100 / columns)}%`,
  }

  return (
    <span
      className={[
        'poly-lesson-plate',
        `poly-lesson-plate--${family}`,
        familyClass,
        `${familyClass}--${slug}`,
        className,
      ].filter(Boolean).join(' ')}
      role="img"
      aria-label={`${title}：${spec.description}`}
      data-family-art={family}
      data-family-mode="lesson"
      data-lesson-plate={slug}
      data-atlas-column={spec.column}
      data-atlas-row={spec.row}
      data-atlas-frame={spec.frame?.join(' ')}
      style={style}
    >
      <span className="poly-lesson-plate__viewport" aria-hidden="true">
        <img
          className="poly-lesson-plate__atlas"
          src={atlas}
          alt=""
          draggable={false}
        />
      </span>
    </span>
  )
}
