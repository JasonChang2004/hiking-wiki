<template>
  <div class="mountain-categories">
    <!-- 載入狀態 -->
    <div v-if="loadingCounts" class="loading-section">
      <div class="loading-grid">
        <div v-for="i in 8" :key="i" class="loading-card">
          <div class="loading-shimmer"></div>
        </div>
      </div>
      <p class="loading-text">🔍 正在載入分類統計...</p>
    </div>
    
    <!-- 分類網格 -->
    <div v-else class="category-grid">
      <div 
        v-for="(category, index) in categories" 
        :key="category.name"
        class="category-card"
        :style="{ '--delay': index * 0.1 + 's' }"
      >
        <router-link
          :to="`/category/${category.name}`"
          class="category-link"
        >
          <div class="category-content">
            <!-- 圖示區域 -->
            <div class="category-icon-container">
              <span class="category-icon">{{ category.icon }}</span>
              <div class="icon-background"></div>
            </div>
            
            <!-- 文字內容 -->
            <div class="category-info">
              <div class="category-text">
                <h3 class="category-title">{{ category.label }}</h3>
              </div>
              <div class="category-stats">
                <span class="article-count">{{ category.count }}+</span>
                <span class="article-label">條目</span>
              </div>
            </div>
          </div>
          
          <!-- 懸停效果 -->
          <div class="hover-overlay"></div>
        </router-link>
      </div>
    </div>
    
    <!-- 說明文字 -->
    <div class="category-footer">
      <div class="footer-content">
        <span class="footer-icon">💡</span>
        <p class="footer-text">
          點擊任一分類深入探索相關知識，每個分類都包含經驗豐富的山友精心整理的實用資訊。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '@/firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import type { CategoryItem } from '@/types';

// 初始分類設定
const categories = ref<CategoryItem[]>([
  { name: '登山路線', label: '登山路線', icon: '🗻', count: 0 },
  { name: '裝備心得', label: '裝備心得', icon: '🎒', count: 0 },
  { name: '登山知識', label: '登山知識', icon: '📚', count: 0 },
  { name: '緊急應變', label: '緊急應變', icon: '🚨', count: 0 },
  { name: '野外生存', label: '野外生存', icon: '🏕️', count: 0 },
  { name: '保育生態', label: '保育生態', icon: '🌱', count: 0 },
  { name: '登山飲食', label: '登山飲食', icon: '🍱', count: 0 },
  { name: '入門指南', label: '入門指南', icon: '👣', count: 0 },
]);

const loadingCounts = ref(true);

onMounted(async () => {
  loadingCounts.value = true;
  try {
    const categoryPromises = categories.value.map(async (category) => {
      const q = query(
        collection(db, 'articles'),
        where('category', '==', category.name),
        where('status', '==', 'approved')
      );
      const snapshot = await getCountFromServer(q);
      return { ...category, count: snapshot.data().count };
    });

    const updatedCategories = await Promise.all(categoryPromises);
    categories.value = updatedCategories;
  } catch (error) {
    console.error('Error loading category counts:', error);
  } finally {
    loadingCounts.value = false;
  }
});
</script>

<style scoped>
.mountain-categories {
  font-family: var(--font-body);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 載入狀態 */
.loading-section {
  text-align: center;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.loading-card {
  height: 140px;
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

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.loading-text {
  color: var(--stone-medium);
  font-size: 1rem;
  margin: 0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* 分類網格 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-md);
  box-sizing: border-box;
}

/* 分類卡片 */
.category-card {
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

.category-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--mountain-primary);
}

.category-link {
  display: block;
  position: relative;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.category-content {
  position: relative;
  padding: 1rem;
  height: 75px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 2;
}

/* 圖示區域 */
.category-icon-container {
  position: relative;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-icon {
  font-size: 1.125rem;
  position: relative;
  z-index: 3;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  transition: transform 0.3s ease;
}

.icon-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    var(--mountain-primary) 0%, 
    var(--mountain-secondary) 100%
  );
  border-radius: 0.75rem;
  opacity: 0.1;
  transition: all 0.3s ease;
  z-index: 1;
}

.category-card:hover .category-icon {
  transform: scale(1.1);
}

.category-card:hover .icon-background {
  opacity: 0.2;
  transform: scale(1.1);
}

/* 文字內容 */
.category-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-text {
  flex: 1;
  min-width: 0;
}

.category-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin: 0;
  font-family: var(--font-display);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-stats {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-left: 0.75rem;
  flex-shrink: 0;
}

.article-count {
  font-size: 1rem;
  font-weight: 700;
  color: var(--mountain-primary);
  font-family: var(--font-display);
}

.article-label {
  font-size: 0.75rem;
  color: var(--stone-medium);
}

/* 進入箭頭 */
.category-arrow {
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  margin-left: 0.5rem;
}

.arrow-icon {
  font-size: 0.875rem;
  color: var(--mountain-primary);
  transition: transform 0.3s ease;
}

.category-card:hover .category-arrow {
  background: var(--mountain-primary);
  transform: scale(1.1);
}

.category-card:hover .arrow-icon {
  color: white;
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
    rgba(34, 197, 94, 0.05) 0%, 
    rgba(14, 165, 233, 0.05) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.category-card:hover .hover-overlay {
  opacity: 1;
}

/* 頁腳說明 */
.category-footer {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(240, 253, 244, 0.3);
  border-radius: 1rem;
  border: 1px solid rgba(34, 197, 94, 0.1);
}

.footer-content {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  max-width: 600px;
  margin: 0 auto;
  text-align: left;
}

.footer-icon {
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.footer-text {
  color: var(--stone-medium);
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0 var(--space-sm);
  }
  
  .category-content {
    padding: 0.875rem;
    height: 65px;
  }
  
  .category-icon-container {
    width: 1.75rem;
    height: 1.75rem;
  }
  
  .category-icon {
    font-size: 1rem;
  }
  
  .category-title {
    font-size: 0.9rem;
  }
  
  .article-count {
    font-size: 0.9rem;
  }
  
  .category-arrow {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .arrow-icon {
    font-size: 0.75rem;
  }
  
  .footer-content {
    text-align: center;
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .loading-grid {
    grid-template-columns: 1fr;
    padding: 0 var(--space-xs);
  }
  
  .category-grid {
    padding: 0 var(--space-xs);
  }
  
  .category-content {
    padding: 0.75rem;
    gap: 0.5rem;
    height: 55px;
  }
  
  .category-icon-container {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .category-icon {
    font-size: 0.875rem;
  }
  
  .category-title {
    font-size: 0.8rem;
  }
  
  .article-count {
    font-size: 0.8rem;
  }
  
  .article-label {
    font-size: 0.7rem;
  }
  
  .category-arrow {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .arrow-icon {
    font-size: 0.7rem;
  }
}

/* 無障礙設計 */
@media (prefers-reduced-motion: reduce) {
  .category-card {
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
  .category-card {
    border: 2px solid var(--stone-dark);
    background: white;
  }
  
  .category-title {
    color: black;
  }
  
  .icon-background {
    background: var(--mountain-primary);
    opacity: 0.3;
  }
}
</style>
