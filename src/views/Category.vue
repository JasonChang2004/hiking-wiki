<script setup lang="ts">
import { useRoute } from 'vue-router'
import { db } from '../firebase'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { onMounted, ref, watch } from 'vue'
import { formatDate } from '../utils/formatters'
import type { Article } from '../types'

const route = useRoute()
const articles = ref<Article[]>([])
const loading = ref(true)
const categoryName = ref(route.params.name as string)

const fetchArticlesByCategory = async (category: string) => {
  loading.value = true
  try {
    let q;
    
    if (category === '所有文章') {
      // 如果是「所有文章」分類，只篩選已審核的文章，不限制分類
      q = query(
        collection(db, 'articles'),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      )
    } else {
      // 其他分類正常篩選
      q = query(
        collection(db, 'articles'),
        where('status', '==', 'approved'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      )
    }
    
    const snap = await getDocs(q)
    articles.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article))
    
  } catch (error) {
    console.error(`Error fetching articles for category ${category}:`, error)
    articles.value = []
  } finally {
    loading.value = false
  }
}

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
    '所有文章': '📚',
    '一般': '📄'
  };
  return icons[category] || '📄';
};

// 取得分類描述
const getCategoryDescription = (category: string): string => {
  const descriptions: Record<string, string> = {
    '百岳': '探索台灣百岳的登山路線、攻略與心得分享',
    '郊山': '親近城市周邊的山林步道與健行路線',
    '海外': '海外登山經驗、國際山岳資訊與攻略',
    '裝備': '登山裝備選購指南與使用心得',
    '登山路線': '各種登山路線的詳細介紹與攻略',
    '裝備心得': '實際使用登山裝備的心得與評測',
    '登山知識': '登山技巧、安全知識與專業指南',
    '緊急應變': '山難救援、急救知識與緊急應變處理',
    '野外生存': '野外生存技巧與求生知識',
    '保育生態': '山林保育、生態保護與環境意識',
    '登山飲食': '登山料理、營養補給與食物準備',
    '入門指南': '登山新手必備知識與入門指導',
    '所有文章': '瀏覽所有已發布的登山知識文章',
    '一般': '其他登山相關主題與討論'
  };
  return descriptions[category] || '探索相關的登山知識與經驗分享';
};

// 取得文章摘要
const getExcerpt = (content: string): string => {
  if (!content) return '暫無內容描述...';
  const plainText = content.replace(/<[^>]*>/g, ''); // 移除HTML標籤
  return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
};

onMounted(() => {
  fetchArticlesByCategory(categoryName.value)
})

watch(
  () => route.params.name,
  (newName) => {
    if (newName) {
      categoryName.value = newName as string;
      fetchArticlesByCategory(categoryName.value);
    }
  }
)
</script>

<template>
  <div class="mountain-category">
    <div class="container">
      <!-- 頁面標題區塊 -->
      <div class="category-header">
        <div class="header-content">
          <h1 class="category-title">
            <span class="title-icon">🗂️</span>
            分類：{{ $route.params.name }}
          </h1>
          <p class="category-description">
            {{ getCategoryDescription($route.params.name as string) }}
          </p>
        </div>
      </div>

      <!-- 載入狀態 -->
      <div v-if="loading" class="loading-section">
        <div class="loading-grid">
          <div v-for="i in 6" :key="i" class="loading-card">
            <div class="loading-shimmer"></div>
          </div>
        </div>
        <p class="loading-text">🔄 正在載入文章...</p>
      </div>

      <!-- 無文章提示 -->
      <div v-else-if="articles.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3 class="empty-title">目前沒有該分類的文章</h3>
        <p class="empty-description">
          此分類暫時沒有已發布的文章。歡迎您來投稿第一篇！
        </p>
        <div class="empty-actions">
          <router-link to="/submit-article" class="btn btn-primary">
            <span class="btn-icon">✍️</span>
            立即投稿
          </router-link>
          <router-link to="/" class="btn btn-outline">
            <span class="btn-icon">🏠</span>
            返回首頁
          </router-link>
        </div>
      </div>

      <!-- 文章列表 -->
      <div v-else class="articles-section">
        <!-- 結果統計 -->
        <div class="results-header">
          <div class="results-count">
            <span class="count-number">{{ articles.length }}</span>
            <span class="count-label">篇文章</span>
            <span class="filter-info">
              來自分類「{{ $route.params.name }}」
            </span>
          </div>
          <div class="header-actions">
            <router-link to="/" class="btn btn-outline btn-sm">
              <span class="btn-icon">🏠</span>
              返回首頁
            </router-link>
          </div>
        </div>

        <!-- 文章卡片網格 -->
        <div class="article-grid">
          <article
            v-for="(article, index) in articles"
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
                <p class="article-excerpt">{{ getExcerpt(article.content) }}</p>
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.mountain-category {
  font-family: var(--font-body);
  min-height: 100vh;
  background: linear-gradient(135deg, 
    var(--mountain-50) 0%,
    var(--sky-50) 50%,
    var(--earth-50) 100%
  );
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* 頁面標題區塊 */
.category-header {
  text-align: center;
  margin-bottom: 3rem;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
}

.category-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--stone-dark);
  margin-bottom: 1rem;
  font-family: var(--font-display);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 2rem;
}

.category-description {
  font-size: 1.1rem;
  color: var(--stone-medium);
  line-height: 1.6;
  margin: 0;
}

