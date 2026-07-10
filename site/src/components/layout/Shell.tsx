import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useMatch } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import FeedbackWidget from '../feedback/FeedbackWidget'
import { getPageMeta } from '../../lib/pageMeta.ts'
import './shell.css'

export default function Shell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const previousPath = useRef(location.pathname)
  const match = useMatch('/part/:pid/*')
  const pid = match?.params.pid
  const routeMeta = getPageMeta(location.pathname)

  // 当前部分决定强调色/渐变作用域
  useEffect(() => {
    if (pid) document.documentElement.dataset.part = pid
    else delete document.documentElement.dataset.part
  }, [pid])

  // 路由变化：关闭移动抽屉 + 滚动到顶 + 将键盘焦点移到新页面正文
  useEffect(() => {
    const changed = previousPath.current !== location.pathname
    previousPath.current = location.pathname
    setMobileOpen(false)
    window.scrollTo({ top: 0 })
    if (changed) mainRef.current?.focus({ preventScroll: true })
  }, [location.pathname])

  return (
    <>
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <div className="shell">
        <aside id="site-sidebar" className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </aside>
        <button
          type="button"
          className={`sidebar__scrim${mobileOpen ? ' show' : ''}`}
          onClick={() => setMobileOpen(false)}
          aria-label="关闭导航"
          aria-hidden={!mobileOpen}
          tabIndex={mobileOpen ? 0 : -1}
        />
        <div className="main">
          <TopBar onHamburger={() => setMobileOpen(true)} mobileOpen={mobileOpen} />
          <main id="main-content" ref={mainRef} className="content" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
        <p className="route-announcer" role="status" aria-live="polite" aria-atomic="true">
          已进入 {routeMeta.title}
        </p>
        <FeedbackWidget />
      </div>
    </>
  )
}
