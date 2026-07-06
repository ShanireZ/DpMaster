import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { getPart } from '../data/parts'
import { CONTENT } from '../content/registry'
import './typepage.css'

const NotFound = lazy(() => import('./NotFound'))

export default function TypePage() {
  const { pid, slug } = useParams()
  const part = pid ? getPart(pid) : undefined
  const type = part?.types.find((t) => t.slug === slug)
  const Body = type ? CONTENT[`${pid}/${slug}`] : undefined

  // 无效部分 / 无效类型 / 尚未上线（无内容）的类型 —— 一律视为不存在，跳 404
  if (!part || !type || !Body) {
    return (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    )
  }

  return (
    <article className="typepage">
      <header className="typehead">
        <span className="typehead__eyebrow">
          <span className="typehead__code">{part.code}</span>
          {part.title}
        </span>
        <h1>{type.title}</h1>
        <p className="typehead__blurb">{type.blurb}</p>
      </header>

      <Suspense fallback={<div style={{ minHeight: '50vh' }} aria-busy="true" />}>
        <Body />
      </Suspense>
    </article>
  )
}
