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
        <label for="title" class="block text-sm text-gray-600 mb-1">
          文章標題 <span class="required-mark">*</span>
        </label>
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
        <label for="category" class="block text-sm text-gray-600 mb-1">
          文章分類 <span class="required-mark">*</span>
        </label>
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
        <label class="block text-sm text-gray-600 mb-1">
          文章內容 <span class="required-mark">*</span>
        </label>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <!-- 富文本編輯器 -->
          <div class="order-1">
            <!-- 暫時使用簡單的 textarea 替代富文本編輯器 -->
            <div class="simple-editor">
              <div class="editor-toolbar-simple">
                <button type="button" @click="insertMarkdown('**', '**')" class="markdown-btn" title="粗體">
                  <strong>B</strong>
                </button>
                <button type="button" @click="insertMarkdown('*', '*')" class="markdown-btn" title="斜體">
                  <em>I</em>
                </button>
                <button type="button" @click="insertMarkdown('<u>', '</u>')" class="markdown-btn" title="底線">
                  <u>U</u>
                </button>
                <button type="button" @click="insertMarkdown('~~', '~~')" class="markdown-btn" title="刪除線">
                  <s>S</s>
                </button>
                
                <div class="toolbar-separator"></div>
                
                <button type="button" @click="insertMarkdown('# ', '')" class="markdown-btn" title="大標題 H1">
                  H1
                </button>
                <button type="button" @click="insertMarkdown('## ', '')" class="markdown-btn" title="中標題 H2">
                  H2
                </button>
                <button type="button" @click="insertMarkdown('### ', '')" class="markdown-btn" title="小標題 H3">
                  H3
                </button>
                
                <div class="toolbar-separator"></div>
                
                <button type="button" @click="insertMarkdown('- ', '')" class="markdown-btn" title="無序列表">
                  •
                </button>
                <button type="button" @click="insertMarkdown('1. ', '')" class="markdown-btn" title="有序列表">
                  1.
                </button>
                
                <div class="toolbar-separator"></div>
                
                <button type="button" @click="insertMarkdown('[連結文字](', ')')" class="markdown-btn" title="連結">
                  🔗
                </button>
                <button type="button" @click="insertMarkdown('> ', '')" class="markdown-btn" title="引用">
                  "
                </button>
                <button type="button" @click="insertMarkdown('`', '`')" class="markdown-btn" title="內聯程式碼">
                  &lt;/&gt;
                </button>
                <button type="button" @click="insertCodeBlock" class="markdown-btn" title="程式碼區塊">
                  { }
                </button>
                <button type="button" @click="insertMarkdown('---\n', '')" class="markdown-btn" title="分隔線">
                  ⎯
                </button>
                
                <div class="toolbar-separator"></div>
                
                <button type="button" @click="triggerImageUpload" class="markdown-btn" :disabled="uploadingImage" title="插入圖片">
                  <span v-if="uploadingImage" class="loading-spinner"></span>
                  <span v-else>🖼️</span>
                </button>
              </div>
              <textarea
                ref="contentTextarea"
                v-model="content"
                placeholder="請在此撰寫文章內容，支援 Markdown 格式...&#10;&#10;💡 提示：使用工具欄中的圖片按鈕可以在當前位置插入圖片"
                class="content-textarea"
                rows="12"
              ></textarea>
            </div>
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
        <div v-if="needsAgreement" class="flex items-start mb-3 sm:mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <input
            v-model="agreeTerms"
            id="terms"
            type="checkbox"
            class="mt-1 mr-3 flex-shrink-0 w-4 h-4"
            required
          />
          <label for="terms" class="text-xs sm:text-sm text-gray-700 leading-relaxed">
            我確認提交的內容為原創或有適當引用，且同意以創用CC授權分享於平台 
            <span class="required-mark">*</span>
            <div class="text-xs text-gray-500 mt-1">
              ✓ 此為必填項目，提交前請務必勾選
            </div>
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
            :disabled="submitting"
            :class="{'opacity-50 cursor-not-allowed': submitting}"
          >
            {{ submitting ? '提交中...' : (articleId ? '更新文章' : '提交審核') }}
          </button>
        </div>
      </div>
    </form>
    
    <!-- 隱藏的圖片上傳輸入 -->
    <input
      ref="imageInput"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp"
      @change="handleImageUpload"
      style="display: none;"
      multiple
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { marked } from 'marked'
import { db, auth, storage } from '@/firebase'
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
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
const images = ref<string[]>([]) // 保留用於向後兼容，但現在圖片直接嵌入內容中
const agreeTerms = ref(false)
const submitting = ref(false); // Add submitting state
const contentTextarea = ref<HTMLTextAreaElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null) // 圖片上傳輸入框引用
const uploadingImage = ref(false) // 圖片上傳狀態

