import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { logger } from '@/utils/logger'

// 樣式導入 - 按優先級順序
import './assets/index.css'
import './assets/wiki-theme.css'
import './assets/globals.css'

// 路由配置
const routes = [
  { 
    path: '/', 
    component: () => import('./views/Home.vue'),
    meta: { title: '首頁 - 台灣登山知識庫' }
  },
  { 
    path: '/about', 
    component: () => import('./views/About.vue'),
    meta: { title: '關於我們 - 台灣登山知識庫' }
  },
  { 
    path: '/knowledge', 
    component: () => import('./views/Knowledge.vue'),
    meta: { title: '知識庫 - 台灣登山知識庫' }
  },
  { 
    path: '/login', 
    component: () => import('./views/Login.vue'),
    meta: { title: '登入 - 台灣登山知識庫' }
  },
  { 
    path: '/review', 
    component: () => import('./views/Review.vue'),
    meta: { 
      title: '審核文章 - 台灣登山知識庫', 
      requiresAuth: true,
      requiresAdmin: true 
    }
  },
  { 
    path: '/articles/:id', 
    name: 'ArticleDetail',
    component: () => import('./views/ArticleDetail.vue'),
    meta: { title: '文章詳情 - 台灣登山知識庫' },
    props: true // 將路由參數作為props傳遞
  },
  { 
    path: '/category/:name', 
    name: 'Category',
    component: () => import('./views/Category.vue'),
    meta: { title: '分類瀏覽 - 台灣登山知識庫' },
    props: true
  },
  { 
    path: '/my-articles', 
    component: () => import('./views/MyArticles.vue'),
    meta: { 
      title: '我的投稿 - 台灣登山知識庫', 
      requiresAuth: true 
    }
  },
  { 
    path: '/admin', 
    component: () => import('./views/AdminPanel.vue'),
    meta: { 
      title: '管理員面板 - 台灣登山知識庫', 
      requiresAuth: true, 
      requiresAdmin: true 
    }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('./views/Notifications.vue'),
    meta: { 
      title: '通知中心 - 台灣登山知識庫', 
      requiresAuth: true 
    }
  },
  { 
    path: '/submit-article',
    name: 'SubmitArticle', 
    component: () => import('./views/SubmitArticlePage.vue'),
    meta: { 
      title: '投稿文章 - 台灣登山知識庫', 
      requiresAuth: true 
    }
  },
  // 404 頁面 - 必須放在最後
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('./views/NotFound.vue'),
    meta: { title: '頁面不存在 - 台灣登山知識庫' }
  }
]

// 創建路由器
const router = createRouter({
  history: createWebHistory(),
  routes,
  // 優化的滾動行為
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（例如從瀏覽器歷史返回）
    if (savedPosition) {
      return new Promise((resolve) => {
        // 延遲讓頁面完全載入
        setTimeout(() => {
          resolve(savedPosition)
        }, 100)
      })
    }
    
    // 如果是錨點連結
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const element = document.querySelector(to.hash)
          if (element) {
            resolve({
              el: to.hash,
              behavior: 'smooth',
              top: 80 // 考慮導航欄高度
            })
          } else {
            resolve({ top: 0 })
          }
        }, 100)
      })
    }
    
    // 同一頁面內的路由變化（例如分頁）
    if (to.path === from.path && JSON.stringify(to.query) !== JSON.stringify(from.query)) {
      return false // 保持當前位置
    }
    
    // 其他情況滾動到頂部
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          top: 0, 
          behavior: 'smooth' 
        })
      }, 100)
    })
  }
})

// 路由守衛 - 更新頁面標題和處理認證
router.beforeEach((to, _from, next) => {
  // 更新頁面標題
  document.title = (to.meta.title as string) || '台灣登山知識庫'
  
  // 這裡可以添加認證檢查邏輯
  // 如果需要認證但用戶未登入，重定向到登入頁
  if (to.meta.requiresAuth) {
    // TODO: 實現認證檢查
    // 暫時允許所有請求通過
  }
  
  next()
})

// 路由錯誤處理
router.onError((error) => {
  logger.error('路由錯誤', error, 'Router')
})

// 創建應用
const app = createApp(App)

// 全域錯誤處理
app.config.errorHandler = (err, _instance, info) => {
  logger.error('Vue應用錯誤', { err, info }, 'Vue')
}

// 全域警告處理 (僅開發環境)
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, _instance, trace) => {
    logger.warn('Vue警告', { msg, trace }, 'Vue')
  }
}

// 註冊插件
app.use(createPinia())
app.use(router)

// 掛載應用
app.mount('#app')

// 開發環境調試工具
if (import.meta.env.DEV) {
  // 將有用的調試對象暴露到全域
  ;(window as any).__APP__ = {
    app,
    router,
    logger
  }
  
  logger.info('應用程式啟動完成', { 
    mode: import.meta.env.MODE,
    version: import.meta.env.VITE_APP_VERSION || '1.0.0'
  }, 'App')
}
