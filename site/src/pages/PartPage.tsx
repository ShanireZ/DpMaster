import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import GeometryBackdrop from '../components/GeometryBackdrop'
import PartGlyph from '../components/PartGlyph'
import { getPart } from '../data/catalog'
import './part.css'

const NotFound = lazy(() => import('./NotFound'))

export default function PartPage() {
  const { pid } = useParams()
  const part = pid ? getPart(pid) : undefined
  if (!part)
    return (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    )

  const Game = part.game.content

  return (
    <div>
      <header className="partcover">
        <GeometryBackdrop variant="section" />
        <div className="partcover__row">
          <span className="partcover__code">{part.code}</span>
          <div>
            <h1>{part.title}</h1>
          </div>
          <span className="partcover__glyph">
            <PartGlyph id={part.id} size={110} />
          </span>
        </div>
        <p className="partcover__tag">{part.tagline}</p>
      </header>

      <div className="typelist">
        <div className="typelist__label">类型 · {part.types.length}</div>
        {part.types.map((t, i) => {
          const num = String(i + 1).padStart(2, '0')
          if (t.status === 'ready') {
            return (
              <Link key={t.slug} to={`/part/${part.id}/${t.slug}`} className="typerow">
                <span className="typerow__num">{num}</span>
                <span>
                  <span className="typerow__title">{t.title}</span>
                  <span className="typerow__blurb" style={{ display: 'block' }}>
                    {t.blurb}
                  </span>
                </span>
                <span className="typerow__arrow">
                  <ArrowRight size={18} />
                </span>
              </Link>
            )
          }
          return (
            <div key={t.slug} className="typerow planned">
              <span className="typerow__num">{num}</span>
              <span>
                <span className="typerow__title">{t.title}</span>
                <span className="typerow__blurb" style={{ display: 'block' }}>
                  {t.blurb}
                </span>
              </span>
              <span className="badge-status planned">待建</span>
            </div>
          )
        })}
      </div>

      <section style={{ marginTop: 'var(--sp-8)' }}>
        <h2 className="section-title">本部分 · 互动游戏</h2>
        <Suspense fallback={<div style={{ minHeight: 240 }} aria-busy="true" />}>
          <Game />
        </Suspense>
      </section>
    </div>
  )
}
