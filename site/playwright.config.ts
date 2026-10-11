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
      // 测试超时包含 fixture。Windows 上的 Playwright WebKit 每起一个子进程（网络进程、每页的
      // WebContent 进程）实测约 4 秒，空闲也一样；retain-on-failure 的 trace 快照又让 WebKit 每步
      // 慢 4–5 倍。本地 4 worker 全量跑时这些开销再翻倍，30 秒默认值下 11 轮挂 3 轮（2026-10-11）。
      // 各段实测最坏值合计约 43 秒，取 60 秒；断言仍用默认 expect 超时，只放宽整条测试的上限。
      timeout: 60_000,
      use: { ...devices['Desktop Safari'] },
    },
  ],
})
