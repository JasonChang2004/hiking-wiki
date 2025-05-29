<template>
  <div>
    <h2 class="text-xl font-normal border-b border-wiki-border-light pb-2 mb-4">
      待審核條目
    </h2>
    
    <!-- 載入中 -->
    <div v-if="loading" class="wiki-notice">
      <p>正在載入待審核條目...</p>
    </div>
    
    <!-- 無資料提示 -->
    <div v-else-if="articles.length === 0" class="wiki-notice py-4">
      <p>目前沒有待審核的條目。</p>
    </div>
    
    <!-- 審核列表 -->
    <div v-else>
      <div v-for="article in articles" :key="article.id" class="mb-6 pb-4 border-b border-wiki-border-light last:border-0">
        <h3 class="text-lg font-semibold mb-2">{{ article.title }}</h3>
        
        <div class="mb-2">
          <span class="text-sm text-gray-600">作者：{{ article.displayName }}</span>
          <span class="text-sm text-gray-600 ml-4">提交於：{{ formatDate(article.createdAt) }}</span>
        </div>
        
        <div class="wiki-card">
          <div class="wiki-card-header">條目摘要</div>
          <!-- Make sure content is not null or undefined before substring -->
          <div class="text-gray-800 line-clamp-3 mb-2">
            {{ article.content?.substring(0, 200) + (article.content && article.content.length > 200 ? '...' : '') }}
          </div>
          <router-link :to="`/articles/${article.id}`" target="_blank" class="text-wiki-link hover:underline text-sm">
            查看完整內容
          </router-link>
        </div>
        
        <!-- 類別與標籤 -->
        <div class="mt-2 mb-4">
          <span class="wiki-tag">{{ article.category }}</span>
        </div>
        
        <!-- 審核操作 -->
        <div class="mt-4 flex gap-3 items-center">
          <button 
            @click="updateStatus(article, 'approved')" 
            class="wiki-button"
          >
            核准文章
          </button>
          <button 
            @click="updateStatus(article, 'rejected')" 
            class="wiki-button"
          >
            拒絕文章
          </button>
          
          <input 
            v-model="reviewComments[article.id]"
            class="wiki-input ml-2 flex-1"
            placeholder="輸入審核意見（選填）"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { db } from '@/firebase' // Correct path for firebase
import { collection, getDocs, query, where, updateDoc, doc, Timestamp, addDoc, orderBy } from 'firebase/firestore' // Added orderBy
import { formatDate } from '@/utils/formatters' // Use new formatter
import type { Article } from '@/types' // Use new type

const articles = ref<Article[]>([])
const loading = ref(true)
const reviewComments = reactive<Record<string, string>>({})

const loadArticles = async () => {
  loading.value = true;
  try {
    const q = query(collection(db, 'articles'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    articles.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article))
  } catch (error) {
    console.error("Error loading articles for review:", error);
    articles.value = [];
  } finally {
    loading.value = false
  }
}

const updateStatus = async (article: Article, newStatus: 'approved' | 'rejected') => {
  try {
    const articleRef = doc(db, 'articles', article.id)
    const updateData: any = { 
      status: newStatus,
      reviewedAt: Timestamp.now() // Use Firestore Timestamp
    }
    
    const comment = reviewComments[article.id]
    if (comment) {
      updateData.reviewComment = comment
    }
    
    await updateDoc(articleRef, updateData)
    
    // Send notification
    try {
      await addDoc(collection(db, 'notifications'), {
        uid: article.uid,
        message: `您的文章「${article.title}」已${newStatus === 'approved' ? '通過審核' : '被拒絕'}${comment ? '，審核意見：' + comment : ''}`,
        type: newStatus === 'approved' ? 'article_approved' : 'article_rejected',
        read: false,
        createdAt: Timestamp.now(), // Use Firestore Timestamp
        articleId: article.id
      });
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError);
      // Decide if the main operation should be considered failed or just log this
    }

    alert(`文章已${newStatus === 'approved' ? '核准' : '拒絕'}`)
    
    delete reviewComments[article.id]
    await loadArticles() // Reload the list
  } catch (error) {
    console.error('更新狀態時發生錯誤:', error)
    alert('操作失敗，請稍後再試')
  }
}

// formatDate is now imported

onMounted(() => {
  loadArticles()
})
</script>
