import { Link, NavLink, useMatch } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { Sparkles, Info, BookOpen, Library } from 'lucide-react'
import { PARTS } from '../../data/catalog'

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const match = useMatch('/part/:pid/*')
  const activePid = match?.params.pid

  return (
    <nav className="sidebar-inner" aria-label="主导航">
      <Link to="/" className="brand" onClick={onNavigate}>
        <span className="brand__mark">
          <Sparkles size={18} color="var(--text-on-accent)" strokeWidth={2.2} />
        </span>
        <span>
          <span className="brand__name grad-text-brand">DP大师</span>
          <span className="brand__sub" style={{ display: 'block' }}>DP MASTER</span>
        </span>
      </Link>

      {PARTS.map((p) => {
        const open = p.id === activePid
        return (
          <div className="nav-group" key={p.id}>
            <Link
              to={`/part/${p.id}`}
              className={`nav-part${open ? ' active open' : ''}`}
              onClick={onNavigate}
            >
              <span
                className="nav-part__badge"
                style={{ ['--pg']: `var(--grad-${p.id})` } as CSSProperties}
              >
                {p.code}
              </span>
              <span className="nav-part__title">{p.title}</span>
            </Link>

            {open && (
              <div className="nav-types">
                {p.types.map((t) =>
                  t.status === 'ready' ? (
                    <NavLink
                      key={t.slug}
                      to={`/part/${p.id}/${t.slug}`}
                      className={({ isActive }) => `nav-type${isActive ? ' active' : ''}`}
                      onClick={onNavigate}
                    >
                      {t.title}
                    </NavLink>
                  ) : (
                    <span key={t.slug} className="nav-type planned">
                      {t.title}
                      <span className="nav-type__tag">待建</span>
                    </span>
                  ),
                )}
              </div>
            )}
          </div>
        )
      })}

      <NavLink
        to="/method"
        className={({ isActive }) => `nav-part${isActive ? ' active' : ''}`}
        onClick={onNavigate}
        style={{ marginTop: 'var(--sp-4)' }}
      >
        <span
          className="nav-part__badge"
          style={{ ['--pg']: 'var(--grad-brand)' } as CSSProperties}
        >
          <BookOpen size={15} />
        </span>
        <span className="nav-part__title">通用方法论</span>
      </NavLink>
      <NavLink
        to="/problems"
        className={({ isActive }) => `nav-part${isActive ? ' active' : ''}`}
        onClick={onNavigate}
      >
        <span
          className="nav-part__badge"
          style={{ ['--pg']: 'var(--grad-brand)' } as CSSProperties}
        >
          <Library size={15} />
        </span>
        <span className="nav-part__title">题目索引</span>
      </NavLink>
      <NavLink
        to="/about"
        className={({ isActive }) => `nav-part${isActive ? ' active' : ''}`}
        onClick={onNavigate}
      >
        <span
          className="nav-part__badge"
          style={{ ['--pg']: 'var(--grad-brand)' } as CSSProperties}
        >
          <Info size={15} />
        </span>
        <span className="nav-part__title">关于 · 如何使用</span>
      </NavLink>
    </nav>
  )
}
