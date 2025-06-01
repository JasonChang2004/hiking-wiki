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
        <div class="section-header">
          <h2 class="section-title">🌟 平台特色</h2>
        </div>
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
  min-height: 50vh;
  display: flex;
  align-items: center;
  padding: var(--space-xl) 0 var(--space-lg);
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
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.hero-text {
  text-align: center;
  max-width: 800px;
}

.hero-title {
  font-size: var(--text-5xl);
  font-weight: 700;
  color: var(--stone-dark);
  margin-bottom: var(--space-lg);
  font-family: var(--font-display);
  line-height: var(--leading-tight);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title-emoji {
  display: block;
  font-size: 3rem;
  margin-bottom: var(--space-sm);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.title-accent {
  display: block;
  font-size: var(--text-3xl);
  background: linear-gradient(135deg, var(--mountain-primary), var(--sky-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: var(--space-sm);
}

.hero-description {
  font-size: var(--text-lg);
  color: var(--stone-medium);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-2xl);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-xl);
  margin-bottom: var(--space-2xl);
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  padding: var(--space-md);
  background: rgba(255, 255, 255, 0.7);
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-number {
  display: block;
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--mountain-primary);
  font-family: var(--font-display);
}

.stat-label {
  display: block;
  font-size: var(--text-sm);
  color: var(--stone-medium);
  margin-top: var(--space-xs);
}

.hero-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
}

.hero-btn {
  padding: var(--space-md) var(--space-xl);
  font-size: var(--text-base);
  border-radius: 2rem;
  min-width: 160px;
  justify-content: center;
}

/* 特色功能區塊 */
.features-section {
  padding: var(--space-xl) 0;
  background: rgba(255, 255, 255, 0.8);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-xl);
  margin-top: var(--space-2xl);
  justify-content: center;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.feature-card {
  text-align: center;
  padding: var(--space-2xl) var(--space-lg);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto var(--space-lg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  font-weight: bold;
}

.gradient-mountain {
  background: linear-gradient(135deg, var(--mountain-primary), var(--mountain-accent));
}

.gradient-earth {
  background: linear-gradient(135deg, var(--earth-primary), var(--earth-secondary));
}

.gradient-sky {
  background: linear-gradient(135deg, var(--sky-primary), var(--sky-accent));
}

.feature-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: var(--space-md);
  font-family: var(--font-display);
}

.feature-description {
  font-size: var(--text-base);
  color: var(--stone-medium);
  line-height: var(--leading-relaxed);
}

/* 分類導覽 */
.categories-section {
  padding: var(--space-xl) 0;
  background: linear-gradient(135deg, 
    var(--sky-50) 0%,
    var(--mountain-50) 100%
  );
}

/* 精選文章區塊 */
.featured-section {
  padding: var(--space-xl) 0;
  background: rgba(255, 255, 255, 0.8);
}

/* 最新文章列表 */
.latest-section {
  padding: var(--space-xl) 0 var(--space-lg);
  background: linear-gradient(135deg, 
    var(--earth-50) 0%,
    var(--mountain-50) 100%
  );
}

/* 通用區塊樣式 */
.section-header {
  text-align: center;
  margin-bottom: var(--space-md);
}

.section-title {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--stone-dark);
  margin-bottom: var(--space-md);
  font-family: var(--font-display);
}

.section-subtitle {
  font-size: var(--text-lg);
  color: var(--stone-medium);
  max-width: 600px;
  margin: 0 auto;
  line-height: var(--leading-relaxed);
}

.section-actions {
  margin-top: var(--space-lg);
}

/* 容器佈局修正 */
.category-container,
.featured-container,
.latest-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-md);
  box-sizing: border-box;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--mountain-primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-all-link:hover {
  color: var(--mountain-accent);
  text-decoration: underline;
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
  gap: var(--space-lg);
}

.loading-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.loading-card,
.loading-article {
  height: 200px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
}

.loading-card::before,
.loading-article::before {
  content: '';
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

.loading-carousel {
  height: 300px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
}

.loading-carousel::before {
  content: '';
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
  
/* 動畫效果 */
.animate-slide-up {
  animation: slideUp 0.6s ease-out;
  animation-fill-mode: both;
  }
  
.animate-slide-up:nth-child(1) { animation-delay: 0.1s; }
.animate-slide-up:nth-child(2) { animation-delay: 0.2s; }
.animate-slide-up:nth-child(3) { animation-delay: 0.3s; }
.animate-slide-up:nth-child(4) { animation-delay: 0.4s; }

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .hero-section {
    min-height: 40vh;
    padding: var(--space-lg) 0 var(--space-md);
  }
  
  .hero-title {
    font-size: var(--text-3xl);
  }
  
  .title-accent {
    font-size: var(--text-xl);
  }
  
  .hero-description {
    font-size: var(--text-base);
  }
  
  .hero-stats {
    gap: var(--space-md);
  }
  
  .stat-item {
    min-width: 100px;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-btn {
    width: 100%;
    max-width: 280px;
  }
  
  .section-title {
    font-size: var(--text-2xl);
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
  
  .feature-card {
    padding: var(--space-xl) var(--space-md);
  }
  
  /* 縮減移動端各區塊間距 */
  .features-section,
  .categories-section,
  .featured-section {
    padding: var(--space-lg) 0;
  }
  
  .latest-section {
    padding: var(--space-lg) 0 var(--space-md);
  }
  
  .section-header {
    margin-bottom: var(--space-sm);
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: var(--space-2xl) 0;
  }
  
  .hero-content {
    padding: 0 var(--space-sm);
  }
  
  .hero-title {
    font-size: var(--text-2xl);
  }
  
  .title-emoji {
    font-size: 2rem;
  }
  
  .title-accent {
    font-size: var(--text-lg);
  }
  
  .hero-stats {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .stat-item {
    width: 100%;
  }
  
  .section-header {
    margin-bottom: var(--space-xl);
  }
  
  .section-title {
    font-size: var(--text-xl);
  }
  
  .section-subtitle {
    font-size: var(--text-base);
  }
  
  .features-section,
  .categories-section,
  .featured-section,
  .latest-section {
    padding: var(--space-2xl) 0;
  }
}

/* 觸控設備優化 */
@media (hover: none) and (pointer: coarse) {
  .hero-btn,
  .feature-card {
    touch-action: manipulation;
  }
  
  .hero-btn:active {
    transform: scale(0.98);
  }
  
  .feature-card:active {
    transform: translateY(-4px);
  }
}

/* 減少動畫效果 */
@media (prefers-reduced-motion: reduce) {
  .title-emoji,
  .animate-slide-up {
    animation: none;
  }
  
  .feature-card:hover {
    transform: none;
  }
}

/* 高對比度模式 */
@media (prefers-contrast: high) {
  .hero-section,
  .features-section,
  .categories-section,
  .featured-section,
  .latest-section {
    background: white;
  }
  
  .feature-card {
    border: 2px solid var(--stone-dark);
  }
}
</style>

