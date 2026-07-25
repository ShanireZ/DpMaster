import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { PanelLeftClose } from 'lucide-react'
import { useLocation, useMatch } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import RouteStage from './RouteStage'
import FeedbackWidget from '../feedback/FeedbackWidget'
import { getPageMeta } from '../../lib/pageMeta.ts'
import './shell.css'

const SIDEBAR_STORAGE_KEY = 'dp-master-sidebar-collapsed:v1'

export default function Shell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const previousPath = useRef(location.pathname)
  const reduceMotion = useReducedMotion()
  const match = useMatch('/part/:pid/*')
  const pid = match?.params.pid
  const routeMeta = getPageMeta(location.pathname)

  useEffect(() => {
    try {
      setSidebarCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true')
    } catch {
      // 隐私模式或禁用存储时仍保留当前会话内的侧栏状态。
    }
  }, [])

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

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      } catch {
        // 本地存储不可用时不阻断侧栏交互。
      }
      return next
    })
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <div className={`shell${sidebarCollapsed ? ' shell--sidebar-collapsed' : ''}`}>
        <aside id="site-sidebar" className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </aside>
        <motion.button
          type="button"
          className="sidebar-collapse"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? '展开侧栏' : '收起侧栏'}
          aria-expanded={!sidebarCollapsed}
          aria-controls="site-sidebar"
          whileHover={reduceMotion ? undefined : { x: sidebarCollapsed ? 2 : -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 520, damping: 32 }}
        >
          <motion.span
            aria-hidden="true"
            animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <PanelLeftClose size={15} strokeWidth={1.8} />
          </motion.span>
        </motion.button>
        <button
          type="button"
          className={`sidebar__scrim${mobileOpen ? ' show' : ''}`}
          onClick={() => setMobileOpen(false)}
          aria-label="关闭导航"
          aria-hidden={!mobileOpen}
          tabIndex={mobileOpen ? 0 : -1}
        />
        <div className="main">
          <TopBar onHamburger={() => setMobileOpen((open) => !open)} mobileOpen={mobileOpen} />
          <main id="main-content" ref={mainRef} className="content" tabIndex={-1}>
            <RouteStage />
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
