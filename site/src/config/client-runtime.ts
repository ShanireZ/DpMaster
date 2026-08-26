import { SITE_ORIGIN } from './site.ts'

/** 仅由浏览器端、且已从公开表示证据排除的分支消费。 */
export const CLIENT_RUNTIME = Object.freeze({
  productionHostname: new URL(SITE_ORIGIN).hostname,
  analyticsEndpoint: '/api/analytics',
  feedbackEndpoint: '/api/feedback',
})
