import { useEffect, useRef, useState } from 'react'
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
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    let idleHandle: number | undefined
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined
    let observer: IntersectionObserver | undefined

    const highlight = () => {
      const run = () => {
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
      }
      if ('requestIdleCallback' in window) {
        idleHandle = window.requestIdleCallback(run, { timeout: 1200 })
      } else {
        timeoutHandle = globalThis.setTimeout(run, 80)
      }
    }

    const element = rootRef.current
    if (!element || !('IntersectionObserver' in window)) {
      highlight()
    } else {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          observer?.disconnect()
          highlight()
        },
        { rootMargin: '360px 0px' },
      )
      observer.observe(element)
    }

    return () => {
      alive = false
      observer?.disconnect()
      if (idleHandle !== undefined && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleHandle)
      }
      if (timeoutHandle !== undefined) globalThis.clearTimeout(timeoutHandle)
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
    <div className="codeblock" ref={rootRef}>
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
