import type { HighlighterCore } from 'shiki/core'

// 懶載入單例：shiki 核心 + cpp 語法 + 兩個主題 + JS 正則引擎，全部按需動態載入，
// 不進入首屏 bundle（首頁無程式碼塊）。
let hlP: Promise<HighlighterCore> | null = null

export function getHighlighter(): Promise<HighlighterCore> {
  if (!hlP) {
    hlP = (async () => {
      const [core, engine, cpp, dark, light] = await Promise.all([
        import('shiki/core'),
        import('shiki/engine/javascript'),
        import('shiki/langs/cpp.mjs'),
        import('shiki/themes/github-dark.mjs'),
        import('shiki/themes/github-light.mjs'),
      ])
      return core.createHighlighterCore({
        langs: [cpp.default],
        themes: [dark.default, light.default],
        engine: engine.createJavaScriptRegexEngine(),
      })
    })()
  }
  return hlP
}
