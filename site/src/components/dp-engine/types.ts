// DP 可视化引擎的通用数据模型：求解器产出 frames[]，视图逐帧渲染。
export type CellState = 'idle' | 'settled' | 'current' | 'source' | 'chosen' | 'invalid'

export interface CellRef {
  r: number
  c: number
}

export interface Arrow {
  from: CellRef
  to: CellRef
  kind?: 'source' | 'chosen'
}

/** 单帧：某一步的完整快照 */
export interface Frame {
  values: (number | null)[][] // 当前网格值，null = 尚未计算/空白
  states: Record<string, CellState> // key = `${r},${c}`
  arrows?: Arrow[]
  active?: CellRef | null // 正在写入的格
  formula?: string // KaTeX（该步应用的转移）
  caption?: string // 纯文字解说
}

/** 可视化模型：一个完整演示 */
export interface VizModel {
  rows: number
  cols: number
  cell?: number // 单元尺寸(px)，默认 48
  rowHeaderLabels?: string[] // 长度 rows
  colHeaderLabels?: string[] // 长度 cols
  rowHeaderTitle?: string
  colHeaderTitle?: string
  frames: Frame[]
  answer?: { cell?: CellRef; text: string }
}

export const key = (r: number, c: number) => `${r},${c}`
