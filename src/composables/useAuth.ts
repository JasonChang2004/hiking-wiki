import { ref, computed, onMounted, onUnmounted, readonly } from 'vue'
import { auth } from '@/firebase'
import type { User } from 'firebase/auth'

const currentUser = ref<User | null>(null)
const isLoading = ref(true)
const authError = ref<string | null>(null)

let unsubscribeAuth: (() => void) | null = null

export function useAuth() {
  // 初始化認證監聽器
  const initAuth = () => {
    if (unsubscribeAuth) return // 避免重複訂閱

    unsubscribeAuth = auth.onAuthStateChanged(
      (user) => {
        currentUser.value = user
        isLoading.value = false
        authError.value = null
      },
      (error) => {
        console.error('認證狀態監聽錯誤:', error)
        authError.value = '認證狀態檢查失敗'
        isLoading.value = false
      }
    )
  }

  // 清理認證監聽器
  const cleanupAuth = () => {
    if (unsubscribeAuth) {
      unsubscribeAuth()
      unsubscribeAuth = null
    }
  }

  // 計算屬性
  const isAuthenticated = computed(() => !!currentUser.value)
  const userDisplayName = computed(() => currentUser.value?.displayName || '未知用戶')
  const userEmail = computed(() => currentUser.value?.email || '')
  const userId = computed(() => currentUser.value?.uid || '')

  // 自動初始化和清理
  onMounted(() => {
    initAuth()
  })

  onUnmounted(() => {
    cleanupAuth()
  })

  return {
    // 狀態
    currentUser: readonly(currentUser),
    isLoading: readonly(isLoading),
    authError: readonly(authError),
    
    // 計算屬性
    isAuthenticated,
    userDisplayName,
    userEmail,
    userId,
    
    // 方法
    initAuth,
    cleanupAuth
  }
}

// 導出單例狀態供全域使用
export const authState = {
  currentUser,
  isLoading,
  authError
} 