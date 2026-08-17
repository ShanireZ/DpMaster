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

// 类组件错误边界：兜住任一懒加载课节（含 import() 失败）的渲染异常，
// 避免整站白屏。Suspense 只接 loading，接不住 rejected 的动态 import。
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // 第二道网。`installVitePreloadRecovery` 只接 Vite 自己派发的
    // `vite:preloadError`；懒加载失败若以别的形态到达这里，从前就只剩那张要用户
    // 手点的卡片。2026-08-13 那版线上告警就是这么来的：chunk 当时取不到，
    // 事后复查它在两个 region 都健在，用户却已经看到失败页了。
    const moduleLoadFailure = isModuleLoadError(error)
    // 额度与 preload 那条路径共用，用尽即退回人工路径 —— 见 preloadRecovery.ts。
    const willReload = moduleLoadFailure && reserveModuleLoadRecovery()

    console.error('[DP大师] 路由渲染出错：', error, info.componentStack)
    trackAnalyticsEvent({
      event: 'client_error',
      path: window.location.pathname,
      metadata: {
        source: 'react_boundary',
        message: error.message.slice(0, 160),
        component: (info.componentStack || '').trim().slice(0, 160),
        // ★ 自动刷新必须留痕。静默恢复会让这类告警整体消失，而「告警不再出现」
        //   与「问题不再发生」是两回事 —— recovery=auto_reload 的持续增长正是
        //   「资源在反复取不到」的信号，别把它优化掉。
        recovery: willReload
          ? 'auto_reload'
          : moduleLoadFailure
            ? 'exhausted'
            : 'none',
      },
    })

    // 上报走 sendBeacon / keepalive fetch，两者都能挺过随后的导航，所以先报后刷。
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
