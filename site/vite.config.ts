import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  const region = process.env.DP_SITE_REGION === 'china' ? 'china' : 'international'
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SITE_REGION': JSON.stringify(region),
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
      manifest: true,
      chunkSizeWarningLimit: 760,
    },
    server: {
      port: 5173,
      host: true,
    },
  }
})
