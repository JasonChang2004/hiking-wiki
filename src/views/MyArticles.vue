<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { db } from '@/firebase';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { getAuth, type Unsubscribe } from 'firebase/auth'; // Corrected Unsubscribe import
import type { Article } from '@/types';
import { formatDate } from '@/utils/formatters';
import { useRouter } from 'vue-router';

const articles = ref<Article[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const auth = getAuth();
const user = computed(() => auth.currentUser);
const router = useRouter();

let authUnsubscribe: Unsubscribe | null = null; // Defined authUnsubscribe

// Helper functions for status class and text
const getStatusClass = (status: Article['status']) => {
  switch (status) {
    case 'pending': return 'text-yellow-500';
    case 'approved': return 'text-green-500';
    case 'rejected': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

const getStatusText = (status: Article['status']) => {
  switch (status) {
    case 'pending': return '審核中';
    case 'approved': return '已發布';
    case 'rejected': return '已拒絕';
    default: return '未知';
  }
};

const getStatusIcon = (status: Article['status']) => {
  switch (status) {
    case 'pending': return '⏳';
    case 'approved': return '📰';
    case 'rejected': return '❌';
    default: return '📝';
  }
};

const getStatusCount = (status: Article['status']) => {
  return articles.value.filter(article => article.status === status).length;
};

const fetchUserArticles = async () => {
  if (!user.value) {
    error.value = "User not logged in.";
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  error.value = null;
  try {
    const articlesCollection = collection(db, 'articles');
    const q = query(articlesCollection, where('uid', '==', user.value.uid), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    articles.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Article));
  } catch (err) {
    console.error("Error fetching user articles:", err);
    error.value = "無法載入您的文章";
  }
  isLoading.value = false;
};

const deleteArticle = async (articleId: string) => {
  if (!confirm("確定要刪除這篇文章嗎？此操作無法復原。")) return;
  try {
    await deleteDoc(doc(db, 'articles', articleId));
    articles.value = articles.value.filter(article => article.id !== articleId);
    alert("文章已刪除");
  } catch (err) {
    console.error("Error deleting article:", err);
    alert("刪除文章失敗");
    error.value = "刪除文章失敗";
  }
};

const editArticle = (articleId: string) => {
  router.push({ name: 'SubmitArticle', query: { edit: 'true', id: articleId } });
};

onMounted(() => {
  authUnsubscribe = auth.onAuthStateChanged(newUser => {
    if (newUser) {
      fetchUserArticles();
    } else {
      articles.value = [];
      error.value = "請先登入以查看您的文章。";
      isLoading.value = false;
      // router.push('/login'); // Optional: redirect to login
    }
  });
});

onUnmounted(() => {
  if (authUnsubscribe) {
    authUnsubscribe(); // Unsubscribe when component is unmounted
  }
});

</script>

<template>
  <div class="mountain-my-articles">
    <!-- 頁面標題區域 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">📝</span>
          我的投稿文章
        </h1>
        <p class="page-subtitle">管理您的所有投稿內容，追蹤審核狀態</p>
      </div>
      <div class="header-actions">
        <router-link to="/submit-article" class="btn btn-primary">
          <span class="btn-icon">✍️</span>
          <span>新增投稿</span>
        </router-link>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div v-if="isLoading" class="loading-section">
      <div class="loading-grid">
        <div v-for="i in 3" :key="i" class="loading-card">
          <div class="loading-shimmer"></div>
        </div>
      </div>
      <p class="loading-text">📚 正在載入您的文章...</p>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="error-section">
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <h3 class="error-title">載入失敗</h3>
        <p class="error-message">{{ error }}</p>
        <button @click="fetchUserArticles" class="btn btn-outline retry-btn">
          <span>🔄</span>
          <span>重新載入</span>
        </button>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-else-if="articles.length === 0 && !error" class="empty-section">
      <div class="empty-icon">📝</div>
      <h3 class="empty-title">還沒有投稿文章</h3>
      <p class="empty-description">
        開始撰寫您的第一篇登山知識文章，與社群分享寶貴經驗！
      </p>
      <div class="empty-actions">
        <router-link to="/submit-article" class="btn btn-primary">
          <span class="btn-icon">✨</span>
          <span>立即開始投稿</span>
        </router-link>
        <router-link to="/" class="btn btn-outline">
          <span class="btn-icon">🏠</span>
          <span>回到首頁</span>
        </router-link>
      </div>
    </div>

    <!-- 文章統計 -->
    <div v-else class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon published">📰</div>
          <div class="stat-content">
            <div class="stat-number">{{ getStatusCount('approved') }}</div>
            <div class="stat-label">已發布</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pending">⏳</div>
          <div class="stat-content">
            <div class="stat-number">{{ getStatusCount('pending') }}</div>
            <div class="stat-label">審核中</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon rejected">❌</div>
          <div class="stat-content">
            <div class="stat-number">{{ getStatusCount('rejected') }}</div>
            <div class="stat-label">已拒絕</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon total">📊</div>
          <div class="stat-content">
            <div class="stat-number">{{ articles.length }}</div>
            <div class="stat-label">總計</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文章列表 -->
    <div v-if="!isLoading && articles.length > 0" class="articles-section">
      <div class="articles-grid">
        <article 
          v-for="(article, index) in articles" 
          :key="article.id" 
          class="article-card"
          :style="{ '--delay': index * 0.1 + 's' }"
        >
          <!-- 狀態徽章 -->
          <div class="status-badge" :class="getStatusClass(article.status)">
            <span class="status-icon">{{ getStatusIcon(article.status) }}</span>
            <span class="status-text">{{ getStatusText(article.status) }}</span>
          </div>

          <!-- 卡片內容 -->
          <div class="card-content">
            <!-- 文章標題 -->
            <h3 class="article-title">{{ article.title }}</h3>

            <!-- 文章資訊 -->
            <div class="article-info">
              <div class="info-row">
                <div class="info-item">
                  <span class="info-icon">🏷️</span>
                  <span class="info-text">{{ article.category || '未分類' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">📅</span>
                  <span class="info-text">{{ formatDate(article.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- 拒絕原因 -->
            <div v-if="article.status === 'rejected' && article.reviewComment" class="rejection-note">
              <div class="rejection-header">
                <span class="rejection-icon">💬</span>
                <span class="rejection-title">審核意見</span>
              </div>
              <p class="rejection-message">{{ article.reviewComment }}</p>
            </div>
          </div>

          <!-- 操作按鈕 -->
          <div class="card-actions">
            <button 
              @click="editArticle(article.id)" 
              class="action-btn edit-btn"
              title="編輯文章"
            >
              <span class="btn-icon">✏️</span>
              <span class="btn-text">編輯</span>
            </button>
            <router-link 
              v-if="article.status === 'approved'"
              :to="`/articles/${article.id}`"
              class="action-btn view-btn"
              title="查看文章"
            >
              <span class="btn-icon">👁️</span>
              <span class="btn-text">查看</span>
            </router-link>
            <button 
              @click="deleteArticle(article.id)" 
              class="action-btn delete-btn"
              title="刪除文章"
            >
              <span class="btn-icon">🗑️</span>
              <span class="btn-text">刪除</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mountain-my-articles {
  font-family: var(--font-body);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 頁面標題區域 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid rgba(34, 197, 94, 0.1);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 700;
  color: var(--stone-dark);
  margin: 0 0 0.5rem 0;
  font-family: var(--font-display);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.page-subtitle {
  color: var(--stone-medium);
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
}

.header-actions {
  flex-shrink: 0;
  margin-left: 1rem;
}

/* 按鈕樣式 */
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
  background: linear-gradient(135deg, #22c55e, #16a34a);
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

.btn-icon {
  font-size: 0.875rem;
}

/* 載入狀態 */
.loading-section {
  text-align: center;
  padding: 2rem 0;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  justify-content: center;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.loading-card {
  height: 150px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  background: rgba(254, 242, 242, 0.5);
  border-radius: 1.5rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.error-content {
  max-width: 400px;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 0.5rem;
  font-family: var(--font-display);
}

.error-message {
  color: #dc2626;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.retry-btn {
  border-color: #dc2626;
  color: #dc2626;
}

.retry-btn:hover {
  background: rgba(220, 38, 38, 0.05);
  border-color: #dc2626;
  color: #dc2626;
}

/* 空狀態 */
.empty-section {
  text-align: center;
  padding: 4rem 1rem;
  background: rgba(240, 253, 244, 0.3);
  border-radius: 1.5rem;
  border: 1px solid rgba(34, 197, 94, 0.1);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.empty-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: 0.75rem;
  font-family: var(--font-display);
}

.empty-description {
  color: var(--stone-medium);
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* 統計區域 */
.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.stat-icon.published {
  background: linear-gradient(135deg, var(--mountain-100), var(--mountain-200));
  color: var(--mountain-accent);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #d97706;
}

.stat-icon.rejected {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #dc2626;
}

.stat-icon.total {
  background: linear-gradient(135deg, var(--sky-100), var(--sky-200));
  color: var(--sky-accent);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--stone-dark);
  font-family: var(--font-display);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--stone-medium);
  margin-top: 0.25rem;
}

/* 文章區域 */
.articles-section {
  margin-top: 2rem;
}

.articles-grid {
  display: grid;
  gap: 1.5rem;
}

/* 文章卡片 */
.article-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: slideInUp 0.6s ease-out calc(var(--delay));
  animation-fill-mode: both;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-elevated);
  border-color: var(--mountain-primary);
}

/* 狀態徽章 */
.status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 2;
}

.status-badge.text-green-500 {
  background: linear-gradient(135deg, var(--mountain-100), var(--mountain-200));
  color: var(--mountain-accent);
  border: 1px solid var(--mountain-200);
}

.status-badge.text-yellow-500 {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #d97706;
  border: 1px solid #fde68a;
}

.status-badge.text-red-500 {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #dc2626;
  border: 1px solid #fecaca;
}

.status-icon {
  font-size: 0.75rem;
}

.status-text {
  font-family: var(--font-display);
}

/* 卡片內容 */
.card-content {
  padding: 1.5rem;
  padding-top: 3rem; /* 為狀態徽章留空間 */
}

.article-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: 1rem;
  font-family: var(--font-display);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 文章資訊 */
.article-info {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--stone-medium);
}

.info-icon {
  font-size: 0.875rem;
  opacity: 0.8;
}

.info-text {
  font-weight: 500;
}

/* 拒絕備註 */
.rejection-note {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(254, 242, 242, 0.7);
  border-radius: 0.75rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.rejection-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.rejection-icon {
  font-size: 0.875rem;
}

.rejection-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #dc2626;
  font-family: var(--font-display);
}

.rejection-message {
  font-size: 0.875rem;
  color: #dc2626;
  line-height: 1.5;
  margin: 0;
}

/* 操作按鈕 */
.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.5rem 1.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: var(--font-body);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid;
  flex: 1;
  justify-content: center;
}

.edit-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-color: #3b82f6;
}

.edit-btn:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
}

.view-btn {
  background: rgba(34, 197, 94, 0.1);
  color: var(--mountain-primary);
  border-color: var(--mountain-primary);
}

.view-btn:hover {
  background: var(--mountain-primary);
  color: white;
  transform: translateY(-1px);
  text-decoration: none;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: #ef4444;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 0.75rem;
}

.btn-text {
  font-family: var(--font-display);
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
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    margin-left: 0;
    width: 100%;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
  
  .info-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .action-btn {
    flex: none;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .title-icon {
    font-size: 1.25rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .card-content {
    padding: 1rem;
    padding-top: 2.5rem;
  }
  
  .article-title {
    font-size: 1.125rem;
  }
  
  .status-badge {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
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

/* 高對比度模式 */
@media (prefers-contrast: high) {
  .article-card {
    border: 2px solid var(--stone-dark);
    background: white;
  }
  
  .stat-card {
    border: 2px solid var(--stone-dark);
    background: white;
  }
  
  .article-title {
    color: black;
  }
}
</style>
