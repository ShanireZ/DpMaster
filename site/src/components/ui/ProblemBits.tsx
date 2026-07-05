import type { ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'

const luoguUrl = (pid: string) => `https://www.luogu.com.cn/problem/${pid}`

export function ExampleCard({
  pid,
  name,
  src,
  diff,
  children,
}: {
  pid: string
  name: string
  src?: string
  diff?: string
  children: ReactNode
}) {
  return (
    <section className="example">
      <header className="example__head">
        <a className="example__pid" href={luoguUrl(pid)} target="_blank" rel="noreferrer">
          {pid}
        </a>
        <span className="example__name">{name}</span>
        {src && <span className="example__src">{src}</span>}
        {diff && <span className="example__diff">{diff}</span>}
      </header>
      <div className="example__body">{children}</div>
    </section>
  )
}

export function Field({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="field">
      <div className="field__k">{k}</div>
      <div>{children}</div>
    </div>
  )
}

export function Exercise({ pid, name, hint }: { pid: string; name: string; hint: string }) {
  return (
    <div className="exercise">
      <span className="exercise__pid">{pid}</span>
      <span>
        <span className="exercise__name">{name}</span>
        <span className="exercise__hint" style={{ display: 'block' }}>
          {hint}
        </span>
      </span>
      <a className="exercise__link" href={luoguUrl(pid)} target="_blank" rel="noreferrer">
        在洛谷打开 <ExternalLink size={13} />
      </a>
    </div>
  )
}
