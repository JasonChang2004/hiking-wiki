import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 構建優化
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // 分離 Vue 核心庫
          vue: ['vue', 'vue-router', 'pinia'],
          // 分離 Firebase
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions'],
          // 分離 UI 庫
          ui: ['marked', 'dompurify'],
        },
      },
    },
    // 啟用 gzip 壓縮
    reportCompressedSize: true,
    // chunk 大小警告閾值
    chunkSizeWarningLimit: 1000,
  },
  // 開發服務器優化
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
  // 預覽服務器配置
  preview: {
    port: 4173,
    open: true,
  },
  // 優化依賴預構建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
});
