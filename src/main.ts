import { createApp } from 'vue'
import App from './App.vue'
// 合併樣式導入，減少 HTTP 請求
import './assets/index.css'
import './assets/wiki-theme.css'
import './assets/globals.css'

import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

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
    path: '/review', 
    component: () => import('./views/Review.vue'),
    meta: { title: '審核文章 - 台灣登山知識庫', requiresAuth: true }
  },
  { 
    path: '/articles/:id', 
    component: () => import('./views/ArticleDetail.vue'),
    meta: { title: '文章詳情 - 台灣登山知識庫' }
  },
  { 
    path: '/category/:name', 
    component: () => import('./views/Category.vue'),
    meta: { title: '分類瀏覽 - 台灣登山知識庫' }
  },
  { 
    path: '/my-articles', 
    component: () => import('./views/MyArticles.vue'),
    meta: { title: '我的投稿 - 台灣登山知識庫', requiresAuth: true }
  },
  { 
    path: '/admin', 
    component: () => import('./views/AdminPanel.vue'),
    meta: { title: '管理員面板 - 台灣登山知識庫', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('./views/Notifications.vue'),
    meta: { title: '通知中心 - 台灣登山知識庫', requiresAuth: true }
  },
  { 
    path: '/submit-article', 
    component: () => import('./views/SubmitArticlePage.vue'),
    meta: { title: '投稿文章 - 台灣登山知識庫', requiresAuth: true }
  },
  // 404 頁面
  {
    path: '/:pathMatch(.*)*',
    component: () => import('./views/NotFound.vue'),
    meta: { title: '頁面不存在 - 台灣登山知識庫' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 優化滾動行為
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守衛 - 更新頁面標題
router.afterEach((to) => {
  document.title = to.meta.title as string || '台灣登山知識庫'
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
