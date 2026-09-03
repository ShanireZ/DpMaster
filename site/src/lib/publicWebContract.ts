/**
 * 权威在边缘：round1.cc 开着 Cloudflare 托管 robots.txt，它对全域声明
 * `search=yes,ai-train=no,use=reference`，本仓的响应头必须与它同向。
 * ai-input 托管块未点名，按 Content Signals 规范「未声明＝既不授予也不限制」，
 * 所以这里保留明确授予，不构成冲突。字段顺序即 header 顺序。
 */
export const PUBLIC_CONTENT_SIGNAL = Object.freeze({
  search: 'yes',
  'ai-train': 'no',
  'ai-input': 'yes',
})

export const CONTENT_SIGNAL_HEADER = Object.entries(PUBLIC_CONTENT_SIGNAL)
  .map(([name, value]) => `${name}=${value}`)
  .join(', ')

const MARKDOWN_ASSET_PREFIX = '/_representations/markdown'

export function markdownAssetPath(pathname: string): string {
  return pathname === '/'
    ? `${MARKDOWN_ASSET_PREFIX}/index.md`
    : `${MARKDOWN_ASSET_PREFIX}${pathname}.md`
}

export function markdownAssetRelativePath(pathname: string): string {
  return markdownAssetPath(pathname).slice(1)
}
