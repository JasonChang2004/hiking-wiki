import { createApp } from 'vue'
import App from './App.vue'
import './assets/index.css'
import './assets/theme.css'
import './assets/wiki-theme.css' // 導入維基風格的主題
import './assets/globals.css';

import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('./views/Home.vue') },
  { path: '/about', component: () => import('./views/About.vue') },
  { path: '/review', component: () => import('./views/Review.vue') },
  { path: '/articles/:id', component: () => import('./views/ArticleDetail.vue') },
  { path: '/category/:name', component: () => import('./views/Category.vue') },
  { path: '/my-articles', component: () => import('./views/MyArticles.vue') },
  { path: '/admin', component: () => import('./views/AdminPanel.vue') },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('./views/Notifications.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
