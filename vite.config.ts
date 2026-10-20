import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * GitHub project Pages: https://levizigza.github.io/Purpose-Academy-Application/
 * Override with PAGES_BASE=/ for a root-domain host if needed.
 */
const pagesBase = process.env.PAGES_BASE || '/Purpose-Academy-Application/'

export default defineConfig({
  base: pagesBase,
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
