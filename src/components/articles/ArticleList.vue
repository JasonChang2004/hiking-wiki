<template>
  <div class="mountain-article-list">
    <!-- 搜尋與篩選區域 -->
    <div class="search-filter-section">
      <div class="search-container">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="search"
            type="text"
            placeholder="搜尋文章標題或內容..."
            class="search-input"
          />
          <button 
            v-if="search"
            @click="search = ''"
            class="clear-search"
            title="清除搜尋"
          >
            ×
          </button>
        </div>
      </div>

      <div class="filter-container">
        <select 
          v-model="selectedCategory" 
          class="category-select"
        >
          <option value="">📁 全部分類</option>
          <option v-for="c in categories" :key="c" :value="c">
            {{ getCategoryIcon(c) }} {{ c }}
          </option>
        </select>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-section">
      <div class="loading-grid">
        <div v-for="i in 5" :key="i" class="loading-article-card">
          <div class="loading-shimmer"></div>
        </div>
      </div>
      <p class="loading-text">🔄 正在載入最新條目...</p>
    </div>
    
    <!-- 空狀態 -->
    <div v-else-if="filteredArticles.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3 class="empty-title">暫無相關條目</h3>
      <p class="empty-description">
        {{ search || selectedCategory ? '請嘗試調整搜尋條件或瀏覽其他分類' : '目前還沒有已發布的文章，歡迎您來投稿第一篇！' }}
      </p>
      <div class="empty-actions" v-if="!search && !selectedCategory">
        <router-link to="/submit-article" class="btn btn-primary">
          <span>✍️</span>
          立即投稿
        </router-link>
      </div>
    </div>

    <!-- 文章列表 -->
    <div v-else class="articles-section">
      <!-- 結果統計 -->
      <div class="results-header">
        <div class="results-count">
          <span class="count-number">{{ filteredArticles.length }}</span>
          <span class="count-label">個條目</span>
          <span v-if="search || selectedCategory" class="filter-info">
            {{ search ? `包含「${search}」` : '' }}
            {{ search && selectedCategory ? '，' : '' }}
            {{ selectedCategory ? `分類「${selectedCategory}」` : '' }}
          </span>
        </div>
        <div class="sort-options">
          <select v-model="sortBy" class="sort-select">
            <option value="newest">🕒 最新更新</option>
            <option value="title">🔤 標題排序</option>
            <option value="category">📂 分類排序</option>
          </select>
        </div>
      </div>

      <!-- 文章卡片網格 -->
      <div class="article-grid">
        <article
          v-for="(article, index) in sortedArticles"
          :key="article.id"
          class="article-card"
          :style="{ '--delay': index * 0.05 + 's' }"
        >
          <router-link :to="`/articles/${article.id}`" class="article-link">
            <!-- 卡片頭部 -->
            <div class="article-header">
              <div class="article-category">
                <span class="category-icon">{{ getCategoryIcon(article.category) }}</span>
                <span class="category-name">{{ article.category || '一般' }}</span>
              </div>
              <div class="article-date">
                {{ formatDate(article.createdAt) }}
              </div>
            </div>

            <!-- 主要內容 -->
            <div class="article-content">
              <h3 class="article-title">{{ article.title }}</h3>
              <p class="article-excerpt" v-html="getArticlePreview(article.content)"></p>
            </div>

            <!-- 卡片底部 -->
            <div class="article-footer">
              <div class="author-info">
                <span class="author-icon">👤</span>
                <span class="author-name">{{ article.displayName }}</span>
              </div>
              <div class="read-more">
                <span class="read-text">閱讀全文</span>
                <span class="arrow-icon">→</span>
              </div>
            </div>

            <!-- 懸停效果 -->
            <div class="hover-overlay"></div>
          </router-link>
        </article>
      </div>
      
      <!-- 載入更多按鈕 -->
      <div class="load-more-section" v-if="hasMore">
        <button @click="loadMore" class="btn btn-outline load-more-btn" :disabled="loadingMore">
          <span v-if="loadingMore">⏳ 載入中...</span>
          <span v-else>📚 載入更多條目</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import { formatDate } from '../../utils/formatters'
import { getArticlePreview } from '../../utils/formatters'
import type { Article } from '../../types'

