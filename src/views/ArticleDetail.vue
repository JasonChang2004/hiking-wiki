<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { marked } from 'marked'

const route = useRoute()
const article = ref<any | null>(null)
const loading = ref(true)

const renderedHtml = computed(() =>
  article.value?.content ? marked.parse(article.value.content) : ''
)

onMounted(async () => {
  const id = route.params.id as string
  const docRef = doc(db, 'articles', id)
  const snap = await getDoc(docRef)

  if (snap.exists()) {
    article.value = snap.data()
  } else {
    article.value = null
  }

  loading.value = false
})
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 bg-white rounded shadow">
    <div v-if="loading">載入中...</div>
    <div v-else-if="article">
      <h1 class="text-2xl font-bold text-green-700 mb-2">{{ article.title }}</h1>
      <p class="text-sm text-gray-600">✍️ {{ article.displayName }} · 🕒 {{ article.createdAt?.toDate().toLocaleString() }}</p>
      <hr class="my-4" />
      <div class="prose max-w-none" v-html="renderedHtml"></div>
    </div>
    <div v-else class="text-red-500 font-bold">找不到文章</div>
  </div>
</template>
