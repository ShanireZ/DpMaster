import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Fast unit-test suite for pure logic + React components.
// Kept separate from the node `scripts/*.test.mjs` contract tests and the
// Playwright browser smoke tests (tests/browser).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
})
