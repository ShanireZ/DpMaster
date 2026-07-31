import type { CSSProperties } from 'react'
import type { PartId } from '../../data/catalog.ts'
import './poly-lesson-plate.css'

type FamilyId = PartId

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
  c: {
    stone: {
      column: 0,
      row: 0,
      description: '区间在分割点拆成左右两段，两侧合并代价共同汇入完整区间',
      frame: [34, 62, 444, 386],
    },
    ring: {
      column: 1,
      row: 0,
      description: '环形结构从一个断点切开并展开为复制首段的线性区间',
      frame: [535, 82, 450, 360],
    },
    palindrome: {
      column: 2,
      row: 0,
      description: '区间两端同步向内收缩，匹配端点形成嵌套关系',
      frame: [1030, 88, 462, 352],
    },
    tree: {
      column: 0,
      row: 1,
      description: '在区间中枚举根节点，左右子区间分别生长为两棵子树',
      frame: [52, 527, 404, 420],
    },
    merge: {
      column: 1,
      row: 1,
      description: '内部区间消除后，相同的两端重新连接并形成新的合并状态',
      frame: [526, 545, 466, 400],
    },
  },
  d: {
    grid: {
      column: 0,
      row: 0,
      description: '多个合法来源格汇入当前格，同时标出最大正方形与双路径冲突区域',
      frame: [28, 275, 714, 470],
    },
    matpow: {
      column: 1,
      row: 0,
      description: '状态向量依次穿过成倍折叠的矩阵平面并快速抵达目标状态',
      frame: [792, 260, 712, 500],
    },
  },
  e: {
    basic: {
      column: 0,
      row: 0,
      description: '第一次扫描从子树向根汇总，第二次扫描把父侧信息回传给子节点',
      frame: [92, 28, 570, 410],
    },
    distsum: {
      column: 1,
      row: 0,
      description: '根跨过一条边后，两侧节点数量决定距离和的增加与减少',
      frame: [790, 48, 690, 400],
    },
    inout: {
      column: 0,
      row: 1,
      description: '节点的子树内状态与父侧外部状态在当前根处合成为完整答案',
      frame: [50, 532, 700, 440],
    },
    center: {
      column: 1,
      row: 1,
      description: '来自不同方向的最长链与次长链共同指向树的中心和偏心距',
      frame: [800, 548, 672, 405],
    },
  },
  f: {
    select: {
      column: 0,
      row: 0,
      description: '节点的选与不选状态沿父子边形成互斥约束',
      frame: [52, 34, 420, 410],
    },
    knapsack: {
      column: 1,
      row: 0,
      description: '多个子树容量容器逐个合并到父节点的背包状态',
      frame: [542, 34, 452, 414],
    },
    diameter: {
      column: 2,
      row: 0,
      description: '节点处最长与次长的向下链拼接成一条经过当前点的直径',
      frame: [1044, 34, 430, 414],
    },
    cover: {
      column: 0,
      row: 1,
      description: '父子节点的三类覆盖状态按照合法组合向上汇总',
      frame: [52, 534, 430, 430],
    },
    count: {
      column: 1,
      row: 1,
      description: '不同距离壳层中的子树计数逐层合并到父节点',
      frame: [548, 526, 446, 438],
    },
  },
  g: {
    board: {
      column: 0,
      row: 0,
      description: '合法行掩码在相邻棋盘行之间转移，并排除互相冲突的状态',
      frame: [42, 65, 438, 382],
    },
    tsp: {
      column: 1,
      row: 0,
      description: '子集状态形成稀疏星座，并以当前终点区分同一集合中的不同状态',
      frame: [538, 52, 452, 404],
    },
    cover: {
      column: 2,
      row: 0,
      description: '多个几何对象覆盖目标点后合成为一个统一的覆盖掩码',
      frame: [1040, 64, 430, 388],
    },
    subset: {
      column: 0,
      row: 1,
      description: '一个状态的所有子掩码沿合法边被依次枚举并汇流',
      frame: [52, 545, 420, 400],
    },
    plug: {
      column: 1,
      row: 1,
      description: '扫描轮廓线逐格移动，成对插头编码已处理区域的连通关系',
      frame: [544, 532, 444, 420],
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
const ATLAS_LAYOUT: Record<FamilyId, {
  columns: number
  rowBounds: readonly number[]
}> = {
  a: { columns: 3, rowBounds: [0, 341, 638, ATLAS_HEIGHT] },
  b: { columns: 4, rowBounds: [0, 512, ATLAS_HEIGHT] },
  c: { columns: 3, rowBounds: [0, 512, ATLAS_HEIGHT] },
  d: { columns: 2, rowBounds: [0, ATLAS_HEIGHT] },
  e: { columns: 2, rowBounds: [0, 512, ATLAS_HEIGHT] },
  f: { columns: 3, rowBounds: [0, 512, ATLAS_HEIGHT] },
  g: { columns: 3, rowBounds: [0, 512, ATLAS_HEIGHT] },
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
  const { columns, rowBounds } = ATLAS_LAYOUT[family]
  const columnWidth = ATLAS_WIDTH / columns
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

  const familyClass = {
    a: 'knapsack-plate',
    b: 'linear-plate',
    c: 'interval-plate',
    d: 'matrix-plate',
    e: 'reroot-plate',
    f: 'tree-plate',
    g: 'bitmask-plate',
  }[family]
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
