<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { checkIsAdmin } from '../firebase/authUtils'
import ReviewArticles from '../components/admin/ReviewArticles.vue'

const isAdmin = ref<boolean | null>(null)

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const result = await checkIsAdmin(user.uid)
      isAdmin.value = result
    } else {
      isAdmin.value = false
    }
  })
})
</script>

<template>
  <div class="wiki-theme max-w-4xl mx-auto">
    <!-- 維基風格頁面標題 -->
    <h1 class="text-3xl font-normal border-b border-wiki-border-light pb-2 mb-4">
      內容審核
    </h1>
    
    <!-- 載入中 -->
    <div v-if="isAdmin === null" class="wiki-notice">
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
    </div>
  </div>
</template>
