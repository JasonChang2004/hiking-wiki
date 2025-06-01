<template>
  <!-- 未登入狀態 -->
  <div v-if="!user" class="login-container">
    <!-- 登入按鈕 -->
    <router-link to="/login" class="login-button">
      <span class="login-icon">👤</span>
      <span class="login-text">登入</span>
    </router-link>
  </div>
  
  <!-- 已登入狀態 - 用戶頭像下拉選單 -->
  <div v-else class="user-menu-container" ref="dropdownRef">
    <!-- 用戶頭像按鈕 -->
    <button 
      @click="toggleDropdown"
      class="user-avatar-button"
      :class="{ 'active': isDropdownOpen }"
      :aria-expanded="isDropdownOpen"
      aria-label="用戶選單"
    >
      <!-- 頭像區域 -->
      <div class="avatar-wrapper">
        <img 
          v-if="(userProfile?.photoURL || user.photoURL)" 
          :src="(userProfile?.photoURL || user.photoURL) || ''"
          :alt="(userProfile?.displayName || user.displayName) || '用戶頭像'"
          class="user-avatar-image"
          @error="handleImageError"
        />
        <!-- 如果沒有頭像，顯示默認圖標 -->
        <div v-else class="user-avatar-placeholder">
          <span class="avatar-initial">{{ getInitial() }}</span>
        </div>
        
        <!-- 在線狀態指示器 -->
        <div class="online-indicator"></div>
      </div>
      
      <!-- 下拉箭頭 -->
      <div class="dropdown-arrow" :class="{ 'rotated': isDropdownOpen }">
        <span>⌄</span>
      </div>
    </button>

    <!-- 下拉選單 -->
    <Transition name="dropdown">
      <div 
        v-if="isDropdownOpen"
        class="dropdown-menu"
      >
        <!-- 用戶信息區域 -->
        <div class="user-info-section">
          <div class="user-avatar-large">
            <img 
              v-if="(userProfile?.photoURL || user.photoURL)" 
              :src="(userProfile?.photoURL || user.photoURL) || ''"
              :alt="(userProfile?.displayName || user.displayName) || '用戶頭像'"
              class="avatar-large-image"
              @error="handleImageError"
            />
            <div v-else class="avatar-large-placeholder">
              <span class="avatar-large-initial">{{ getInitial() }}</span>
            </div>
          </div>
          
          <div class="user-details">
            <h3 class="user-name">
              {{ userProfile?.displayName || user.displayName || '用戶' }}
            </h3>
            <p class="user-email">
              {{ userProfile?.email || user.email }}
            </p>
            <div class="user-badges">
              <span v-if="userProfile?.isAdmin" class="admin-badge">
                <span class="badge-icon">👑</span>
                <span>管理員</span>
              </span>
              <span class="member-badge">
                <span class="badge-icon">🏔️</span>
                <span>山友</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 選單項目 -->
        <div class="menu-sections">
          <!-- 個人功能 -->
          <div class="menu-section">
            <h4 class="section-title">個人功能</h4>
            <router-link 
              to="/my-articles" 
              @click="closeDropdown"
              class="menu-item"
            >
              <span class="menu-icon">📝</span>
              <span class="menu-text">我的投稿</span>
              <span class="menu-arrow">→</span>
            </router-link>

            <router-link 
              to="/notifications" 
              @click="closeDropdown"
              class="menu-item"
            >
              <span class="menu-icon">🔔</span>
              <span class="menu-text">通知中心</span>
              <span
                v-if="notificationsStore.unreadCount > 0"
                class="notification-badge"
              >
                {{ notificationsStore.unreadCount > 99 ? '99+' : notificationsStore.unreadCount }}
              </span>
              <span v-else class="menu-arrow">→</span>
            </router-link>
          </div>

          <!-- 管理功能 (僅管理員可見) -->
          <div v-if="userProfile?.isAdmin" class="menu-section">
            <h4 class="section-title">管理功能</h4>
            <router-link 
              to="/admin" 
              @click="closeDropdown"
              class="menu-item admin-item"
            >
              <span class="menu-icon">⚙️</span>
              <span class="menu-text">系統管理</span>
              <span class="menu-arrow">→</span>
            </router-link>

            <router-link 
              to="/review" 
              @click="closeDropdown"
              class="menu-item admin-item"
            >
              <span class="menu-icon">📋</span>
              <span class="menu-text">內容審核</span>
              <span class="menu-arrow">→</span>
            </router-link>
          </div>
        </div>

        <!-- 登出按鈕 -->
        <div class="logout-section">
          <button 
            @click="logout"
            class="logout-button"
          >
            <span class="logout-icon">🚪</span>
            <span class="logout-text">安全登出</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { auth, db } from '../../firebase'
