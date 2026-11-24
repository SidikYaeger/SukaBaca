import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 5175;
const apiTarget = process.env.SUKABACA_API_URL || 'http://localhost:8080';
const allowedHosts = ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.io'];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared')
    }
  },
  server: {
    port,
    strictPort: true,
    host: true,
    allowedHosts,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true
      }
    }
  },
  preview: {
    port,
    strictPort: true,
    host: true,
    allowedHosts,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
