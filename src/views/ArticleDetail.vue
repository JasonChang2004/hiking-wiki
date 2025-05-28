<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { marked } from 'marked'

const route = useRoute()
const article = ref<any | null>(null)
const loading = ref(true)
const shareNotification = ref(false)

const renderedHtml = computed(() => {
  if (!article.value?.content) return '';
  
  // 簡單使用 marked 解析
  return marked.parse(article.value.content);
});

// 格式化日期顯示
const formatDate = (ts: any) => {
  if (!ts) return '';
  const d = ts?.toDate?.();
  if (!d) return '';
  
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  } as Intl.DateTimeFormatOptions;
  
  return d.toLocaleDateString('zh-TW', options);
}

// 複製分享連結
const copyShareLink = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    shareNotification.value = true;
    setTimeout(() => {
      shareNotification.value = false;
    }, 2000);
  });
}

onMounted(async () => {
  try {
    const id = route.params.id as string
    const docRef = doc(db, 'articles', id)
    const snap = await getDoc(docRef)

    if (snap.exists()) {
      // 擴充數據，添加文章 ID
      article.value = { 
        id, 
        ...snap.data() 
      };
    } else {
      article.value = null
    }
  } catch (error) {
    console.error('無法載入文章:', error);
    article.value = null;
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="article-detail-container">
    <!-- 骨架屏 -->
    <div v-if="loading" class="max-w-4xl mx-auto p-6">
      <div class="animate-pulse space-y-6">
        <div class="h-10 bg-gray-200 rounded-lg w-3/4"></div>
        <div class="h-5 bg-gray-200 rounded-lg w-1/2"></div>
        <div class="h-80 bg-gray-200 rounded-lg my-6"></div>
        <div class="space-y-3">
          <div class="h-5 bg-gray-200 rounded-lg"></div>
          <div class="h-5 bg-gray-200 rounded-lg"></div>
          <div class="h-5 bg-gray-200 rounded-lg w-5/6"></div>
          <div class="h-24 bg-gray-200 rounded-lg mt-4"></div>
        </div>
      </div>
    </div>
    
    <!-- 文章內容 -->
    <div v-else-if="article" class="mx-auto max-w-4xl">
      <!-- 文章標題與資訊區 - 維基風格 -->
      <div class="border-b border-wiki-border-light pb-2 mb-4">
        <h1 class="text-3xl font-normal">{{ article.title }}</h1>
        
        <div class="flex flex-wrap items-center text-sm text-gray-600 mt-1 mb-3">
          <!-- 類別 -->
          <router-link
            v-if="article.category"
            :to="`/category/${article.category}`"
            class="text-wiki-link mr-4 hover:underline"
          >
            {{ article.category }}
          </router-link>
          
          <!-- 作者 -->
          <div class="mr-4">
            <span>作者: {{ article.displayName || '未知' }}</span>
          </div>
          
          <!-- 發布時間 -->
          <div>
            <span>發布於: {{ formatDate(article.createdAt) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 維基風格導航工具欄 -->
      <div class="flex flex-col sm:flex-row mb-4">
        <div class="wiki-card mb-2 sm:mb-0 sm:mr-4 py-1 px-3 flex-none">
          <div class="font-medium text-sm mb-1">目錄</div>
          <ul class="text-sm">
            <li><a href="#" class="text-wiki-link">概述</a></li>
            <li><a href="#" class="text-wiki-link">詳細內容</a></li>
            <li><a href="#" class="text-wiki-link">參考資料</a></li>
          </ul>
        </div>
        
        <!-- 維基風格的工具區 -->
        <div class="flex-1">
          <div class="wiki-notice text-sm">
            本文由登山知識社群成員撰寫，最後更新於 {{ formatDate(article.updatedAt || article.createdAt) }}
          </div>
        </div>
      </div>
      
      <!-- 文章縮圖 - 簡化版本 -->
      <div class="mb-6">
        <img 
          :src="`https://source.unsplash.com/800x400/?mountains,hiking,nature,${article.id}`" 
          alt="Article image" 
          class="w-full border border-wiki-border-light"
        />
        <div class="text-xs text-gray-500 mt-1">圖: {{ article.title }} 相關場景示意</div>
      </div>
      
      <!-- 維基風格的文章內容 -->
      <div class="wiki-text">
        <div v-html="renderedHtml"></div>
      </div>
      
      <!-- 文章頁尾 -->
      <div class="mt-8 pt-4 border-t border-wiki-border-light">
        <div class="flex justify-between items-center">
          <router-link to="/" class="text-wiki-link hover:underline">
            返回文章列表
          </router-link>
          
          <!-- 分享按鈕 - 簡化 -->
          <div class="relative">
            <button @click="copyShareLink" class="text-wiki-link hover:underline">
              分享此文章
            </button>
            
            <!-- 分享成功通知 -->
            <div v-if="shareNotification" 
                class="absolute right-0 bottom-full mb-2 px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-sm">
              連結已複製
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 找不到文章 -->
    <div v-else class="max-w-2xl mx-auto p-6 text-center py-10 border border-wiki-border-light bg-wiki-bg-light">
      <div class="text-3xl mb-4">🏔️</div>
      <h2 class="text-xl mb-2">找不到此文章</h2>
      <div class="text-gray-600 mb-6">可能已被刪除或您沒有權限查看</div>
      <router-link to="/" class="text-wiki-link hover:underline">
        返回首頁
      </router-link>
    </div>
  </div>
</template>

<style scoped>
/* 使用維基百科風格樣式 */
:deep(.wiki-text) {
  font-family: 'Linux Libertine', Georgia, Times, serif;
  line-height: 1.6;
}

:deep(.wiki-text h1),
:deep(.wiki-text h2) {
  font-family: 'Linux Libertine', Georgia, Times, serif;
  font-weight: normal;
  border-bottom: 1px solid var(--wiki-border-light);
  padding-bottom: 0.25em;
  margin-top: 1.2em;
  margin-bottom: 0.6em;
  color: var(--wiki-heading);
}

:deep(.wiki-text h2) {
  font-size: 1.5em;
}

:deep(.wiki-text h3) {
  font-size: 1.2em;
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: 500;
}

:deep(.wiki-text a) {
  color: var(--wiki-link);
  text-decoration: none;
}

:deep(.wiki-text a:hover) {
  text-decoration: underline;
}

:deep(.wiki-text p) {
  margin-bottom: 0.8em;
}

:deep(.wiki-text img) {
  border: 1px solid var(--wiki-border-light);
  margin: 1em 0;
}

:deep(.wiki-text blockquote) {
  border-left: 3px solid var(--wiki-border-light);
  margin: 1em 0;
  padding: 0.5em 0 0.5em 1em;
  color: var(--wiki-text-light);
}

:deep(.wiki-text table) {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
}

:deep(.wiki-text table, .wiki-text th, .wiki-text td) {
  border: 1px solid var(--wiki-border-light);
}

:deep(.wiki-text th) {
  background-color: var(--wiki-bg-light);
  padding: 0.5em;
  text-align: left;
}

:deep(.wiki-text td) {
  padding: 0.5em;
}

:deep(.wiki-text ul),
:deep(.wiki-text ol) {
  padding-left: 1.6em;
  margin: 0.3em 0 0.6em;
}

:deep(.wiki-text li) {
  margin-bottom: 0.1em;
}
</style>
