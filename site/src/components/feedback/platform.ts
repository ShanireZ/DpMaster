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
