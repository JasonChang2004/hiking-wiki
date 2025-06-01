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
  <!-- 網站主標題區域 - 山林主題重新設計 -->
  <header class="mountain-header">
    <div class="header-background"></div>
    <div class="header-content">
      <a href="/" class="main-title-link" @click.prevent="$router.push('/')">
        <div class="title-container">
          <div class="mountain-icon">🏔️</div>
          <div class="title-text">
            <h1 class="main-title">台灣山林知識庫</h1>
            <p class="main-subtitle">Taiwan Mountain Knowledge Base</p>
          </div>
        </div>
      </a>
    </div>
  </header>

  <!-- 導航欄區域 - 現代玻璃效果 -->
  <nav class="navigation-bar">
    <div class="nav-background"></div>
    <div class="nav-content">
      <div class="nav-container">
        <!-- 導航項目 -->
        <div class="nav-items">
          <router-link to="/" exact class="nav-link" active-class="router-link-active">
            <span class="nav-icon">🏠</span>
            <span class="nav-text">首頁</span>
          </router-link>
          <router-link to="/about" class="nav-link" active-class="router-link-active">
            <span class="nav-icon">ℹ️</span>
            <span class="nav-text">關於</span>
          </router-link>
          <router-link to="/category/所有文章" class="nav-link" active-class="router-link-active">
            <span class="nav-icon">📚</span>
            <span class="nav-text">知識庫</span>
          </router-link>
        </div>
        
        <!-- 用戶區域 -->
        <div class="user-area">
          <LoginButton />
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* 主標題區域 - 山林主題重新設計 */
.mountain-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  z-index: 1000;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    #15803d 0%,     /* 古木深綠 */
    #22c55e 35%,    /* 主要綠色 */
    #16a34a 70%,    /* 深山翠綠 */
    #15803d 100%    /* 古木深綠 */
  );
  background-size: 400% 400%;
  animation: gradientShift 8s ease-in-out infinite;
}

.header-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:1" /></linearGradient></defs><polygon fill="url(%23grad)" points="0,20 100,0 100,20"/></svg>');
  background-size: 100px 20px;
  animation: mountainPattern 20s linear infinite;
  opacity: 0.3;
}

.header-content {
  position: relative;
  height: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.main-title-link {
  display: block !important;
  text-decoration: none !important;
  color: white !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  padding: 0.5rem !important;
  border-radius: 1rem !important;
}

.main-title-link:hover,
.main-title-link:visited,
.main-title-link:active,
.main-title-link:focus {
  text-decoration: none !important;
  color: white !important;
  transform: scale(1.02) !important;
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
}

.mountain-icon {
  font-size: 3rem;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.title-text {
  display: flex;
  flex-direction: column;
}

.main-title {
  font-size: clamp(1.875rem, 4vw, 2.5rem) !important;
  font-weight: 700 !important;
  color: white !important;
  margin: 0 !important;
  text-shadow: 2px 2px 8px rgba(0,0,0,0.3) !important;
  letter-spacing: 0.02em !important;
  font-family: var(--font-display) !important;
  line-height: 1.1 !important;
}

.main-subtitle {
  font-size: clamp(0.75rem, 2vw, 0.875rem) !important;
  color: rgba(255,255,255,0.95) !important;
  margin: 0.25rem 0 0 0 !important;
  font-weight: 400 !important;
  letter-spacing: 0.05em !important;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.2) !important;
}

/* 強制確保導航文字和圖標始終顯示 */
.nav-link * {
  opacity: 1 !important;
  visibility: visible !important;
  display: inline-block !important;
}

.nav-link .nav-text,
.nav-link .nav-icon {
  opacity: 1 !important;
  visibility: visible !important;
  display: inline-block !important;
  color: inherit !important;
}

/* 導航欄區域 - 玻璃morphism效果 */
.navigation-bar {
  position: fixed;
  top: 100px;
  left: 0;
  right: 0;
  height: 60px;
  z-index: 999;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.nav-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(34, 197, 94, 0.2);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.nav-content {
  position: relative;
  height: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  z-index: 10;
}

.nav-container {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  height: 100% !important;
  width: 100% !important;
}

.nav-items {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  flex-shrink: 0 !important;
}

.nav-link {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  padding: 0.5rem 1rem !important;
  color: var(--stone-dark) !important;
  text-decoration: none !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  white-space: nowrap !important;
  border-radius: 0.75rem !important;
  transition: all 0.3s ease !important;
  position: relative !important;
  background: transparent !important;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--mountain-primary), var(--mountain-secondary));
  border-radius: 0.75rem;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: -1;
}

