<template>
  <div class="w-full mt-10">
    <h2 class="text-lg font-semibold mb-4">📁 分類瀏覽</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <router-link
        v-for="cat in categories"
        :key="cat.name"
        :to="`/category/${cat.name}`"
        class="flex flex-col items-center p-4 bg-white shadow rounded hover:bg-blue-50 transition"
      >
        <div class="text-3xl">{{ cat.icon }}</div>
        <div class="mt-2 font-medium">{{ cat.label }}</div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
const categories = [
  { name: '登山路線', label: '登山路線', icon: '🗻' },
  { name: '裝備心得', label: '裝備心得', icon: '🎒' },
  { name: '登山知識', label: '登山知識', icon: '📚' },
  { name: '緊急應變', label: '緊急應變', icon: '🚨' },
]
</script>