const articles = ref<Article[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const search = ref('')
const selectedCategory = ref('')
const sortBy = ref('newest')
const hasMore = ref(true)
const lastDoc = ref<any>(null)
const pageSize = 12

// 分類清單
const categories = ['百岳', '郊山', '海外', '裝備', '登山路線', '裝備心得', '登山知識', '緊急應變', '野外生存', '保育生態', '登山飲食', '入門指南']

// 取得分類圖示
const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    '百岳': '🏔️',
    '郊山': '⛰️',
    '海外': '🌍',
    '裝備': '🎒',
    '登山路線': '🗻',
    '裝備心得': '🎒',
    '登山知識': '📚',
    '緊急應變': '🚨',
    '野外生存': '🏕️',
    '保育生態': '🌱',
    '登山飲食': '🍱',
    '入門指南': '👣',
    '一般': '📄'
  };
  return icons[category] || '📄';
};

// 篩選文章
const filteredArticles = computed(() => {
  const keyword = search.value.toLowerCase()
  return articles.value.filter(article => {
    const matchSearch =
      (article.title?.toLowerCase() || '').includes(keyword) ||
      (article.content?.toLowerCase() || '').includes(keyword)
    const matchCategory =
      !selectedCategory.value || article.category === selectedCategory.value
    return matchSearch && matchCategory
  })
})

// 排序文章
const sortedArticles = computed(() => {
  const sorted = [...filteredArticles.value]
  
  switch (sortBy.value) {
    case 'title':
      return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    case 'category':
      return sorted.sort((a, b) => (a.category || '').localeCompare(b.category || ''))
    case 'newest':
    default:
      return sorted.sort((a, b) => {
        // 處理Firebase Timestamp或Date類型
        let dateA: Date
        let dateB: Date
        
        if (a.createdAt && typeof a.createdAt === 'object' && 'toDate' in a.createdAt) {
          dateA = a.createdAt.toDate()
        } else if (a.createdAt instanceof Date) {
          dateA = a.createdAt
        } else {
          dateA = new Date(a.createdAt || 0)
        }
        
        if (b.createdAt && typeof b.createdAt === 'object' && 'toDate' in b.createdAt) {
          dateB = b.createdAt.toDate()
        } else if (b.createdAt instanceof Date) {
          dateB = b.createdAt
        } else {
          dateB = new Date(b.createdAt || 0)
        }
        
        return dateB.getTime() - dateA.getTime()
      })
  }
})

// 載入文章
const loadArticles = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }
  
  try {
    let q = query(
      collection(db, 'articles'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    )

    if (isLoadMore && lastDoc.value) {
      q = query(
        collection(db, 'articles'),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc.value),
        limit(pageSize)
      )
    }

    const snapshot = await getDocs(q)
    const newArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article))
    
    if (isLoadMore) {
      articles.value = [...articles.value, ...newArticles]
    } else {
      articles.value = newArticles
    }

    lastDoc.value = snapshot.docs[snapshot.docs.length - 1]
    hasMore.value = snapshot.docs.length === pageSize
    
  } catch (error) {
    console.error("Error loading articles:", error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 載入更多
const loadMore = () => {
  loadArticles(true)
}

onMounted(() => {
  loadArticles()
})
</script>

<style scoped>
.mountain-article-list {
  font-family: var(--font-body);
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 搜尋與篩選區域 */
.search-filter-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  padding: 0 var(--space-md);
  box-sizing: border-box;
}

.search-container {
  flex: 1;
  min-width: 250px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  font-size: 1rem;
  color: var(--stone-medium);
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 0.875rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  transition: all 0.3s ease;
  font-family: var(--font-body);
}

.search-input:focus {
  outline: none;
  border-color: var(--mountain-primary);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: var(--stone-light);
  border-radius: 50%;
  font-size: 1rem;
  line-height: 1;
  color: var(--stone-medium);
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-search:hover {
  background: var(--stone-medium);
  color: white;
}

.filter-container {
  flex-shrink: 0;
}

.category-select,
.sort-select {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  color: var(--stone-dark);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-body);
}

.category-select:focus,
.sort-select:focus {
  outline: none;
  border-color: var(--mountain-primary);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

/* 載入狀態 */
.loading-section {
  text-align: center;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  justify-content: center;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.loading-article-card {
  height: 200px;
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
  background: #f8f9fa;
}

.loading-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    rgba(255,255,255,0) 0%, 
    rgba(255,255,255,0.8) 50%, 
    rgba(255,255,255,0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.loading-text {
  color: var(--stone-medium);
  font-size: 1rem;
  margin: 0;
  animation: pulse 2s infinite;
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 1.5rem;
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: 0.5rem;
  font-family: var(--font-display);
}

.empty-description {
  color: var(--stone-medium);
  font-size: 1rem;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto 1.5rem;
}

.empty-actions {
  margin-top: 1.5rem;
}

/* 文章區域 */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0.75rem;
  border: 1px solid rgba(229, 231, 235, 0.3);
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
  max-width: 1200px;
  box-sizing: border-box;
}

.results-count {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex: 1;
}

.count-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--mountain-primary);
  font-family: var(--font-display);
}

.count-label {
  color: var(--stone-medium);
  font-size: 0.875rem;
}

.filter-info {
  color: var(--stone-medium);
  font-size: 0.875rem;
  opacity: 0.8;
}

.sort-options {
  flex-shrink: 0;
}

/* 文章網格 */
.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-md) 1rem;
  box-sizing: border-box;
}

