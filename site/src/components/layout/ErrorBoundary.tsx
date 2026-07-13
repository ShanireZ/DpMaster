import { Component, type ErrorInfo, type ReactNode } from 'react'
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
    console.error('[DP大师] 路由渲染出错：', error, info.componentStack)
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