// 富文本編輯器相關 - 暫時保留但不使用
const editorMode = ref<'rich' | 'markdown'>('markdown') // 改為 markdown 模式
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
let updateTimer: ReturnType<typeof setTimeout> | null = null

const onRichTextChange = (htmlValue: string) => {
  // 立即更新 HTML 內容
  htmlContent.value = htmlValue
  
  // 防抖更新 Markdown 內容，避免頻繁轉換
  if (updateTimer) {
    clearTimeout(updateTimer)
  }
  
  updateTimer = setTimeout(() => {
    try {
      const markdownValue = htmlToMarkdown(htmlValue)
      // 只有當內容確實不同時才更新
      if (content.value !== markdownValue) {
        content.value = markdownValue
      }
    } catch (error) {
      console.error('HTML 轉 Markdown 轉換錯誤:', error);
      // 轉換失敗時，只有當內容確實不同時才使用原始 HTML
      if (content.value !== htmlValue) {
        content.value = htmlValue
      }
    }
  }, 300) // 300ms 防抖延遲
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
        images.value = article.images || [];
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
  
  // 檢查必填欄位
  if (!title.value.trim()) {
    alert('請填寫文章標題。')
    return
  }
  
  if (!category.value) {
    alert('請選擇文章分類。')
    return
  }
  
  if (!content.value.trim()) {
    alert('請填寫文章內容。')
    return
  }
  
  // 檢查同意條款（僅新文章需要）
  if (!articleId.value && !agreeTerms.value) {
    alert('請先勾選同意條款後再提交文章。')
    return
  }

  submitting.value = true;
  try {
    const articleData = {
      title: title.value.trim(),
      content: content.value.trim(),
      category: category.value,
      references: references.value.trim(),
      images: images.value,
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
  // 清理更新計時器
  if (updateTimer) {
    clearTimeout(updateTimer)
    updateTimer = null
  }
  
  title.value = ''
  content.value = ''
  htmlContent.value = ''
  category.value = ''
  references.value = ''
  images.value = []
  agreeTerms.value = false
}

// 插入 Markdown 格式
const insertMarkdown = (before: string, after: string) => {
  if (!contentTextarea.value) return
  
  const textarea = contentTextarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  
  const newText = content.value.substring(0, start) + before + selectedText + after + content.value.substring(end)
  content.value = newText
  
  // 重新設定游標位置
  nextTick(() => {
    if (contentTextarea.value) {
      const newCursorPos = start + before.length + selectedText.length + after.length
      contentTextarea.value.focus()
      contentTextarea.value.setSelectionRange(newCursorPos, newCursorPos)
    }
  })
}

// 插入程式碼區塊
const insertCodeBlock = () => {
  if (!contentTextarea.value) return
  
  const textarea = contentTextarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  
  const codeBlock = selectedText 
    ? `\n\`\`\`\n${selectedText}\n\`\`\`\n`
    : `\n\`\`\`\n在此輸入程式碼\n\`\`\`\n`
  
  const newText = content.value.substring(0, start) + codeBlock + content.value.substring(end)
  content.value = newText
  
  // 重新設定游標位置
  nextTick(() => {
    if (contentTextarea.value) {
      const newCursorPos = selectedText 
        ? start + codeBlock.length
        : start + 5 // 將游標放在 ``` 後面
      contentTextarea.value.focus()
      contentTextarea.value.setSelectionRange(newCursorPos, newCursorPos)
    }
  })
}

// 觸發圖片上傳
const triggerImageUpload = () => {
  if (!uploadingImage.value) {
    imageInput.value?.click()
  }
}

// 處理圖片上傳
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  uploadingImage.value = true
  const files = Array.from(target.files)

  try {
    // 驗證文件
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert('請選擇圖片檔案')
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert(`檔案 "${file.name}" 太大，請選擇小於 5MB 的圖片`)
        return
      }
    }

    // 上傳圖片並插入到編輯器
    for (const file of files) {
      const imageUrl = await uploadImageToStorage(file)
      insertImageToEditor(file.name, imageUrl)
    }

    // 清除輸入
    target.value = ''
  } catch (error) {
    console.error('圖片上傳失敗:', error)
    alert('圖片上傳失敗，請重試')
  } finally {
    uploadingImage.value = false
  }
}

// 上傳圖片到 Firebase Storage
const uploadImageToStorage = async (file: File): Promise<string> => {
  // 先壓縮圖片
  const compressedFile = await compressImage(file)
  
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const fileName = `articles/${timestamp}_${randomString}_${file.name}`
  
  const fileRef = storageRef(storage, fileName)
  const uploadTask = uploadBytesResumable(fileRef, compressedFile)
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // 可以在這裡顯示上傳進度
      },
      (error) => {
        reject(error)
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadURL)
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

