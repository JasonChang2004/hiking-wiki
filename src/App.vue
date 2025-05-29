<script setup lang="ts">
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="min-h-screen wiki-theme">
    <NavBar />
    <main class="max-w-6xl mx-auto mt-16 pt-4 px-4">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
/* 保留原有主樣式，如果需要移到 NavBar.vue 也可以 */
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
