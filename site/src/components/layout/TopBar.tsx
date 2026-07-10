import { Link, NavLink, useLocation, useMatch } from 'react-router-dom'
import { Menu, Sun, Moon, Search } from 'lucide-react'
import { useTheme } from '../../theme/ThemeContext'
import { getPart } from '../../data/catalog'
import { getPageMeta } from '../../lib/pageMeta.ts'

export default function TopBar({
  onHamburger,
  mobileOpen,
}: {
  onHamburger: () => void
  mobileOpen: boolean
}) {
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const match = useMatch('/part/:pid/*')
  const pid = match?.params.pid
  const slug = match?.params['*']
  const part = pid ? getPart(pid) : undefined
  const type = part && slug ? part.types.find((t) => t.slug === slug) : undefined
  const currentLabel = getPageMeta(location.pathname).title.split(' · ')[0]

  return (
    <header className="topbar">
      <button
        className="icon-btn hamburger"
        onClick={onHamburger}
        aria-label="打开导航"
        aria-expanded={mobileOpen}
        aria-controls="site-sidebar"
      >
        <Menu size={18} />
      </button>

      <nav className="crumbs" aria-label="面包屑">
        <NavLink to="/" end>首页</NavLink>
        {part && (
          <>
            <span className="sep">/</span>
            {type ? (
              <Link to={`/part/${part.id}`}>{part.title}</Link>
            ) : (
              <span className="cur" aria-current="page">{part.title}</span>
            )}
          </>
        )}
        {type && (
          <>
            <span className="sep">/</span>
            <span className="cur" aria-current="page">{type.title}</span>
          </>
        )}
        {!part && location.pathname !== '/' && (
          <>
            <span className="sep">/</span>
            <span className="cur" aria-current="page">{currentLabel}</span>
          </>
        )}
      </nav>

      <div className="topbar__spacer" />

      <NavLink className="searchhint" to="/problems" aria-label="打开题目索引">
        <Search size={15} />
        <span>题目索引</span>
      </NavLink>

      <button className="icon-btn" onClick={toggle} aria-label="切换深浅色">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  )
}
