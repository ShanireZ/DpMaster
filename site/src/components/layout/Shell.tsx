import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { PanelLeftClose } from 'lucide-react'
import { useLocation, useMatch } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import RouteStage from './RouteStage'
import FeedbackWidget from '../feedback/FeedbackWidget'
import { getPageMeta } from '../../lib/pageMeta.ts'
import { scheduleHashScroll } from '../../lib/hashNavigation.ts'
import './shell.css'

const SIDEBAR_STORAGE_KEY = 'dp-master-sidebar-collapsed:v1'

export default function Shell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const previousPath = useRef<string | undefined>(undefined)
  const reduceMotion = useReducedMotion()
  const match = useMatch('/part/:pid/*')
  const pid = match?.params.pid
  const routeMeta = getPageMeta(location.pathname)

  useLayoutEffect(() => {
    try {
      const collapsed = window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
      queueMicrotask(() => setSidebarCollapsed(collapsed))
    } catch {
      // 隱私模式或禁用儲存時仍保留當前工作階段內的側欄狀態。
    }
  }, [])

  // 當前部分決定強調色/漸變作用域
  useEffect(() => {
    if (pid) document.documentElement.dataset.part = pid
    else delete document.documentElement.dataset.part
  }, [pid])

  // 路由變化：關閉移動抽屜 + 恢復正確位置 + 將鍵盤焦點移到新頁面正文。
  // 普通路由必須立即置頂，不能繼承全域 smooth（新舊頁面高度變化會讓動畫中途偏移）。
  // 帶 hash 的首屏/跨頁導覽則等 DOM 穩定兩影格後精確定位；課程動態標題由 TypePage 補做。
  useLayoutEffect(() => {
    const initial = previousPath.current === undefined
    const changed = !initial && previousPath.current !== location.pathname
    previousPath.current = location.pathname
    queueMicrotask(() => setMobileOpen(false))
    let cancelHashScroll: (() => void) | undefined
    if (location.hash) {
      cancelHashScroll = scheduleHashScroll(
        location.hash,
        initial || changed ? 'instant' : 'smooth',
      )
    } else if (changed) {
      window.scrollTo({ top: 0, left: window.scrollX, behavior: 'instant' as ScrollBehavior })
    }
    if (changed) mainRef.current?.focus({ preventScroll: true })
    return cancelHashScroll
  }, [location.hash, location.pathname])

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      } catch {
        // 本機儲存不可用時不阻斷側欄交互。
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
