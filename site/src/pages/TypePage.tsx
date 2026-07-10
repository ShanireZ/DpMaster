import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLesson, getLessonNeighbors } from '../data/catalog'
import './typepage.css'

const NotFound = lazy(() => import('./NotFound'))

export default function TypePage() {
  const { pid, slug } = useParams()
  const lesson = pid && slug ? getLesson(pid, slug) : undefined
  const part = lesson?.part
  const type = lesson?.type
  const Body = type?.content
  const neighbors = pid && slug
    ? getLessonNeighbors(pid, slug)
    : { previous: undefined, next: undefined }

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
      <nav className="type-nav" aria-label="课程导航">
        {neighbors.previous ? (
          <Link to={neighbors.previous.path}>
            <span className="dir">← 上一类型</span>
            <span className="nm">{neighbors.previous.type.title}</span>
          </Link>
        ) : (
          <Link to={`/part/${part.id}`}>
            <span className="dir">← 返回本部分</span>
            <span className="nm">{part.title}</span>
          </Link>
        )}
        {neighbors.next ? (
          <Link to={neighbors.next.path}>
            <span className="dir">{neighbors.next.part.id === part.id ? '下一类型 →' : '下一部分 →'}</span>
            <span className="nm">{neighbors.next.type.title}</span>
          </Link>
        ) : (
          <Link to="/problems">
            <span className="dir">完成课程 →</span>
            <span className="nm">题目索引</span>
          </Link>
        )}
      </nav>
    </article>
  )
}
