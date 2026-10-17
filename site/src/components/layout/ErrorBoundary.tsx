import { Component, type ErrorInfo, type ReactNode } from 'react'
import { trackAnalyticsEvent } from '../../analytics/index.ts'
import {
  isModuleLoadError,
  reserveModuleLoadRecovery,
} from '../../app/preloadRecovery.ts'
import './ErrorBoundary.css'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

// 類元件錯誤邊界：兜住任一懶載入課節（含 import() 失敗）的繪製異常，
// 避免整站白屏。Suspense 只接 loading，接不住 rejected 的動態 import。
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // 第二道網。`installVitePreloadRecovery` 只接 Vite 自己派發的
    // `vite:preloadError`；懶載入失敗若以別的形態到達這裡，從前就只剩那張要使用者
    // 手點的卡片。2026-08-13 那版線上告警就是這麼來的：chunk 當時取不到，
    // 事後複查它在兩個 region 都健在，使用者卻已經看到失敗頁了。
    const moduleLoadFailure = isModuleLoadError(error)
    // 額度與 preload 那條路徑共用，用盡即退回人工路徑 —— 見 preloadRecovery.ts。
    const willReload = moduleLoadFailure && reserveModuleLoadRecovery()

    console.error('[DP大师] 路由渲染出错：', error, info.componentStack)
    trackAnalyticsEvent({
      event: 'client_error',
      path: window.location.pathname,
      metadata: {
        source: 'react_boundary',
        message: error.message.slice(0, 160),
        component: (info.componentStack || '').trim().slice(0, 160),
        // ★ 自動刷新必須留痕。靜默恢復會讓這類告警整體消失，而「告警不再出現」
        //   與「問題不再發生」是兩回事 —— recovery=auto_reload 的持續增長正是
        //   「資源在反覆取不到」的信號，別把它優化掉。
        recovery: willReload
          ? 'auto_reload'
          : moduleLoadFailure
            ? 'exhausted'
            : 'none',
      },
    })

    // 上報走 sendBeacon / keepalive fetch，兩者都能挺過隨後的導覽，所以先報後刷。
    if (willReload) window.location.reload()
  }

  private readonly mainRef = (node: HTMLElement | null): void => {
    node?.focus()
  }

  private readonly handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div
        ref={this.mainRef}
        tabIndex={-1}
        className="error-boundary"
        role="alert"
        aria-live="assertive"
      >
        <div className="error-boundary__card">
          <h1>这一页加载出了问题</h1>
          <p>页面在渲染时出错。你可以重试，或返回首页继续学习。</p>
          <p className="error-boundary__detail">{error.message}</p>
          <div className="error-boundary__actions">
            <button type="button" onClick={this.handleReload}>
              重新加载
            </button>
            <a href="/">返回首页</a>
          </div>
        </div>
      </div>
    )
  }
}
