import { handleAnalytics } from '../_analytics-core.js'

export const onRequestPost = (context) => handleAnalytics(context.request)
export const onRequestOptions = () => new Response(null, { status: 204 })
