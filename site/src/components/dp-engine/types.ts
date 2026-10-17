// DP 視覺化引擎的通用資料模型：求解器產出 frames[]，視圖逐影格繪製。
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

/** 單影格：某一步的完整快照 */
export interface Frame {
  values: (number | null)[][] // 當前網格值，null = 尚未計算/空白
  states: Record<string, CellState> // key = `${r},${c}`
  arrows?: Arrow[]
  active?: CellRef | null // 正在寫入的格
  formula?: string // KaTeX（該步應用的轉移）
  caption?: string // 純文字解說
}

/** 視覺化模型：一個完整演示 */
export interface VizModel {
  rows: number
  cols: number
  cell?: number // 單元尺寸(px)，預設 48
  rowHeaderLabels?: string[] // 長度 rows
  colHeaderLabels?: string[] // 長度 cols
  rowHeaderTitle?: string
  colHeaderTitle?: string
  frames: Frame[]
  answer?: { cell?: CellRef; text: string }
}

export const key = (r: number, c: number) => `${r},${c}`
