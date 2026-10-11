/**
 * 已批准公开内容允许检索、模型输入与训练。权威在仓内：round1.cc 的 Cloudflare
 * 托管 robots.txt 必须保持关闭，否则它会在边缘注入 `ai-train=no` 与训练类
 * `Disallow`，与这里冲突。字段顺序即 header 顺序。
 */
export const PUBLIC_CONTENT_SIGNAL = Object.freeze({
  search: 'yes',
  'ai-train': 'yes',
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
