import type { HighlighterCore } from 'shiki/core'

// 懒加载单例：shiki 核心 + cpp 语法 + 两个主题 + JS 正则引擎，全部按需动态载入，
// 不进入首屏 bundle（首页无代码块）。
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
