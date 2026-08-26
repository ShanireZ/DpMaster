export const PUBLIC_CONTENT_SIGNAL = Object.freeze({
  'ai-train': 'yes',
  search: 'yes',
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
