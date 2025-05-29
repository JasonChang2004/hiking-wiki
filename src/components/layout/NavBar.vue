<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue' // Removed watch, added onUnmounted
import { auth } from '@/firebase'
import { useNotificationsStore } from '@/store/notifications'
import LoginButton from '@/components/auth/LoginButton.vue'
import type { User } from 'firebase/auth';
import { ref } from 'vue';

const notificationsStore = useNotificationsStore()
const currentUser = ref<User | null>(null);
let unsubscribeAuth: (() => void) | null = null;

onMounted(() => {
  // 初始設置當前用戶
  currentUser.value = auth.currentUser;
  
  // 監聽認證狀態變化
  unsubscribeAuth = auth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? user.email : 'No user');
    currentUser.value = user;
    if (user) {
      notificationsStore.fetchUnreadCount();
    } else {
      notificationsStore.resetUnread();
    }
  });
});

onUnmounted(() => {
  if (unsubscribeAuth) {
    unsubscribeAuth();
  }
});
</script>

<template>  <nav class="w-full border-b border-wiki-border-light bg-wiki-bg fixed top-0 left-0 right-0 z-50">
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
        
        <!-- 針對登入用戶顯示的選項 -->
        <template v-if="currentUser">
          <router-link to="/review" class="wiki-nav-item" active-class="router-link-active">審核</router-link> 
          <router-link to="/my-articles" class="wiki-nav-item" active-class="router-link-active">我的投稿</router-link>
          <router-link to="/admin" class="wiki-nav-item" active-class="router-link-active">管理員</router-link>
          <router-link to="/notifications" class="wiki-nav-item relative" active-class="router-link-active">
            通知
            <span
              v-if="notificationsStore.unreadCount > 0"
              class="ml-1 text-xs px-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full leading-tight"
            >
              {{ notificationsStore.unreadCount }}
            </span>
          </router-link>
        </template>
        <LoginButton class="ml-2" />
      </div>
    </div>
  </nav>
</template>

<style scoped>
.wiki-nav-item {
  padding: 0.5rem 0.75rem;
  color: #0645ad; /* 直接使用顏色值 */
  text-decoration: none;
  font-size: 0.95rem;
  white-space: nowrap; /* Prevent wrapping */
  border-radius: 4px; /* Subtle rounding */
  transition: background-color 0.2s ease-in-out; /* Smooth hover */
  display: inline-block;
}

.wiki-nav-item:hover {
  text-decoration: none; /* Remove underline from hover if active class handles it */
  background-color: #f0f6ff; /* 直接使用顏色值 */
}

/* Ensure router-link-active has higher specificity or is applied correctly */
.router-link-active, /* Default active class */
.wiki-nav-item.router-link-active /* More specific */ {
  font-weight: 500;
  background-color: #e1ebff; /* 直接使用顏色值 */
  color: #0b0080; /* 直接使用顏色值 */
}
</style>