import { 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import type { UserProfile } from '../../types'
import { useNotificationsStore } from '@/store/notifications'

const user = ref<User | null>(null)
const userProfile = ref<UserProfile | null>(null)
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const notificationsStore = useNotificationsStore()

// 獲取用戶名稱首字母
const getInitial = (): string => {
  const name = userProfile.value?.displayName || user.value?.displayName || '用戶'
  return name.charAt(0).toUpperCase()
}

// 切換下拉選單
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// 關閉下拉選單
const closeDropdown = () => {
  isDropdownOpen.value = false
}

// 處理圖片載入錯誤
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// 點擊外部關閉選單
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

const logout = async () => {
  try {
    await signOut(auth)
    userProfile.value = null
    closeDropdown()
  } catch (error) {
    console.error("登出失敗:", error)
  }
}

let unsubscribeAuth: (() => void) | null = null

onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
    user.value = u
    if (u) {
      // 從 Firestore 獲取用戶資料
      const userDocRef = doc(db, 'users', u.uid)
      const userDocSnap = await getDoc(userDocRef)
      if (userDocSnap.exists()) {
        userProfile.value = { id: u.uid, ...userDocSnap.data() } as UserProfile
      } else {
        const newUserProfileData: Omit<UserProfile, 'id'> = {
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
          isAdmin: false,
        }
        await setDoc(userDocRef, newUserProfileData, { merge: true })
        userProfile.value = { id: u.uid, ...newUserProfileData }
      }
    } else {
      userProfile.value = null
    }
  })

  // 添加點擊外部關閉事件
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (unsubscribeAuth) {
    unsubscribeAuth()
  }
  // 移除事件監聽器
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 登入按鈕 - 山林主題 */
.login-container {
  display: flex;
  align-items: center;
}

.login-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: white !important;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-card);
  position: relative;
  text-decoration: none;
}

.login-button:hover {
  background: linear-gradient(135deg, #15803d, #166534);
  transform: translateY(-1px);
  box-shadow: var(--shadow-elevated);
  color: white !important;
  text-decoration: none;
}

.login-icon {
  font-size: 0.875rem;
  color: white !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.login-text {
  white-space: nowrap;
  color: white !important;
  opacity: 1 !important;
  visibility: visible !important;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

/* 用戶選單容器 */
.user-menu-container {
  position: relative;
  display: inline-block;
}

/* 用戶頭像按鈕 */
.user-avatar-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(34, 197, 94, 0.2);
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-body);
}

.user-avatar-button:hover,
.user-avatar-button.active {
  background: rgba(255, 255, 255, 1);
  border-color: var(--mountain-primary);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
  transform: translateY(-1px);
}

/* 頭像包裝器 */
.avatar-wrapper {
  position: relative;
  width: 2rem;
  height: 2rem;
}

.user-avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--mountain-100);
  transition: all 0.3s ease;
}

.user-avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mountain-200), var(--mountain-300));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--mountain-100);
}

.avatar-initial {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--mountain-accent);
}

