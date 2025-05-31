<script setup lang="ts">
import NavBar from './components/layout/NavBar.vue'
</script>

<template>
  <div class="min-h-screen wiki-theme">
    <NavBar />
    <main class="max-w-6xl mx-auto pt-4 px-4" style="margin-top: 160px;">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
/* 移除重複的導航樣式，避免衝突 */
</style>
