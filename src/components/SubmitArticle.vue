<template>
  <div class="max-w-4xl mx-auto mt-10">
    <h1 class="text-2xl font-bold mb-6">撰寫新文章</h1>

    <form @submit.prevent="submitArticle" class="space-y-4">
      <input v-model="title" type="text" placeholder="文章標題" class="w-full p-2 border rounded" required />

      <input v-model="category" type="text" placeholder="分類（如 登山、裝備、路線）" class="w-full p-2 border rounded" required />

      <div class="grid grid-cols-2 gap-4">
        <textarea
          v-model="content"
          placeholder="在此撰寫 Markdown 內容"
          class="w-full h-96 p-2 border rounded resize-none"
        />
        <div class="w-full h-96 p-4 border rounded overflow-y-auto prose bg-white">
          <div v-html="parsedMarkdown"></div>
        </div>
      </div>

      <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
        送出文章
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { marked } from 'marked'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const title = ref('')
const content = ref('')
const category = ref('')

const parsedMarkdown = computed(() => marked.parse(content.value || ''))

const submitArticle = async () => {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) return alert('請先登入')

  await addDoc(collection(db, 'articles'), {
    title: title.value,
    content: content.value,
    category: category.value,
    uid: user.uid,
    displayName: user.displayName,
    createdAt: serverTimestamp(),
    status: 'pending',
  })

  alert('投稿成功，等待審核')
  title.value = ''
  content.value = ''
  category.value = ''
}
</script>
