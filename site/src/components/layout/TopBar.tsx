import { Link, useMatch } from 'react-router-dom'
import { Menu, Sun, Moon, Search } from 'lucide-react'
import { useTheme } from '../../theme/ThemeContext'
import { getPart } from '../../data/parts'

export default function TopBar({ onHamburger }: { onHamburger: () => void }) {
  const { theme, toggle } = useTheme()
  const match = useMatch('/part/:pid/*')
  const pid = match?.params.pid
  const slug = match?.params['*']
  const part = pid ? getPart(pid) : undefined
  const type = part && slug ? part.types.find((t) => t.slug === slug) : undefined

  return (
    <header className="topbar">
      <button className="icon-btn hamburger" onClick={onHamburger} aria-label="打开导航">
        <Menu size={18} />
      </button>

      <nav className="crumbs" aria-label="面包屑">
        <Link to="/">首页</Link>
        {part && (
          <>
            <span className="sep">/</span>
            <Link to={`/part/${part.id}`}>{part.title}</Link>
          </>
        )}
        {type && (
          <>
            <span className="sep">/</span>
            <span className="cur">{type.title}</span>
          </>
        )}
      </nav>

      <div className="topbar__spacer" />

      <div className="searchhint" aria-hidden="true">
        <Search size={15} />
        <span>搜题跳转</span>
        <kbd>⌘K</kbd>
      </div>

      <button className="icon-btn" onClick={toggle} aria-label="切换深浅色">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  )
}
