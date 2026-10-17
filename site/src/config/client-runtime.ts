import { SITE_ORIGIN } from './site.ts'

/** 僅由瀏覽器端、且已從公開表示證據排除的分支消費。 */
export const CLIENT_RUNTIME = Object.freeze({
  productionHostname: new URL(SITE_ORIGIN).hostname,
  analyticsEndpoint: '/api/analytics',
  feedbackEndpoint: '/api/feedback',
})