// 壓縮圖片函數
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      // 設定最大尺寸 - 更小的尺寸
      const MAX_WIDTH = 800
      const MAX_HEIGHT = 600
      const QUALITY = 0.7
      
      let { width, height } = img
      
      // 計算縮放比例
      if (width > height) {
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height
          height = MAX_HEIGHT
        }
      }
      
      // 設定畫布尺寸
      canvas.width = width
      canvas.height = height
      
      // 繪製並壓縮圖片
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // 創建新的 File 對象
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            // 如果壓縮失敗，返回原檔案
            resolve(file)
          }
        },
        file.type,
        QUALITY
      )
    }
    
    // 載入圖片
    img.src = URL.createObjectURL(file)
  })
}

// 插入圖片到編輯器
const insertImageToEditor = (fileName: string, imageUrl: string) => {
  if (!contentTextarea.value) return
  
  const textarea = contentTextarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  
  // 創建圖片的 Markdown 語法
  const imageMarkdown = `![${fileName}](${imageUrl})\n\n`
  
  // 插入圖片到當前游標位置
  const newText = content.value.substring(0, start) + imageMarkdown + content.value.substring(end)
  content.value = newText
  
  // 設定游標位置到圖片後面
  nextTick(() => {
    if (contentTextarea.value) {
      const newCursorPos = start + imageMarkdown.length
      contentTextarea.value.focus()
      contentTextarea.value.setSelectionRange(newCursorPos, newCursorPos)
    }
  })
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

onUnmounted(() => {
  // 清理更新計時器
  if (updateTimer) {
    clearTimeout(updateTimer)
  }
})
</script>

<style scoped>
/* 簡單編輯器樣式 */
.simple-editor {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.editor-toolbar-simple {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  gap: 4px;
  flex-wrap: wrap;
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: #d1d5db;
  margin: 0 4px;
}

.markdown-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s ease;
}

.markdown-btn:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.markdown-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.markdown-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content-textarea {
  width: 100%;
  min-height: 300px;
  padding: 16px;
  border: none;
  outline: none;
  resize: vertical;
  font-family: 'Linux Libertine', Georgia, Times, serif;
  font-size: 16px;
  line-height: 1.6;
  color: #1f2937;
  background: white;
}

.content-textarea:focus {
  outline: none;
}

/* 表單必填標記樣式 */
.text-red-500 {
  color: #ef4444;
}

/* 確保必填標記顯示正確 */
.required-mark {
  color: #ef4444;
  font-weight: bold;
  margin-left: 2px;
}

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

/* 預覽區圖片樣式 */
.wiki-text img {
  width: 100%;
  height: auto;
  border-radius: 0.75rem;
  margin: 1.5rem 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 響應式圖片調整 */
@media (max-width: 768px) {
  .wiki-text img {
    margin: 0.75rem 0;
  }

  /* 頁面整體響應式 */
  .container {
    padding: 0 var(--space-sm);
  }

  .page-header {
    margin-bottom: var(--space-xl);
  }

  .page-title {
    font-size: var(--text-2xl);
  }

  .page-subtitle {
    font-size: var(--text-sm);
  }

  /* 表單響應式 */
  .form-group {
    margin-bottom: var(--space-lg);
  }

  .form-label {
    font-size: var(--text-sm);
    margin-bottom: var(--space-xs);
  }

  .form-input,
  .form-select {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-base);
  }

  /* 編輯器工具欄響應式 */
  .editor-toolbar-simple {
    padding: var(--space-xs) var(--space-sm);
    gap: var(--space-xs);
  }

  .markdown-btn {
    width: 28px;
    height: 28px;
    font-size: var(--text-xs);
  }

  .toolbar-separator {
    height: 20px;
    margin: 0 var(--space-xs);
  }

  /* 內容區域響應式 */
  .content-textarea {
    min-height: 250px;
    padding: var(--space-md);
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
  }

  .preview-content {
    padding: var(--space-md);
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
  }

  /* 模式切換按鈕響應式 */
  .mode-btn {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-xs);
  }

  /* 操作按鈕響應式 */
  .action-buttons {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .btn {
    width: 100%;
    padding: var(--space-md) var(--space-lg);
    font-size: var(--text-base);
    justify-content: center;
  }

  /* 側邊欄響應式 */
  .sidebar {
    margin-top: var(--space-lg);
  }

  .help-card {
    padding: var(--space-md);
  }

  .help-title {
    font-size: var(--text-base);
  }

  .help-content {
    font-size: var(--text-sm);
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 var(--space-xs);
  }

  .page-title {
    font-size: var(--text-xl);
  }

  .page-subtitle {
    font-size: var(--text-xs);
  }

  /* 編輯器工具欄極小螢幕優化 */
  .editor-toolbar-simple {
    padding: var(--space-xs);
    overflow-x: auto;
    white-space: nowrap;
  }

  .markdown-btn {
    width: 24px;
    height: 24px;
    font-size: 10px;
    flex-shrink: 0;
  }

  /* 內容輸入區域極小螢幕優化 */
  .content-textarea {
    min-height: 200px;
    padding: var(--space-sm);
    font-size: var(--text-xs);
  }

  .preview-content {
    padding: var(--space-sm);
    font-size: var(--text-xs);
  }

  /* 表單元素極小螢幕優化 */
  .form-input,
  .form-select {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-sm);
  }

  .form-label {
    font-size: var(--text-xs);
  }

  /* 按鈕極小螢幕優化 */
  .btn {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-sm);
  }

  .mode-btn {
    padding: var(--space-xs);
    font-size: 10px;
  }

  /* 圖片上傳區域優化 */
  .image-upload-area {
    padding: var(--space-sm);
  }

  .upload-icon {
    font-size: 1.5rem;
  }

  .upload-text {
    font-size: var(--text-xs);
  }
}

