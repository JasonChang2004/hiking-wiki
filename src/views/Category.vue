<script setup lang="ts">
import { useRoute } from 'vue-router'
import { db } from '../firebase'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { onMounted, ref } from 'vue'

const route = useRoute()
const articles = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  const category = route.params.name as string
  const q = query(
    collection(db, 'articles'),
    where('status', '==', 'approved'),
    where('category', '==', category),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  articles.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  loading.value = false
})

// 格式化日期
const formatDate = (ts: any) => {
  if (!ts) return '';
  const d = ts?.toDate?.();
  if (!d) return '';
  
  return d.toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
</script>

<template>
  <div class="wiki-theme max-w-4xl mx-auto">
    <!-- 維基風格頁面標題 -->
    <h1 class="text-3xl font-normal border-b border-wiki-border-light pb-2 mb-4">
      分類：{{ $route.params.name }}
    </h1>
    
    <!-- 載入狀態 -->
    <div v-if="loading" class="wiki-notice">
      <p>正在載入文章...</p>
    </div>
    
    <!-- 無文章提示 -->
    <div v-else-if="articles.length === 0" class="wiki-notice">
      <p>目前沒有該分類的文章。</p>
      <p class="mt-2">
        <router-link to="/" class="text-wiki-link hover:underline">返回首頁</router-link>
        或探索其他分類。
      </p>
    </div>
    
    <!-- 文章列表 - 維基風格 -->
    <div v-else>
      <p class="text-sm text-gray-600 mb-4">
        此分類下共有 {{ articles.length }} 篇文章
      </p>
      
      <!-- 維基風格的文章列表 -->
      <div class="space-y-6">
        <div
          v-for="article in articles"
          :key="article.id"
          class="pb-4 border-b border-wiki-border-light last:border-0"
        >
          <h3 class="mb-1">
            <router-link 
              :to="`/articles/${article.id}`" 
              class="text-wiki-link hover:underline text-lg"
            >
              {{ article.title }}
            </router-link>
          </h3>
          
          <div class="text-sm text-gray-600 mb-2">
            <span>作者：{{ article.displayName }}</span>
            <span class="mx-2">|</span>
            <span>發布於：{{ formatDate(article.createdAt) }}</span>
          </div>
          
          <p class="text-gray-700 line-clamp-3">
            {{ article.content }}
          </p>
        </div>
      </div>
      
      <!-- 頁面底部導航 -->
      <div class="mt-6 pt-4 border-t border-wiki-border-light">
        <router-link to="/" class="text-wiki-link hover:underline">
          返回首頁
        </router-link>
      </div>
    </div>
  </div>
</template>
