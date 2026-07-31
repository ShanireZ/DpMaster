import type { CSSProperties } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { NavLink, useMatch } from 'react-router-dom'
import { BookOpen, Library } from 'lucide-react'
import { PARTS } from '../../data/catalog'
import { BRAND } from '../../config/site.ts'

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const match = useMatch('/part/:pid/*')
  const activePid = match?.params.pid
  const reduceMotion = useReducedMotion()

  return (
    <div className="sidebar-inner">
      <nav className="sidebar-nav" aria-label="主导航">
        <NavLink to="/" end className="brand" onClick={onNavigate}>
          <span className="brand__mark" aria-hidden="true">
            <img src="/favicon.svg" alt="" width="32" height="32" />
          </span>
          <span className="brand__wordmark">
            <span className="brand__name">{BRAND.name}</span>
            <span className="brand__sub">{BRAND.subtitle}</span>
          </span>
        </NavLink>

        {PARTS.map((p) => {
          const open = p.id === activePid
          return (
            <div className="nav-group" key={p.id}>
              <NavLink
                to={`/part/${p.id}`}
                end
                className={`nav-part${open ? ' active open' : ''}`}
                onClick={onNavigate}
                title={p.title}
              >
                <span
                  className="nav-part__badge"
                  style={{ ['--nav-family']: `var(--${p.id}-1)` } as CSSProperties}
                >
                  <span className="nav-part__code">{p.code}</span>
                </span>
                <span className="nav-part__title">{p.title}</span>
              </NavLink>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    className="nav-types"
                    initial={reduceMotion ? false : { height: 0, opacity: 0, y: -8 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={reduceMotion ? { height: 0 } : { height: 0, opacity: 0, y: -6 }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {p.types.map((t, index) => {
                      const compactCode = String(index + 1).padStart(2, '0')
                      return t.status === 'ready' ? (
                        <NavLink
                          key={t.slug}
                          to={`/part/${p.id}/${t.slug}`}
                          className={({ isActive }) => `nav-type${isActive ? ' active' : ''}`}
                          onClick={onNavigate}
                          aria-label={t.title}
                          title={t.title}
                        >
                          <span className="nav-type__label">{t.title}</span>
                          <span className="nav-type__compact" aria-hidden="true">
                            {compactCode}
                          </span>
                        </NavLink>
                      ) : (
                        <span key={t.slug} className="nav-type planned" title={t.title}>
                          <span className="nav-type__label">{t.title}</span>
                          <span className="nav-type__compact" aria-hidden="true">
                            {compactCode}
                          </span>
                          <span className="nav-type__tag">待建</span>
                        </span>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        <NavLink
          to="/method"
          className={({ isActive }) => `nav-part${isActive ? ' active' : ''}`}
          onClick={onNavigate}
          style={{ marginTop: 'var(--sp-4)' }}
          title="通用方法论"
        >
          <span
            className="nav-part__badge"
            style={{ ['--nav-family']: 'var(--accent-1)' } as CSSProperties}
          >
            <BookOpen size={15} />
          </span>
          <span className="nav-part__title">通用方法论</span>
        </NavLink>
        <NavLink
          to="/problems"
          className={({ isActive }) => `nav-part${isActive ? ' active' : ''}`}
          onClick={onNavigate}
          title="题目索引"
        >
          <span
            className="nav-part__badge"
            style={{ ['--nav-family']: 'var(--accent-1)' } as CSSProperties}
          >
            <Library size={15} />
          </span>
          <span className="nav-part__title">题目索引</span>
        </NavLink>
      </nav>

      <footer className="sidebar-records" aria-label="备案信息">
        <div className="sidebar-records__intro">
          <p className="sidebar-records__motto">{BRAND.slogan}</p>
          <p className="sidebar-records__copyright">
            © 2026 {BRAND.owner}. All rights reserved.
          </p>
        </div>
        <div className="sidebar-record">
          <img className="sidebar-record__icon" src="/beian.png" alt="" />
          <span>鲁公网安备37100202000975号</span>
        </div>
        <a
          className="sidebar-record sidebar-record--icp"
          href="https://beian.miit.gov.cn/"
        >
          鲁ICP备2026039717号
        </a>
      </footer>
    </div>
  )
}
