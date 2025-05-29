<script setup lang="ts">
import { onMounted } from 'vue'
import { auth } from '../firebase'
import { useNotificationsStore } from '../store/notifications'
import LoginButton from './auth/LoginButton.vue'

const notificationsStore = useNotificationsStore()

onMounted(() => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      notificationsStore.fetchUnreadCount()
    }
  })
})
</script>

<template>
  <nav class="w-full border-b border-wiki-border-light bg-wiki-bg">
    <div class="max-w-5xl mx-auto px-4 py-2 flex justify-between items-center">
      <!-- Logo -->
      <router-link to="/" class="flex items-center space-x-2">
        <div class="text-2xl">🏔️</div>
        <div class="font-medium text-xl">山林知識庫</div>
      </router-link>

      <!-- 導覽列項目 -->
      <div class="flex space-x-1 items-center">
        <router-link to="/" class="wiki-nav-item">首頁</router-link>
        <router-link to="/about" class="wiki-nav-item">關於</router-link>
        <router-link to="/review" class="wiki-nav-item">審核</router-link>
        <router-link to="/my-articles" class="wiki-nav-item">我的投稿</router-link>
        <router-link to="/admin" class="wiki-nav-item">管理員</router-link>
        <router-link to="/notifications" class="wiki-nav-item relative">
          通知
          <span
            v-if="notificationsStore.unreadCount > 0"
            class="ml-1 text-xs px-1.5 bg-red-50 text-red-600 border border-red-200 rounded"
          >
            {{ notificationsStore.unreadCount }}
          </span>
        </router-link>
        <LoginButton class="ml-2" />
      </div>
    </div>
  </nav>
</template>

<style scoped>
.wiki-nav-item {
  padding: 0.5rem 0.75rem;
  color: var(--wiki-link);
  text-decoration: none;
  font-size: 0.95rem;
}

.wiki-nav-item:hover {
  text-decoration: underline;
}

.router-link-active.wiki-nav-item {
  font-weight: 500;
  background-color: var(--wiki-bg-light);
}
</style>
