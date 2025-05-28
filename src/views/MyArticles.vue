<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { auth, db } from '../firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const articles = ref<any[]>([])
const loading = ref(true)
const currentUser = ref<any | null>(null)

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    console.log('🔍 auth state changed:', user)

    if (!user) {
      loading.value = false
      return
    }

    currentUser.value = user

    const q = query(
      collection(db, 'articles'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    console.log('📡 fetching articles for uid:', user.uid)

    const snap = await getDocs(q)
    console.log('📄 found articles:', snap.docs.length)

    articles.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    loading.value = false
  })
})

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

// 取得文章狀態的顯示文字
const getStatusText = (status: string) => {
  switch(status) {
    case 'approved': return '已核准';
    case 'pending': return '審核中';
    default: return '已拒絕';
  }
}

// 取得文章狀態的顏色樣式
const getStatusClass = (status: string) => {
  switch(status) {
    case 'approved': return 'text-green-700';
    case 'pending': return 'text-amber-700';
    default: return 'text-red-700';
  }
}
</script>

<template>
  <div class="wiki-theme max-w-4xl mx-auto">
    <!-- 維基風格頁面標題 -->
    <h1 class="text-3xl font-normal border-b border-wiki-border-light pb-2 mb-4">
      我的投稿紀錄
    </h1>
    
    <!-- 載入狀態 -->
    <div v-if="loading" class="wiki-notice">
      <p>正在載入您的投稿...</p>
    </div>
    
    <!-- 未登入提示 -->
    <div v-else-if="!currentUser" class="wiki-notice">
      <p>請先登入以檢視您的投稿。</p>
    </div>
    
    <!-- 無投稿提示 -->
    <div v-else-if="articles.length === 0" class="wiki-notice">
      <p>您目前尚無任何投稿。</p>
      <p class="mt-2">
        <router-link to="/" class="text-wiki-link hover:underline">返回首頁</router-link>
        開始您的第一篇投稿。
      </p>
    </div>
    
    <!-- 投稿列表 - 維基風格 -->
    <div v-else>
      <p class="text-sm text-gray-600 mb-4">
        您共有 {{ articles.length }} 篇投稿
      </p>
      
      <!-- 維基風格的表格 -->
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="text-left py-2 px-3 bg-wiki-bg-light border border-wiki-border-light">標題</th>
            <th class="text-left py-2 px-3 bg-wiki-bg-light border border-wiki-border-light">發布日期</th>
            <th class="text-left py-2 px-3 bg-wiki-bg-light border border-wiki-border-light">分類</th>
            <th class="text-left py-2 px-3 bg-wiki-bg-light border border-wiki-border-light">狀態</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in articles" :key="article.id">
            <td class="py-2 px-3 border border-wiki-border-light">
              <router-link 
                :to="`/articles/${article.id}`" 
                class="text-wiki-link hover:underline"
              >
                {{ article.title }}
              </router-link>
            </td>
            <td class="py-2 px-3 border border-wiki-border-light text-sm">
              {{ formatDate(article.createdAt) }}
            </td>
            <td class="py-2 px-3 border border-wiki-border-light text-sm">
              {{ article.category }}
            </td>
            <td class="py-2 px-3 border border-wiki-border-light text-sm">
              <span :class="getStatusClass(article.status)">
                {{ getStatusText(article.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="mt-6 text-sm text-gray-600">
        <p>狀態說明：</p>
        <ul class="list-disc ml-5 mt-1">
          <li><span class="text-green-700">已核准</span>：文章已通過審核並發布</li>
          <li><span class="text-amber-700">審核中</span>：文章正在等待管理員審核</li>
          <li><span class="text-red-700">已拒絕</span>：文章未通過審核，請修改後重新提交</li>
        </ul>
      </div>
    </div>
  </div>
</template>
