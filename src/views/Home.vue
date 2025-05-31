<template>
  <div class="wiki-container mt-2 mb-12 space-y-16">

    <!-- Hero 區塊 -->
    <section class="bg-white border border-gray-200 shadow-sm rounded-sm max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
      <div class="md:w-1/2 w-full">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">🏞️ 歡迎來到台灣登山知識庫</h1>
        <p class="text-gray-700 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
          這是一個由登山愛好者共同維護的協作平台，致力於整理、分享與保存台灣山林的相關知識與實務經驗。
        </p>
        <div class="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <router-link to="/submit-article" class="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center justify-center">✍️ 開始投稿</router-link>
          <a href="#latest" class="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors duration-300 ease-in-out flex items-center justify-center">📚 瀏覽條目</a>
        </div>
      </div>
      <div class="md:w-1/2 hidden md:block p-4">
        <!-- 提示：可在此處放置與台灣山脈或登山相關的吸引人的圖片或圖形 -->
      </div>
    </section>

    <!-- 分類導覽 -->
    <section id="categories" class="max-w-5xl mx-auto px-4">
      <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        <div class="border-b border-gray-200 bg-gray-50 py-2 px-4">
          <h2 class="text-lg sm:text-xl font-medium text-gray-700">🗂️ 知識分類索引</h2>
        </div>
        <div class="p-3 sm:p-5">
          <Suspense>
            <CategoryGrid />
            <template #fallback>
              <div class="animate-pulse">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div v-for="i in 8" :key="i" class="h-16 sm:h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </template>
          </Suspense>
        </div>
      </div>
    </section>

    <!-- 精選文章區塊 -->
    <section id="featured" class="max-w-5xl mx-auto px-4">
      <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        <div class="border-b border-gray-200 bg-gray-50 py-2 px-4 flex justify-between items-center">
          <h2 class="text-lg sm:text-xl font-medium text-gray-700">🌟 精選知識條目</h2>
          <span class="text-xs text-gray-500 hidden sm:inline">每週更新</span>
        </div>
        <div class="p-3 sm:p-5">
          <Suspense>
            <FeaturedCarousel />
            <template #fallback>
              <div class="animate-pulse">
                <div class="h-32 sm:h-40 bg-gray-200 rounded"></div>
              </div>
            </template>
          </Suspense>
        </div>
      </div>
    </section>

    <!-- 最新文章列表 -->
    <section id="latest" class="max-w-5xl mx-auto px-4">
      <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        <div class="border-b border-gray-200 bg-gray-50 py-2 px-4 flex justify-between items-center">
          <h2 class="text-lg sm:text-xl font-medium text-gray-700">🆕 最新更新條目</h2>
          <router-link to="/category/所有文章" class="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors">查看完整列表 →</router-link>
        </div>
        <div class="p-3 sm:p-5">
          <Suspense>
            <ArticleList />
            <template #fallback>
              <div class="animate-pulse space-y-3 sm:space-y-4">
                <div v-for="i in 5" :key="i" class="h-12 sm:h-16 bg-gray-200 rounded"></div>
              </div>
            </template>
          </Suspense>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 優化異步組件載入，添加錯誤處理和載入狀態
const ArticleList = defineAsyncComponent({
  loader: () => import('../components/articles/ArticleList.vue'),
  errorComponent: () => import('../components/common/ErrorComponent.vue'),
  delay: 200,
  timeout: 30000,
})

const FeaturedCarousel = defineAsyncComponent({
  loader: () => import('../components/layout/FeaturedCarousel.vue'),
  errorComponent: () => import('../components/common/ErrorComponent.vue'),
  delay: 200,
  timeout: 30000,
})

const CategoryGrid = defineAsyncComponent({
  loader: () => import('../components/articles/CategoryGrid.vue'),
  errorComponent: () => import('../components/common/ErrorComponent.vue'),
  delay: 200,
  timeout: 30000,
})
</script>

<style scoped>
.wiki-container {
  font-family: 'Linux Libertine', Georgia, Times, serif;
}

.wiki-container h1,
.wiki-container h2 {
  font-weight: normal;
  font-family: 'Linux Libertine', Georgia, Times, serif;
}

.wiki-container p {
  line-height: 1.65;
}

.wiki-container a:hover {
  text-decoration: underline;
}

.wiki-container .bg-white {
  transition: all 0.2s ease-in-out;
}

.wiki-container .bg-white:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
</style>
