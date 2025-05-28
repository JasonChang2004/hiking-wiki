<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { checkIsAdmin } from '../firebase/authUtils'
import ReviewArticles from '../components/ReviewArticles.vue'

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
  <div class="p-6">
    <div v-if="isAdmin === null">🔒 驗證身份中...</div>
    <div v-else-if="isAdmin">
      <ReviewArticles />
    </div>
    <div v-else class="text-red-600 font-bold">🚫 僅限管理員存取</div>
  </div>
</template>
