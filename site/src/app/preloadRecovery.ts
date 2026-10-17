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
 * 「動態 import 沒取到」在各瀏覽器裡的措辭互不相同，且在部分懶載入場景下模組未匯出
 * 或回傳異常時，React.lazy 會拋出 `reading 'default'` 的 TypeError，而我們只能拿到 message。
 *
 * Chrome/Edge：Failed to fetch dynamically imported module: <url> / Cannot read properties of undefined (reading 'default')
 * Firefox：    error loading dynamically imported module: <url>
 * Safari：     Importing a module script failed. / Failed to load module script... / undefined is not an object (evaluating '...default')
 *
 * 判據刻意只認這幾種「取不到模組/懶載入模組異常」的措辭，不認泛化的網路錯誤 —— 自動刷新只對
 * 「資源當時拿不到」有意義；元件自己拋的執行環境異常刷多少次都一樣，那種情況必須
 * 留給錯誤邊界的人工路徑，否則就是拿刷新去掩蓋真 bug。
 */
const MODULE_LOAD_FAILURE =
  /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|failed to load module script|Cannot read properties of undefined \(reading ['"]default['"]\)|Cannot read property ['"]default['"] of undefined|undefined is not an object \(evaluating ['"].*default['"]\)/iu

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
 * 一次 build × 一條路徑，只發放**一個**自動刷新額度。
 *
 * ★ 兩條恢復路徑（Vite 的 `vite:preloadError` 與錯誤邊界的備援）共用同一把鎖，
 *   否則同一次失敗會被刷兩次。額度用盡後一律退回人工路徑 —— 資源真的消失時，
 *   「刷新 → 還是取不到 → 再刷新」就是一個無限循環，而它在生產上表現為整站打不開。
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
    // preventDefault 必須在 reload 之前：它阻止 Vite 把這個錯誤重新拋出去，
    // 否則錯誤邊界會在刷新真正發生之前先把失敗卡片畫出來。
    event.preventDefault()
    recovery.reload()
  }
}

function readSessionStorage(): PreloadRecoveryStorage | null {
  try {
    return window.sessionStorage
  } catch {
    // 部分隱私模式會禁用 sessionStorage；此時不冒險自動刷新，以免形成循環。
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
 * 錯誤邊界的備援入口：只預定額度、不刷新，把「什麼時候刷」留給呼叫方，
 * 這樣它可以先把這次自動恢復上報出去 —— 靜默刷新會讓告警變安靜，
 * 而告警變安靜與故障消失是兩回事。
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
