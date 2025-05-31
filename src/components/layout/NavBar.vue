<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { auth } from '@/firebase'
import { useNotificationsStore } from '@/store/notifications'
import LoginButton from '@/components/auth/LoginButton.vue'
import type { User } from 'firebase/auth'

const notificationsStore = useNotificationsStore()
const currentUser = ref<User | null>(null)
let unsubscribeAuth: (() => void) | null = null

onMounted(() => {
  currentUser.value = auth.currentUser
  
  // 強制重置通知計數
  notificationsStore.resetUnread()
  
  unsubscribeAuth = auth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? user.email : 'No user')
    currentUser.value = user
    
    // 每次認證狀態改變都重置計數
    notificationsStore.resetUnread()
    
    if (user) {
      console.log('User logged in, fetching notifications...')
      // 延遲一點時間確保用戶數據同步
      setTimeout(() => {
        notificationsStore.fetchUnreadCount()
      }, 500)
    }
  })
})

onUnmounted(() => {
  if (unsubscribeAuth) {
    unsubscribeAuth()
  }
})
</script>

<template>
  <!-- 網站主標題區域 - 完全獨立 -->
  <header class="website-header">
    <div class="max-w-6xl mx-auto px-4 py-4">
      <a href="/" class="main-title-link" @click.prevent="$router.push('/')">
        <h1 class="main-title">山林知識庫</h1>
        <p class="main-subtitle">Taiwan Mountain Knowledge Base</p>
      </a>
    </div>
  </header>

  <!-- 導航欄區域 - 完全獨立 -->
  <nav class="navigation-bar">
    <div class="max-w-6xl mx-auto px-4 py-2">
      <div class="nav-container">
        <!-- 導航項目 -->
        <div class="nav-items">
          <router-link to="/" exact class="wiki-nav-item" active-class="router-link-active">首頁</router-link>
          <router-link to="/about" class="wiki-nav-item" active-class="router-link-active">關於</router-link>
        </div>
        
        <!-- 用戶頭像 - 強制在最右邊 -->
        <div class="user-area">
          <LoginButton />
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* 重置所有 router-link 樣式影響 */
:deep(.router-link-active) {
  /* 不影響主標題 */
}

/* 網站主標題區域 - 獨立樣式 */
.website-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 1000;
  height: 110px; /* 固定高度 */
}

/* 主標題連結 - 完全隔離樣式 */
.main-title-link {
  display: block !important;
  text-decoration: none !important;
  text-align: center !important;
  color: white !important;
  transition: transform 0.2s ease !important;
  cursor: pointer !important;
}

.main-title-link:hover,
.main-title-link:visited,
.main-title-link:active,
.main-title-link:focus,
.main-title-link.router-link-active,
.main-title-link.router-link-exact-active {
  text-decoration: none !important;
  color: white !important;
  transform: scale(1.02) !important;
}

.main-title {
  font-size: 2.5rem !important;
  font-weight: 700 !important;
  color: white !important;
  margin: 0 !important;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3) !important;
  letter-spacing: 0.05em !important;
}

.main-subtitle {
  font-size: 0.9rem !important;
  color: rgba(255,255,255,0.9) !important;
  margin: 0.25rem 0 0 0 !important;
  font-weight: 300 !important;
  letter-spacing: 0.1em !important;
}

/* 導航欄區域 - 完全緊貼 */
.navigation-bar {
  position: fixed;
  top: 110px; /* 精確等於主標題高度 */
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  z-index: 999;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 0; /* 確保無邊距 */
  padding: 0; /* 確保無內距 */
}

/* 導航欄內部布局 */
.nav-container {
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  position: relative !important;
}

.nav-items {
  display: flex !important;
  align-items: center !important;
  gap: 0.25rem !important;
  flex-shrink: 0 !important;
}

/* 用戶區域強制推到最右邊 */
.user-area {
  margin-left: auto !important;
  display: flex !important;
  align-items: center !important;
  position: absolute !important;
  right: 0 !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

/* 導航項目樣式 - 只影響導航欄內的連結 */
.nav-items .wiki-nav-item {
  padding: 0.5rem 0.75rem !important;
  color: #0645ad !important;
  text-decoration: none !important;
  font-size: 0.95rem !important;
  white-space: nowrap !important;
  border-radius: 4px !important;
  transition: background-color 0.2s ease-in-out !important;
  display: inline-block !important;
}

.nav-items .wiki-nav-item:hover {
  text-decoration: none !important;
  background-color: #f0f6ff !important;
  color: #3366bb !important;
}

.nav-items .wiki-nav-item:visited {
  color: #0b0080 !important;
}

.nav-items .router-link-active,
.nav-items .wiki-nav-item.router-link-active {
  font-weight: 500 !important;
  background-color: #e1ebff !important;
  color: #0b0080 !important;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .main-title {
    font-size: 1.8rem !important;
  }
  
  .main-subtitle {
    font-size: 0.8rem !important;
  }
  
  .website-header {
    height: 90px; /* 手機版縮小 */
  }
  
  .navigation-bar {
    top: 90px; /* 手機版緊貼 */
  }
}

/* 無障礙功能 */
@media (prefers-reduced-motion: reduce) {
  .nav-items .wiki-nav-item,
  .main-title-link {
    transition: none !important;
  }
}
</style>
