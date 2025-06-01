<template>
  <div class="mountain-notifications">
    <div class="container">
      <!-- 頁面標題區塊 -->
      <div class="notifications-header">
        <div class="header-content">
          <h1 class="notifications-title">
            <span class="title-icon">🔔</span>
            通知中心
          </h1>
          <p class="notifications-description">
            查看您的文章、留言和系統通知
          </p>
        </div>
      </div>

      <!-- 功能區 -->
      <div v-if="notifications.length > 0" class="actions-bar">
        <div class="notification-stats">
          <span class="stats-text">
            共 {{ notifications.length }} 則通知，
            <span class="unread-count">{{ notifications.filter(n => !n.read).length }} 則未讀</span>
          </span>
        </div>
        <button
          class="btn btn-outline btn-sm"
          @click="markAllAsRead"
          :disabled="notifications.filter(n => !n.read).length === 0"
        >
          <span class="btn-icon">✅</span>
          標記全部為已讀
        </button>
      </div>

      <!-- 載入中 -->
      <div v-if="loading" class="loading-section">
        <div class="loading-grid">
          <div v-for="i in 3" :key="i" class="loading-card">
            <div class="loading-shimmer"></div>
          </div>
        </div>
        <p class="loading-text">🔄 正在載入通知...</p>
      </div>

      <!-- 空狀態 -->
      <div v-else-if="notifications.length === 0" class="empty-state">
        <div class="empty-icon">🔔</div>
        <h3 class="empty-title">目前沒有通知</h3>
        <p class="empty-description">
          當有新文章、留言回覆或內容審核進度更新時，系統會在此通知您
        </p>
        <div class="empty-actions">
          <router-link to="/" class="btn btn-primary">
            <span class="btn-icon">🏠</span>
            返回首頁
          </router-link>
        </div>
      </div>

      <!-- 通知卡片列表 -->
      <div v-else class="notifications-list">
        <div
          v-for="(note, index) in notifications"
          :key="note.id"
          class="notification-card"
          :class="{ 'unread': !note.read }"
          :style="{ '--delay': index * 0.1 + 's' }"
        >
          <!-- 通知圖示和類型 -->
          <div class="notification-icon">
            <span class="icon" :title="getNotificationTypeText(note.type)">
              {{ getNotificationIcon(note.type) }}
            </span>
            <div v-if="!note.read" class="unread-dot"></div>
          </div>

          <!-- 通知內容 -->
          <div class="notification-content">
            <div class="notification-message">
              <router-link
                v-if="note.articleId"
                :to="`/articles/${note.articleId}`"
                class="message-link"
              >
                {{ note.message }}
              </router-link>
              <span v-else class="message-text">{{ note.message }}</span>
            </div>
            <div class="notification-meta">
              <span class="notification-time">{{ formatDateTime(note.createdAt) }}</span>
              <span class="notification-type">{{ getNotificationTypeText(note.type) }}</span>
            </div>
          </div>

          <!-- 操作按鈕 -->
          <div class="notification-actions">
            <button
              v-if="!note.read"
              class="mark-read-btn"
              @click="markAsRead(note.id)"
              title="標記為已讀"
            >
              <span class="btn-icon">✓</span>
            </button>
            <span v-else class="read-indicator" title="已讀">
              <span class="read-icon">✓</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 更新提示 -->
    <div v-if="updateNotification" class="update-toast">
      <span class="toast-icon">🔄</span>
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
    // 先找到通知的索引
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index === -1) {
      console.error("Notification not found:", notificationId)
      return
    }

    const notification = notifications.value[index]

    // 檢查是否已經是已讀狀態
    if (notification.read) {
      return
    }

    // 檢查權限
    if (notification.uid !== currentUser.value?.uid) {
      console.error("Permission denied: notification uid doesn't match current user")
      alert('沒有權限修改此通知')
      return
    }

    // 立即更新本地狀態以提供即時反饋
    const wasUnread = !notification.read
    notifications.value[index].read = true

    // 更新 Firebase - 只更新 read 字段
    const notificationRef = doc(db, 'notifications', notificationId)
    await updateDoc(notificationRef, { 
      read: true
    })

    // 如果原本是未讀狀態，則減少未讀計數
    if (wasUnread) {
      notificationStore.decrementUnreadCount()
    }

  } catch (err) {
    console.error("Error marking notification as read:", err)
    
    // 如果更新失敗，回滾本地狀態
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      notifications.value[index].read = false
    }
    
    // 顯示錯誤提示
    alert(`標記已讀失敗：${(err as Error)?.message || '未知錯誤'}`)
  }
}

