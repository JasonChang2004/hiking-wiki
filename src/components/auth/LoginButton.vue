<template>
  <!-- 未登入狀態 -->
  <div v-if="!user" class="flex items-center">
    <button @click="login" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
      使用 Google 登入
    </button>
  </div>
  
  <!-- 已登入狀態 - 用戶頭像下拉選單 -->
  <div v-else class="relative inline-block" ref="dropdownRef">
    <!-- 用戶頭像按鈕 -->
    <button 
      @click="toggleDropdown"
      class="user-avatar-button"
      :aria-expanded="isDropdownOpen"
      aria-label="用戶選單"
    >
      <!-- 頭像 -->
      <img 
        v-if="(userProfile?.photoURL || user.photoURL)" 
        :src="(userProfile?.photoURL || user.photoURL) || ''"
        :alt="(userProfile?.displayName || user.displayName) || '用戶頭像'"
        class="user-avatar-image"
        style="width: 24px !important; height: 24px !important; min-width: 24px !important; max-width: 24px !important;"
        @error="handleImageError"
      />
      <!-- 如果沒有頭像，顯示默認圖標 -->
      <div v-else class="user-avatar-placeholder" style="width: 24px !important; height: 24px !important; min-width: 24px !important; max-width: 24px !important;">
        <span class="text-xs text-gray-600 font-medium">{{ (userProfile?.displayName || user.displayName || '用戶')[0] }}</span>
      </div>
      
      <!-- 下拉箭頭 -->
      <span class="text-gray-500 text-xs ml-1">{{ isDropdownOpen ? '▲' : '▼' }}</span>
    </button>

    <!-- 下拉選單 -->
    <Transition name="dropdown">
      <div 
        v-if="isDropdownOpen"
        class="dropdown-menu"
      >
        <!-- 用戶信息區域 -->
        <div class="px-4 py-3 border-b border-gray-100">
          <div class="flex items-center space-x-3">
            <img 
              v-if="(userProfile?.photoURL || user.photoURL)" 
              :src="(userProfile?.photoURL || user.photoURL) || ''"
              :alt="(userProfile?.displayName || user.displayName) || '用戶頭像'"
              class="w-8 h-8 rounded-full border border-gray-300 object-cover flex-shrink-0"
              @error="handleImageError"
            />
            <div v-else class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
              <span class="text-xs text-gray-600 font-medium">{{ (userProfile?.displayName || user.displayName || '用戶')[0] }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ userProfile?.displayName || user.displayName || '用戶' }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                {{ userProfile?.email || user.email }}
              </p>
              <span v-if="userProfile?.isAdmin" class="inline-block text-xs text-blue-600 font-medium">
                管理員
              </span>
            </div>
          </div>
        </div>

        <!-- 選單項目 -->
        <div class="py-1">
          <router-link 
            to="/my-articles" 
            @click="closeDropdown"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            我的投稿
          </router-link>

          <router-link 
            to="/notifications" 
            @click="closeDropdown"
            class="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span>通知</span>
            <span
              v-if="notificationsStore.unreadCount > 0"
              class="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full"
            >
              {{ notificationsStore.unreadCount }}
            </span>
          </router-link>

          <router-link 
            to="/admin" 
            @click="closeDropdown"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            管理員
          </router-link>

          <router-link 
            to="/review" 
            @click="closeDropdown"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            審核
          </router-link>
        </div>

        <!-- 登出按鈕 -->
        <div class="border-t border-gray-100 py-1">
          <button 
            @click="logout"
            class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            登出
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { auth, provider, db } from '../../firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import type { UserProfile } from '../../types'
import { useNotificationsStore } from '@/store/notifications'

const user = ref<User | null>(null)
const userProfile = ref<UserProfile | null>(null)
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const notificationsStore = useNotificationsStore()

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

const login = async () => {
  try {
    const result = await signInWithPopup(auth, provider)
    if (result.user) {
      // 檢查用戶文檔是否存在
      const userDocRef = doc(db, 'users', result.user.uid)
      const userDocSnap = await getDoc(userDocRef)

      let isAdmin = false
      if (userDocSnap.exists()) {
        isAdmin = userDocSnap.data()?.isAdmin || false
      }
      
      // 創建或更新用戶文檔
      const userProfileData: Omit<UserProfile, 'id'> = {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        isAdmin: isAdmin,
      }
      await setDoc(userDocRef, userProfileData, { merge: true })
      console.log('✅ 使用者資訊已同步寫入 Firestore')
      userProfile.value = { id: result.user.uid, ...userProfileData }
    }
  } catch (err) {
    console.error('登入失敗', err)
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
/* 強制頭像按鈕樣式 */
.user-avatar-button {
  display: flex !important;
  align-items: center !important;
  padding: 4px !important;
  border-radius: 9999px !important;
  background-color: transparent !important;
  border: none !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease !important;
}

.user-avatar-button:hover {
  background-color: #f3f4f6 !important;
}

.user-avatar-button:focus {
  outline: 2px solid #3b82f6 !important;
  outline-offset: 2px !important;
}

/* 強制頭像圖片樣式 */
.user-avatar-image {
  border-radius: 50% !important;
  border: 1px solid #d1d5db !important;
  object-fit: cover !important;
}

/* 強制默認頭像樣式 */
.user-avatar-placeholder {
  border-radius: 50% !important;
  background-color: #d1d5db !important;
  border: 1px solid #d1d5db !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 下拉選單動畫 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 用戶頭像懸停效果 */
img:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

/* 確保下拉選單在最上層且不會被遮擋 */
.relative {
  position: relative;
}

/* 下拉選單樣式 - 確保在主內容之上 */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  width: 16rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
  padding: 0.25rem 0;
  z-index: 99999;
  max-width: 20rem;
}
</style>
