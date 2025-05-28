<template>
  <div>
    <h2 class="text-xl font-bold mb-4">📚 條目列表</h2>

    <!-- 🔍 搜尋 + 分類 -->
    <div class="flex flex-col sm:flex-row gap-2 mb-4">
      <input
        v-model="search"
        type="text"
        placeholder="🔍 搜尋文章標題或內容"
        class="flex-1 p-2 border rounded"
      />

      <select v-model="selectedCategory" class="p-2 border rounded w-full sm:w-48">
        <option value="">📂 全部分類</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <!-- 📦 狀態 -->
    <div v-if="loading">載入中...</div>
    <div v-else-if="filteredArticles.length === 0">沒有符合條件的文章。</div>

    <!-- 📋 條目列表 -->
    <div v-else>
      <div
        v-for="article in filteredArticles"
        :key="article.id"
        class="mb-4 p-4 border rounded bg-white shadow"
      >
        <h3 class="text-lg font-semibold text-green-700 hover:underline cursor-pointer">
          <router-link :to="`/articles/${article.id}`">{{ article.title }}</router-link>
        </h3>
        <p class="text-sm text-gray-600">
          ✍️ {{ article.displayName }} · 🕒 {{ article.createdAt?.toDate().toLocaleString() }}
        </p>
        <p class="text-xs text-indigo-600 mt-1">
          🏷️ 分類：
          <router-link
            :to="`/category/${article.category}`"
            class="hover:underline"
          >
            {{ article.category || '未分類' }}
          </router-link>
        </p>
        <p class="mt-2 text-gray-800 line-clamp-3">{{ article.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { db } from '../firebase'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'

const articles = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const selectedCategory = ref('')

// 自訂分類清單
const categories = ['百岳', '郊山', '海外', '裝備']

const filteredArticles = computed(() => {
  const keyword = search.value.toLowerCase()
  return articles.value.filter(article => {
    const matchSearch =
      article.title?.toLowerCase().includes(keyword) ||
      article.content?.toLowerCase().includes(keyword)
    const matchCategory =
      !selectedCategory.value || article.category === selectedCategory.value
    return matchSearch && matchCategory
  })
})

onMounted(async () => {
  const q = query(
    collection(db, 'articles'),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  articles.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  loading.value = false
})
</script>
