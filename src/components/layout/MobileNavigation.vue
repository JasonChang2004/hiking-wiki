<template>
  <div class="mobile-navigation">
    <!-- 底部導航欄 -->
    <nav class="bottom-navigation">
      <!-- 首頁 -->
      <router-link to="/" class="nav-item" exact>
        <span class="nav-icon">🏠</span>
        <span class="nav-label">首頁</span>
      </router-link>
      
      <!-- 搜索 -->
      <button @click="toggleSearch" class="nav-item" :class="{ 'active': showSearch }">
        <span class="nav-icon">🔍</span>
        <span class="nav-label">搜索</span>
      </button>
      
      <!-- 分類 -->
      <button @click="toggleCategories" class="nav-item" :class="{ 'active': showCategories }">
        <span class="nav-icon">📚</span>
        <span class="nav-label">分類</span>
      </button>
      
      <!-- 撰寫 -->
      <router-link to="/submit-article" class="nav-item">
        <span class="nav-icon">✍️</span>
        <span class="nav-label">撰寫</span>
      </router-link>
      
      <!-- 用戶（頭像+通知） -->
      <button @click="toggleUserMenu" class="nav-item user-nav-item" :class="{ 'active': showUserMenu }">
        <div class="user-avatar-container">
          <img 
            v-if="user && user.photoURL" 
            :src="user.photoURL" 
            :alt="user.displayName || '用戶頭像'"
            class="user-avatar"
            @error="handleAvatarError"
          />
          <div v-else class="user-avatar default-avatar">
            <span class="avatar-icon">👤</span>
          </div>
          <!-- 通知徽章 -->
          <div v-if="unreadCount > 0" class="notification-badge">
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </div>
        </div>
        <span class="nav-label">{{ user ? user.displayName?.split(' ')[0] || '用戶' : '登入' }}</span>
      </button>
    </nav>

    <!-- 搜索覆蓋層 -->
    <Transition name="search-overlay">
      <div v-if="showSearch" class="search-overlay">
        <div class="search-content">
          <div class="search-header">
            <h3 class="search-title">搜索登山知識</h3>
            <button @click="closeSearch" class="close-btn">✕</button>
          </div>
          <div class="search-input-container">
            <input 
              ref="searchInput"
              v-model="searchQuery" 
              type="text" 
              placeholder="輸入關鍵字搜索文章、路線、裝備..."
              class="search-input"
              @keyup.enter="performSearch"
            />
            <button @click="performSearch" class="search-submit-btn" :disabled="!searchQuery.trim()">
              搜索
            </button>
          </div>
          <div v-if="searchHistory.length > 0" class="search-history">
            <h4 class="history-title">最近搜索</h4>
            <div class="history-tags">
              <button 
                v-for="term in searchHistory" 
                :key="term"
                @click="searchQuery = term; performSearch()"
                class="history-tag"
              >
                {{ term }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 分類選單覆蓋層 -->
    <Transition name="overlay">
      <div 
        v-if="showCategories || showUserMenu" 
        class="menu-overlay"
        @click="closeAllMenus"
      ></div>
    </Transition>

    <!-- 分類選單 -->
    <Transition name="categories">
      <div v-if="showCategories" class="categories-menu">
        <div class="menu-header">
          <h3 class="menu-title">文章分類</h3>
          <button @click="closeAllMenus" class="close-btn">✕</button>
        </div>
        <div class="categories-grid">
          <router-link 
            v-for="category in categories" 
            :key="category.name"
            :to="`/category/${category.name}`"
            @click="closeAllMenus"
            class="category-item"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
          </router-link>
        </div>
      </div>
    </Transition>

    <!-- 用戶選單 -->
    <Transition name="user-menu">
      <div v-if="showUserMenu" class="user-menu">
        <div class="menu-header">
          <div class="user-info-header">
            <div class="user-avatar-large">
              <img 
                v-if="user && user.photoURL" 
                :src="user.photoURL" 
                :alt="user.displayName || '用戶頭像'"
                class="avatar-img"
              />
              <div v-else class="default-avatar-large">
                <span class="avatar-icon">👤</span>
              </div>
            </div>
            <div class="user-details">
              <h3 class="user-name">{{ user?.displayName || '訪客' }}</h3>
              <p class="user-email">{{ user?.email || '未登入' }}</p>
            </div>
          </div>
          <button @click="closeAllMenus" class="close-btn">✕</button>
        </div>
        <div class="user-menu-content">
          <div v-if="user" class="user-actions">
            <router-link to="/notifications" @click="closeAllMenus" class="menu-action">
              <span class="action-icon">🔔</span>
              <span class="action-text">通知</span>
              <span v-if="unreadCount > 0" class="action-badge">{{ unreadCount }}</span>
            </router-link>
            <router-link to="/profile" @click="closeAllMenus" class="menu-action">
              <span class="action-icon">👤</span>
              <span class="action-text">個人資料</span>
            </router-link>
            <router-link to="/my-articles" @click="closeAllMenus" class="menu-action">
              <span class="action-icon">📝</span>
              <span class="action-text">我的文章</span>
            </router-link>
            
            <!-- 管理員功能 -->
            <div v-if="isAdmin" class="admin-section">
              <div class="section-divider"></div>
              <div class="section-title">管理功能</div>
              
              <router-link to="/admin" @click="closeAllMenus" class="menu-action admin-action">
                <span class="action-icon admin-icon">⚙️</span>
                <div class="action-details">
                  <span class="action-text">系統管理</span>
                  <span class="action-desc">用戶與權限管理</span>
                </div>
                <div class="action-badges">
                  <span v-if="pendingCount > 0" class="action-badge admin-badge">{{ pendingCount }}</span>
                </div>
              </router-link>
              
              <router-link to="/admin/content" @click="closeAllMenus" class="menu-action admin-action">
                <span class="action-icon admin-icon">📋</span>
                <div class="action-details">
                  <span class="action-text">內容管理</span>
                  <span class="action-desc">文章審核與編輯</span>
                </div>
                <div class="action-badges">
                  <!-- 預留空間保持對齊 -->
                </div>
              </router-link>
            </div>
            
            <div class="section-divider"></div>
            <button @click="handleLogout" class="menu-action logout-action">
              <span class="action-icon">🚪</span>
              <span class="action-text">登出</span>
            </button>
          </div>
          <div v-else class="login-prompt">
            <LoginButton />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase'
import { signOut } from 'firebase/auth'
import { useNotificationsStore } from '@/store/notifications'
import { useAdminStore } from '@/store/admin'
import { ADMIN_UIDS } from '@/firebase/admins'
import LoginButton from '@/components/auth/LoginButton.vue'

const router = useRouter()
const notificationsStore = useNotificationsStore()
const adminStore = useAdminStore()

// 響應式狀態
const showSearch = ref(false)
const showCategories = ref(false)
const showUserMenu = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const user = ref(auth.currentUser)
const searchHistory = ref<string[]>(['登山路線', '雪山', '裝備推薦']) // 可以從localStorage載入

// 計算屬性
const unreadCount = computed(() => notificationsStore.unreadCount)
const isAdmin = computed(() => user.value && ADMIN_UIDS.includes(user.value.uid))
const pendingCount = computed(() => adminStore.pendingArticlesCount)

// 分類數據
const categories = [
  { name: '登山路線', icon: '🗻' },
  { name: '裝備心得', icon: '🎒' },
  { name: '登山知識', icon: '📚' },
  { name: '緊急應變', icon: '🚨' },
  { name: '野外生存', icon: '🏕️' },
  { name: '保育生態', icon: '🌱' },
  { name: '登山飲食', icon: '🍱' },
  { name: '入門指南', icon: '👣' }
]

// 切換搜索覆蓋層
const toggleSearch = async () => {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    closeAllMenus()
    // 防止背景滾動並保存當前滾動位置
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.dataset.scrollY = scrollY.toString()
    await nextTick()
    searchInput.value?.focus()
  } else {
    // 恢復滾動位置
    const scrollY = document.body.dataset.scrollY
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY))
    }
    delete document.body.dataset.scrollY
  }
}

