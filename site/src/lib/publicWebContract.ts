/**
 * 已批准公開內容允許檢索、模型輸入與訓練。權威在倉內：round1.cc 的 Cloudflare
 * 託管 robots.txt 必須保持關閉，否則它會在邊緣注入 `ai-train=no` 與訓練類
 * `Disallow`，與這裡衝突。欄位順序即 header 順序。
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
