import { CLIENT_RUNTIME } from '../config/client-runtime.ts'

/** 唯一的统计 Provider。站点只发布到 Cloudflare Worker。 */
export const ANALYTICS_PROVIDER = 'cloudflare'

export type AnalyticsEventName =
  | 'page_view'
  | 'feedback_opened'
  | 'feedback_submitted'
  | 'feedback_succeeded'
  | 'feedback_failed'
  | 'web_vital'
  | 'problem_outbound'
  | 'search_used'
  | 'search_no_result'
  | 'client_error'
  | 'route_not_found'

export interface AnalyticsEvent {
  event: AnalyticsEventName
  path: string
  title?: string
  metadata?: Record<string, string | number | boolean>
}

/**
 * Cloudflare Web Analytics / RUM 由 Cloudflare 代理自动注入，源码与预渲染产物
 * 都不得再手工加 beacon，否则同一次浏览会被重复统计。这里只发第一方事件。
 */
function sendFirstPartyEvent(event: AnalyticsEvent): void {
  // 只在生产域名上报：localhost、预览域和任何镜像都不写入数据集。
  if (window.location.hostname !== CLIENT_RUNTIME.productionHostname) return

  const body = JSON.stringify({
    provider: ANALYTICS_PROVIDER,
    event: event.event,
    path: event.path,
    title: event.title ?? '',
    metadata: {
      build: import.meta.env.VITE_BUILD_ID || 'local',
      ...(event.metadata ?? {}),
    },
    ts: new Date().toISOString(),
  })

  try {
    if (
      typeof navigator.sendBeacon === 'function' &&
      navigator.sendBeacon(
        CLIENT_RUNTIME.analyticsEndpoint,
        new Blob([body], { type: 'application/json' }),
      )
    ) {
      return
    }
  } catch {
    // sendBeacon 不可用时降级为 keepalive fetch。
  }

  void fetch(CLIENT_RUNTIME.analyticsEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // 统计永远不影响教学、小游戏或反馈流程。
  })
}

export function trackAnalyticsEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return
  sendFirstPartyEvent(event)
}
