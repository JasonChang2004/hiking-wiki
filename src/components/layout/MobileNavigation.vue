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
                <span class="action-icon">⚙️</span>
                <span class="action-text">系統管理</span>
                <span v-if="pendingCount > 0" class="action-badge">{{ pendingCount }}</span>
              </router-link>
              <router-link to="/admin/content" @click="closeAllMenus" class="menu-action admin-action">
                <span class="action-icon">📋</span>
                <span class="action-text">內容管理</span>
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
    document.body.style.overflow = 'hidden'
    await nextTick()
    searchInput.value?.focus()
  } else {
    document.body.style.overflow = ''
  }
}

// 關閉搜索
const closeSearch = () => {
  showSearch.value = false
  document.body.style.overflow = ''
}

// 切換分類選單
const toggleCategories = () => {
  showCategories.value = !showCategories.value
  if (showCategories.value) {
    showUserMenu.value = false
    showSearch.value = false
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 切換用戶選單
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value) {
    showCategories.value = false
    showSearch.value = false
    document.body.style.overflow = 'hidden'
    // 載入通知數量
    if (user.value) {
      notificationsStore.fetchUnreadCount()
      // 如果是管理員，也載入待審核計數
      if (ADMIN_UIDS.includes(user.value.uid)) {
        adminStore.fetchPendingArticlesCount()
      }
    }
  } else {
    document.body.style.overflow = ''
  }
}

// 關閉所有選單
const closeAllMenus = () => {
  showCategories.value = false
  showUserMenu.value = false
  showSearch.value = false
  document.body.style.overflow = ''
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
    document.body.style.overflow = ''
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
  max-height: 60vh;
  overflow-y: auto;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-md);
  background: linear-gradient(135deg, var(--mountain-50), var(--sky-50));
  border-radius: var(--space-md) var(--space-md) 0 0;
  border-bottom: 1px solid rgba(34, 197, 94, 0.1);
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
  gap: var(--space-md);
  flex: 1;
}

.user-avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  font-size: 1.5rem;
  color: var(--stone-medium);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--stone-dark);
  margin: 0 0 var(--space-xs) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: var(--text-xs);
  color: var(--stone-medium);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 分類網格 */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
  padding: var(--space-md);
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg) var(--space-md);
  background: rgba(34, 197, 94, 0.05);
  border: 1px solid rgba(34, 197, 94, 0.1);
  border-radius: var(--space-md);
  text-decoration: none;
  color: var(--stone-dark);
  transition: all 0.3s ease;
  touch-action: manipulation;
}

.category-item:hover {
  background: rgba(34, 197, 94, 0.1);
  border-color: var(--mountain-primary);
  transform: translateY(-2px);
}

.category-icon {
  font-size: 1.5rem;
}

.category-name {
  font-size: var(--text-sm);
  font-weight: 500;
  text-align: center;
}

/* 用戶選單內容 */
.user-menu-content {
  padding: var(--space-md);
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.menu-action {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: none;
  border: none;
  border-radius: var(--space-sm);
  text-decoration: none;
  color: var(--stone-dark);
  transition: background-color 0.3s ease;
  cursor: pointer;
  width: 100%;
  text-align: left;
  position: relative;
}

.menu-action:hover {
  background: rgba(34, 197, 94, 0.1);
}

.action-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.action-text {
  flex: 1;
  font-size: var(--text-base);
  font-weight: 500;
}

.action-badge {
  background: #ef4444;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: var(--text-xs);
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.logout-action {
  color: #ef4444;
  border-top: 1px solid var(--stone-light);
  margin-top: var(--space-sm);
  padding-top: var(--space-lg);
}

.logout-action:hover {
  background: rgba(239, 68, 68, 0.1);
}

.login-prompt {
  text-align: center;
  padding: var(--space-lg);
}

/* 管理員功能樣式 */
.admin-section {
  margin: var(--space-md) 0;
}

.section-divider {
  height: 1px;
  background: var(--stone-light);
  margin: var(--space-md) 0;
}

.section-title {
  font-size: var(--text-xs);
  color: var(--stone-medium);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 0 var(--space-md) var(--space-sm);
}

.admin-action {
  background: rgba(249, 115, 22, 0.05);
  border-left: 3px solid var(--earth-primary);
}

.admin-action:hover {
  background: rgba(249, 115, 22, 0.1);
  border-left-color: var(--earth-accent);
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
}

/* 支援安全區域 */
@supports (padding: max(0px)) {
  .bottom-navigation {
    padding-bottom: max(calc(var(--space-xs) + env(safe-area-inset-bottom)), var(--space-md));
  }
}
</style> 