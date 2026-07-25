import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Circle, ListTree } from 'lucide-react'
import { getLesson, getLessonNeighbors } from '../data/catalog'
import { getLessonEditorial } from '../data/editorial.ts'
import { ROUTE_LAST_MODIFIED } from '../data/routeLastModified.ts'
import { trackAnalyticsEvent } from '../analytics/index.ts'
import { useLearningProgress } from '../learning/LearningProgressContext'
import { useStaticLessonContents } from '../app/StaticLessonContent.ts'
import './typepage.css'

const NotFound = lazy(() => import('./NotFound'))
const startedLessons = new Set<string>()

interface OutlineItem {
  id: string
  label: string
}

function headingId(label: string, index: number): string {
  const slug = label
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return `section-${slug || index + 1}`
}

function OutlineLinks({
  items,
  activeId,
}: {
  items: OutlineItem[]
  activeId: string
}) {
  if (items.length === 0) return <p className="lesson-outline__pending">正在整理目录…</p>
  return (
    <ol>
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} aria-current={activeId === item.id ? 'location' : undefined}>
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  )
}

export default function TypePage() {
  const { pid, slug } = useParams()
  const lesson = pid && slug ? getLesson(pid, slug) : undefined
  const part = lesson?.part
  const type = lesson?.type
  const staticLessonContents = useStaticLessonContents()
  const path = lesson?.path ?? ''
  const StaticBody = path ? staticLessonContents?.[path] : undefined
  const Body = StaticBody || type?.content
  const articleRef = useRef<HTMLElement>(null)
  const completionRef = useRef<HTMLDivElement>(null)
  const [outline, setOutline] = useState<OutlineItem[]>([])
  const [activeId, setActiveId] = useState('')
  const { completed, visit, markComplete, toggleComplete } = useLearningProgress()
  const editorial = lesson ? getLessonEditorial(lesson) : undefined
  const neighbors = pid && slug
    ? getLessonNeighbors(pid, slug)
    : { previous: undefined, next: undefined }

  const isComplete = Boolean(path && completed.includes(path))

  useEffect(() => {
    if (!path || !type) return
    visit(path)
    if (!startedLessons.has(path)) {
      startedLessons.add(path)
      trackAnalyticsEvent({
        event: 'lesson_started',
        path,
        title: type.title,
      })
    }
  }, [path, type, visit])

  useEffect(() => {
    if (!path) return
    const article = articleRef.current
    if (!article) return
    let sectionObserver: IntersectionObserver | undefined

    const refresh = () => {
      const headings = Array.from(article.querySelectorAll<HTMLElement>('h2.section-title'))
      const items = headings.map((heading, index) => {
        if (!heading.id) heading.id = headingId(heading.textContent?.trim() || '', index)
        return { id: heading.id, label: heading.textContent?.trim() || `第 ${index + 1} 节` }
      })
      setOutline(items)
      sectionObserver?.disconnect()
      sectionObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)
          if (visible[0]) setActiveId((visible[0].target as HTMLElement).id)
        },
        { rootMargin: '-15% 0px -70% 0px' },
      )
      headings.forEach((heading) => sectionObserver?.observe(heading))
      return headings.length > 0
    }

    const mutationObserver = new MutationObserver(() => {
      if (refresh()) mutationObserver.disconnect()
    })
    if (!refresh()) {
      mutationObserver.observe(article, { childList: true, subtree: true })
    }
    return () => {
      mutationObserver.disconnect()
      sectionObserver?.disconnect()
    }
  }, [path])

  useEffect(() => {
    if (!path || !type) return
    const target = completionRef.current
    if (!target || isComplete) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        markComplete(path)
        trackAnalyticsEvent({
          event: 'lesson_completed',
          path,
          title: type.title,
          metadata: { method: 'reached_end' },
        })
        observer.disconnect()
      },
      { threshold: 0.8 },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [isComplete, markComplete, outline.length, path, type])

  // 无效部分 / 无效类型 / 尚未上线（无内容）的类型 —— 一律视为不存在，跳 404
  if (!part || !type || !Body) {
    return (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    )
  }

  return (
    <div className="typepage-layout">
      <article className="typepage" ref={articleRef}>
        <header className="typehead">
          <span className="typehead__eyebrow">
            <span className="typehead__code">{part.code}</span>
            {part.title}
          </span>
          <div className="typehead__titleline">
            <h1>{type.title}</h1>
            <button
              type="button"
              className={`typehead__complete${isComplete ? ' is-complete' : ''}`}
              onClick={() => {
                if (!isComplete) {
                  trackAnalyticsEvent({
                    event: 'lesson_completed',
                    path,
                    title: type.title,
                    metadata: { method: 'manual' },
                  })
                }
                toggleComplete(path)
              }}
            >
              {isComplete ? <Check size={15} /> : <Circle size={15} />}
              {isComplete ? '已学完' : '标为学完'}
            </button>
          </div>
          <p className="typehead__blurb">{type.blurb}</p>
          {editorial && (
            <section className="lesson-abstract" aria-labelledby="lesson-abstract-title">
              <h2 id="lesson-abstract-title">本课摘要</h2>
              <p>{editorial.summary}</p>
              <ul>
                {editorial.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
              </ul>
              <footer>
                <span>内容维护：{editorial.reviewedBy}</span>
                <span>审核状态：{editorial.reviewStatus}</span>
                {ROUTE_LAST_MODIFIED[path] && (
                  <span>最近更新：<time dateTime={ROUTE_LAST_MODIFIED[path]}>{ROUTE_LAST_MODIFIED[path]}</time></span>
                )}
              </footer>
            </section>
          )}
          <details className="lesson-outline lesson-outline--mobile">
            <summary><ListTree size={15} /> 本课目录 · {outline.length} 节</summary>
            <OutlineLinks items={outline} activeId={activeId} />
          </details>
        </header>

        {StaticBody ? (
          <>
            <StaticBody />
            <div ref={completionRef} className="lesson-completion-marker" aria-hidden="true" />
          </>
        ) : (
          <Suspense fallback={<div style={{ minHeight: '50vh' }} aria-busy="true" />}>
            <Body />
            <div ref={completionRef} className="lesson-completion-marker" aria-hidden="true" />
          </Suspense>
        )}
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
      <aside className="lesson-outline lesson-outline--desktop" aria-label="本课目录">
        <p className="lesson-outline__label"><ListTree size={14} /> 本课目录</p>
        <OutlineLinks items={outline} activeId={activeId} />
        <p className="lesson-outline__status">
          {isComplete ? <Check size={13} /> : <Circle size={13} />}
          {isComplete ? '已记录完成' : '读到文末自动完成'}
        </p>
      </aside>
    </div>
  )
}
