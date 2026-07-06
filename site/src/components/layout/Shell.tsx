import { useEffect, useState } from 'react'
import { Outlet, useLocation, useMatch } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import FeedbackWidget from '../feedback/FeedbackWidget'
import './shell.css'

export default function Shell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const match = useMatch('/part/:pid/*')
  const pid = match?.params.pid

  // 当前部分决定强调色/渐变作用域
  useEffect(() => {
    if (pid) document.documentElement.dataset.part = pid
    else delete document.documentElement.dataset.part
  }, [pid])

  // 路由变化：关闭移动抽屉 + 滚动到顶
  useEffect(() => {
    setMobileOpen(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="shell">
      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </aside>
      <div
        className={`sidebar__scrim${mobileOpen ? ' show' : ''}`}
        onClick={() => setMobileOpen(false)}
      />
      <div className="main">
        <TopBar onHamburger={() => setMobileOpen(true)} />
        <main className="content">
          <Outlet />
        </main>
      </div>
      <FeedbackWidget />
    </div>
  )
}
