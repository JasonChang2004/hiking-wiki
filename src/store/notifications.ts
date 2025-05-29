// src/store/notifications.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../firebase'
import { collection, query, where, getCountFromServer } from 'firebase/firestore' // getCountFromServer 추가

export const useNotificationsStore = defineStore('notifications', () => {
  const unreadCount = ref(0)

  const fetchUnreadCount = async () => {
    const user = auth.currentUser
    if (!user) {
      unreadCount.value = 0 // Reset if no user
      return
    }
    try {
      const q = query(
        collection(db, 'notifications'),
        where('uid', '==', user.uid),
        where('read', '==', false)
      )
      // Use getCountFromServer for efficiency
      const snapshot = await getCountFromServer(q)
      unreadCount.value = snapshot.data().count
    } catch (error) {
      console.error('Error fetching unread notification count:', error)
      unreadCount.value = 0 // Reset on error
    }
  }

  const resetUnread = () => {
    unreadCount.value = 0
  }

  // Optional: Decrement count locally when a notification is read
  const decrementUnreadCount = (count = 1) => {
    if (unreadCount.value > 0) {
      unreadCount.value = Math.max(0, unreadCount.value - count)
    }
  }

  // Optional: Increment count locally when a new unread notification arrives
  // This would require a listener for new notifications or a manual call
  const incrementUnreadCount = (count = 1) => {
    unreadCount.value += count
  }

  return {
    unreadCount,
    fetchUnreadCount,
    resetUnread,
    decrementUnreadCount, // Expose if needed
    incrementUnreadCount, // Expose if needed
  }
})
