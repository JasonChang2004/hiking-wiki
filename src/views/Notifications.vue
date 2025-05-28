<template>
  <div class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">📬 通知中心</h1>
    <div v-if="notifications.length === 0" class="text-gray-500">目前尚無通知</div>

    <div v-else class="mb-4">
      <button
        class="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
        @click="markAllAsRead"
      >
        全部標記為已讀
      </button>
    </div>

    <ul class="space-y-4">
      <li
        v-for="note in notifications"
        :key="note.id"
        class="bg-white border p-4 rounded shadow hover:bg-gray-50 transition"
      >
        <router-link
          v-if="note.articleId"
          :to="`/articles/${note.articleId}`"
          class="block font-semibold hover:underline"
        >
          {{ note.message }}
        </router-link>
        <p v-else>{{ note.message }}</p>

        <p class="text-sm text-gray-500">{{ formatDate(note.createdAt) }}</p>

        <button
          v-if="!note.read"
          class="text-sm text-blue-600 mt-2"
          @click="markAsRead(note)"
        >
          標記為已讀
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore'

import { useNotificationsStore } from '../store/notifications'

const notificationsStore = useNotificationsStore()
const notifications = ref<any[]>([])

const loadNotifications = async () => {
  const user = auth.currentUser
  if (!user) return

  const q = query(
    collection(db, 'notifications'),
    where('uid', '==', user.uid),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  notifications.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  await notificationsStore.fetchUnreadCount()  // 同步紅點數
}

const markAsRead = async (note: any) => {
  await updateDoc(doc(db, 'notifications', note.id), { read: true })
  await loadNotifications()
}

const markAllAsRead = async () => {
  const user = auth.currentUser
  if (!user) return

  const q = query(
    collection(db, 'notifications'),
    where('uid', '==', user.uid),
    where('read', '==', false)
  )
  const snapshot = await getDocs(q)

  for (const docSnap of snapshot.docs) {
    await updateDoc(doc(db, 'notifications', docSnap.id), { read: true })
  }

  await loadNotifications()
}

const formatDate = (ts: any) => {
  const d = ts?.toDate?.()
  return d ? d.toLocaleString() : ''
}

onMounted(loadNotifications)
</script>
