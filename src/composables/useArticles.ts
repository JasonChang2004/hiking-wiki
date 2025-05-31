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

export function useArticles() {
  const articles = ref<Article[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasMore = ref(true)

  // 獲取文章列表
  const fetchArticles = async (options: {
    category?: string
    status?: string
    uid?: string
    featured?: boolean
    searchTerm?: string
    limitCount?: number
    orderByField?: string
    orderByDirection?: 'asc' | 'desc'
  } = {}) => {
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
      }

      articles.value = results
      hasMore.value = results.length === limitCount

      return results
    } catch (err) {
      console.error('獲取文章失敗:', err)
      error.value = '獲取文章失敗，請稍後再試'
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

      const docRef = doc(db, 'articles', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Article
      } else {
        error.value = '找不到該文章'
        return null
      }
    } catch (err) {
      console.error('獲取文章詳情失敗:', err)
      error.value = '獲取文章詳情失敗'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 創建文章
  const createArticle = async (articleData: Omit<Article, 'id' | 'createdAt'>) => {
    try {
      isLoading.value = true
      error.value = null

      const docRef = await addDoc(collection(db, 'articles'), {
        ...articleData,
        createdAt: serverTimestamp()
      })

      return docRef.id
    } catch (err) {
      console.error('創建文章失敗:', err)
      error.value = '創建文章失敗，請稍後再試'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 更新文章
  const updateArticle = async (id: string, updates: Partial<Article>) => {
    try {
      isLoading.value = true
      error.value = null

      const docRef = doc(db, 'articles', id)
      await updateDoc(docRef, updates)

      // 更新本地狀態
      const index = articles.value.findIndex(article => article.id === id)
      if (index !== -1) {
        articles.value[index] = { ...articles.value[index], ...updates }
      }
    } catch (err) {
      console.error('更新文章失敗:', err)
      error.value = '更新文章失敗，請稍後再試'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 刪除文章
  const deleteArticle = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null

      const docRef = doc(db, 'articles', id)
      await deleteDoc(docRef)

      // 更新本地狀態
      articles.value = articles.value.filter(article => article.id !== id)
    } catch (err) {
      console.error('刪除文章失敗:', err)
      error.value = '刪除文章失敗，請稍後再試'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 計算屬性
  const featuredArticles = computed(() => 
    articles.value.filter(article => article.isFeatured)
  )

  const approvedArticles = computed(() => 
    articles.value.filter(article => article.status === 'approved')
  )

  const pendingArticles = computed(() => 
    articles.value.filter(article => article.status === 'pending')
  )

  // 清理狀態
  const clearArticles = () => {
    articles.value = []
    error.value = null
    hasMore.value = true
  }

  return {
    // 狀態
    articles: readonly(articles),
    isLoading: readonly(isLoading),
    error: readonly(error),
    hasMore: readonly(hasMore),
    
    // 計算屬性
    featuredArticles,
    approvedArticles,
    pendingArticles,
    
    // 方法
    fetchArticles,
    fetchArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    clearArticles
  }
} 