/* 文章卡片 */
.article-card {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: slideInUp 0.6s ease-out calc(var(--delay));
  animation-fill-mode: both;
}

.article-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--mountain-primary);
}

.article-link {
  display: block;
  position: relative;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem 0;
  font-size: 0.75rem;
}

.article-category {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, var(--mountain-100), var(--mountain-200));
  border-radius: 0.5rem;
  color: var(--mountain-accent);
  font-weight: 500;
}

.category-icon {
  font-size: 0.875rem;
}

.article-date {
  color: var(--stone-medium);
  font-size: 0.75rem;
}

.article-content {
  padding: 1rem;
}

.article-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: 0.75rem;
  line-height: 1.4;
  font-family: var(--font-display);
  transition: color 0.3s ease;
}

.article-card:hover .article-title {
  color: var(--mountain-primary);
}

.article-excerpt {
  color: var(--stone-medium);
  font-size: 0.875rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 文章摘要中的超連結樣式 */
.article-excerpt :deep(link) {
  color: #0ea5e9;
  font-weight: 500;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem 1rem;
  margin-top: auto;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--stone-medium);
  font-size: 0.75rem;
}

.author-icon {
  font-size: 0.875rem;
}

.read-more {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--mountain-primary);
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.article-card:hover .read-more {
  color: var(--mountain-secondary);
}

.article-card:hover .arrow-icon {
  transform: translateX(3px);
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.02) 0%, 
    rgba(14, 165, 233, 0.02) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.article-card:hover .hover-overlay {
  opacity: 1;
}

/* 載入更多 */
.load-more-section {
  text-align: center;
  margin-top: 2rem;
}

.load-more-btn {
  padding: 0.875rem 2rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* 動畫 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* 響應式設計 */
@media (max-width: 1200px) and (min-width: 769px) {
  .article-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    max-width: 900px;
  }
}

@media (max-width: 768px) {
  .search-filter-section {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0 var(--space-sm);
  }
  
  .results-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    padding: 0 var(--space-sm);
    margin: 0 var(--space-sm) 1.5rem;
  }
  
  .results-count {
    justify-content: flex-start;
  }
  
  .sort-options {
    align-self: flex-end;
  }
  
  .article-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0 var(--space-sm);
  }
  
  .article-content {
    padding: 0.75rem;
  }
  
  .article-title {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .search-filter-section {
    padding: 0 var(--space-xs);
  }
  
  .results-header {
    padding: 0 var(--space-xs);
    margin: 0 var(--space-xs) 1.5rem;
  }
  
  .article-grid {
    padding: 0 var(--space-xs);
  }
  
  .search-input {
    padding: 0.625rem 1rem 0.625rem 2.25rem;
  }
  
  .category-select,
  .sort-select {
    padding: 0.625rem 0.75rem;
    font-size: 0.8rem;
  }
  
  .article-header {
    padding: 0.75rem 0.75rem 0;
  }
  
  .article-content {
    padding: 0.5rem 0.75rem;
  }
  
  .article-footer {
    padding: 0 0.75rem 0.75rem;
  }
}

/* 無障礙設計 */
@media (prefers-reduced-motion: reduce) {
  .article-card {
    animation: none;
  }
  
  .loading-shimmer {
    animation: none;
  }
  
  .loading-text {
    animation: none;
  }
  
  * {
    transition: none !important;
  }
}
</style>
