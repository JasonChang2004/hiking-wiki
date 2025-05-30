<template>
  <div class="wiki-theme max-w-4xl mx-auto px-4 sm:px-6">
    <!-- 維基風格頁面標題 -->
    <h1 class="text-2xl sm:text-3xl font-normal border-b border-wiki-border-light pb-2 mb-4">
      撰寫新文章
    </h1>
    <!-- 提交說明 -->
    <div class="wiki-notice mb-4 sm:mb-6">
      <p class="text-sm sm:text-base">請撰寫有助於登山社群的知識內容。所有投稿將經過審核，請確保內容準確可靠。</p>
      <p class="text-xs sm:text-sm mt-2">
        使用富文本編輯器 - 提供類似 Word 的編輯體驗，支援快速鍵 Ctrl+B（粗體）、Ctrl+I（斜體）、Ctrl+U（底線）
      </p>
      <p class="text-xs sm:text-sm mt-1 text-red-600">預覽區的內容已經過 HTML 清理以防止惡意程式碼。</p>
    </div>

    <form @submit.prevent="submitArticle" class="space-y-4 sm:space-y-5">
      <!-- 標題輸入 -->
      <div>
        <label for="title" class="block text-sm text-gray-600 mb-1">文章標題</label>
        <input
          v-model="title"
          id="title"
          type="text"
          placeholder="輸入具體明確的標題"
          class="wiki-input text-sm sm:text-base"
          required
        />
      </div>

      <!-- 分類選擇 -->
      <div>
        <label for="category" class="block text-sm text-gray-600 mb-1">文章分類 <span class="text-red-500">*</span></label>
        <select
          v-model="category"
          id="category"
          class="wiki-input text-sm sm:text-base"
          required
        >
          <option value="" disabled>請選擇一個分類</option>
          <option v-for="catOpt in categories" :key="catOpt" :value="catOpt">{{ catOpt }}</option>
        </select>
      </div>

      <!-- 內容編輯區 -->
      <div>
        <label class="block text-sm text-gray-600 mb-1">文章內容</label>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <!-- 富文本編輯器 -->
          <div class="order-1">
            <RichTextEditor
              v-model="htmlContent"
              placeholder="請在此撰寫文章內容，支援富文本格式..."
              height="300px"
              @update:model-value="onRichTextChange"
              class="lg:h-96"
            />
          </div>
          
          <!-- 預覽區 -->
          <div class="order-2 lg:order-2">
            <div class="border border-wiki-border-light bg-white h-64 lg:h-96 p-3 sm:p-4 overflow-y-auto">
              <div v-if="content" class="wiki-text text-sm sm:text-base" v-html="parsedMarkdown"></div>
              <div v-else class="text-center text-gray-500 py-8 sm:py-10">
                <p class="text-sm sm:text-base">預覽區</p>
                <p class="text-xs sm:text-sm">開始編輯後在此處顯示預覽</p>
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
          placeholder="請列出本文引用的參考資料與來源，例如：&#10;• 中央氣象局登山氣象資訊&#10;• 台灣登山學會安全手冊&#10;• 相關網站連結等"
          class="wiki-input h-20 sm:h-24 resize-y text-sm sm:text-base"
          rows="4"
        ></textarea>
      </div>

      <!-- 聲明與提交 -->
      <div class="pt-3 border-t border-wiki-border-light">
        <div v-if="needsAgreement" class="flex items-start mb-3 sm:mb-4">
          <input
            v-model="agreeTerms"
            id="terms"
            type="checkbox"
            class="mt-1 mr-2 flex-shrink-0"
            required
          />
          <label for="terms" class="text-xs sm:text-sm text-gray-600">
            我確認提交的內容為原創或有適當引用，且同意以創用CC授權分享於平台 <span class="text-red-500">*</span>
          </label>
        </div>

        <div class="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <button
            type="button"
            class="wiki-button order-2 sm:order-1 text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
            @click="resetForm"
            :disabled="submitting"
          >
            清空表單
          </button>
          <button
            type="submit"
            class="wiki-button order-1 sm:order-2 text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
            :disabled="!isFormValid"
            :class="{'opacity-50 cursor-not-allowed': !isFormValid}"
          >
            {{ submitting ? '提交中...' : (articleId ? '更新文章' : '提交審核') }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import { db, auth } from '@/firebase'
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore'
import type { Article } from '@/types'
import DOMPurify from 'dompurify';
import { useRoute, useRouter } from 'vue-router'
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import { htmlToMarkdown } from '@/utils/htmlMarkdownConverter'

const route = useRoute() // Added for editing
const router = useRouter() // Added for editing
const articleId = ref<string | null>(null) // Added for editing

const title = ref('')
const content = ref('')
const category = ref('') // Consider type for categories if they are fixed
const references = ref('')
const agreeTerms = ref(false)
const submitting = ref(false); // Add submitting state

// 富文本編輯器相關
const editorMode = ref<'rich' | 'markdown'>('rich') // 預設使用富文本編輯器
const htmlContent = ref('')

// 預定義分類清單 - 這些也可以考慮從 Firestore 或設定檔中獲取，以方便管理
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

const parsedMarkdown = computed(() => {
  const dirty = marked.parse(content.value || '') as string; // Ensure string output
  return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
})

// 表單驗證計算屬性
const isFormValid = computed(() => {
  const hasRequiredFields = title.value.trim() && content.value.trim() && category.value
  const hasAgreement = agreeTerms.value || articleId.value // 編輯時不需要重新同意條款
  return hasRequiredFields && hasAgreement && !submitting.value
})

// 是否需要顯示同意條款（新文章需要，編輯文章不需要）
const needsAgreement = computed(() => {
  return !articleId.value
})

// 富文本編輯器內容變化處理
const onRichTextChange = (htmlValue: string) => {
  htmlContent.value = htmlValue
  // 將 HTML 轉換為 Markdown 以保持與現有系統的兼容性
  try {
    content.value = htmlToMarkdown(htmlValue)
  } catch (error) {
    console.error('HTML 轉 Markdown 轉換錯誤:', error);
    content.value = htmlValue; // 轉換失敗時使用原始 HTML
  }
}

// Function to load article for editing
const loadArticleForEdit = async (id: string) => {
  try {
    const docRef = doc(db, 'articles', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const article = docSnap.data() as Article;
      // Check if the current user is the author
      if (auth.currentUser && auth.currentUser.uid === article.uid) {
        title.value = article.title;
        content.value = article.content;
        category.value = article.category;
        references.value = article.references || '';
        articleId.value = id; // Set articleId when editing
        
        // 如果是富文本模式，將 Markdown 轉換為 HTML
        if (editorMode.value === 'rich') {
          htmlContent.value = marked.parse(article.content) as string;
        }
        
        // Note: agreeTerms is not loaded as it's a submission-time agreement
      } else {
        alert('您沒有權限編輯此文章。');
        router.push('/'); // Redirect if not authorized
      }
    } else {
      alert('找不到要編輯的文章。');
      router.push('/'); // Redirect if article not found
    }
  } catch (error) {
    console.error("載入文章時發生錯誤:", error);
    alert('載入文章失敗。');
    router.push('/');
  }
};

const submitArticle = async () => {
  const user = auth.currentUser
  if (!user) {
    alert('請先登入以提交文章。')
    return
  }
  if (!agreeTerms.value && !articleId.value) { // Only require agreeTerms for new articles
    alert('請同意條款以提交文章。');
    return;
  }
  if (!title.value.trim() || !content.value.trim() || !category.value) {
    alert('請填寫所有必填欄位（標題、內容、分類）。');
    return;
  }

  submitting.value = true;
  try {
    const articleData = {
      title: title.value.trim(),
      content: content.value.trim(),
      category: category.value,
      references: references.value.trim(),
      uid: user.uid,
      displayName: user.displayName || '匿名用戶',
      status: 'pending', // Always set to pending for review, even edits
      isFeatured: false, // Reset featured status on edit, admin can re-feature
      // For new articles, createdAt is set. For existing, it's preserved.
      // For edited articles, add updatedAt timestamp
    };

    if (articleId.value) {
      // Update existing article
      const articleRef = doc(db, 'articles', articleId.value);
      await updateDoc(articleRef, {
        ...articleData,
        updatedAt: serverTimestamp() // Add/update 'updatedAt' field
      });
      alert('文章更新成功！內容已提交審核。');
      router.push(`/articles/${articleId.value}`); // Navigate to article page after edit
    } else {
      // Add new article
      await addDoc(collection(db, 'articles'), {
        ...articleData,
        createdAt: serverTimestamp(),
      });
      alert('投稿成功！您的文章已提交，等待審核。');
      resetForm();
    }
  } catch (error) {
    console.error("提交/更新文章時發生錯誤:", error);
    alert('操作失敗，請檢查網路連線並稍後再試。');
  } finally {
    submitting.value = false;
  }
}

const resetForm = () => {
  title.value = ''
  content.value = ''
  htmlContent.value = ''
  category.value = ''
  references.value = ''
  agreeTerms.value = false
}

onMounted(() => {
  console.log('SubmitArticlePage mounted')
  
  // 監聽認證狀態變化以確保準確性
  const unsubscribe = auth.onAuthStateChanged((user) => {
    console.log('Auth state in SubmitArticlePage:', user ? user.email : 'no user')
    
    if (!user) {
      console.warn('User not logged in, redirecting to home')
      router.push('/')
      return
    }
    
    // 用戶已登入，檢查是否為編輯模式
    if (route.query.edit && typeof route.query.id === 'string') {
      loadArticleForEdit(route.query.id)
    }
    
    // 立即取消監聽以避免重複檢查
    unsubscribe()
  })
})
</script>

<style scoped>
/* 富文本編輯器模式切換按鈕樣式 */
.mode-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.mode-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.mode-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
  box-shadow: 0 1px 2px rgba(59, 130, 246, 0.1);
}

.mode-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}
</style>