<template>
  <div class="wiki-theme max-w-4xl mx-auto">
    <!-- 維基風格頁面標題 -->
    <h1 class="text-3xl font-normal border-b border-wiki-border-light pb-2 mb-4">
      通知中心
    </h1>
    
    <!-- 功能區 -->
    <div v-if="notifications.length > 0" class="mb-4 text-right">
      <button
        class="text-wiki-link hover:underline text-sm"
        @click="markAllAsRead"
      >
        標記全部為已讀
      </button>
    </div>
    
    <!-- 載入中 -->
    <div v-if="loading" class="wiki-notice">
      <p>正在載入通知...</p>
    </div>

    <!-- 空狀態 -->
    <div v-else-if="notifications.length === 0" class="wiki-notice py-8 text-center">
      <p class="mb-2">目前沒有通知</p>
      <p class="text-sm text-gray-600">
        當有新文章、留言回覆或內容審核進度更新時，系統會在此通知您
      </p>
    </div>
    
    <!-- 通知列表 - 維基風格 -->
    <div v-else>
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="text-left py-2 px-3 bg-wiki-bg-light border border-wiki-border-light">狀態</th>
            <th class="text-left py-2 px-3 bg-wiki-bg-light border border-wiki-border-light">通知內容</th>
            <th class="text-left py-2 px-3 bg-wiki-bg-light border border-wiki-border-light">時間</th>
            <th class="text-left py-2 px-3 bg-wiki-bg-light border border-wiki-border-light">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="note in notifications" :key="note.id" :class="{'bg-wiki-bg-light': !note.read}">
            <!-- 狀態 -->
            <td class="py-2 px-3 border border-wiki-border-light text-center">
              <span class="text-lg" :title="getNotificationTypeText(note.type)">
                {{ getNotificationIcon(note.type) }}
              </span>
            </td>
            
            <!-- 內容 -->
            <td class="py-2 px-3 border border-wiki-border-light">
              <router-link
                v-if="note.articleId"
                :to="`/articles/${note.articleId}`"
                class="text-wiki-link hover:underline"
              >
                {{ note.message }}
              </router-link>
              <span v-else>{{ note.message }}</span>
            </td>
            
            <!-- 時間 -->
            <td class="py-2 px-3 border border-wiki-border-light text-sm text-gray-600">
              {{ formatDate(note.createdAt) }}
            </td>
            
            <!-- 標記為已讀 -->
            <td class="py-2 px-3 border border-wiki-border-light text-center">
              <button
                v-if="!note.read"
                class="text-wiki-link hover:underline text-sm"
                @click="markAsRead(note)"
                title="標記為已讀"
              >
                標為已讀
              </button>
              <span v-else class="text-sm text-gray-500">已讀</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 更新通知 -->
    <div v-if="updateNotification" class="fixed bottom-5 right-5 border border-wiki-border-light bg-wiki-bg-light px-4 py-2 text-sm">
      通知已更新
    </div>
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
const loading = ref(true)
const updateNotification = ref(false)

// 根據通知類型返回適當的圖標
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'article_published':
      return '📄';
    case 'article_approved':
      return '✅';
    case 'article_rejected':
      return '❌';
    case 'comment':
      return '💬';
    case 'mention':
      return '📣';
    case 'system':
      return '⚙️';
    default:
      return '🔔';
  }
}

// 返回通知類型的文字描述
const getNotificationTypeText = (type: string) => {
  switch (type) {
    case 'article_published':
      return '文章發布';
    case 'article_approved':
      return '文章通過審核';
    case 'article_rejected':
      return '文章被拒絕';
    case 'comment':
      return '新評論';
    case 'mention':
      return '有人提及您';
    case 'system':
      return '系統通知';
    default:
      return '通知';
  }
}

const loadNotifications = async () => {
  try {
    loading.value = true
    const user = auth.currentUser
    if (!user) {
      notifications.value = []
      return
    }

    const q = query(
      collection(db, 'notifications'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    notifications.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    await notificationsStore.fetchUnreadCount()  // 同步紅點數
  } catch (error) {
    console.error('無法載入通知:', error)
  } finally {
    loading.value = false
  }
}

const markAsRead = async (note: any) => {
  try {
    await updateDoc(doc(db, 'notifications', note.id), { read: true })
    await loadNotifications()
    
    // 顯示確認通知
    updateNotification.value = true
    setTimeout(() => {
      updateNotification.value = false
    }, 2000)
  } catch (error) {
    console.error('無法標記為已讀:', error)
  }
}

const markAllAsRead = async () => {
  const user = auth.currentUser
  if (!user) return

  try {
    const q = query(
      collection(db, 'notifications'),
      where('uid', '==', user.uid),
      where('read', '==', false)
    )
    const snapshot = await getDocs(q)
    
    if (snapshot.docs.length === 0) return
    
    for (const docSnap of snapshot.docs) {
      await updateDoc(doc(db, 'notifications', docSnap.id), { read: true })
    }
    
    await loadNotifications()
    
    // 顯示確認通知
    updateNotification.value = true
    setTimeout(() => {
      updateNotification.value = false
    }, 2000)
  } catch (error) {
    console.error('無法標記全部為已讀:', error)
  }
}

const formatDate = (ts: any) => {
  if (!ts) return ''
  
  const d = ts?.toDate?.()
  if (!d) return ''
  
  // 如果是今天的日期，只顯示時間
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const notificationDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  
  if (notificationDate.getTime() === today.getTime()) {
    return `今天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  } 
  
  // 昨天
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (notificationDate.getTime() === yesterday.getTime()) {
    return `昨天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }
  
  // 當年的其它日期顯示月和日
  if (d.getFullYear() === now.getFullYear()) {
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }
  
  // 跨年顯示完整日期
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

onMounted(loadNotifications)
</script>

<style scoped>
.wiki-theme {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.wiki-notice {
  background-color: #e1f5fe;
  color: #01579b;
  padding: 10px 15px;
  border-left: 4px solid #01579b;
  border-radius: 4px;
  margin-bottom: 16px;
}

.text-wiki-link {
  color: #007bff;
  text-decoration: none;
}

.text-wiki-link:hover {
  text-decoration: underline;
}

.bg-wiki-bg-light {
  background-color: #f1f8e9;
}

.border-wiki-border-light {
  border-color: #d1e7dd;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.3s ease forwards;
}
</style>
