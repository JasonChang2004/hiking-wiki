<script setup lang="ts">
import { onMounted } from 'vue'
import { auth } from './firebase'
import { useNotificationsStore } from './store/notifications'
import LoginButton from './components/LoginButton.vue'

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
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <nav class="bg-white shadow-md p-4 flex justify-between items-center">
      <div class="flex space-x-4">
        <router-link to="/" class="text-blue-600 hover:underline">🏠 首頁</router-link>
        <router-link to="/about" class="text-blue-600 hover:underline">📘 關於</router-link>
        <router-link to="/review" class="text-blue-600 hover:underline">🧑‍⚖️ 審核</router-link>
        <router-link to="/my-articles" class="text-blue-600 hover:underline">📝 我的投稿</router-link>
        <router-link to="/admin" class="text-blue-600 hover:underline">👑 管理員後台</router-link>
        <router-link to="/notifications" class="text-blue-600 hover:underline relative">
          🔔 通知
          <span
            v-if="notificationsStore.unreadCount > 0"
            class="absolute -top-1 -right-3 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full"
          >
            {{ notificationsStore.unreadCount }}
          </span>
        </router-link>
      </div>
      <LoginButton />
    </nav>

    <main class="max-w-3xl mx-auto mt-6">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
