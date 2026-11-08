import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

// 自託管字體
import '@fontsource/space-grotesk/latin-400.css'
import '@fontsource/space-grotesk/latin-500.css'
import '@fontsource/space-grotesk/latin-700.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
// 公式樣式
import 'katex/dist/katex.min.css'
// 設計權杖與全域
import './styles/tokens.css'
import './styles/global.css'

import App from './app/App'
import { clientErrorFrame, clientErrorMessage } from './analytics/clientError.ts'
import { trackAnalyticsEvent } from './analytics/index.ts'
import { loadInitialRouteViews } from './app/routeViews.ts'
import { installVitePreloadRecovery, isModuleLoadError, refreshRouteModulePreloads } from './app/preloadRecovery.ts'
import { getLesson } from './data/catalog.ts'
import type { StaticLessonContents } from './app/StaticLessonContent.ts'
import { loadFamilyArtForPath } from './components/art/familyArtRegistry.ts'
import { PageLoadError } from './components/layout/ErrorBoundary.tsx'

const isPreloadReloadPending = installVitePreloadRecovery()

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

if (container.hasChildNodes()) {
  const path = window.location.pathname
  const initialModules = await Promise.all([
    loadInitialRouteViews(path),
    loadInitialLessonContents(path),
    loadFamilyArtForPath(path),
  ]).catch((error: unknown) => {
    if (isPreloadReloadPending()) return

    const message = clientErrorMessage(error)
    const frame = clientErrorFrame(error)
    const moduleLoadFailure = isModuleLoadError(error)
    console.error('[DP大师] 页面初始化出错：', error)
    trackAnalyticsEvent({
      event: 'client_error',
      path,
      metadata: {
        source: 'startup',
        message,
        ...(frame ? { frame } : {}),
        recovery: moduleLoadFailure ? 'exhausted' : 'none',
      },
    })

    // 獨立掛載重試面板，保留未能水合的預繪製正文。
    const notice = document.createElement('div')
    const main = container.querySelector('main') ?? container
    main.prepend(notice)
    createRoot(notice).render(
      <PageLoadError
        message={message}
        hasPrerenderedContent
        prepareRetry={moduleLoadFailure ? refreshRouteModulePreloads : undefined}
      />,
    )
  })

  if (initialModules) {
    const [views, initialLessonContents, initialFamilyArt] = initialModules
    hydrateRoot(container, (
      <StrictMode>
        <App views={views} initialLessonContents={initialLessonContents} initialFamilyArt={initialFamilyArt} />
      </StrictMode>
    ), {
      onRecoverableError(error) {
        console.error('[DP大师] React 水合发生可恢复错误：', error)
      },
    })
  }
} else {
  createRoot(container).render(<StrictMode><App /></StrictMode>)
}
