import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

// 自托管字体
import '@fontsource/space-grotesk/latin-400.css'
import '@fontsource/space-grotesk/latin-500.css'
import '@fontsource/space-grotesk/latin-700.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
// 公式样式
import 'katex/dist/katex.min.css'
// 设计令牌与全局
import './styles/tokens.css'
import './styles/global.css'

import App from './app/App'
import { loadInitialRouteViews } from './app/routeViews.ts'
import { installVitePreloadRecovery } from './app/preloadRecovery.ts'
import { getLesson } from './data/catalog.ts'
import type { StaticLessonContents } from './app/StaticLessonContent.ts'

installVitePreloadRecovery()

const container = document.getElementById('root')
if (!container) throw new Error('Missing #root container')

async function loadInitialLessonContents(pathname: string): Promise<StaticLessonContents> {
  const match = pathname.match(/^\/part\/([a-g])\/([^/]+)$/)
  if (!match) return {}
  const lesson = getLesson(match[1], match[2])
  if (!lesson) return {}
  const module = await lesson.type.loadContent()
  return { [lesson.path]: module.default }
}

const [views, initialLessonContents] = container.hasChildNodes()
  ? await Promise.all([
      loadInitialRouteViews(window.location.pathname),
      loadInitialLessonContents(window.location.pathname),
    ])
  : [undefined, {}]

const application = (
  <StrictMode>
    <App views={views} initialLessonContents={initialLessonContents} />
  </StrictMode>
)

if (container.hasChildNodes()) {
  hydrateRoot(container, application, {
    onRecoverableError(error) {
      console.error('[DP大师] React 水合发生可恢复错误：', error)
    },
  })
} else {
  createRoot(container).render(application)
}
