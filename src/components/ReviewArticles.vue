<template>
  <div>
    <h2 class="text-xl font-bold mb-4">🧑‍⚖️ 審核待處理條目</h2>
    <div v-if="loading">載入中...</div>
    <div v-else-if="articles.length === 0">目前沒有待審核的條目。</div>
    <div v-else>
      <div v-for="article in articles" :key="article.id" class="mb-4 p-4 border rounded bg-white shadow">
        <h3 class="text-lg font-semibold">{{ article.title }}</h3>
        <p class="text-sm text-gray-600">✍️ {{ article.displayName }}</p>
        <p class="mt-2 text-gray-800 whitespace-pre-wrap">{{ article.content }}</p>
        <div class="mt-4 flex gap-2">
          <button @click="updateStatus(article.id, 'approved')" class="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">
            ✅ 通過
          </button>
          <button @click="updateStatus(article.id, 'rejected')" class="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700">
            ❌ 拒絕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore'

const articles = ref<any[]>([])
const loading = ref(true)

const loadArticles = async () => {
  const q = query(collection(db, 'articles'), where('status', '==', 'pending'))
  const snapshot = await getDocs(q)
  articles.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  loading.value = false
}

const updateStatus = async (id: string, status: string) => {
  const ref = doc(db, 'articles', id)
  await updateDoc(ref, { status })
  alert(`條目已標記為 ${status}`)
  await loadArticles() // 重新載入
}

onMounted(() => {
  loadArticles()
})
</script>
