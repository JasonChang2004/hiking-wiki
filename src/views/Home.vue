<template>
  <div class="mountain-home">
    <!-- Hero 區塊 - 山林主題重新設計 -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="title-emoji">🏔️</span>
            探索台灣山林之美
            <span class="title-accent">發現知識寶藏</span>
          </h1>
          <p class="hero-description">
            這是一個由登山愛好者共同維護的協作平台，致力於整理、分享與保存台灣山林的珍貴知識與實務經驗。
            讓我們一起建構最完整的台灣登山知識庫！
          </p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">1000+</span>
              <span class="stat-label">知識條目</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">500+</span>
              <span class="stat-label">登山路線</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">10000+</span>
              <span class="stat-label">社群成員</span>
            </div>
          </div>
          <div class="hero-actions">
            <router-link to="/submit-article" class="btn btn-primary hero-btn">
              <span class="btn-icon">✍️</span>
              開始投稿
            </router-link>
            <a href="#categories" class="btn btn-outline hero-btn">
              <span class="btn-icon">🔍</span>
              探索知識庫
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 特色功能區塊 -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">🌟 平台特色</h2>
        <div class="features-grid">
          <div class="feature-card animate-slide-up">
            <div class="feature-icon gradient-mountain">🗺️</div>
            <h3 class="feature-title">詳細路線指南</h3>
            <p class="feature-description">提供完整的登山路線資訊，包含難度分析、注意事項及最新路況更新</p>
          </div>
          <div class="feature-card animate-slide-up">
            <div class="feature-icon gradient-earth">🎒</div>
            <h3 class="feature-title">裝備推薦</h3>
            <p class="feature-description">根據不同登山需求，提供專業的裝備選擇建議和使用心得分享</p>
          </div>
          <div class="feature-card animate-slide-up">
            <div class="feature-icon gradient-sky">🌤️</div>
            <h3 class="feature-title">天氣資訊</h3>
            <p class="feature-description">整合氣象資料，提供山區天氣預報和最佳登山時機建議</p>
          </div>
          <div class="feature-card animate-slide-up">
            <div class="feature-icon gradient-mountain">👥</div>
            <h3 class="feature-title">社群互動</h3>
            <p class="feature-description">連結登山愛好者，分享經驗、組隊登山，建立安全的登山網路</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 分類導覽 -->
    <section id="categories" class="categories-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">🗂️ 知識分類索引</h2>
          <p class="section-subtitle">按主題探索豐富的登山知識內容</p>
        </div>
        <div class="category-container">
          <Suspense>
            <CategoryGrid />
            <template #fallback>
              <div class="loading-grid">
                <div v-for="i in 8" :key="i" class="loading-card"></div>
              </div>
            </template>
          </Suspense>
        </div>
      </div>
    </section>

    <!-- 精選文章區塊 -->
    <section id="featured" class="featured-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">🌟 精選知識條目</h2>
          <p class="section-subtitle">編輯團隊精心挑選的優質內容</p>
        </div>
        <div class="featured-container">
          <Suspense>
            <FeaturedCarousel />
            <template #fallback>
              <div class="loading-carousel"></div>
            </template>
          </Suspense>
        </div>
      </div>
    </section>

    <!-- 最新文章列表 -->
    <section id="latest" class="latest-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">🆕 最新更新條目</h2>
          <div class="section-actions">
            <router-link to="/category/所有文章" class="view-all-link">
              查看完整列表
              <span class="link-arrow">→</span>
            </router-link>
          </div>
        </div>
        <div class="latest-container">
          <Suspense>
            <ArticleList />
            <template #fallback>
              <div class="loading-articles">
                <div v-for="i in 5" :key="i" class="loading-article"></div>
              </div>
            </template>
          </Suspense>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 優化異步組件載入
const ArticleList = defineAsyncComponent({
  loader: () => import('../components/articles/ArticleList.vue'),
  errorComponent: () => import('../components/common/ErrorComponent.vue'),
  delay: 200,
  timeout: 30000,
})

const FeaturedCarousel = defineAsyncComponent({
  loader: () => import('../components/layout/FeaturedCarousel.vue'),
  errorComponent: () => import('../components/common/ErrorComponent.vue'),
  delay: 200,
  timeout: 30000,
})

const CategoryGrid = defineAsyncComponent({
  loader: () => import('../components/articles/CategoryGrid.vue'),
  errorComponent: () => import('../components/common/ErrorComponent.vue'),
  delay: 200,
  timeout: 30000,
})
</script>

