import { createApp } from 'vue'
import App from './App.vue'
// 合併樣式導入，減少 HTTP 請求
import './assets/index.css'
import './assets/wiki-theme.css'
import './assets/globals.css'

import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

// 開發模式下的調試工具
if (import.meta.env.DEV) {
  import('./firebase').then(({ db }) => {
    import('firebase/firestore').then(({ collection, getDocs, query, orderBy }) => {
      // 全域調試函數
      (window as any).debugFirebaseArticles = async () => {
        try {
          console.log('🔍 開始檢查 Firebase 文章資料...')
          
          // 查詢所有文章（不過濾狀態）
          const allQuery = query(collection(db, 'articles'), orderBy('createdAt', 'desc'))
          const allSnapshot = await getDocs(allQuery)
          const allArticles = allSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          
          console.log(`📊 總共找到 ${allArticles.length} 篇文章`)
          
          // 按狀態分組
          const statusGroups = allArticles.reduce((groups: any, article: any) => {
            const status = article.status || 'unknown'
            if (!groups[status]) groups[status] = []
            groups[status].push(article)
            return groups
          }, {})
          
          Object.entries(statusGroups).forEach(([status, articles]) => {
            console.log(`📝 狀態「${status}」: ${(articles as any[]).length} 篇`)
            ;(articles as any[]).forEach((article: any, index: number) => {
              console.log(`  ${index + 1}. ${article.title} (分類: ${article.category})`)
            })
          })
          
          return allArticles
        } catch (error) {
          console.error('❌ 檢查文章資料失敗:', error)
        }
      }
      
      console.log('🛠️ 調試工具已載入，使用 debugFirebaseArticles() 檢查文章資料')
    })
  })
}

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
    path: '/login', 
    component: () => import('./views/Login.vue'),
    meta: { title: '登入 - 台灣登山知識庫' }
  },
  { 
    path: '/review', 
    component: () => import('./views/Review.vue'),
    meta: { title: '審核文章 - 台灣登山知識庫', requiresAuth: true }
  },  { 
    path: '/articles/:id', 
    name: 'ArticleDetail',
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
  },  { 
    path: '/submit-article',
    name: 'SubmitArticle', 
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
  routes,  // 優化滾動行為
  scrollBehavior(_, _from, savedPosition) {
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
