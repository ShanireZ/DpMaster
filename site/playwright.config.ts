import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: './tests/browser',
  forbidOnly: Boolean(process.env.CI),
  reporter: 'line',
  workers: 4,
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
      use: { ...devices['Desktop Safari'] },
    },
  ],
})
