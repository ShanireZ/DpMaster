import type { CSSProperties } from 'react'
import './poly-lesson-plate.css'

type FamilyId = 'a' | 'b'

type PlateSpec = {
  column: number
  row: number
  description: string
}

const lessonPlates: Record<FamilyId, Record<string, PlateSpec>> = {
  a: {
    '01': {
      column: 0,
      row: 0,
      description: '物品在取与不取之间分叉，较优状态进入容量轨道',
    },
    complete: {
      column: 1,
      row: 0,
      description: '同一物品沿正向容量轨道重复参与转移',
    },
    multiple: {
      column: 2,
      row: 0,
      description: '有限件物品按一、二、四件拆成二进制组合',
    },
    group: {
      column: 0,
      row: 1,
      description: '每个物品组只允许一条选择路径进入背包',
    },
    mixed: {
      column: 1,
      row: 1,
      description: '单次、无限次和有限次三类物品汇入同一容量轨道',
    },
    cost2d: {
      column: 2,
      row: 1,
      description: '状态在费用与体积两条坐标轴约束下由来源格转移到目标格',
    },
    dep: {
      column: 0,
      row: 2,
      description: '附件先依附主件形成选择树，再作为合法组合进入背包',
    },
    variant: {
      column: 1,
      row: 2,
      description: '容量、分组与依赖结构汇聚成综合背包状态',
    },
    fractional: {
      column: 2,
      row: 2,
      description: '物品按价值密度排列，最后一件允许只取一部分',
    },
  },
  b: {
    path: {
      column: 0,
      row: 0,
      description: '格点路径的两个前驱状态汇聚到当前状态',
    },
    maxseg: {
      column: 1,
      row: 0,
      description: '序列轨道在延续当前子段与重新开始之间选择',
    },
    lis: {
      column: 2,
      row: 0,
      description: '上升链跨越序列节点，并由分层的 tails 状态压缩记录',
    },
    lcs: {
      column: 3,
      row: 0,
      description: '两条序列轨道用保持相对次序的匹配桥连接',
    },
    edit: {
      column: 0,
      row: 1,
      description: '删除、插入与替换三种转移沿矩阵边缘汇入当前前缀状态',
    },
    fsm: {
      column: 1,
      row: 1,
      description: '选择与跳过两条状态轨道通过受限转移互相切换',
    },
    count: {
      column: 2,
      row: 1,
      description: '多个合法前驱的方案流汇总为当前计数状态',
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
  '--atlas-x': string
  '--atlas-y': string
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
  const style: AtlasStyle = family === 'a'
    ? {
        '--atlas-x': `${spec.column * (-100 / 3)}%`,
        '--atlas-y': `${spec.row * (-100 / 3)}%`,
      }
    : {
        '--atlas-x': `${spec.column * -25}%`,
        '--atlas-y': `${-12.5 + spec.row * -50}%`,
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
