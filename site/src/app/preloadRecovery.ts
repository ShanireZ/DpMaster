interface PreloadRecoveryStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

interface PreloadRecoveryOptions {
  buildId: string
  pathname: string
  reload: () => void
  storage: PreloadRecoveryStorage | null
}

function reserveRecoveryAttempt(
  storage: PreloadRecoveryStorage | null,
  key: string,
): boolean {
  if (!storage) return false
  try {
    if (storage.getItem(key) === '1') return false
    storage.setItem(key, '1')
    return true
  } catch {
    return false
  }
}

export function createVitePreloadRecoveryHandler({
  buildId,
  pathname,
  reload,
  storage,
}: PreloadRecoveryOptions) {
  const recoveryKey = `dp:preload-recovery:${buildId}:${pathname}`

  return (event: Event) => {
    if (!reserveRecoveryAttempt(storage, recoveryKey)) return
    event.preventDefault()
    reload()
  }
}

export function installVitePreloadRecovery(): void {
  if (typeof window === 'undefined') return
  let storage: PreloadRecoveryStorage | null = null
  try {
    storage = window.sessionStorage
  } catch {
    // 部分隐私模式会禁用 sessionStorage；此时不冒险自动刷新，以免形成循环。
  }
  const handler = createVitePreloadRecoveryHandler({
    buildId: import.meta.env.VITE_BUILD_ID || 'local',
    pathname: window.location.pathname,
    reload: () => window.location.reload(),
    storage,
  })
  window.addEventListener('vite:preloadError', handler)
}
