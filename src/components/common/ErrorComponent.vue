<template>
  <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
    <div class="text-red-600 mb-2">
      <svg class="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
      </svg>
    </div>
    <p class="text-red-800 text-sm font-medium">載入元件時發生錯誤</p>
    <p class="text-red-600 text-xs mt-1">請重新整理頁面或稍後再試</p>
    <button 
      @click="$emit('retry')" 
      class="mt-3 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
    >
      重試
    </button>
  </div>
</template>

<script setup lang="ts">
// 錯誤組件可以發出重試事件
defineEmits<{
  retry: []
}>()
</script> 