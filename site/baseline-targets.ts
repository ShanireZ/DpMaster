// Vite 不消费 Browserslist；生产语法目标必须从这里显式接到 vite.config.ts。
// 该集合是 Vite 8 的 Baseline Widely Available 冻结目标，升级只随独立复核提交进行。
export const VITE_BASELINE_TARGETS = [
  'chrome111',
  'edge111',
  'firefox114',
  'safari16.4',
  'ios16.4',
]
