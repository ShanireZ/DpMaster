export function clientErrorFile(value: string): string {
  if (typeof window === 'undefined') return ''
  try {
    const url = new URL(value, window.location.origin)
    if (url.origin !== window.location.origin) return ''
    return /^\/assets\/[\w.-]+\.js$/u.test(url.pathname) ? url.pathname.slice(0, 120) : ''
  } catch {
    return ''
  }
}

export function clientErrorFrame(error: unknown): string {
  if (!error || typeof error !== 'object' || !('stack' in error) || typeof error.stack !== 'string') return ''
  for (const match of error.stack.matchAll(/(https?:\/\/[^\s)]+):(\d+):(\d+)/gu)) {
    const file = clientErrorFile(match[1])
    if (file) return `${file}:${match[2]}:${match[3]}`.slice(0, 120)
  }
  return ''
}
