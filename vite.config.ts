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
        pure_funcs: ['console.log', 'console.warn', 'console.info']
      },
      mangle: {
        safari10: true
      }
    },
    rollupOptions: {
      output: {
        // 優化的代碼分割策略
        manualChunks(id) {
          // 將 node_modules 分為不同的 chunk
          if (id.includes('node_modules')) {
            // Vue 生態系統
            if (id.includes('vue') || id.includes('pinia') || id.includes('@vue')) {
              return 'vue-vendor'
            }
            
            // Firebase 相關
            if (id.includes('firebase')) {
              return 'firebase-vendor'
            }
            
            // UI 和工具庫
            if (id.includes('marked') || id.includes('dompurify') || id.includes('quill')) {
              return 'ui-vendor'
            }
            
            // 其他第三方庫
            return 'vendor'
          }
          
          // 將大型組件分離
          if (id.includes('views/AdminPanel') || id.includes('views/SubmitArticlePage')) {
            return 'admin-pages'
          }
          
          if (id.includes('components/articles/') || id.includes('components/admin/')) {
            return 'feature-components'
          }
        },
        
        // 確保文件名包含 hash 以支持長期緩存
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'assets/images/[name]-[hash].[ext]'
          }
          
          if (/css/i.test(ext)) {
            return 'assets/css/[name]-[hash].[ext]'
          }
          
          return 'assets/[name]-[hash].[ext]'
        }
      }
    },
    // 啟用 gzip 壓縮
    reportCompressedSize: true,
    // chunk 大小警告閾值
    chunkSizeWarningLimit: 1000,
    // 啟用 CSS 代碼分割
    cssCodeSplit: true,
    // 生成 source map (僅在需要時啟用)
    sourcemap: false
  },
  // 開發服務器優化
  server: {
    port: 3000,
    open: true,
    cors: true,
    // 啟用 HMR
    hmr: {
      overlay: true
    },
    // 預熱常用文件
    warmup: {
      clientFiles: [
        './src/components/**/*.vue',
        './src/views/Home.vue',
        './src/composables/useAuth.ts'
      ]
    }
  },
  // 預覽服務器配置
  preview: {
    port: 4173,
    open: true,
    cors: true
  },
  // 優化依賴預構建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router', 
      'pinia',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/functions',
      'marked',
      'dompurify'
    ],
    // 排除不需要預構建的依賴
    exclude: ['@vueup/vue-quill']
  },
  // CSS 預處理器配置
  css: {
    devSourcemap: true
  },
  // 定義全局常量
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  // esbuild 優化
  esbuild: {
    // 生產環境移除所有 console 和 debugger
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
});
