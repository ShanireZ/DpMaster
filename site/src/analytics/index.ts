import { getRuntimeSiteConfig } from '../config/site.ts'
import type { AnalyticsProviderKind } from '../config/site.ts'

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

interface AnalyticsProvider {
  readonly name: AnalyticsProviderKind
  initialize(): void
  track(event: AnalyticsEvent): void
}

function sendFirstPartyEvent(
  provider: AnalyticsProviderKind,
  endpoint: string,
  event: AnalyticsEvent,
): void {
  const site = getRuntimeSiteConfig()
  const body = JSON.stringify({
    provider,
    event: event.event,
    path: event.path,
    title: event.title ?? '',
    metadata: {
      region: site.region,
      build: import.meta.env.VITE_BUILD_ID || 'local',
      ...(event.metadata ?? {}),
    },
    ts: new Date().toISOString(),
  })

  try {
    if (
      typeof navigator.sendBeacon === 'function' &&
      navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }))
    ) {
      return
    }
  } catch {
    // sendBeacon 不可用时降级为 keepalive fetch。
  }

  void fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // 统计永远不影响教学、小游戏或反馈流程。
  })
}

function cloudflareProvider(): AnalyticsProvider {
  const site = getRuntimeSiteConfig()
  return {
    name: 'cloudflare',
    initialize() {
      const webAnalytics = site.analytics.cloudflareWebAnalytics
      if (
        window.location.hostname !== site.hostname ||
        webAnalytics.delivery !== 'runtime' ||
        document.querySelector('script[data-dp-analytics="cloudflare"]')
      ) {
        return
      }
      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
      script.dataset.cfBeacon = JSON.stringify({ token: webAnalytics.token })
      script.dataset.dpAnalytics = 'cloudflare'
      document.body.append(script)
    },
    track(event) {
      sendFirstPartyEvent('cloudflare', site.analytics.endpoint, event)
    },
  }
}

function tencentEdgeOneProvider(): AnalyticsProvider {
  const site = getRuntimeSiteConfig()
  return {
    name: 'tencent-edgeone',
    initialize() {
      // Cloudflare Web Analytics 已在 EdgeOne HTML 产物中静态注入；
      // 站内路由、学习与反馈事件仍通过同源端点发送到 EdgeOne。
    },
    track(event) {
      sendFirstPartyEvent('tencent-edgeone', site.analytics.endpoint, event)
    },
  }
}

let activeProvider: AnalyticsProvider | undefined

function provider(): AnalyticsProvider | undefined {
  if (typeof window === 'undefined') return undefined
  if (!activeProvider) {
    activeProvider =
      getRuntimeSiteConfig().analytics.provider === 'cloudflare'
        ? cloudflareProvider()
        : tencentEdgeOneProvider()
    activeProvider.initialize()
  }
  return activeProvider
}

export function trackAnalyticsEvent(event: AnalyticsEvent): void {
  provider()?.track(event)
}
