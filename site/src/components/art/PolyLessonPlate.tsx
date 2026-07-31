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
      frame: [44, 50, 450, 272],
    },
    complete: {
      column: 1,
      row: 0,
      description: '同一物品沿正向容量轨道重复参与转移',
      frame: [565, 89, 440, 229],
    },
    multiple: {
      column: 2,
      row: 0,
      description: '有限件物品按一、二、四件拆成二进制组合',
      frame: [1094, 79, 364, 237],
    },
    group: {
      column: 0,
      row: 1,
      description: '每个物品组只允许一条选择路径进入背包',
      frame: [66, 363, 404, 257],
    },
    mixed: {
      column: 1,
      row: 1,
      description: '单次、无限次和有限次三类物品汇入同一容量轨道',
      frame: [548, 373, 452, 241],
    },
    cost2d: {
      column: 2,
      row: 1,
      description: '状态在费用与体积两条坐标轴约束下由来源格转移到目标格',
      frame: [1054, 353, 372, 247],
    },
    dep: {
      column: 0,
      row: 2,
      description: '附件先依附主件形成选择树，再作为合法组合进入背包',
      frame: [116, 656, 292, 306],
    },
    variant: {
      column: 1,
      row: 2,
      description: '容量、分组与依赖结构汇聚成综合背包状态',
      frame: [531, 664, 418, 279],
    },
    fractional: {
      column: 2,
      row: 2,
      description: '物品按价值密度排列，最后一件允许只取一部分',
      frame: [1038, 682, 397, 266],
    },
  },
  b: {
    path: {
      column: 0,
      row: 0,
      description: '格点路径的两个前驱状态汇聚到当前状态',
      frame: [25, 176, 357, 252],
    },
    maxseg: {
      column: 1,
      row: 0,
      description: '序列轨道在延续当前子段与重新开始之间选择',
      frame: [390, 245, 378, 200],
    },
    lis: {
      column: 2,
      row: 0,
      description: '上升链跨越序列节点，并由分层的 tails 状态压缩记录',
      frame: [768, 187, 352, 248],
    },
    lcs: {
      column: 3,
      row: 0,
      description: '两条序列轨道用保持相对次序的匹配桥连接',
      frame: [1160, 200, 371, 230],
    },
    edit: {
      column: 0,
      row: 1,
      description: '删除、插入与替换三种转移沿矩阵边缘汇入当前前缀状态',
      frame: [39, 545, 320, 282],
    },
    fsm: {
      column: 1,
      row: 1,
      description: '选择与跳过两条状态轨道通过受限转移互相切换',
      frame: [394, 597, 374, 220],
    },
    count: {
      column: 2,
      row: 1,
      description: '多个合法前驱的方案流汇总为当前计数状态',
      frame: [768, 568, 384, 273],
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
const ATLAS_HEIGHT = 1024
const PLATE_ASPECT_RATIO = 3 / 2
const PLATE_INLINE_INSET = 0.06
const PLATE_BLOCK_INSET = 0.06
const ATLAS_ROW_BOUNDS: Record<FamilyId, readonly number[]> = {
  a: [0, 341, 638, ATLAS_HEIGHT],
  b: [0, 512, ATLAS_HEIGHT],
}

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

function getAtlasClip(
  family: FamilyId,
  column: number,
  row: number,
): readonly [x: number, y: number, width: number, height: number] {
  const columns = family === 'a' ? 3 : 4
  const columnWidth = ATLAS_WIDTH / columns
  const rowBounds = ATLAS_ROW_BOUNDS[family]
  const top = rowBounds[row]
  const bottom = rowBounds[row + 1]

  return [column * columnWidth, top, columnWidth, bottom - top]
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
  const [clipX, clipY, clipWidth, clipHeight] = getAtlasClip(
    family,
    spec.column,
    spec.row,
  )
  const style: AtlasStyle = {
    ...getContainedAtlasStyle(spec.frame!),
    '--atlas-clip-top': `${clipY / ATLAS_HEIGHT * 100}%`,
    '--atlas-clip-right': `${(ATLAS_WIDTH - clipX - clipWidth) / ATLAS_WIDTH * 100}%`,
    '--atlas-clip-bottom': `${(ATLAS_HEIGHT - clipY - clipHeight) / ATLAS_HEIGHT * 100}%`,
    '--atlas-clip-left': `${clipX / ATLAS_WIDTH * 100}%`,
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
      data-atlas-clip={[clipX, clipY, clipWidth, clipHeight].join(' ')}
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
