import katex from 'katex'

// 直接用 katex 繪製，繞開 react-katex（其 3.1 與 katex 0.17 不相容，會把 \max\big 當字面文字）。
// 注意：公式內不要放中文——KaTeX 數學字體無 CJK 字形；中文標註請放在 HTML 文字里。
function render(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, { displayMode, throwOnError: false, strict: false, output: 'htmlAndMathml' })
}

export const M = ({ children }: { children: string }) => (
  <span dangerouslySetInnerHTML={{ __html: render(children, false) }} />
)

export const MB = ({ children }: { children: string }) => (
  <div className="mathblock" dangerouslySetInnerHTML={{ __html: render(children, true) }} />
)
