import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '127.0.0.1',
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_ORIGIN || 'http://127.0.0.1:5001',
          changeOrigin: true,
        },
      },
    },
  }
})
