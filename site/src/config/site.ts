export const BRAND = Object.freeze({
  name: 'DP大师',
  subtitle: 'DP Master',
  /** 結構化資料裡的發佈者 Organization，單一主體。 */
  owner: 'AzureL蔚澜算法',
})

export interface SiteConfig {
  origin: string
  /** `<html lang>` 與結構化資料的 inLanguage。單語言站台用不帶地區的指令碼標籤。 */
  language: 'zh-Hans'
}

/**
 * 站台只有一個網域、一個發佈目標（Cloudflare Worker）。
 * 2026-08 起下線國內區域站與舊的雙域佈局，因此不再有區域、語言備選連結與
 * 跨域端點的概念：canonical 自指，API 一律同源。遷移始末見 deploy.md。
 */
export const SITE: SiteConfig = Object.freeze({
  origin: 'https://dp.round1.cc',
  language: 'zh-Hans',
})

export const SITE_ORIGIN = SITE.origin
