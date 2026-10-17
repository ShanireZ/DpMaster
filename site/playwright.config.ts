import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: './tests/browser',
  forbidOnly: Boolean(process.env.CI),
  reporter: 'line',
  workers: process.env.CI ? 1 : 4,
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node scripts/preview.mjs --host 127.0.0.1 --port 4173 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-smoke',
      grep: /@cross-browser/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-smoke',
      grep: /@cross-browser/,
      // 測試超時包含 fixture。Windows 上的 Playwright WebKit 每起一個子處理程序（網路處理程序、每頁的
      // WebContent 處理程序）實測約 4 秒，空閒也一樣；retain-on-failure 的 trace 快照又讓 WebKit 每步
      // 慢 4–5 倍。本機 4 worker 全量跑時這些開銷再翻倍，30 秒預設值下 11 輪掛 3 輪（2026-10-11）。
      // 各段實測最壞值合計約 43 秒，取 60 秒；斷言仍用預設 expect 超時，只放寬整條測試的上限。
      timeout: 60_000,
      use: { ...devices['Desktop Safari'] },
    },
  ],
})
