import katex from 'katex'

// 直接用 katex 渲染，绕开 react-katex（其 3.1 与 katex 0.17 不兼容，会把 \max\big 当字面文本）。
// 注意：公式内不要放中文——KaTeX 数学字体无 CJK 字形；中文标注请放在 HTML 文本里。
function render(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, { displayMode, throwOnError: false, strict: false, output: 'htmlAndMathml' })
}

export const M = ({ children }: { children: string }) => (
  <span dangerouslySetInnerHTML={{ __html: render(children, false) }} />
)

export const MB = ({ children }: { children: string }) => (
  <div className="mathblock" dangerouslySetInnerHTML={{ __html: render(children, true) }} />
)
