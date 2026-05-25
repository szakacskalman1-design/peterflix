import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // `--host` módban (mobil tesztelés) minden eszközről elérhető
    proxy: {
      // REST API
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // WebSocket — ws://192.168.x.x:5173/ws → ws://localhost:3001
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