.nav-link:hover::before {
  opacity: 0.1;
}

.nav-link:hover {
  text-decoration: none !important;
  color: var(--mountain-accent) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px rgba(34, 197, 94, 0.15) !important;
}

.nav-link.active,
.nav-link.router-link-active {
  color: white !important;
  background: linear-gradient(135deg, #16a34a, #15803d) !important;
  box-shadow: 0 4px 8px rgba(34, 197, 94, 0.3) !important;
  font-weight: 600 !important;
  border: 1px solid #15803d !important;
}

.nav-link.active::before,
.nav-link.router-link-active::before {
  opacity: 0;
}

/* 強制選中狀態的文字樣式 */
.nav-link.router-link-active .nav-text,
.nav-link.active .nav-text,
.nav-link.router-link-exact-active .nav-text {
  color: white !important;
  display: inline-block !important;
  font-family: var(--font-display) !important;
  flex-shrink: 0 !important;
  opacity: 1 !important;
  visibility: visible !important;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5) !important;
  background: none !important;
}

.nav-link.router-link-active .nav-icon,
.nav-link.active .nav-icon,
.nav-link.router-link-exact-active .nav-icon {
  color: white !important;
  font-size: 1rem !important;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5)) !important;
  flex-shrink: 0 !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.nav-icon {
  font-size: 1rem !important;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1)) !important;
  flex-shrink: 0 !important;
  color: inherit !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.nav-text {
  font-family: var(--font-display) !important;
  flex-shrink: 0 !important;
  color: inherit !important;
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
}

.user-area {
  display: flex !important;
  align-items: center !important;
  margin-left: auto !important;
}

/* 動畫效果 */
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes mountainPattern {
  0% { transform: translateX(0); }
  100% { transform: translateX(100px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(2deg); }
}

/* 響應式設計 - 修正文字隱藏問題 */
@media (max-width: 768px) {
  /* 移動端保留標題，但隱藏導航欄 */
  .mountain-header {
    display: block !important;
    height: 80px;
  }
  
  .navigation-bar {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
    position: absolute !important;
    top: -9999px !important;
  }
  
  /* 標題區域移動端優化 */
  .title-container {
    gap: 0.75rem;
  }
  
  .mountain-icon {
    font-size: 2rem;
  }
}

/* 只在桌面端顯示的備用規則 */
@media (min-width: 769px) {
  .mountain-header {
    display: block !important;
    height: 100px;
  }
  
  .navigation-bar {
    display: block !important;
    top: 100px;
    height: 60px;
  }
}

/* 無障礙設計 */
@media (prefers-reduced-motion: reduce) {
  .main-title-link,
  .nav-link,
  .mountain-icon,
  .header-background,
  .header-background::before {
    animation: none !important;
    transition: none !important;
  }
}

/* 高對比度模式 */
@media (prefers-contrast: high) {
  .header-background {
    background: #16a34a;
  }
  
  .nav-background {
    background: rgba(255, 255, 255, 0.95);
    border-bottom: 2px solid #16a34a;
  }
  
  .nav-link {
    color: #000000 !important;
  }
  
  .nav-link.active {
    background: #16a34a !important;
    color: #ffffff !important;
  }
}
</style>
