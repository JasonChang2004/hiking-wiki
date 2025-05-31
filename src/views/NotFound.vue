<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
      <div class="mb-6">
        <h1 class="text-6xl font-bold text-gray-400 mb-4">404</h1>
        <h2 class="text-xl font-semibold text-gray-700 mb-2">頁面不存在</h2>
        <p class="text-gray-500">抱歉，您要尋找的頁面似乎迷失在山林中了。</p>
      </div>
      
      <div class="space-y-3">
        <router-link 
          to="/" 
          class="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🏠 回到首頁
        </router-link>
        
        <button 
          @click="$router.go(-1)" 
          class="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← 回到上一頁
        </button>
      </div>
      
      <div class="mt-6 text-sm text-gray-400">
        <p>如果您認為這是個錯誤，請聯繫我們。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404 頁面不需要額外的邏輯
</script> 