<template>
  <article class="featured-main-article" v-if="article">
    <!-- 文章頭部 -->
    <header class="article-header">
      <div class="article-category">
        <span class="category-name">{{ article.category || '一般' }}</span>
      </div>
      <time class="article-date">{{ formatDate(article.createdAt) }}</time>
    </header>

    <!-- 文章標題 -->
    <h1 class="article-title">{{ article.title }}</h1>

    <!-- 文章內容摘要 -->
    <div class="article-content">
      <div class="article-html-content" v-html="parsedContent"></div>
    </div>

    <!-- 文章底部資訊 -->
    <footer class="article-footer">
      <div class="author-info">
        <span>作者：{{ article.displayName }}</span>
      </div>
      <router-link :to="`/articles/${article.id}`" class="read-full-link">
        閱讀完整文章 →
      </router-link>
    </footer>
  </article>

  <!-- 載入狀態 -->
  <div v-else-if="loading" class="loading-state">
    <div class="loading-content">載入中...</div>
  </div>

  <!-- 錯誤狀態 -->
  <div v-else class="error-state">
    <p>暫無精選文章</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import type { Article } from '@/types'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const article = ref<Article | null>(null)
const loading = ref(true)

// 簡化的日期格式化
const formatDate = (timestamp: any): string => {
  if (!timestamp) return ''
  try {
    const date = timestamp?.toDate?.() || timestamp
    return new Date(date).toLocaleDateString('zh-TW')
  } catch {
    return ''
  }
}

// 將Markdown轉換為HTML的計算屬性
const parsedContent = computed(() => {
  if (!article.value?.content) return '暫無內容...'
  try {
    const dirty = marked.parse(article.value.content) as string
    return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } })
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return article.value.content // 如果解析失敗，返回原始內容
  }
})

// 載入精選文章
const loadFeaturedArticle = async () => {
  try {
    loading.value = true
    
    const q = query(
      collection(db, 'articles'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(1)
    )

    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      article.value = { id: doc.id, ...doc.data() } as Article
    }
  } catch (error) {
    console.error('Error loading featured article:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFeaturedArticle()
})
</script>

<style>
/* 全面的HTML內容樣式 - 覆蓋所有可能的結構 */
.article-content h1,
.article-content h2,
.article-content h3,
.article-content h4,
.article-content h5,
.article-content h6,
.article-html-content h1,
.article-html-content h2,
.article-html-content h3,
.article-html-content h4,
.article-html-content h5,
.article-html-content h6 {
  font-weight: 600 !important;
  margin: 1rem 0 0.5rem 0 !important;
  color: #1f2937 !important;
}

.article-content h1,
.article-html-content h1 { font-size: 1.75rem !important; }
.article-content h2,
.article-html-content h2 { font-size: 1.5rem !important; }
.article-content h3,
.article-html-content h3 { font-size: 1.25rem !important; }
.article-content h4,
.article-html-content h4 { font-size: 1.125rem !important; }

.article-content p,
.article-html-content p {
  margin: 1rem 0 !important;
  line-height: 1.6 !important;
}

.article-content strong,
.article-content b,
.article-html-content strong,
.article-html-content b {
  font-weight: 700 !important;
  color: #1f2937 !important;
}

.article-content em,
.article-content i,
.article-html-content em,
.article-html-content i {
  font-style: italic !important;
}

.article-content ul,
.article-content ol,
.article-html-content ul,
.article-html-content ol {
  margin: 1rem 0 !important;
  padding-left: 1.5rem !important;
}

.article-content li,
.article-html-content li {
  margin: 0.5rem 0 !important;
}

.article-content img,
.article-html-content img {
  max-width: 100% !important;
  height: auto !important;
  border-radius: 8px !important;
  margin: 1rem 0 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  display: block !important;
}

.article-content a,
.article-html-content a {
  color: var(--mountain-primary) !important;
  text-decoration: none !important;
  border-bottom: 1px solid transparent !important;
  transition: border-color 0.3s ease !important;
}

.article-content a:hover,
.article-html-content a:hover {
  border-bottom-color: var(--mountain-primary) !important;
}

.article-content blockquote,
.article-html-content blockquote {
  border-left: 4px solid var(--mountain-primary) !important;
  padding-left: 1rem !important;
  margin: 1rem 0 !important;
  font-style: italic !important;
  color: #6b7280 !important;
}

.article-content code,
.article-html-content code {
  background: #f3f4f6 !important;
  padding: 0.125rem 0.25rem !important;
  border-radius: 0.25rem !important;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace !important;
  font-size: 0.875rem !important;
}

.article-content pre,
.article-html-content pre {
  background: #f3f4f6 !important;
  padding: 1rem !important;
  border-radius: 0.5rem !important;
  overflow-x: auto !important;
  margin: 1rem 0 !important;
}

.article-content pre code,
.article-html-content pre code {
  background: none !important;
  padding: 0 !important;
}

/* 處理可能的div包裝 */
.article-content div,
.article-html-content div {
  /* 保持文字樣式繼承 */
}

.article-content div h1,
.article-content div h2,
.article-content div h3,
.article-content div h4,
.article-content div h5,
.article-content div h6,
.article-html-content div h1,
.article-html-content div h2,
.article-html-content div h3,
.article-html-content div h4,
.article-html-content div h5,
.article-html-content div h6 {
  font-weight: 600 !important;
  margin: 1rem 0 0.5rem 0 !important;
  color: #1f2937 !important;
}

.article-content div strong,
.article-content div b,
.article-html-content div strong,
.article-html-content div b {
  font-weight: 700 !important;
  color: #1f2937 !important;
}

.article-content div img,
.article-html-content div img {
  max-width: 100% !important;
  height: auto !important;
  border-radius: 8px !important;
  margin: 1rem 0 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  display: block !important;
}
</style>

<style scoped>
.featured-main-article {
  font-family: var(--font-body);
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.article-category {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.article-date {
  color: #6b7280;
  font-size: 0.875rem;
}

.article-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.article-content {
  font-size: 1rem;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 1rem;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.article-content::-webkit-scrollbar {
  width: 6px;
}

.article-content::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.article-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.article-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.author-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.read-full-link {
  color: var(--mountain-primary);
  text-decoration: none;
  font-weight: 500;
}

.read-full-link:hover {
  text-decoration: underline;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .article-title {
    font-size: 1.25rem;
  }
  
  .article-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .article-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style> 