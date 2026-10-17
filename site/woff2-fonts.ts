import type { Plugin } from 'vite'

/**
 * 字體只發布 woff2。KaTeX 與 fontsource 的樣式表為每個 @font-face 同時列出
 * woff2 / woff / ttf；Baseline 目標瀏覽器全部支援 woff2，舊格式永遠不會被下載，
 * 卻會被 Vite 當作資產發佈並計入資源預算。這裡在 Vite 處理 CSS 之前把 `src`
 * 只留下 woff2 條目；某個 @font-face 沒有 woff2 時直接回報錯誤，不悄悄丟字體。
 * scripts/check-assets.mjs 在產物側再鎖一次：dist/assets 不得出現舊格式字體。
 */
const FONT_FACE = /@font-face\s*\{[^}]*\}/g
const SRC_PREFIX = /[{;]\s*src\s*:\s*/g
const WOFF2_FORMAT = /format\(\s*(["']?)woff2\1\s*\)/i

/**
 * 在引號與括號之外，按 `stops` 中的字元切分。url() 裡的 data URL 可以含 `,` 與 `;`，
 * 不能用正則直接截。回傳各段起止位置，最後一段止於第一個 `end` 字元或文字末尾。
 */
function scan(text: string, from: number, separator: string, end: string): number[] {
  const cuts = [from]
  let depth = 0
  let quote = ''
  for (let index = from; index < text.length; index += 1) {
    const char = text[index]
    if (quote) {
      if (char === quote) quote = ''
    } else if (char === '"' || char === "'") {
      quote = char
    } else if (char === '(') {
      depth += 1
    } else if (char === ')') {
      depth -= 1
    } else if (depth === 0 && end.includes(char)) {
      cuts.push(index)
      return cuts
    } else if (depth === 0 && char === separator) {
      cuts.push(index)
    }
  }
  cuts.push(text.length)
  return cuts
}

function rewriteFace(face: string, source: string): string {
  let result = ''
  let cursor = 0
  SRC_PREFIX.lastIndex = 0
  for (let match = SRC_PREFIX.exec(face); match; match = SRC_PREFIX.exec(face)) {
    const valueStart = match.index + match[0].length
    const cuts = scan(face, valueStart, ',', ';}')
    const valueEnd = cuts[cuts.length - 1]
    const entries = cuts.slice(0, -1).map((cut, index) => face.slice(index === 0 ? cut : cut + 1, cuts[index + 1]))
    const woff2 = entries.map((entry) => entry.trim()).filter((entry) => WOFF2_FORMAT.test(entry))
    if (woff2.length === 0) {
      throw new Error(`${source}: @font-face 没有 woff2 来源，拒绝发布旧格式字体：${face}`)
    }
    const trailing = /\s*$/.exec(face.slice(valueStart, valueEnd))?.[0] ?? ''
    result += `${face.slice(cursor, valueStart)}${woff2.join(', ')}${trailing}`
    cursor = valueEnd
    SRC_PREFIX.lastIndex = valueEnd
  }
  return result + face.slice(cursor)
}

export function keepWoff2FontSources(css: string, source = 'CSS'): string {
  return css.replace(FONT_FACE, (face) => rewriteFace(face, source))
}

export function woff2OnlyFonts(): Plugin {
  return {
    name: 'dp:woff2-only-fonts',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?', 1)[0]
      if (!file.endsWith('.css') || !code.includes('@font-face')) return null
      return { code: keepWoff2FontSources(code, file), map: null }
    },
  }
}
