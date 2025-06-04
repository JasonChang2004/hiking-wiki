<template>
  <div class="knowledge-hub">
    <!-- 知識酷頁面標題 -->
    <section class="knowledge-header">
      <div class="container">
        <div class="header-content">
          <h1 class="page-title">
            <span class="title-emoji">🗂️</span>
            知識庫
            <span class="title-accent">Knowledge Base</span>
          </h1>
          <p class="page-description">
            探索豐富的登山知識內容，按主題分類整理，讓您輕鬆找到所需的專業資訊與實用指南。
          </p>
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

// 異步組件載入
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
.knowledge-hub {
  font-family: var(--font-body);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 知識酷頁面標題 */
.knowledge-header {
  padding: var(--space-xl) 0;
  background: linear-gradient(135deg, 
    var(--mountain-50) 0%,
    var(--sky-50) 50%,
    var(--earth-50) 100%
  );
}

.header-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--stone-dark);
  margin-bottom: var(--space-lg);
  font-family: var(--font-display);
  line-height: var(--leading-tight);
}

.title-emoji {
  display: block;
  font-size: 2.5rem;
  margin-bottom: var(--space-sm);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.title-accent {
  display: block;
  font-size: var(--text-xl);
  background: linear-gradient(135deg, var(--mountain-primary), var(--sky-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: var(--space-sm);
  font-weight: 500;
}

.page-description {
  font-size: var(--text-lg);
  color: var(--stone-medium);
  line-height: var(--leading-relaxed);
  max-width: 600px;
  margin: 0 auto;
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

/* 容器佈局 */
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

/* 響應式設計 */
@media (max-width: 768px) {
  .knowledge-header {
    padding: var(--space-lg) 0;
  }
  
  .page-title {
    font-size: var(--text-3xl);
  }
  
  .title-emoji {
    font-size: 2rem;
  }
  
  .title-accent {
    font-size: var(--text-lg);
  }
  
  .page-description {
    font-size: var(--text-base);
  }
  
  .section-title {
    font-size: var(--text-2xl);
  }
  
  .categories-section,
  .featured-section {
    padding: var(--space-lg) 0;
  }
  
  .latest-section {
    padding: var(--space-lg) 0 var(--space-md);
  }
}

@media (max-width: 480px) {
  .knowledge-header {
    padding: var(--space-md) 0;
  }
  
  .page-title {
    font-size: var(--text-2xl);
  }
  
  .title-emoji {
    font-size: 1.5rem;
  }
  
  .title-accent {
    font-size: var(--text-base);
  }
  
  .section-title {
    font-size: var(--text-xl);
  }
  
  .section-subtitle {
    font-size: var(--text-base);
  }
}
</style> 