const markAllAsRead = async () => {
  console.log('markAllAsRead called')
  
  if (!currentUser.value) {
    console.error('No current user')
    alert('請先登入')
    return
  }

  const unreadNotifications = notifications.value.filter(n => !n.read)
  console.log('Unread notifications:', unreadNotifications.length)
  
  if (unreadNotifications.length === 0) {
    alert('沒有未讀通知')
    return
  }

  try {
    console.log('Starting batch update...')
    
    // 批量更新 Firebase (先不更新本地狀態)
    const batch = writeBatch(db)
    unreadNotifications.forEach(notification => {
      const notificationRef = doc(db, 'notifications', notification.id)
      batch.update(notificationRef, { read: true })
      console.log('Added to batch:', notification.id)
    })

    console.log('Committing batch...')
    await batch.commit()
    console.log('Batch committed successfully')

    // 更新本地狀態 (Firebase 實時監聽器會自動更新，但我們也手動更新確保即時反饋)
    notifications.value.forEach(n => {
      if (!n.read) {
        n.read = true
      }
    })

    // 更新未讀計數
    notificationStore.decrementUnreadCount(unreadNotifications.length)

    console.log(`Successfully marked ${unreadNotifications.length} notifications as read`)
    
    // 顯示成功訊息
    updateNotification.value = true
    setTimeout(() => {
      updateNotification.value = false
    }, 3000)
    
  } catch (err) {
    console.error("Detailed error in markAllAsRead:", err)
    
    const error = err as Error
    console.error("Error name:", error?.name)
    console.error("Error message:", error?.message)
    console.error("Error stack:", error?.stack)
    
    alert(`標記全部已讀失敗：${error?.message || '未知錯誤'}`)
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
.mountain-notifications {
  font-family: var(--font-body);
  min-height: 100vh;
  background: linear-gradient(135deg, 
    var(--mountain-50) 0%,
    var(--sky-50) 50%,
    var(--earth-50) 100%
  );
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* 頁面標題區塊 */
.notifications-header {
  text-align: center;
  margin-bottom: 2rem;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
}

.notifications-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--stone-dark);
  margin-bottom: 1rem;
  font-family: var(--font-display);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 2rem;
}

.notifications-description {
  font-size: 1.1rem;
  color: var(--stone-medium);
  line-height: 1.6;
  margin: 0;
}

/* 功能區 */
.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  flex-wrap: wrap;
  gap: 1rem;
}

.notification-stats {
  flex: 1;
}

.stats-text {
  color: var(--stone-dark);
  font-size: 0.875rem;
}

.unread-count {
  color: var(--mountain-primary);
  font-weight: 600;
}

/* 載入狀態 */
.loading-section {
  text-align: center;
  margin: 3rem 0;
}

.loading-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.loading-card {
  height: 120px;
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.loading-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    rgba(255,255,255,0) 0%, 
    rgba(255,255,255,0.8) 50%, 
    rgba(255,255,255,0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.loading-text {
  color: var(--stone-medium);
  font-size: 1rem;
  margin: 0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  max-width: 500px;
  margin: 3rem auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: 1rem;
  font-family: var(--font-display);
}

.empty-description {
  color: var(--stone-medium);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* 通知列表 */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease-out calc(var(--delay));
  animation-fill-mode: both;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.notification-card.unread {
  border-left: 4px solid var(--mountain-primary);
  background: rgba(34, 197, 94, 0.05);
}

/* 通知圖示 */
.notification-icon {
  position: relative;
  flex-shrink: 0;
}

.icon {
  display: inline-block;
  font-size: 1.5rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mountain-100), var(--mountain-200));
  display: flex;
  align-items: center;
  justify-content: center;
}

.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 0.75rem;
  height: 0.75rem;
  background: var(--mountain-primary);
  border-radius: 50%;
  border: 2px solid white;
}

/* 通知內容 */
.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  margin-bottom: 0.5rem;
}

.message-link {
  color: var(--mountain-primary);
  text-decoration: none;
  font-weight: 500;
  line-height: 1.4;
}

.message-link:hover {
  text-decoration: underline;
}

.message-text {
  color: var(--stone-dark);
  font-weight: 500;
  line-height: 1.4;
}

.notification-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--stone-medium);
}

.notification-time {
  opacity: 0.8;
}

.notification-type {
  opacity: 0.6;
}

/* 操作按鈕 */
.notification-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.mark-read-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  background: var(--mountain-primary);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
}

.mark-read-btn:hover {
  background: var(--mountain-accent);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.mark-read-btn:active {
  transform: scale(0.95);
}

.read-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.1);
  color: var(--mountain-primary);
  font-size: 1rem;
  border: 2px solid rgba(34, 197, 94, 0.2);
}

/* 按鈕樣式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, var(--mountain-primary), var(--mountain-accent));
  color: white;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);
}

.btn-outline {
  background: rgba(255, 255, 255, 0.8);
  color: var(--stone-dark);
  border-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.btn-outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.9);
  border-color: var(--mountain-primary);
  color: var(--mountain-primary);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}

.btn-icon {
  font-size: 1rem;
}

/* 更新提示 */
.update-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  font-size: 0.875rem;
  color: var(--stone-dark);
  animation: slideInUp 0.3s ease;
  z-index: 1000;
}

.toast-icon {
  font-size: 1rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .notifications-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.25rem;
  }

  .actions-bar {
    flex-direction: column;
    text-align: center;
  }

  .notification-card {
    padding: 1rem;
    gap: 0.75rem;
  }

  .icon {
    font-size: 1.25rem;
    width: 2.5rem;
    height: 2.5rem;
  }

  .update-toast {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
  }
}
</style>