// 關閉搜索
const closeSearch = () => {
  showSearch.value = false
  // 恢復滾動位置
  const scrollY = document.body.dataset.scrollY
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  if (scrollY) {
    window.scrollTo(0, parseInt(scrollY))
  }
  delete document.body.dataset.scrollY
}

// 切換分類選單
const toggleCategories = () => {
  showCategories.value = !showCategories.value
  if (showCategories.value) {
    showUserMenu.value = false
    showSearch.value = false
    // 防止背景滾動並保存當前滾動位置
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.dataset.scrollY = scrollY.toString()
  } else {
    // 恢復滾動位置
    const scrollY = document.body.dataset.scrollY
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY))
    }
    delete document.body.dataset.scrollY
  }
}

// 切換用戶選單
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value) {
    showCategories.value = false
    showSearch.value = false
    // 防止背景滾動並保存當前滾動位置
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.dataset.scrollY = scrollY.toString()
    // 載入通知數量
    if (user.value) {
      notificationsStore.fetchUnreadCount()
      // 如果是管理員，也載入待審核計數
      if (ADMIN_UIDS.includes(user.value.uid)) {
        adminStore.fetchPendingArticlesCount()
      }
    }
  } else {
    // 恢復滾動位置
    const scrollY = document.body.dataset.scrollY
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY))
    }
    delete document.body.dataset.scrollY
  }
}

