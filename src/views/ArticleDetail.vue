<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { marked } from 'marked'
import { formatDateTime } from '../utils/formatters' // 使用新的 formatDateTime
import type { Article } from '../types' // 使用新的型別定義

const route = useRoute()
const article = ref<Article | null>(null)
const loading = ref(true)
const shareNotification = ref(false)

const renderedHtml = computed(() => {
  if (!article.value?.content) return '';
  
  // 簡單使用 marked 解析
  // 考慮增加 DOMPurify 來清理 HTML，防止 XSS
  // import DOMPurify from 'dompurify';
  // return DOMPurify.sanitize(marked.parse(article.value.content));
  return marked.parse(article.value.content);
});

// 複製分享連結
const copyShareLink = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    shareNotification.value = true;
    setTimeout(() => {
      shareNotification.value = false;
    }, 3000);
  });
}

// 列印文章
const printArticle = () => {
  window.print();
}

// 收藏文章（暫時使用瀏覽器書籤）
const bookmarkArticle = () => {
  if (article.value) {
    const title = article.value.title;
    const url = window.location.href;
    
    // 嘗試使用現代瀏覽器的書籤 API
    try {
      if ('sidebar' in window && (window as any).sidebar && 'addPanel' in (window as any).sidebar) {
        (window as any).sidebar.addPanel(title, url, '');
      } else {
        // 備用方案：提示用戶手動收藏
        alert('請使用 Ctrl+D (Windows) 或 Cmd+D (Mac) 將此頁面加入書籤');
      }
    } catch (error) {
      // 如果瀏覽器不支援，顯示手動收藏提示
      alert('請使用 Ctrl+D (Windows) 或 Cmd+D (Mac) 將此頁面加入書籤');
    }
  }
}

// 處理圖片載入錯誤
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01OTUgMTk1TDYwNSAyMDVINjE1TDYwNSAyMTVMNTk1IDIwNUw1ODUgMjE1TDU3NSAyMDVINTg1TDU5NSAxOTVaIiBmaWxsPSIjOUI5Qzk5Ii8+CjwvU3ZnPgo=';
}

