// src/store/notifications.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../firebase'
import { collection, query, where, getCountFromServer } from 'firebase/firestore'

export const useNotificationsStore = defineStore('notifications', () => {
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchUnreadCount = async () => {
    const user = auth.currentUser
    if (!user) {
      unreadCount.value = 0
      return
    }

    try {
      isLoading.value = true
      error.value = null

      const q = query(
        collection(db, 'notifications'),
        where('uid', '==', user.uid),
        where('read', '==', false)
      )
      
      const snapshot = await getCountFromServer(q)
      const count = snapshot.data().count
      
      // 確保計數為有效數字
      unreadCount.value = typeof count === 'number' && count >= 0 ? count : 0
      
    } catch (err) {
      console.error('Error fetching unread notification count:', err)
      unreadCount.value = 0
      error.value = '無法載入通知計數'
    } finally {
      isLoading.value = false
    }
  }

  const resetUnread = () => {
    unreadCount.value = 0
    error.value = null
  }

  // 手動減少未讀計數
  const decrementUnreadCount = (count = 1) => {
    if (unreadCount.value > 0) {
      unreadCount.value = Math.max(0, unreadCount.value - count)
    }
  }

  // 手動增加未讀計數
  const incrementUnreadCount = (count = 1) => {
    unreadCount.value += count
  }

  // 強制重新載入計數
  const refreshUnreadCount = async () => {
    await fetchUnreadCount()
  }

  return {
    unreadCount,
    isLoading,
    error,
    fetchUnreadCount,
    resetUnread,
    decrementUnreadCount,
    incrementUnreadCount,
    refreshUnreadCount
  }
})
