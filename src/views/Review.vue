<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue' // Added onUnmounted
import { auth } from '@/firebase' // Corrected path
import { onAuthStateChanged, type User } from 'firebase/auth'
import { checkIsAdmin } from '@/firebase/authUtils' // Corrected path
import ReviewArticles from '@/components/admin/ReviewArticles.vue' // Corrected path

const isAdmin = ref<boolean | null>(null)
const currentUser = ref<User | null>(null);
const isLoadingAuth = ref(true);
let unsubscribeAuth: (() => void) | null = null; // Declare unsubscribeAuth

onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, async (user) => { // Assign to unsubscribeAuth
    currentUser.value = user;
    if (user) {
      try {
        const result = await checkIsAdmin(user.uid);
        isAdmin.value = result;
      } catch (error) {
        console.error("Error checking admin status on mount:", error);
        isAdmin.value = false;
      }
    } else {
      isAdmin.value = false;
    }
    isLoadingAuth.value = false;
  });
});

onUnmounted(() => {
  if (unsubscribeAuth) {
    unsubscribeAuth(); // Call unsubscribeAuth if it exists
  }
});
</script>

<template>
  <div class="wiki-theme max-w-4xl mx-auto">
    <!-- 維基風格頁面標題 -->
    <h1 class="text-3xl font-normal border-b border-wiki-border-light pb-2 mb-4">
      內容審核
    </h1>
    
    <!-- 載入中 -->
    <div v-if="isLoadingAuth || isAdmin === null" class="wiki-notice">
      <p>驗證身份中...</p>
    </div>
    
    <!-- 審核內容 -->
    <div v-else-if="isAdmin">
      <ReviewArticles />
    </div>
    
    <!-- 無權限提示 -->
    <div v-else class="wiki-box wiki-box-error">
      <p class="wiki-box-title">存取受限</p>
      <p>很抱歉，只有管理員可以存取此頁面。</p>
      <p v-if="!currentUser" class="mt-2">
        <router-link to="/" class="text-wiki-link hover:underline">返回首頁</router-link> 或嘗試登入。
      </p>
       <p v-else class="mt-2">
        <router-link to="/" class="text-wiki-link hover:underline">返回首頁</router-link>。
      </p>
    </div>
  </div>
</template>