/* 在線狀態指示器 */
.online-indicator {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 0.75rem;
  height: 0.75rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 下拉箭頭 */
.dropdown-arrow {
  font-size: 0.75rem;
  color: white !important;
  transition: transform 0.3s ease;
  margin-left: 0.25rem;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* 下拉選單 */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  width: 20rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(34, 197, 94, 0.1);
  border-radius: 1rem;
  box-shadow: var(--shadow-elevated);
  overflow: hidden;
  z-index: 99999;
}

/* 用戶信息區域 */
.user-info-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--mountain-50), var(--sky-50));
  border-bottom: 1px solid rgba(34, 197, 94, 0.1);
}

.user-avatar-large {
  position: relative;
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
}

.avatar-large-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--mountain-primary);
}

.avatar-large-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mountain-300), var(--mountain-400));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--mountain-primary);
}

.avatar-large-initial {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin: 0 0 0.25rem 0;
  font-family: var(--font-display);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.75rem;
  color: var(--stone-medium);
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.admin-badge,
.member-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 500;
  border-radius: 0.5rem;
}

.admin-badge {
  background: linear-gradient(135deg, var(--earth-100), var(--earth-200));
  color: var(--earth-secondary);
  border: 1px solid var(--earth-200);
}

.member-badge {
  background: linear-gradient(135deg, var(--mountain-100), var(--mountain-200));
  color: var(--mountain-accent);
  border: 1px solid var(--mountain-200);
}

.badge-icon {
  font-size: 0.625rem;
}

/* 選單區域 */
.menu-sections {
  padding: 0.5rem 0;
}

.menu-section {
  padding: 0.5rem 0;
}

.menu-section:not(:last-child) {
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--stone-medium);
  margin: 0 0 0.5rem 0;
  padding: 0 1rem;
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 選單項目 */
.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--stone-dark);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.menu-item:hover {
  background: rgba(34, 197, 94, 0.05);
  color: var(--mountain-accent);
  transform: translateX(2px);
}

.menu-item.admin-item:hover {
  background: rgba(249, 115, 22, 0.05);
  color: var(--earth-secondary);
}

.menu-icon {
  font-size: 1rem;
  width: 1.25rem;
  text-align: center;
  flex-shrink: 0;
}

.menu-text {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-body);
}

.menu-arrow {
  font-size: 0.75rem;
  color: var(--stone-medium);
  transition: transform 0.3s ease;
}

.menu-item:hover .menu-arrow {
  transform: translateX(2px);
  color: var(--mountain-primary);
}

/* 通知徽章 */
.notification-badge {
  padding: 0.125rem 0.375rem;
  background: linear-gradient(135deg, var(--earth-primary), var(--earth-secondary));
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  border-radius: 0.75rem;
  margin-left: auto;
  animation: pulse 2s infinite;
}

/* 登出區域 */
.logout-section {
  padding: 0.75rem;
  border-top: 1px solid rgba(229, 231, 235, 0.5);
  background: rgba(254, 247, 237, 0.3);
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: 1.5px solid rgba(220, 38, 38, 0.2);
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: rgba(220, 38, 38, 0.05);
  border-color: #dc2626;
  transform: translateY(-1px);
}

.logout-icon {
  font-size: 0.875rem;
}

/* 動畫 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 響應式設計 */
@media (max-width: 480px) {
  .dropdown-menu {
    width: calc(100vw - 2rem);
    right: -5rem;
  }
  
  .user-info-section {
    padding: 1rem;
  }
  
  .user-name {
    font-size: 0.875rem;
  }
  
  .user-email {
    font-size: 0.6875rem;
  }
}

/* 無障礙設計 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* 高對比度模式 */
@media (prefers-contrast: high) {
  .dropdown-menu {
    background: white;
    border: 2px solid var(--stone-dark);
  }
  
  .menu-item {
    color: black;
  }
  
  .menu-item:hover {
    background: #f0f0f0;
  }
}
</style>
