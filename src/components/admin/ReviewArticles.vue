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
          <div class="text-gray-800 line-clamp-3 mb-2">
            {{ article.content.substring(0, 200) + (article.content.length > 200 ? '...' : '') }}
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
            @click="updateStatus(article.id, 'approved')" 
            class="wiki-button"
          >
            核准文章
          </button>
          <button 
            @click="updateStatus(article.id, 'rejected')" 
            class="wiki-button"
          >
            拒絕文章
          </button>
          
          <!-- 審核評論（可選功能） -->
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
import { db } from '../../firebase'
import { collection, getDocs, query, where, updateDoc, doc, Timestamp } from 'firebase/firestore'

const articles = ref<any[]>([])
const loading = ref(true)
const reviewComments = reactive<Record<string, string>>({})

const loadArticles = async () => {
  const q = query(collection(db, 'articles'), where('status', '==', 'pending'))
  const snapshot = await getDocs(q)
  articles.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  loading.value = false
}

const updateStatus = async (id: string, status: string) => {
  try {
    const ref = doc(db, 'articles', id)
    const updateData: any = { 
      status,
      reviewedAt: Timestamp.now()
    }
    
    // 如果有審核意見，也一併更新
    if (reviewComments[id]) {
      updateData.reviewComment = reviewComments[id]
    }
    
    await updateDoc(ref, updateData)
    
    const resultText = status === 'approved' ? '核准' : '拒絕'
    alert(`文章已${resultText}`)
    
    // 清除該文章的評論
    delete reviewComments[id]
    
    // 重新載入審核列表
    await loadArticles()
  } catch (error) {
    console.error('更新狀態時發生錯誤:', error)
    alert('操作失敗，請稍後再試')
  }
}

// 格式化日期
const formatDate = (ts: any) => {
  if (!ts) return '';
  const d = ts?.toDate?.();
  if (!d) return '';
  
  return d.toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

onMounted(() => {
  loadArticles()
})
</script>
