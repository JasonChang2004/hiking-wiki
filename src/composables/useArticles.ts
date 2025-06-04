import { ref, computed, readonly } from 'vue'
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  QueryConstraint 
} from 'firebase/firestore'
import { db } from '@/firebase'
import type { Article } from '@/types'
import { articlesLogger } from '@/utils/logger'

// 文章查詢選項類型
interface ArticleQueryOptions {
  category?: string
  status?: string
  uid?: string
  featured?: boolean
  searchTerm?: string
  limitCount?: number
  orderByField?: string
  orderByDirection?: 'asc' | 'desc'
}

// 文章操作錯誤類型
interface ArticleError {
  code: string
  message: string
  context?: string
}

// 簡單的內存緩存實現
class ArticleCache {
  private cache = new Map<string, { data: Article[], timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5分鐘緩存

  set(key: string, data: Article[]): void {
    this.cache.set(key, {
      data: [...data], // 深度複製避免引用問題
      timestamp: Date.now()
    })
  }

  get(key: string): Article[] | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return [...cached.data] // 返回副本
  }

  clear(): void {
    this.cache.clear()
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.clear()
      return
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

const articleCache = new ArticleCache()

export function useArticles() {
  const articles = ref<Article[]>([])
  const isLoading = ref(false)
  const error = ref<ArticleError | null>(null)
  const hasMore = ref(true)

  // 生成緩存鍵
  const generateCacheKey = (options: ArticleQueryOptions): string => {
    return JSON.stringify(options)
  }

  // 創建錯誤對象
  const createError = (message: string, code: string = 'UNKNOWN_ERROR', context?: string): ArticleError => {
    return { code, message, context }
  }

  // 獲取文章列表
  const fetchArticles = async (options: ArticleQueryOptions = {}): Promise<Article[]> => {
    try {
      isLoading.value = true
      error.value = null

      const {
        category,
        status = 'approved',
        uid,
        featured,
        searchTerm,
        limitCount = 10,
        orderByField = 'createdAt',
        orderByDirection = 'desc'
      } = options

      // 檢查緩存
      const cacheKey = generateCacheKey(options)
      const cachedData = articleCache.get(cacheKey)
      if (cachedData && !searchTerm) { // 搜索不使用緩存
        articlesLogger.debug('使用緩存數據', { cacheKey, count: cachedData.length })
        articles.value = cachedData
        hasMore.value = cachedData.length === limitCount
        return cachedData
      }

      articlesLogger.info('獲取文章列表', options)

      // 構建查詢條件
      const constraints: QueryConstraint[] = []

      if (status) {
        constraints.push(where('status', '==', status))
      }

      if (category && category !== '所有文章') {
        constraints.push(where('category', '==', category))
      }

      if (uid) {
        constraints.push(where('uid', '==', uid))
      }

      if (featured !== undefined) {
        constraints.push(where('isFeatured', '==', featured))
      }

      // 添加排序和限制
      constraints.push(orderBy(orderByField, orderByDirection))
      constraints.push(limit(limitCount))

      const q = query(collection(db, 'articles'), ...constraints)
      const querySnapshot = await getDocs(q)

      let results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[]

      // 客戶端搜索（因為 Firestore 的文本搜索限制）
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        results = results.filter(article => 
          article.title.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower)
        )
        articlesLogger.debug('搜索結果過濾', { 
          searchTerm, 
          originalCount: querySnapshot.docs.length,
          filteredCount: results.length 
        })
      }

      // 緩存結果（搜索結果不緩存）
      if (!searchTerm) {
        articleCache.set(cacheKey, results)
      }

      articles.value = results
      hasMore.value = results.length === limitCount

      articlesLogger.info('文章列表獲取成功', { count: results.length })
      return results
    } catch (err) {
      const errorMessage = '獲取文章失敗，請稍後再試'
      articlesLogger.error('獲取文章失敗', err)
      error.value = createError(errorMessage, 'FETCH_ARTICLES_ERROR', 'fetchArticles')
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 獲取單篇文章
  const fetchArticleById = async (id: string): Promise<Article | null> => {
    try {
      isLoading.value = true
      error.value = null

      articlesLogger.info('獲取文章詳情', { articleId: id })

      const docRef = doc(db, 'articles', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const article = {
          id: docSnap.id,
          ...docSnap.data()
        } as Article

        articlesLogger.info('文章詳情獲取成功', { articleId: id, title: article.title })
        return article
      } else {
        const errorMessage = '找不到該文章'
        articlesLogger.warn('文章不存在', { articleId: id })
        error.value = createError(errorMessage, 'ARTICLE_NOT_FOUND', 'fetchArticleById')
        return null
      }
    } catch (err) {
      const errorMessage = '獲取文章詳情失敗'
      articlesLogger.error('獲取文章詳情失敗', err)
      error.value = createError(errorMessage, 'FETCH_ARTICLE_ERROR', 'fetchArticleById')
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 創建文章
  const createArticle = async (articleData: Omit<Article, 'id' | 'createdAt'>): Promise<string> => {
    try {
      isLoading.value = true
      error.value = null

      articlesLogger.info('創建文章', { title: articleData.title, category: articleData.category })

      const docRef = await addDoc(collection(db, 'articles'), {
        ...articleData,
        createdAt: serverTimestamp()
      })

      // 清除相關緩存
      articleCache.invalidate()

      articlesLogger.info('文章創建成功', { articleId: docRef.id, title: articleData.title })
      return docRef.id
    } catch (err) {
      const errorMessage = '創建文章失敗，請稍後再試'
      articlesLogger.error('創建文章失敗', err)
      error.value = createError(errorMessage, 'CREATE_ARTICLE_ERROR', 'createArticle')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 更新文章
  const updateArticle = async (id: string, updates: Partial<Article>): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      articlesLogger.info('更新文章', { articleId: id, updates: Object.keys(updates) })

      const docRef = doc(db, 'articles', id)
      await updateDoc(docRef, updates)

      // 更新本地狀態
      const index = articles.value.findIndex(article => article.id === id)
      if (index !== -1) {
        articles.value[index] = { ...articles.value[index], ...updates }
      }

      // 清除相關緩存
      articleCache.invalidate()

      articlesLogger.info('文章更新成功', { articleId: id })
    } catch (err) {
      const errorMessage = '更新文章失敗，請稍後再試'
      articlesLogger.error('更新文章失敗', err)
      error.value = createError(errorMessage, 'UPDATE_ARTICLE_ERROR', 'updateArticle')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 刪除文章
  const deleteArticle = async (id: string): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      articlesLogger.info('刪除文章', { articleId: id })

      const docRef = doc(db, 'articles', id)
      await deleteDoc(docRef)

      // 更新本地狀態
      articles.value = articles.value.filter(article => article.id !== id)

      // 清除相關緩存
      articleCache.invalidate()

      articlesLogger.info('文章刪除成功', { articleId: id })
    } catch (err) {
      const errorMessage = '刪除文章失敗，請稍後再試'
      articlesLogger.error('刪除文章失敗', err)
      error.value = createError(errorMessage, 'DELETE_ARTICLE_ERROR', 'deleteArticle')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 計算屬性
  const featuredArticles = computed(() => 
    articles.value.filter(article => article.isFeatured)
  )

  const latestArticles = computed(() => 
    articles.value.slice(0, 5)
  )

  const categoryArticles = computed(() => (category: string) =>
    articles.value.filter(article => article.category === category)
  )

  // 清除文章列表
  const clearArticles = (): void => {
    articles.value = []
    error.value = null
    hasMore.value = true
    articlesLogger.debug('清除文章列表')
  }

  // 清除錯誤
  const clearError = (): void => {
    error.value = null
  }

  // 刷新緩存
  const refreshCache = (): void => {
    articleCache.clear()
    articlesLogger.info('文章緩存已清除')
  }

  return {
    // 狀態 (readonly)
    articles: readonly(articles),
    isLoading: readonly(isLoading),
    error: readonly(error),
    hasMore: readonly(hasMore),

    // 計算屬性
    featuredArticles,
    latestArticles,
    categoryArticles,

    // 方法
    fetchArticles,
    fetchArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    clearArticles,
    clearError,
    refreshCache
  }
}

// 導出類型
export type { ArticleQueryOptions, ArticleError } 