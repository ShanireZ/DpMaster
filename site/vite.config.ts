import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { VITE_BASELINE_TARGETS } from './baseline-targets.ts'

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
      target: VITE_BASELINE_TARGETS,
      manifest: true,
      chunkSizeWarningLimit: 760,
    },
    server: {
      port: 5173,
      host: true,
    },
  }
})
