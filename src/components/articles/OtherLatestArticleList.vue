<template>
  <div class="other-latest-article-list">
    <!-- 文章列表 -->
    <div v-if="articles.length > 0" class="article-list">
      <article
        v-for="article in articles"
        :key="article.id"
        class="article-item"
      >
        <router-link :to="`/articles/${article.id}`" class="article-link">
          <div class="article-main">
            <div class="article-meta">
              <span class="category-badge">{{ article.category || '一般' }}</span>
              <time class="article-date">{{ formatDate(article.createdAt) }}</time>
            </div>
            
            <h3 class="article-title">{{ article.title }}</h3>
            
            <p class="article-excerpt">{{ getPreview(article.content) }}</p>
            
            <div class="article-footer">
              <div class="author-info">
                作者：{{ article.displayName }}
              </div>
              <span class="read-more">閱讀更多 →</span>
            </div>
          </div>
        </router-link>
      </article>
    </div>

    <!-- 載入狀態 -->
    <div v-else-if="loading" class="loading-list">
      <div v-for="i in 5" :key="i" class="loading-item">載入中...</div>
    </div>

    <!-- 空狀態 -->
    <div v-else class="empty-state">
      <p>暫無其他最新文章</p>
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
  const plainText = content.replace(/<[^>]*>/g, '').substring(0, 100)
  return plainText + (plainText.length >= 100 ? '...' : '')
}

// 載入其他最新文章列表（跳過第一篇）
const loadOtherLatestArticles = async () => {
  try {
    loading.value = true
    
    const q = query(
      collection(db, 'articles'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(6)
    )

    const snapshot = await getDocs(q)
    const allArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article))
    
    // 跳過第一篇文章（因為它在主要最新文章區域顯示）
    articles.value = allArticles.slice(1, 6)
    
  } catch (error) {
    console.error('Error loading other latest articles:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOtherLatestArticles()
})
</script>

<style scoped>
.other-latest-article-list {
  font-family: var(--font-body);
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
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
  padding: 1rem;
}

.article-main {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.category-badge {
  background: #f3f4f6;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
}

.article-date {
  color: #6b7280;
}

.article-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}

.article-item:hover .article-title {
  color: var(--mountain-primary);
}

.article-excerpt {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.author-info {
  color: #6b7280;
  font-size: 0.75rem;
}

.read-more {
  color: var(--mountain-primary);
  font-size: 0.75rem;
  font-weight: 500;
}

.loading-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: #ffffff;
  text-align: center;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .article-link {
    padding: 0.75rem;
  }
  
  .article-main {
    gap: 0.5rem;
  }
  
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style> 