<template>
  <div v-if="articles.length" class="w-full bg-gray-100 rounded-lg p-4">
    <h2 class="text-lg font-semibold mb-4">🌟 精選文章</h2>
    <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div v-for="article in articles" :key="article.id" class="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
        <router-link :to="`/article/${article.id}`">
          <h3 class="font-bold text-lg mb-2">{{ article.title }}</h3>
          <p class="text-sm text-gray-600 mb-1">by {{ article.displayName }}</p>
          <p class="text-sm text-gray-500">{{ formatDate(article.createdAt) }}</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import type { Article } from '../types'

const articles = ref<Article[]>([])

onMounted(async () => {
  const q = query(
    collection(db, 'articles'),
    where('isFeatured', '==', true),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  articles.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article))
})

const formatDate = (ts: any) => {
  const d = ts?.toDate?.()
  return d ? d.toLocaleDateString() : ''
}
</script>
