/**
 * 統一的日誌系統
 * 開發環境顯示所有日誌，生產環境只顯示錯誤
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: string
  context?: string
}

class Logger {
  private isDevelopment = import.meta.env.DEV
  private logs: LogEntry[] = []
  private maxLogs = 100

  private createLogEntry(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      level,
      message,
      data,
      context,
      timestamp: new Date().toISOString()
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true
    return level === 'error' || level === 'warn'
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = entry.context ? `[${entry.context}]` : ''
    return `${prefix} ${entry.message}`
  }

  debug(message: string, data?: any, context?: string) {
    const entry = this.createLogEntry('debug', message, data, context)
    this.addToHistory(entry)
    
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage(entry), data || '')
    }
  }

  info(message: string, data?: any, context?: string) {
    const entry = this.createLogEntry('info', message, data, context)
    this.addToHistory(entry)
    
    if (this.shouldLog('info')) {
      console.info(this.formatMessage(entry), data || '')
    }
  }

  warn(message: string, data?: any, context?: string) {
    const entry = this.createLogEntry('warn', message, data, context)
    this.addToHistory(entry)
    
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage(entry), data || '')
    }
  }

  error(message: string, error?: any, context?: string) {
    const entry = this.createLogEntry('error', message, error, context)
    this.addToHistory(entry)
    
    if (this.shouldLog('error')) {
      console.error(this.formatMessage(entry), error || '')
      
      // 生產環境可以發送錯誤到監控服務
      if (!this.isDevelopment) {
        this.reportError(entry)
      }
    }
  }

  private addToHistory(entry: LogEntry) {
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  private reportError(entry: LogEntry) {
    // 未來可以整合 Sentry 或其他錯誤監控服務
    // 目前僅在本地儲存錯誤資訊
    try {
      const errorReport = {
        ...entry,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
      localStorage.setItem('lastError', JSON.stringify(errorReport))
    } catch (e) {
      // 忽略儲存錯誤
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (!level) return this.logs
    return this.logs.filter(log => log.level === level)
  }

  clearLogs() {
    this.logs = []
  }

  // 為特定功能模組創建帶上下文的日誌器
  createContextLogger(context: string) {
    return {
      debug: (message: string, data?: any) => this.debug(message, data, context),
      info: (message: string, data?: any) => this.info(message, data, context),
      warn: (message: string, data?: any) => this.warn(message, data, context),
      error: (message: string, error?: any) => this.error(message, error, context)
    }
  }
}

export const logger = new Logger()

// 為主要模組創建上下文日誌器
export const authLogger = logger.createContextLogger('Auth')
export const articlesLogger = logger.createContextLogger('Articles')
export const firebaseLogger = logger.createContextLogger('Firebase')
export const uiLogger = logger.createContextLogger('UI')
export const adminLogger = logger.createContextLogger('Admin') 