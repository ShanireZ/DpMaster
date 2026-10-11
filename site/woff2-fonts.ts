import type { Plugin } from 'vite'

/**
 * 字体只发布 woff2。KaTeX 与 fontsource 的样式表为每个 @font-face 同时列出
 * woff2 / woff / ttf；Baseline 目标浏览器全部支持 woff2，旧格式永远不会被下载，
 * 却会被 Vite 当作资产发布并计入资源预算。这里在 Vite 处理 CSS 之前把 `src`
 * 只留下 woff2 条目；某个 @font-face 没有 woff2 时直接报错，不悄悄丢字体。
 * scripts/check-assets.mjs 在产物侧再锁一次：dist/assets 不得出现旧格式字体。
 */
const FONT_FACE = /@font-face\s*\{[^}]*\}/g
const SRC_PREFIX = /[{;]\s*src\s*:\s*/g
const WOFF2_FORMAT = /format\(\s*(["']?)woff2\1\s*\)/i

/**
 * 在引号与括号之外，按 `stops` 中的字符切分。url() 里的 data URL 可以含 `,` 与 `;`，
 * 不能用正则直接截。返回各段起止位置，最后一段止于第一个 `end` 字符或文本末尾。
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