// 關閉所有選單
const closeAllMenus = () => {
  showCategories.value = false
  showUserMenu.value = false
  showSearch.value = false
  // 恢復滾動位置
  const scrollY = document.body.dataset.scrollY
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  if (scrollY) {
    window.scrollTo(0, parseInt(scrollY))
  }
  delete document.body.dataset.scrollY
}

// 執行搜索
const performSearch = () => {
  if (searchQuery.value.trim()) {
    // 添加到搜索歷史
    const term = searchQuery.value.trim()
    if (!searchHistory.value.includes(term)) {
      searchHistory.value.unshift(term)
      searchHistory.value = searchHistory.value.slice(0, 5) // 保留最近5個
    }
    
    // 執行搜索邏輯
    console.log('搜索:', term)
    router.push(`/search?q=${encodeURIComponent(term)}`)
    closeSearch()
  }
}

// 處理頭像載入錯誤
const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// 處理登出
const handleLogout = async () => {
  try {
    await signOut(auth)
    closeAllMenus()
    router.push('/')
  } catch (error) {
    console.error('登出失敗:', error)
    alert('登出失敗，請稍後再試')
  }
}

// 監聽認證狀態變化
const unsubscribeAuth = auth.onAuthStateChanged((newUser) => {
  user.value = newUser
  if (newUser) {
    notificationsStore.fetchUnreadCount()
  } else {
    notificationsStore.resetUnread()
  }
})

// 監聽路由變化，關閉選單
const unwatch = router.afterEach(() => {
  closeAllMenus()
})

onMounted(() => {
  // 監聽ESC鍵關閉選單
  const handleEsc = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeAllMenus()
    }
  }
  document.addEventListener('keydown', handleEsc)
  
  // 載入通知數量
  if (user.value) {
    notificationsStore.fetchUnreadCount()
  }
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEsc)
    // 確保清理滾動狀態
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    delete document.body.dataset.scrollY
    unwatch()
    unsubscribeAuth()
  })
})
</script>

<style scoped>
.mobile-navigation {
  position: relative;
  z-index: 1000;
}

/* 底部導航欄 */
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(34, 197, 94, 0.1);
  padding: var(--space-xs) 0 calc(var(--space-xs) + env(safe-area-inset-bottom));
  z-index: 1001;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-xs);
  text-decoration: none;
  color: var(--stone-medium);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  touch-action: manipulation;
  position: relative;
}

.nav-item:hover,
.nav-item.active,
.nav-item.router-link-active {
  color: var(--mountain-primary);
  background: rgba(34, 197, 94, 0.1);
  border-radius: var(--space-sm);
}

.nav-item.router-link-active::after {
  content: '';
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: var(--mountain-primary);
  border-radius: 0 0 3px 3px;
}

.nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.nav-label {
  font-size: var(--text-xs);
  font-weight: 500;
  text-align: center;
}

