export const BRAND = Object.freeze({
  name: 'DP大师',
  subtitle: 'DP Master',
  /** 结构化数据里的发布者 Organization，单一主体。 */
  owner: 'AzureL蔚澜算法',
  /** 页脚版权行署名，与 `owner` 分开。 */
  copyrightHolder: 'Round1',
  slogan: '在算法的海洋中，我就是你的信标',
})

export interface SiteConfig {
  origin: string
  hostname: string
  /** `<html lang>` 与结构化数据的 inLanguage。单语言站点用不带地区的脚本标签。 */
  language: 'zh-Hans'
  /** 第一方统计端点，同源。 */
  analyticsEndpoint: string
  /** 反馈提交端点，同源。 */
  feedbackEndpoint: string
}

/**
 * 站点只有一个域名、一个发布目标（Cloudflare Worker）。
 * 2026-08 起下线国内区域站与旧的双域布局，因此不再有区域、语言备选链接与
 * 跨域端点的概念：canonical 自指，API 一律同源。迁移始末见 deploy.md。
 */
export const SITE: SiteConfig = Object.freeze({
  origin: 'https://dp.round1.cc',
  hostname: 'dp.round1.cc',
  language: 'zh-Hans',
  analyticsEndpoint: '/api/analytics',
  feedbackEndpoint: '/api/feedback',
})

export const SITE_ORIGIN = SITE.origin
