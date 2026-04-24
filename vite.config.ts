import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function getApiBaseUrl(mode: string, command: 'build' | 'serve') {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL || '';

  if (!apiBaseUrl && command === 'build' && mode === 'production') {
    throw new Error('Missing VITE_API_BASE_URL. Configure it before building for production.');
  }

  return apiBaseUrl || 'http://127.0.0.1:8000/api/v1';
}

export default defineConfig(({ command, mode }) => {
  const apiBaseUrl = getApiBaseUrl(mode, command);
  const proxyTarget = new URL(apiBaseUrl).origin;

  console.info('API base URL:', apiBaseUrl.replace(/\/+$/, ''));

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/webhooks': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
  };
});
