<template>
  <div class="wiki-theme max-w-4xl mx-auto">
    <!-- 維基風格頁面標題 -->
    <h1 class="text-3xl font-normal border-b border-wiki-border-light pb-2 mb-4">
      撰寫新文章
    </h1>

    <!-- 提交說明 -->
    <div class="wiki-notice mb-6">
      <p>請撰寫有助於登山社群的知識內容。所有投稿將經過審核，請確保內容準確可靠。</p>
      <p class="text-sm mt-2">支援 Markdown 語法。可使用 # 標題，*斜體*，**粗體**，[連結](網址) 等格式。</p>
    </div>

    <form @submit.prevent="submitArticle" class="space-y-5">
      <!-- 標題輸入 -->
      <div>
        <label for="title" class="block text-sm text-gray-600 mb-1">文章標題</label>
        <input
          v-model="title"
          id="title"
          type="text"
          placeholder="輸入具體明確的標題"
          class="wiki-input"
          required
        />
      </div>

      <!-- 分類選擇 -->
      <div>
        <label for="category" class="block text-sm text-gray-600 mb-1">文章分類</label>
        <select
          v-model="category"
          id="category"
          class="wiki-input"
          required
        >
          <option value="" disabled>請選擇一個分類</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <!-- 內容編輯區 -->
      <div>
        <label for="content" class="block text-sm text-gray-600 mb-1">文章內容</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 編輯區 -->
          <div>
            <textarea
              v-model="content"
              id="content"
              placeholder="請在此撰寫文章內容（支援Markdown語法）"
              class="wiki-input h-96 font-mono text-sm resize-none"
              required
            ></textarea>
          </div>

          <!-- 預覽區 -->
          <div>
            <div class="border border-wiki-border-light bg-white h-96 p-4 overflow-y-auto">
              <div v-if="content" class="wiki-text" v-html="parsedMarkdown"></div>
              <div v-else class="text-center text-gray-500 py-10">
                <p>預覽區</p>
                <p class="text-sm">開始編輯後在此處顯示預覽</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 參考資料 -->
      <div>
        <label for="references" class="block text-sm text-gray-600 mb-1">參考資料（選填）</label>
        <textarea
          v-model="references"
          id="references"
          placeholder="請列出本文引用的參考資料與來源"
          class="wiki-input h-20 resize-none"
        ></textarea>
      </div>

      <!-- 聲明與提交 -->
      <div class="pt-3 border-t border-wiki-border-light">
        <div class="flex items-start mb-4">
          <input
            v-model="agreeTerms"
            id="terms"
            type="checkbox"
            class="mt-1 mr-2"
            required
          />
          <label for="terms" class="text-sm text-gray-600">
            我確認提交的內容為原創或有適當引用，且同意以創用CC授權分享於平台
          </label>
        </div>

        <div class="flex justify-between">
          <button
            type="button"
            class="wiki-button"
            @click="resetForm"
          >
            清空表單
          </button>

          <button
            type="submit"
            class="wiki-button"
            :disabled="!agreeTerms"
            :class="{'opacity-50 cursor-not-allowed': !agreeTerms}"
          >
            提交審核
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { marked } from 'marked'
import { db } from '../../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const title = ref('')
const content = ref('')
const category = ref('')
const references = ref('')
const agreeTerms = ref(false)

// 預定義分類清單
const categories = [
  '登山路線',
  '裝備心得',
  '登山知識',
  '緊急應變',
  '野外生存',
  '保育生態',
  '登山飲食',
  '入門指南'
]

const parsedMarkdown = computed(() => marked.parse(content.value || ''))

const submitArticle = async () => {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) return alert('請先登入')

  try {
    await addDoc(collection(db, 'articles'), {
      title: title.value,
      content: content.value,
      category: category.value,
      references: references.value,
      uid: user.uid,
      displayName: user.displayName,
      createdAt: serverTimestamp(),
      status: 'pending',
    })

    alert('投稿成功！您的文章已提交，等待審核。')
    resetForm()
  } catch (error) {
    console.error("提交文章時發生錯誤:", error)
    alert('提交失敗，請稍後再試')
  }
}

const resetForm = () => {
  title.value = ''
  content.value = ''
  category.value = ''
  references.value = ''
  agreeTerms.value = false
}
</script>
