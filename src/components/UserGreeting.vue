<template>
  <div class="mb-6">
    <p v-if="user">👋 歡迎回來，<strong>{{ user.displayName }}</strong></p>
    <p v-else>請登入以開始編輯條目或發表內容</p>
  </div>
</template>

<script setup lang="ts">
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { ref, onMounted } from 'vue'

const user = ref<any>(null)

onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, u => user.value = u)
})
</script>
