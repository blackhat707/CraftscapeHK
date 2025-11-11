import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env from root directory
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  return {
    root: './',
    server: {
      port: 5000,
      host: '0.0.0.0',
      hmr: {
        clientPort: 443,
        protocol: 'wss',
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
        '/debug': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '80323cac-9cf1-4503-afba-de3082d32504-00-2vq4n4lqc6zbv.sisko.replit.dev'
      ],
    },
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, '../shared'),
        '@shared/types': path.resolve(__dirname, '../shared/types'),
        '@shared/constants': path.resolve(__dirname, '../shared/constants'),
        '@shared/enums': path.resolve(__dirname, '../shared/enums'),
      },
      // Prefer TypeScript source files over compiled JS
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    // Optimize dependencies to handle shared TypeScript files
    optimizeDeps: {
      include: ['@shared/constants', '@shared/types', '@shared/enums'],
    }
  };
});
