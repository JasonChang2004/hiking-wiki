<template>
  <div class="wiki-home">
    <!-- 維基風格主頁面容器 -->
    <div class="wiki-container">
      <!-- 左側精選知識條目區域 (一半寬度) -->
      <main class="wiki-main-content">
        <section class="featured-section">
          <div class="wiki-section-header">
            <h2 class="wiki-section-title">🌟 精選知識條目</h2>
            <p class="wiki-section-subtitle">編輯團隊精心挑選的優質內容</p>
          </div>
          
          <!-- 主要精選文章 (全文顯示) -->
          <div class="main-featured-article">
            <Suspense>
              <FeaturedMainArticle />
              <template #fallback>
                <div class="wiki-loading-main">
                  <div class="loading-shimmer"></div>
                </div>
              </template>
            </Suspense>
          </div>

          <!-- 其他精選文章 (條列式) -->
          <div class="other-featured-articles">
            <h3 class="sub-section-title">其他精選文章</h3>
            <Suspense>
              <FeaturedArticleList />
              <template #fallback>
                <div class="wiki-loading-list">
                  <div v-for="i in 5" :key="i" class="loading-list-item"></div>
                </div>
              </template>
            </Suspense>
          </div>
        </section>
      </main>

      <!-- 右側最新更新條目區域 (一半寬度) -->
      <aside class="wiki-sidebar">
        <section class="latest-section">
          <div class="wiki-section-header">
            <h2 class="wiki-section-title">🆕 最新更新條目</h2>
            <div class="section-actions">
              <router-link to="/category/所有文章" class="wiki-view-all-link">
                查看完整列表 →
              </router-link>
            </div>
          </div>
          
          <!-- 主要最新文章 (全文顯示) -->
          <div class="main-latest-article">
            <Suspense>
              <LatestMainArticle />
              <template #fallback>
                <div class="wiki-loading-main">
                  <div class="loading-shimmer"></div>
                </div>
              </template>
            </Suspense>
          </div>

          <!-- 其他最新文章 (條列式) -->
          <div class="other-latest-articles">
            <h3 class="sub-section-title">其他最新文章</h3>
            <Suspense>
              <OtherLatestArticleList />
              <template #fallback>
                <div class="wiki-loading-list">
                  <div v-for="i in 5" :key="i" class="loading-list-item"></div>
                </div>
              </template>
            </Suspense>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 主要精選文章組件 (顯示完整文章內容)
const FeaturedMainArticle = defineAsyncComponent({
  loader: () => import('../components/articles/FeaturedMainArticle.vue'),
  errorComponent: () => import('../components/common/ErrorComponent.vue'),
  delay: 200,
  timeout: 30000,
})

// 精選文章列表組件 (條列式)
const FeaturedArticleList = defineAsyncComponent({
  loader: () => import('../components/articles/FeaturedArticleList.vue'),
  errorComponent: () => import('../components/common/ErrorComponent.vue'),
  delay: 200,
  timeout: 30000,
})

// 主要最新文章組件 (顯示完整文章內容)
const LatestMainArticle = defineAsyncComponent({
  loader: () => import('../components/articles/LatestMainArticle.vue'),
  errorComponent: () => import('../components/common/ErrorComponent.vue'),
  delay: 200,
  timeout: 30000,
})

// 其他最新文章列表組件 (條列式)
const OtherLatestArticleList = defineAsyncComponent({
  loader: () => import('../components/articles/OtherLatestArticleList.vue'),
  errorComponent: () => import('../components/common/ErrorComponent.vue'),
  delay: 200,
  timeout: 30000,
})
</script>

<style scoped>
.wiki-home {
  font-family: var(--font-body);
  background: #ffffff;
  min-height: calc(100vh - 160px);
  padding-top: var(--space-lg);
}

/* 維基風格容器 - 左右各一半 */
.wiki-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

/* 左側主要內容區域 */
.wiki-main-content {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.featured-section {
  padding: 1.5rem;
}

/* 右側邊欄 */
.wiki-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.latest-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.navigation-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 區塊標題樣式 */
.wiki-section-header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.wiki-section-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  font-family: var(--font-display);
  border-bottom: 2px solid var(--mountain-primary);
  display: inline-block;
  padding-bottom: 2px;
}

.wiki-section-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.section-actions {
  margin-left: auto;
}

.wiki-view-all-link {
  font-size: 0.875rem;
  color: var(--mountain-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.wiki-view-all-link:hover {
  color: var(--mountain-accent);
  text-decoration: underline;
}

/* 主要精選文章區域 */
.main-featured-article {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

/* 其他精選文章區域 */
.other-featured-articles {
  margin-top: 1rem;
}

/* 主要最新文章區域 */
.main-latest-article {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

/* 其他最新文章區域 */
.other-latest-articles {
  margin-top: 1rem;
}

.sub-section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  font-family: var(--font-display);
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

/* 導航快捷方式 */
.wiki-sidebar-header {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
  margin: 0;
}

.wiki-sidebar-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  font-family: var(--font-display);
}

.navigation-links {
  padding: 0.5rem;
}

.nav-quick-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  text-decoration: none;
  color: #4b5563;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.nav-quick-link:hover {
  background: #f3f4f6;
  color: var(--mountain-primary);
  text-decoration: none;
}

.nav-icon {
  font-size: 1rem;
  width: 1.25rem;
  text-align: center;
}

.nav-text {
  font-weight: 500;
}

/* 載入狀態 */
.wiki-loading-main {
  height: 400px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
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

.wiki-loading-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.loading-list-item {
  height: 60px;
  background: #f3f4f6;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.loading-list-item::before {
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

/* 響應式設計 */
@media (max-width: 1024px) {
  .wiki-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .wiki-sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .wiki-home {
    padding-top: var(--space-md);
  }
  
  .wiki-container {
    padding: 0 0.5rem;
    gap: 1rem;
  }
  
  .featured-section,
  .latest-section {
    padding: 1rem;
  }
  
  .wiki-section-title {
    font-size: 1.5rem;
  }
  
  .wiki-section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .section-actions {
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .wiki-container {
    padding: 0 0.25rem;
  }
  
  .featured-section,
  .latest-section {
    padding: 0.75rem;
  }
  
  .wiki-section-title {
    font-size: 1.25rem;
  }
  
  .wiki-sidebar-header {
    padding: 0.75rem;
  }
  
  .navigation-links {
    padding: 0.75rem;
  }
}

/* 維基風格連結 */
.wiki-home a {
  color: var(--mountain-primary);
  transition: color 0.3s ease;
}

.wiki-home a:hover {
  color: var(--mountain-accent);
}
</style>