onMounted(async () => {
  loading.value = true; // 確保 loading 狀態被設定
  try {
    const id = route.params.id as string
    const docRef = doc(db, 'articles', id)
    const snap = await getDoc(docRef)

    if (snap.exists()) {
      article.value = { id, ...snap.data() } as Article;
    } else {
      article.value = null
      console.warn("Article not found:", id); // Log a warning if article doesn't exist
    }
  } catch (error) {
    console.error('無法載入文章:', error);
    article.value = null;
    // Optionally, set an error state to display a message to the user
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mountain-article-detail">
    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-section">
      <div class="loading-container">
        <div class="loading-header">
          <div class="loading-shimmer header-shimmer"></div>
          <div class="loading-shimmer subtitle-shimmer"></div>
          <div class="loading-shimmer meta-shimmer"></div>
        </div>
        <div class="loading-image">
          <div class="loading-shimmer image-shimmer"></div>
        </div>
        <div class="loading-content">
          <div v-for="i in 8" :key="i" class="loading-shimmer content-shimmer"></div>
        </div>
      </div>
      <p class="loading-text">📖 正在載入文章內容...</p>
    </div>

    <!-- 文章內容 -->
    <article v-else-if="article" class="article-container">
      <!-- 文章標題區域 -->
      <header class="article-header">
        <div class="header-content">
          <!-- 麵包屑導航 -->
          <nav class="breadcrumb">
            <router-link to="/" class="breadcrumb-link">
              <span class="breadcrumb-icon">🏠</span>
              <span>首頁</span>
            </router-link>
            <span class="breadcrumb-separator">›</span>
            <router-link 
              v-if="article.category"
              :to="`/category/${article.category}`" 
              class="breadcrumb-link"
            >
              <span class="breadcrumb-icon">📁</span>
              <span>{{ article.category }}</span>
            </router-link>
            <span v-if="article.category" class="breadcrumb-separator">›</span>
            <span class="breadcrumb-current">{{ article.title }}</span>
          </nav>

          <!-- 文章標題 -->
          <h1 class="article-title">{{ article.title }}</h1>

          <!-- 文章元數據 -->
          <div class="article-meta">
            <div class="meta-row">
              <div class="meta-item">
                <span class="meta-icon">👤</span>
                <span class="meta-text">{{ article.displayName || '匿名作者' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span class="meta-text">{{ formatDateTime(article.createdAt) }}</span>
              </div>
              <div v-if="article.category" class="meta-item">
                <span class="meta-icon">🏷️</span>
                <router-link 
                  :to="`/category/${article.category}`"
                  class="meta-link"
                >
                  {{ article.category }}
                </router-link>
              </div>
            </div>
            <div v-if="article.updatedAt && article.updatedAt !== article.createdAt" class="update-info">
              <span class="meta-icon">🔄</span>
              <span class="meta-text">最後更新：{{ formatDateTime(article.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- 主要內容區域 -->
      <div class="main-content">
        <div class="content-wrapper">
          <!-- 文章內容 -->
          <main class="article-content">
            <!-- 文章摘要 -->
            <div class="article-summary">
              <div class="summary-icon">📝</div>
              <div class="summary-content">
                <h2 class="summary-title">文章概要</h2>
                <p class="summary-text">
                  本文為登山知識社群成員撰寫，內容經過審核確保準確性。
                  如有疑問或建議，歡迎與作者或社群管理員聯繫。
                </p>
              </div>
            </div>

            <!-- 文章正文 -->
            <div class="article-body">
              <div v-html="renderedHtml" class="prose-content"></div>
            </div>

            <!-- 文章底部 -->
            <footer class="article-footer">
              <div class="footer-info">
                <div class="info-card">
                  <h3 class="info-title">
                    <span class="info-icon">ℹ️</span>
                    文章資訊
                  </h3>
                  <div class="info-details">
                    <p><strong>建立時間：</strong>{{ formatDateTime(article.createdAt) }}</p>
                    <p v-if="article.updatedAt && article.updatedAt !== article.createdAt">
                      <strong>更新時間：</strong>{{ formatDateTime(article.updatedAt) }}
                    </p>
                    <p><strong>作者：</strong>{{ article.displayName || '匿名作者' }}</p>
                    <p v-if="article.category">
                      <strong>分類：</strong>
                      <router-link :to="`/category/${article.category}`" class="category-link">
                        {{ article.category }}
                      </router-link>
                    </p>
                  </div>
                </div>
              </div>

              <!-- 操作按鈕 -->
              <div class="footer-actions">
                <button @click="copyShareLink" class="action-btn share-btn">
                  <span class="btn-icon">🔗</span>
                  <span class="btn-text">分享文章</span>
                </button>
                <router-link to="/" class="action-btn back-btn">
                  <span class="btn-icon">↩️</span>
                  <span class="btn-text">返回首頁</span>
                </router-link>
                <router-link 
                  v-if="article.category"
                  :to="`/category/${article.category}`" 
                  class="action-btn category-btn"
                >
                  <span class="btn-icon">📂</span>
                  <span class="btn-text">更多{{ article.category }}</span>
                </router-link>
              </div>
            </footer>
          </main>

          <!-- 側邊欄 -->
          <aside class="article-sidebar">
            <!-- 目錄 -->
            <div class="sidebar-card">
              <h3 class="sidebar-title">
                <span class="sidebar-icon">📑</span>
                文章目錄
              </h3>
              <nav class="table-of-contents">
                <ul class="toc-list">
                  <li><a href="#content" class="toc-link">文章內容</a></li>
                  <li><a href="#info" class="toc-link">相關資訊</a></li>
                  <li><a href="#share" class="toc-link">分享此文</a></li>
                </ul>
              </nav>
            </div>

            <!-- 快速操作 -->
            <div class="sidebar-card">
              <h3 class="sidebar-title">
                <span class="sidebar-icon">⚡</span>
                快速操作
              </h3>
              <div class="quick-actions">
                <button @click="copyShareLink" class="quick-btn" title="分享文章">
                  <span class="quick-icon">🔗</span>
                  <span class="quick-text">分享</span>
                </button>
                <button @click="printArticle" class="quick-btn" title="列印文章">
                  <span class="quick-icon">🖨️</span>
                  <span class="quick-text">列印</span>
                </button>
                <button @click="bookmarkArticle" class="quick-btn" title="收藏文章">
                  <span class="quick-icon">⭐</span>
                  <span class="quick-text">收藏</span>
                </button>
              </div>
            </div>

            <!-- 相關提示 -->
            <div class="sidebar-card">
              <h3 class="sidebar-title">
                <span class="sidebar-icon">💡</span>
                登山提醒
              </h3>
              <div class="safety-tips">
                <p class="tip-text">
                  登山安全第一，出發前請做好充分準備，
                  告知行程並攜帶必要裝備。
                </p>
                <router-link to="/category/緊急應變" class="tip-link">
                  查看安全指南 →
                </router-link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>

    <!-- 文章未找到 -->
    <div v-else class="not-found-section">
      <div class="not-found-container">
        <div class="not-found-icon">🏔️</div>
        <h2 class="not-found-title">找不到此文章</h2>
        <p class="not-found-description">
          抱歉，您要查看的文章可能已被刪除、移動或您沒有權限查看。
        </p>
        <div class="not-found-actions">
          <router-link to="/" class="btn btn-primary">
            <span class="btn-icon">🏠</span>
            <span>返回首頁</span>
          </router-link>
          <router-link to="/category/所有文章" class="btn btn-outline">
            <span class="btn-icon">📚</span>
            <span>瀏覽文章</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 分享成功通知 -->
    <Transition name="notification">
      <div v-if="shareNotification" class="share-notification">
        <div class="notification-content">
          <span class="notification-icon">✅</span>
          <span class="notification-text">文章連結已複製到剪貼板</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 山林主題文章詳情頁面 */
.mountain-article-detail {
  font-family: var(--font-body);
  min-height: 100vh;
  background: linear-gradient(135deg, 
    rgba(240, 253, 244, 0.3) 0%, 
    rgba(255, 255, 255, 0.9) 50%, 
    rgba(254, 252, 232, 0.3) 100%
  );
}

/* 載入狀態 */
.loading-section {
  padding: 2rem 1rem;
  text-align: center;
}

.loading-container {
  max-width: 64rem;
  margin: 0 auto;
}

.loading-header {
  margin-bottom: 2rem;
}

.loading-shimmer {
  background: linear-gradient(90deg, 
    rgba(240, 253, 244, 0.3) 0%, 
    rgba(34, 197, 94, 0.2) 50%, 
    rgba(240, 253, 244, 0.3) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 0.5rem;
}

.header-shimmer {
  height: 3rem;
  margin-bottom: 1rem;
  width: 70%;
}

.subtitle-shimmer {
  height: 1.5rem;
  margin-bottom: 1rem;
  width: 50%;
}

.meta-shimmer {
  height: 1rem;
  width: 40%;
}

.loading-image {
  margin-bottom: 2rem;
}

.image-shimmer {
  height: 400px;
  width: 100%;
}

.loading-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.content-shimmer {
  height: 1rem;
}

.content-shimmer:nth-child(odd) {
  width: 95%;
}

.content-shimmer:nth-child(even) {
  width: 85%;
}

.loading-text {
  color: var(--stone-medium);
  font-size: 1.125rem;
  margin-top: 1.5rem;
  animation: pulse 2s infinite;
}

/* 文章容器 */
.article-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 文章標題區域 */
.article-header {
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.15) 0%, 
    rgba(255, 255, 255, 1) 100%
  );
  border: 2px solid rgba(34, 197, 94, 0.3);
  border-radius: 1.5rem;
  margin: 2rem auto;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.1);
}

.header-content {
  padding: 2rem;
  color: var(--stone-dark);
}

/* 麵包屑導航 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--mountain-primary);
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.breadcrumb-link:hover {
  background: rgba(34, 197, 94, 0.1);
  color: var(--mountain-primary);
  text-decoration: none;
}

.breadcrumb-icon {
  font-size: 0.75rem;
}

.breadcrumb-separator {
  color: var(--stone-medium);
  font-weight: 300;
}

.breadcrumb-current {
  color: var(--stone-medium);
  font-weight: 500;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 文章標題 */
.article-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  color: var(--stone-dark);
  margin-bottom: 1rem;
  font-family: var(--font-display);
  line-height: 1.2;
}

/* 文章元數據 */
.article-meta {
  color: var(--stone-medium);
}

.meta-row {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.meta-icon {
  font-size: 0.875rem;
}

.meta-text {
  font-weight: 500;
}

.meta-link {
  color: var(--mountain-primary);
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  font-weight: 500;
}

.meta-link:hover {
  background: rgba(34, 197, 94, 0.2);
  color: var(--mountain-primary);
  text-decoration: none;
}

.update-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

/* 主要內容區域 */
.main-content {
  padding: 0 2rem;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 文章內容 */
.article-content {
  background: rgba(255, 255, 255, 1);
  border: 2px solid rgba(34, 197, 94, 0.2);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 6px 30px rgba(34, 197, 94, 0.15);
}

/* 文章摘要 */
.article-summary {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(34, 197, 94, 0.1);
  border: 2px solid rgba(34, 197, 94, 0.25);
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.summary-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.summary-content {
  flex: 1;
}

.summary-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: 0.5rem;
  font-family: var(--font-display);
}

.summary-text {
  color: var(--stone-medium);
  line-height: 1.6;
  margin: 0;
}

/* 文章正文 */
.article-body {
  margin-bottom: 3rem;
}

.prose-content {
  font-family: var(--font-body);
  line-height: 1.8;
  color: var(--stone-dark);
}

.prose-content :deep(h1),
.prose-content :deep(h2),
.prose-content :deep(h3) {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--stone-dark);
  margin-top: 2rem;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.prose-content :deep(h1) {
  font-size: 2rem;
  border-bottom: 2px solid var(--mountain-primary);
  padding-bottom: 0.5rem;
}

.prose-content :deep(h2) {
  font-size: 1.5rem;
  border-bottom: 1px solid rgba(34, 197, 94, 0.3);
  padding-bottom: 0.25rem;
}

.prose-content :deep(h3) {
  font-size: 1.25rem;
  color: var(--mountain-primary);
}

.prose-content :deep(p) {
  margin-bottom: 1.5rem;
}

.prose-content :deep(a) {
  color: #3b82f6;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
  font-weight: 500;
}

.prose-content :deep(a:hover) {
  color: #2563eb;
  border-bottom-color: #3b82f6;
}

.prose-content :deep(img) {
  width: 100%;
  height: auto;
  border-radius: 0.75rem;
  margin: 1.5rem 0;
  box-shadow: var(--shadow-card);
}

.prose-content :deep(blockquote) {
  border-left: 4px solid var(--mountain-primary);
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  background: rgba(34, 197, 94, 0.05);
  border-radius: 0 0.5rem 0.5rem 0;
  font-style: italic;
  color: var(--stone-medium);
}

.prose-content :deep(ul),
.prose-content :deep(ol) {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.prose-content :deep(li) {
  margin-bottom: 0.5rem;
}

.prose-content :deep(code) {
  background: rgba(34, 197, 94, 0.1);
  color: var(--mountain-primary);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.prose-content :deep(pre) {
  background: var(--stone-dark);
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.prose-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  box-shadow: var(--shadow-card);
  border-radius: 0.5rem;
  overflow: hidden;
}

.prose-content :deep(th),
.prose-content :deep(td) {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid rgba(34, 197, 94, 0.1);
}

.prose-content :deep(th) {
  background: var(--mountain-primary);
  color: white;
  font-weight: 600;
}

/* 文章底部 */
.article-footer {
  border-top: 1px solid rgba(34, 197, 94, 0.1);
  padding-top: 2rem;
}

.footer-info {
  margin-bottom: 2rem;
}

.info-card {
  background: rgba(34, 197, 94, 0.08);
  border: 2px solid rgba(34, 197, 94, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
}

.info-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: 1rem;
  font-family: var(--font-display);
}

.info-icon {
  font-size: 1rem;
}

.info-details p {
  margin-bottom: 0.5rem;
  color: var(--stone-medium);
  line-height: 1.6;
}

.info-details strong {
  color: var(--stone-dark);
}

.category-link {
  color: var(--mountain-primary);
  text-decoration: none;
  font-weight: 500;
}

.category-link:hover {
  text-decoration: underline;
}

/* 操作按鈕 */
.footer-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  border: 1px solid rgba(34, 197, 94, 0.2);
  box-shadow: var(--shadow-card);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-body);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid;
  flex: 1;
  justify-content: center;
  text-shadow: none;
}

.share-btn {
  background: #22c55e;
  color: white;
  border-color: #22c55e;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.share-btn:hover {
  background: #16a34a;
  border-color: #16a34a;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
}

.back-btn {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.back-btn:hover {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  text-decoration: none;
  color: white;
}

.category-btn {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.category-btn:hover {
  background: #dc2626;
  border-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
  text-decoration: none;
  color: white;
}

.btn-icon {
  font-size: 0.875rem;
}

.btn-text {
  font-family: var(--font-display);
}

/* 側邊欄 */
.article-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-card {
  background: rgba(255, 255, 255, 1);
  border: 2px solid rgba(34, 197, 94, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.1);
  transition: all 0.3s ease;
}

.sidebar-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: 1rem;
  font-family: var(--font-display);
}

.sidebar-icon {
  font-size: 0.875rem;
}

/* 目錄 */
.table-of-contents {
  margin-bottom: 0;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list li {
  margin-bottom: 0.5rem;
}

.toc-link {
  color: var(--stone-medium);
  text-decoration: none;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
  display: block;
}

.toc-link:hover {
  background: rgba(34, 197, 94, 0.1);
  color: var(--mountain-primary);
  text-decoration: none;
}

/* 快速操作 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  background: rgba(34, 197, 94, 0.08);
  border: 2px solid rgba(34, 197, 94, 0.2);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.75rem;
  color: var(--stone-dark);
}

.quick-btn:hover {
  background: rgba(34, 197, 94, 0.15);
  border-color: var(--mountain-primary);
  color: var(--mountain-primary);
  transform: translateY(-1px);
}

.quick-icon {
  font-size: 1rem;
}

.quick-text {
  font-family: var(--font-display);
  font-weight: 500;
}

/* 安全提示 */
.safety-tips {
  text-align: center;
}

.tip-text {
  color: var(--stone-medium);
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.tip-link {
  color: var(--mountain-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.tip-link:hover {
  border-bottom-color: var(--mountain-primary);
}

/* 文章未找到 */
.not-found-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem 1rem;
}

.not-found-container {
  text-align: center;
  max-width: 500px;
  background: rgba(255, 255, 255, 1);
  border: 2px solid rgba(34, 197, 94, 0.2);
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  box-shadow: 0 6px 30px rgba(34, 197, 94, 0.15);
}

.not-found-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.not-found-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: 1rem;
  font-family: var(--font-display);
}

.not-found-description {
  color: var(--stone-medium);
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.not-found-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-body);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--mountain-primary), #16a34a);
  color: white;
  box-shadow: var(--shadow-card);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
  transform: translateY(-1px);
  box-shadow: var(--shadow-elevated);
  text-decoration: none;
  color: white;
}

.btn-outline {
  background: rgba(255, 255, 255, 0.9);
  color: var(--stone-dark);
  border: 1.5px solid rgba(34, 197, 94, 0.3);
}

.btn-outline:hover {
  background: rgba(34, 197, 94, 0.05);
  border-color: var(--mountain-primary);
  color: var(--mountain-primary);
  text-decoration: none;
}

/* 分享通知 */
.share-notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  background: rgba(34, 197, 94, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-elevated);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  color: white;
}

.notification-icon {
  font-size: 1.125rem;
}

.notification-text {
  font-weight: 500;
  font-family: var(--font-display);
}

/* 通知動畫 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 動畫 */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .article-sidebar {
    order: -1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .quick-actions {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 0 1rem;
  }
  
  .article-content {
    padding: 1.5rem;
  }
  
  .header-content {
    padding: 1.5rem 1.5rem 1rem 1.5rem; /* 減少底部 padding */
  }
  
  .article-title {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    margin-bottom: 0.75rem; /* 減少標題底部間距 */
  }
  
  .article-meta {
    margin-bottom: 0; /* 移除底部間距 */
  }
  
  .meta-row {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .breadcrumb {
    flex-wrap: wrap;
    margin-bottom: 0.75rem; /* 減少底部間距 */
  }
  
  .breadcrumb-current {
    max-width: 150px;
  }
  
  .footer-actions {
    flex-direction: column;
    padding: 1rem; /* 減少 padding */
  }
  
  .action-btn {
    flex: none;
  }
  
  .article-sidebar {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .not-found-container {
    padding: 2rem 1.5rem;
  }
  
  .not-found-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .share-notification {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
}

@media (max-width: 480px) {
  .article-header {
    margin: 1rem auto;
  }
  
  .article-content {
    padding: 1rem;
  }
  
  .header-content {
    padding: 1rem 1rem 0.5rem 1rem; /* 進一步減少間距 */
  }
  
  .article-summary {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .summary-icon {
    font-size: 1.25rem;
    align-self: flex-start;
  }
  
  .sidebar-card {
    padding: 1rem;
  }
  
  .prose-content {
    font-size: 0.9rem;
  }
  
  .main-content {
    padding: 0 0.5rem;
  }
}

/* 列印樣式 */
@media print {
  .article-sidebar,
  .share-notification,
  .footer-actions {
    display: none !important;
  }
  
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .article-header {
    height: auto;
    min-height: auto;
  }
  
  .header-image {
    display: none;
  }
  
  .header-content {
    position: static;
    color: var(--stone-dark);
    padding: 1rem 0;
  }
  
  .breadcrumb {
    display: none;
  }
  
  .mountain-article-detail {
    background: white;
  }
  
  .article-content {
    background: white;
    box-shadow: none;
    border: none;
    padding: 0;
  }
}

/* 無障礙設計 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* 高對比度模式 */
@media (prefers-contrast: high) {
  .article-content,
  .sidebar-card,
  .not-found-container {
    border: 2px solid var(--stone-dark);
    background: white;
  }
  
  .article-title {
    color: black;
  }
  
  .prose-content :deep(h1),
  .prose-content :deep(h2),
  .prose-content :deep(h3) {
    color: black;
  }
}
</style>
