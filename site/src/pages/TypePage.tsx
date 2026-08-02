import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ListTree } from 'lucide-react'
import { getLesson, getLessonNeighbors } from '../data/catalog'
import { getLessonEditorial } from '../data/editorial.ts'
import AnimatedContent from '../components/motion/AnimatedContent'
import PartGlyph from '../components/PartGlyph'
import { FamilyLessonPlate } from '../components/art/FamilyArtSlots.tsx'
import { hasFamilyArt } from '../components/art/familyArtRegistry.ts'
import { useStaticLessonContents } from '../app/StaticLessonContent.ts'
import './typepage.css'

const NotFound = lazy(() => import('./NotFound'))

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

type TitleStyle = CSSProperties & {
  '--title-units': number
}

function getTitleVisualUnits(title: string): number {
  const units = Array.from(title).reduce((sum, character) => {
    if (/\s/u.test(character)) return sum + 0.35
    if (/[A-Za-z0-9]/u.test(character)) return sum + 0.62
    if (/[:：/=/()（）]/u.test(character)) return sum + 0.45
    return sum + 1
  }, 0)

  return Number(units.toFixed(2))
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
  const [outline, setOutline] = useState<OutlineItem[]>([])
  const [activeId, setActiveId] = useState('')
  const editorial = lesson ? getLessonEditorial(lesson) : undefined
  const neighbors = pid && slug
    ? getLessonNeighbors(pid, slug)
    : { previous: undefined, next: undefined }
  const titleStyle = type
    ? { '--title-units': getTitleVisualUnits(type.title) } as TitleStyle
    : undefined
  useEffect(() => {
    if (!path) return
    const article = articleRef.current
    if (!article) return
    let sectionObserver: IntersectionObserver | undefined

    const refresh = () => {
      const headings = Array.from(article.querySelectorAll<HTMLElement>('h2.section-title'))
      const items = headings.map((heading, index) => {
        if (!heading.id) heading.id = headingId(heading.textContent?.trim() || '', index)
        const section = heading.closest<HTMLElement>('.lesson')
        if (section) section.dataset.sectionIndex = String(index + 1).padStart(2, '0')
        return { id: heading.id, label: heading.textContent?.trim() || `第 ${index + 1} 节` }
      })
      setOutline(items)
      setActiveId((current) => (
        items.some((item) => item.id === current) ? current : (items[0]?.id ?? '')
      ))
      sectionObserver?.disconnect()
      sectionObserver = new IntersectionObserver(
        () => {
          const readingLine = window.innerHeight * 0.3
          const current = headings.reduce(
            (candidate, heading) => (
              heading.getBoundingClientRect().top <= readingLine ? heading : candidate
            ),
            headings[0],
          )
          if (current) setActiveId(current.id)
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

  // 无效部分 / 无效类型 / 尚未上线（无内容）的类型 —— 一律视为不存在，跳 404
  if (!part || !type || !Body) {
    return (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    )
  }

  return (
    <div className={`typepage-layout typepage-layout--${part.id}`} data-part-id={part.id}>
      <article
        className="typepage"
        ref={articleRef}
        data-part-id={part.id}
        data-lesson-slug={type.slug}
        data-demo-standard="instrument"
        data-demo-intensity="enhanced"
      >
        <AnimatedContent>
          <header className="typehead">
            <div className="typehead__canvas">
              <div className="typehead__copy">
                <span className="typehead__eyebrow">
                  <span className="typehead__code">{part.code}</span>
                  {part.title}
                </span>
                <div className="typehead__titleline">
                  <h1 style={titleStyle}>{type.title}</h1>
                </div>
                <p className="typehead__blurb">{type.blurb}</p>
              </div>
              <div className="typehead__art">
                <div className="typehead__glyph">
                  <FamilyLessonPlate
                    partId={part.id}
                    slug={type.slug}
                    title={type.title}
                    fallback={<PartGlyph id={part.id} size={320} />}
                  />
                </div>
                {!hasFamilyArt(part.id) && <span className="typehead__art-code">{part.code}</span>}
              </div>
            </div>
            {editorial && (
              <section className="lesson-abstract" aria-labelledby="lesson-abstract-title">
                <div className="lesson-abstract__summary">
                  <h2 id="lesson-abstract-title">本课摘要</h2>
                  <p>{editorial.summary}</p>
                </div>
                <ul>
                  {editorial.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
                </ul>
              </section>
            )}
            <details className="lesson-outline lesson-outline--mobile">
              <summary><ListTree size={15} /> 本课目录 · {outline.length} 节</summary>
              <OutlineLinks items={outline} activeId={activeId} />
            </details>
          </header>
        </AnimatedContent>

        <div className="lesson-flow">
          {StaticBody ? (
            <StaticBody />
          ) : (
            <Suspense fallback={<div style={{ minHeight: '50vh' }} aria-busy="true" />}>
              <Body />
            </Suspense>
          )}
        </div>
        <AnimatedContent distance={12}>
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
        </AnimatedContent>
      </article>
      <aside className="lesson-outline lesson-outline--desktop" aria-label="本课目录">
        <p className="lesson-outline__label"><ListTree size={14} /> 本课目录</p>
        <OutlineLinks items={outline} activeId={activeId} />
      </aside>
    </div>
  )
}
