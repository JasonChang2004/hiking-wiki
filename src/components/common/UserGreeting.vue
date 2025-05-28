<template>
  <div class="wiki-greeting">
    <div v-if="user" class="flex items-center">
      <span class="mr-2">您好，</span>
      <span class="font-medium">{{ user.displayName }}</span>
    </div>
    <div v-else>
      <span>歡迎來到山林知識庫</span>
    </div>
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

<style scoped>
.wiki-greeting {
  font-size: 0.9rem;
  color: var(--wiki-text);
}
</style>
