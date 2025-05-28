<template>
  <div class="wiki-featured">
    <!-- 骨架屏 -->
    <div v-if="loading" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div class="h-16 bg-gray-200 rounded mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
      </div>
    </div>

    <!-- 精選文章 - 維基風格表格 -->
    <div v-else-if="articles.length">
      <div class="wiki-featured-grid">
        <div v-for="(article, index) in articles" :key="article.id" class="wiki-featured-item">
          <div class="flex flex-col sm:flex-row gap-3">
            <!-- 小型圖片 -->
            <div class="sm:w-24 w-full h-20 border border-gray-200 shrink-0 overflow-hidden">
              <img 
                :src="`https://source.unsplash.com/300x200/?hiking,mountains,taiwan,${article.id}`" 
                :alt="article.title"
                class="w-full h-full object-cover"
              />
            </div>
            
            <div class="flex-1">
              <!-- 標題區域 -->
              <div class="mb-1">
                <router-link 
                  :to="`/article/${article.id}`"
                  class="text-base font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {{ article.title }}
                </router-link>
                <span class="text-xs text-gray-500 ml-1">（{{ article.category || '綜合' }}）</span>
              </div>
              
              <!-- 簡短摘要 -->
              <p class="text-sm text-gray-700 mb-1 line-clamp-2">
                {{ article.content?.substring(0, 120) + (article.content?.length > 120 ? '...' : '') }}
              </p>
              
              <!-- 元數據 -->
              <div class="text-xs text-gray-500 italic">
                <span>{{ article.displayName }}</span>
                <span class="mx-1">•</span>
                <span>{{ formatDate(article.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空狀態 -->
    <div v-else class="text-center py-8 border border-gray-200 bg-gray-50">
      <div class="mb-3 text-3xl">📄</div>
      <div class="text-gray-700 mb-2">尚無精選文章</div>
      <div class="text-sm text-gray-500 mb-4">精選內容將定期更新</div>
      <button class="py-1 px-3 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-colors">
        投稿文章
      </button>
    </div>

    <!-- 說明文字 -->
    <div class="text-xs text-gray-500 mt-3 italic">
      本區域內容由編輯團隊精選，每週更新。
    </div>
  </div>
</template>

<style scoped>
/* 維基風格的精選內容 */
.wiki-featured {
  font-family: 'Liberation Serif', 'Linux Libertine', Georgia, Times, serif;
}

.wiki-featured-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .wiki-featured-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .wiki-featured-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.wiki-featured-item {
  padding: 0.5rem;
  transition: background-color 0.15s ease;
}

.wiki-featured-item:hover {
  background-color: #f8f9fa;
}

/* 文本截斷 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2; /* 標準屬性 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'

// 定義文章類型
interface Article {
  id: string
  title: string
  content: string
  category?: string
  displayName: string
  createdAt: any
  [key: string]: any
}

const articles = ref<Article[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const q = query(
      collection(db, 'articles'),
      where('isFeatured', '==', true),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    articles.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article))
  } catch (error) {
    console.error('無法載入精選文章:', error)
  } finally {
    loading.value = false
  }
})

const formatDate = (ts: any) => {
  if (!ts) return ''
  const d = ts?.toDate?.()
  if (!d) return ''
  
  // 更友好的日期格式
  const options = { year: 'numeric', month: 'short', day: 'numeric' } as Intl.DateTimeFormatOptions
  return d.toLocaleDateString('zh-TW', options)
}
</script>
