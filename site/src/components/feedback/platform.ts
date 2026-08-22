/**
 * 把 UA-CH 的 platform + platformVersion 翻成人能读的系统名。
 *
 * ★ Windows 的 `platformVersion` 不是营销版本号，而是
 * `Windows.Foundation.UniversalApiContract` 的版本 —— 所以 Windows 11 会报
 * 「15.0」这种看不出所以然的数字，维护者拿到反馈也认不出是什么系统。
 *
 * 分档照抄微软官方示例代码
 * （learn.microsoft.com/microsoft-edge/web-platform/how-to-detect-win11，
 * 2026-06 版）：`>= 13` → Windows 11，`> 0` → Windows 10，`0` → Win7/8/8.1。
 * 详表里 11 与 12 没有列出，但官方示例把 0 与 13 之间的值统一归到 Windows 10，
 * 这里跟着官方走，不另立第三种判法。
 * 官方示例把 `>= 13` 表述为「Windows 11 or later」；日后若有更新的 Windows
 * 发布，需要回该文档核对是否新增了区间。
 *
 * 其他平台（macOS / Android / iOS）的 platformVersion 本身就是真实系统版本，
 * 原样展示即可。
 *
 * ## 拿不到的东西（查证过，别再试）
 *
 * - **Windows 的功能更新号（22H2 / 24H2 / 26H2…）拿不到。** 微软的映射表把
 *   Win10 的每个功能更新单列（1507→1 … 21H2→10），但整个 Windows 11 只写作
 *   「13+」，没有公布逐个功能更新的对应关系。凭 platformVersion 反推 26H2
 *   只能靠猜，不做。
 * - **Linux 完全拿不到版本，更拿不到发行版名。** MDN 明确写着
 *   Sec-CH-UA-Platform-Version 「The version string on Linux is always empty」，
 *   这是 UA-CH 刻意做的隐私冻结。所以「Ubuntu 26.04 LTS」这类标签无法实现，
 *   Linux 只会显示 `Linux`。
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