/* 載入狀態 */
.loading-section {
  text-align: center;
  margin: 3rem 0;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.loading-card {
  height: 280px;
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.3);
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

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.loading-text {
  color: var(--stone-medium);
  font-size: 1rem;
  margin: 0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  max-width: 500px;
  margin: 3rem auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: 1rem;
  font-family: var(--font-display);
}

.empty-description {
  color: var(--stone-medium);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* 文章區域 */
.articles-section {
  max-width: 100%;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  flex-wrap: wrap;
  gap: 1rem;
}

.results-count {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex: 1;
}

.count-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--mountain-primary);
  font-family: var(--font-display);
}

.count-label {
  color: var(--stone-medium);
  font-size: 1rem;
}

.filter-info {
  color: var(--stone-medium);
  font-size: 0.875rem;
  opacity: 0.8;
}

.header-actions {
  flex-shrink: 0;
}

/* 文章網格 */
.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* 文章卡片 */
.article-card {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: slideInUp 0.6s ease-out calc(var(--delay));
  animation-fill-mode: both;
}

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

.article-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
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

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem 1rem;
  font-size: 0.75rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--stone-medium);
}

.author-icon {
  font-size: 0.875rem;
}

.read-more {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--mountain-primary);
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.article-card:hover .read-more {
  opacity: 1;
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.article-card:hover .arrow-icon {
  transform: translateX(2px);
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    var(--mountain-primary) 0%, 
    var(--sky-primary) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.article-card:hover .hover-overlay {
  opacity: 0.05;
}

/* 按鈕樣式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  font-size: 0.875rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--mountain-primary), var(--mountain-accent));
  color: white;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);
}

.btn-outline {
  background: rgba(255, 255, 255, 0.8);
  color: var(--stone-dark);
  border-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: var(--mountain-primary);
  color: var(--mountain-primary);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}

.btn-icon {
  font-size: 1rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .category-title {
    font-size: var(--text-3xl);
    flex-direction: column;
    gap: var(--space-sm);
  }

  .category-description {
    font-size: var(--text-base);
  }

  .container {
    padding: 0 var(--space-sm);
  }

  .category-header {
    margin-bottom: var(--space-2xl);
  }

  .results-header {
    flex-direction: column;
    text-align: center;
    gap: var(--space-md);
    padding: var(--space-md);
  }

  .results-count {
    justify-content: center;
  }

  .count-number {
    font-size: var(--text-xl);
  }

  .article-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .article-card {
    margin: 0;
  }

  .article-header {
    padding: var(--space-md) var(--space-md) var(--space-sm);
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .article-content {
    padding: var(--space-sm) var(--space-md);
  }

  .article-title {
    font-size: var(--text-lg);
    line-height: var(--leading-normal);
  }

  .article-excerpt {
    font-size: var(--text-sm);
    -webkit-line-clamp: 2;
  }

  .article-footer {
    padding: 0 var(--space-md) var(--space-md);
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-xs);
  }

  .empty-actions {
    flex-direction: column;
    align-items: center;
  }

  .empty-state {
    padding: var(--space-2xl) var(--space-md);
    margin: var(--space-xl) auto;
  }

  .empty-title {
    font-size: var(--text-xl);
  }

  .empty-description {
    font-size: var(--text-sm);
  }

  .loading-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 var(--space-xs);
  }

  .category-title {
    font-size: var(--text-2xl);
  }

  .title-icon {
    font-size: 1.5rem;
  }

  .category-description {
    font-size: var(--text-sm);
  }

  .results-header {
    padding: var(--space-sm);
  }

  .count-number {
    font-size: var(--text-lg);
  }

  .filter-info {
    font-size: var(--text-xs);
  }

  .article-title {
    font-size: var(--text-base);
  }

  .article-excerpt {
    font-size: var(--text-xs);
  }

  .article-category {
    font-size: var(--text-xs);
  }

  .article-date {
    font-size: var(--text-xs);
  }

  .author-info {
    font-size: var(--text-xs);
  }

  .read-more {
    font-size: var(--text-xs);
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-title {
    font-size: var(--text-lg);
  }

  .btn {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-sm);
  }
}

/* 觸控設備優化 */
@media (hover: none) and (pointer: coarse) {
  .article-link {
    touch-action: manipulation;
  }

  .btn {
    min-height: 44px;
    touch-action: manipulation;
  }

  .article-card {
    transition: none;
  }

  .article-card:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }

  .read-more {
    opacity: 1; /* 在觸控設備上總是顯示 */
  }
}

/* 網格自適應優化 */
@media (min-width: 480px) and (max-width: 768px) {
  .article-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .article-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (min-width: 1024px) {
  .article-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
}

/* 高對比度模式 */
@media (prefers-contrast: high) {
  .mountain-category {
    background: white;
  }

  .article-card {
    border: 2px solid var(--stone-dark);
    background: white;
  }

  .results-header,
  .empty-state {
    border: 1px solid var(--stone-dark);
    background: white;
  }
}

/* 減少動畫效果 */
@media (prefers-reduced-motion: reduce) {
  .article-card,
  .hover-overlay {
    transition: none;
  }

  .loading-shimmer {
    animation: none;
  }

  .loading-text {
    animation: none;
  }

  @keyframes slideInUp {
    from, to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* 列印模式 */
@media print {
  .mountain-category {
    background: white;
    color: black;
  }

  .hover-overlay,
  .loading-section {
    display: none;
  }

  .article-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid black;
  }
}
</style>