/* 橫向模式優化 */
@media (max-width: 768px) and (orientation: landscape) {
  .content-textarea {
    min-height: 150px;
  }

  .page-header {
    margin-bottom: var(--space-md);
  }

  .page-title {
    font-size: var(--text-xl);
  }
}

/* 觸控設備優化 */
@media (hover: none) and (pointer: coarse) {
  .markdown-btn,
  .mode-btn,
  .btn {
    min-height: 44px;
    touch-action: manipulation;
  }

  .markdown-btn {
    min-width: 44px;
  }

  .content-textarea {
    touch-action: manipulation;
    -webkit-overflow-scrolling: touch;
  }

  /* 觸控反饋 */
  .markdown-btn:active,
  .mode-btn:active,
  .btn:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }

  /* 增大點擊區域 */
  .form-input,
  .form-select {
    min-height: 44px;
  }

  /* 移除懸停效果 */
  .markdown-btn:hover,
  .mode-btn:hover,
  .btn:hover {
    background: initial;
    border-color: initial;
  }
}

/* 平板模式優化 */
@media (min-width: 481px) and (max-width: 768px) {
  .editor-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .editor-tabs {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: var(--space-md);
  }

  .tab-button {
    flex: 1;
    padding: var(--space-sm) var(--space-md);
    border: none;
    background: transparent;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .tab-button.active {
    background: var(--mountain-primary);
    color: white;
  }

  .content-textarea,
  .preview-content {
    min-height: 300px;
  }
}

/* 大螢幕優化 */
@media (min-width: 1025px) {
  .editor-layout {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: var(--space-xl);
  }

  .main-content {
    min-width: 0;
  }

  .sidebar {
    position: sticky;
    top: var(--space-lg);
    height: fit-content;
  }

  .split-editor {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
    min-height: 500px;
  }

  .content-textarea,
  .preview-content {
    min-height: 500px;
  }
}

/* 超大螢幕優化 */
@media (min-width: 1440px) {
  .container {
    max-width: 1200px;
  }

  .split-editor {
    gap: var(--space-lg);
  }
}

/* 減少動畫效果 */
@media (prefers-reduced-motion: reduce) {
  .markdown-btn,
  .mode-btn,
  .btn {
    transition: none;
  }

  .loading-spinner {
    animation: none;
  }
}

/* 高對比度模式 */
@media (prefers-contrast: high) {
  .simple-editor {
    border: 2px solid black;
  }

  .editor-toolbar-simple {
    background: white;
    border-bottom: 2px solid black;
  }

  .markdown-btn {
    border: 1px solid black;
    color: black;
  }

  .markdown-btn:hover,
  .markdown-btn:focus {
    background: black;
    color: white;
  }

  .content-textarea {
    border: 1px solid black;
    background: white;
    color: black;
  }
}

/* 列印模式 */
@media print {
  .editor-toolbar-simple,
  .action-buttons,
  .sidebar {
    display: none !important;
  }

  .simple-editor {
    border: none;
    box-shadow: none;
  }

  .content-textarea {
    border: none;
    padding: 0;
    font-size: 12pt;
    line-height: 1.5;
    color: black;
    background: white;
  }

  .page-header {
    margin-bottom: 20pt;
  }

  .page-title {
    font-size: 18pt;
    color: black;
  }
}
</style>