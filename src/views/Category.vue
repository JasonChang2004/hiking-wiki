<script setup lang="ts">
import { useRoute } from 'vue-router'
import { db } from '../firebase'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { onMounted, ref } from 'vue'

const route = useRoute()
const articles = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  const category = route.params.name as string
  const q = query(
    collection(db, 'articles'),
    where('status', '==', 'approved'),
    where('category', '==', category),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  articles.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  loading.value = false
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4 text-indigo-700">分類：{{ $route.params.name }}</h1>
    <div v-if="loading">載入中...</div>
    <div v-else-if="articles.length === 0">目前沒有該分類的文章。</div>
    <div v-else>
      <div
        v-for="article in articles"
        :key="article.id"
        class="mb-4 p-4 border rounded bg-white shadow"
      >
        <h3 class="text-lg font-semibold text-green-700 hover:underline cursor-pointer">
          <router-link :to="`/articles/${article.id}`">{{ article.title }}</router-link>
        </h3>
        <p class="text-sm text-gray-600">✍️ {{ article.displayName }} · 🕒 {{ article.createdAt?.toDate().toLocaleString() }}</p>
        <p class="text-sm text-indigo-600 mt-1">🏷️ 分類：{{ article.category }}</p>
        <p class="mt-2 text-gray-800 line-clamp-3">{{ article.content }}</p>
      </div>
    </div>
  </div>
</template>
