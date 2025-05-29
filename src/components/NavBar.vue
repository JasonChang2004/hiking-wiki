<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue' // Removed watch, added onUnmounted
import { auth } from '@/firebase' // Corrected path
import { useNotificationsStore } from '@/store/notifications' // Corrected path
import LoginButton from './auth/LoginButton.vue'
import type { User } from 'firebase/auth';
import { ref } from 'vue';

const notificationsStore = useNotificationsStore()
const currentUser = ref<User | null>(auth.currentUser);
let unsubscribeAuth: (() => void) | null = null; // Declare unsubscribeAuth

onMounted(() => {
  unsubscribeAuth = auth.onAuthStateChanged((user) => { // Assign to unsubscribeAuth
    currentUser.value = user;
    if (user) {
      notificationsStore.fetchUnreadCount()
    } else {
      notificationsStore.resetUnread();
    }
  })
});

onUnmounted(() => {
  if (unsubscribeAuth) {
    unsubscribeAuth(); // Call unsubscribeAuth if it exists
  }
});
</script>

<template>
  <nav class="w-full border-b border-wiki-border-light bg-wiki-bg fixed top-0 left-0 right-0 z-50">
    <div class="max-w-5xl mx-auto px-4 py-2 flex justify-between items-center">
      <!-- Logo -->
      <router-link to="/" class="flex items-center space-x-2">
        <div class="text-2xl">🏔️</div>
        <div class="font-medium text-xl">山林知識庫</div>
      </router-link>

      <!-- 導覽列項目 -->
      <!-- Consider making nav items data-driven for easier management -->
      <div class="flex space-x-1 items-center">
        <router-link to="/" class="wiki-nav-item" active-class="router-link-active">首頁</router-link>
        <router-link to="/about" class="wiki-nav-item" active-class="router-link-active">關於</router-link>
        <!-- Conditionally show Review link if user is admin -->
        <!-- This requires knowing admin status here, which might involve another store or prop -->
        <router-link v-if="currentUser" to="/review" class="wiki-nav-item" active-class="router-link-active">審核</router-link> 
        <router-link v-if="currentUser" to="/my-articles" class="wiki-nav-item" active-class="router-link-active">我的投稿</router-link>
        <!-- Conditionally show Admin link -->
        <router-link v-if="currentUser" to="/admin" class="wiki-nav-item" active-class="router-link-active">管理員</router-link>
        <router-link v-if="currentUser" to="/notifications" class="wiki-nav-item relative" active-class="router-link-active">
          通知
          <span
            v-if="notificationsStore.unreadCount > 0"
            class="ml-1 text-xs px-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full leading-tight"
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
  white-space: nowrap; /* Prevent wrapping */
  border-radius: 4px; /* Subtle rounding */
  transition: background-color 0.2s ease-in-out; /* Smooth hover */
}

.wiki-nav-item:hover {
  text-decoration: none; /* Remove underline from hover if active class handles it */
  background-color: var(--wiki-bg-light-hover); /* Subtle hover background */
}

/* Ensure router-link-active has higher specificity or is applied correctly */
.router-link-active, /* Default active class */
.wiki-nav-item.router-link-active /* More specific */ {
  font-weight: 500;
  background-color: var(--wiki-bg-light-active); /* Use a distinct active background */
  color: var(--wiki-link-active); /* Ensure active link text color is clear */
}
</style>