<style scoped>
.mountain-home {
  font-family: var(--font-body);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Hero 區塊 - 山林主題 */
.hero-section {
  position: relative;
  min-height: 40vh;
  display: flex;
  align-items: center;
  padding: 1rem 0;
  background: linear-gradient(135deg, 
    var(--mountain-50) 0%,
    var(--sky-50) 50%,
    var(--earth-50) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero-text {
  text-align: center;
  max-width: 800px;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  font-family: var(--font-display);
}

.title-emoji {
  display: inline-block;
  margin-right: 0.5rem;
}

.title-accent {
  display: block;
  color: var(--stone-dark) !important;
  margin-top: 0.5rem;
  font-weight: 700;
}

.hero-description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--stone-medium);
  margin-bottom: 1rem;
}

.hero-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  justify-content: center;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--mountain-primary);
  font-family: var(--font-display);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--stone-medium);
  margin-top: 0.25rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.hero-btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.btn-icon {
  margin-right: 0.5rem;
}

/* Hero 視覺區塊 - 已移除 */

/* 特色功能區塊 */
.features-section {
  padding: 1.5rem 0;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.section-title {
  text-align: center;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--stone-dark);
  font-family: var(--font-display);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  animation-delay: calc(var(--i) * 0.1s);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-elevated);
  border-color: var(--mountain-primary);
}

.feature-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 1.5rem;
  color: white;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--stone-dark);
  font-family: var(--font-display);
}

.feature-description {
  color: var(--stone-medium);
  line-height: 1.6;
}

/* 區塊樣式 */
.categories-section,
.featured-section,
.latest-section {
  padding: 1.5rem 0;
}

.categories-section {
  background: rgba(240, 253, 244, 0.3);
}

.featured-section {
  background: rgba(240, 249, 255, 0.3);
}

.latest-section {
  background: rgba(254, 247, 237, 0.3);
}

.section-header {
  text-align: center;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.125rem;
  color: var(--stone-medium);
  margin-top: 0.5rem;
}

.section-actions {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--sky-secondary);
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-all-link:hover {
  color: var(--sky-primary);
  transform: translateX(2px);
}

.link-arrow {
  transition: transform 0.3s ease;
}

.view-all-link:hover .link-arrow {
  transform: translateX(4px);
}

/* 載入狀態 */
.loading-grid,
.loading-articles {
  display: grid;
  gap: 1.5rem;
}

.loading-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.loading-card,
.loading-article,
.loading-carousel {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 1rem;
}

.loading-card {
  height: 150px;
}

.loading-article {
  height: 80px;
}

.loading-carousel {
  height: 300px;
}

/* 動畫 */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes fly {
  0% { transform: translateX(0); }
  50% { transform: translateX(20px); }
  100% { transform: translateX(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .hero-content {
    padding: 0 2rem;
  }
  
  .hero-stats {
    gap: 1.5rem;
  }
  
  .hero-description {
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 2rem;
  }
}

@media (max-width: 768px) {
  .hero-section {
    min-height: 35vh;
    padding: 0.75rem 0;
  }
  
  .features-section,
  .categories-section,
  .featured-section,
  .latest-section {
    padding: 1rem 0;
  }
  
  .section-header {
    margin-bottom: 0.75rem;
  }
  
  .section-title {
    margin-bottom: 1rem;
  }
  
  .hero-title {
    font-size: clamp(1.75rem, 6vw, 2.5rem);
    margin-bottom: 0.5rem;
  }
  
  .title-accent {
    margin-top: 0.25rem;
  }
  
  .hero-description {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 0.75rem;
    padding: 0 1rem;
  }
  
  .hero-stats {
    gap: 1rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .stat-item {
    min-width: 80px;
  }
  
  .hero-actions {
    gap: 0.75rem;
  }
  
  .hero-btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    min-width: 120px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.75rem;
  }
  
  .hero-section {
    min-height: 30vh;
    padding: 0.75rem 0;
  }
  
  .features-section,
  .categories-section,
  .featured-section,
  .latest-section {
    padding: 0.75rem 0;
  }
  
  .section-header {
    margin-bottom: 0.5rem;
  }
  
  .section-title {
    margin-bottom: 0.75rem;
  }
  
  .hero-content {
    padding: 0 1rem;
  }
  
  .hero-title {
    font-size: clamp(1.5rem, 7vw, 2rem);
    margin-bottom: 0.5rem;
  }
  
  .title-emoji {
    margin-right: 0.25rem;
  }
  
  .hero-description {
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 0.75rem;
    padding: 0 0.5rem;
  }
  
  .hero-stats {
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .stat-item {
    min-width: 70px;
  }
  
  .stat-number {
    font-size: 1.125rem;
  }
  
  .stat-label {
    font-size: 0.7rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .hero-btn {
    width: 100%;
    max-width: 200px;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 360px) {
  .hero-title {
    font-size: 1.375rem;
  }
  
  .hero-description {
    font-size: 0.85rem;
    padding: 0;
  }
  
  .hero-stats {
    gap: 0.5rem;
  }
  
  .stat-item {
    min-width: 60px;
  }
  
  .stat-number {
    font-size: 1rem;
  }
  
  .stat-label {
    font-size: 0.65rem;
  }
}

/* 無障礙設計 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
