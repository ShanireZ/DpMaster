import { Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { getPart } from '../data/parts'
import { CONTENT } from '../content/registry'
import Placeholder from './Placeholder'
import './typepage.css'

export default function TypePage() {
  const { pid, slug } = useParams()
  const part = pid ? getPart(pid) : undefined
  const type = part?.types.find((t) => t.slug === slug)
  if (!part || !type) return <Placeholder title="类型不存在" />

  const Body = CONTENT[`${pid}/${slug}`]

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

      {Body ? (
        <Suspense fallback={<div style={{ minHeight: '50vh' }} aria-busy="true" />}>
          <Body />
        </Suspense>
      ) : (
        <Placeholder title={type.title} />
      )}
    </article>
  )
}
