import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/codechef": {
        target: "https://code-chef-rating-api.vercel.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/codechef/, ""),
      },
      '/gfg': {
        target: 'https://gfg-ochre.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gfg/, '')
      },
      '/api/hackathons': {
        target: 'https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=15&oppstatus=open&quickApply=true&page=1',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/hackathons/, '')
      }
    }
  },
  define: {
    'process.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY),
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      
    },
  },
});