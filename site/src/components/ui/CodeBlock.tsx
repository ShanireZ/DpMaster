import { useEffect, useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { getHighlighter } from '../../lib/highlighter'
import './codeblock.css'

export default function CodeBlock({
  code,
  lang = 'cpp',
  luogu,
  title,
}: {
  code: string
  lang?: string
  luogu?: string
  title?: string
}) {
  const src = code.replace(/^\n+|\n+$/g, '')
  const [html, setHtml] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    getHighlighter()
      .then((hl) =>
        hl.codeToHtml(src, {
          lang,
          themes: { light: 'github-light', dark: 'github-dark' },
          defaultColor: false,
        }),
      )
      .then((h) => alive && setHtml(h))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [src, lang])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(src)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="codeblock">
      <div className="codeblock__bar">
        <span className="codeblock__title">{title ?? 'C++'}</span>
        <div className="codeblock__actions">
          {luogu && (
            <a className="cb-btn" href={`https://www.luogu.com.cn/problem/${luogu}`} target="_blank" rel="noreferrer">
              在洛谷打开 {luogu} <ExternalLink size={13} />
            </a>
          )}
          <button className="cb-btn" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? '已复制' : '复制'}
          </button>
        </div>
      </div>
      {html ? (
        <div className="codeblock__code" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="codeblock__code codeblock__fallback">
          <code>{src}</code>
        </pre>
      )}
    </div>
  )
}
