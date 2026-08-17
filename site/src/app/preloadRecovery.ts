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

/**
 * 「动态 import 没取到」在各浏览器里的措辞互不相同，而我们只能拿到 message。
 *
 * Chrome/Edge：Failed to fetch dynamically imported module: <url>
 * Firefox：    error loading dynamically imported module: <url>
 * Safari：     Importing a module script failed. / Failed to load module script...
 *
 * 判据刻意只认这几种「取不到模块」的措辞，不认泛化的网络错误 —— 自动刷新只对
 * 「资源当时拿不到」有意义；组件自己抛的运行时异常刷多少次都一样，那种情况必须
 * 留给错误边界的人工路径，否则就是拿刷新去掩盖真 bug。
 */
const MODULE_LOAD_FAILURE =
  /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|failed to load module script/iu

export function isModuleLoadError(error: unknown): boolean {
  return error instanceof Error && MODULE_LOAD_FAILURE.test(error.message)
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

/**
 * 一次 build × 一条路径，只发放**一个**自动刷新额度。
 *
 * ★ 两条恢复路径（Vite 的 `vite:preloadError` 与错误边界的兜底）共用同一把锁，
 *   否则同一次失败会被刷两次。额度用尽后一律退回人工路径 —— 资源真的消失时，
 *   「刷新 → 还是取不到 → 再刷新」就是一个无限循环，而它在生产上表现为整站打不开。
 */
export function createModuleLoadRecovery(options: PreloadRecoveryOptions) {
  const recoveryKey = `dp:preload-recovery:${options.buildId}:${options.pathname}`
  return {
    reserve: (): boolean => reserveRecoveryAttempt(options.storage, recoveryKey),
    reload: options.reload,
  }
}

export function createVitePreloadRecoveryHandler(
  options: PreloadRecoveryOptions,
) {
  const recovery = createModuleLoadRecovery(options)

  return (event: Event) => {
    if (!recovery.reserve()) return
    // preventDefault 必须在 reload 之前：它阻止 Vite 把这个错误重新抛出去，
    // 否则错误边界会在刷新真正发生之前先把失败卡片画出来。
    event.preventDefault()
    recovery.reload()
  }
}

function readSessionStorage(): PreloadRecoveryStorage | null {
  try {
    return window.sessionStorage
  } catch {
    // 部分隐私模式会禁用 sessionStorage；此时不冒险自动刷新，以免形成循环。
    return null
  }
}

function browserRecovery() {
  return createModuleLoadRecovery({
    buildId: import.meta.env.VITE_BUILD_ID || 'local',
    pathname: window.location.pathname,
    reload: () => {
      window.location.reload()
    },
    storage: readSessionStorage(),
  })
}

/**
 * 错误边界的兜底入口：只预定额度、不刷新，把「什么时候刷」留给调用方，
 * 这样它可以先把这次自动恢复上报出去 —— 静默刷新会让告警变安静，
 * 而告警变安静与故障消失是两回事。
 */
export function reserveModuleLoadRecovery(): boolean {
  if (typeof window === 'undefined') return false
  return browserRecovery().reserve()
}

export function installVitePreloadRecovery(): void {
  if (typeof window === 'undefined') return
  const handler = createVitePreloadRecoveryHandler({
    buildId: import.meta.env.VITE_BUILD_ID || 'local',
    pathname: window.location.pathname,
    reload: () => {
      window.location.reload()
    },
    storage: readSessionStorage(),
  })
  window.addEventListener('vite:preloadError', handler)
}
