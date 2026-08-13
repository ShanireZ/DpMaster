export const BRAND = Object.freeze({
  name: 'DP大师',
  subtitle: 'DP Master',
  owner: 'AzureL蔚澜算法',
  slogan: '在算法的海洋中，我就是你的信标',
})

export type SiteRegion = 'international' | 'china'
export type AnalyticsProviderKind = 'cloudflare' | 'tencent-edgeone'
export type CloudflareWebAnalyticsDelivery = 'automatic' | 'static'

export interface CloudflareWebAnalyticsConfig {
  token: string
  delivery: CloudflareWebAnalyticsDelivery
}

export interface SiteConfig {
  region: SiteRegion
  origin: string
  hostname: string
  language: 'zh-Hans' | 'zh-CN'
  hreflang: 'zh-Hans' | 'zh-CN'
  analytics: {
    provider: AnalyticsProviderKind
    endpoint: string
    cloudflareWebAnalytics: CloudflareWebAnalyticsConfig
  }
  /** 反馈提交端点。.cc 直连 .cn（Cloudflare 出口到国内基础设施 TLS 不通），.cn 同源。 */
  feedbackEndpoint: string
}

export const SITE_CONFIGS: Readonly<Record<SiteRegion, SiteConfig>> = Object.freeze({
  international: {
    region: 'international',
    origin: 'https://dp.betaoi.cc',
    hostname: 'dp.betaoi.cc',
    language: 'zh-Hans',
    hreflang: 'zh-Hans',
    analytics: {
      provider: 'cloudflare',
      // .cc 的 Cloudflare 出口到国内基础设施 TLS 不通（525），统计与反馈
      // 由浏览器跨域直连 .cn 的 API（.cn 已加 CORS 白名单）。
      endpoint: 'https://dp.betaoi.cn/api/analytics',
      cloudflareWebAnalytics: {
        token: '',
        delivery: 'automatic',
      },
    },
    feedbackEndpoint: 'https://dp.betaoi.cn/api/feedback',
  },
  china: {
    region: 'china',
    origin: 'https://dp.betaoi.cn',
    hostname: 'dp.betaoi.cn',
    language: 'zh-CN',
    hreflang: 'zh-CN',
    analytics: {
      provider: 'tencent-edgeone',
      endpoint: '/api/analytics',
      cloudflareWebAnalytics: {
        token: 'c113fb69d7e84d38a645c5160f6f1bda',
        delivery: 'static',
      },
    },
    feedbackEndpoint: '/api/feedback',
  },
})

export const DEFAULT_SITE_REGION: SiteRegion = 'international'
export const SITE_ORIGIN = SITE_CONFIGS[DEFAULT_SITE_REGION].origin

export function getSiteConfig(region: SiteRegion): SiteConfig {
  return SITE_CONFIGS[region]
}

export function siteRegionFromHostname(hostname: string): SiteRegion | undefined {
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, '')
  if (normalized === SITE_CONFIGS.international.hostname) return 'international'
  if (normalized === SITE_CONFIGS.china.hostname) return 'china'
  return undefined
}

function buildRegion(): SiteRegion {
  const value = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
    ?.VITE_SITE_REGION
  return value === 'china' ? 'china' : DEFAULT_SITE_REGION
}

export function getRuntimeSiteConfig(): SiteConfig {
  const hostname = typeof window === 'undefined' ? '' : window.location.hostname
  return getSiteConfig(siteRegionFromHostname(hostname) ?? buildRegion())
}
