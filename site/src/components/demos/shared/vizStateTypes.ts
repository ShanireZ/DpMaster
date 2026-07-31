export type VizStateRole =
  | 'source'
  | 'current'
  | 'chosen'
  | 'settled'
  | 'invalid'

export const VIZ_STATE_ROLES: ReadonlyArray<{
  role: VizStateRole
  label: string
  symbol: string
  description: string
}> = [
  { role: 'source', label: '来源', symbol: '◇', description: '参与当前转移的依赖状态' },
  { role: 'current', label: '当前', symbol: '◆', description: '正在计算或观察的状态' },
  { role: 'chosen', label: '确定 / 最优', symbol: '✓', description: '已进入当前最优解或确定结果' },
  { role: 'settled', label: '已处理', symbol: '·', description: '已经扫描、当前不再活跃的状态' },
  { role: 'invalid', label: '非法', symbol: '×', description: '越界、冲突或不可达状态' },
]
