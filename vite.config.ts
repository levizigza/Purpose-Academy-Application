import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const pagesBase = process.env.GITHUB_PAGES === 'true' ? '/Purpose-Academy-Application/' : '/'

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
