<template>
  <div class="review-articles">
    <!-- 區塊標題 -->
    <div class="section-header">
      <h2 class="section-title">
        <span class="section-icon">📋</span>
        待審核條目
      </h2>
      <div class="section-stats" v-if="!loading">
        <span class="stats-number">{{ articles.length }}</span>
        <span class="stats-label">篇待審核</span>
      </div>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="loading" class="loading-section">
      <div class="loading-grid">
        <div v-for="i in 3" :key="i" class="loading-card">
          <div class="loading-shimmer"></div>
        </div>
      </div>
      <p class="loading-text">🔄 正在載入待審核條目...</p>
    </div>

    <!-- 無資料狀態 -->
    <div v-else-if="articles.length === 0" class="empty-state">
      <div class="empty-icon">✅</div>
      <h3 class="empty-title">太棒了！沒有待審核的條目</h3>
      <p class="empty-description">
        目前所有提交的文章都已處理完畢。
      </p>
      <div class="empty-actions">
        <router-link to="/" class="btn btn-outline">
          <span class="btn-icon">🏠</span>
          返回首頁
        </router-link>
      </div>
    </div>

    <!-- 文章審核列表 -->
    <div v-else class="articles-section">
      <div 
        v-for="(article, index) in articles" 
        :key="article.id" 
        class="article-card"
        :style="{ '--delay': index * 0.1 + 's' }"
      >
        <!-- 卡片頭部 -->
        <div class="card-header">
          <div class="article-meta">
            <h3 class="article-title">{{ article.title }}</h3>
            <div class="meta-info">
              <div class="meta-item">
                <span class="meta-icon">👤</span>
                <span class="meta-text">{{ article.displayName }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span class="meta-text">{{ formatDate(article.createdAt) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">🏷️</span>
                <span class="category-tag">{{ article.category }}</span>
              </div>
            </div>
          </div>
          <div class="priority-indicator">
            <span class="priority-label">待審核</span>
          </div>
        </div>

        <!-- 內容預覽 -->
        <div class="content-preview">
          <div class="preview-header">
            <span class="preview-icon">📖</span>
            <span class="preview-title">內容摘要</span>
          </div>
          <div class="preview-text">
            {{ getContentPreview(article.content) }}
          </div>
          <div class="preview-actions">
            <router-link 
              :to="`/articles/${article.id}`" 
              target="_blank" 
              class="preview-link"
            >
              查看完整內容
              <span class="link-icon">🔗</span>
            </router-link>
          </div>
        </div>

        <!-- 審核操作區 -->
        <div class="review-actions">
          <div class="review-comment">
            <input 
              v-model="reviewComments[article.id]"
              class="comment-input"
              placeholder="輸入審核意見（選填）"
              maxlength="200"
            />
          </div>
          <div class="action-buttons">
            <button 
              @click="updateStatus(article, 'approved')" 
              class="btn btn-success"
              :disabled="processingArticles.has(article.id)"
            >
              <span v-if="processingArticles.has(article.id)" class="btn-loading"></span>
              <span v-else class="btn-icon">✅</span>
              核准文章
            </button>
            <button 
              @click="updateStatus(article, 'rejected')" 
              class="btn btn-danger"
              :disabled="processingArticles.has(article.id)"
            >
              <span v-if="processingArticles.has(article.id)" class="btn-loading"></span>
              <span v-else class="btn-icon">❌</span>
              拒絕文章
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs, query, where, updateDoc, doc, Timestamp, addDoc, orderBy } from 'firebase/firestore'
import { formatDate } from '@/utils/formatters'
import type { Article } from '@/types'
import { useAdminStore } from '@/store/admin'

const articles = ref<Article[]>([])
const loading = ref(true)
const reviewComments = reactive<Record<string, string>>({})
const processingArticles = ref(new Set<string>())
const adminStore = useAdminStore()

// 獲取內容預覽
const getContentPreview = (content: string | undefined): string => {
  if (!content) return '暫無內容描述...'
  const plainText = content.replace(/<[^>]*>/g, '').replace(/[#*`]/g, '') // 移除HTML和Markdown標記
  return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText
}

const loadArticles = async () => {
  loading.value = true
  try {
    const q = query(
      collection(db, 'articles'), 
      where('status', '==', 'pending'), 
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    articles.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article))
  } catch (error) {
    console.error("Error loading articles for review:", error)
    articles.value = []
  } finally {
    loading.value = false
  }
}

const updateStatus = async (article: Article, newStatus: 'approved' | 'rejected') => {
  // 添加到處理中的文章集合
  processingArticles.value.add(article.id)
  
  try {
    const articleRef = doc(db, 'articles', article.id)
    const updateData: any = { 
      status: newStatus,
      reviewedAt: Timestamp.now()
    }
    
    const comment = reviewComments[article.id]
    if (comment) {
      updateData.reviewComment = comment
    }
    
    await updateDoc(articleRef, updateData)
    
    // 發送通知
    try {
      await addDoc(collection(db, 'notifications'), {
        uid: article.uid,
        message: `您的文章「${article.title}」已${newStatus === 'approved' ? '通過審核' : '被拒絕'}${comment ? '，審核意見：' + comment : ''}`,
        type: newStatus === 'approved' ? 'article_approved' : 'article_rejected',
        read: false,
        createdAt: Timestamp.now(),
        articleId: article.id
      })
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError)
    }

    // 更新管理員store中的計數
    adminStore.decrementPendingCount(1)
    
    // 清除審核意見
    delete reviewComments[article.id]
    
    // 重新載入列表
    await loadArticles()
    
  } catch (error) {
    console.error('更新狀態時發生錯誤:', error)
    alert('操作失敗，請稍後再試')
  } finally {
    // 從處理中的文章集合移除
    processingArticles.value.delete(article.id)
  }
}

onMounted(() => {
  loadArticles()
})
</script>

<style scoped>
.review-articles {
  max-width: 100%;
}

/* 區塊標題 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(34, 197, 94, 0.1);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin: 0;
  font-family: var(--font-display);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  font-size: 1.25rem;
}

.section-stats {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--earth-100), var(--earth-200));
  border-radius: 1rem;
  border: 1px solid var(--earth-200);
}

.stats-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--earth-secondary);
  font-family: var(--font-display);
}

.stats-label {
  font-size: 0.875rem;
  color: var(--earth-secondary);
}

/* 載入狀態 */
.loading-section {
  text-align: center;
  margin: 3rem 0;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.loading-card {
  height: 200px;
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
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.loading-text {
  color: var(--stone-medium);
  font-size: 1rem;
  margin: 0;
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
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
  justify-content: center;
}

/* 文章卡片 */
.articles-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.article-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: slideInUp 0.6s ease-out calc(var(--delay));
  animation-fill-mode: both;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
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
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: var(--mountain-primary);
}

/* 卡片頭部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 1.5rem 1rem;
  background: linear-gradient(135deg, var(--mountain-50), var(--sky-50));
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.article-meta {
  flex: 1;
}

.article-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin: 0 0 1rem 0;
  font-family: var(--font-display);
  line-height: 1.4;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--stone-medium);
}

.meta-icon {
  font-size: 0.875rem;
}

.category-tag {
  padding: 0.125rem 0.5rem;
  background: linear-gradient(135deg, var(--mountain-100), var(--mountain-200));
  border-radius: 0.5rem;
  color: var(--mountain-accent);
  font-weight: 500;
  font-size: 0.75rem;
}

.priority-indicator {
  flex-shrink: 0;
  margin-left: 1rem;
}

.priority-label {
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.75rem;
  animation: pulse 2s infinite;
}

/* 內容預覽 */
.content-preview {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.preview-icon {
  font-size: 1rem;
}

.preview-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--stone-dark);
}

.preview-text {
  color: var(--stone-medium);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
}

.preview-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--mountain-primary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.preview-link:hover {
  color: var(--mountain-accent);
  text-decoration: underline;
}

.link-icon {
  font-size: 0.75rem;
}

/* 審核操作區 */
.review-actions {
  padding: 1.5rem;
  background: rgba(249, 250, 251, 0.5);
}

.review-comment {
  margin-bottom: 1rem;
}

.comment-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(209, 213, 219, 0.6);
  border-radius: 0.75rem;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.comment-input:focus {
  outline: none;
  border-color: var(--mountain-primary);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* 按鈕樣式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  position: relative;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.btn-outline {
  background: rgba(255, 255, 255, 0.8);
  color: var(--stone-dark);
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: var(--mountain-primary);
  color: var(--mountain-primary);
}

.btn-icon {
  font-size: 1rem;
}

.btn-loading {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .card-header {
    flex-direction: column;
    gap: 1rem;
  }

  .priority-indicator {
    margin-left: 0;
  }

  .meta-info {
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }
}
</style>
