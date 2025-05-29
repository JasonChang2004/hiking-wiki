<template>
  <div class="notifications-container p-4">
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
              {{ formatDateTime(note.createdAt) }}
            </td>
            
            <!-- 標記為已讀 -->
            <td class="py-2 px-3 border border-wiki-border-light text-center">
              <button
                v-if="!note.read"
                class="text-wiki-link hover:underline text-sm"
                @click="markAsRead(note.id)"
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
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, writeBatch, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { getAuth, type Unsubscribe as AuthUnsubscribe, type User } from 'firebase/auth';
import type { NotificationMessage } from '@/types';
import { formatDateTime } from '@/utils/formatters';
import { useNotificationsStore } from '@/store/notifications';

const notifications = ref<NotificationMessage[]>([]);
const loading = ref(true);
const updateNotification = ref(false)
const currentUser = ref<User | null>(null)
const error = ref<string | null>(null)
const auth = getAuth()
const notificationStore = useNotificationsStore();

let firestoreUnsubscribe: (() => void) | null = null
let authListenerUnsubscribe: AuthUnsubscribe | null = null

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

const fetchNotifications = () => {
  if (!currentUser.value) {
    notifications.value = []
    loading.value = false
    notificationStore.resetUnread();
    return
  }

  loading.value = true
  error.value = null

  const uid = currentUser.value.uid // Safe access after null check

  const notificationsCollection = collection(db, 'notifications')
  const q = query(
    notificationsCollection,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  )

  // 移除先前的監聽器（如果存在）
  if (firestoreUnsubscribe) {
    firestoreUnsubscribe()
  }

  firestoreUnsubscribe = onSnapshot(q, (querySnapshot) => {
    const newNotifications: NotificationMessage[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      newNotifications.push({
        id: doc.id,
        // Ensure createdAt is handled correctly, it might be a Timestamp object
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        ...data,
      } as NotificationMessage)
    })
    notifications.value = newNotifications
    // 根據未讀消息更新商店計數
    const unread = newNotifications.filter(n => !n.read).length;
    notificationStore.unreadCount = unread; // Directly set if possible, or use a dedicated setter method in store.

    loading.value = false
  }, (err) => {
    console.error("Error fetching notifications:", err)
    error.value = "無法載入通知"
    loading.value = false
  })
}

const markAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId)
    await updateDoc(notificationRef, { read: true })
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1 && !notifications.value[index].read) { // Check if it was unread before
      notifications.value[index].read = true
      notificationStore.decrementUnreadCount(); // Use store method
    }
  } catch (err) {
    console.error("Error marking notification as read:", err)
  }
}

const markAllAsRead = async () => {
  if (!currentUser.value || notifications.value.filter(n => !n.read).length === 0) return

  const batch = writeBatch(db)
  let countDecremented = 0
  notifications.value.forEach(notification => {
    if (!notification.read) {
      const notificationRef = doc(db, 'notifications', notification.id)
      batch.update(notificationRef, { read: true })
      countDecremented++
    }
  })

  try {
    await batch.commit()
    notifications.value.forEach(n => n.read = true)
    notificationStore.decrementUnreadCount(countDecremented); // Decrement by the actual number marked read
  } catch (err) {
    console.error("Error marking all notifications as read:", err)
  }
}

onMounted(() => {
  authListenerUnsubscribe = auth.onAuthStateChanged(user => {
    currentUser.value = user // This assignment should be fine now with explicit typing
    fetchNotifications() // 當身份驗證狀態改變時獲取通知
  })
})

onUnmounted(() => {
  if (firestoreUnsubscribe) {
    firestoreUnsubscribe()
  }
  if (authListenerUnsubscribe) {
    authListenerUnsubscribe()
  }
})

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

.notifications-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
