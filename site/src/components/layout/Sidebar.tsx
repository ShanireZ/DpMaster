import { NavLink, useMatch } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { Sparkles, Info, BookOpen, Library } from 'lucide-react'
import { PARTS } from '../../data/catalog'

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const match = useMatch('/part/:pid/*')
  const activePid = match?.params.pid

  return (
    <div className="sidebar-inner">
      <nav className="sidebar-nav" aria-label="主导航">
        <NavLink to="/" end className="brand" onClick={onNavigate}>
          <span className="brand__mark">
            <Sparkles size={18} color="var(--text-on-accent)" strokeWidth={2.2} />
          </span>
          <span>
            <span className="brand__name grad-text-brand">DP大师</span>
            <span className="brand__sub" style={{ display: 'block' }}>DP MASTER</span>
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
              >
                <span
                  className="nav-part__badge"
                  style={{ ['--pg']: `var(--grad-${p.id})` } as CSSProperties}
                >
                  {p.code}
                </span>
                <span className="nav-part__title">{p.title}</span>
              </NavLink>

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

      <footer className="sidebar-records" aria-label="备案信息">
        <div className="sidebar-records__intro">
          <p className="sidebar-records__motto">在算法的海洋中，我就是你的信标</p>
          <p className="sidebar-records__copyright">
            © 2026 AzureL蔚澜算法. All rights reserved.
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
