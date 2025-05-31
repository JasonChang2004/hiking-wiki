<template>  <div class="article-list-container wiki-style">
    <!-- 🔍 搜尋 + 分類 -->
    <div class="flex flex-col sm:flex-row gap-3 mb-5 border border-gray-300 bg-gray-50 p-3 rounded">
      <div class="relative flex-grow">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        </div>
        <input
          v-model="search"
          type="text"
          placeholder="搜尋文章標題或內容"
          class="pl-9 w-full p-2 text-sm border border-gray-300 bg-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <select 
        v-model="selectedCategory" 
        class="p-2 text-sm border border-gray-300 bg-white focus:border-blue-500 focus:outline-none w-full sm:w-40"
      >
        <option value="">全部分類</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <!-- 📦 骨架屏 -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <hr class="my-3 border-gray-100" />
      </div>
    </div>
    
    <div v-else-if="filteredArticles.length === 0" class="text-center py-8 border border-gray-200 bg-gray-50">
      <div class="mb-3">
        <span class="text-4xl">📝</span>
      </div>
      <div class="text-lg text-gray-700 mb-2">暫無相關條目</div>
      <div class="text-gray-500 text-sm max-w-md mx-auto">請嘗試調整搜尋條件或瀏覽其他分類</div>
    </div>

    <!-- 📋 條目列表 - 維基風格 -->
    <div v-else>
      <ul class="wiki-article-list">
        <li
          v-for="(article, index) in filteredArticles"
          :key="article.id"
          class="wiki-article-item"
        >
          <div class="flex gap-3">
            <!-- 左側縮略圖 (小) -->
            <div class="hidden sm:block w-20 h-20 flex-shrink-0 border border-gray-200">
              <img 
                :src="`https://source.unsplash.com/100x100/?hiking,mountains,${article.id}`" 
                :alt="article.title"
                class="w-full h-full object-cover"
              />
            </div>
            
            <!-- 右側內容 -->
            <div class="flex-1">
              <router-link :to="`/article/${article.id}`" class="flex items-baseline gap-1">
                <h3 class="text-base font-medium text-blue-600 hover:text-blue-800 hover:underline">
                  {{ article.title }}
                </h3>
                <span class="text-xs text-gray-500">（{{ article.category || '一般' }}）</span>
              </router-link>
              
              <p class="text-gray-700 line-clamp-2 text-sm mt-1 leading-relaxed">
                {{ article.content }}
              </p>
              
              <div class="flex items-center text-xs text-gray-500 mt-1 italic">
                <span>更新於 {{ formatDate(article.createdAt) }}</span>
                <span class="mx-2">|</span>
                <span>作者：{{ article.displayName }}</span>
              </div>
            </div>
          </div>
          
          <!-- 簡單分隔線 -->
          <hr v-if="index !== filteredArticles.length - 1" class="my-3 border-gray-200" />
        </li>
      </ul>
      
      <!-- 頁面導航區 -->
      <div class="wiki-pagination mt-4 text-center">
        <div class="text-sm text-gray-500">
          顯示 {{ filteredArticles.length }} 個項目
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { formatDate } from '../../utils/formatters' // 使用新的格式化工具
import type { Article } from '../../types' // 使用新的型別定義

const articles = ref<Article[]>([])
const loading = ref(true)
const search = ref('')
const selectedCategory = ref('')

// 自訂分類清單 - 考慮是否可以從其他地方（例如 Firestore 或設定檔）動態獲取
const categories = ['百岳', '郊山', '海外', '裝備']

const filteredArticles = computed(() => {
  const keyword = search.value.toLowerCase()
  return articles.value.filter(article => {
    const matchSearch =
      (article.title?.toLowerCase() || '').includes(keyword) || // 增加 null/undefined 檢查
      (article.content?.toLowerCase() || '').includes(keyword) // 增加 null/undefined 檢查
    const matchCategory =
      !selectedCategory.value || article.category === selectedCategory.value
    return matchSearch && matchCategory
  })
})

onMounted(async () => {
  loading.value = true // 確保 loading 狀態被設定
  try {
    const q = query(
      collection(db, 'articles'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
      // Consider adding limit() for pagination if list becomes very long
      // limit(10) 
    )
    const snapshot = await getDocs(q)
    articles.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article))
  } catch (error) {
    console.error("Error loading articles:", error);
    // Optionally, set an error state to display a message to the user
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* 維基風格的文章列表 */
.wiki-style {
  font-family: 'Liberation Serif', 'Linux Libertine', Georgia, Times, serif;
}

.wiki-article-list {
  font-size: 0.9rem;
}

.wiki-article-item {
  padding: 0.5rem 0;
}

.wiki-article-item:hover {
  background-color: #f8f9fa;
}

/* 文本截斷 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 標準維基百科連結顏色 */
.wiki-style a {
  color: #0645ad;
}

.wiki-style a:hover {
  color: #3366bb;
}

.wiki-style a:visited {
  color: #0b0080;
}

/* 維基百科風格的分頁導航 */
.wiki-pagination {
  font-size: 0.85rem;
  color: #72777d;
}

/* 標準維基引用樣式 */
.wiki-style .reference {
  font-size: 0.75rem;
  vertical-align: super;
  color: #0645ad;
}
</style>
