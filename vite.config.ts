import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Redireciona todas as chamadas /api para o servidor Express
      // Isso elimina CORS e faz os cookies de sessão funcionarem automaticamente
      '/api': {
        // Em container "localhost" é o próprio container: o compose passa
        // host.docker.internal para alcançar a API rodando no host.
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
