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
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold text-blue-700 mb-4">📝 我的投稿紀錄</h1>

    <div v-if="loading">載入中...</div>
    <div v-else-if="!currentUser">請先登入以檢視投稿。</div>
    <div v-else-if="articles.length === 0">尚無任何投稿。</div>

    <div v-else>
      <div
        v-for="article in articles"
        :key="article.id"
        class="mb-4 p-4 border rounded bg-white shadow"
      >
        <h3 class="text-lg font-semibold text-green-700 hover:underline">
          <router-link :to="`/articles/${article.id}`">{{ article.title }}</router-link>
        </h3>
        <p class="text-sm text-gray-600">
          🕒 {{ article.createdAt?.toDate().toLocaleString() }} · 🏷️ {{ article.category }}
        </p>
        <p class="text-sm mt-1">
          狀態：
          <span v-if="article.status === 'approved'" class="text-green-600 font-medium">✅ 已核准</span>
          <span v-else-if="article.status === 'pending'" class="text-yellow-600 font-medium">🕒 審核中</span>
          <span v-else class="text-red-600 font-medium">❌ 已拒絕</span>
        </p>
      </div>
    </div>
  </div>
</template>
