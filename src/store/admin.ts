import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../firebase'
import { collection, query, where, getCountFromServer } from 'firebase/firestore'

export const useAdminStore = defineStore('admin', () => {
  const pendingArticlesCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchPendingArticlesCount = async () => {
    const user = auth.currentUser
    if (!user) {
      pendingArticlesCount.value = 0
      return
    }

    try {
      isLoading.value = true
      error.value = null

      const q = query(
        collection(db, 'articles'),
        where('status', '==', 'pending')
      )
      
      const snapshot = await getCountFromServer(q)
      const count = snapshot.data().count
      
      // 確保計數為有效數字
      pendingArticlesCount.value = typeof count === 'number' && count >= 0 ? count : 0
      
    } catch (err) {
      console.error('Error fetching pending articles count:', err)
      pendingArticlesCount.value = 0
      error.value = '無法載入待審核文章計數'
    } finally {
      isLoading.value = false
    }
  }

  const resetPendingCount = () => {
    pendingArticlesCount.value = 0
    error.value = null
  }

  // 手動減少待審核計數
  const decrementPendingCount = (count = 1) => {
    if (pendingArticlesCount.value > 0) {
      pendingArticlesCount.value = Math.max(0, pendingArticlesCount.value - count)
    }
  }

  // 手動增加待審核計數
  const incrementPendingCount = (count = 1) => {
    pendingArticlesCount.value += count
  }

  // 強制重新載入計數
  const refreshPendingCount = async () => {
    await fetchPendingArticlesCount()
  }

  return {
    pendingArticlesCount,
    isLoading,
    error,
    fetchPendingArticlesCount,
    resetPendingCount,
    decrementPendingCount,
    incrementPendingCount,
    refreshPendingCount
  }
}) 