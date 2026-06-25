import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_API_BASE_URL || 'http://localhost:8000'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': { target: 'http://localhost:8000', changeOrigin: true },
        '/media': { target: 'http://localhost:8000', changeOrigin: true },
      },
    },
    optimizeDeps: {
      include: [
        'react-is', 'recharts', 'react-redux', '@reduxjs/toolkit',
        'react-router-dom', 'axios', 'framer-motion',
        'react-hot-toast', 'react-icons/fi',
      ],
    },
    define: {
      __API_BASE__: JSON.stringify(backendUrl),
    },
  }
})
