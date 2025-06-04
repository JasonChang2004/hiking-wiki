/**
 * 性能監控工具
 * 提供性能指標收集、分析和優化建議
 */

import { logger } from './logger'

// 性能指標接口
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  context?: string
}

// 性能監控類
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []
  private readonly MAX_METRICS = 1000

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // 初始化性能監控
  init(): void {
    if (typeof window === 'undefined') return

    this.observeNavigationTiming()
    this.observeResourceTiming()
    this.observeLargestContentfulPaint()
    this.observeFirstInputDelay()
    this.observeCumulativeLayoutShift()
    
    logger.info('性能監控已啟動', undefined, 'Performance')
  }

  // 監控導航時間
  private observeNavigationTiming(): void {
    if (!('performance' in window)) return

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          this.recordMetric('domContentLoaded', navigation.domContentLoadedEventEnd - navigation.fetchStart)
          this.recordMetric('loadComplete', navigation.loadEventEnd - navigation.fetchStart)
          this.recordMetric('dnsLookup', navigation.domainLookupEnd - navigation.domainLookupStart)
          this.recordMetric('tcpConnect', navigation.connectEnd - navigation.connectStart)
          this.recordMetric('serverResponse', navigation.responseEnd - navigation.requestStart)
          this.recordMetric('domProcessing', navigation.domComplete - navigation.responseEnd)
        }
      }, 0)
    })
  }

  // 監控資源載入時間
  private observeResourceTiming(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming
            this.recordMetric(
              `resource_${this.getResourceType(resource.name)}`,
              resource.responseEnd - resource.startTime,
              resource.name
            )
          }
        }
      })

      observer.observe({ type: 'resource', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      logger.warn('資源時間監控初始化失敗', error, 'Performance')
    }
  }

  // 監控最大內容繪製 (LCP)
  private observeLargestContentfulPaint(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        
        if (lastEntry) {
          this.recordMetric('largestContentfulPaint', lastEntry.startTime)
        }
      })

      observer.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      logger.warn('LCP監控初始化失敗', error, 'Performance')
    }
  }

  // 監控首次輸入延遲 (FID)
  private observeFirstInputDelay(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            const fid = (entry as any).processingStart - entry.startTime
            this.recordMetric('firstInputDelay', fid)
          }
        }
      })

      observer.observe({ type: 'first-input', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      logger.warn('FID監控初始化失敗', error, 'Performance')
    }
  }

  // 監控累積佈局偏移 (CLS)
  private observeCumulativeLayoutShift(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      let clsValue = 0

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        
        this.recordMetric('cumulativeLayoutShift', clsValue)
      })

      observer.observe({ type: 'layout-shift', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      logger.warn('CLS監控初始化失敗', error, 'Performance')
    }
  }

  // 記錄自定義指標
  recordMetric(name: string, value: number, context?: string): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      context
    }

    this.metrics.push(metric)

    // 限制指標數量
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }

    // 記錄到日誌
    logger.debug(`性能指標: ${name} = ${value.toFixed(2)}ms`, { context }, 'Performance')
  }

  // 測量函數執行時間
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    
    this.recordMetric(name, end - start)
    return result
  }

  // 測量異步函數執行時間
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    
    this.recordMetric(name, end - start)
    return result
  }

  // 獲取性能報告
  getPerformanceReport(): {
    summary: Record<string, { avg: number; min: number; max: number; count: number }>
    recommendations: string[]
    webVitals: Record<string, number>
  } {
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {}
    const webVitals: Record<string, number> = {}

    // 分組並統計指標
    const metricGroups = this.groupMetricsByName()
    
    for (const [name, metrics] of Object.entries(metricGroups)) {
      const values = metrics.map(m => m.value)
      summary[name] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      }

      // 記錄Web Vitals
      if (['largestContentfulPaint', 'firstInputDelay', 'cumulativeLayoutShift'].includes(name)) {
        webVitals[name] = summary[name].avg
      }
    }

    const recommendations = this.generateRecommendations(summary, webVitals)

    return { summary, recommendations, webVitals }
  }

  // 分組指標
  private groupMetricsByName(): Record<string, PerformanceMetric[]> {
    return this.metrics.reduce((groups, metric) => {
      if (!groups[metric.name]) {
        groups[metric.name] = []
      }
      groups[metric.name].push(metric)
      return groups
    }, {} as Record<string, PerformanceMetric[]>)
  }

  // 生成優化建議
  private generateRecommendations(
    summary: Record<string, { avg: number; min: number; max: number; count: number }>,
    webVitals: Record<string, number>
  ): string[] {
    const recommendations: string[] = []

    // LCP 建議 (應小於 2.5s)
    if (webVitals.largestContentfulPaint > 2500) {
      recommendations.push('最大內容繪製時間過長，建議優化圖片載入和減少渲染阻塞資源')
    }

    // FID 建議 (應小於 100ms)
    if (webVitals.firstInputDelay > 100) {
      recommendations.push('首次輸入延遲過長，建議減少主線程阻塞和優化JavaScript執行')
    }

    // CLS 建議 (應小於 0.1)
    if (webVitals.cumulativeLayoutShift > 0.1) {
      recommendations.push('累積佈局偏移過大，建議為圖片和廣告預留空間')
    }

    // 載入時間建議
    if (summary.loadComplete?.avg > 3000) {
      recommendations.push('頁面載入時間過長，建議啟用代碼分割和懶加載')
    }

    // 資源載入建議
    if (summary.resource_image?.avg > 1000) {
      recommendations.push('圖片載入時間過長，建議優化圖片格式和大小')
    }

    if (summary.resource_script?.avg > 500) {
      recommendations.push('腳本載入時間過長，建議壓縮和合併JavaScript文件')
    }

    return recommendations
  }

  // 獲取資源類型
  private getResourceType(url: string): string {
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)) return 'image'
    if (url.match(/\.(js|mjs)(\?|$)/i)) return 'script'
    if (url.match(/\.(css)(\?|$)/i)) return 'stylesheet'
    if (url.match(/\.(woff|woff2|ttf|eot)(\?|$)/i)) return 'font'
    return 'other'
  }

  // 清理資源
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics = []
    
    logger.info('性能監控已清理', undefined, 'Performance')
  }

  // 獲取所有指標
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  // 清除指標
  clearMetrics(): void {
    this.metrics = []
  }
}

// 創建全域實例
export const performanceMonitor = PerformanceMonitor.getInstance()

// 便捷方法
export const measureTime = <T>(name: string, fn: () => T): T => {
  return performanceMonitor.measureFunction(name, fn)
}

export const measureAsyncTime = <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  return performanceMonitor.measureAsyncFunction(name, fn)
}

// 自動初始化 (僅在瀏覽器環境)
if (typeof window !== 'undefined') {
  // 延遲初始化以避免影響應用啟動
  setTimeout(() => {
    performanceMonitor.init()
  }, 1000)
} 