import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Porta do backend (mesma de backend/src/config.ts). Em produção o proxy é o nginx (nginx.conf).
const API_TARGET = process.env.API_TARGET ?? 'http://127.0.0.1:3334';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    port: 5174,
    strictPort: true,
    // escuta em IPv4 e IPv6: funciona com localhost, 127.0.0.1 ou ::1
    host: true,
    // o front chama /api no mesmo endereço e o Vite repassa ao backend (sem CORS, sem porta errada)
    proxy: { '/api': { target: API_TARGET, changeOrigin: true } },
  },
});
