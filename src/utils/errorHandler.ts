/**
 * 通用錯誤處理工具
 * 提供統一的錯誤處理和用戶友好的錯誤消息
 */

import { logger } from './logger'

// 錯誤類型定義
export interface AppError {
  code: string
  message: string
  userMessage: string
  context?: string
  originalError?: any
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// Firebase 錯誤碼映射
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  // 認證錯誤
  'auth/user-not-found': '找不到此電子郵件帳號',
  'auth/wrong-password': '密碼錯誤',
  'auth/invalid-email': '電子郵件格式不正確',
  'auth/user-disabled': '此帳號已被停用',
  'auth/too-many-requests': '嘗試次數過多，請稍後再試',
  'auth/weak-password': '密碼強度太弱，至少需要6個字符',
  'auth/email-already-in-use': '此電子郵件已被使用',
  'auth/requires-recent-login': '請重新登入後再試',
  'auth/popup-closed-by-user': '登入視窗已關閉',
  'auth/network-request-failed': '網路連線失敗，請檢查網路狀態',

  // Firestore 錯誤
  'permission-denied': '沒有權限執行此操作',
  'not-found': '找不到請求的資源',
  'already-exists': '資源已經存在',
  'resource-exhausted': '請求太頻繁，請稍後再試',
  'failed-precondition': '操作條件不符',
  'unavailable': '服務暫時無法使用，請稍後再試',
  'unauthenticated': '需要登入才能執行此操作',

  // Storage 錯誤
  'storage/unauthorized': '沒有權限上傳檔案',
  'storage/canceled': '檔案上傳已取消',
  'storage/quota-exceeded': '儲存空間不足',
  'storage/invalid-format': '檔案格式不支援',
  'storage/invalid-checksum': '檔案上傳過程中發生錯誤'
}

// 通用錯誤碼映射
const GENERAL_ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: '網路連線失敗，請檢查網路狀態',
  TIMEOUT_ERROR: '請求超時，請稍後再試',
  VALIDATION_ERROR: '輸入資料格式不正確',
  NOT_FOUND: '找不到請求的資源',
  UNAUTHORIZED: '沒有權限執行此操作',
  FORBIDDEN: '禁止執行此操作',
  SERVER_ERROR: '伺服器錯誤，請稍後再試',
  UNKNOWN_ERROR: '發生未知錯誤，請稍後再試'
}

// 錯誤嚴重程度判斷
const getErrorSeverity = (code: string): AppError['severity'] => {
  const criticalErrors = [
    'auth/network-request-failed',
    'unavailable',
    'resource-exhausted'
  ]
  
  const highErrors = [
    'permission-denied',
    'unauthenticated',
    'auth/user-disabled'
  ]
  
  const mediumErrors = [
    'auth/wrong-password',
    'auth/user-not-found',
    'not-found'
  ]

  if (criticalErrors.includes(code)) return 'critical'
  if (highErrors.includes(code)) return 'high'
  if (mediumErrors.includes(code)) return 'medium'
  return 'low'
}

// 創建應用錯誤
export const createAppError = (
  error: any,
  context?: string,
  customMessage?: string
): AppError => {
  let code = 'UNKNOWN_ERROR'
  let message = '發生未知錯誤'
  let userMessage = customMessage || '操作失敗，請稍後再試'

  // 處理 Firebase 錯誤
  if (error?.code) {
    code = error.code
    message = error.message || message
    userMessage = FIREBASE_ERROR_MESSAGES[code] || userMessage
  }
  // 處理網路錯誤
  else if (error instanceof TypeError && error.message.includes('fetch')) {
    code = 'NETWORK_ERROR'
    message = '網路請求失敗'
    userMessage = GENERAL_ERROR_MESSAGES[code]
  }
  // 處理一般錯誤
  else if (error instanceof Error) {
    message = error.message
    userMessage = customMessage || '操作失敗，請稍後再試'
  }
  // 處理字串錯誤
  else if (typeof error === 'string') {
    message = error
    userMessage = customMessage || error
  }

  const appError: AppError = {
    code,
    message,
    userMessage,
    context,
    originalError: error,
    severity: getErrorSeverity(code)
  }

  return appError
}

// 錯誤處理器類
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorQueue: AppError[] = []
  private readonly MAX_ERRORS = 50

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // 處理錯誤
  handle(error: any, context?: string, customMessage?: string): AppError {
    const appError = createAppError(error, context, customMessage)
    
    // 記錄錯誤
    this.logError(appError)
    
    // 添加到錯誤隊列
    this.addToQueue(appError)
    
    return appError
  }

  // 記錄錯誤
  private logError(appError: AppError): void {
    const logContext = appError.context || 'ErrorHandler'
    
    switch (appError.severity) {
      case 'critical':
        logger.error(`[CRITICAL] ${appError.message}`, appError.originalError, logContext)
        break
      case 'high':
        logger.error(`[HIGH] ${appError.message}`, appError.originalError, logContext)
        break
      case 'medium':
        logger.warn(`[MEDIUM] ${appError.message}`, appError.originalError, logContext)
        break
      case 'low':
        logger.info(`[LOW] ${appError.message}`, appError.originalError, logContext)
        break
    }
  }

  // 添加到錯誤隊列
  private addToQueue(appError: AppError): void {
    this.errorQueue.push(appError)
    
    if (this.errorQueue.length > this.MAX_ERRORS) {
      this.errorQueue.shift()
    }
  }

  // 獲取錯誤隊列
  getErrorQueue(): AppError[] {
    return [...this.errorQueue]
  }

  // 清除錯誤隊列
  clearErrorQueue(): void {
    this.errorQueue = []
  }

  // 獲取最近的錯誤
  getLastError(): AppError | null {
    return this.errorQueue[this.errorQueue.length - 1] || null
  }

  // 根據嚴重程度過濾錯誤
  getErrorsBySeverity(severity: AppError['severity']): AppError[] {
    return this.errorQueue.filter(error => error.severity === severity)
  }
}

// 創建全域錯誤處理器實例
export const errorHandler = ErrorHandler.getInstance()

// 便捷方法
export const handleError = (
  error: any,
  context?: string,
  customMessage?: string
): AppError => {
  return errorHandler.handle(error, context, customMessage)
}

// 錯誤恢復策略
export interface RetryOptions {
  maxRetries: number
  delay: number
  backoff?: boolean
  shouldRetry?: (error: any) => boolean
}

export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> => {
  const { maxRetries, delay, backoff = true, shouldRetry } = options
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // 如果是最後一次嘗試，直接拋出錯誤
      if (attempt === maxRetries) {
        break
      }

      // 檢查是否應該重試
      if (shouldRetry && !shouldRetry(error)) {
        break
      }

      // 計算延遲時間
      const currentDelay = backoff ? delay * Math.pow(2, attempt) : delay
      
      logger.warn(`操作失敗，${currentDelay}ms 後進行第 ${attempt + 1} 次重試`, error)
      
      await new Promise(resolve => setTimeout(resolve, currentDelay))
    }
  }

  throw lastError
} 