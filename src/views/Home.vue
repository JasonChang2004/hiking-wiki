<template>
  <div class="wiki-container mt-16 mb-12 space-y-16">

    <!-- Hero 區塊 -->
    <section class="bg-white border border-gray-200 shadow-sm rounded-sm max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-6 items-center">
      <div class="md:w-1/2">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">🏞️ 歡迎來到台灣登山知識庫</h1>
        <p class="text-gray-700 text-lg leading-relaxed">
          這是一個由登山愛好者共同維護的協作平台，致力於整理、分享與保存台灣山林的相關知識與實務經驗。
        </p>
        <div class="mt-6 flex gap-3">
          <router-link to="/my-articles" class="text-sm px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">✍️ 開始投稿</router-link>
          <a href="#latest" class="text-sm px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-100">📚 瀏覽條目</a>
        </div>
      </div>
      <div class="md:w-1/2 hidden md:block">
        <img src="https://images.unsplash.com/photo-1534215754734-1757895a019d?auto=format&fit=crop&w=600&q=80" alt="台灣山岳" class="w-full h-64 object-cover rounded" />
      </div>
    </section>

    <!-- 分類導覽 -->
    <section id="categories" class="max-w-5xl mx-auto px-4">
      <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        <div class="border-b border-gray-200 bg-gray-50 py-2 px-4">
          <h2 class="text-xl font-medium text-gray-700">🗂️ 知識分類索引</h2>
        </div>
        <div class="p-5">
          <CategoryGrid />
        </div>
      </div>
    </section>

    <!-- 精選文章區塊 -->
    <section id="featured" class="max-w-5xl mx-auto px-4">
      <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        <div class="border-b border-gray-200 bg-gray-50 py-2 px-4 flex justify-between items-center">
          <h2 class="text-xl font-medium text-gray-700">🌟 精選知識條目</h2>
          <span class="text-xs text-gray-500">每週更新</span>
        </div>
        <div class="p-5">
          <FeaturedCarousel />
        </div>
      </div>
    </section>

    <!-- 最新文章列表 -->
    <section id="latest" class="max-w-5xl mx-auto px-4">
      <div class="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        <div class="border-b border-gray-200 bg-gray-50 py-2 px-4 flex justify-between items-center">
          <h2 class="text-xl font-medium text-gray-700">🆕 最新更新條目</h2>
          <router-link to="/category/所有文章" class="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors">查看完整列表 →</router-link>
        </div>
        <div class="p-5">
          <ArticleList />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import ArticleList from '../components/articles/ArticleList.vue'
import FeaturedCarousel from '../components/layout/FeaturedCarousel.vue'
import CategoryGrid from '../components/articles/CategoryGrid.vue'
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
