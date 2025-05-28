// src/store/notifications.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export const useNotificationsStore = defineStore('notifications', () => {
  const unreadCount = ref(0)

  const fetchUnreadCount = async () => {
    const user = auth.currentUser
    if (!user) return
    const q = query(
      collection(db, 'notifications'),
      where('uid', '==', user.uid),
      where('read', '==', false)
    )
    const snapshot = await getDocs(q)
    unreadCount.value = snapshot.size
  }

  const resetUnread = () => {
    unreadCount.value = 0
  }

  return {
    unreadCount,
    fetchUnreadCount,
    resetUnread,
  }
})
