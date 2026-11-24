import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = process.env.SUKABACA_API_URL || 'http://localhost:8080'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5173,
    host: true,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true
      }
    },
    allowedHosts: [
      'chemicals-survive-gravy.ngrok-free.dev',
      'calisthenic-erika-prostomial.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io',
      '.ngrok-free.app',
      'localhost',
      '127.0.0.1'
    ]
  },
  preview: {
    port: Number(process.env.PORT) || 5173,
    host: true,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true
      }
    },
    allowedHosts: [
      'chemicals-survive-gravy.ngrok-free.dev',
      'calisthenic-erika-prostomial.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io',
      '.ngrok-free.app',
      'localhost',
      '127.0.0.1'
    ]
  }
})
