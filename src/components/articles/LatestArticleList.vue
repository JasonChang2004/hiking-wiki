<template>
  <div class="latest-article-list">
    <!-- 文章列表 -->
    <div v-if="articles.length > 0" class="article-list">
      <article
        v-for="article in articles"
        :key="article.id"
        class="article-item"
      >
        <router-link :to="`/articles/${article.id}`" class="article-link">
          <div class="article-content">
            <div class="article-header">
              <span class="category-tag">{{ article.category || '一般' }}</span>
              <time class="article-date">{{ formatDate(article.createdAt) }}</time>
            </div>
            
            <h4 class="article-title">{{ article.title }}</h4>
            
            <p class="article-summary">{{ getPreview(article.content) }}</p>
            
            <div class="article-meta">
              <span class="author-info">{{ article.displayName }}</span>
              <span class="read-indicator">→</span>
            </div>
          </div>
        </router-link>
      </article>
    </div>

    <!-- 載入狀態 -->
    <div v-else-if="loading" class="loading-list">
      <div v-for="i in 8" :key="i" class="loading-item">載入中...</div>
    </div>

    <!-- 空狀態 -->
    <div v-else class="empty-state">
      <p>暫無最新文章</p>
    </div>

    <!-- 查看更多按鈕 -->
    <div v-if="articles.length > 0" class="load-more-section">
      <router-link to="/category/所有文章" class="load-more-btn">
        查看所有最新文章
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import type { Article } from '@/types'

const articles = ref<Article[]>([])
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

// 簡化的內容預覽
const getPreview = (content: string): string => {
  if (!content) return '暫無內容...'
  const plainText = content.replace(/<[^>]*>/g, '').substring(0, 80)
  return plainText + (plainText.length >= 80 ? '...' : '')
}

// 載入最新文章列表
const loadLatestArticles = async () => {
  try {
    loading.value = true
    
    const q = query(
      collection(db, 'articles'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(8)
    )

    const snapshot = await getDocs(q)
    articles.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article))
    
  } catch (error) {
    console.error('Error loading latest articles:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLatestArticles()
})
</script>

<style scoped>
.latest-article-list {
  font-family: var(--font-body);
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.article-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.article-item:hover {
  border-color: var(--mountain-primary);
  transform: translateY(-1px);
}

.article-link {
  display: block;
  text-decoration: none;
  color: inherit;
  padding: 0.875rem;
}

.article-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
}

.category-tag {
  background: rgba(34, 197, 94, 0.1);
  color: var(--mountain-accent);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.article-date {
  color: #9ca3af;
  font-size: 0.65rem;
}

.article-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
}

.article-item:hover .article-title {
  color: var(--mountain-primary);
}

.article-summary {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
  margin: 0;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
}

.author-info {
  color: #9ca3af;
  font-size: 0.65rem;
}

.read-indicator {
  color: var(--mountain-primary);
  font-size: 0.75rem;
  font-weight: 600;
}

.loading-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.loading-item {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.875rem;
  background: #ffffff;
  text-align: center;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #6b7280;
}

.load-more-section {
  margin-top: 1rem;
  text-align: center;
}

.load-more-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--mountain-primary), var(--mountain-secondary));
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.load-more-btn:hover {
  background: linear-gradient(135deg, var(--mountain-secondary), var(--mountain-accent));
  transform: translateY(-1px);
  color: white;
  text-decoration: none;
}

@media (max-width: 768px) {
  .article-link {
    padding: 0.75rem;
  }
  
  .article-content {
    gap: 0.375rem;
  }
  
  .article-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style> 