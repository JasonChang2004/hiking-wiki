import { ref, computed, onMounted, onUnmounted, readonly, watch } from 'vue'
import { auth } from '@/firebase'
import type { User } from 'firebase/auth'
import { authLogger } from '@/utils/logger'

// 認證錯誤類型
interface AuthError {
  code: string
  message: string
  context?: string
}

// 認證狀態類型
interface AuthState {
  user: User | null
  isLoading: boolean
  error: AuthError | null
  isInitialized: boolean
}

// 全域認證狀態
const authState = ref<AuthState>({
  user: null,
  isLoading: true,
  error: null,
  isInitialized: false
})

let authUnsubscribe: (() => void) | null = null
let initializePromise: Promise<void> | null = null

// 將 Error 轉換為 AuthError
const createAuthError = (error: Error, context?: string): AuthError => {
  // 檢查是否為 Firebase Auth Error
  const firebaseError = error as any
  return {
    code: firebaseError.code || 'UNKNOWN_ERROR',
    message: error.message || '認證錯誤',
    context
  }
}

// 認證狀態初始化
const initializeAuth = (): Promise<void> => {
  if (initializePromise) {
    return initializePromise
  }

  initializePromise = new Promise((resolve) => {
    if (authUnsubscribe) {
      authLogger.debug('認證監聽器已存在，跳過初始化')
      resolve()
      return
    }

    authLogger.info('開始初始化認證狀態監聽器')

    authUnsubscribe = auth.onAuthStateChanged(
      (user) => {
        authLogger.debug('認證狀態變更', { 
          userId: user?.uid,
          email: user?.email,
          displayName: user?.displayName 
        })

        authState.value = {
          user,
          isLoading: false,
          error: null,
          isInitialized: true
        }

        resolve()
      },
      (error) => {
        const authError = createAuthError(error, 'onAuthStateChanged')
        authLogger.error('認證狀態監聽錯誤', authError)

        authState.value = {
          user: null,
          isLoading: false,
          error: authError,
          isInitialized: true
        }

        resolve()
      }
    )
  })

  return initializePromise
}

// 清理認證監聽器
const cleanupAuth = (): void => {
  if (authUnsubscribe) {
    authLogger.info('清理認證狀態監聽器')
    authUnsubscribe()
    authUnsubscribe = null
    initializePromise = null
  }
}

// 等待認證初始化完成
const waitForAuthInit = (): Promise<void> => {
  if (authState.value.isInitialized) {
    return Promise.resolve()
  }
  
  return initializeAuth()
}

export function useAuth() {
  // 計算屬性
  const currentUser = computed(() => authState.value.user)
  const isLoading = computed(() => authState.value.isLoading)
  const authError = computed(() => authState.value.error)
  const isInitialized = computed(() => authState.value.isInitialized)
  
  const isAuthenticated = computed(() => {
    return authState.value.isInitialized && !!authState.value.user
  })
  
  const userDisplayName = computed(() => {
    return authState.value.user?.displayName || '未知用戶'
  })
  
  const userEmail = computed(() => {
    return authState.value.user?.email || ''
  })
  
  const userId = computed(() => {
    return authState.value.user?.uid || ''
  })

  const userPhotoURL = computed(() => {
    return authState.value.user?.photoURL || ''
  })

  // 檢查當前用戶是否為指定用戶
  const isCurrentUser = (uid: string): boolean => {
    return authState.value.user?.uid === uid
  }

  // 清除認證錯誤
  const clearAuthError = (): void => {
    if (authState.value.error) {
      authLogger.debug('清除認證錯誤')
      authState.value = {
        ...authState.value,
        error: null
      }
    }
  }

  // 重新整理認證狀態
  const refreshAuth = async (): Promise<void> => {
    try {
      authLogger.debug('手動重新整理認證狀態')
      if (auth.currentUser) {
        await auth.currentUser.reload()
        authLogger.info('認證狀態重新整理成功')
      }
    } catch (error) {
      authLogger.error('重新整理認證狀態失敗', error)
    }
  }

  // 監聽認證錯誤，自動清除過期錯誤
  watch(
    () => authState.value.error,
    (error) => {
      if (error) {
        // 5分鐘後自動清除錯誤
        setTimeout(() => {
          if (authState.value.error === error) {
            clearAuthError()
          }
        }, 5 * 60 * 1000)
      }
    }
  )

  // 自動初始化
  onMounted(() => {
    initializeAuth()
  })

  onUnmounted(() => {
    // 注意：這裡不要清理全域監聽器，因為其他組件可能還在使用
    // cleanupAuth() 應該在應用退出時調用
  })

  return {
    // 狀態 (readonly)
    currentUser: readonly(currentUser),
    isLoading: readonly(isLoading),
    authError: readonly(authError),
    isInitialized: readonly(isInitialized),
    
    // 計算屬性
    isAuthenticated,
    userDisplayName,
    userEmail,
    userId,
    userPhotoURL,
    
    // 方法
    isCurrentUser,
    clearAuthError,
    refreshAuth,
    waitForAuthInit,
    
    // 生命週期方法 (謹慎使用)
    initializeAuth,
    cleanupAuth
  }
}

// 導出全域認證狀態和工具方法
export { authState, waitForAuthInit, cleanupAuth }

// 導出類型
export type { AuthError, AuthState } 