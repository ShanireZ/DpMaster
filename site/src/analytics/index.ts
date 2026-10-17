import { CLIENT_RUNTIME } from '../config/client-runtime.ts'

/** 唯一的統計 Provider。站台只發布到 Cloudflare Worker。 */
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
 * Cloudflare Web Analytics / RUM 由 Cloudflare 代理自動注入，原始碼與預繪製產物
 * 都不得再手動加 beacon，否則同一次瀏覽會被重複統計。這裡只發第一方事件。
 */
function sendFirstPartyEvent(event: AnalyticsEvent): void {
  // 只在生產網域上報：localhost、預覽域和任何鏡像都不寫入資料集。
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
    // sendBeacon 不可用時降級為 keepalive fetch。
  }

  void fetch(CLIENT_RUNTIME.analyticsEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // 統計永遠不影響教學、小遊戲或回饋流程。
  })
}

export function trackAnalyticsEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return
  sendFirstPartyEvent(event)
}
