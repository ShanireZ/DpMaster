/**
 * 把 UA-CH 的 platform + platformVersion 翻成人能讀的系統名。
 *
 * ★ Windows 的 `platformVersion` 不是營銷版本號，而是
 * `Windows.Foundation.UniversalApiContract` 的版本 —— 所以 Windows 11 會報
 * 「15.0」這種看不出所以然的數字，維護者拿到回饋也認不出是什麼系統。
 *
 * 分檔照抄微軟官方範例程式碼
 * （learn.microsoft.com/microsoft-edge/web-platform/how-to-detect-win11，
 * 2026-06 版）：`>= 13` → Windows 11，`> 0` → Windows 10，`0` → Win7/8/8.1。
 * 詳表裡 11 與 12 沒有列出，但官方範例把 0 與 13 之間的值統一歸到 Windows 10，
 * 這裡跟著官方走，不另立第三種判法。
 * 官方範例把 `>= 13` 表述為「Windows 11 or later」；日後若有更新的 Windows
 * 發佈，需要回該文件核對是否新增了區間。
 *
 * 其他平台（macOS / Android / iOS）的 platformVersion 本身就是真實系統版本，
 * 原樣展示即可。
 *
 * ## 拿不到的東西（查證過，別再試）
 *
 * - **Windows 的功能更新號（22H2 / 24H2 / 26H2…）拿不到。** 微軟的映射表把
 *   Win10 的每個功能更新單列（1507→1 … 21H2→10），但整個 Windows 11 只寫作
 *   「13+」，沒有公佈逐個功能更新的對應關係。憑 platformVersion 反推 26H2
 *   只能靠猜，不做。
 * - **Linux 完全拿不到版本，更拿不到發行版名。** MDN 明確寫著
 *   Sec-CH-UA-Platform-Version 「The version string on Linux is always empty」，
 *   這是 UA-CH 刻意做的隱私凍結。所以「Ubuntu 26.04 LTS」這類標籤無法實作，
 *   Linux 只會顯示 `Linux`。
 */
export function platformLabel(platform: string, platformVersion: string): string {
  if (!platform) return ''
  if (platform !== 'Windows') {
    return platformVersion ? `${platform} ${platformVersion}` : platform
  }
  const major = Number.parseInt(platformVersion.split('.')[0], 10)
  if (!Number.isFinite(major)) return platform
  if (major >= 13) return 'Windows 11'
  if (major > 0) return 'Windows 10'
  return 'Windows 7/8/8.1'
}
