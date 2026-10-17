// Vite 不消費 Browserslist；生產語法目標必須從這裡顯式接到 vite.config.ts。
// 該集合是 Vite 8 的 Baseline Widely Available 凍結目標，升級只隨獨立複核提交進行。
export const VITE_BASELINE_TARGETS = [
  'chrome111',
  'edge111',
  'firefox114',
  'safari16.4',
  'ios16.4',
]
