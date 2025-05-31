<template>
  <div class="mountain-featured-carousel">
    <!-- 載入狀態 -->
    <div v-if="isLoading" class="loading-section">
      <div class="loading-grid">
        <div v-for="i in 3" :key="i" class="loading-card">
          <div class="loading-shimmer"></div>
        </div>
      </div>
      <p class="loading-text">🌟 正在載入精選條目...</p>
    </div>
    
    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="error-section">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button @click="fetchFeaturedArticles" class="retry-button">
        🔄 重新載入
      </button>
    </div>
    
    <!-- 空狀態 -->
    <div v-else-if="articles.length === 0" class="empty-section">
      <div class="empty-icon">⭐</div>
      <h3 class="empty-title">暫無精選條目</h3>
      <p class="empty-description">編輯團隊正在精選優質內容，敬請期待！</p>
    </div>
    
    <!-- 精選文章輪播 -->
    <div v-else class="featured-carousel">
      <div class="carousel-grid">
        <article
          v-for="(article, index) in articles"
          :key="article.id"
          class="featured-card"
          :style="{ '--delay': index * 0.1 + 's' }"
        >
          <router-link :to="`/articles/${article.id}`" class="card-link">
            <!-- 精選徽章 -->
            <div class="featured-badge">
              <span class="badge-icon">⭐</span>
              <span class="badge-text">精選</span>
            </div>
            
            <!-- 卡片內容 -->
            <div class="card-content">
              <!-- 文章標題 -->
              <h3 class="article-title">{{ article.title }}</h3>
              
              <!-- 文章摘要 -->
              <p class="article-excerpt">{{ getExcerpt(article.content) }}</p>
              
              <!-- 元數據 -->
              <div class="article-meta">
                <div class="meta-row">
                  <div class="author-info">
                    <span class="meta-icon">👤</span>
                    <span class="meta-text">{{ article.displayName || '匿名作者' }}</span>
                  </div>
                  <div class="category-info">
                    <span class="meta-icon">🏷️</span>
                    <span class="meta-text">{{ article.category || '一般' }}</span>
                  </div>
                </div>
                <div class="date-info">
                  <span class="meta-icon">📅</span>
                  <span class="meta-text">{{ formatDate(article.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <!-- 閱讀更多指示 -->
            <div class="read-more-indicator">
              <span class="read-text">閱讀精選</span>
              <span class="arrow-icon">→</span>
            </div>
            
            <!-- 懸停效果 -->
            <div class="hover-overlay"></div>
          </router-link>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import type { Article } from '@/types';
import { formatDate } from '@/utils/formatters';

const articles = ref<Article[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// 取得文章摘要
const getExcerpt = (content: string): string => {
  if (!content) return '暫無內容描述...';
  const plainText = content.replace(/<[^>]*>/g, ''); // 移除HTML標籤
  return plainText.length > 80 ? plainText.substring(0, 80) + '...' : plainText;
};

const fetchFeaturedArticles = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const articlesCollection = collection(db, 'articles');
    const q = query(
      articlesCollection, 
      where('status', '==', 'approved'), 
      where('isFeatured', '==', true), 
      orderBy('createdAt', 'desc'), 
      limit(6) // 增加顯示數量
    );
    const querySnapshot = await getDocs(q);
    articles.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Article));
  } catch (err) {
    console.error("Error fetching featured articles:", err);
    error.value = "載入精選文章失敗，請稍後重試";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchFeaturedArticles();
});
</script>

<style scoped>
.mountain-featured-carousel {
  font-family: var(--font-body);
  width: 100%;
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
}

.loading-card {
  height: 220px;
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

/* 錯誤狀態 */
.error-section {
  text-align: center;
  padding: 3rem 1rem;
  background: rgba(254, 242, 242, 0.5);
  border-radius: 1.5rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.error-message {
  color: #dc2626;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-body);
}

.retry-button:hover {
  background: linear-gradient(135deg, #b91c1c, #991b1b);
  transform: translateY(-1px);
}

/* 空狀態 */
.empty-section {
  text-align: center;
  padding: 3rem 1rem;
  background: rgba(254, 249, 195, 0.3);
  border-radius: 1.5rem;
  border: 1px solid rgba(245, 158, 11, 0.2);
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
}

/* 輪播區域 */
.featured-carousel {
  width: 100%;
}

.carousel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* 精選卡片 */
.featured-card {
  position: relative;
  border-radius: 1.25rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: slideInUp 0.6s ease-out calc(var(--delay));
  animation-fill-mode: both;
  min-height: 220px;
}

.featured-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-elevated);
  border-color: var(--mountain-primary);
}

.card-link {
  display: block;
  position: relative;
  text-decoration: none;
  color: inherit;
  height: 100%;
  padding: 1.5rem;
}

/* 精選徽章 */
.featured-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
  z-index: 3;
}

.badge-icon {
  font-size: 0.75rem;
}

.badge-text {
  font-family: var(--font-display);
}

.featured-card:hover .featured-badge {
  background: linear-gradient(135deg, #d97706, #b45309);
  transform: scale(1.05);
}

/* 卡片內容 */
.card-content {
  position: relative;
  z-index: 2;
  height: calc(100% - 2rem);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.article-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--stone-dark);
  line-height: 1.4;
  margin-bottom: 0.75rem;
  font-family: var(--font-display);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding-right: 3rem; /* 為徽章留空間 */
}

.article-excerpt {
  font-size: 0.875rem;
  color: var(--stone-medium);
  line-height: 1.6;
  margin-bottom: 1rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 元數據 */
.article-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--stone-medium);
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.author-info,
.category-info,
.date-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-icon {
  font-size: 0.75rem;
  opacity: 0.8;
}

.meta-text {
  font-weight: 500;
}

/* 閱讀更多指示器 */
.read-more-indicator {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--mountain-primary);
  transition: all 0.3s ease;
  z-index: 3;
}

.read-text {
  font-family: var(--font-display);
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.featured-card:hover .read-more-indicator {
  background: var(--mountain-primary);
  color: white;
  transform: scale(1.05);
}

.featured-card:hover .arrow-icon {
  transform: translateX(2px);
}

/* 懸停疊加層 */
.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.03) 0%, 
    rgba(245, 158, 11, 0.03) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.featured-card:hover .hover-overlay {
  opacity: 1;
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
@media (max-width: 768px) {
  .carousel-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .featured-card {
    min-height: 200px;
  }
  
  .card-link {
    padding: 1.25rem;
  }
  
  .article-title {
    font-size: 1rem;
    padding-right: 2.5rem;
  }
  
  .article-excerpt {
    font-size: 0.8rem;
  }
  
  .featured-badge {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }
  
  .meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .loading-grid {
    grid-template-columns: 1fr;
  }
  
  .featured-card {
    min-height: 180px;
  }
  
  .card-link {
    padding: 1rem;
  }
  
  .article-title {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .article-excerpt {
    font-size: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .article-meta {
    font-size: 0.7rem;
  }
  
  .read-more-indicator {
    bottom: 0.75rem;
    right: 0.75rem;
    padding: 0.375rem 0.5rem;
    font-size: 0.7rem;
  }
}

/* 無障礙設計 */
@media (prefers-reduced-motion: reduce) {
  .featured-card {
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

/* 高對比度模式 */
@media (prefers-contrast: high) {
  .featured-card {
    border: 2px solid var(--stone-dark);
    background: white;
  }
  
  .article-title {
    color: black;
  }
  
  .featured-badge {
    background: var(--mountain-primary);
  }
}
</style>
