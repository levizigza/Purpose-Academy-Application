import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Custom domain (purposeacademy.ca) serves from site root.
 * Override with PAGES_BASE=/Purpose-Academy-Application/ only for project-page previews.
 */
const pagesBase = process.env.PAGES_BASE || '/'

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