/* 用戶頭像導航項目 */
.user-nav-item {
  position: relative;
}

.user-avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--mountain-primary);
  object-fit: cover;
}

.default-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--stone-medium);
  background: var(--stone-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 1rem;
  color: var(--stone-medium);
}

/* 通知徽章 */
.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  z-index: 10;
}

/* 搜索覆蓋層 */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1002;
  display: flex;
  align-items: flex-start;
  padding-top: var(--space-4xl);
  /* 防止滾動穿透 */
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.search-content {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  background: white;
  border-radius: var(--space-md);
  padding: var(--space-lg);
  margin-left: var(--space-md);
  margin-right: var(--space-md);
  animation: slideInDown 0.3s ease;
  /* 確保內容不會超出視窗 */
  max-height: calc(100vh - var(--space-4xl) * 2);
  max-height: calc(100dvh - var(--space-4xl) * 2);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  box-sizing: border-box;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.search-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--stone-dark);
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.2);
}

.search-input-container {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.search-input {
  flex: 1;
  padding: var(--space-md);
  border: 2px solid var(--stone-light);
  border-radius: var(--space-md);
  font-size: var(--text-base);
  background: white;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--mountain-primary);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.search-submit-btn {
  padding: var(--space-md) var(--space-lg);
  background: var(--mountain-primary);
  color: white;
  border: none;
  border-radius: var(--space-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.search-submit-btn:hover:not(:disabled) {
  background: var(--mountain-accent);
  transform: scale(1.05);
}

.search-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 搜索歷史 */
.search-history {
  border-top: 1px solid var(--stone-light);
  padding-top: var(--space-md);
}

.history-title {
  font-size: var(--text-sm);
  color: var(--stone-medium);
  margin-bottom: var(--space-sm);
  font-weight: 500;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.history-tag {
  padding: var(--space-xs) var(--space-sm);
  background: var(--stone-light);
  border: 1px solid var(--stone-medium);
  border-radius: var(--space-md);
  font-size: var(--text-sm);
  color: var(--stone-dark);
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-tag:hover {
  background: var(--mountain-primary);
  color: white;
  border-color: var(--mountain-primary);
}

/* 覆蓋層 */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1002;
}

/* 選單通用樣式 */
.categories-menu,
.user-menu {
  position: fixed;
  bottom: 72px; /* 底部導航高度 + 間距 */
  left: var(--space-md);
  right: var(--space-md);
  background: white;
  border-radius: var(--space-md);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1003;
  max-height: calc(100vh - 120px); /* 確保不超出螢幕 */
  max-height: calc(100dvh - 120px); /* 使用動態視窗高度 */
  overflow-y: auto;
  overflow-x: hidden; /* 防止水平滾動 */
  display: flex;
  flex-direction: column;
  width: auto; /* 確保自適應寬度 */
  max-width: calc(100vw - 2 * var(--space-md)); /* 防止超出螢幕寬度 */
  max-width: calc(100dvw - 2 * var(--space-md)); /* 使用動態視窗寬度 */
  /* 改善觸控滾動 */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  /* 防止選單外的滾動穿透 */
  touch-action: pan-y;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: linear-gradient(135deg, var(--mountain-50), var(--sky-50));
  border-radius: var(--space-md) var(--space-md) 0 0;
  border-bottom: 1px solid rgba(34, 197, 94, 0.1);
  flex-shrink: 0; /* 防止壓縮 */
  overflow: hidden; /* 防止內容溢出 */
  width: 100%;
  box-sizing: border-box;
}

.menu-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--stone-dark);
  margin: 0;
  font-family: var(--font-display);
}

/* 用戶選單特殊頭部 */
.user-info-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex: 1;
  min-width: 0; /* 防止溢出 */
  overflow: hidden;
}

.user-avatar-large {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar-large {
  width: 100%;
  height: 100%;
  background: var(--stone-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.default-avatar-large .avatar-icon {
  font-size: 1.25rem;
  color: var(--stone-medium);
}

.user-details {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.user-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--stone-dark);
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.user-email {
  font-size: 10px;
  color: var(--stone-medium);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* 分類網格 */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
  padding: var(--space-md);
  flex: 1;
  overflow-y: auto;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: rgba(34, 197, 94, 0.05);
  border: 1px solid rgba(34, 197, 94, 0.1);
  border-radius: var(--space-md);
  text-decoration: none;
  color: var(--stone-dark);
  transition: all 0.3s ease;
  touch-action: manipulation;
  min-height: 64px;
}

.category-item:hover {
  background: rgba(34, 197, 94, 0.1);
  border-color: var(--mountain-primary);
  transform: translateY(-2px);
}

.category-icon {
  font-size: 1.25rem;
}

.category-name {
  font-size: var(--text-xs);
  font-weight: 500;
  text-align: center;
}

/* 用戶選單內容 */
.user-menu-content {
  padding: var(--space-sm);
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 160px);
  max-height: calc(100dvh - 160px); /* 使用動態視窗高度 */
  box-sizing: border-box;
  /* 改善觸控滾動 */
  -webkit-overflow-scrolling: touch;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  overflow: hidden;
  max-height: 100%;
  /* 如果內容過多，允許滾動 */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.menu-action {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: none;
  border: none;
  border-radius: var(--space-sm);
  text-decoration: none;
  color: var(--stone-dark);
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  text-align: left;
  position: relative;
  min-height: 44px; /* 統一高度 */
  flex-shrink: 0;
  box-sizing: border-box;
  overflow: hidden; /* 防止內容溢出 */
}

.menu-action:hover {
  background: rgba(34, 197, 94, 0.1);
}

.menu-action .action-icon {
  font-size: 1.125rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.action-details {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.action-text {
  font-size: var(--text-sm);
  font-weight: 500;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.action-desc {
  font-size: 10px;
  color: var(--stone-medium);
  margin-top: 1px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.action-badges {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  position: relative;
  min-width: 20px; /* 減少最小寬度 */
  max-width: 40px; /* 限制最大寬度 */
  justify-content: flex-end;
  flex-shrink: 0;
  overflow: visible; /* 允許徽章稍微突出 */
}

.action-badge {
  background: #ef4444;
  color: white;
  border-radius: 10px;
  padding: 1px 4px;
  font-size: 9px;
  font-weight: 600;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
}

.logout-action {
  color: #ef4444;
  border-top: 1px solid var(--stone-light);
  margin-top: var(--space-sm);
  padding-top: var(--space-md);
  flex-shrink: 0;
}

.logout-action:hover {
  background: rgba(239, 68, 68, 0.1);
}

.login-prompt {
  text-align: center;
  padding: var(--space-lg);
  flex-shrink: 0;
}

/* 管理員功能樣式 */
.admin-section {
  margin: var(--space-sm) 0;
  flex-shrink: 0;
}

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%,
    rgba(34, 197, 94, 0.3) 50%,
    transparent 100%
  );
  margin: var(--space-sm) 0;
}

.section-title {
  font-size: 10px;
  color: var(--mountain-primary);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 0 var(--space-md) var(--space-xs);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.section-title::before {
  content: '👑';
  font-size: 12px;
}

.admin-action {
  border-left: 3px solid var(--mountain-primary);
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.05) 0%,
    rgba(34, 197, 94, 0.02) 100%
  );
  position: relative;
}

.admin-action::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.1) 0%,
    rgba(14, 165, 233, 0.05) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.admin-action:hover::before {
  opacity: 1;
}

.admin-action:hover {
  border-left-color: var(--mountain-accent);
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.1) 0%,
    rgba(34, 197, 94, 0.05) 100%
  );
  transform: translateX(2px);
}

.admin-icon {
  background: linear-gradient(135deg, var(--mountain-100), var(--mountain-200));
  border: 2px solid var(--mountain-primary);
  color: var(--mountain-accent);
  position: relative;
  z-index: 2;
}

.admin-action .action-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  position: relative;
  z-index: 2;
}

.admin-action .action-text {
  color: var(--mountain-accent);
  font-weight: 600;
}

.admin-action .action-desc {
  font-size: 9px;
  color: var(--stone-medium);
  line-height: 1.2;
  opacity: 0.8;
}

.admin-badge {
  background: linear-gradient(135deg, var(--mountain-primary), var(--mountain-accent));
  color: white;
  border-radius: 10px;
  padding: 1px 4px;
  font-size: 9px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

/* 動畫 */
.search-overlay-enter-active,
.search-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.search-overlay-enter-from,
.search-overlay-leave-to {
  opacity: 0;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.categories-enter-active,
.categories-leave-active,
.user-menu-enter-active,
.user-menu-leave-active {
  transition: all 0.3s ease;
}

.categories-enter-from,
.categories-leave-to,
.user-menu-enter-from,
.user-menu-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 響應式設計 */
@media (min-width: 769px) {
  .mobile-navigation {
    display: none;
  }
}

@media (max-width: 360px) {
  .nav-label {
    font-size: 10px;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
    padding: var(--space-sm);
  }
  
  .nav-icon {
    font-size: 1.125rem;
  }
  
  .user-avatar {
    width: 24px;
    height: 24px;
  }
  
  .default-avatar {
    width: 24px;
    height: 24px;
  }
  
  .notification-badge {
    min-width: 16px;
    height: 16px;
    font-size: 9px;
  }
  
  /* 選單容器優化 */
  .categories-menu,
  .user-menu {
    left: var(--space-xs);
    right: var(--space-xs);
    max-height: calc(100vh - 100px);
    max-height: calc(100dvh - 100px);
    bottom: 60px;
    max-width: calc(100vw - 2 * var(--space-xs));
    max-width: calc(100dvw - 2 * var(--space-xs));
  }
  
  .menu-header {
    padding: var(--space-sm);
  }
  
  .user-info-header {
    gap: 6px;
  }
  
  .user-avatar-large {
    width: 32px;
    height: 32px;
  }
  
  .user-name {
    font-size: 12px;
  }
  
  .user-email {
    font-size: 9px;
  }
  
  .user-menu-content {
    padding: 4px;
    max-height: calc(100vh - 140px);
    max-height: calc(100dvh - 140px);
  }
  
  /* 統一選單項目優化 */
  .menu-action {
    min-height: 36px;
    padding: 6px var(--space-sm);
    gap: 6px;
  }
  
  .menu-action .action-icon {
    font-size: 1rem;
    width: 18px;
  }
  
  .action-text {
    font-size: 12px;
  }
  
  .action-desc {
    font-size: 9px;
  }
  
  .action-badges {
    min-width: 18px;
    max-width: 36px;
  }
  
  .action-badge,
  .admin-badge {
    font-size: 8px;
    padding: 1px 3px;
    min-width: 14px;
    height: 14px;
  }
  
  .category-item {
    padding: var(--space-sm);
    min-height: 56px;
  }
  
  .category-icon {
    font-size: 1.125rem;
  }
  
  .category-name {
    font-size: 11px;
  }
  
  .section-title {
    font-size: 9px;
  }
  
  .section-title::before {
    font-size: 10px;
  }
}

@media (max-width: 320px) {
  .categories-menu,
  .user-menu {
    left: 2px;
    right: 2px;
    max-height: calc(100vh - 90px);
    max-height: calc(100dvh - 90px);
    bottom: 55px;
    max-width: calc(100vw - 4px);
    max-width: calc(100dvw - 4px);
  }
  
  .menu-header {
    padding: 6px;
  }
  
  .user-info-header {
    gap: 4px;
  }
  
  .user-avatar-large {
    width: 28px;
    height: 28px;
  }
  
  .user-name {
    font-size: 11px;
  }
  
  .user-email {
    font-size: 8px;
  }
  
  .user-menu-content {
    max-height: calc(100vh - 120px);
    max-height: calc(100dvh - 120px);
  }
  
  .menu-action {
    min-height: 32px;
    padding: 4px 6px;
    gap: 4px;
  }
  
  .menu-action .action-icon {
    font-size: 0.875rem;
    width: 16px;
  }
  
  .action-text {
    font-size: 11px;
  }
  
  .action-desc {
    font-size: 8px;
  }
  
  .action-badges {
    min-width: 16px;
    max-width: 32px;
  }
  
  .action-badge,
  .admin-badge {
    font-size: 7px;
    padding: 0px 2px;
    min-width: 12px;
    height: 12px;
  }
  
  .category-item {
    padding: 8px;
    min-height: 48px;
  }
  
  .category-icon {
    font-size: 1rem;
  }
  
  .category-name {
    font-size: 10px;
  }
  
  .section-title {
    font-size: 8px;
    padding: 0 6px 4px;
  }
  
  .section-title::before {
    font-size: 9px;
  }
  
  .admin-action .action-desc {
    font-size: 7px;
  }
}

/* 橫向模式優化 */
@media (max-width: 768px) and (orientation: landscape) {
  .categories-menu,
  .user-menu {
    max-height: calc(100vh - 80px);
    max-height: calc(100dvh - 80px);
    bottom: 50px;
  }
  
  .menu-header {
    padding: 6px var(--space-sm);
  }
  
  .user-menu-content {
    padding: 4px;
    max-height: calc(100vh - 120px);
    max-height: calc(100dvh - 120px);
  }
  
  .menu-action {
    min-height: 32px;
    padding: 4px var(--space-sm);
  }
  
  .category-item {
    padding: 8px;
    min-height: 48px;
  }
}

/* 超小螢幕優化（如舊款iPhone SE） */
@media (max-height: 500px) {
  .categories-menu,
  .user-menu {
    max-height: calc(100vh - 70px);
    max-height: calc(100dvh - 70px);
    bottom: 45px;
  }
  
  .menu-header {
    padding: 4px;
  }
  
  .user-menu-content {
    padding: 2px;
    max-height: calc(100vh - 110px);
    max-height: calc(100dvh - 110px);
  }
  
  .menu-action {
    min-height: 28px;
    padding: 2px 6px;
    gap: 6px;
  }
  
  .action-text {
    font-size: 10px;
  }
  
  .action-desc {
    display: none; /* 隱藏描述以節省空間 */
  }
  
  .category-item {
    padding: 6px;
    min-height: 40px;
  }
  
  .category-name {
    font-size: 9px;
  }
}

/* 觸控優化 */
@media (hover: none) and (pointer: coarse) {
  .nav-item {
    min-height: 48px;
  }
  
  .category-item {
    min-height: 64px;
  }
  
  .menu-action {
    min-height: 48px;
  }
  
  .admin-action:hover {
    transform: none;
  }
  
  .admin-action:active {
    transform: scale(0.97);
    background: rgba(34, 197, 94, 0.1);
  }
  
  /* 改善觸控滾動 */
  .categories-menu,
  .user-menu {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
  
  .user-menu-content,
  .user-actions {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
}

/* 支援安全區域 */
@supports (padding: max(0px)) {
  .bottom-navigation {
    padding-bottom: max(calc(var(--space-xs) + env(safe-area-inset-bottom)), var(--space-md));
  }
  
  .categories-menu,
  .user-menu {
    bottom: max(72px, calc(72px + env(safe-area-inset-bottom)));
  }
}

/* 支援動態視窗單位 */
@supports (height: 100dvh) {
  .categories-menu,
  .user-menu {
    max-height: calc(100dvh - 120px);
  }
  
  .user-menu-content {
    max-height: calc(100dvh - 160px);
  }
  
  @media (max-width: 360px) {
    .categories-menu,
    .user-menu {
      max-height: calc(100dvh - 100px);
    }
    
    .user-menu-content {
      max-height: calc(100dvh - 140px);
    }
  }
  
  @media (max-width: 320px) {
    .categories-menu,
    .user-menu {
      max-height: calc(100dvh - 90px);
    }
    
    .user-menu-content {
      max-height: calc(100dvh - 120px);
    }
  }
  
  @media (max-width: 768px) and (orientation: landscape) {
    .categories-menu,
    .user-menu {
      max-height: calc(100dvh - 80px);
    }
    
    .user-menu-content {
      max-height: calc(100dvh - 120px);
    }
  }
  
  @media (max-height: 500px) {
    .categories-menu,
    .user-menu {
      max-height: calc(100dvh - 70px);
    }
    
    .user-menu-content {
      max-height: calc(100dvh - 110px);
    }
  }
}
</style> 